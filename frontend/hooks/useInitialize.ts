'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useSignMessage, useChainId, useReadContract } from 'wagmi';
import { useAccount as useAccountContext, useZkAddress } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { createPublicClient, http, parseAbi, Address } from 'viem';
import { sepolia } from '@/config';
import { Noir } from '@noir-lang/noir_js';
import { useBackendInitialization } from '@/hooks/useBackendInitialization';
import entryCircuit from '@/lib/circuits/entry.json';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { computeZkAddress, ARKANA_MESSAGE } from '@/lib/zk-address';
import { loadAccountDataOnSign } from '@/lib/loadAccountDataOnSign';
import { computePrivateKeyFromSignature } from '@/lib/circuit-utils';
import { CachedUltraHonkBackend } from '@/lib/cached-ultra-honk-backend';

const ERC20_ABI = parseAbi([
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address account) view returns (uint256)',
]);

export function useInitialize() {
    const { address, isConnected } = useWagmiAccount();
    const { signMessageAsync, isPending: isSigning } = useSignMessage();
    const { setZkAddress, account } = useAccountContext();
    const zkAddress = useZkAddress();
    const { setCurrentNonce, setBalanceEntries, setUserKey: setContextUserKey, userKey: contextUserKey } = useAccountState();
    const publicClient = usePublicClient();
    const chainId = useChainId();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { writeContract: writeApproveContract, data: approvalHashData, isPending: isApprovalPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const [approvalTxHash, setApprovalTxHash] = useState<string | null>(null);
    const { isLoading: isApprovalConfirming, isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
        hash: (approvalHashData || approvalTxHash) as `0x${string}` | undefined,
    });

    // State
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [lockDuration, setLockDuration] = useState('');
    const [userKey, setUserKey] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProving, setIsProving] = useState(false);
    const [proof, setProof] = useState<string>('');
    const [proofError, setProofError] = useState<string | null>(null);
    const [provingTime, setProvingTime] = useState<number | null>(null);
    const [currentProvingTime, setCurrentProvingTime] = useState<number>(0);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [publicInputs, setPublicInputs] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [txError, setTxError] = useState<string | null>(null);
    const [allowance, setAllowance] = useState<bigint | null>(null);
    const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    // Backend and Noir references
    const backendRef = useRef<CachedUltraHonkBackend | null>(null);
    const noirRef = useRef<Noir | null>(null);

    // Real-time timer for proving
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProving) {
            const startTime = performance.now();
            interval = setInterval(() => {
                const elapsed = Math.round(performance.now() - startTime);
                setCurrentProvingTime(elapsed);
            }, 100);
        } else {
            setCurrentProvingTime(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isProving]);

    // Initialize backend
    const initializeBackend = useCallback(async () => {
        if (isInitialized && backendRef.current && noirRef.current) {
            return;
        }

        setIsInitializing(true);
        try {
            // Ensure Buffer polyfill is loaded BEFORE initializing backend
            const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
            await ensureBufferPolyfill();

            const backendOptions = { threads: 1 };
            
            // Handle both string and Uint8Array bytecode
            let bytecode: string | Uint8Array;
            if (typeof entryCircuit.bytecode === 'string') {
                // If it's a base64 string, use it directly
                bytecode = entryCircuit.bytecode;
            } else {
                // If it's Uint8Array, convert to base64 string
                if (!globalThis.Buffer) {
                    const { Buffer } = await import('buffer');
                    globalThis.Buffer = Buffer;
                }
                bytecode = globalThis.Buffer.from(entryCircuit.bytecode).toString('base64');
            }

            const backend = new CachedUltraHonkBackend(bytecode, backendOptions);
            const noir = new Noir(entryCircuit);
            backendRef.current = backend;
            noirRef.current = noir;
            setIsInitialized(true);
        } catch (error) {
            console.error('Failed to initialize backend:', error);
            throw error;
        } finally {
            setIsInitializing(false);
        }
    }, [isInitialized]);


    // Handle sign
    const handleSign = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const signatureValue = await signMessageAsync({ message: ARKANA_MESSAGE });
            const zkAddr = await computeZkAddress(signatureValue);
            setZkAddress(zkAddr, signatureValue);

            await loadAccountDataOnSign(zkAddr, {
                setCurrentNonce,
                setBalanceEntries,
                setUserKey: (key: bigint | null) => {
                    setContextUserKey(key);
                    if (key !== null && !userKey) {
                        setUserKey('0x' + key.toString(16));
                    }
                },
            }, account?.signature);

            // Compute private key (user_key) from signature (only if not loaded from IndexedDB)
            if (!contextUserKey && !userKey) {
                const userKeyHex = await computePrivateKeyFromSignature(signatureValue);
                setUserKey(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
            }
        } catch (error) {
            console.error('Error signing message:', error);
            setError(error instanceof Error ? error.message : 'Failed to sign message');
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize user_key from existing signature when component mounts
    useEffect(() => {
        const initializeFromExisting = async () => {
            // If we have zkAddress and signature but no userKey, compute it
            if (zkAddress && account?.signature && !userKey && !contextUserKey) {
                try {
                    const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                    setUserKey(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                } catch (error) {
                    console.error('Error computing user_key from existing signature:', error);
                }
            }
            // If we have contextUserKey but no local userKey, convert it
            else if (contextUserKey && !userKey) {
                setUserKey('0x' + contextUserKey.toString(16));
            }
        };
        initializeFromExisting();
    }, [zkAddress, account?.signature, userKey, contextUserKey]);

    // Load token decimals
    useEffect(() => {
        const loadDecimals = async () => {
            if (!tokenAddress || !publicClient) {
                setTokenDecimals(null);
                return;
            }

            try {
                const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;
                const decimals = await publicClient.readContract({
                    address: tokenAddr,
                    abi: ERC20_ABI,
                    functionName: 'decimals',
                });
                setTokenDecimals(decimals);
            } catch (error) {
                setTokenDecimals(null);
            }
        };

        loadDecimals();
    }, [tokenAddress, publicClient]);

    // Fetch token balance
    useEffect(() => {
        const fetchBalance = async () => {
            if (!tokenAddress || !address || !publicClient) {
                setTokenBalance(null);
                return;
            }

            try {
                setIsLoadingBalance(true);
                const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;
                const balance = await publicClient.readContract({
                    address: tokenAddr,
                    abi: ERC20_ABI,
                    functionName: 'balanceOf',
                    args: [address as Address],
                }) as bigint;
                setTokenBalance(balance);
            } catch (error) {
                setTokenBalance(null);
            } finally {
                setIsLoadingBalance(false);
            }
        };

        fetchBalance();
    }, [tokenAddress, address, publicClient]);

    // Check allowance
    const checkAllowance = useCallback(async () => {
        if (!tokenAddress || !amount || !address || !publicClient) {
            setAllowance(null);
            return;
        }

        try {
            setIsCheckingAllowance(true);
            const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;

            let amountIn: bigint;
            if (!amount || amount === '') {
                amountIn = BigInt(0);
            } else {
                const sanitizedAmount = amount.trim();
                if (!/^\d+\.?\d*$/.test(sanitizedAmount)) {
                    setAllowance(BigInt(0));
                    return;
                }

                const parts = sanitizedAmount.split('.');
                const finalDecimals = tokenDecimals ?? 18;
                if (parts.length === 1) {
                    amountIn = BigInt(sanitizedAmount) * BigInt(10 ** finalDecimals);
                } else {
                    const integerPart = parts[0] || '0';
                    const decimalPart = parts[1] || '';
                    const limitedDecimal = decimalPart.slice(0, finalDecimals);
                    const paddedDecimal = limitedDecimal.padEnd(finalDecimals, '0');
                    amountIn = BigInt(integerPart) * BigInt(10 ** finalDecimals) + BigInt(paddedDecimal);
                }
            }

            if (amountIn === BigInt(0)) {
                setAllowance(BigInt(0));
                return;
            }

            const currentAllowance = await publicClient.readContract({
                address: tokenAddr,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address as Address, ArkanaAddress as Address],
            });
            setAllowance(currentAllowance);
        } catch (error) {
            console.error('Error checking allowance:', error);
            setAllowance(null);
        } finally {
            setIsCheckingAllowance(false);
        }
    }, [tokenAddress, amount, address, publicClient, tokenDecimals]);

    // Check allowance when relevant values change
    useEffect(() => {
        checkAllowance();
    }, [checkAllowance]);

    // Handle approval
    const handleApprove = async () => {
        if (!tokenAddress || !amount || !address || !publicClient) {
            setTxError('Token address and amount are required');
            return;
        }

        try {
            setIsApproving(true);
            setTxError(null);
            const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;

            let amountIn: bigint;
            const finalDecimals = tokenDecimals ?? 18;
            const sanitizedAmount = amount.trim();
            const parts = sanitizedAmount.split('.');
            if (parts.length === 1) {
                amountIn = BigInt(sanitizedAmount) * BigInt(10 ** finalDecimals);
            } else {
                const integerPart = parts[0] || '0';
                const decimalPart = parts[1] || '';
                const limitedDecimal = decimalPart.slice(0, finalDecimals);
                const paddedDecimal = limitedDecimal.padEnd(finalDecimals, '0');
                amountIn = BigInt(integerPart) * BigInt(10 ** finalDecimals) + BigInt(paddedDecimal);
            }

            writeApproveContract({
                address: tokenAddr,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [ArkanaAddress as Address, amountIn],
            });
        } catch (error) {
            console.error('Error approving tokens:', error);
            setTxError(error instanceof Error ? error.message : 'Failed to approve tokens');
            setIsApproving(false);
        }
    };

    // Handle approval confirmation
    useEffect(() => {
        if (isApprovalConfirmed && approvalHashData) {
            setIsApproving(false);
            setTimeout(() => {
                checkAllowance();
            }, 2000);
        }
    }, [isApprovalConfirmed, approvalHashData, checkAllowance]);

    // Generate proof
    const proveArkanaEntry = async () => {
        if (!userKey) {
            setProofError('Please sign a message first to generate user_key');
            return;
        }

        if (!tokenAddress) {
            setProofError('Please fill in token_address');
            return;
        }

        try {
            setIsProving(true);
            setProofError(null);
            setProvingTime(null);

            const startTime = performance.now();
            await initializeBackend();

            if (!backendRef.current || !noirRef.current) {
                throw new Error('Failed to initialize backend');
            }

            let chainIdForCircuit: number;
            try {
                const client = publicClient || createPublicClient({
                    chain: sepolia,
                    transport: http('http://127.0.0.1:8545')
                });
                chainIdForCircuit = await client.getChainId();
            } catch (error) {
                chainIdForCircuit = chainId || publicClient?.chain?.id || sepolia.id;
            }

            const inputs = {
                user_key: userKey,
                token_address: tokenAddress,
                chain_id: chainIdForCircuit.toString()
            };

            //@ts-ignore
            const { witness } = await noirRef.current!.execute(inputs, { keccak: true });
            //@ts-ignore
            const proofResult = await backendRef.current!.generateProof(witness, { keccak: true });

            const proofHex = Buffer.from(proofResult.proof).toString('hex');
            const publicInputsArray = (proofResult.publicInputs || []).slice(0, 7);

            let chainIdForProof: number;
            try {
                const client = publicClient || createPublicClient({
                    chain: sepolia,
                    transport: http('http://127.0.0.1:8545')
                });
                chainIdForProof = await client.getChainId();
            } catch (error) {
                chainIdForProof = chainId || publicClient?.chain?.id || sepolia.id;
            }
            const chainIdBigInt = BigInt(chainIdForProof);

            if (publicInputsArray.length > 1) {
                publicInputsArray[1] = chainIdBigInt;
            }

            const publicInputsHex = publicInputsArray.map((input: any) => {
                if (typeof input === 'string' && input.startsWith('0x')) {
                    return input;
                }
                if (typeof input === 'bigint') {
                    return `0x${input.toString(16).padStart(64, '0')}`;
                }
                const hex = BigInt(input).toString(16);
                return `0x${hex.padStart(64, '0')}`;
            });

            const endTime = performance.now();
            const provingTimeMs = Math.round(endTime - startTime);
            setProvingTime(provingTimeMs);

            setProof(proofHex);
            setPublicInputs(publicInputsHex);
        } catch (error) {
            console.error('Error generating proof:', error);
            setProofError(error instanceof Error ? error.message : 'Failed to generate proof');
        } finally {
            setIsProving(false);
        }
    };

    // Handle initialize transaction
    const handleInitCommit = async () => {
        if (!proof || !publicInputs || publicInputs.length === 0) {
            setTxError('Proof and public inputs are required');
            return;
        }

        if (!address || !isConnected) {
            setTxError('Please connect your wallet first');
            return;
        }

        if (!publicClient) {
            setTxError('Public client not available. Please check your wallet connection.');
            return;
        }

        console.log('Wallet status:', { address, isConnected, chainId, publicClient: !!publicClient });

        let amountIn: bigint = BigInt(0);
        if (amount && amount !== '') {
            const finalDecimals = tokenDecimals ?? 18;
            const parts = amount.split('.');
            if (parts.length === 1) {
                amountIn = BigInt(amount) * BigInt(10 ** finalDecimals);
            } else {
                const integerPart = parts[0] || '0';
                const decimalPart = parts[1] || '';
                const paddedDecimal = decimalPart.padEnd(finalDecimals, '0').slice(0, finalDecimals);
                amountIn = BigInt(integerPart) * BigInt(10 ** finalDecimals) + BigInt(paddedDecimal);
            }
        }

        if (amountIn > 0) {
            await checkAllowance();
            if (allowance === null || allowance < amountIn) {
                setTxError(`Insufficient token allowance. Please approve the contract to spend ${amountIn.toString()} tokens first.`);
                return;
            }
        }

        try {
            setIsSubmitting(true);
            setTxError(null);
            setTxHash(null);

            const proofBytes = `0x${proof}`;
            const slicedInputs = publicInputs.slice(0, 7);

            let chainIdForTx: number;
            try {
                const client = publicClient || createPublicClient({
                    chain: sepolia,
                    transport: http('http://127.0.0.1:8545')
                });
                chainIdForTx = await client.getChainId();
            } catch (error) {
                chainIdForTx = chainId || publicClient?.chain?.id || sepolia.id;
            }

            const chainIdHex = `0x${BigInt(chainIdForTx).toString(16).padStart(64, '0')}`;
            slicedInputs[1] = chainIdHex;

            const publicInputsBytes32 = slicedInputs.map((input: string) => {
                const hex = input.startsWith('0x') ? input.slice(2) : input;
                return `0x${hex.padStart(64, '0')}` as `0x${string}`;
            });

            const lockDurationBigInt = lockDuration ? BigInt(lockDuration) : BigInt(0);

            console.log('Calling writeContract with:', {
                address: ArkanaAddress,
                functionName: 'initialize',
                proofLength: proofBytes.length,
                publicInputsCount: publicInputsBytes32.length,
                amountIn: amountIn.toString(),
                lockDuration: lockDurationBigInt.toString(),
                chainId: chainIdForTx,
                userAddress: address,
            });

            // Verify all required data is present
            if (!proofBytes || proofBytes === '0x') {
                setTxError('Invalid proof bytes');
                setIsSubmitting(false);
                return;
            }

            if (!publicInputsBytes32 || publicInputsBytes32.length === 0) {
                setTxError('Invalid public inputs');
                setIsSubmitting(false);
                return;
            }

            try {
            writeContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'initialize',
                args: [proofBytes as `0x${string}`, publicInputsBytes32, amountIn, lockDurationBigInt],
            });
                console.log('writeContract called successfully, waiting for wallet confirmation...');
            } catch (writeError) {
                console.error('Error calling writeContract:', writeError);
                setTxError(writeError instanceof Error ? writeError.message : 'Failed to send transaction');
                setIsSubmitting(false);
                return;
            }

            // Check if writeContract actually triggered (isPending should become true)
            // We'll check this in a useEffect that watches isPending
        } catch (error) {
            console.error('Error in handleInitCommit:', error);
            setTxError(error instanceof Error ? error.message : 'Failed to process transaction');
            setIsSubmitting(false);
        }
    };

    // Update txHash when hash changes
    useEffect(() => {
        if (hash) {
            setTxHash(hash);
        }
    }, [hash]);

    // Update error when writeError changes
    useEffect(() => {
        if (writeError) {
            console.error('writeContract error:', writeError);
            setTxError(writeError.message || 'Transaction failed');
            setIsSubmitting(false);
        }
    }, [writeError]);

    // Monitor isPending to verify transaction was sent
    useEffect(() => {
        if (isPending && isSubmitting) {
            console.log('Transaction is pending - writeContract was successful');
        }
    }, [isPending, isSubmitting]);

    // Timeout check: if isSubmitting is true but isPending doesn't become true within 5 seconds, there's likely an issue
    useEffect(() => {
        if (!isSubmitting) return;

        const timeout = setTimeout(() => {
            if (isSubmitting && !isPending && !hash && !writeError) {
                console.error('Transaction timeout: writeContract was called but transaction was not sent');
                setTxError('Transaction was not sent. Please check your wallet connection and try again.');
                setIsSubmitting(false);
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [isSubmitting, isPending, hash, writeError]);

    // Reset submitting state when transaction completes
    useEffect(() => {
        if (isConfirmed) {
            setIsSubmitting(false);
        }
    }, [isConfirmed]);

    return {
        // State
        zkAddress,
        tokenAddress,
        setTokenAddress,
        tokenDecimals,
        amount,
        setAmount,
        lockDuration,
        setLockDuration,
        userKey,
        isLoading,
        error,
        isProving,
        proof,
        proofError,
        provingTime,
        currentProvingTime,
        isInitializing,
        publicInputs,
        isSubmitting,
        isSimulating,
        txHash,
        txError,
        allowance,
        isCheckingAllowance,
        isApproving,
        tokenBalance,
        isLoadingBalance,
        isPending,
        isConfirming,
        isConfirmed,
        isApprovalPending,
        isApprovalConfirming,
        isApprovalConfirmed,
        isSigning,
        // Actions
        handleSign,
        proveArkanaEntry,
        handleInitCommit,
        handleApprove,
        checkAllowance,
    };
}

