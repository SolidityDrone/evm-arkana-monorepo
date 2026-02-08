'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { usePublicClient, useChainId, useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Address } from 'viem';
import { useAccount } from '@/context/AccountProvider';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { computePrivateKeyFromSignature } from '@/lib/circuit-utils';
import { TLSWAP_REGISTER_ADDRESS, TLSWAP_REGISTER_ABI } from '@/lib/abi/TlSwapRegister';
import {
    decryptTimelockOrder,
    fetchDrandSignature,
    parseOrFetchEncryptedData,
    getCurrentRound,
    getRoundTimestamp,
    type DecryptedOrder,
    type EncryptedOrderData,
    isSwapOrder,
    isLiquidityOrder
} from '@/lib/timelock-decrypt';
import { ensureBufferPolyfill } from '@/lib/buffer-polyfill';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TokenIcon } from '@/lib/token-icons';
import { Loader2, Lock, Unlock, Clock, AlertCircle, CheckCircle2, ExternalLink, ChevronDown, ChevronRight, Zap } from 'lucide-react';


interface DecryptedChunk {
    order: DecryptedOrder;
    round: number;
    roundTimestamp: Date;
    chunkIndex: number;
}

interface PendingChunk {
    encryptedData: EncryptedOrderData;
    targetRound: number;
    availableAt: Date;
    chunkIndex: number;
}

interface OrderStatus {
    loading: boolean;
    error?: string;
    ipfsCid?: string;
    decryptedChunks: DecryptedChunk[];
    pendingChunks: PendingChunk[];
    nonceCommitment?: string;
    currentRound: number;
    operationType?: number; // 0 = SWAP, 1 = LIQUIDITY
}

