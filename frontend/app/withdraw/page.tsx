'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useZkAddress, useAccount as useAccountContext } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { useAccountSigning } from '@/hooks/useAccountSigning';
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseAbi, Address, keccak256 } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SpellButton } from '@/components/spell-button';
import TransactionModal from '@/components/TransactionModal';
import { useToast } from '@/components/Toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { Noir } from '@noir-lang/noir_js';
import { CachedUltraHonkBackend } from '@/lib/cached-ultra-honk-backend';
import withdrawCircuit from '@/lib/circuits/withdraw.json';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { ensureBufferPolyfill } from '@/lib/buffer-polyfill';
import { useNonceDiscovery } from '@/hooks/useNonceDiscovery';
import { loadAccountData, saveTokenAccountData, TokenAccountData } from '@/lib/indexeddb';
import { loadAccountDataOnSign } from '@/lib/loadAccountDataOnSign';
import { convertAssetsToShares } from '@/lib/shares-to-assets';
import { computePrivateKeyFromSignature } from '@/lib/circuit-utils';
import { getCurrentRound, getRoundTimestamp, type Order } from '@/lib/timelock-order';

const ERC20_ABI = parseAbi([
    'function decimals() view returns (uint8)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
]);

export default function WithdrawPage() {
    const { toast } = useToast();
    const zkAddress = useZkAddress();
    const { handleSign, isLoading, error, isSigning } = useAccountSigning();
    const { tokens: aaveTokens, isLoading: isLoadingTokens } = useAaveTokens();
    const publicClient = usePublicClient();
    const [showTokenSelector, setShowTokenSelector] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    // Account context
    const { account } = useAccountContext();
    const accountState = useAccountState();
    const {
        balanceEntries,
        currentNonce,
        userKey: contextUserKey,
        setBalanceEntries,
        setCurrentNonce,
        setUserKey,
    } = accountState;

    // Nonce discovery hook
    const {
        computeCurrentNonce,
        isComputing,
    } = useNonceDiscovery();
    const { address } = useWagmiAccount();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    // Form state
    const [tokenAddress, setTokenAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [receiverAddress, setReceiverAddress] = useState('');
    const [receiverFeeAmount, setReceiverFeeAmount] = useState('');
    const [arbitraryCalldata, setArbitraryCalldata] = useState('');
    const [arbitraryCalldataHash, setArbitraryCalldataHash] = useState<string>('0x0');
    const [isTlSwap, setIsTlSwap] = useState(false);
    const [tlSwapSharesAmounts, setTlSwapSharesAmounts] = useState<string[]>(Array(10).fill('0'));
    const [numOrders, setNumOrders] = useState<number>(1);
    const [tlOrders, setTlOrders] = useState<Array<{
        sharesAmount: string;
        amountOutMin: string;
        targetRound: string;
        deadline: string;
        recipient: string;
        tokenOut: string;
        slippageBps: string;
        executionFeeBps: string;
    }>>([{
        sharesAmount: '',
        amountOutMin: '',
        targetRound: '',
        deadline: '',
        recipient: address || '',
        tokenOut: '',
        slippageBps: '50',
        executionFeeBps: '10'
    }]);
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [tokenName, setTokenName] = useState<string>('');
    const [tokenSymbol, setTokenSymbol] = useState<string>('');

    // Backend state
    const withdrawBackendRef = useRef<CachedUltraHonkBackend | null>(null);
    const withdrawNoirRef = useRef<Noir | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isCalculatingInputs, setIsCalculatingInputs] = useState(false);

    // Transaction state
    const [isProving, setIsProving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [proof, setProof] = useState<string>('');
    const [publicInputs, setPublicInputs] = useState<string[]>([]);
    const [provingTime, setProvingTime] = useState<number | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [txError, setTxError] = useState<string | null>(null);
    const [proofError, setProofError] = useState<string | null>(null);

    // Token discovery state
    const [isDiscoveringToken, setIsDiscoveringToken] = useState(false);
    const [discoveryError, setDiscoveryError] = useState<string | null>(null);
    const [tokenNonce, setTokenNonce] = useState<bigint | null>(null);
    const [tokenBalanceEntries, setTokenBalanceEntries] = useState<any[]>([]);
    const [isLoadingUserKey, setIsLoadingUserKey] = useState(false);

    // Show modal when proof is generating, transaction is pending, confirming, or confirmed
    React.useEffect(() => {
        if (isProving || isPending || isConfirming || isConfirmed) {
            setShowTransactionModal(true);
        }
    }, [isProving, isPending, isConfirming, isConfirmed]);

    // Show toast on success
    React.useEffect(() => {
        if (isConfirmed && txHash) {
            toast('WITHDRAW TRANSACTION CONFIRMED', 'success');
        }
    }, [isConfirmed, txHash, toast]);

    // Show modal on error
    React.useEffect(() => {
        if (txError) {
            setShowTransactionModal(true);
        }
    }, [txError]);

    // Initialize userKey from existing signature when component mounts (if user is already signed)
    React.useEffect(() => {
        const initializeFromExisting = async () => {
            if (!account?.signature) {
                return;
            }

            // If we already have contextUserKey, we're done
            if (contextUserKey) {
                return;
            }

            // Compute userKey directly from signature (no need to open IndexedDB)
            try {
                const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                const userKeyBigInt = BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                setUserKey(userKeyBigInt);
            } catch (error) {
                console.error('Error computing userKey from existing signature:', error);
            }
        };
        initializeFromExisting();
    }, [account?.signature, contextUserKey, setUserKey]);

    // Format balance for display
    const formatBalance = (balance: bigint | null, decimals: number | null): string => {
        if (balance === null || decimals === null) return '0';
        const divisor = BigInt(10 ** decimals);
        const integerPart = balance / divisor;
        const decimalPart = balance % divisor;
        const decimalStr = decimalPart.toString().padStart(decimals, '0');
        const decimalStrTrimmed = decimalStr.replace(/0+$/, '');
        return decimalStrTrimmed === '' ? integerPart.toString() : `${integerPart.toString()}.${decimalStrTrimmed}`;
    };

    // Discover token when tokenAddress is selected
    useEffect(() => {
        const discoverToken = async () => {
            if (!tokenAddress || !zkAddress || !publicClient || !account?.signature) {
                return;
            }

            // Check if we already have data for this token
            const cachedData = await loadAccountData(zkAddress);
            const tokenAddressLower = tokenAddress.toLowerCase();
            const cachedTokenData = cachedData?.tokenData?.find(t => {
                return t.tokenAddress.toLowerCase() === tokenAddressLower;
            });

            // If we have cached data, use it
            if (cachedTokenData) {
                setTokenNonce(cachedTokenData.currentNonce);
                setTokenBalanceEntries(cachedTokenData.balanceEntries || []);
                setCurrentNonce(cachedTokenData.currentNonce);
                setBalanceEntries(cachedTokenData.balanceEntries || []);
                return;
            }

            // Otherwise, discover the token
            try {
                setIsDiscoveringToken(true);
                setDiscoveryError(null);

                const result = await computeCurrentNonce(
                    tokenAddress as `0x${string}`,
                    null,
                    []
                );

                if (result) {
                    await saveTokenAccountData(
                        zkAddress,
                        tokenAddress,
                        result.currentNonce,
                        result.balanceEntries
                    );

                    setTokenNonce(result.currentNonce);
                    setTokenBalanceEntries(result.balanceEntries);
                    setCurrentNonce(result.currentNonce);
                    setBalanceEntries(result.balanceEntries);
                }
            } catch (error) {
                console.error('Error discovering token:', error);
                setDiscoveryError(error instanceof Error ? error.message : 'Failed to discover token');
            } finally {
                setIsDiscoveringToken(false);
            }
        };

        discoverToken();
    }, [tokenAddress, zkAddress, publicClient, account?.signature, computeCurrentNonce, setCurrentNonce, setBalanceEntries]);

    // Load token info when tokenAddress changes
    useEffect(() => {
        const loadTokenInfo = async () => {
            if (!tokenAddress || !publicClient) {
                setTokenDecimals(null);
                setTokenName('');
                setTokenSymbol('');
                return;
            }

            try {
                // Check Aave tokens first
                const aaveToken = aaveTokens.find((t: { address: string }) =>
                    t.address.toLowerCase() === tokenAddress.toLowerCase()
                );

                if (aaveToken) {
                    setTokenDecimals(aaveToken.decimals);
                    setTokenName(aaveToken.name);
                    setTokenSymbol(aaveToken.symbol);
                    return;
                }

                // Fallback to on-chain fetch
                const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;

                const [decimals, name, symbol] = await Promise.all([
                    publicClient.readContract({
                        address: tokenAddr,
                        abi: ERC20_ABI,
                        functionName: 'decimals',
                    }).catch(() => null),
                    publicClient.readContract({
                        address: tokenAddr,
                        abi: ERC20_ABI,
                        functionName: 'name',
                    }).catch(() => null),
                    publicClient.readContract({
                        address: tokenAddr,
                        abi: ERC20_ABI,
                        functionName: 'symbol',
                    }).catch(() => null),
                ]);

                if (decimals !== null && decimals !== undefined) {
                    setTokenDecimals(decimals);
                }
                if (name !== null && name !== undefined) {
                    setTokenName(name);
                }
                if (symbol !== null && symbol !== undefined) {
                    setTokenSymbol(symbol);
                }
            } catch (error) {
                console.error('Error fetching token info:', error);
                setTokenDecimals(null);
                setTokenName('');
                setTokenSymbol('');
            }
        };

        if (tokenAddress && tokenAddress.length === 42) {
            loadTokenInfo();
        } else {
            setTokenDecimals(null);
            setTokenName('');
            setTokenSymbol('');
        }
    }, [tokenAddress, publicClient, aaveTokens]);

    // Update txHash when hash changes
    React.useEffect(() => {
        if (hash) {
            setTxHash(hash);
        }
    }, [hash]);

    // Update error when writeError changes
    React.useEffect(() => {
        if (writeError) {
            setTxError(writeError.message || 'Transaction failed');
            setIsSubmitting(false);
        }
    }, [writeError]);

    // Reset submitting state when transaction completes
    React.useEffect(() => {
        if (isConfirmed) {
            setIsSubmitting(false);
        }
    }, [isConfirmed]);

    // Initialize withdraw backend
    const initializeBackend = useCallback(async () => {
        if (withdrawBackendRef.current && withdrawNoirRef.current) {
            return;
        }

        const startTime = performance.now();
        setIsInitializing(true);

        try {
            await ensureBufferPolyfill();

            const backendOptions = {
                threads: 1,
            };

            const backend = new CachedUltraHonkBackend(withdrawCircuit.bytecode, backendOptions);
            const noir = new Noir(withdrawCircuit);
            withdrawBackendRef.current = backend;
            withdrawNoirRef.current = noir;

            const endTime = performance.now();
            const initTime = Math.round(endTime - startTime);
            setIsInitialized(true);

        } catch (error) {
            console.error('Failed to initialize backend:', error);
            throw error;
        } finally {
            setIsInitializing(false);
        }
    }, [isInitialized]);

    // Calculate arbitrary calldata hash when calldata changes
    useEffect(() => {
        if (arbitraryCalldata && arbitraryCalldata.trim() !== '') {
            const calldataHex = arbitraryCalldata.startsWith('0x') ? arbitraryCalldata : `0x${arbitraryCalldata}`;
            const fullHash = keccak256(calldataHex as `0x${string}`);
            const hash31Bytes = `0x${fullHash.slice(2, 64)}`;
            setArbitraryCalldataHash(hash31Bytes);
        } else {
            setArbitraryCalldataHash('0x0');
        }
    }, [arbitraryCalldata]);

    // Calculate circuit inputs for withdraw
    const calculateCircuitInputsWithdraw = async () => {
        setIsCalculatingInputs(true);
        try {
            if (!tokenAddress || !zkAddress) {
                throw new Error('Missing required data: tokenAddress or zkAddress');
            }

            // Get userKey - use contextUserKey if available, otherwise compute from signature
            let userKeyToUse: bigint | null = contextUserKey;

            if (!userKeyToUse && account?.signature) {
                setIsLoadingUserKey(true);
                try {
                    // Compute userKey directly from signature (no need to open IndexedDB)
                    const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                    userKeyToUse = BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);

                    // Store in context for future use
                    if (userKeyToUse) {
                        setUserKey(userKeyToUse);
                    }
                } catch (error) {
                    console.error('Error computing userKey from signature:', error);
                    throw new Error('Failed to compute userKey. Please sign the message first.');
                } finally {
                    setIsLoadingUserKey(false);
                }
            }

            if (!userKeyToUse) {
                throw new Error('Missing userKey. Please sign the message first to generate your userKey.');
            }

            if (tokenNonce === null) {
                throw new Error('Token nonce not discovered yet. Please wait for token discovery to complete.');
            }

            if (tokenBalanceEntries.length === 0) {
                throw new Error('No balance entries found for this token. You may not have any balance to withdraw.');
            }

            // Get the previous nonce (the one we're withdrawing from)
            const tokenPreviousNonce = tokenNonce > BigInt(0) ? tokenNonce - BigInt(1) : BigInt(0);

            // Find the balance entry for the withdraw token at tokenPreviousNonce
            const tokenBalanceEntry = tokenBalanceEntries.find(entry => {
                const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
                return entryNonce === tokenPreviousNonce;
            });

            if (!tokenBalanceEntry || tokenBalanceEntry.amount === undefined || tokenBalanceEntry.amount === null) {
                throw new Error(`Balance not found for token ${tokenAddress} at nonce ${tokenPreviousNonce.toString()}`);
            }

            const tokenAddressBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress);

            // Convert amount from decimal string to raw units (handling decimals properly)
            // User inputs amount in underlying tokens (e.g., 1.00 EURS)
            // We need to convert to shares because the ZK system tracks balances in shares
            let amountInRawUnits: bigint;
            if (!amount || amount === '') {
                amountInRawUnits = BigInt(0);
            } else {
                const sanitizedAmount = amount.trim().replace(',', '.');
                if (!/^\d+\.?\d*$/.test(sanitizedAmount)) {
                    throw new Error('Invalid amount format');
                }

                const parts = sanitizedAmount.split('.');
                const finalDecimals = tokenDecimals ?? 18;
                if (parts.length === 1) {
                    amountInRawUnits = BigInt(sanitizedAmount) * BigInt(10 ** finalDecimals);
                } else {
                    const integerPart = parts[0] || '0';
                    const decimalPart = parts[1] || '';
                    const limitedDecimal = decimalPart.slice(0, finalDecimals);
                    const paddedDecimal = limitedDecimal.padEnd(finalDecimals, '0');
                    amountInRawUnits = BigInt(integerPart) * BigInt(10 ** finalDecimals) + BigInt(paddedDecimal);
                }
            }

            // Convert underlying token amount to shares using the vault
            if (!publicClient) {
                throw new Error('Public client not available');
            }
            const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;
            const sharesForProof = await convertAssetsToShares(publicClient, tokenAddr, amountInRawUnits);
            // Use shares for the proof (ZK system tracks balances in shares)
            // If conversion fails, fallback to raw units (shouldn't happen if vault exists)
            const amountBigInt = sharesForProof !== null ? sharesForProof : amountInRawUnits;

            console.log('🔄 Amount conversion:', {
                amountInRawUnits: amountInRawUnits.toString(),
                sharesForProof: sharesForProof?.toString() || 'null',
                amountBigInt: amountBigInt.toString(),
            });

            // Convert receiver fee amount from decimal string to raw units
            // Receiver fee amount is also in underlying tokens, convert to shares
            let receiverFeeAmountInRawUnits: bigint;
            if (!receiverFeeAmount || receiverFeeAmount === '') {
                receiverFeeAmountInRawUnits = BigInt(0);
            } else {
                const sanitizedFeeAmount = receiverFeeAmount.trim().replace(',', '.');
                if (!/^\d+\.?\d*$/.test(sanitizedFeeAmount)) {
                    throw new Error('Invalid receiver fee amount format');
                }

                const feeParts = sanitizedFeeAmount.split('.');
                const finalDecimals = tokenDecimals ?? 18;
                if (feeParts.length === 1) {
                    receiverFeeAmountInRawUnits = BigInt(sanitizedFeeAmount) * BigInt(10 ** finalDecimals);
                } else {
                    const integerPart = feeParts[0] || '0';
                    const decimalPart = feeParts[1] || '';
                    const limitedDecimal = decimalPart.slice(0, finalDecimals);
                    const paddedDecimal = limitedDecimal.padEnd(finalDecimals, '0');
                    receiverFeeAmountInRawUnits = BigInt(integerPart) * BigInt(10 ** finalDecimals) + BigInt(paddedDecimal);
                }
            }

            // Convert receiver fee amount to shares
            const relayFeeTokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;
            const receiverFeeShares = await convertAssetsToShares(publicClient, relayFeeTokenAddr, receiverFeeAmountInRawUnits);
            const receiverFeeAmountBigInt = receiverFeeShares !== null ? receiverFeeShares : receiverFeeAmountInRawUnits;

            const receiverAddressBigInt = BigInt(receiverAddress.startsWith('0x') ? receiverAddress : '0x' + receiverAddress);

            // declared_time_reference: current timestamp (for withdraw time validation)
            const declaredTimeReference = BigInt(Math.floor(Date.now() / 1000));

            // Reconstruct previous_shares, nullifier, previous_unlocks_at, and commitment leaf
            // This is the same logic as in the original deposit/page.tsx for withdraw
            const { poseidon2Hash } = await import('@aztec/foundation/crypto');
            const { padHex } = await import('viem');
            const chainId = BigInt(await publicClient?.getChainId() || 31337);

            // For nonce 0, read shares from contract
            let sharesFromContract: bigint | undefined = undefined;
            if (tokenPreviousNonce === BigInt(0)) {
                const spendingKeyHash = await poseidon2Hash([userKeyToUse, chainId, tokenAddressBigInt]);
                let spendingKeyBigInt: bigint;
                if (typeof spendingKeyHash === 'bigint') {
                    spendingKeyBigInt = spendingKeyHash;
                } else if ('toBigInt' in spendingKeyHash && typeof (spendingKeyHash as any).toBigInt === 'function') {
                    spendingKeyBigInt = (spendingKeyHash as any).toBigInt();
                } else if ('value' in spendingKeyHash) {
                    spendingKeyBigInt = BigInt((spendingKeyHash as any).value);
                } else {
                    spendingKeyBigInt = BigInt((spendingKeyHash as any).toString());
                }

                const nonceCommitmentHash = await poseidon2Hash([spendingKeyBigInt, tokenPreviousNonce, tokenAddressBigInt]);
                let nonceCommitmentBigInt: bigint;
                if (typeof nonceCommitmentHash === 'bigint') {
                    nonceCommitmentBigInt = nonceCommitmentHash;
                } else if ('toBigInt' in nonceCommitmentHash && typeof (nonceCommitmentHash as any).toBigInt === 'function') {
                    nonceCommitmentBigInt = (nonceCommitmentHash as any).toBigInt();
                } else if ('value' in nonceCommitmentHash) {
                    nonceCommitmentBigInt = BigInt((nonceCommitmentHash as any).value);
                } else {
                    nonceCommitmentBigInt = BigInt((nonceCommitmentHash as any).toString());
                }

                const nonceCommitmentBytes32 = padHex(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
                const encryptedStateDetails = await publicClient.readContract({
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'encryptedStateDetails',
                    args: [nonceCommitmentBytes32],
                }) as [`0x${string}`, `0x${string}`];

                const amountAfterFee = BigInt(encryptedStateDetails[0]);
                sharesFromContract = amountAfterFee;
            }

            // Reconstruct previous_shares, nullifier, previous_unlocks_at
            let previousSharesForReconstruction: bigint;
            let nullifierForReconstruction: bigint;
            let unlocksAtForReconstruction: bigint;

            if (tokenPreviousNonce === BigInt(0)) {
                previousSharesForReconstruction = sharesFromContract || BigInt(0);
                nullifierForReconstruction = BigInt(0);
                unlocksAtForReconstruction = BigInt(0);
            } else {
                const { poseidonCtrDecrypt } = await import('@/lib/poseidon-ctr-encryption');
                const VIEW_STRING = BigInt('0x76696577696e675f6b6579');
                const viewKey = await poseidon2Hash([VIEW_STRING, userKeyToUse]);
                let viewKeyBigInt: bigint;
                if (typeof viewKey === 'bigint') {
                    viewKeyBigInt = viewKey;
                } else if ('toBigInt' in viewKey && typeof (viewKey as any).toBigInt === 'function') {
                    viewKeyBigInt = (viewKey as any).toBigInt();
                } else if ('value' in viewKey) {
                    viewKeyBigInt = BigInt((viewKey as any).value);
                } else {
                    viewKeyBigInt = BigInt((viewKey as any).toString());
                }

                const spendingKey = await poseidon2Hash([userKeyToUse, chainId, tokenAddressBigInt]);
                let spendingKeyBigInt: bigint;
                if (typeof spendingKey === 'bigint') {
                    spendingKeyBigInt = spendingKey;
                } else if ('toBigInt' in spendingKey && typeof (spendingKey as any).toBigInt === 'function') {
                    spendingKeyBigInt = (spendingKey as any).toBigInt();
                } else if ('value' in spendingKey) {
                    spendingKeyBigInt = BigInt((spendingKey as any).value);
                } else {
                    spendingKeyBigInt = BigInt((spendingKey as any).toString());
                }

                const finalPreviousNonceCommitment = await poseidon2Hash([spendingKeyBigInt, tokenPreviousNonce, tokenAddressBigInt]);
                let finalPreviousNonceCommitmentBigInt: bigint;
                if (typeof finalPreviousNonceCommitment === 'bigint') {
                    finalPreviousNonceCommitmentBigInt = finalPreviousNonceCommitment;
                } else if ('toBigInt' in finalPreviousNonceCommitment && typeof (finalPreviousNonceCommitment as any).toBigInt === 'function') {
                    finalPreviousNonceCommitmentBigInt = (finalPreviousNonceCommitment as any).toBigInt();
                } else if ('value' in finalPreviousNonceCommitment) {
                    finalPreviousNonceCommitmentBigInt = BigInt((finalPreviousNonceCommitment as any).value);
                } else {
                    finalPreviousNonceCommitmentBigInt = BigInt((finalPreviousNonceCommitment as any).toString());
                }

                const finalPreviousNonceCommitmentBytes32 = padHex(`0x${finalPreviousNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
                const operationInfoForFinalPrevious = await publicClient.readContract({
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'getNonceCommitmentInfo',
                    args: [finalPreviousNonceCommitmentBytes32],
                }) as [number, bigint, string, `0x${string}`, `0x${string}`];

                const [opTypeForFinalPrevious, sharesMintedForFinalPrevious, , encryptedBalanceForFinalPrevious, encryptedNullifierForFinalPrevious] = operationInfoForFinalPrevious;

                let decryptedPreviousShares: bigint;
                if (opTypeForFinalPrevious === 0) {
                    decryptedPreviousShares = BigInt(encryptedBalanceForFinalPrevious);
                } else {
                    const encryptedBalanceBigInt = BigInt(encryptedBalanceForFinalPrevious);
                    decryptedPreviousShares = await poseidonCtrDecrypt(encryptedBalanceBigInt, viewKeyBigInt, 0);
                }

                if (opTypeForFinalPrevious === 0 || opTypeForFinalPrevious === 1) {
                    previousSharesForReconstruction = decryptedPreviousShares + sharesMintedForFinalPrevious;
                } else {
                    previousSharesForReconstruction = decryptedPreviousShares;
                }

                // Get nullifier and unlocks_at
                const previousNonceCommitment = await poseidon2Hash([spendingKeyBigInt, tokenPreviousNonce, tokenAddressBigInt]);
                let previousNonceCommitmentBigInt: bigint;
                if (typeof previousNonceCommitment === 'bigint') {
                    previousNonceCommitmentBigInt = previousNonceCommitment;
                } else if ('toBigInt' in previousNonceCommitment && typeof (previousNonceCommitment as any).toBigInt === 'function') {
                    previousNonceCommitmentBigInt = (previousNonceCommitment as any).toBigInt();
                } else if ('value' in previousNonceCommitment) {
                    previousNonceCommitmentBigInt = BigInt((previousNonceCommitment as any).value);
                } else {
                    previousNonceCommitmentBigInt = BigInt((previousNonceCommitment as any).toString());
                }

                const previousNonceCommitmentBytes32 = padHex(`0x${previousNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
                const [, , , , previousEncryptedNullifierBytes32] = await publicClient.readContract({
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'getNonceCommitmentInfo',
                    args: [previousNonceCommitmentBytes32],
                }) as [number, bigint, string, `0x${string}`, `0x${string}`];

                const previousEncryptedNullifierBigInt = BigInt(previousEncryptedNullifierBytes32);
                nullifierForReconstruction = await poseidonCtrDecrypt(previousEncryptedNullifierBigInt, viewKeyBigInt, 1);
                unlocksAtForReconstruction = BigInt(0);
            }

            // Calculate commitment leaf using pedersenCommitment5 and computeCommitmentLeaf
            const { pedersenCommitment5 } = await import('@/lib/pedersen-commitments');
            const reconstructModule = await import('@/lib/reconstructCommitment');

            const spendingKeyHashForCommit = await poseidon2Hash([userKeyToUse, chainId, tokenAddressBigInt]);
            let spendingKeyForCommit: bigint;
            if (typeof spendingKeyHashForCommit === 'bigint') {
                spendingKeyForCommit = spendingKeyHashForCommit;
            } else if ('toBigInt' in spendingKeyHashForCommit && typeof (spendingKeyHashForCommit as any).toBigInt === 'function') {
                spendingKeyForCommit = (spendingKeyHashForCommit as any).toBigInt();
            } else if ('value' in spendingKeyHashForCommit) {
                spendingKeyForCommit = BigInt((spendingKeyHashForCommit as any).value);
            } else {
                spendingKeyForCommit = BigInt((spendingKeyHashForCommit as any).toString());
            }

            const prevNonceCommitmentHash = await poseidon2Hash([spendingKeyForCommit, tokenPreviousNonce, tokenAddressBigInt]);
            let prevNonceCommitmentBigInt: bigint;
            if (typeof prevNonceCommitmentHash === 'bigint') {
                prevNonceCommitmentBigInt = prevNonceCommitmentHash;
            } else if ('toBigInt' in prevNonceCommitmentHash && typeof (prevNonceCommitmentHash as any).toBigInt === 'function') {
                prevNonceCommitmentBigInt = (prevNonceCommitmentHash as any).toBigInt();
            } else if ('value' in prevNonceCommitmentHash) {
                prevNonceCommitmentBigInt = BigInt((prevNonceCommitmentHash as any).value);
            } else {
                prevNonceCommitmentBigInt = BigInt((prevNonceCommitmentHash as any).toString());
            }

            const commitmentPoint = pedersenCommitment5(
                previousSharesForReconstruction,
                nullifierForReconstruction,
                spendingKeyForCommit,
                unlocksAtForReconstruction,
                prevNonceCommitmentBigInt
            );

            const previousCommitmentLeaf = await reconstructModule.computeCommitmentLeaf(commitmentPoint, publicClient);

            // Verify leaf exists in contract
            const leafExists = await publicClient.readContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'hasLeaf',
                args: [tokenAddress as `0x${string}`, previousCommitmentLeaf],
            }) as boolean;

            if (!leafExists) {
                throw new Error(`Reconstructed commitment leaf does not exist in contract. This indicates a mismatch in state reconstruction.`);
            }

            // Get commitment_index
            let commitmentIndex: bigint;
            try {
                commitmentIndex = await publicClient.readContract({
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'getLeafIndex',
                    args: [tokenAddress as `0x${string}`, previousCommitmentLeaf],
                }) as bigint;
            } catch (error) {
                const treeSize = await publicClient.readContract({
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'getSize',
                    args: [tokenAddress as `0x${string}`],
                }) as bigint;
                commitmentIndex = treeSize;
            }

            // Get merkle tree state
            const expectedRoot = await publicClient.readContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'getRoot',
                args: [tokenAddress as `0x${string}`],
            }) as bigint;

            const treeDepth = await publicClient.readContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'getDepth',
                args: [tokenAddress as `0x${string}`],
            }) as bigint;

            // Generate merkle proof
            const { generateMerkleProof } = await import('@/lib/merkle-proof');
            const contractLeaves = await publicClient.readContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'getLeaves' as any,
                args: [tokenAddress as `0x${string}`],
            }) as unknown as bigint[];

            if (contractLeaves.length === 0) {
                throw new Error('No leaves found in contract - cannot generate merkle proof');
            }

            let contractProof: bigint[];
            try {
                contractProof = await publicClient.readContract({
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'generateProof',
                    args: [tokenAddress as `0x${string}`, commitmentIndex],
                }) as unknown as bigint[];
            } catch (error) {
                const merkleProofResult = await generateMerkleProof(
                    contractLeaves,
                    Number(commitmentIndex),
                    32
                );
                contractProof = merkleProofResult.siblings.map(s => BigInt(s));
            }

            // Pad proof to 32 elements for circuit
            const merkleProofFormatted: string[] = [];
            for (let i = 0; i < 32; i++) {
                if (i < contractProof.length) {
                    merkleProofFormatted.push(contractProof[i].toString());
                } else {
                    merkleProofFormatted.push('0');
                }
            }

            // Format for Noir
            const formatForNoir = (value: bigint | string): string => {
                if (typeof value === 'bigint') {
                    return value.toString();
                }
                const hexValue = value.startsWith('0x') ? value : '0x' + value;
                return BigInt(hexValue).toString();
            };

            const userKeyForCircuit = '0x' + userKeyToUse.toString(16);

            // Format tl_swap_shares_amounts array from tlOrders (convert to shares if needed, or use as-is)
            // Use tlOrders if available, otherwise fall back to tlSwapSharesAmounts for backward compatibility
            const ordersToUse = isTlSwap && tlOrders.length > 0 && tlOrders[0].sharesAmount
                ? tlOrders.slice(0, numOrders).map(o => o.sharesAmount)
                : tlSwapSharesAmounts;

            const formattedTlSwapSharesAmounts = await Promise.all(
                ordersToUse.map(async (amountStr, index) => {
                    if (!amountStr || amountStr === '0' || amountStr === '') {
                        return '0';
                    }
                    // Convert from decimal string to raw units (shares)
                    const sanitizedAmount = amountStr.trim().replace(',', '.');
                    if (!/^\d+\.?\d*$/.test(sanitizedAmount)) {
                        return '0';
                    }
                    const parts = sanitizedAmount.split('.');
                    const finalDecimals = tokenDecimals ?? 18;
                    let amountInRawUnits: bigint;
                    if (parts.length === 1) {
                        amountInRawUnits = BigInt(sanitizedAmount) * BigInt(10 ** finalDecimals);
                    } else {
                        const integerPart = parts[0] || '0';
                        const decimalPart = parts[1] || '';
                        const limitedDecimal = decimalPart.slice(0, finalDecimals);
                        const paddedDecimal = limitedDecimal.padEnd(finalDecimals, '0');
                        amountInRawUnits = BigInt(integerPart) * BigInt(10 ** finalDecimals) + BigInt(paddedDecimal);
                    }
                    // Convert to shares (if vault exists)
                    const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;
                    const shares = await convertAssetsToShares(publicClient, tokenAddr, amountInRawUnits);
                    return shares !== null ? shares.toString() : amountInRawUnits.toString();
                })
            );

            // Pad to 10 elements for circuit
            while (formattedTlSwapSharesAmounts.length < 10) {
                formattedTlSwapSharesAmounts.push('0');
            }

            // Calculate circuit inputs
            const inputs = {
                user_key: formatForNoir(userKeyForCircuit),
                token_address: formatForNoir(tokenAddressBigInt),
                amount: formatForNoir(amountBigInt),
                chain_id: (await publicClient?.getChainId())?.toString() || '11155111',
                previous_nonce: tokenPreviousNonce.toString(),
                previous_shares: previousSharesForReconstruction.toString(),
                nullifier: nullifierForReconstruction.toString(),
                previous_unlocks_at: unlocksAtForReconstruction.toString(),
                declared_time_reference: declaredTimeReference.toString(),
                previous_commitment_leaf: previousCommitmentLeaf.toString(),
                commitment_index: commitmentIndex.toString(),
                tree_depth: treeDepth.toString(),
                expected_root: expectedRoot.toString(),
                merkle_proof: merkleProofFormatted,
                receiver_address: formatForNoir(receiverAddressBigInt),
                relayer_fee_amount: formatForNoir(receiverFeeAmountBigInt),
                arbitrary_calldata_hash: formatForNoir(BigInt(arbitraryCalldataHash)),
                is_tl_swap: isTlSwap,
                tl_swap_shares_amounts: formattedTlSwapSharesAmounts,
            };

            return inputs;
        } catch (error) {
            console.error('Error calculating circuit inputs:', error);
            throw error;
        } finally {
            setIsCalculatingInputs(false);
        }
    };

    // Generate withdraw proof
    const proveWithdraw = async () => {
        if (!zkAddress) {
            setProofError('Please sign a message first to access the Arkana network');
            return;
        }

        if (!tokenAddress || !amount || !receiverAddress || !receiverFeeAmount) {
            setProofError('Please fill in all required fields');
            return;
        }

        // Validate TL Swap: sum of order shares must equal withdrawal amount
        if (isTlSwap) {
            const totalShares = tlOrders.slice(0, numOrders).reduce((sum, order) => {
                const shares = parseFloat(order.sharesAmount || '0');
                return sum + (isNaN(shares) ? 0 : shares);
            }, 0);
            const withdrawalAmount = parseFloat(amount || '0');
            const difference = Math.abs(totalShares - withdrawalAmount);

            if (difference >= 0.0001) {
                setProofError(`TL Swap validation failed: Sum of order shares (${totalShares.toFixed(6)}) does not equal withdrawal amount (${withdrawalAmount.toFixed(6)}). Difference: ${difference.toFixed(6)}`);
                return;
            }

            // Validate that all orders have required fields
            for (let i = 0; i < numOrders; i++) {
                const order = tlOrders[i];
                if (!order.sharesAmount || parseFloat(order.sharesAmount) <= 0) {
                    setProofError(`Order ${i + 1}: Shares amount is required and must be greater than 0`);
                    return;
                }
                if (!order.amountOutMin || parseFloat(order.amountOutMin) <= 0) {
                    setProofError(`Order ${i + 1}: Amount Out Min is required and must be greater than 0`);
                    return;
                }
                if (!order.targetRound || parseInt(order.targetRound) <= 0) {
                    setProofError(`Order ${i + 1}: Target Round is required and must be greater than 0`);
                    return;
                }
                if (!order.deadline || parseInt(order.deadline) <= 0) {
                    setProofError(`Order ${i + 1}: Deadline is required and must be greater than 0`);
                    return;
                }
                if (!order.recipient || !order.recipient.startsWith('0x')) {
                    setProofError(`Order ${i + 1}: Valid recipient address is required`);
                    return;
                }
                if (!order.tokenOut || !order.tokenOut.startsWith('0x')) {
                    setProofError(`Order ${i + 1}: Valid token out address is required`);
                    return;
                }
            }
        }

        if (isDiscoveringToken) {
            setProofError('Token discovery in progress. Please wait...');
            return;
        }

        if (tokenNonce === null) {
            setProofError('Token nonce not discovered yet. Please wait for token discovery to complete.');
            return;
        }

        if (discoveryError) {
            setProofError(`Token discovery failed: ${discoveryError}`);
            return;
        }

        try {
            setIsProving(true);
            setProofError(null);
            setProvingTime(null);

            const startTime = performance.now();
            await initializeBackend();

            if (!withdrawBackendRef.current || !withdrawNoirRef.current) {
                throw new Error('Failed to initialize backend');
            }

            // Calculate circuit inputs dynamically
            const inputs = await calculateCircuitInputsWithdraw();

            //@ts-ignore
            const { witness } = await withdrawNoirRef.current!.execute(inputs, { keccak: true });

            //@ts-ignore
            const proofResult = await withdrawBackendRef.current!.generateProof(witness, { keccak: true });
            const proofHex = Buffer.from(proofResult.proof).toString('hex');

            const publicInputsArray = (proofResult.publicInputs || []);

            // Log raw public inputs from circuit to understand the actual order
            console.log('🔍 Raw public inputs from circuit (before reordering):');
            console.log(`  Length: ${publicInputsArray.length}`);
            publicInputsArray.forEach((input: any, index: number) => {
                const hex = typeof input === 'bigint' ? `0x${input.toString(16).padStart(64, '0')}` : (input.startsWith('0x') ? input : `0x${BigInt(input).toString(16).padStart(64, '0')}`);
                console.log(`  [${index}]: ${hex}`);
            });

            // Reorder public inputs to match contract expectations (17 elements: 8 inputs + 9 outputs)
            // Contract expects: [0] token_address, [1] chain_id, [2] declared_time_reference, [3] expected_root,
            //                  [4] arbitrary_calldata_hash, [5] receiver_address, [6] relayer_fee_amount, [7] is_tl_swap,
            //                  [8] new_commitment.x, [9] new_commitment.y, [10] new_nonce_commitment,
            //                  [11] encryptedBalance, [12] encryptedNullifier, [13] nonce_discovery_entry.x, [14] nonce_discovery_entry.y,
            //                  [15] tl_hashchain, [16] final_amount
            let reorderedInputs: any[];

            if (publicInputsArray.length === 11) {
                // Circuit returned 11 elements (4 inputs + 7 outputs). Reconstruct full 18-element array.
                // Note: tl_hashchain and final_amount are not in the 11-element output, so we'll use placeholders
                reorderedInputs = [
                    publicInputsArray[0],              // [0] token_address
                    publicInputsArray[1],              // [1] amount
                    publicInputsArray[2],              // [2] chain_id
                    publicInputsArray[3],              // [3] declared_time_reference
                    inputs.expected_root,              // [4] expected_root
                    inputs.arbitrary_calldata_hash,    // [5] arbitrary_calldata_hash
                    inputs.receiver_address,           // [6] receiver_address
                    inputs.relayer_fee_amount,         // [7] relayer_fee_amount
                    inputs.is_tl_swap ? '1' : '0',    // [8] is_tl_swap (bool as 0/1)
                    publicInputsArray[4],              // [9] new_commitment.x
                    publicInputsArray[5],              // [10] new_commitment.y
                    publicInputsArray[6],              // [11] new_nonce_commitment
                    publicInputsArray[7],              // [12] encryptedBalance
                    publicInputsArray[8],              // [13] encryptedNullifier
                    publicInputsArray[9],              // [14] nonce_discovery_entry.x
                    publicInputsArray[10],             // [15] nonce_discovery_entry.y
                    '0',                               // [16] tl_hashchain (placeholder - will be computed by circuit)
                    inputs.is_tl_swap ? '0' : inputs.amount, // [17] final_amount (0 if tl_swap, else amount)
                ];
            } else if (publicInputsArray.length === 15) {
                // Check if order is correct
                const valueAt4 = publicInputsArray[4];
                const expectedRootBigInt = BigInt(inputs.expected_root);
                const valueAt4BigInt = typeof valueAt4 === 'bigint' ? valueAt4 : BigInt(valueAt4);
                const isExpectedRootAt4 = valueAt4BigInt === expectedRootBigInt;

                if (isExpectedRootAt4) {
                    // Insert is_tl_swap, tl_hashchain, and final_amount
                    reorderedInputs = [
                        ...publicInputsArray.slice(0, 8),  // [0-7] public inputs
                        inputs.is_tl_swap ? '1' : '0',    // [8] is_tl_swap
                        ...publicInputsArray.slice(8),     // [9-14] outputs
                        '0',                               // [15] tl_hashchain (placeholder - will be computed by circuit)
                        inputs.is_tl_swap ? '0' : inputs.amount, // [16] final_amount (0 if tl_swap, else amount)
                    ];
                } else {
                    // Reorder and insert is_tl_swap, tl_hashchain, and final_amount
                    reorderedInputs = [
                        publicInputsArray[0],              // [0] token_address
                        publicInputsArray[1],              // [1] amount
                        publicInputsArray[2],              // [2] chain_id
                        publicInputsArray[3],              // [3] declared_time_reference
                        publicInputsArray[11],             // [4] expected_root
                        publicInputsArray[12],             // [5] arbitrary_calldata_hash
                        publicInputsArray[13],             // [6] receiver_address
                        publicInputsArray[14],             // [7] relayer_fee_amount
                        inputs.is_tl_swap ? '1' : '0',    // [8] is_tl_swap
                        publicInputsArray[4],              // [9] new_commitment.x
                        publicInputsArray[5],              // [10] new_commitment.y
                        publicInputsArray[6],              // [11] new_nonce_commitment
                        publicInputsArray[7],              // [12] encryptedBalance
                        publicInputsArray[8],              // [13] encryptedNullifier
                        publicInputsArray[9],              // [14] nonce_discovery_entry.x
                        publicInputsArray[10],            // [15] nonce_discovery_entry.y
                        '0',                               // [16] tl_hashchain (placeholder - will be computed by circuit)
                        inputs.is_tl_swap ? '0' : inputs.amount, // [17] final_amount (0 if tl_swap, else amount)
                    ];
                }
            } else if (publicInputsArray.length === 17 || publicInputsArray.length === 18) {
                // Circuit returned 17 elements - check the actual order
                // According to the circuit test, the order should be:
                // [0] token_address, [1] chain_id, [2] declared_time_reference, [3] expected_root,
                // [4] arbitrary_calldata_hash, [5] receiver_address, [6] relayer_fee_amount, [7] is_tl_swap,
                // [8] new_commitment.x, [9] new_commitment.y, [10] new_nonce_commitment,
                // [11] encryptedBalance, [12] encryptedNullifier, [13] nonce_discovery_entry.x, [14] nonce_discovery_entry.y,
                // [15] tl_hashchain, [16] final_amount

                // Check if expected_root is at index 3 (correct position)
                const valueAt3 = publicInputsArray[3];
                const expectedRootBigInt = BigInt(inputs.expected_root);
                const valueAt3BigInt = typeof valueAt3 === 'bigint' ? valueAt3 : BigInt(valueAt3);
                const isExpectedRootAt3 = valueAt3BigInt === expectedRootBigInt;

                // Check if is_tl_swap at index 7 is 0 or 1 (correct format)
                const valueAt7 = publicInputsArray[7];
                const valueAt7BigInt = typeof valueAt7 === 'bigint' ? valueAt7 : BigInt(valueAt7);
                const isTlSwapValid = valueAt7BigInt === BigInt(0) || valueAt7BigInt === BigInt(1);

                if (isExpectedRootAt3 && isTlSwapValid && publicInputsArray.length === 17) {
                    // Order is correct, use as-is
                    console.log('✅ Public inputs order is correct, using as-is');
                    reorderedInputs = publicInputsArray;
                } else {
                    // Order is wrong or format is incorrect - need to reorder
                    console.log('⚠️ Public inputs order mismatch or invalid format detected. Reordering...');
                    console.log(`  Expected root at [3]: ${isExpectedRootAt3}`);
                    console.log(`  is_tl_swap at [7] is valid (0 or 1): ${isTlSwapValid}`);
                    console.log(`  Value at [7]: ${valueAt7BigInt.toString()}`);

                    // The circuit returns public inputs in this order (based on Noir's flattening):
                    // Public inputs first: token_address, chain_id, declared_time_reference, expected_root,
                    //                     arbitrary_calldata_hash, receiver_address, relayer_fee_amount, is_tl_swap
                    // Then return value tuple flattened: [new_commitment.x, new_commitment.y, new_nonce_commitment,
                    //                                      encrypted_state_details[0], encrypted_state_details[1],
                    //                                      nonce_discovery_entry.x, nonce_discovery_entry.y, tl_hashchain, final_amount]
                    // So total should be: 8 public inputs + 9 return values = 17 elements

                    // If the order is wrong, try to find where each element actually is
                    // For now, assume the circuit returns in the correct order but maybe with wrong values
                    // Let's use the circuit's return values directly and only fix is_tl_swap if needed
                    reorderedInputs = [...publicInputsArray];

                    // The circuit might be returning values in a different order
                    // Let's check what values we actually have and reconstruct the correct order
                    console.log('  Attempting to identify values by checking against expected inputs...');

                    // Find where each expected value might be
                    const expectedRelayerFee = BigInt(inputs.relayer_fee_amount);
                    const expectedReceiverAddress = BigInt(inputs.receiver_address);

                    // Try to find the correct positions
                    let relayerFeeIndex = -1;
                    let receiverAddressIndex = -1;

                    for (let i = 0; i < publicInputsArray.length; i++) {
                        const val = typeof publicInputsArray[i] === 'bigint' ? publicInputsArray[i] : BigInt(publicInputsArray[i]);
                        if (val === expectedRelayerFee) {
                            relayerFeeIndex = i;
                        }
                        if (val === expectedReceiverAddress) {
                            receiverAddressIndex = i;
                        }
                    }

                    console.log(`  Found relayer_fee_amount at index: ${relayerFeeIndex}`);
                    console.log(`  Found receiver_address at index: ${receiverAddressIndex}`);

                    // Based on the test file, the correct order should be:
                    // [0] token_address, [1] chain_id, [2] declared_time_reference, [3] expected_root,
                    // [4] arbitrary_calldata_hash, [5] receiver_address, [6] relayer_fee_amount, [7] is_tl_swap,
                    // [8-16] outputs...
                    // But if the circuit returns them in a different order, we need to reorder

                    // For now, let's assume the first 8 are public inputs (but maybe in wrong order)
                    // and the last 9 are outputs (but maybe in wrong order)
                    // We'll reconstruct based on what we know

                    // Reconstruct in the correct order that the contract expects
                    reorderedInputs = [
                        publicInputsArray[0],              // [0] token_address (should be correct)
                        publicInputsArray[1],              // [1] chain_id (should be correct)
                        publicInputsArray[2],              // [2] declared_time_reference (should be correct)
                        publicInputsArray[3],              // [3] expected_root (should be correct)
                        typeof inputs.arbitrary_calldata_hash === 'string' ? inputs.arbitrary_calldata_hash : `0x${BigInt(inputs.arbitrary_calldata_hash).toString(16).padStart(64, '0')}`, // [4] arbitrary_calldata_hash
                        typeof inputs.receiver_address === 'string' ? inputs.receiver_address : `0x${BigInt(inputs.receiver_address).toString(16).padStart(64, '0')}`, // [5] receiver_address
                        typeof inputs.relayer_fee_amount === 'string' ? inputs.relayer_fee_amount : `0x${BigInt(inputs.relayer_fee_amount).toString(16).padStart(64, '0')}`, // [6] relayer_fee_amount (use from inputs, not from circuit)
                        inputs.is_tl_swap ? '1' : '0',    // [7] is_tl_swap (use from inputs)
                        publicInputsArray[4] || '0',       // [8] new_commitment.x (from circuit output)
                        publicInputsArray[5] || '0',       // [9] new_commitment.y (from circuit output)
                        publicInputsArray[6] || '0',       // [10] new_nonce_commitment (from circuit output)
                        publicInputsArray[7] || '0',       // [11] encryptedBalance (from circuit output)
                        publicInputsArray[8] || '0',       // [12] encryptedNullifier (from circuit output)
                        publicInputsArray[9] || '0',       // [13] nonce_discovery_entry.x (from circuit output)
                        publicInputsArray[10] || '0',      // [14] nonce_discovery_entry.y (from circuit output)
                        publicInputsArray[15] || '0',      // [15] tl_hashchain (from circuit output, should be at index 15)
                        inputs.is_tl_swap ? '0' : inputs.amount, // [16] final_amount (use from inputs, not from circuit - this is the key fix!)
                    ];

                    console.log('  ✅ Reconstructed public inputs using values from inputs object for relayer_fee_amount and final_amount');
                }
            } else {
                throw new Error(`Unexpected number of public inputs: ${publicInputsArray.length}. Expected 11, 15, 17, or 18.`);
            }

            const publicInputsHex = reorderedInputs.map((input: any, index: number) => {
                if (input === undefined || input === null) {
                    throw new Error(`Public input at index ${index} is undefined or null.`);
                }

                if (typeof input === 'string' && input.startsWith('0x')) {
                    return input;
                }
                if (typeof input === 'bigint') {
                    return `0x${input.toString(16).padStart(64, '0')}`;
                }
                try {
                    const hex = BigInt(input).toString(16);
                    return `0x${hex.padStart(64, '0')}`;
                } catch (error) {
                    throw new Error(`Failed to convert public input at index ${index} to BigInt: ${input}`);
                }
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

    // Handle withdraw transaction
    const handleWithdraw = async () => {
        if (!proof || !publicInputs || publicInputs.length === 0) {
            setTxError('Proof and public inputs are required');
            return;
        }
        if (!address) {
            setTxError('Please connect your wallet first');
            return;
        }

        try {
            setIsSubmitting(true);
            setTxError(null);
            setTxHash(null);

            const proofBytes = `0x${proof}`;
            const slicedInputs = publicInputs.slice(0, 17); // Contract expects exactly 17 public inputs (8 inputs + 9 outputs including is_tl_swap, tl_hashchain, and final_amount)

            // Prepare calldata for contract call (empty bytes if not provided)
            let callDataBytes: `0x${string}`;
            if (arbitraryCalldata && arbitraryCalldata.trim() !== '') {
                callDataBytes = (arbitraryCalldata.startsWith('0x') ? arbitraryCalldata : `0x${arbitraryCalldata}`) as `0x${string}`;
            } else {
                callDataBytes = '0x' as `0x${string}`;
            }

            const publicInputsBytes32 = slicedInputs.map((input: string) => {
                const hex = input.startsWith('0x') ? input.slice(2) : input;
                return `0x${hex.padStart(64, '0')}` as `0x${string}`;
            });

            // Log all parameters in order with names for debugging
            console.log('📋 Withdraw transaction parameters (in order, as sent to contract):');
            console.log(`[0] token_address: ${publicInputsBytes32[0]}`);
            console.log(`[1] chain_id: ${publicInputsBytes32[1]}`);
            console.log(`[2] declared_time_reference: ${publicInputsBytes32[2]}`);
            console.log(`[3] expected_root: ${publicInputsBytes32[3]}`);
            console.log(`[4] arbitrary_calldata_hash: ${publicInputsBytes32[4]}`);
            console.log(`[5] receiver_address: ${publicInputsBytes32[5]}`);
            console.log(`[6] relayer_fee_amount: ${publicInputsBytes32[6]}`);
            console.log(`[7] is_tl_swap: ${publicInputsBytes32[7]}`);
            console.log(`[8] pedersenCommitmentX: ${publicInputsBytes32[8]}`);
            console.log(`[9] pedersenCommitmentY: ${publicInputsBytes32[9]}`);
            console.log(`[10] newNonceCommitment: ${publicInputsBytes32[10]}`);
            console.log(`[11] encryptedBalance: ${publicInputsBytes32[11]}`);
            console.log(`[12] encryptedNullifier: ${publicInputsBytes32[12]}`);
            console.log(`[13] nonceDiscoveryEntryX: ${publicInputsBytes32[13]}`);
            console.log(`[14] nonceDiscoveryEntryY: ${publicInputsBytes32[14]}`);
            console.log(`[15] tlHashchain: ${publicInputsBytes32[15]}`);
            console.log(`[16] finalAmount: ${publicInputsBytes32[16]}`);
            console.log('');
            console.log('📊 Raw publicInputs array (before processing):');
            console.log(`  Length: ${publicInputs.length}`);
            console.log(`  First 5: ${publicInputs.slice(0, 5).map((p, i) => `[${i}]=${p}`).join(', ')}`);
            console.log('');

            if (!publicClient) {
                setTxError('Public client not available');
                setIsSubmitting(false);
                return;
            }

            // Simulate transaction first to catch errors
            setIsSimulating(true);
            try {
                const simResult = await publicClient.simulateContract({
                    account: address as `0x${string}`,
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'withdraw',
                    args: [proofBytes as `0x${string}`, publicInputsBytes32 as readonly `0x${string}`[], callDataBytes],
                });

                console.log('✅ Simulation successful!');
                console.log('📊 Simulation result:', simResult);
                setSimulationResult(simResult);

            } catch (simulationError: any) {
                let errorMessage = 'Transaction simulation failed';
                if (simulationError?.shortMessage) {
                    errorMessage = simulationError.shortMessage;
                } else if (simulationError?.message) {
                    errorMessage = simulationError.message;
                }

                // Check if this is an Anvil historical state error (common with fork mode)
                const isHistoricalStateError = errorMessage.includes('historical state') ||
                    errorMessage.includes('not available') ||
                    errorMessage.includes('-32000');

                if (isHistoricalStateError) {
                    console.warn('⚠️ Simulation failed due to Anvil historical state issue (fork mode). Proceeding with transaction anyway.');
                    console.warn('   This is a known issue with Anvil fork mode and does not indicate a problem with your transaction.');
                    setSimulationResult(null);
                } else {
                    console.error('❌ Simulation failed:', simulationError);
                    console.error('Full error object:', JSON.stringify(simulationError, null, 2));
                    console.error('Error message:', errorMessage);
                    console.warn('⚠️ Simulation failed, but proceeding with transaction. If transaction fails, check the error above.');
                    setSimulationResult(null);
                }
            } finally {
                setIsSimulating(false);
            }

            // Send transaction
            writeContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'withdraw',
                args: [proofBytes as `0x${string}`, publicInputsBytes32 as readonly `0x${string}`[], callDataBytes],
            });

        } catch (error) {
            console.error('Error in handleWithdraw:', error);
            setTxError(error instanceof Error ? error.message : 'Failed to process transaction');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden relative">
            {/* Subtle ambient glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] pointer-events-none overflow-hidden"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.06) 0%, transparent 60%)"
                }}
            />

            <div className="max-w-2xl mx-auto relative z-10 w-full">
                {/* Section header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
                        <span className="text-primary/50 text-sm">◈</span>
                        <span className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.2em] uppercase">
                            The Withdrawal Ritual
                        </span>
                        <span className="text-primary/50 text-sm">◈</span>
                        <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
                    </div>
                    <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wider mb-4">
                        WITHDRAW
                    </h1>
                    <p className="font-mono text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Withdraw your private balance to a public address.
                        This ritual reveals your hidden tokens to the void.
                    </p>
                </div>

                {/* Main Card */}
                <div className="relative group w-full min-w-0">
                    {/* Corner sigils */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-primary/30 transition-all duration-500" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-primary/30 transition-all duration-500" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-primary/30 transition-all duration-500" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-primary/30 transition-all duration-500" />

                    {/* Ethereal border */}
                    <div
                        className="absolute inset-0 border border-primary/10 transition-all duration-700"
                        style={{
                            boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)"
                        }}
                    />

                    <Card className="relative bg-card/60 backdrop-blur-sm border-0 w-full min-w-0">
                        <CardHeader className="border-b border-border/30 bg-card/40 py-4 px-4 sm:px-6 mb-4">
                            <div className="flex items-center gap-3 justify-center mb-2">
                                <span className="text-primary/60 text-sm">✧</span>
                                <CardTitle className="text-center text-base sm:text-xl font-sans tracking-wider uppercase" style={{ textShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}>
                                    WITHDRAW
                                </CardTitle>
                                <span className="text-primary/60 text-sm">✧</span>
                            </div>
                            <CardDescription className="text-center text-xs sm:text-sm font-mono text-muted-foreground tracking-wider">
                                WITHDRAW TO PUBLIC ADDRESS
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-6 w-full">
                            <div className="space-y-4 w-full">
                                {/* Sign message button */}
                                {!zkAddress && (
                                    <SpellButton
                                        onClick={handleSign}
                                        disabled={isLoading || isSigning}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {isLoading || isSigning ? 'SIGNING...' : 'SIGN MESSAGE FOR ARKANA NETWORK ACCESS'}
                                    </SpellButton>
                                )}

                                {/* Error message */}
                                {error && (
                                    <div className="relative border border-destructive/30 bg-card/40 backdrop-blur-sm p-4 rounded-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-destructive/60 text-sm">✗</span>
                                            <p className="text-sm font-mono text-destructive uppercase tracking-wider">{error}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Form - Show if zkAddress exists */}
                                {zkAddress && (
                                    <div className="relative group w-full min-w-0">
                                        {/* Corner sigils */}
                                        <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary/30" />
                                        <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-primary/30" />
                                        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-primary/30" />
                                        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary/30" />

                                        <Card className="relative border border-primary/10 bg-card/40 backdrop-blur-sm border-0 w-full min-w-0">
                                            <CardHeader className="border-b border-border/30 bg-card/30 py-3 px-4 sm:px-5 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-primary/60 text-xs">◈</span>
                                                    <CardTitle className="text-xs sm:text-sm font-sans uppercase tracking-wider">
                                                        WITHDRAW DETAILS
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {/* Token Address Input */}
                                                    <div className="w-full">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1 sm:mb-2">
                                                            <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider">
                                                                TOKEN ADDRESS
                                                            </label>
                                                            <Button
                                                                type="button"
                                                                onClick={() => setShowTokenSelector(true)}
                                                                className="text-xs px-3 py-1.5 h-auto bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 font-mono uppercase transition-all duration-300 whitespace-nowrap shrink-0"
                                                                style={{ boxShadow: "0 0 10px rgba(0, 255, 136, 0.1)" }}
                                                            >
                                                                {isLoadingTokens ? 'LOADING...' : `SELECT FROM AAVE (${aaveTokens.length})`}
                                                            </Button>
                                                        </div>
                                                        <Input
                                                            type="text"
                                                            value={tokenAddress}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const normalized = value.toLowerCase();
                                                                setTokenAddress(normalized);
                                                            }}
                                                            placeholder="0x..."
                                                            className="text-xs sm:text-sm w-full"
                                                        />
                                                        {tokenName && tokenSymbol && (
                                                            <p className="text-[10px] font-mono text-accent text-right mt-1" style={{ textShadow: "0 0 8px rgba(0, 255, 136, 0.3)" }}>
                                                                {tokenName} ({tokenSymbol})
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Amount Input */}
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">
                                                            WITHDRAW AMOUNT {tokenDecimals !== null ? `(${tokenDecimals} decimals)` : ''}
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            value={amount}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '') {
                                                                    setAmount('');
                                                                    return;
                                                                }
                                                                const normalizedValue = value.replace(',', '.');
                                                                if (tokenDecimals !== null && tokenDecimals >= 0) {
                                                                    const parts = normalizedValue.split('.');
                                                                    if (parts.length === 1) {
                                                                        if (/^\d+$/.test(parts[0]) || parts[0] === '') {
                                                                            setAmount(normalizedValue);
                                                                        }
                                                                    } else if (parts.length === 2) {
                                                                        const integerPart = parts[0];
                                                                        const decimalPart = parts[1];
                                                                        if ((integerPart === '' || /^\d+$/.test(integerPart)) &&
                                                                            (decimalPart === '' || /^\d+$/.test(decimalPart))) {
                                                                            if (decimalPart.length <= tokenDecimals) {
                                                                                setAmount(normalizedValue);
                                                                            } else {
                                                                                const truncatedDecimal = decimalPart.slice(0, tokenDecimals);
                                                                                setAmount(integerPart + '.' + truncatedDecimal);
                                                                            }
                                                                        }
                                                                    }
                                                                } else {
                                                                    if (/^\d*\.?\d*$/.test(normalizedValue)) {
                                                                        setAmount(normalizedValue);
                                                                    }
                                                                }
                                                            }}
                                                            placeholder={
                                                                tokenDecimals !== null
                                                                    ? `e.g., 1.5 (max ${tokenDecimals} decimals)`
                                                                    : "Enter amount (supports . or , as decimal separator)"
                                                            }
                                                            className="text-xs sm:text-sm w-full"
                                                        />
                                                    </div>

                                                    {/* Receiver Address Input */}
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">
                                                            RECEIVER ADDRESS
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            value={receiverAddress}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                const normalized = value.toLowerCase();
                                                                setReceiverAddress(normalized);
                                                            }}
                                                            placeholder="0x..."
                                                            className="text-xs sm:text-sm w-full"
                                                        />
                                                    </div>

                                                    {/* Receiver Fee Amount Input */}
                                                    <div>
                                                        <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">
                                                            RELAYER FEE AMOUNT {tokenDecimals !== null ? `(${tokenDecimals} decimals)` : ''}
                                                        </label>
                                                        <Input
                                                            type="text"
                                                            value={receiverFeeAmount}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '') {
                                                                    setReceiverFeeAmount('');
                                                                    return;
                                                                }
                                                                const normalizedValue = value.replace(',', '.');
                                                                if (tokenDecimals !== null && tokenDecimals >= 0) {
                                                                    const parts = normalizedValue.split('.');
                                                                    if (parts.length === 1) {
                                                                        if (/^\d+$/.test(parts[0]) || parts[0] === '') {
                                                                            setReceiverFeeAmount(normalizedValue);
                                                                        }
                                                                    } else if (parts.length === 2) {
                                                                        const integerPart = parts[0];
                                                                        const decimalPart = parts[1];
                                                                        if ((integerPart === '' || /^\d+$/.test(integerPart)) &&
                                                                            (decimalPart === '' || /^\d+$/.test(decimalPart))) {
                                                                            if (decimalPart.length <= tokenDecimals) {
                                                                                setReceiverFeeAmount(normalizedValue);
                                                                            } else {
                                                                                const truncatedDecimal = decimalPart.slice(0, tokenDecimals);
                                                                                setReceiverFeeAmount(integerPart + '.' + truncatedDecimal);
                                                                            }
                                                                        }
                                                                    }
                                                                } else {
                                                                    if (/^\d*\.?\d*$/.test(normalizedValue)) {
                                                                        setReceiverFeeAmount(normalizedValue);
                                                                    }
                                                                }
                                                            }}
                                                            placeholder={
                                                                tokenDecimals !== null
                                                                    ? `e.g., 0.01 (max ${tokenDecimals} decimals)`
                                                                    : "Enter relayer fee amount"
                                                            }
                                                            className="text-xs sm:text-sm w-full"
                                                        />
                                                    </div>

                                                    {/* Arbitrary Calldata Input - Hide when TL Swap is enabled */}
                                                    {!isTlSwap && (
                                                        <div>
                                                            <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider mb-1 sm:mb-2">
                                                                ARBITRARY CALLDATA (HEX, OPTIONAL)
                                                            </label>
                                                            <Input
                                                                type="text"
                                                                value={arbitraryCalldata}
                                                                onChange={(e) => setArbitraryCalldata(e.target.value)}
                                                                placeholder="0x..."
                                                                className="text-xs sm:text-sm w-full"
                                                            />
                                                            {arbitraryCalldata && arbitraryCalldata.trim() !== '' && (
                                                                <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">
                                                                    Hash (31 bytes): {arbitraryCalldataHash}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* TL Swap Checkbox */}
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="isTlSwap"
                                                            checked={isTlSwap}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setIsTlSwap(checked);
                                                                // Clear arbitrary calldata when TL Swap is enabled
                                                                if (checked) {
                                                                    setArbitraryCalldata('');
                                                                    setArbitraryCalldataHash('0x0');
                                                                }
                                                            }}
                                                            className="w-4 h-4 rounded border-primary/50 bg-card/40 text-primary focus:ring-primary/50"
                                                        />
                                                        <label htmlFor="isTlSwap" className="text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider cursor-pointer">
                                                            TL SWAP MODE
                                                        </label>
                                                    </div>

                                                    {/* TL Swap Order Composition (only show if isTlSwap is true) */}
                                                    {isTlSwap && (
                                                        <div className="space-y-4 border border-primary/20 bg-card/20 backdrop-blur-sm p-4 rounded-sm">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <label className="block text-xs sm:text-sm font-sans font-bold text-foreground uppercase tracking-wider">
                                                                    COMPOSE TIMELOCK ORDERS
                                                                </label>
                                                                <div className="flex items-center gap-2">
                                                                    <label className="text-[10px] font-mono text-muted-foreground">
                                                                        Number of Orders:
                                                                    </label>
                                                                    <select
                                                                        value={numOrders}
                                                                        onChange={(e) => {
                                                                            const newNum = parseInt(e.target.value);
                                                                            setNumOrders(newNum);
                                                                            // Adjust tlOrders array
                                                                            const newOrders = [...tlOrders];
                                                                            if (newNum > tlOrders.length) {
                                                                                // Add new orders
                                                                                for (let i = tlOrders.length; i < newNum; i++) {
                                                                                    newOrders.push({
                                                                                        sharesAmount: '',
                                                                                        amountOutMin: '',
                                                                                        targetRound: '',
                                                                                        deadline: '',
                                                                                        recipient: address || '',
                                                                                        tokenOut: '',
                                                                                        slippageBps: '50',
                                                                                        executionFeeBps: '10'
                                                                                    });
                                                                                }
                                                                            } else {
                                                                                // Remove excess orders
                                                                                newOrders.splice(newNum);
                                                                            }
                                                                            setTlOrders(newOrders);
                                                                        }}
                                                                        className="text-xs bg-card/60 border border-primary/30 rounded px-2 py-1 text-foreground"
                                                                    >
                                                                        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                                                                            <option key={n} value={n}>{n}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>

                                                            {/* Current Round Info */}
                                                            <div className="bg-primary/10 border border-primary/20 p-2 rounded text-[10px] font-mono text-muted-foreground">
                                                                Current dRand Round: {getCurrentRound()} | Round Period: 3 seconds
                                                            </div>

                                                            {/* Order Forms */}
                                                            <div className="space-y-4">
                                                                {tlOrders.slice(0, numOrders).map((order, index) => (
                                                                    <div key={index} className="border border-primary/10 bg-card/40 p-3 rounded-sm space-y-2">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h4 className="text-xs font-sans font-bold text-foreground uppercase tracking-wider">
                                                                                Order {index + 1}
                                                                            </h4>
                                                                            {order.targetRound && (
                                                                                <span className="text-[10px] font-mono text-muted-foreground">
                                                                                    Unlocks: {new Date(getRoundTimestamp(parseInt(order.targetRound)) * 1000).toLocaleString()}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="space-y-3">
                                                                            {/* Shares Amount - Full width */}
                                                                            <div>
                                                                                <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                    Shares Amount {tokenDecimals !== null ? `(${tokenDecimals} decimals)` : ''}
                                                                                </label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={order.sharesAmount}
                                                                                    onChange={(e) => {
                                                                                        const newOrders = [...tlOrders];
                                                                                        newOrders[index].sharesAmount = e.target.value;
                                                                                        setTlOrders(newOrders);
                                                                                    }}
                                                                                    placeholder="0"
                                                                                    className="text-xs w-full"
                                                                                />
                                                                            </div>

                                                                            {/* Token Out and Min Amount Out - Same line */}
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                <div>
                                                                                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                        Token Out Address
                                                                                    </label>
                                                                                    <Input
                                                                                        type="text"
                                                                                        value={order.tokenOut}
                                                                                        onChange={(e) => {
                                                                                            const newOrders = [...tlOrders];
                                                                                            newOrders[index].tokenOut = e.target.value;
                                                                                            setTlOrders(newOrders);
                                                                                        }}
                                                                                        placeholder="0x..."
                                                                                        className="text-xs w-full font-mono"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                        Min Amount Out
                                                                                    </label>
                                                                                    <Input
                                                                                        type="text"
                                                                                        value={order.amountOutMin}
                                                                                        onChange={(e) => {
                                                                                            const newOrders = [...tlOrders];
                                                                                            newOrders[index].amountOutMin = e.target.value;
                                                                                            setTlOrders(newOrders);
                                                                                        }}
                                                                                        placeholder="0"
                                                                                        className="text-xs w-full"
                                                                                    />
                                                                                    <p className="text-[9px] font-mono text-muted-foreground/60 mt-1">
                                                                                        Minimum tokens to receive
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Round Drand and Deadline - Same line */}
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                <div>
                                                                                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                        Round Drand
                                                                                    </label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={order.targetRound}
                                                                                        onChange={(e) => {
                                                                                            const newOrders = [...tlOrders];
                                                                                            newOrders[index].targetRound = e.target.value;
                                                                                            setTlOrders(newOrders);
                                                                                        }}
                                                                                        placeholder={`${getCurrentRound() + 1000}`}
                                                                                        className="text-xs w-full"
                                                                                    />
                                                                                    <p className="text-[9px] font-mono text-muted-foreground/60 mt-1">
                                                                                        Current: {getCurrentRound()}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                        Deadline (Unix timestamp)
                                                                                    </label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={order.deadline}
                                                                                        onChange={(e) => {
                                                                                            const newOrders = [...tlOrders];
                                                                                            newOrders[index].deadline = e.target.value;
                                                                                            setTlOrders(newOrders);
                                                                                        }}
                                                                                        placeholder={`${Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)}`}
                                                                                        className="text-xs w-full"
                                                                                    />
                                                                                    {order.deadline && (
                                                                                        <p className="text-[9px] font-mono text-muted-foreground/60 mt-1">
                                                                                            {new Date(parseInt(order.deadline) * 1000).toLocaleString()}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Slippage and Pool Fee - Same line */}
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                                <div>
                                                                                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                        Slippage (basis points)
                                                                                    </label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={order.slippageBps}
                                                                                        onChange={(e) => {
                                                                                            const newOrders = [...tlOrders];
                                                                                            newOrders[index].slippageBps = e.target.value;
                                                                                            setTlOrders(newOrders);
                                                                                        }}
                                                                                        placeholder="50"
                                                                                        className="text-xs w-full"
                                                                                    />
                                                                                    <p className="text-[9px] font-mono text-muted-foreground/60 mt-1">
                                                                                        {order.slippageBps ? `${(parseFloat(order.slippageBps) / 100).toFixed(2)}%` : '0.5% = 50 bps'}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                        Pool Fee (basis points)
                                                                                    </label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        value={order.executionFeeBps}
                                                                                        onChange={(e) => {
                                                                                            const newOrders = [...tlOrders];
                                                                                            newOrders[index].executionFeeBps = e.target.value;
                                                                                            setTlOrders(newOrders);
                                                                                        }}
                                                                                        placeholder="10"
                                                                                        className="text-xs w-full"
                                                                                    />
                                                                                    <p className="text-[9px] font-mono text-muted-foreground/60 mt-1">
                                                                                        {order.executionFeeBps ? `${(parseFloat(order.executionFeeBps) / 100).toFixed(2)}%` : '0.1% = 10 bps'}
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Recipient - Full width */}
                                                                            <div>
                                                                                <label className="block text-[10px] font-mono text-muted-foreground mb-1">
                                                                                    Recipient Address
                                                                                </label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={order.recipient}
                                                                                    onChange={(e) => {
                                                                                        const newOrders = [...tlOrders];
                                                                                        newOrders[index].recipient = e.target.value;
                                                                                        setTlOrders(newOrders);
                                                                                    }}
                                                                                    placeholder="0x..."
                                                                                    className="text-xs w-full font-mono"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Validation: Sum of shares amounts must equal withdrawal amount */}
                                                            {isTlSwap && amount && (
                                                                <div className="mt-3 p-2 rounded border border-primary/20 bg-card/40">
                                                                    {(() => {
                                                                        const totalShares = tlOrders.slice(0, numOrders).reduce((sum, order) => {
                                                                            const shares = parseFloat(order.sharesAmount || '0');
                                                                            return sum + (isNaN(shares) ? 0 : shares);
                                                                        }, 0);
                                                                        const withdrawalAmount = parseFloat(amount || '0');
                                                                        const difference = Math.abs(totalShares - withdrawalAmount);
                                                                        const isValid = difference < 0.0001; // Allow small floating point differences

                                                                        return (
                                                                            <div className="space-y-1">
                                                                                <div className="flex items-center justify-between text-[10px] font-mono">
                                                                                    <span className="text-muted-foreground">Total Shares (Orders):</span>
                                                                                    <span className={isValid ? "text-green-400" : "text-destructive"}>{totalShares.toFixed(6)}</span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between text-[10px] font-mono">
                                                                                    <span className="text-muted-foreground">Withdrawal Amount:</span>
                                                                                    <span>{withdrawalAmount.toFixed(6)}</span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between text-[10px] font-mono">
                                                                                    <span className="text-muted-foreground">Difference:</span>
                                                                                    <span className={isValid ? "text-green-400" : "text-destructive"}>
                                                                                        {difference < 0.0001 ? "✓ Match" : `${difference.toFixed(6)}`}
                                                                                    </span>
                                                                                </div>
                                                                                {!isValid && (
                                                                                    <p className="text-[9px] font-mono text-destructive mt-1">
                                                                                        ⚠ Sum of order shares must equal withdrawal amount!
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}

                                                            <p className="text-[10px] font-mono text-muted-foreground/60 mt-2">
                                                                Note: Orders will be encrypted in a nested chain. The first order contains all subsequent orders.
                                                                Sum of shares amounts must equal your total withdraw amount exactly.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Proof Error */}
                                                    {proofError && (
                                                        <div className="relative border border-destructive/30 bg-card/40 backdrop-blur-sm p-4 rounded-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-destructive/60 text-sm">✗</span>
                                                                <p className="text-sm font-mono text-destructive uppercase tracking-wider">{proofError}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Discovery Status */}
                                                    {(isDiscoveringToken || isLoadingUserKey) && (
                                                        <div className="relative border border-primary/30 bg-card/40 backdrop-blur-sm p-3 sm:p-4 rounded-sm">
                                                            <div className="flex items-center gap-3">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                                                                <p className="text-xs sm:text-sm font-mono text-primary uppercase tracking-wider">
                                                                    {isLoadingUserKey
                                                                        ? 'SYNCING ACCOUNT DATA...'
                                                                        : 'DISCOVERING TOKEN BALANCES...'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {discoveryError && (
                                                        <div className="relative border border-destructive/30 bg-card/40 backdrop-blur-sm p-3 sm:p-4 rounded-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-destructive/60 text-sm">✗</span>
                                                                <p className="text-xs sm:text-sm font-mono text-destructive uppercase tracking-wider">
                                                                    DISCOVERY ERROR: {discoveryError}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Generate Proof / Withdraw Button */}
                                                    <SpellButton
                                                        onClick={proof ? handleWithdraw : proveWithdraw}
                                                        disabled={Boolean(
                                                            proof
                                                                ? isPending || isConfirming || isSubmitting || isSimulating || !publicInputs.length
                                                                : isProving || isInitializing || isCalculatingInputs || isDiscoveringToken || isLoadingUserKey || !tokenAddress || !amount || !receiverAddress || !receiverFeeAmount || tokenNonce === null || !zkAddress || (!contextUserKey && !account?.signature)
                                                        )}
                                                        variant="primary"
                                                        className="w-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {proof
                                                            ? isSimulating
                                                                ? 'SIMULATING TRANSACTION...'
                                                                : isSubmitting
                                                                    ? 'PREPARING TRANSACTION...'
                                                                    : isConfirming
                                                                        ? 'CONFIRMING TRANSACTION...'
                                                                        : 'WITHDRAW ON ARKANA'
                                                            : isDiscoveringToken
                                                                ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                                                                        DISCOVERING TOKEN...
                                                                    </span>
                                                                )
                                                                : isCalculatingInputs
                                                                    ? (
                                                                        <span className="flex items-center gap-2">
                                                                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                                                                            CALCULATING INPUTS...
                                                                        </span>
                                                                    )
                                                                    : isProving
                                                                        ? `GENERATING PROOF...${provingTime ? ` (${provingTime}MS)` : ''}`
                                                                        : isInitializing
                                                                            ? 'INITIALIZING BACKEND...'
                                                                            : tokenNonce === null
                                                                                ? 'WAITING FOR TOKEN DISCOVERY...'
                                                                                : !zkAddress || (!contextUserKey && !account?.signature)
                                                                                    ? 'PLEASE SIGN MESSAGE FIRST'
                                                                                    : 'GENERATE WITHDRAW PROOF'}
                                                    </SpellButton>

                                                    {/* Transaction Status */}
                                                    {txHash && (
                                                        <div className="mt-2 sm:mt-3 relative border border-primary/20 bg-card/40 backdrop-blur-sm p-3 sm:p-4 rounded-sm">
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0">
                                                                <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider">TX HASH:</span>
                                                                <a
                                                                    href={`#`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs sm:text-sm font-mono text-primary hover:text-primary/70 underline break-all transition-colors"
                                                                    style={{ textShadow: "0 0 5px rgba(139, 92, 246, 0.3)" }}
                                                                >
                                                                    {txHash.slice(0, 12)}...{txHash.slice(-6)}
                                                                </a>
                                                            </div>
                                                            {isConfirming && (
                                                                <p className="text-[10px] sm:text-xs font-mono text-muted-foreground mt-1 uppercase tracking-wider">
                                                                    WAITING FOR CONFIRMATION...
                                                                </p>
                                                            )}
                                                            {isConfirmed && (
                                                                <p className="text-[10px] sm:text-xs font-mono text-accent font-bold mt-1 uppercase tracking-wider" style={{ textShadow: "0 0 8px rgba(0, 255, 136, 0.3)" }}>
                                                                    [CONFIRMED]
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Decorative divider */}
                <div className="w-full max-w-4xl mx-auto mt-12 px-4 sm:px-8">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                        <span className="text-primary/30 text-lg">✧</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
                    </div>
                </div>
            </div>

            <TransactionModal
                isOpen={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                isProving={isProving}
                isPending={isPending || isSubmitting}
                isConfirming={isConfirming}
                isConfirmed={isConfirmed}
                txHash={txHash}
                error={txError || proofError || null}
                transactionType="WITHDRAW"
            />

            {/* Token Selector Modal */}
            <Dialog open={showTokenSelector} onOpenChange={setShowTokenSelector}>
                <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col bg-card/95 backdrop-blur-sm border-primary/30 mx-auto">
                    <DialogHeader className="pb-3">
                        <DialogTitle className="text-center text-sm sm:text-base font-sans tracking-wider uppercase" style={{ textShadow: "0 0 20px rgba(139, 92, 246, 0.3)" }}>
                            SELECT TOKEN
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto mt-2">
                        {isLoadingTokens ? (
                            <p className="text-[10px] font-mono text-muted-foreground text-center py-6">Loading Aave tokens...</p>
                        ) : aaveTokens.length === 0 ? (
                            <p className="text-[10px] font-mono text-muted-foreground text-center py-6">No Aave tokens available</p>
                        ) : (
                            <div className="space-y-1 pr-1">
                                {aaveTokens.map((token) => (
                                    <button
                                        key={token.address}
                                        type="button"
                                        onClick={async () => {
                                            setTokenAddress(token.address.toLowerCase());
                                            setShowTokenSelector(false);
                                            // Discovery will be triggered automatically by useEffect
                                        }}
                                        className="w-full text-left px-3 py-2 hover:bg-secondary/50 border border-transparent hover:border-accent/30 rounded transition-all duration-300"
                                        style={{
                                            boxShadow: "0 0 0 0 rgba(0, 255, 136, 0)",
                                            transition: "all 0.3s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = "0 0 8px rgba(0, 255, 136, 0.15)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = "0 0 0 0 rgba(0, 255, 136, 0)";
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-mono text-foreground font-bold">{token.symbol}</p>
                                                <p className="text-[10px] font-mono text-muted-foreground">{token.name} ({token.decimals} decimals)</p>
                                            </div>
                                            <p className="text-[10px] font-mono text-accent">{token.address.slice(0, 6)}...{token.address.slice(-4)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

