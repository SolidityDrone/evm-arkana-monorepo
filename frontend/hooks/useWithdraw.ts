'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useAccount as useAccountContext, useZkAddress } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { parseAbi, Address, keccak256, padHex } from 'viem';
import { getChainId } from '@/config';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { useNonceDiscovery } from '@/hooks/useNonceDiscovery';
import { loadAccountData, saveTokenAccountData } from '@/lib/indexeddb';
import { convertAssetsToShares } from '@/lib/shares-to-assets';
import { computePrivateKeyFromSignature, getSpendingKeyCircuit, getViewKeyFromUserKey, poseidonHash } from '@/lib/circuit-utils';
import { proveWithSnarkjs } from '@/lib/circuit-prove';
import type { Groth16Args } from '@/lib/groth16';

const ERC20_ABI = parseAbi([
    'function decimals() view returns (uint8)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
]);

export function useWithdraw() {
    const { address } = useWagmiAccount();
    const { account } = useAccountContext();
    const zkAddress = useZkAddress();
    const { setBalanceEntries, setUserKey: setContextUserKey, userKey: contextUserKey } = useAccountState();
    const publicClient = usePublicClient();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const { computeCurrentNonce } = useNonceDiscovery();

    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [receiverAddress, setReceiverAddress] = useState('');
    const [receiverFeeAmount, setReceiverFeeAmount] = useState('');
    const [arbitraryCalldata, setArbitraryCalldata] = useState('');
    const [arbitraryCalldataHash, setArbitraryCalldataHash] = useState<string>('0x0');
    const [userKey, setUserKey] = useState<string>('');
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
    const [isCalculatingInputs, setIsCalculatingInputs] = useState(false);
    const [tokenCurrentNonce, setTokenCurrentNonce] = useState<bigint | null>(null);
    const [isTokenInitialized, setIsTokenInitialized] = useState<boolean | null>(null);
    const [isCheckingTokenState, setIsCheckingTokenState] = useState(false);
    const [tokenName, setTokenName] = useState<string>('');
    const [tokenSymbol, setTokenSymbol] = useState<string>('');
    const [availableBalance, setAvailableBalance] = useState<bigint | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    const groth16ResultRef = useRef<Groth16Args | null>(null);
    const [groth16Result, setGroth16Result] = useState<Groth16Args | null>(null);

    const { balanceEntries } = useAccountState();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isProving) {
            const startTime = performance.now();
            interval = setInterval(() => {
                setCurrentProvingTime(Math.round(performance.now() - startTime));
            }, 100);
        } else {
            setCurrentProvingTime(0);
        }
        return () => interval && clearInterval(interval);
    }, [isProving]);

    useEffect(() => {
        const init = async () => {
            if (zkAddress && account?.signature && !userKey && !contextUserKey) {
                try {
                    const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                    setUserKey(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                } catch (e) {
                    console.error('Error computing user_key from signature:', e);
                }
            } else if (contextUserKey && !userKey) {
                setUserKey('0x' + contextUserKey.toString(16));
            }
        };
        init();
    }, [zkAddress, account?.signature, userKey, contextUserKey]);

    useEffect(() => {
        if (!tokenAddress || !publicClient) {
            setTokenDecimals(null);
            setTokenName('');
            setTokenSymbol('');
            return;
        }
        const addr = tokenAddress.startsWith('0x') ? (tokenAddress as Address) : (`0x${tokenAddress}` as Address);
        Promise.all([
            publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: 'decimals' }),
            publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: 'name' }).catch(() => ''),
            publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: 'symbol' }).catch(() => ''),
        ]).then(([decimals, name, symbol]) => {
            setTokenDecimals(decimals as number);
            setTokenName(name as string);
            setTokenSymbol(symbol as string);
        }).catch(() => {
            setTokenDecimals(null);
            setTokenName('');
            setTokenSymbol('');
        });
    }, [tokenAddress, publicClient]);

    useEffect(() => {
        if (arbitraryCalldata && arbitraryCalldata.trim() !== '') {
            const calldataHex = arbitraryCalldata.startsWith('0x') ? arbitraryCalldata : `0x${arbitraryCalldata}`;
            const fullHash = keccak256(calldataHex as `0x${string}`);
            setArbitraryCalldataHash(`0x${fullHash.slice(2, 64)}`);
        } else {
            setArbitraryCalldataHash('0x0');
        }
    }, [arbitraryCalldata]);

    useEffect(() => {
        const loadTokenNonce = async () => {
            if (!tokenAddress || !zkAddress) {
                setTokenCurrentNonce(null);
                setIsTokenInitialized(null);
                return;
            }
            const normalized = tokenAddress.startsWith('0x') ? tokenAddress.toLowerCase() : '0x' + tokenAddress.toLowerCase();
            if (!publicClient || !account?.signature) {
                try {
                    const { loadTokenAccountData } = await import('@/lib/indexeddb');
                    const tokenData = await loadTokenAccountData(zkAddress, normalized, 'mage');
                    if (tokenData?.currentNonce != null && tokenData.currentNonce > BigInt(0)) {
                        setTokenCurrentNonce(tokenData.currentNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                } catch {
                    setTokenCurrentNonce(null);
                    setIsTokenInitialized(false);
                }
                return;
            }
            setIsCheckingTokenState(true);
            setIsTokenInitialized(null);
            try {
                const cachedData = await loadAccountData(zkAddress);
                const mageTokenData = cachedData?.mageTokenData || [];
                const tokenData = mageTokenData.find(t => t.tokenAddress.toLowerCase() === normalized);
                const cachedNonce = tokenData?.currentNonce ?? null;
                const cachedBalanceEntries = tokenData?.balanceEntries || [];
                const result = await computeCurrentNonce(tokenAddress as `0x${string}`, cachedNonce, cachedBalanceEntries, 'mage');
                if (result) {
                    await saveTokenAccountData(zkAddress, tokenAddress, result.currentNonce, result.balanceEntries, 'mage');
                    if (result.balanceEntries.length > 0) setBalanceEntries(result.balanceEntries);
                    if (result.currentNonce != null && result.currentNonce > BigInt(0)) {
                        setTokenCurrentNonce(result.currentNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                } else {
                    if (cachedNonce != null && cachedNonce > BigInt(0)) {
                        setTokenCurrentNonce(cachedNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                }
            } catch (e) {
                console.error('Error loading token nonce:', e);
                setTokenCurrentNonce(null);
                setIsTokenInitialized(false);
            } finally {
                setIsCheckingTokenState(false);
            }
        };
        const t = setTimeout(loadTokenNonce, 100);
        return () => clearTimeout(t);
    }, [tokenAddress, zkAddress, publicClient, account?.signature, computeCurrentNonce, setBalanceEntries]);

    useEffect(() => {
        if (!tokenAddress || !zkAddress || !balanceEntries.length || !tokenCurrentNonce || tokenCurrentNonce === BigInt(0)) {
            setAvailableBalance(null);
            return;
        }
        const tokenAddrBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress);
        const entry = balanceEntries.find(e => {
            const a = typeof e.tokenAddress === 'string' ? BigInt(e.tokenAddress) : e.tokenAddress;
            return a === tokenAddrBigInt && (typeof e.nonce === 'string' ? BigInt(e.nonce) : e.nonce) === tokenCurrentNonce - BigInt(1);
        });
        if (entry?.amount != null) {
            const amt = typeof entry.amount === 'string' ? BigInt(entry.amount) : entry.amount;
            setAvailableBalance(amt);
        } else {
            setAvailableBalance(null);
        }
    }, [tokenAddress, zkAddress, balanceEntries, tokenCurrentNonce]);

    const calculateCircuitInputs = useCallback(async () => {
        if (!tokenAddress || !amount || !receiverAddress || !receiverFeeAmount || !zkAddress || !publicClient) {
            throw new Error('Missing required fields or client');
        }
        if (tokenCurrentNonce === null) {
            throw new Error('Token nonce not discovered. Wait for token discovery.');
        }
        setIsCalculatingInputs(true);
        try {
        let userKeyToUse: string | null = contextUserKey ? '0x' + contextUserKey.toString(16) : userKey;
        if (!userKeyToUse && account?.signature) {
            const hex = await computePrivateKeyFromSignature(account.signature);
            userKeyToUse = hex.startsWith('0x') ? hex : '0x' + hex;
            if (userKeyToUse) setUserKey(userKeyToUse);
        }
        if (!userKeyToUse) throw new Error('Missing userKey. Sign the message first.');

        const tokenAddressBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress);
        const tokenPreviousNonce = tokenCurrentNonce > BigInt(0) ? tokenCurrentNonce - BigInt(1) : BigInt(0);

        const parseAmount = (s: string, dec: number) => {
            const sanitized = (s || '').trim().replace(',', '.');
            if (!/^\d+\.?\d*$/.test(sanitized)) return BigInt(0);
            const parts = sanitized.split('.');
            const dec_ = dec ?? 18;
            if (parts.length === 1) return BigInt(sanitized) * BigInt(10 ** dec_);
            const intPart = parts[0] || '0';
            const decPart = (parts[1] || '').slice(0, dec_).padEnd(dec_, '0');
            return BigInt(intPart) * BigInt(10 ** dec_) + BigInt(decPart);
        };
        const dec = tokenDecimals ?? 18;
        const amountInRaw = parseAmount(amount, dec);
        const feeInRaw = parseAmount(receiverFeeAmount, dec);
        const tokenAddr = tokenAddress.startsWith('0x') ? (tokenAddress as Address) : (`0x${tokenAddress}` as Address);
        const amountShares = await convertAssetsToShares(publicClient, tokenAddr, amountInRaw);
        const feeShares = await convertAssetsToShares(publicClient, tokenAddr, feeInRaw);
        const amountBigInt = amountShares ?? amountInRaw;
        const receiverFeeAmountBigInt = feeShares ?? feeInRaw;
        const receiverAddressBigInt = BigInt(receiverAddress.startsWith('0x') ? receiverAddress : '0x' + receiverAddress);
        const declaredTimeReference = BigInt(Math.floor(Date.now() / 1000));

        const userKeyBigInt = BigInt(userKeyToUse.startsWith('0x') ? userKeyToUse : '0x' + userKeyToUse);
        const chainId = BigInt(await publicClient.getChainId());

        let previousSharesForReconstruction: bigint;
        let nullifierValue: bigint;
        let unlocksAtValue: bigint;

        let sharesFromContract: bigint | undefined;
        if (tokenPreviousNonce === BigInt(0)) {
            const spendingKey0 = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt);
            const nonceCommitmentBigInt = await poseidonHash([spendingKey0, tokenPreviousNonce, tokenAddressBigInt]);
            const nonceCommitmentBytes32 = padHex(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
            const encryptedStateDetails = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'encryptedStateDetails',
                args: [nonceCommitmentBytes32],
            }) as [`0x${string}`, `0x${string}`];
            sharesFromContract = BigInt(encryptedStateDetails[0]);
        }

        if (tokenPreviousNonce === BigInt(0)) {
            previousSharesForReconstruction = sharesFromContract ?? BigInt(0);
            nullifierValue = BigInt(0);
            unlocksAtValue = BigInt(0);
        } else {
            const { poseidonCtrDecrypt } = await import('@/lib/poseidon-ctr-encryption');
            const viewKeyBigInt = await getViewKeyFromUserKey(userKeyBigInt);
            const spendingKeyBigInt = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt);
            const finalPreviousNonceCommitmentBigInt = await poseidonHash([spendingKeyBigInt, tokenPreviousNonce, tokenAddressBigInt]);
            const finalPreviousNonceCommitmentBytes32 = padHex(`0x${finalPreviousNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
            const operationInfo = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getNonceCommitmentInfo',
                args: [finalPreviousNonceCommitmentBytes32],
            }) as [number, bigint, string, `0x${string}`, `0x${string}`];
            const [opType, sharesMinted, , encryptedBalance, encryptedNullifier] = operationInfo;
            let decryptedShares: bigint;
            if (opType === 0) {
                decryptedShares = BigInt(encryptedBalance);
            } else {
                decryptedShares = await poseidonCtrDecrypt(BigInt(encryptedBalance), viewKeyBigInt, 0);
            }
            previousSharesForReconstruction = (opType === 0 || opType === 1) ? decryptedShares + sharesMinted : decryptedShares;
            const prevNonceCommitmentBigInt = await poseidonHash([spendingKeyBigInt, tokenPreviousNonce, tokenAddressBigInt]);
            const prevNonceCommitmentBytes32 = padHex(`0x${prevNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
            const [, , , , prevEncryptedNullifier] = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getNonceCommitmentInfo',
                args: [prevNonceCommitmentBytes32],
            }) as [number, bigint, string, `0x${string}`, `0x${string}`];
            nullifierValue = await poseidonCtrDecrypt(BigInt(prevEncryptedNullifier), viewKeyBigInt, 1);
            unlocksAtValue = BigInt(0);
        }

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
        const contractLeaves = await publicClient.readContract({
            address: ArkanaAddress,
            abi: ArkanaAbi,
            functionName: 'getLeaves' as any,
            args: [tokenAddress as `0x${string}`],
        }) as unknown as bigint[];

        let previousCommitmentLeaf: bigint;
        let commitmentIndex: bigint;

        if (tokenPreviousNonce === BigInt(0) && contractLeaves.length === 1) {
            previousCommitmentLeaf = contractLeaves[0];
            commitmentIndex = BigInt(0);
        } else {
            const { pedersenCommitment5 } = await import('@/lib/pedersen-commitments');
            const reconstructModule = await import('@/lib/reconstructCommitment');
            const spendingKeyForCommit = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt);
            const prevNonceCommitmentBigInt = await poseidonHash([spendingKeyForCommit, tokenPreviousNonce, tokenAddressBigInt]);
            const sharesEncodedForLeaf = tokenPreviousNonce === BigInt(0)
                ? previousSharesForReconstruction + BigInt(1)
                : previousSharesForReconstruction;
            const nullifierEncodedForLeaf = tokenPreviousNonce === BigInt(0)
                ? nullifierValue + BigInt(1)
                : nullifierValue;
            const unlocksAtEncodedForLeaf = tokenPreviousNonce === BigInt(0)
                ? unlocksAtValue + BigInt(1)
                : (unlocksAtValue === BigInt(0) ? BigInt(1) : unlocksAtValue);
            const commitmentPoint = pedersenCommitment5(
                sharesEncodedForLeaf,
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
                throw new Error('Reconstructed commitment leaf does not exist in contract. State reconstruction mismatch.');
            }
            try {
                commitmentIndex = await publicClient.readContract({
                    address: ArkanaAddress,
                    abi: ArkanaAbi,
                    functionName: 'getLeafIndex',
                    args: [tokenAddress as `0x${string}`, previousCommitmentLeaf],
                }) as bigint;
            } catch {
                commitmentIndex = await publicClient.readContract({
                    address: ArkanaAddress,
                    abi: ArkanaAbi,
                    functionName: 'getSize',
                    args: [tokenAddress as `0x${string}`],
                }) as bigint;
            }
        }

        let contractProof: bigint[];
        try {
            contractProof = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'generateProof',
                args: [tokenAddress as `0x${string}`, commitmentIndex],
            }) as unknown as bigint[];
        } catch {
            const { generateMerkleProof } = await import('@/lib/merkle-proof');
            const res = await generateMerkleProof(contractLeaves, Number(commitmentIndex), 32);
            if (res.root !== expectedRoot) throw new Error('Merkle proof root mismatch');
            contractProof = res.siblings.map(s => BigInt(s));
        }
        const merkleProofFormatted: string[] = [];
        for (let i = 0; i < 32; i++) {
            merkleProofFormatted.push(i < contractProof.length ? contractProof[i].toString() : '0');
        }

        const formatForNoir = (value: bigint | string): string =>
            typeof value === 'bigint' ? value.toString() : BigInt(value.startsWith('0x') ? value : '0x' + value).toString();

        const previousSharesEncoded = tokenPreviousNonce === BigInt(0)
            ? previousSharesForReconstruction + BigInt(1)
            : previousSharesForReconstruction;
        const nullifierEncoded = tokenPreviousNonce === BigInt(0)
            ? nullifierValue + BigInt(1)
            : nullifierValue;
        const previousUnlocksAtEncoded = tokenPreviousNonce === BigInt(0)
            ? unlocksAtValue + BigInt(1)
            : (unlocksAtValue === BigInt(0) ? BigInt(1) : unlocksAtValue);

        const leafFromContract = contractLeaves[Number(commitmentIndex)];
        const previousCommitmentLeafPassed = leafFromContract ?? previousCommitmentLeaf;

        return {
            user_key: formatForNoir(userKeyToUse),
            token_address: formatForNoir(tokenAddressBigInt),
            amount: formatForNoir(amountBigInt),
            chain_id: chainId.toString(),
            previous_nonce: tokenPreviousNonce.toString(),
            previous_shares: previousSharesEncoded.toString(),
            nullifier: nullifierEncoded.toString(),
            previous_unlocks_at: previousUnlocksAtEncoded.toString(),
            declared_time_reference: declaredTimeReference.toString(),
            previous_commitment_leaf: previousCommitmentLeafPassed.toString(),
            commitment_index: commitmentIndex.toString(),
            tree_depth: treeDepth.toString(),
            expected_root: expectedRoot.toString(),
            merkle_proof: merkleProofFormatted,
            receiver_address: formatForNoir(receiverAddressBigInt),
            relayer_fee_amount: formatForNoir(receiverFeeAmountBigInt),
            arbitrary_calldata_hash: formatForNoir(BigInt(arbitraryCalldataHash)),
        };
    } finally {
        setIsCalculatingInputs(false);
    }
    }, [
        tokenAddress, amount, receiverAddress, receiverFeeAmount, arbitraryCalldataHash, tokenDecimals,
        zkAddress, publicClient, account?.signature, contextUserKey, userKey, tokenCurrentNonce, balanceEntries,
    ]);

    const proveWithdraw = useCallback(async () => {
        if (!zkAddress) {
            setProofError('Please sign a message first to access the Arkana network');
            return;
        }
        if (!tokenAddress || !amount || !receiverAddress || !receiverFeeAmount) {
            setProofError('Please fill in token, amount, receiver address and relayer fee');
            return;
        }
        if (tokenCurrentNonce === null) {
            setProofError('Token nonce not discovered. Wait for token discovery.');
            return;
        }
        if (isTokenInitialized === false) {
            setProofError('Token not initialized. Use Initialize page first.');
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
            const result = await proveWithSnarkjs(inputs, 'withdraw');
            groth16ResultRef.current = result;
            setGroth16Result(result);
            setProof('0x01');
            setPublicInputs(result.publicSignals ?? []);
            setProvingTime(Math.round(performance.now() - startTime));
        } catch (e) {
            console.error('Error generating withdraw proof:', e);
            setProofError(e instanceof Error ? e.message : 'Failed to generate proof');
        } finally {
            setIsProving(false);
        }
    }, [zkAddress, tokenAddress, amount, receiverAddress, receiverFeeAmount, tokenCurrentNonce, isTokenInitialized, calculateCircuitInputs]);

    const callDataBytes = (): `0x${string}` => {
        if (!arbitraryCalldata || arbitraryCalldata.trim() === '') return '0x';
        return (arbitraryCalldata.startsWith('0x') ? arbitraryCalldata : `0x${arbitraryCalldata}`) as `0x${string}`;
    };

    const handleWithdraw = useCallback(async () => {
        const groth16 = groth16ResultRef.current;
        if (!groth16?.publicSignals || groth16.publicSignals.length < 15) {
            setTxError('Proof and public inputs required. Generate proof first.');
            return;
        }
        if (!address) {
            setTxError('Please connect your wallet');
            return;
        }
        if (!publicClient) {
            setTxError('Public client not available');
            return;
        }
        try {
            setIsSubmitting(true);
            setTxError(null);
            setTxHash(null);

            const pA: [bigint, bigint] = [BigInt(groth16.pA[0]), BigInt(groth16.pA[1])];
            const pB: [[bigint, bigint], [bigint, bigint]] = [
                [BigInt(groth16.pB[0][0]), BigInt(groth16.pB[0][1])],
                [BigInt(groth16.pB[1][0]), BigInt(groth16.pB[1][1])],
            ];
            const pC: [bigint, bigint] = [BigInt(groth16.pC[0]), BigInt(groth16.pC[1])];
            const publicSignalsTuple = groth16.publicSignals.slice(0, 15).map((s: string) => BigInt(s)) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint];
            const callData = callDataBytes();

            setIsSimulating(true);
            try {
                console.log('Simulating withdraw...', { publicSignalsCount: publicSignalsTuple.length, callDataLength: callData.length });
                const sim = await publicClient.simulateContract({
                    account: address as `0x${string}`,
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: 'withdraw',
                    args: [pA, pB, pC, publicSignalsTuple, callData],
                });
                setSimulationResult(sim);
                console.log('Withdraw simulation success', sim);
            } catch (simErr: unknown) {
                const err = simErr as { shortMessage?: string; message?: string; details?: string; cause?: unknown };
                const msg = err?.shortMessage ?? err?.message ?? (err?.details as string) ?? (err?.cause as Error)?.message ?? 'Simulation failed';
                console.error('Withdraw simulation failed:', simErr);
                console.error('Withdraw simulation error message:', msg);
                setTxError(msg);
                setIsSubmitting(false);
                setIsSimulating(false);
                return;
            } finally {
                setIsSimulating(false);
            }

            writeContract({
                address: ArkanaAddress as `0x${string}`,
                abi: ArkanaAbi,
                functionName: 'withdraw',
                args: [pA, pB, pC, publicSignalsTuple, callData],
                gas: BigInt(3_000_000),
            });
        } catch (e) {
            console.error('Error in handleWithdraw:', e);
            setTxError(e instanceof Error ? e.message : 'Withdraw failed');
            setIsSubmitting(false);
        }
    }, [address, publicClient, writeContract]);

    useEffect(() => {
        if (hash) setTxHash(hash);
    }, [hash]);
    useEffect(() => {
        if (writeError) {
            setTxError(writeError.message ?? 'Transaction failed');
            setIsSubmitting(false);
        }
    }, [writeError]);
    useEffect(() => {
        if (isConfirmed) setIsSubmitting(false);
    }, [isConfirmed]);

    return {
        zkAddress,
        tokenAddress,
        setTokenAddress,
        tokenDecimals,
        amount,
        setAmount,
        receiverAddress,
        setReceiverAddress,
        receiverFeeAmount,
        setReceiverFeeAmount,
        arbitraryCalldata,
        setArbitraryCalldata,
        arbitraryCalldataHash,
        tokenName,
        tokenSymbol,
        isProving,
        proof,
        proofError,
        provingTime,
        currentProvingTime,
        publicInputs,
        isSubmitting,
        isSimulating,
        simulationResult,
        txHash,
        txError,
        isPending,
        isConfirming,
        isConfirmed,
        tokenCurrentNonce,
        isTokenInitialized,
        isCheckingTokenState,
        availableBalance,
        isLoadingBalance,
        isCalculatingInputs,
        groth16Result,
        proveWithdraw,
        handleWithdraw,
        balanceEntries,
    };
}