export function DecryptOrder() {
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const { account } = useAccount();
    const { address: walletAddress } = useWagmiAccount();
    const { tokens: aaveTokens, isLoading: isLoadingTokens } = useAaveTokens();

    // Simple inputs
    const [selectedToken, setSelectedToken] = useState<string>('');
    const [nonceInput, setNonceInput] = useState<string>('0');

    // Status
    const [status, setStatus] = useState<OrderStatus>({
        loading: false,
        decryptedChunks: [],
        pendingChunks: [],
        currentRound: getCurrentRound()
    });
    const [userKey, setUserKey] = useState<bigint | null>(null);
    const [expandedChunks, setExpandedChunks] = useState<Set<number>>(new Set([0]));
    const [executingChunk, setExecutingChunk] = useState<number | null>(null);
    const [executeError, setExecuteError] = useState<string | null>(null);
    const [simulationResult, setSimulationResult] = useState<{ chunkIndex: number; success: boolean; error?: string } | null>(null);

    // Transaction execution
    const { writeContract, data: txHash, isPending: isExecuting, error: executeTxError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash
    });

    // Derive user key from signature on mount
    useEffect(() => {
        const deriveUserKey = async () => {
            if (!account?.signature) return;
            try {
                const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                const uk = BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                setUserKey(uk);
            } catch (e) {
                console.error('Failed to derive user key:', e);
            }
        };
        deriveUserKey();
    }, [account?.signature]);

    // Update current round periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(prev => ({ ...prev, currentRound: getCurrentRound() }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Compute nonce commitment
    const computeNonceCommitment = useCallback(async (tokenAddress: string, nonce: bigint): Promise<string> => {
        if (!userKey) throw new Error('User key not available');

        await ensureBufferPolyfill();
        const { poseidon2Hash } = await import('@aztec/foundation/crypto');

        const tokenBigInt = BigInt(tokenAddress);
        const chainIdBigInt = BigInt(chainId);

        // spending_key = poseidon2([user_key, chain_id, token_address])
        const spendingKeyResult = await poseidon2Hash([userKey, chainIdBigInt, tokenBigInt]);
        const spendingKey = typeof spendingKeyResult === 'bigint'
            ? spendingKeyResult
            : spendingKeyResult.toBigInt();

        // nonce_commitment = poseidon2([spending_key, nonce, token_address])
        const commitmentResult = await poseidon2Hash([spendingKey, nonce, tokenBigInt]);
        const commitment = typeof commitmentResult === 'bigint'
            ? commitmentResult
            : commitmentResult.toBigInt();

        return '0x' + commitment.toString(16).padStart(64, '0');
    }, [userKey, chainId]);

    // Fetch encrypted order from contract
    const fetchEncryptedOrder = useCallback(async (commitment: string): Promise<string> => {
        if (!publicClient) throw new Error('No public client');

        const ciphertextBytes = await publicClient.readContract({
            address: TLSWAP_REGISTER_ADDRESS as Address,
            abi: TLSWAP_REGISTER_ABI,
            functionName: 'encryptedOrdersByNonce',
            args: [commitment as `0x${string}`]
        });

        if (!ciphertextBytes || ciphertextBytes === '0x' || (ciphertextBytes as string).length <= 2) {
            throw new Error('No encrypted order found for this commitment');
        }

        // Decode bytes to string (could be IPFS CID or JSON)
        const hexStr = (ciphertextBytes as string).slice(2);
        const bytes = new Uint8Array(hexStr.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        return new TextDecoder().decode(bytes);
    }, [publicClient]);

    // Recursively decrypt all available chunks in the chain
    const decryptChain = useCallback(async (dataOrCid: string, chunkIndex: number = 0): Promise<{
        decrypted: DecryptedChunk[];
        pending: PendingChunk[];
    }> => {
        const decrypted: DecryptedChunk[] = [];
        const pending: PendingChunk[] = [];

        let currentData: string | null = dataOrCid;
        let currentIndex = chunkIndex;

        while (currentData) {
            try {
                const encryptedData = await parseOrFetchEncryptedData(currentData);
                const targetRound = encryptedData.timelock.targetRound;
                const currentRound = getCurrentRound();
                const availableAt = new Date(getRoundTimestamp(targetRound) * 1000);

                if (currentRound < targetRound) {
                    // Round not yet available
                    pending.push({
                        encryptedData,
                        targetRound,
                        availableAt,
                        chunkIndex: currentIndex
                    });
                    break; // Can't continue chain until this is decrypted
                }

                // Decrypt this chunk
                const signature = await fetchDrandSignature(targetRound);
                const order = await decryptTimelockOrder(encryptedData, signature);

                decrypted.push({
                    order,
                    round: targetRound,
                    roundTimestamp: availableAt,
                    chunkIndex: currentIndex
                });

                // Check for nested ciphertext
                if (order.nextCiphertext) {
                    currentData = order.nextCiphertext;
                    currentIndex++;
                } else {
                    currentData = null;
                }
            } catch (e) {
                console.error(`Error decrypting chunk ${currentIndex}:`, e);
                break;
            }
        }

        return { decrypted, pending };
    }, []);

    // Main decrypt flow
    const handleDecrypt = useCallback(async () => {
        if (!selectedToken || !userKey) {
            setStatus(prev => ({ ...prev, loading: false, error: 'Please select a token and ensure you are signed in' }));
            return;
        }

        setStatus({
            loading: true,
            decryptedChunks: [],
            pendingChunks: [],
            currentRound: getCurrentRound()
        });

        try {
            const nonce = BigInt(nonceInput || '0');

            // Compute nonce commitment
            const commitment = await computeNonceCommitment(selectedToken, nonce);

            // Fetch operation type from contract
            let operationType: number | undefined;
            if (publicClient) {
                try {
                    operationType = await publicClient.readContract({
                        address: TLSWAP_REGISTER_ADDRESS as Address,
                        abi: TLSWAP_REGISTER_ABI,
                        functionName: 'orderOperationType',
                        args: [commitment as `0x${string}`],
                    }) as number;
                } catch (e) {
                    console.warn('Could not fetch operation type, defaulting to SWAP:', e);
                    operationType = 0; // Default to SWAP
                }
            } else {
                operationType = 0; // Default to SWAP if no public client
            }

            setStatus(prev => ({ ...prev, nonceCommitment: commitment, operationType }));

            // Fetch data from contract
            const ipfsCid = await fetchEncryptedOrder(commitment);
            setStatus(prev => ({ ...prev, ipfsCid }));

            // Decrypt entire chain
            const { decrypted, pending } = await decryptChain(ipfsCid);

            setStatus(prev => ({
                ...prev,
                loading: false,
                decryptedChunks: decrypted,
                pendingChunks: pending,
                error: decrypted.length === 0 && pending.length > 0
                    ? `First order not yet decryptable. Available at ${pending[0].availableAt.toLocaleString()}`
                    : undefined
            }));

        } catch (e) {
            setStatus(prev => ({
                ...prev,
                loading: false,
                error: (e as Error).message
            }));
        }
    }, [selectedToken, nonceInput, userKey, computeNonceCommitment, fetchEncryptedOrder, decryptChain]);

    // Simulate swap intent execution (demo - doesn't send tx)
    const handleSimulateSwap = useCallback(async (chunk: DecryptedChunk) => {
        if (!status.nonceCommitment || !selectedToken || !walletAddress || !publicClient) {
            setExecuteError('Missing required data for simulation');
            return;
        }

        setExecutingChunk(chunk.chunkIndex);
        setExecuteError(null);
        setSimulationResult(null);

        try {
            const order = chunk.order;

            // Check if this is a swap order (only swaps can be simulated with executeV4SwapIntent)
            if (!isSwapOrder(order)) {
                setSimulationResult({
                    chunkIndex: chunk.chunkIndex,
                    success: false,
                    error: 'Liquidity operations use executeLiquidityProvision (not swap simulation)'
                });
                setExecutingChunk(null);
                return;
            }

            // executeV4SwapIntent builds swap calldata internally from poolKey

            // First check if order hashes are registered and get operation type + router
            const [storedHashes, tokenIn, operationType, uniswapRouter] = await Promise.all([
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'getOrderChunkHashes',
                    args: [status.nonceCommitment as `0x${string}`],
                }) as Promise<`0x${string}`[]>,
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'orderTokenIn',
                    args: [status.nonceCommitment as `0x${string}`],
                }) as Promise<Address>,
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'orderOperationType',
                    args: [status.nonceCommitment as `0x${string}`],
                }) as Promise<number>,
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'uniswapRouter',
                    args: [],
                }) as Promise<Address>,
            ]);

            const opTypeString = operationType === 0 ? 'SWAP' : 'LIQUIDITY';
            console.log('📋 Stored order hashes on-chain:', storedHashes);
            console.log('📋 Stored tokenIn on-chain:', tokenIn);
            console.log('📋 Operation type:', opTypeString);
            console.log('📋 Uniswap Router:', uniswapRouter);

            if (!storedHashes || storedHashes.length === 0) {
                setSimulationResult({
                    chunkIndex: chunk.chunkIndex,
                    success: false,
                    error: 'No order hashes registered. Did you withdraw with orderHashes?'
                });
                setExecutingChunk(null);
                return;
            }

            // Check if uniswap router is configured
            if (!uniswapRouter || uniswapRouter === '0x0000000000000000000000000000000000000000') {
                setSimulationResult({
                    chunkIndex: chunk.chunkIndex,
                    success: false,
                    error: 'Uniswap router not configured in TLswapRegister contract'
                });
                setExecutingChunk(null);
                return;
            }

            // Use tokenIn from contract, fallback to selectedToken if not set
            const actualTokenIn = tokenIn && tokenIn !== '0x0000000000000000000000000000000000000000'
                ? tokenIn
                : selectedToken as Address;

            // Build PoolKey: currency0 must be < currency1 (sorted by address)
            const tokenInLower = actualTokenIn.toLowerCase();
            const tokenOutLower = (order.tokenOut as string).toLowerCase();
            const currency0 = tokenInLower < tokenOutLower ? actualTokenIn : order.tokenOut as Address;
            const currency1 = tokenInLower < tokenOutLower ? order.tokenOut as Address : actualTokenIn;

            const poolKey = {
                currency0: currency0 as Address,
                currency1: currency1 as Address,
                fee: 3000, // 0.3% fee tier
                tickSpacing: 60, // Common tick spacing for 0.3% pools
                hooks: '0x0000000000000000000000000000000000000000' as Address, // No hooks
            };

            const simArgs = {
                orderId: status.nonceCommitment,
                chunkIndex: chunk.chunkIndex,
                storedHash: storedHashes[chunk.chunkIndex] || 'N/A',
                intentor: walletAddress,
                tokenAddress: selectedToken,
                sharesAmount: order.sharesAmount,
                tokenIn: actualTokenIn,
                tokenOut: order.tokenOut,
                poolKey,
                amountOutMin: order.amountOutMin,
                slippageBps: order.slippageBps,
                deadline: order.deadline,
                executionFeeBps: order.executionFeeBps,
                recipient: order.recipient,
                drandRound: chunk.round,
                prevHash: order.prevHash,
                nextHash: order.nextHash,
                uniswapRouter: uniswapRouter,
            };

            console.log('🔍 Simulating V4 swap intent with args:', simArgs);

            // Log Foundry test format for debugging
            console.log(`
📋 FOUNDRY TEST PARAMETERS:
-----------------------------
// Copy these to Debugger.t.sol:
bytes32 orderId = ${status.nonceCommitment};
uint256 chunkIndex = ${chunk.chunkIndex};
address intentor = ${walletAddress};
address tokenAddress = ${selectedToken};
uint256 sharesAmount = ${order.sharesAmount};
address tokenIn = ${actualTokenIn};
address tokenOut = ${order.tokenOut};
uint256 amountOutMin = ${order.amountOutMin};
uint16 slippageBps = ${order.slippageBps};
uint256 deadline = ${order.deadline};
uint256 executionFeeBps = ${order.executionFeeBps};
address recipient = ${order.recipient};
uint256 drandRound = ${chunk.round};
uint256 prevHash = ${order.prevHash};
uint256 nextHash = ${order.nextHash};
// PoolKey:
address currency0 = ${currency0};
address currency1 = ${currency1};
uint24 fee = 3000;
int24 tickSpacing = 60;
address hooks = 0x0000000000000000000000000000000000000000;
-----------------------------
`);

            await publicClient.simulateContract({
                address: TLSWAP_REGISTER_ADDRESS as Address,
                abi: TLSWAP_REGISTER_ABI,
                functionName: 'executeV4SwapIntent',
                account: walletAddress,
                args: [
                    status.nonceCommitment as `0x${string}`,
                    BigInt(chunk.chunkIndex),
                    walletAddress,
                    selectedToken as Address,
                    BigInt(order.sharesAmount),
                    poolKey, // PoolKey tuple
                    BigInt(order.amountOutMin),
                    order.slippageBps,
                    BigInt(order.deadline),
                    BigInt(order.executionFeeBps),
                    order.recipient as Address,
                    BigInt(chunk.round),
                    BigInt(order.prevHash),
                    BigInt(order.nextHash),
                ],
            });

            setSimulationResult({ chunkIndex: chunk.chunkIndex, success: true });
        } catch (e: any) {
            // Extract the most useful error message - check for custom errors
            let errorMsg = 'Simulation failed';
            const errorName = e?.cause?.data?.errorName || e?.data?.errorName;

            // Map custom error names to user-friendly messages
            const errorMap: Record<string, string> = {
                'OrderChunkNotFound': 'Order chunk hashes not registered on-chain',
                'InvalidOrderHash': 'Order params do not match registered hash (tamper check)',
                'IntentExpired': 'Order deadline has passed',
                'InvalidAmounts': 'Invalid amounts (amountOutMin=0 or tokenIn==tokenOut)',
                'InvalidSlippage': 'Slippage > 10% (1000 bps)',
                'InvalidRound': 'dRand round not yet available',
                'HashChainNodeAlreadyUsed': 'This hash chain node already executed',
            };

            if (errorName && errorMap[errorName]) {
                errorMsg = errorMap[errorName];
            } else if (e?.cause?.reason) {
                errorMsg = e.cause.reason;
            } else if (errorName) {
                errorMsg = errorName;
            } else if (e?.shortMessage) {
                errorMsg = e.shortMessage;
            }

            console.error('Simulation error:', { errorName, cause: e?.cause, data: e?.cause?.data });
            setSimulationResult({ chunkIndex: chunk.chunkIndex, success: false, error: errorMsg });
        } finally {
            setExecutingChunk(null);
        }
    }, [status.nonceCommitment, selectedToken, walletAddress, publicClient]);

    // Execute swap intent (sends actual transaction)
    const handleExecuteSwap = useCallback(async (chunk: DecryptedChunk) => {
        if (!status.nonceCommitment || !selectedToken || !walletAddress || !publicClient) {
            setExecuteError('Missing required data for execution');
            return;
        }

        setExecutingChunk(chunk.chunkIndex);
        setExecuteError(null);

        try {
            const order = chunk.order;

            // Check if this is a swap order (only swaps can be executed with executeV4SwapIntent)
            if (!isSwapOrder(order)) {
                setExecuteError('Liquidity operations use executeLiquidityProvision (not swap execution)');
                setExecutingChunk(null);
                return;
            }

            // Fetch stored hashes and tokenIn from contract
            const [storedHashes, tokenIn, uniswapRouter] = await Promise.all([
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'getOrderChunkHashes',
                    args: [status.nonceCommitment as `0x${string}`]
                }) as Promise<readonly `0x${string}`[]>,
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'orderTokenIn',
                    args: [status.nonceCommitment as `0x${string}`]
                }) as Promise<Address>,
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'uniswapRouter',
                    args: []
                }) as Promise<Address>
            ]);

            if (!uniswapRouter || uniswapRouter === '0x0000000000000000000000000000000000000000') {
                setExecuteError('Uniswap router not configured in TLswapRegister contract');
                setExecutingChunk(null);
                return;
            }

            // Use tokenIn from contract, fallback to selectedToken if not set
            const actualTokenIn = tokenIn && tokenIn !== '0x0000000000000000000000000000000000000000'
                ? tokenIn
                : selectedToken as Address;

            // Build PoolKey: currency0 must be < currency1 (sorted by address)
            const tokenInLower = actualTokenIn.toLowerCase();
            const tokenOutLower = (order.tokenOut as string).toLowerCase();
            const currency0 = tokenInLower < tokenOutLower ? actualTokenIn : order.tokenOut as Address;
            const currency1 = tokenInLower < tokenOutLower ? order.tokenOut as Address : actualTokenIn;

            const poolKey = {
                currency0: currency0 as Address,
                currency1: currency1 as Address,
                fee: 3000, // 0.3% fee tier
                tickSpacing: 60, // Common tick spacing for 0.3% pools
                hooks: '0x0000000000000000000000000000000000000000' as Address, // No hooks
            };

            console.log('🚀 Executing V4 swap intent:', {
                orderId: status.nonceCommitment,
                chunkIndex: chunk.chunkIndex,
                poolKey,
                sharesAmount: order.sharesAmount,
                amountOutMin: order.amountOutMin,
            });
            console.log('📋 FOUNDRY TEST PARAMETERS:');
            console.log('-----------------------------');
            console.log(`bytes32 orderId = ${status.nonceCommitment};`);
            console.log(`uint256 chunkIndex = ${chunk.chunkIndex};`);
            console.log(`address intentor = ${walletAddress};`);
            console.log(`address tokenAddress = ${selectedToken};`);
            console.log(`uint256 sharesAmount = ${order.sharesAmount};`);
            console.log(`address tokenIn = ${actualTokenIn};`);
            console.log(`address tokenOut = ${order.tokenOut};`);
            console.log(`uint256 amountOutMin = ${order.amountOutMin};`);
            console.log(`uint16 slippageBps = ${order.slippageBps};`);
            console.log(`uint256 deadline = ${order.deadline};`);
            console.log(`uint256 executionFeeBps = ${order.executionFeeBps};`);
            console.log(`address recipient = ${order.recipient};`);
            console.log(`uint256 drandRound = ${chunk.round};`);
            console.log(`uint256 prevHash = ${order.prevHash};`);
            console.log(`uint256 nextHash = ${order.nextHash};`);
            console.log(`// PoolKey:`);
            console.log(`address currency0 = ${currency0};`);
            console.log(`address currency1 = ${currency1};`);
            console.log(`uint24 fee = 3000;`);
            console.log(`int24 tickSpacing = 60;`);
            console.log(`address hooks = 0x0000000000000000000000000000000000000000;`);
            console.log('-----------------------------');

            // Send transaction
            writeContract({
                address: TLSWAP_REGISTER_ADDRESS as Address,
                abi: TLSWAP_REGISTER_ABI,
                functionName: 'executeV4SwapIntent',
                args: [
                    status.nonceCommitment as `0x${string}`,
                    BigInt(chunk.chunkIndex),
                    walletAddress,
                    selectedToken as Address,
                    BigInt(order.sharesAmount),
                    poolKey, // PoolKey tuple
                    BigInt(order.amountOutMin),
                    order.slippageBps,
                    BigInt(order.deadline),
                    BigInt(order.executionFeeBps),
                    order.recipient as Address,
                    BigInt(chunk.round),
                    BigInt(order.prevHash),
                    BigInt(order.nextHash),
                ],
            });
        } catch (e: any) {
            let errorMsg = 'Execution failed';
            const errorName = e?.cause?.data?.errorName || e?.data?.errorName;

            const errorMap: Record<string, string> = {
                'OrderChunkNotFound': 'Order chunk hashes not registered on-chain',
                'InvalidOrderHash': 'Order params do not match registered hash (tamper check)',
                'IntentExpired': 'Order deadline has passed',
                'InvalidAmounts': 'Invalid amounts (amountOutMin=0 or tokenIn==tokenOut)',
                'InvalidSlippage': 'Slippage > 10% (1000 bps)',
                'InvalidRound': 'dRand round not yet available',
                'HashChainNodeAlreadyUsed': 'This hash chain node already executed',
            };

            if (errorName && errorMap[errorName]) {
                errorMsg = errorMap[errorName];
            } else if (e?.cause?.reason) {
                errorMsg = e.cause.reason;
            } else if (errorName) {
                errorMsg = errorName;
            } else if (e?.shortMessage) {
                errorMsg = e.shortMessage;
            }

            console.error('Execution error:', e);
            setExecuteError(errorMsg);
        } finally {
            setExecutingChunk(null);
        }
    }, [status.nonceCommitment, selectedToken, walletAddress, publicClient, writeContract]);

    // Simulate liquidity provision execution
    const handleSimulateLiquidity = useCallback(async (chunk: DecryptedChunk) => {
        if (!status.nonceCommitment || !selectedToken || !walletAddress || !publicClient) {
            setExecuteError('Missing required data for simulation');
            return;
        }

        setExecutingChunk(chunk.chunkIndex);
        setExecuteError(null);
        setSimulationResult(null);

        try {
            const order = chunk.order;

            if (!isLiquidityOrder(order)) {
                setSimulationResult({
                    chunkIndex: chunk.chunkIndex,
                    success: false,
                    error: 'Order is not a liquidity order'
                });
                setExecutingChunk(null);
                return;
            }

            // Fetch stored hashes and tokenIn from contract
            const [storedHashes, tokenIn] = await Promise.all([
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'getOrderChunkHashes',
                    args: [status.nonceCommitment as `0x${string}`],
                }) as Promise<`0x${string}`[]>,
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'orderTokenIn',
                    args: [status.nonceCommitment as `0x${string}`],
                }) as Promise<Address>,
            ]);

            if (!storedHashes || storedHashes.length === 0) {
                setSimulationResult({
                    chunkIndex: chunk.chunkIndex,
                    success: false,
                    error: 'No order hashes registered. Did you withdraw with orderHashes?'
                });
                setExecutingChunk(null);
                return;
            }

            // Validate required fields
            console.log('🔍 Validating order for simulation:', {
                sharesAmount: order.sharesAmount,
                poolKey: order.poolKey,
                tickLower: order.tickLower,
                tickUpper: order.tickUpper,
                amount0Max: order.amount0Max,
                amount1Max: order.amount1Max,
                swapDirective: order.swapDirective,
                deadline: order.deadline,
                recipient: order.recipient,
                fullOrder: order,
            });
            
            if (!order.sharesAmount) {
                setSimulationResult({
                    chunkIndex: chunk.chunkIndex,
                    success: false,
                    error: 'Order missing sharesAmount. Please create a new order.'
                });
                setExecutingChunk(null);
                return;
            }

            // Use tokenIn from contract, fallback to selectedToken if not set
            const actualTokenIn = tokenIn && tokenIn !== '0x0000000000000000000000000000000000000000'
                ? tokenIn
                : selectedToken as Address;

            const poolKey = {
                currency0: order.poolKey?.currency0 as Address,
                currency1: order.poolKey?.currency1 as Address,
                fee: order.poolKey?.fee || 0,
                tickSpacing: order.poolKey?.tickSpacing || 0,
                hooks: (order.poolKey?.hooks || '0x0000000000000000000000000000000000000000') as Address,
            };

            // Build swap directive (defaults to zero if not provided)
            const swapDirective = {
                amountOut: BigInt(order.swapDirective?.amountOut || '0'),
                amountInMax: BigInt(order.swapDirective?.amountInMax || '0'),
                slippageBps: order.swapDirective?.slippageBps || 0,
                tokenOut: (order.swapDirective?.tokenOut || '0x0000000000000000000000000000000000000000') as Address,
                poolFee: order.swapDirective?.poolFee || 0,
            };

            const simArgs = {
                orderId: status.nonceCommitment,
                chunkIndex: chunk.chunkIndex,
                storedHash: storedHashes[chunk.chunkIndex] || 'N/A',
                intentor: walletAddress,
                tokenAddress: selectedToken,
                sharesAmount: order.sharesAmount,
                tokenIn: actualTokenIn,
                poolKey,
                tickLower: order.tickLower,
                tickUpper: order.tickUpper,
                amount0Max: order.amount0Max,
                amount1Max: order.amount1Max,
                swapDirective,
                deadline: order.deadline,
                executionFeeBps: order.executionFeeBps,
                recipient: order.recipient,
                drandRound: chunk.round,
                prevHash: order.prevHash,
                nextHash: order.nextHash,
            };

            console.log('🔍 Simulating liquidity provision with args:', simArgs);
            console.log('📋 FOUNDRY TEST PARAMETERS:');
            console.log('-----------------------------');
            console.log(`bytes32 orderId = ${status.nonceCommitment};`);
            console.log(`uint256 chunkIndex = ${chunk.chunkIndex};`);
            console.log(`address tokenAddress = ${selectedToken};`);
            console.log(`uint256 sharesAmount = ${order.sharesAmount};`);
            console.log(`PoolKey memory poolKey = PoolKey({`);
            console.log(`    currency0: ${poolKey.currency0},`);
            console.log(`    currency1: ${poolKey.currency1},`);
            console.log(`    fee: ${poolKey.fee},`);
            console.log(`    tickSpacing: ${poolKey.tickSpacing},`);
            console.log(`    hooks: ${poolKey.hooks}`);
            console.log(`});`);
            console.log(`int24 tickLower = ${order.tickLower};`);
            console.log(`int24 tickUpper = ${order.tickUpper};`);
            console.log(`uint256 amount0Max = ${order.amount0Max};`);
            console.log(`uint256 amount1Max = ${order.amount1Max};`);
            console.log(`SwapDirective memory swapDirective = SwapDirective({`);
            console.log(`    amountOut: ${swapDirective.amountOut},`);
            console.log(`    amountInMax: ${swapDirective.amountInMax},`);
            console.log(`    slippageBps: ${swapDirective.slippageBps},`);
            console.log(`    tokenOut: ${swapDirective.tokenOut},`);
            console.log(`    poolFee: ${swapDirective.poolFee}`);
            console.log(`});`);
            console.log(`uint256 deadline = ${order.deadline};`);
            console.log(`uint256 executionFeeBps = ${order.executionFeeBps};`);
            console.log(`address recipient = ${order.recipient};`);
            console.log(`uint256 drandRound = ${chunk.round};`);
            console.log(`bytes memory hookData = "";`);
            console.log(`uint256 prevHash = ${order.prevHash};`);
            console.log(`uint256 nextHash = ${order.nextHash};`);
            console.log('-----------------------------');

            await publicClient.simulateContract({
                address: TLSWAP_REGISTER_ADDRESS as Address,
                abi: TLSWAP_REGISTER_ABI,
                functionName: 'executeLiquidityProvision',
                account: walletAddress,
                args: [
                    status.nonceCommitment as `0x${string}`,
                    BigInt(chunk.chunkIndex),
                    selectedToken as Address,
                    BigInt(order.sharesAmount || '0'),
                    poolKey,
                    order.tickLower || 0,
                    order.tickUpper || 0,
                    BigInt(order.amount0Max || '0'),
                    BigInt(order.amount1Max || '0'),
                    swapDirective,
                    BigInt(order.deadline || 0),
                    BigInt(order.executionFeeBps || 0),
                    order.recipient as Address,
                    BigInt(chunk.round),
                    '0x' as `0x${string}`, // hookData
                    BigInt(order.prevHash || '0'),
                    BigInt(order.nextHash || '0'),
                ],
            });

            setSimulationResult({ chunkIndex: chunk.chunkIndex, success: true });
        } catch (e: any) {
            let errorMsg = 'Simulation failed';
            const errorName = e?.cause?.data?.errorName || e?.data?.errorName;

            const errorMap: Record<string, string> = {
                'OrderChunkNotFound': 'Order chunk hashes not registered on-chain',
                'InvalidOrderHash': 'Order params do not match registered hash (tamper check)',
                'IntentExpired': 'Order deadline has passed',
                'InvalidAmounts': 'Invalid amounts',
                'InvalidSlippage': 'Slippage > 10% (1000 bps)',
                'InvalidRound': 'dRand round not yet available',
                'HashChainNodeAlreadyUsed': 'This hash chain node already executed',
            };

            if (errorName && errorMap[errorName]) {
                errorMsg = errorMap[errorName];
            } else if (e?.cause?.reason) {
                errorMsg = e.cause.reason;
            } else if (errorName) {
                errorMsg = errorName;
            } else if (e?.shortMessage) {
                errorMsg = e.shortMessage;
            }

            console.error('Simulation error:', { errorName, cause: e?.cause, data: e?.cause?.data });
            setSimulationResult({ chunkIndex: chunk.chunkIndex, success: false, error: errorMsg });
        } finally {
            setExecutingChunk(null);
        }
    }, [status.nonceCommitment, selectedToken, walletAddress, publicClient]);

    // Execute liquidity provision (sends actual transaction)
    const handleExecuteLiquidity = useCallback(async (chunk: DecryptedChunk) => {
        if (!status.nonceCommitment || !selectedToken || !walletAddress || !publicClient) {
            setExecuteError('Missing required data for execution');
            return;
        }

        setExecutingChunk(chunk.chunkIndex);
        setExecuteError(null);

        try {
            const order = chunk.order;

            if (!isLiquidityOrder(order)) {
                setExecuteError('Order is not a liquidity order');
                setExecutingChunk(null);
                return;
            }

            // Fetch stored hashes and tokenIn from contract
            const [storedHashes, tokenIn] = await Promise.all([
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'getOrderChunkHashes',
                    args: [status.nonceCommitment as `0x${string}`]
                }) as Promise<readonly `0x${string}`[]>,
                publicClient.readContract({
                    address: TLSWAP_REGISTER_ADDRESS as Address,
                    abi: TLSWAP_REGISTER_ABI,
                    functionName: 'orderTokenIn',
                    args: [status.nonceCommitment as `0x${string}`]
                }) as Promise<Address>
            ]);

            // Validate required fields
            if (!order.sharesAmount) {
                setExecuteError('Order missing sharesAmount. Please create a new order.');
                setExecutingChunk(null);
                return;
            }

            // Use tokenIn from contract, fallback to selectedToken if not set
            const actualTokenIn = tokenIn && tokenIn !== '0x0000000000000000000000000000000000000000'
                ? tokenIn
                : selectedToken as Address;

            const poolKey = {
                currency0: (order.poolKey?.currency0 || '0x0000000000000000000000000000000000000000') as Address,
                currency1: (order.poolKey?.currency1 || '0x0000000000000000000000000000000000000000') as Address,
                fee: order.poolKey?.fee || 0,
                tickSpacing: order.poolKey?.tickSpacing || 0,
                hooks: (order.poolKey?.hooks || '0x0000000000000000000000000000000000000000') as Address,
            };

            // Build swap directive (defaults to zero if not provided)
            const swapDirective = {
                amountOut: BigInt(order.swapDirective?.amountOut || '0'),
                amountInMax: BigInt(order.swapDirective?.amountInMax || '0'),
                slippageBps: order.swapDirective?.slippageBps || 0,
                tokenOut: (order.swapDirective?.tokenOut || '0x0000000000000000000000000000000000000000') as Address,
                poolFee: order.swapDirective?.poolFee || 0,
            };

            console.log('🚀 Executing liquidity provision:', {
                orderId: status.nonceCommitment,
                chunkIndex: chunk.chunkIndex,
                poolKey,
                sharesAmount: order.sharesAmount,
                tickLower: order.tickLower,
                tickUpper: order.tickUpper,
                amount0Max: order.amount0Max,
                amount1Max: order.amount1Max,
                swapDirective,
            });
            console.log('📋 FOUNDRY TEST PARAMETERS:');
            console.log('-----------------------------');
            console.log(`bytes32 orderId = ${status.nonceCommitment};`);
            console.log(`uint256 chunkIndex = ${chunk.chunkIndex};`);
            console.log(`address tokenAddress = ${selectedToken};`);
            console.log(`uint256 sharesAmount = ${order.sharesAmount};`);
            console.log(`PoolKey memory poolKey = PoolKey({`);
            console.log(`    currency0: ${poolKey.currency0},`);
            console.log(`    currency1: ${poolKey.currency1},`);
            console.log(`    fee: ${poolKey.fee},`);
            console.log(`    tickSpacing: ${poolKey.tickSpacing},`);
            console.log(`    hooks: ${poolKey.hooks}`);
            console.log(`});`);
            console.log(`int24 tickLower = ${order.tickLower};`);
            console.log(`int24 tickUpper = ${order.tickUpper};`);
            console.log(`uint256 amount0Max = ${order.amount0Max};`);
            console.log(`uint256 amount1Max = ${order.amount1Max};`);
            console.log(`SwapDirective memory swapDirective = SwapDirective({`);
            console.log(`    amountOut: ${swapDirective.amountOut},`);
            console.log(`    amountInMax: ${swapDirective.amountInMax},`);
            console.log(`    slippageBps: ${swapDirective.slippageBps},`);
            console.log(`    tokenOut: ${swapDirective.tokenOut},`);
            console.log(`    poolFee: ${swapDirective.poolFee}`);
            console.log(`});`);
            console.log(`uint256 deadline = ${order.deadline};`);
            console.log(`uint256 executionFeeBps = ${order.executionFeeBps};`);
            console.log(`address recipient = ${order.recipient};`);
            console.log(`uint256 drandRound = ${chunk.round};`);
            console.log(`bytes memory hookData = "";`);
            console.log(`uint256 prevHash = ${order.prevHash};`);
            console.log(`uint256 nextHash = ${order.nextHash};`);
            console.log('-----------------------------');

            // Validate all parameters before sending
            console.log('🔍 Pre-transaction validation:', {
                'status.nonceCommitment': status.nonceCommitment,
                'chunk.chunkIndex': chunk.chunkIndex,
                'selectedToken': selectedToken,
                'order.sharesAmount': order.sharesAmount,
                'order.tickLower': order.tickLower,
                'order.tickUpper': order.tickUpper,
                'order.amount0Max': order.amount0Max,
                'order.amount1Max': order.amount1Max,
                'order.deadline': order.deadline,
                'order.executionFeeBps': order.executionFeeBps,
                'order.recipient': order.recipient,
                'chunk.round': chunk.round,
                'order.prevHash': order.prevHash,
                'order.nextHash': order.nextHash,
            });

            // Send transaction
            writeContract({
                address: TLSWAP_REGISTER_ADDRESS as Address,
                abi: TLSWAP_REGISTER_ABI,
                functionName: 'executeLiquidityProvision',
                args: [
                    status.nonceCommitment as `0x${string}`,
                    BigInt(chunk.chunkIndex),
                    selectedToken as Address,
                    BigInt(order.sharesAmount || '0'),
                    poolKey,
                    order.tickLower || 0,
                    order.tickUpper || 0,
                    BigInt(order.amount0Max || '0'),
                    BigInt(order.amount1Max || '0'),
                    swapDirective,
                    BigInt(order.deadline || 0),
                    BigInt(order.executionFeeBps || 0),
                    order.recipient as Address,
                    BigInt(chunk.round),
                    '0x' as `0x${string}`, // hookData
                    BigInt(order.prevHash || '0'),
                    BigInt(order.nextHash || '0'),
                ],
            });
        } catch (e: any) {
            let errorMsg = 'Execution failed';
            const errorName = e?.cause?.data?.errorName || e?.data?.errorName;

            const errorMap: Record<string, string> = {
                'OrderChunkNotFound': 'Order chunk hashes not registered on-chain',
                'InvalidOrderHash': 'Order params do not match registered hash (tamper check)',
                'IntentExpired': 'Order deadline has passed',
                'InvalidAmounts': 'Invalid amounts',
                'InvalidSlippage': 'Slippage > 10% (1000 bps)',
                'InvalidRound': 'dRand round not yet available',
                'HashChainNodeAlreadyUsed': 'This hash chain node already executed',
            };

            if (errorName && errorMap[errorName]) {
                errorMsg = errorMap[errorName];
            } else if (e?.cause?.reason) {
                errorMsg = e.cause.reason;
            } else if (errorName) {
                errorMsg = errorName;
            } else if (e?.shortMessage) {
                errorMsg = e.shortMessage;
            }

            console.error('Execution error:', e);
            setExecuteError(errorMsg);
        } finally {
            setExecutingChunk(null);
        }
    }, [status.nonceCommitment, selectedToken, walletAddress, publicClient, writeContract]);

    // Format timestamp
    const formatTime = (date: Date) => date.toLocaleString();

    // Get selected token info
    const selectedTokenInfo = aaveTokens?.find(t => t.address?.toLowerCase() === selectedToken.toLowerCase());

    // Check if user is signed in
    const isSignedIn = !!account?.signature && !!userKey;

    const toggleChunk = (index: number) => {
        setExpandedChunks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-card border-border">
            <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Lock className="w-5 h-5" />
                    Decrypt Timelock Order
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Decrypt encrypted swap orders using your signed-in account
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* Sign-in status */}
                {!isSignedIn && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        <span className="text-destructive/90">Please sign in (Sign Sigil) to decrypt orders</span>
                    </div>
                )}

                {isSignedIn && (
                    <>
                        {/* Token Dropdown */}
                        <div className="space-y-2">
                            <label className="text-foreground text-sm font-medium">Token</label>
                            <select
                                value={selectedToken}
                                onChange={(e) => setSelectedToken(e.target.value)}
                                className="w-full h-10 px-3 bg-card border border-border text-foreground rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="">{isLoadingTokens ? "Loading tokens..." : "Select a token"}</option>
                                {aaveTokens?.map((token) => (
                                    <option
                                        key={token.address}
                                        value={token.address}
                                    >
                                        {token.symbol} - {token.address.slice(0, 6)}...{token.address.slice(-4)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nonce Input */}
                        <div className="space-y-2">
                            <label className="text-foreground text-sm font-medium">Nonce</label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={nonceInput}
                                onChange={(e) => setNonceInput(e.target.value)}
                                className="bg-card border-border text-foreground font-mono"
                            />
                            <p className="text-xs text-muted-foreground">Enter the nonce for the order you want to decrypt</p>
                        </div>

                        {/* Current Round Info */}
                        <div className="p-2 bg-secondary/30 rounded-sm text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Current drand round: <span className="font-mono text-foreground">{status.currentRound}</span>
                        </div>

                        {/* Decrypt Button */}
                        <Button
                            onClick={handleDecrypt}
                            disabled={status.loading || !selectedToken}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            {status.loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Decrypting Chain...
                                </>
                            ) : (
                                <>
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Decrypt Order Chain
                                </>
                            )}
                        </Button>
                    </>
                )}

                {/* Computed Commitment */}
                {status.nonceCommitment && (
                    <div className="p-3 bg-secondary/30 rounded-sm">
                        <span className="text-muted-foreground text-xs">Nonce Commitment</span>
                        <code className="text-xs text-primary break-all block mt-1">{status.nonceCommitment}</code>
                    </div>
                )}

                {/* Error Display */}
                {status.error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-destructive font-medium">Decrypt Error</p>
                            <p className="text-destructive/80 text-sm">{status.error}</p>
                        </div>
                    </div>
                )}

                {/* Execute Error Display */}
                {executeError && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-sm flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-destructive font-medium">Error</p>
                            <p className="text-destructive/80 text-sm break-all">{executeError}</p>
                        </div>
                    </div>
                )}

                {/* Decrypted Chunks */}
                {status.decryptedChunks.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-accent" />
                            <span className="text-accent font-medium">
                                {status.decryptedChunks.length} Order{status.decryptedChunks.length > 1 ? 's' : ''} Decrypted
                            </span>
                        </div>

                        {status.decryptedChunks.map((chunk) => (
                            <div key={chunk.chunkIndex} className="border border-border/50 rounded-sm overflow-hidden">
                                <div className="p-3 bg-secondary/30 flex items-center justify-between">
                                    <button
                                        onClick={() => toggleChunk(chunk.chunkIndex)}
                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        {expandedChunks.has(chunk.chunkIndex) ? (
                                            <ChevronDown className="w-4 h-4 text-primary" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-primary" />
                                        )}
                                        <Unlock className="w-4 h-4 text-accent" />
                                        <span className="text-foreground font-medium">Order #{chunk.chunkIndex + 1}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                            Round {chunk.round}
                                        </span>
                                    </button>

                                    <div className="flex gap-2">
                                        {/* Simulate Button */}
                                        <Button
                                            onClick={() => isSwapOrder(chunk.order) ? handleSimulateSwap(chunk) : handleSimulateLiquidity(chunk)}
                                            disabled={executingChunk !== null || isExecuting || isConfirming}
                                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                            size="sm"
                                        >
                                            {executingChunk === chunk.chunkIndex ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    Simulating...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4 mr-1" />
                                                    Simulate
                                                </>
                                            )}
                                        </Button>

                                        {/* Execute Button */}
                                        <Button
                                            onClick={() => isSwapOrder(chunk.order) ? handleExecuteSwap(chunk) : handleExecuteLiquidity(chunk)}
                                            disabled={executingChunk !== null || isExecuting || isConfirming}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                            size="sm"
                                        >
                                            {isExecuting && executingChunk === chunk.chunkIndex ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    Executing...
                                                </>
                                            ) : isConfirming && txHash ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    Confirming...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4 mr-1" />
                                                    {isSwapOrder(chunk.order) ? 'Execute Swap' : 'Execute Liquidity'}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Simulation Result */}
                                {simulationResult && simulationResult.chunkIndex === chunk.chunkIndex && (
                                    <div className={`px-3 py-2 text-xs ${simulationResult.success ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                                        {simulationResult.success ? '✓ Simulation passed - integrity valid' : `✗ ${simulationResult.error}`}
                                    </div>
                                )}

                                {/* Transaction Status */}
                                {txHash && (
                                    <div className="px-3 py-2 text-xs bg-primary/10 border border-primary/30 rounded-sm">
                                        {isConfirming ? (
                                            <div className="flex items-center gap-2 text-primary">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>Transaction submitted, waiting for confirmation...</span>
                                            </div>
                                        ) : isConfirmed ? (
                                            <div className="flex items-center gap-2 text-primary">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>Transaction confirmed!</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-primary">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span>Transaction submitted</span>
                                            </div>
                                        )}
                                        <div className="mt-1 flex items-center gap-2">
                                            <code className="text-xs text-primary/70 break-all">{txHash}</code>
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:text-primary/80"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Transaction Error */}
                                {executeTxError && (
                                    <div className="px-3 py-2 text-xs bg-destructive/10 text-destructive border border-destructive/30 rounded-sm">
                                        Transaction error: {executeTxError.message || 'Unknown error'}
                                    </div>
                                )}

                                {expandedChunks.has(chunk.chunkIndex) && (
                                    <div className="p-4 space-y-3 bg-card/50">
                                        <div className="grid gap-2 text-sm">
                                            <OrderField label="Shares Amount" value={chunk.order.sharesAmount} />

                                            {/* Swap-specific fields */}
                                            {isSwapOrder(chunk.order) && (
                                                <>
                                                    <OrderField label="Amount Out Min" value={chunk.order.amountOutMin} />
                                                    <OrderField label="Slippage (BPS)" value={chunk.order.slippageBps.toString()} />
                                                    <OrderField label="Token Out" value={chunk.order.tokenOut} mono />
                                                </>
                                            )}

                                            {/* Liquidity-specific fields */}
                                            {isLiquidityOrder(chunk.order) && (
                                                <>
                                                    <OrderField label="Currency 0" value={chunk.order.poolKey.currency0} mono />
                                                    <OrderField label="Currency 1" value={chunk.order.poolKey.currency1} mono />
                                                    <OrderField label="Pool Fee" value={chunk.order.poolKey.fee.toString()} />
                                                    <OrderField label="Tick Spacing" value={chunk.order.poolKey.tickSpacing.toString()} />
                                                    <OrderField label="Hooks" value={chunk.order.poolKey.hooks} mono />
                                                    <OrderField label="Tick Lower" value={chunk.order.tickLower.toString()} />
                                                    <OrderField label="Tick Upper" value={chunk.order.tickUpper.toString()} />
                                                    <OrderField label="Amount 0 Max" value={chunk.order.amount0Max} />
                                                    <OrderField label="Amount 1 Max" value={chunk.order.amount1Max} />
                                                    
                                                    {/* Swap Directive (EXACT_OUT - to get second token) */}
                                                    {chunk.order.swapDirective && (
                                                        <div className="mt-2 pt-2 border-t border-border/30">
                                                            <span className="text-muted-foreground text-xs font-semibold">Swap Directive (EXACT_OUT Pre-LP)</span>
                                                            <div className="mt-1 space-y-1">
                                                                <OrderField label="Amount Out (exact)" value={chunk.order.swapDirective.amountOut} />
                                                                <OrderField label="Max Input" value={chunk.order.swapDirective.amountInMax} />
                                                                <OrderField label="Slippage (BPS)" value={chunk.order.swapDirective.slippageBps.toString()} />
                                                                <OrderField label="Token Out" value={chunk.order.swapDirective.tokenOut} mono />
                                                                <OrderField label="Pool Fee" value={chunk.order.swapDirective.poolFee.toString()} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Common fields */}
                                            <OrderField label="Deadline" value={new Date(chunk.order.deadline * 1000).toLocaleString()} />
                                            <OrderField label="Recipient" value={chunk.order.recipient} mono />
                                            <OrderField label="Token In" value={selectedToken || 'Loading...'} mono />
                                            <OrderField label="Execution Fee (BPS)" value={chunk.order.executionFeeBps.toString()} />
                                        </div>

                                        <div className="pt-2 border-t border-border/30">
                                            <span className="text-muted-foreground text-xs">Hash Chain Verification</span>
                                            <div className="mt-1 grid gap-1 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Prev Hash:</span>
                                                    <span className="font-mono text-foreground/70 truncate max-w-[200px]" title={chunk.order.prevHash}>
                                                        {chunk.order.prevHash.slice(0, 20)}...
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Next Hash:</span>
                                                    <span className="font-mono text-foreground/70 truncate max-w-[200px]" title={chunk.order.nextHash}>
                                                        {chunk.order.nextHash.slice(0, 20)}...
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                Use &quot;Simulate&quot; to test or &quot;Execute Swap&quot; to send the transaction
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pending Chunks (not yet decryptable) */}
                {status.pendingChunks.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-chart-4" />
                            <span className="text-chart-4 font-medium">
                                {status.pendingChunks.length} Order{status.pendingChunks.length > 1 ? 's' : ''} Pending
                            </span>
                        </div>

                        {status.pendingChunks.map((pending) => (
                            <div key={pending.chunkIndex} className="p-4 bg-chart-4/10 border border-chart-4/30 rounded-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-chart-4" />
                                        <span className="text-foreground font-medium">Order #{pending.chunkIndex + 1}</span>
                                    </div>
                                    <span className="text-xs text-chart-4">Locked</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-muted-foreground">Target Round:</div>
                                    <div className="text-foreground font-mono">{pending.targetRound}</div>
                                    <div className="text-muted-foreground">Current Round:</div>
                                    <div className="text-foreground font-mono">{status.currentRound}</div>
                                    <div className="text-muted-foreground">Decryptable At:</div>
                                    <div className="text-foreground">{formatTime(pending.availableAt)}</div>
                                    <div className="text-muted-foreground">Rounds Until:</div>
                                    <div className="text-chart-4 font-mono">
                                        {pending.targetRound - status.currentRound} (~{Math.ceil((pending.targetRound - status.currentRound) * 3 / 60)} min)
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Data Source Info */}
                {status.ipfsCid && (
                    <div className="p-3 bg-secondary/20 rounded-sm">
                        <span className="text-muted-foreground text-xs">
                            {status.ipfsCid.trim().startsWith('{') ? 'Data Source: Contract (Direct JSON)' : 'Data Source: IPFS'}
                        </span>
                        {!status.ipfsCid.trim().startsWith('{') && (
                            <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs text-primary break-all">
                                    {status.ipfsCid}
                                </code>
                                <a
                                    href={`https://dweb.link/ipfs/${status.ipfsCid}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// Helper component for order fields
function OrderField({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-muted-foreground flex-shrink-0">{label}:</span>
            <span
                className={`text-foreground text-right break-all ${mono ? 'font-mono text-xs' : ''}`}
            >
                {value}
            </span>
        </div>
    );
}

export default DecryptOrder;
