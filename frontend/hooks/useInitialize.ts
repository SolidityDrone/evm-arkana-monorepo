'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useSignMessage, useChainId } from 'wagmi';
import { useAccount as useAccountContext, useZkAddress } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { createPublicClient, http, parseAbi, Address } from 'viem';
import { sepolia, getActiveChain, getChainById, getRpcUrlForChain } from '@/config';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { computeZkAddress, ARKANA_MESSAGE } from '@/lib/zk-address';
import { loadAccountDataOnSign } from '@/lib/loadAccountDataOnSign';
import { computePrivateKeyFromSignature, getSpendingKeyCircuit, poseidonHash } from '@/lib/circuit-utils';
import { getSignerIdentityFromUserKey } from '@/lib/eddsa-circuit';
import type { TwoFactorSetupResult_UI } from '@/components/TwoFactorSetupModal';
import { saveTwoFactorData, loadTwoFactorData, type TwoFactorData } from '@/lib/indexeddb';
import { proveWithSnarkjs } from '@/lib/circuit-prove';
import type { Groth16Args } from '@/lib/groth16';
import { padHex } from 'viem';

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

    // Groth16 result for contract call (snarkjs returns pA, pB, pC, publicSignals)
    const groth16ResultRef = useRef<Groth16Args | null>(null);

    // 2FA setup state
    const [twoFactorSetupOpen, setTwoFactorSetupOpen] = useState(false);
    const [pending2FAProve, setPending2FAProve] = useState(false);
    const twoFactorResultRef = useRef<TwoFactorSetupResult_UI | null>(null);

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

        if (!ArkanaAddress) {
            console.error('ArkanaAddress is not defined');
            setAllowance(null);
            return;
        }

        try {
            setIsCheckingAllowance(true);
            const tokenAddr = tokenAddress.startsWith('0x') ? tokenAddress as Address : `0x${tokenAddress}` as Address;

            // Validate token address format
            if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddr)) {
                console.error('Invalid token address format:', tokenAddr);
                setAllowance(null);
                return;
            }

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

            console.log('Checking allowance:', {
                tokenAddress: tokenAddr,
                owner: address,
                spender: ArkanaAddress,
                amount: amountIn.toString()
            });

            const currentAllowance = await publicClient.readContract({
                address: tokenAddr,
                abi: ERC20_ABI,
                functionName: 'allowance',
                args: [address as Address, ArkanaAddress as Address],
            });

            console.log('Allowance check successful:', currentAllowance.toString());
            setAllowance(currentAllowance);
        } catch (error) {
            console.error('Error checking allowance:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
            }
            setAllowance(null);
        } finally {
            setIsCheckingAllowance(false);
        }
    }, [tokenAddress, amount, address, publicClient, tokenDecimals, ArkanaAddress]);

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

    /**
     * Opens the 2FA setup modal so the user picks single-key or 2FA.
     * After the user completes the modal, onTwoFactorSetupComplete is called
     * which runs the actual proof.
     */
    const proveArkanaEntry = async () => {
        if (!userKey) {
            setProofError('Please sign a message first to generate user_key');
            return;
        }
        if (!tokenAddress) {
            setProofError('Please fill in token_address');
            return;
        }
        setTwoFactorSetupOpen(true);
    };

    const onTwoFactorSetupComplete = async (result: TwoFactorSetupResult_UI) => {
        setTwoFactorSetupOpen(false);
        twoFactorResultRef.current = result;
        await runEntryProof(result);
    };

    const runEntryProof = async (twoFAResult: TwoFactorSetupResult_UI) => {
        if (!userKey || !tokenAddress) return;

        try {
            setIsProving(true);
            setProofError(null);
            setProvingTime(null);
            groth16ResultRef.current = null;

            const startTime = performance.now();

            let chainIdForCircuit: number;
            try {
                const activeChainId = chainId || publicClient?.chain?.id || getActiveChain().id;
                const activeChain = publicClient?.chain || getChainById(activeChainId);
                const rpcUrl = getRpcUrlForChain(activeChainId);
                const client = publicClient || createPublicClient({ chain: activeChain, transport: http(rpcUrl) });
                chainIdForCircuit = await client.getChainId();
            } catch {
                chainIdForCircuit = chainId || publicClient?.chain?.id || sepolia.id;
            }

            const baseUserKey = BigInt(userKey.startsWith('0x') ? userKey : `0x${userKey}`);
            const tokenAddressBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : `0x${tokenAddress}`);
            const chainIdBigInt = BigInt(chainIdForCircuit);
            let userKeyOffset = BigInt(0);
            const lockDurationNum = parseInt(lockDuration || '0', 10) || 0;

            // Resolve signer_pubkey_hash based on security mode
            const resolveSignerHash = async (uk: bigint): Promise<string> => {
                if (twoFAResult.mode === '2fa' && twoFAResult.signerPubkeyHash) {
                    return twoFAResult.signerPubkeyHash;
                }
                const id = await getSignerIdentityFromUserKey(uk);
                return id.signer_pubkey_hash;
            };

            if (lockDurationNum > 0 && publicClient) {
                const maxOffset = BigInt(100);
                let foundOffset = false;
                for (let offset = BigInt(1); offset < maxOffset && !foundOffset; offset++) {
                    const currentUserKey = baseUserKey + offset;
                    const spkHash = await resolveSignerHash(currentUserKey);
                    const spendingKey = await getSpendingKeyCircuit(currentUserKey, chainIdBigInt, tokenAddressBigInt, spkHash);
                    const nonceCommitment = await poseidonHash([spendingKey, BigInt(0), tokenAddressBigInt]);
                    const nonceCommitmentBytes32 = padHex(`0x${nonceCommitment.toString(16)}`, { size: 32 }) as `0x${string}`;
                    const isUsed = (await publicClient.readContract({
                        address: ArkanaAddress,
                        abi: ArkanaAbi,
                        functionName: 'usedCommitments',
                        args: [nonceCommitmentBytes32],
                    })) as boolean;
                    if (!isUsed) {
                        userKeyOffset = offset;
                        foundOffset = true;
                        break;
                    }
                }
                if (!foundOffset) {
                    setProofError('Could not find available user_key offset for liquidity provision');
                    setIsProving(false);
                    return;
                }
            }

            const actualUserKey = baseUserKey + userKeyOffset;
            const signerPubkeyHash = await resolveSignerHash(actualUserKey);
            const inputs: Record<string, string> = {
                user_key: actualUserKey.toString(),
                signer_pubkey_hash: signerPubkeyHash,
                token_address: tokenAddressBigInt.toString(),
                chain_id: chainIdForCircuit.toString(),
            };

            const result = await proveWithSnarkjs(inputs, 'entry');
            groth16ResultRef.current = result;
            setProof('0x01');
            setPublicInputs(result.publicSignals.slice(0, 7));
            setProvingTime(Math.round(performance.now() - startTime));

            // Persist 2FA data to IndexedDB after successful proof generation
            if (twoFAResult.mode === '2fa' && twoFAResult.desktopScalarShare && twoFAResult.signerPublicKey && twoFAResult.signerPubkeyHash) {
                const zkAddr = zkAddress?.replace('zk', '') || '';
                if (zkAddr) {
                    await saveTwoFactorData(zkAddr, {
                        is2FA: true,
                        browserShare: twoFAResult.desktopScalarShare, // Store as browserShare for compatibility
                        signerPublicKey: twoFAResult.signerPublicKey,
                        signerPubkeyHash: twoFAResult.signerPubkeyHash,
                    });
                }
            }
        } catch (error) {
            console.error('Error generating proof:', error);
            setProofError(error instanceof Error ? error.message : 'Failed to generate proof');
        } finally {
            setIsProving(false);
        }
    };

    // Handle initialize transaction (contract expects pA, pB, pC, publicSignals[7], amountIn, lockDuration)
    const handleInitCommit = async () => {
        const groth16 = groth16ResultRef.current;
        if (!groth16 || !groth16.publicSignals?.length) {
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

        if (amountIn > BigInt(0)) {
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

            console.log('[INIT] handleInitCommit: building args...');
            // Use exact order from snarkjs exportSolidityCallData: [balance_commitment_x, balance_commitment_y, new_nonce_commitment, nonce_discovery_entry_x, nonce_discovery_entry_y, token_address, chain_id]
            const publicSignalsForTx = [...groth16.publicSignals.slice(0, 7)];

            let chainIdForTx: number;
            try {
                const activeChainId = chainId || publicClient?.chain?.id || getActiveChain().id;
                const activeChain = publicClient?.chain || getChainById(activeChainId);
                const rpcUrl = getRpcUrlForChain(activeChainId);
                const client = publicClient || createPublicClient({ chain: activeChain, transport: http(rpcUrl) });
                chainIdForTx = await client.getChainId();
            } catch {
                chainIdForTx = chainId || publicClient?.chain?.id || sepolia.id;
            }

            // Only override the 7th public signal (index 6 = chain_id); leave the rest as from snarkjs
            const chainIdHex = `0x${BigInt(chainIdForTx).toString(16).padStart(64, '0')}`;
            publicSignalsForTx[6] = chainIdHex;

            const publicInputsBytes32 = publicSignalsForTx.map((input: string) => {
                const hex = input.startsWith('0x') ? input.slice(2) : input;
                return `0x${hex.padStart(64, '0')}` as `0x${string}`;
            });

            const lockDurationBigInt = lockDuration ? BigInt(lockDuration) : BigInt(0);

            const pA: [bigint, bigint] = [BigInt(groth16.pA[0]), BigInt(groth16.pA[1])];
            const pB: [[bigint, bigint], [bigint, bigint]] = [
                [BigInt(groth16.pB[0][0]), BigInt(groth16.pB[0][1])],
                [BigInt(groth16.pB[1][0]), BigInt(groth16.pB[1][1])],
            ];
            const pC: [bigint, bigint] = [BigInt(groth16.pC[0]), BigInt(groth16.pC[1])];
            const publicSignalsTuple = publicInputsBytes32.map((s) => BigInt(s)) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint];

            setIsSimulating(true);
            try {
                console.log('[INIT] Simulating initialize transaction...', { chainIdForTx, amountIn: amountIn.toString(), lockDuration: lockDurationBigInt.toString() });
                const activeChainId = chainId || publicClient?.chain?.id || getActiveChain().id;
                const activeChain = publicClient?.chain || getChainById(activeChainId);
                const client = publicClient || createPublicClient({
                    chain: activeChain,
                    transport: http(getRpcUrlForChain(activeChainId)),
                });
                const sim = await client.simulateContract({
                    account: address as `0x${string}`,
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'initialize',
                    args: [pA, pB, pC, publicSignalsTuple, amountIn, lockDurationBigInt],
                });
                console.log('[INIT] Simulation OK', sim);
            } catch (simulationError: unknown) {
                const err = simulationError as { shortMessage?: string; message?: string; cause?: unknown; details?: string };
                const errorMessage = err?.shortMessage ?? err?.message ?? (err?.cause as Error)?.message ?? 'Transaction simulation failed';
                console.error('[INIT] Simulation failed:', simulationError);
                console.error('[INIT] Simulation error message:', errorMessage);
                setTxError(errorMessage);
                setIsSubmitting(false);
                setIsSimulating(false);
                return;
            } finally {
                setIsSimulating(false);
            }

            console.log('[INIT] Calling writeContract (wallet will prompt)...');
            writeContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'initialize',
                args: [pA, pB, pC, publicSignalsTuple, amountIn, lockDurationBigInt],
            });
        } catch (error) {
            console.error('[INIT] Error in handleInitCommit:', error);
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

    // Update error when writeError changes (walmi writeContract rejection or revert)
    useEffect(() => {
        if (writeError) {
            const msg = writeError.message || (writeError as { shortMessage?: string })?.shortMessage || 'Transaction failed';
            console.error('[INIT] writeContract error:', writeError);
            console.error('[INIT] writeContract error message:', msg);
            setTxError(msg);
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
        isInitializing: false,
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
        // 2FA setup
        twoFactorSetupOpen,
        setTwoFactorSetupOpen,
        onTwoFactorSetupComplete,
    };
}
