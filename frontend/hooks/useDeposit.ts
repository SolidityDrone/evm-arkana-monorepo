'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useChainId } from 'wagmi';
import { useAccount as useAccountContext, useZkAddress } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { createPublicClient, http, parseAbi, Address } from 'viem';
import { getActiveChain, getChainById, getRpcUrlForChain } from '@/config';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { useNonceDiscovery } from '@/hooks/useNonceDiscovery';
import { loadAccountData, saveTokenAccountData, CommitmentState } from '@/lib/indexeddb';
import { convertAssetsToShares } from '@/lib/shares-to-assets';
import { computePrivateKeyFromSignature, getSpendingKeyCircuit, getViewKeyFromUserKey, poseidonHash } from '@/lib/circuit-utils';
import { getSignerIdentityFromUserKey } from '@/lib/eddsa-circuit';
import { loadTwoFactorData } from '@/lib/indexeddb';
import { proveWithSnarkjs } from '@/lib/circuit-prove';
import type { Groth16Args } from '@/lib/groth16';
import { padHex } from 'viem';
import { parseZkAddress } from '@/lib/zk-address';

const ERC20_ABI = parseAbi([
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)',
    'function balanceOf(address account) view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
]);

export function useDeposit() {
    const { address, isConnected } = useWagmiAccount();
    const { account } = useAccountContext();
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

    // Nonce discovery hook
    const {
        computeCurrentNonce,
        reconstructPersonalCommitmentState,
        fetchIncomingNotes,
        isComputing,
    } = useNonceDiscovery();

    // State
    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [userKey, setUserKey] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProving, setIsProving] = useState(false);
    const [proof, setProof] = useState<string>('');
    const [proofError, setProofError] = useState<string | null>(null);
    const [provingTime, setProvingTime] = useState<number | null>(null);
    const [currentProvingTime, setCurrentProvingTime] = useState<number>(0);
    const [publicInputs, setPublicInputs] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [txError, setTxError] = useState<string | null>(null);
    const [allowance, setAllowance] = useState<bigint | null>(null);
    const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [tokenBalance, setTokenBalance] = useState<bigint | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [isCalculatingInputs, setIsCalculatingInputs] = useState(false);
    const [tokenCurrentNonce, setTokenCurrentNonce] = useState<bigint | null>(null);
    const [isTokenInitialized, setIsTokenInitialized] = useState<boolean | null>(null);
    const [isCheckingTokenState, setIsCheckingTokenState] = useState(false);
    const [tokenName, setTokenName] = useState<string>('');
    const [tokenSymbol, setTokenSymbol] = useState<string>('');

    const groth16ResultRef = useRef<Groth16Args | null>(null);
    const [groth16Result, setGroth16Result] = useState<Groth16Args | null>(null);

    // Get balanceEntries and currentNonce from context
    const { balanceEntries, currentNonce } = useAccountState();

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

    // Initialize user_key from existing signature when component mounts
    useEffect(() => {
        const initializeFromExisting = async () => {
            if (zkAddress && account?.signature && !userKey && !contextUserKey) {
                try {
                    const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                    setUserKey(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                } catch (error) {
                    console.error('Error computing user_key from existing signature:', error);
                }
            }
            else if (contextUserKey && !userKey) {
                setUserKey('0x' + contextUserKey.toString(16));
            }
        };
        initializeFromExisting();
    }, [zkAddress, account?.signature, userKey, contextUserKey]);

    // Load token decimals and metadata
    useEffect(() => {
        const loadTokenInfo = async () => {
            if (!tokenAddress || !publicClient) {
                setTokenDecimals(null);
                setTokenName('');
                setTokenSymbol('');
                return;
            }

            try {
                const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;
                const [decimals, name, symbol] = await Promise.all([
                    publicClient.readContract({
                        address: tokenAddr,
                        abi: ERC20_ABI,
                        functionName: 'decimals',
                    }),
                    publicClient.readContract({
                        address: tokenAddr,
                        abi: ERC20_ABI,
                        functionName: 'name',
                    }).catch(() => ''),
                    publicClient.readContract({
                        address: tokenAddr,
                        abi: ERC20_ABI,
                        functionName: 'symbol',
                    }).catch(() => ''),
                ]);
                setTokenDecimals(decimals as number);
                setTokenName(name as string);
                setTokenSymbol(symbol as string);
            } catch (error) {
                setTokenDecimals(null);
                setTokenName('');
                setTokenSymbol('');
            }
        };

        loadTokenInfo();
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

    // Check if token is initialized (has nonce) and auto-discover nonce when token is selected
    useEffect(() => {
        const loadTokenNonce = async () => {
            if (!tokenAddress || !zkAddress) {
                setTokenCurrentNonce(null);
                setIsTokenInitialized(null);
                return;
            }

            // Need publicClient and account signature to discover new nonces
            if (!publicClient || !account?.signature) {
                // Fallback to just loading from IndexedDB without discovery
                try {
                    const { loadTokenAccountData } = await import('@/lib/indexeddb');
                    const normalizedTokenAddress = tokenAddress.startsWith('0x') ? tokenAddress.toLowerCase() : '0x' + tokenAddress.toLowerCase();
                    // Deposit uses Mage mode (base user_key)
                    const tokenData = await loadTokenAccountData(zkAddress, normalizedTokenAddress, 'mage');

                    if (tokenData && tokenData.currentNonce !== null && tokenData.currentNonce !== undefined && tokenData.currentNonce > BigInt(0)) {
                        setTokenCurrentNonce(tokenData.currentNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                } catch (error) {
                    setTokenCurrentNonce(null);
                    setIsTokenInitialized(false);
                }
                return;
            }

            // Normalize token address for comparison
            const normalizedTokenAddress = tokenAddress.startsWith('0x')
                ? tokenAddress.toLowerCase()
                : '0x' + tokenAddress.toLowerCase();

            // Reset state while checking
            setIsCheckingTokenState(true);
            setIsTokenInitialized(null);

            try {
                // Load cached data from IndexedDB (Mage mode for deposits)
                const cachedData = await loadAccountData(zkAddress);
                const mageTokenData = cachedData?.mageTokenData || [];
                const tokenData = mageTokenData.find(t => {
                    return t.tokenAddress.toLowerCase() === normalizedTokenAddress;
                });

                const cachedNonce = tokenData?.currentNonce || null;
                const cachedBalanceEntries = tokenData?.balanceEntries || [];

                // Use computeCurrentNonce to check if there's a new nonce on-chain
                // This will discover new nonces automatically without requiring AccountModal
                // Deposit uses Mage mode (base user_key)
                const result = await computeCurrentNonce(
                    tokenAddress as `0x${string}`,
                    cachedNonce,
                    cachedBalanceEntries,
                    'mage'
                );

                if (result) {
                    // Save updated token data if it changed (Mage mode)
                    await saveTokenAccountData(zkAddress, tokenAddress, result.currentNonce, result.balanceEntries, 'mage');

                    // Update global balance entries if needed
                    if (result.balanceEntries.length > 0) {
                        setBalanceEntries(result.balanceEntries);
                    }

                    // Check if token is initialized (has a nonce > 0)
                    if (result.currentNonce !== null && result.currentNonce !== undefined && result.currentNonce > BigInt(0)) {
                        setTokenCurrentNonce(result.currentNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                } else {
                    // No result from computeCurrentNonce - check cached data
                    if (cachedNonce !== null && cachedNonce !== undefined && cachedNonce > BigInt(0)) {
                        setTokenCurrentNonce(cachedNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                }
            } catch (error) {
                console.error('❌ Error loading/checking token nonce:', error);
                // On error, try to use cached data as fallback
                try {
                    const cachedData = await loadAccountData(zkAddress);
                    const tokenData = cachedData?.tokenData?.find(t => {
                        return t.tokenAddress.toLowerCase() === normalizedTokenAddress;
                    });

                    if (tokenData?.currentNonce !== null && tokenData?.currentNonce !== undefined && tokenData.currentNonce > BigInt(0)) {
                        setTokenCurrentNonce(tokenData.currentNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                } catch (fallbackError) {
                    setTokenCurrentNonce(null);
                    setIsTokenInitialized(false);
                }
            } finally {
                setIsCheckingTokenState(false);
            }
        };

        // Small delay to ensure tokenAddress is set and normalized
        const timeoutId = setTimeout(() => {
            loadTokenNonce();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [tokenAddress, zkAddress, publicClient, account?.signature, computeCurrentNonce, setBalanceEntries]);

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

    // Calculate circuit inputs for deposit
    const calculateCircuitInputs = useCallback(async () => {
        console.log('📊 DEPOSIT - CALCULATE CIRCUIT INPUTS - Starting calculation...');
        console.log('  Token Address:', tokenAddress);
        console.log('  Amount:', amount);
        console.log('  ZK Address:', zkAddress);
        console.log('  Token Current Nonce:', tokenCurrentNonce?.toString() || 'null');
        console.log('  Balance Entries:', balanceEntries.map(e => ({
            tokenAddress: e.tokenAddress.toString(),
            nonce: e.nonce.toString(),
            amount: e.amount?.toString() || 'null'
        })));

        if (!tokenAddress || !amount) {
            throw new Error('Missing required inputs: tokenAddress or amount');
        }

        if (!zkAddress) {
            throw new Error('Missing zkAddress. Please sign the message first.');
        }

        // Try to get userKey from context, local state, or compute from signature
        let userKeyToUse: string | null = null;
        if (contextUserKey) {
            userKeyToUse = '0x' + contextUserKey.toString(16);
        } else if (userKey) {
            userKeyToUse = userKey;
        } else if (account?.signature) {
            // Compute userKey from signature if not available
            try {
                userKeyToUse = await computePrivateKeyFromSignature(account.signature);
                if (userKeyToUse && !userKeyToUse.startsWith('0x')) {
                    userKeyToUse = '0x' + userKeyToUse;
                }
                // Store it locally for future use
                if (userKeyToUse) {
                    setUserKey(userKeyToUse);
                }
            } catch (error) {
                console.error('Error computing userKey from signature:', error);
            }
        }

        if (!userKeyToUse) {
            throw new Error('Missing userKey. Please sign the message first or visit /account to sync your data.');
        }

        setIsCalculatingInputs(true);
        try {
            // Convert inputs to bigint
            const tokenAddressBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress);

            // Convert user input (underlying tokens) to raw units, then to shares for the proof
            let amountInRawUnits: bigint;
            if (!amount || amount === '') {
                amountInRawUnits = BigInt(0);
            } else {
                const sanitizedAmount = amount.trim();
                if (!/^\d+\.?\d*$/.test(sanitizedAmount)) {
                    throw new Error('Invalid amount format');
                }

                const parts = sanitizedAmount.split('.');
                if (parts.length === 1) {
                    amountInRawUnits = BigInt(sanitizedAmount) * BigInt(10 ** (tokenDecimals ?? 18));
                } else {
                    const integerPart = parts[0] || '0';
                    const decimalPart = parts[1] || '';
                    const limitedDecimal = decimalPart.slice(0, tokenDecimals ?? 18);
                    const paddedDecimal = limitedDecimal.padEnd(tokenDecimals ?? 18, '0');
                    amountInRawUnits = BigInt(integerPart) * BigInt(10 ** (tokenDecimals ?? 18)) + BigInt(paddedDecimal);
                }
            }

            // Convert underlying token amount to shares using the vault
            const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;
            const sharesForProof = await convertAssetsToShares(publicClient!, tokenAddr, amountInRawUnits);
            const amountBigInt = sharesForProof !== null ? sharesForProof : amountInRawUnits;

            // Ensure userKey has 0x prefix
            const userKeyNormalized = userKeyToUse.startsWith('0x') ? userKeyToUse : '0x' + userKeyToUse;
            const userKeyBigInt = BigInt(userKeyNormalized);

            // Use balanceEntries from global context filtered by token address
            const entriesToUse = balanceEntries && balanceEntries.length > 0
                ? balanceEntries.filter(entry => {
                    let entryTokenAddress: bigint;
                    const tokenAddr = entry.tokenAddress as string | bigint;
                    if (typeof tokenAddr === 'string') {
                        entryTokenAddress = BigInt(tokenAddr.toLowerCase());
                    } else if (typeof tokenAddr === 'bigint') {
                        entryTokenAddress = tokenAddr;
                    } else {
                        entryTokenAddress = BigInt(String(tokenAddr));
                    }
                    return entryTokenAddress === tokenAddressBigInt;
                })
                : [];

            // Use tokenCurrentNonce from state if available, otherwise infer from balanceEntries
            let tokenCurrentNonceValue: bigint;
            console.log('📊 Nonce calculation - tokenCurrentNonce from state:', tokenCurrentNonce?.toString() || 'null');
            console.log('📊 Nonce calculation - entriesToUse:', entriesToUse.map(e => ({
                nonce: e.nonce.toString(),
                amount: e.amount?.toString() || 'null'
            })));

            if (tokenCurrentNonce !== null && tokenCurrentNonce !== undefined) {
                // Use the nonce from state (discovered via AccountModal or nonce discovery)
                tokenCurrentNonceValue = tokenCurrentNonce;
                console.log('✅ Using tokenCurrentNonce from state:', tokenCurrentNonceValue.toString());
            } else if (entriesToUse.length > 0) {
                // Fallback: infer nonce from balanceEntries
                const highestNonceInEntries = entriesToUse.reduce((max, entry) => {
                    const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
                    return entryNonce > max ? entryNonce : max;
                }, BigInt(-1));

                tokenCurrentNonceValue = highestNonceInEntries >= BigInt(0) ? highestNonceInEntries + BigInt(1) : BigInt(0);
                console.log('⚠️ WARNING: Inferring tokenCurrentNonce from balanceEntries (should use state!):', tokenCurrentNonceValue.toString());
                console.log('   Highest nonce in entries:', highestNonceInEntries.toString());
                setTokenCurrentNonce(tokenCurrentNonceValue);
            } else {
                tokenCurrentNonceValue = BigInt(0);
                console.log('⚠️ WARNING: No balance entries, using nonce 0');
                setTokenCurrentNonce(tokenCurrentNonceValue);
            }

            const finalTokenPreviousNonce = tokenCurrentNonceValue > BigInt(0) ? tokenCurrentNonceValue - BigInt(1) : BigInt(0);

            console.log('🔍 DEPOSIT PROOF - Nonce Information:');
            console.log(`  Current Token Nonce: ${tokenCurrentNonceValue.toString()}`);
            console.log(`  Previous Nonce (for deposit): ${finalTokenPreviousNonce.toString()}`);
            console.log(`  Available Balance Entries:`, balanceEntries.filter(e => {
                const entryTokenAddr = typeof e.tokenAddress === 'string' ? BigInt(e.tokenAddress) : e.tokenAddress;
                return entryTokenAddr === tokenAddressBigInt;
            }).map(e => ({
                nonce: e.nonce.toString(),
                amount: e.amount?.toString() || 'null'
            })));

            // Find the balance entry for the finalTokenPreviousNonce
            const balanceEntryForPreviousNonce = balanceEntries.find(
                entry => entry.tokenAddress === tokenAddressBigInt && entry.nonce === finalTokenPreviousNonce
            );

            console.log(`  Balance Entry for Previous Nonce ${finalTokenPreviousNonce.toString()}:`, balanceEntryForPreviousNonce ? {
                nonce: balanceEntryForPreviousNonce.nonce.toString(),
                amount: balanceEntryForPreviousNonce.amount?.toString() || 'null'
            } : 'NOT FOUND');

            // For new token deposits, we need to ensure account is initialized
            if (!balanceEntryForPreviousNonce && finalTokenPreviousNonce > BigInt(0)) {
                const entryBalanceEntry = balanceEntries.find(entry => entry.nonce === BigInt(0) && entry.tokenAddress === tokenAddressBigInt);
                if (!entryBalanceEntry) {
                    throw new Error(`No balance entry found for token ${tokenAddress} at nonce ${finalTokenPreviousNonce}, and account is not initialized. Please initialize your account first (nonce 0).`);
                }
            }

            // We already have userKeyBigInt calculated above, so we can proceed with reconstruction
            // Note: We don't need to store personalState - we only need it for the reconstruction logic below

            if (!publicClient) {
                throw new Error('Public client not available');
            }

            // Get expected_root, tree_depth
            const expectedRoot = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getRoot',
                args: [tokenAddress as `0x${string}`],
            }) as bigint;

            const treeDepth = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getDepth',
                args: [tokenAddress as `0x${string}`],
            }) as bigint;

            const chainId = BigInt(await publicClient.getChainId());

            // Fetch leaves early: for nonce 0 with a single leaf we use the contract's leaf directly (avoids reconstruction mismatch)
            const contractLeaves = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getLeaves' as any,
                args: [tokenAddress as `0x${string}`],
            }) as unknown as bigint[];

            const zkAddr = zkAddress?.replace('zk', '') || '';
            const stored2FA = zkAddr ? await loadTwoFactorData(zkAddr) : undefined;
            const depositSignerHash = stored2FA?.is2FA
                ? stored2FA.signerPubkeyHash
                : (await getSignerIdentityFromUserKey(userKeyBigInt)).signer_pubkey_hash;

            let sharesFromContract: bigint | undefined = undefined;
            if (finalTokenPreviousNonce === BigInt(0)) {
                const spendingKey0 = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt, depositSignerHash);
                const nonceCommitmentBigInt = await poseidonHash([spendingKey0, finalTokenPreviousNonce, tokenAddressBigInt]);

                const nonceCommitmentBytes32 = padHex(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
                const encryptedStateDetails = await publicClient.readContract({
                    address: ArkanaAddress,
                    abi: ArkanaAbi,
                    functionName: 'encryptedStateDetails',
                    args: [nonceCommitmentBytes32],
                }) as [`0x${string}`, `0x${string}`];

                const amountAfterFee = BigInt(encryptedStateDetails[0]);
                sharesFromContract = amountAfterFee;
            }

            // Reconstruct previous_shares, nullifier, previous_unlocks_at
            let previousSharesForReconstruction: bigint;
            let previousStateForReconstruction: CommitmentState | null = null;
            let previousOpType: number | undefined = undefined;

            if (finalTokenPreviousNonce === BigInt(0)) {
                previousSharesForReconstruction = sharesFromContract || BigInt(0);
                previousStateForReconstruction = null;
            } else {
                const { poseidonCtrDecrypt } = await import('@/lib/poseidon-ctr-encryption');
                const viewKeyBigInt = await getViewKeyFromUserKey(userKeyBigInt);
                const spendingKeyBigInt = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt, depositSignerHash);
                const finalPreviousNonceCommitmentBigInt = await poseidonHash([spendingKeyBigInt, finalTokenPreviousNonce, tokenAddressBigInt]);

                const finalPreviousNonceCommitmentBytes32 = padHex(`0x${finalPreviousNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
                const operationInfoForFinalPrevious = await publicClient.readContract({
                    address: ArkanaAddress,
                    abi: ArkanaAbi,
                    functionName: 'getNonceCommitmentInfo',
                    args: [finalPreviousNonceCommitmentBytes32],
                }) as [number, bigint, string, `0x${string}`, `0x${string}`];

                const [opTypeForFinalPrevious, sharesMintedForFinalPrevious, , encryptedBalanceForFinalPrevious, encryptedNullifierForFinalPrevious] = operationInfoForFinalPrevious;
                previousOpType = opTypeForFinalPrevious;

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
                let nullifierForReconstruction: bigint;
                let unlocksAtForReconstruction: bigint;

                if (finalTokenPreviousNonce === BigInt(0)) {
                    nullifierForReconstruction = BigInt(0);
                    unlocksAtForReconstruction = BigInt(0);
                } else {
                    const previousNonceCommitmentBigInt = await poseidonHash([spendingKeyBigInt, finalTokenPreviousNonce, tokenAddressBigInt]);

                    console.log('🔍 DEPOSIT PROOF - Previous Nonce Commitment:');
                    console.log(`  Current Nonce: ${tokenCurrentNonceValue.toString()}`);
                    console.log(`  Previous Nonce: ${finalTokenPreviousNonce.toString()}`);
                    console.log(`  Previous Nonce Commitment (BigInt): ${previousNonceCommitmentBigInt.toString()}`);
                    console.log(`  Previous Nonce Commitment (Hex): 0x${previousNonceCommitmentBigInt.toString(16)}`);

                    const previousNonceCommitmentBytes32 = padHex(`0x${previousNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
                    console.log(`  Previous Nonce Commitment (Bytes32): ${previousNonceCommitmentBytes32}`);
                    const [, , , , previousEncryptedNullifierBytes32] = await publicClient.readContract({
                        address: ArkanaAddress,
                        abi: ArkanaAbi,
                        functionName: 'getNonceCommitmentInfo',
                        args: [previousNonceCommitmentBytes32],
                    }) as [number, bigint, string, `0x${string}`, `0x${string}`];

                    const previousEncryptedNullifierBigInt = BigInt(previousEncryptedNullifierBytes32);
                    nullifierForReconstruction = await poseidonCtrDecrypt(previousEncryptedNullifierBigInt, viewKeyBigInt, 1);
                    unlocksAtForReconstruction = BigInt(0);
                }

                previousStateForReconstruction = {
                    nonce: finalTokenPreviousNonce,
                    tokenAddress: tokenAddressBigInt,
                    commitmentPoint: { x: BigInt(0), y: BigInt(0) },
                    commitmentLeaf: BigInt(0),
                    nonceCommitment: finalPreviousNonceCommitmentBigInt,
                    shares: previousSharesForReconstruction,
                    nullifier: nullifierForReconstruction,
                    unlocksAt: unlocksAtForReconstruction,
                    chainId: chainId,
                };
            }

            const nullifierValue = previousStateForReconstruction?.nullifier ?? BigInt(0);
            const unlocksAtValue = previousStateForReconstruction?.unlocksAt ?? BigInt(0);

            // Commitment leaf and index: use contract's leaf directly when possible (nonce 0 + single leaf), else reconstruct and use computeCommitmentLeaf via contract
            let previousCommitmentLeaf: bigint;
            let commitmentIndex: bigint;

            if (finalTokenPreviousNonce === BigInt(0) && contractLeaves.length === 1) {
                // Single leaf from our initialize — use it directly so we never mismatch
                previousCommitmentLeaf = contractLeaves[0];
                commitmentIndex = BigInt(0);
            } else {
                // Reconstruct point and get leaf via contract's computeCommitmentLeaf(x, y)
                // No encoding: circuits now use 0 directly instead of 1 representing 0
                const { pedersenCommitment5 } = await import('@/lib/pedersen-commitments');
                const reconstructModule = await import('@/lib/reconstructCommitment');

                const spendingKeyForCommit = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt, depositSignerHash);
                const prevNonceCommitmentBigInt = await poseidonHash([spendingKeyForCommit, finalTokenPreviousNonce, tokenAddressBigInt]);

                // Use values directly: no encoding needed (circuits use 0 directly)
                const sharesEncoded = previousSharesForReconstruction;
                // After AbsorbWithdraw(5) or AbsorbSend(4), new commitment uses OLD nullifier; use old = new - noteStackM for leaf
                let nullifierEncodedForLeaf: bigint;
                if (previousOpType === 5 || previousOpType === 4) {
                    const { x: ourX, y: ourY } = parseZkAddress(zkAddress);
                    const { noteStackM } = await fetchIncomingNotes(tokenAddress as `0x${string}`, ourX, ourY, userKeyBigInt);
                    nullifierEncodedForLeaf = nullifierValue > noteStackM ? nullifierValue - noteStackM : BigInt(0);
                } else {
                    nullifierEncodedForLeaf = nullifierValue;
                }
                const unlocksAtEncodedForLeaf = unlocksAtValue; // Use 0 directly, no encoding

                const commitmentPoint = pedersenCommitment5(
                    sharesEncoded,
                    nullifierEncodedForLeaf,
                    spendingKeyForCommit,
                    unlocksAtEncodedForLeaf,
                    prevNonceCommitmentBigInt
                );

                previousCommitmentLeaf = await reconstructModule.computeCommitmentLeaf(commitmentPoint, publicClient);

                const leafExists = await publicClient.readContract({
                    address: ArkanaAddress,
                    abi: ArkanaAbi,
                    functionName: 'hasLeaf',
                    args: [tokenAddress as `0x${string}`, previousCommitmentLeaf],
                }) as boolean;
                if (!leafExists) {
                    throw new Error(`Reconstructed commitment leaf does not exist in contract. This indicates a mismatch in state reconstruction.`);
                }

                try {
                    commitmentIndex = await publicClient.readContract({
                        address: ArkanaAddress,
                        abi: ArkanaAbi,
                        functionName: 'getLeafIndex',
                        args: [tokenAddress as `0x${string}`, previousCommitmentLeaf],
                    }) as bigint;
                } catch (error) {
                    const treeSize = await publicClient.readContract({
                        address: ArkanaAddress,
                        abi: ArkanaAbi,
                        functionName: 'getSize',
                        args: [tokenAddress as `0x${string}`],
                    }) as bigint;
                    commitmentIndex = treeSize;
                }
            }

            // Generate merkle proof
            const { generateMerkleProof } = await import('@/lib/merkle-proof');

            if (contractLeaves.length === 0) {
                throw new Error('No leaves found in contract - cannot generate merkle proof');
            }

            const leafAtIndex = contractLeaves[Number(commitmentIndex)];
            if (leafAtIndex !== previousCommitmentLeaf) {
                throw new Error(`Reconstructed leaf doesn't match contract leaf at index ${commitmentIndex}`);
            }

            let contractProof: bigint[];
            try {
                contractProof = await publicClient.readContract({
                    address: ArkanaAddress,
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

                if (merkleProofResult.root !== expectedRoot) {
                    throw new Error(`Merkle proof root mismatch: computed ${merkleProofResult.root.toString(16)}, expected ${expectedRoot.toString(16)}`);
                }

                contractProof = merkleProofResult.siblings.map(s => BigInt(s));
            }

            // Pad proof to 32 elements
            const merkleProofFormatted: string[] = [];
            for (let i = 0; i < 32; i++) {
                if (i < contractProof.length) {
                    merkleProofFormatted.push(contractProof[i].toString());
                } else {
                    merkleProofFormatted.push('0');
                }
            }

            const formatForNoir = (value: bigint | string): string => {
                if (typeof value === 'bigint') {
                    return value.toString();
                }
                const hexValue = value.startsWith('0x') ? value : '0x' + value;
                return BigInt(hexValue).toString();
            };

            const userKeyForCircuit = contextUserKey ? '0x' + contextUserKey.toString(16) : userKey;
            // No encoding: use 0 directly (circuits now use 0 instead of 1 representing 0)
            const previousSharesEncoded = previousSharesForReconstruction;
            // After AbsorbWithdraw(5) or AbsorbSend(4), circuit needs OLD nullifier (new - noteStackM), not the stored new nullifier
            let nullifierForCircuit: bigint;
            if (previousOpType === 5 || previousOpType === 4) {
                const { x: ourX, y: ourY } = parseZkAddress(zkAddress);
                const { noteStackM } = await fetchIncomingNotes(tokenAddress as `0x${string}`, ourX, ourY, userKeyBigInt);
                nullifierForCircuit = nullifierValue > noteStackM ? nullifierValue - noteStackM : BigInt(0);
            } else {
                nullifierForCircuit = nullifierValue;
            }
            const nullifierEncoded = nullifierForCircuit; // Use 0 directly, no encoding
            const previousUnlocksAtEncoded = unlocksAtValue; // Use 0 directly, no encoding

            const circuitInputs: Record<string, string | string[]> = {
                user_key: formatForNoir(userKeyForCircuit),
                signer_pubkey_hash: depositSignerHash,
                token_address: formatForNoir(tokenAddress),
                amount: formatForNoir(amountBigInt),
                chain_id: chainId.toString(),
                previous_nonce: finalTokenPreviousNonce.toString(),
                previous_shares: previousSharesEncoded.toString(),
                nullifier: nullifierEncoded.toString(),
                previous_unlocks_at: previousUnlocksAtEncoded.toString(),
                previous_commitment_leaf: previousCommitmentLeaf.toString(),
                commitment_index: commitmentIndex.toString(),
                tree_depth: treeDepth.toString(),
                expected_root: expectedRoot.toString(),
                merkle_proof: merkleProofFormatted,
            };

            return circuitInputs;
        } finally {
            setIsCalculatingInputs(false);
        }
    }, [tokenAddress, amount, tokenDecimals, contextUserKey, userKey, zkAddress, balanceEntries, publicClient, account?.signature, tokenCurrentNonce]);

    // Generate deposit proof
    const proveDeposit = useCallback(async () => {
        console.log('🚀 DEPOSIT PROOF - Starting proof generation...');
        console.log('  Token Address:', tokenAddress);
        console.log('  Amount:', amount);
        console.log('  Token Current Nonce:', tokenCurrentNonce?.toString() || 'null');
        console.log('  Is Token Initialized:', isTokenInitialized);
        console.log('  Balance Entries:', balanceEntries.map(e => ({
            tokenAddress: e.tokenAddress.toString(),
            nonce: e.nonce.toString(),
            amount: e.amount?.toString() || 'null'
        })));

        // If token is not initialized, redirect to initialize
        if (isTokenInitialized === false) {
            setProofError('Token is not initialized. Please use the Initialize page first.');
            return;
        }

        if (!zkAddress) {
            setProofError('Please sign a message first to access the Arkana network');
            return;
        }

        if (!tokenAddress || !amount) {
            setProofError('Please enter token address and amount');
            return;
        }

        if (tokenCurrentNonce === null) {
            setProofError('Please compute your current nonce first by visiting /account');
            return;
        }

        try {
            setIsProving(true);
            setProofError(null);
            setProvingTime(null);
            groth16ResultRef.current = null;

            const startTime = performance.now();

            const inputs = await calculateCircuitInputs();
            console.log('Circuit inputs (before proof):', inputs);

            const result = await proveWithSnarkjs(inputs, 'deposit');
            groth16ResultRef.current = result;
            setGroth16Result(result);
            setProof('0x01');
            setPublicInputs(result.publicSignals.slice(0, 11));
            setProvingTime(Math.round(performance.now() - startTime));
        } catch (error) {
            console.error('Error generating proof:', error);
            setProofError(error instanceof Error ? error.message : 'Failed to generate proof');
        } finally {
            setIsProving(false);
        }
    }, [zkAddress, tokenAddress, amount, tokenCurrentNonce, isTokenInitialized, calculateCircuitInputs]);

    // Handle deposit transaction (contract expects pA, pB, pC, publicSignals[11])
    const handleDeposit = useCallback(async () => {
        const groth16 = groth16ResultRef.current;
        if (!groth16 || !groth16.publicSignals?.length) {
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

            if (!tokenAddress || !amount) {
                setTxError('Token address and amount are required');
                setIsSubmitting(false);
                return;
            }

            const activeChainId = chainId || publicClient?.chain?.id || getActiveChain().id;
            const activeChain = publicClient?.chain || getChainById(activeChainId);
            const client = publicClient || createPublicClient({
                chain: activeChain,
                transport: http(getRpcUrlForChain(activeChainId)),
            });

            let amountIn: bigint;
            if (!amount || amount === '') {
                amountIn = BigInt(0);
            } else {
                const sanitizedAmount = amount.trim();
                if (!/^\d+\.?\d*$/.test(sanitizedAmount)) {
                    setTxError('Invalid amount format');
                    setIsSubmitting(false);
                    return;
                }
                const parts = sanitizedAmount.split('.');
                const dec = tokenDecimals ?? 18;
                if (parts.length === 1) {
                    amountIn = BigInt(sanitizedAmount) * BigInt(10 ** dec);
                } else {
                    const integerPart = parts[0] || '0';
                    const decimalPart = (parts[1] || '').slice(0, dec).padEnd(dec, '0');
                    amountIn = BigInt(integerPart) * BigInt(10 ** dec) + BigInt(decimalPart);
                }
            }

            if (amountIn > BigInt(0)) {
                await checkAllowance();
                if (allowance === null || allowance < amountIn) {
                    setTxError(`Insufficient token allowance. Please approve the contract to spend ${amountIn.toString()} tokens first.`);
                    setIsSubmitting(false);
                    return;
                }
            }

            const slicedInputs = groth16.publicSignals.slice(0, 11);
            const publicSignalsTuple = slicedInputs.map((s) => BigInt(s)) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
            const pA: [bigint, bigint] = [BigInt(groth16.pA[0]), BigInt(groth16.pA[1])];
            const pB: [[bigint, bigint], [bigint, bigint]] = [
                [BigInt(groth16.pB[0][0]), BigInt(groth16.pB[0][1])],
                [BigInt(groth16.pB[1][0]), BigInt(groth16.pB[1][1])],
            ];
            const pC: [bigint, bigint] = [BigInt(groth16.pC[0]), BigInt(groth16.pC[1])];

            setIsSimulating(true);
            try {
                const simResult = await client.simulateContract({
                    account: address as `0x${string}`,
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'deposit',
                    args: [pA, pB, pC, publicSignalsTuple],
                });
                setSimulationResult(simResult);
            } catch (simulationError: unknown) {
                const err = simulationError as { shortMessage?: string; message?: string };
                setTxError(err?.shortMessage ?? err?.message ?? 'Simulation failed');
                setIsSubmitting(false);
                setIsSimulating(false);
                setSimulationResult(null);
                return;
            } finally {
                setIsSimulating(false);
            }

            writeContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'deposit',
                args: [pA, pB, pC, publicSignalsTuple],
            });
        } catch (error) {
            console.error('Error in handleDeposit:', error);
            setTxError(error instanceof Error ? error.message : 'Failed to process transaction');
            setIsSubmitting(false);
        }
    }, [address, tokenAddress, amount, tokenDecimals, chainId, publicClient, checkAllowance, allowance, writeContract]);

    // Update txHash when hash changes
    useEffect(() => {
        if (hash) {
            setTxHash(hash);
        }
    }, [hash]);

    // Update error when writeError changes
    useEffect(() => {
        if (writeError) {
            setTxError(writeError.message || 'Transaction failed');
            setIsSubmitting(false);
        }
    }, [writeError]);

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
        userKey,
        isLoading,
        error,
        isProving,
        proof,
        proofError,
        provingTime,
        currentProvingTime,
        isInitializing: false,
        publicInputs,
        isSubmitting,
        isSimulating,
        simulationResult,
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
        tokenCurrentNonce,
        isTokenInitialized,
        isCheckingTokenState,
        tokenName,
        tokenSymbol,
        isCalculatingInputs,
        groth16Result,
        // Actions
        proveDeposit,
        handleDeposit,
        handleApprove,
        checkAllowance,
    };
}
