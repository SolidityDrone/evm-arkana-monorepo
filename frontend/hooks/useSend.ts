'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useAccount as useAccountContext, useZkAddress } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { parseAbi, Address, padHex } from 'viem';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { useNonceDiscovery } from '@/hooks/useNonceDiscovery';
import { loadAccountData, saveTokenAccountData } from '@/lib/indexeddb';
import { convertSharesToAssets } from '@/lib/shares-to-assets';
import { convertAssetsToShares } from '@/lib/shares-to-assets';
import { computePrivateKeyFromSignature, getSpendingKeyCircuit, getViewKeyFromUserKey, poseidonHash, reduceToBn254Field } from '@/lib/circuit-utils';
import { proveWithSnarkjs } from '@/lib/circuit-prove';
import type { Groth16Args } from '@/lib/groth16';
import { parseZkAddress } from '@/lib/zk-address';
import { pedersenCommitment } from '@/lib/pedersen-commitments';

const ERC20_ABI = parseAbi([
    'function decimals() view returns (uint8)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
]);

export function useSend() {
    const { address } = useWagmiAccount();
    const { account } = useAccountContext();
    const zkAddress = useZkAddress();
    const { setBalanceEntries, userKey: contextUserKey } = useAccountState();
    const publicClient = usePublicClient();
    const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const { computeCurrentNonce, fetchIncomingNotes } = useNonceDiscovery();

    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenDecimals, setTokenDecimals] = useState<number | null>(null);
    const [amount, setAmount] = useState('');
    const [receiverZkAddress, setReceiverZkAddress] = useState('');
    const [relayerFeeAmount, setRelayerFeeAmount] = useState('');
    const [userKey, setUserKey] = useState<string>('');
    const [isProving, setIsProving] = useState(false);
    const [proof, setProof] = useState<string>('');
    const [proofError, setProofError] = useState<string | null>(null);
    const [provingTime, setProvingTime] = useState<number | null>(null);
    const [currentProvingTime, setCurrentProvingTime] = useState(0);
    const [publicInputs, setPublicInputs] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<unknown>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [txError, setTxError] = useState<string | null>(null);
    const [isCalculatingInputs, setIsCalculatingInputs] = useState(false);
    const [tokenCurrentNonce, setTokenCurrentNonce] = useState<bigint | null>(null);
    const [isTokenInitialized, setIsTokenInitialized] = useState<boolean | null>(null);
    const [isCheckingTokenState, setIsCheckingTokenState] = useState(false);
    const [tokenName, setTokenName] = useState('');
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [availableBalance, setAvailableBalance] = useState<bigint | null>(null);
    const [availableBalanceAssets, setAvailableBalanceAssets] = useState<bigint | null>(null);
    const [canAbsorb, setCanAbsorb] = useState(false);

    const groth16ResultRef = useRef<Groth16Args | null>(null);
    const [groth16Result, setGroth16Result] = useState<Groth16Args | null>(null);
    const sendCircuitRef = useRef<'send' | 'absorb_send'>('send');
    const [sendCircuit, setSendCircuit] = useState<'send' | 'absorb_send'>('send');
    const { balanceEntries } = useAccountState();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isProving) {
            const start = performance.now();
            interval = setInterval(() => setCurrentProvingTime(Math.round(performance.now() - start)), 100);
        } else setCurrentProvingTime(0);
        return () => interval && clearInterval(interval);
    }, [isProving]);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            if (zkAddress && account?.signature && !userKey && !contextUserKey) {
                try {
                    const { computePrivateKeyFromSignature } = await import('@/lib/circuit-utils');
                    const hex = await computePrivateKeyFromSignature(account.signature);
                    if (mounted) setUserKey(hex.startsWith('0x') ? hex : '0x' + hex);
                } catch (e) {
                    console.error('Error computing user_key:', e);
                }
            } else if (contextUserKey && !userKey && mounted) {
                setUserKey('0x' + contextUserKey.toString(16));
            }
        };
        init();
        return () => { mounted = false; };
    }, [zkAddress, account?.signature, userKey, contextUserKey]);

    useEffect(() => {
        if (!tokenAddress || !publicClient) {
            setTokenDecimals(null);
            setTokenName('');
            setTokenSymbol('');
            return;
        }
        let mounted = true;
        const addr = (tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress) as Address;
        Promise.all([
            publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: 'decimals' }),
            publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: 'name' }).catch(() => ''),
            publicClient.readContract({ address: addr, abi: ERC20_ABI, functionName: 'symbol' }).catch(() => ''),
        ]).then(([d, n, s]) => {
            if (mounted) {
                setTokenDecimals(d as number);
                setTokenName(n as string);
                setTokenSymbol(s as string);
            }
        }).catch(() => {
            if (mounted) {
                setTokenDecimals(null);
                setTokenName('');
                setTokenSymbol('');
            }
        });
        return () => { mounted = false; };
    }, [tokenAddress, publicClient]);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!tokenAddress || !zkAddress) {
                if (mounted) {
                    setTokenCurrentNonce(null);
                    setIsTokenInitialized(null);
                }
                return;
            }
            const norm = (tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress).toLowerCase();
            if (!publicClient || !account?.signature) {
                try {
                    const { loadTokenAccountData } = await import('@/lib/indexeddb');
                    const data = await loadTokenAccountData(zkAddress, norm, 'mage');
                    if (!mounted) return;
                    if (data?.currentNonce != null && data.currentNonce > 0n) {
                        setTokenCurrentNonce(data.currentNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                } catch {
                    if (mounted) {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                }
                return;
            }
            if (mounted) setIsCheckingTokenState(true);
            try {
                const cached = await loadAccountData(zkAddress);
                if (!mounted) return;
                const mage = cached?.mageTokenData || [];
                const tok = mage.find((t: { tokenAddress: string }) => t.tokenAddress.toLowerCase() === norm);
                const cachedNonce = tok?.currentNonce ?? null;
                const cachedEntries = tok?.balanceEntries || [];
                const result = await computeCurrentNonce(tokenAddress as `0x${string}`, cachedNonce, cachedEntries, 'mage');
                if (!mounted) return;
                if (result) {
                    await saveTokenAccountData(zkAddress, tokenAddress, result.currentNonce, result.balanceEntries, 'mage');
                    if (result.balanceEntries.length > 0) setBalanceEntries(result.balanceEntries);
                    if (result.currentNonce != null && result.currentNonce > 0n) {
                        setTokenCurrentNonce(result.currentNonce);
                        setIsTokenInitialized(true);
                    } else {
                        setTokenCurrentNonce(null);
                        setIsTokenInitialized(false);
                    }
                } else {
                    setTokenCurrentNonce(cachedNonce && cachedNonce > 0n ? cachedNonce : null);
                    setIsTokenInitialized(!!(cachedNonce && cachedNonce > 0n));
                }
            } catch (e) {
                console.error('Send token nonce load:', e);
                if (mounted) {
                    setTokenCurrentNonce(null);
                    setIsTokenInitialized(false);
                }
            } finally {
                if (mounted) setIsCheckingTokenState(false);
            }
        };
        const t = setTimeout(load, 100);
        return () => {
            mounted = false;
            clearTimeout(t);
        };
    }, [tokenAddress, zkAddress, publicClient, account?.signature, computeCurrentNonce, setBalanceEntries]);

    // Available balance = current + (incoming - nullifier)
    useEffect(() => {
        if (!tokenAddress || !zkAddress || tokenCurrentNonce == null || tokenCurrentNonce === 0n) {
            setAvailableBalance(null);
            setAvailableBalanceAssets(null);
            setCanAbsorb(false);
            return;
        }
        const tokenBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress);
        const prevNonce = tokenCurrentNonce - 1n;
        const entry = balanceEntries.find((e: { tokenAddress: string | bigint; nonce: string | bigint }) => {
            const a = typeof e.tokenAddress === 'string' ? BigInt(e.tokenAddress) : e.tokenAddress;
            const n = typeof e.nonce === 'string' ? BigInt(e.nonce) : e.nonce;
            return a === tokenBigInt && n === prevNonce;
        });
        const currentShares = entry?.amount != null ? (typeof entry.amount === 'string' ? BigInt(entry.amount) : entry.amount) : 0n;
        const nullifier = (entry as { nullifier?: bigint } | undefined)?.nullifier ?? 0n;

        if (!fetchIncomingNotes || !account?.signature || !publicClient) {
            setAvailableBalance(currentShares);
            setCanAbsorb(false);
            return;
        }
        setAvailableBalance(currentShares);

        let cancelled = false;
        (async () => {
            try {
                let userKeyBigInt: bigint | null = contextUserKey ? BigInt('0x' + contextUserKey.toString(16)) : BigInt(userKey || '0');
                if (!userKeyBigInt && account?.signature) {
                    const { computePrivateKeyFromSignature } = await import('@/lib/circuit-utils');
                    const hex = await computePrivateKeyFromSignature(account.signature);
                    userKeyBigInt = BigInt(hex.startsWith('0x') ? hex : '0x' + hex);
                }
                if (!userKeyBigInt) {
                    if (!cancelled) setAvailableBalance(currentShares);
                    return;
                }
                const { x: rx, y: ry } = parseZkAddress(zkAddress);
                const { notes } = await fetchIncomingNotes(tokenAddress as `0x${string}`, rx, ry, userKeyBigInt);
                if (cancelled) return;
                const sumIncoming = notes.reduce((acc, n) => acc + n.amount, 0n);
                const absorbable = sumIncoming > nullifier ? sumIncoming - nullifier : 0n;
                const displayBalance = currentShares + absorbable;
                setAvailableBalance(displayBalance);
                setCanAbsorb(absorbable > 0n);
            } catch {
                if (!cancelled) {
                    setAvailableBalance(currentShares);
                    setCanAbsorb(false);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [tokenAddress, zkAddress, balanceEntries, tokenCurrentNonce, account?.signature, contextUserKey, userKey, fetchIncomingNotes, publicClient]);

    useEffect(() => {
        if (!publicClient || !tokenAddress || availableBalance === null) {
            setAvailableBalanceAssets(null);
            return;
        }
        let cancelled = false;
        convertSharesToAssets(publicClient, tokenAddress as Address, availableBalance).then((assets) => {
            if (!cancelled && assets != null) setAvailableBalanceAssets(assets);
        }).catch(() => { if (!cancelled) setAvailableBalanceAssets(null); });
        return () => { cancelled = true; };
    }, [publicClient, tokenAddress, availableBalance]);

    const calculateCircuitInputs = useCallback(async () => {
        if (!tokenAddress || !amount || !receiverZkAddress.trim() || !relayerFeeAmount || !zkAddress || !publicClient)
            throw new Error('Missing required fields or client');
        if (tokenCurrentNonce == null) throw new Error('Token nonce not discovered');
        let userKeyToUse: string = contextUserKey ? '0x' + contextUserKey.toString(16) : userKey;
        if (!userKeyToUse && account?.signature) {
            const hex = await computePrivateKeyFromSignature(account.signature);
            userKeyToUse = hex.startsWith('0x') ? hex : '0x' + hex;
            setUserKey(userKeyToUse);
        }
        if (!userKeyToUse) throw new Error('Missing userKey. Sign the message first.');

        const { x: receiverX, y: receiverY } = parseZkAddress(receiverZkAddress.trim());

        const tokenAddressBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress);
        const tokenPreviousNonce = tokenCurrentNonce > 0n ? tokenCurrentNonce - 1n : 0n;

        const parseAmt = (s: string, dec: number) => {
            const v = (s || '').trim().replace(',', '.');
            if (!/^\d+\.?\d*$/.test(v)) return 0n;
            const [intPart, decPart] = v.split('.');
            const d = dec ?? 18;
            if (!decPart) return BigInt(v) * BigInt(10 ** d);
            return BigInt(intPart || '0') * BigInt(10 ** d) + BigInt((decPart || '').slice(0, d).padEnd(d, '0'));
        };
        const dec = tokenDecimals ?? 18;
        const amountRaw = parseAmt(amount, dec);
        const feeRaw = parseAmt(relayerFeeAmount, dec);
        const tokenAddr = (tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress) as Address;
        const amountShares = await convertAssetsToShares(publicClient, tokenAddr, amountRaw);
        const feeShares = await convertAssetsToShares(publicClient, tokenAddr, feeRaw);
        const amountBigInt = amountShares ?? amountRaw;
        const relayerFeeBigInt = feeShares ?? feeRaw;
        const userKeyBigInt = BigInt(userKeyToUse.startsWith('0x') ? userKeyToUse : '0x' + userKeyToUse);
        const chainId = BigInt(await publicClient.getChainId());

        let previousShares: bigint, nullifierValue: bigint, unlocksAtValue: bigint;
        let previousOpType = 0;
        let sharesFromContract: bigint | undefined;
        if (tokenPreviousNonce === 0n) {
            const sk0 = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt);
            const nc = await poseidonHash([sk0, tokenPreviousNonce, tokenAddressBigInt]);
            const nc32 = padHex('0x' + nc.toString(16), { size: 32 }) as `0x${string}`;
            const enc = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'encryptedStateDetails',
                args: [nc32],
            }) as [`0x${string}`, `0x${string}`];
            sharesFromContract = BigInt(enc[0]);
        }

        if (tokenPreviousNonce === 0n) {
            previousShares = sharesFromContract ?? 0n;
            nullifierValue = 0n;
            unlocksAtValue = 0n;
        } else {
            const { poseidonCtrDecrypt } = await import('@/lib/poseidon-ctr-encryption');
            const viewKey = await getViewKeyFromUserKey(userKeyBigInt);
            const sk = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt);
            const fnc = await poseidonHash([sk, tokenPreviousNonce, tokenAddressBigInt]);
            const fnc32 = padHex('0x' + fnc.toString(16), { size: 32 }) as `0x${string}`;
            const op = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getNonceCommitmentInfo',
                args: [fnc32],
            }) as [number, bigint, string, `0x${string}`, `0x${string}`];
            const [opType, sharesMinted, , encBal, encNull] = op;
            previousOpType = opType;
            let decShares: bigint;
            if (opType === 0) decShares = BigInt(encBal);
            else decShares = await poseidonCtrDecrypt(BigInt(encBal), viewKey, 0);
            previousShares = (opType === 0 || opType === 1) ? decShares + sharesMinted : decShares;
            const pnc = await poseidonHash([sk, tokenPreviousNonce, tokenAddressBigInt]);
            const pnc32 = padHex('0x' + pnc.toString(16), { size: 32 }) as `0x${string}`;
            const [, , , , prevEncNull] = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getNonceCommitmentInfo',
                args: [pnc32],
            }) as [number, bigint, string, `0x${string}`, `0x${string}`];
            nullifierValue = await poseidonCtrDecrypt(BigInt(prevEncNull), viewKey, 1);
            unlocksAtValue = 0n;
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
            functionName: 'getLeaves' as 'getLeaves',
            args: [tokenAddress as `0x${string}`],
        }) as bigint[];

        let previousCommitmentLeaf: bigint, commitmentIndex: bigint;
        if (tokenPreviousNonce === 0n && contractLeaves.length === 1) {
            previousCommitmentLeaf = contractLeaves[0];
            commitmentIndex = 0n;
        } else {
            const { pedersenCommitment5 } = await import('@/lib/pedersen-commitments');
            const { computeCommitmentLeaf } = await import('@/lib/reconstructCommitment');
            const skCommit = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt);
            const pncCommit = await poseidonHash([skCommit, tokenPreviousNonce, tokenAddressBigInt]);
            const sharesEnc = tokenPreviousNonce === 0n ? previousShares + 1n : previousShares;
            // After AbsorbWithdraw(5) or AbsorbSend(4), new commitment uses OLD nullifier; use old = new - noteStackM for leaf
            let nullEnc: bigint;
            if (tokenPreviousNonce === 0n) nullEnc = nullifierValue + 1n;
            else if (previousOpType === 5 || previousOpType === 4) {
                const { x: ourX, y: ourY } = parseZkAddress(zkAddress);
                const { noteStackM } = await fetchIncomingNotes(tokenAddr, ourX, ourY, userKeyBigInt);
                nullEnc = nullifierValue > noteStackM ? nullifierValue - noteStackM : 0n;
            } else nullEnc = nullifierValue;
            const unlocksEnc = tokenPreviousNonce === 0n ? unlocksAtValue + 1n : (unlocksAtValue === 0n ? 1n : unlocksAtValue);
            const pt = pedersenCommitment5(sharesEnc, nullEnc, skCommit, unlocksEnc, pncCommit);
            previousCommitmentLeaf = await computeCommitmentLeaf(pt, publicClient);
            const exists = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'hasLeaf',
                args: [tokenAddress as `0x${string}`, previousCommitmentLeaf],
            }) as boolean;
            if (!exists) throw new Error('Reconstructed commitment leaf does not exist in contract.');
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

        let proofArr: bigint[];
        try {
            proofArr = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'generateProof',
                args: [tokenAddress as `0x${string}`, commitmentIndex],
            }) as unknown as bigint[];
        } catch {
            const { generateMerkleProof } = await import('@/lib/merkle-proof');
            const res = await generateMerkleProof(contractLeaves, Number(commitmentIndex), 32);
            if (res.root !== expectedRoot) throw new Error('Merkle proof root mismatch');
            proofArr = res.siblings.map(s => BigInt(s));
        }
        const merkleProofFormatted = Array.from({ length: 32 }, (_, i) => (i < proofArr.length ? proofArr[i].toString() : '0'));

        const fmt = (v: bigint | string) => (typeof v === 'bigint' ? v : BigInt((v as string).startsWith('0x') ? v : '0x' + v)).toString();
        const previousSharesEnc = tokenPreviousNonce === 0n ? previousShares + 1n : previousShares;
        // After AbsorbWithdraw(5) or AbsorbSend(4), the leaf was built with the OLD nullifier (circuit reused base3),
        // but the contract stored the NEW nullifier. The send circuit recomputes the leaf from inputs, so it must
        // receive the OLD nullifier to satisfy leaf_eq assertion.
        let nullifierEnc: bigint;
        if (tokenPreviousNonce === 0n) {
            nullifierEnc = nullifierValue + 1n;
        } else if (previousOpType === 5 || previousOpType === 4) {
            const { x: ourX, y: ourY } = parseZkAddress(zkAddress);
            const { noteStackM } = await fetchIncomingNotes(tokenAddr, ourX, ourY, userKeyBigInt);
            nullifierEnc = nullifierValue > noteStackM ? nullifierValue - noteStackM : 0n;
        } else {
            nullifierEnc = nullifierValue;
        }
        const previousUnlocksEnc = tokenPreviousNonce === 0n ? unlocksAtValue + 1n : (unlocksAtValue === 0n ? 1n : unlocksAtValue);
        const leafPassed = contractLeaves[Number(commitmentIndex)] ?? previousCommitmentLeaf;

        const totalRequired = amountBigInt + relayerFeeBigInt + 1n;
        const actualBalance = previousSharesEnc > 0n ? previousSharesEnc - 1n : 0n;

        if (previousSharesEnc < totalRequired) {
            const { x: ourX, y: ourY } = parseZkAddress(zkAddress);
            const { noteStackM, noteStackR } = await fetchIncomingNotes(tokenAddr, ourX, ourY, userKeyBigInt);
            const absorbable = noteStackM > nullifierValue ? noteStackM - nullifierValue : 0n;
            const totalAvailable = actualBalance + absorbable;
            if (amountBigInt + relayerFeeBigInt > totalAvailable) {
                throw new Error(
                    `Insufficient balance (on-chain + absorbable). Available: ${totalAvailable.toString()} shares, required: ${amountBigInt + relayerFeeBigInt}.`
                );
            }
            if (absorbable === 0n) {
                throw new Error(
                    `Insufficient on-chain balance (${actualBalance.toString()} shares) and no absorbable notes. Required: ${amountBigInt + relayerFeeBigInt}.`
                );
            }
            const noteStackPoint = pedersenCommitment(noteStackM, noteStackR);
            const noteStackX = reduceToBn254Field(noteStackPoint.x);
            const noteStackY = reduceToBn254Field(noteStackPoint.y);
            const noteStackLeaf = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'computeCommitmentLeaf',
                args: [noteStackX, noteStackY],
            }) as bigint;
            let noteStackCommitmentIndex: bigint;
            try {
                noteStackCommitmentIndex = await publicClient.readContract({
                    address: ArkanaAddress,
                    abi: ArkanaAbi,
                    functionName: 'getLeafIndex',
                    args: [tokenAddr, noteStackLeaf],
                }) as bigint;
            } catch {
                throw new Error('Note stack leaf not found in tree. Ensure incoming notes are indexed.');
            }
            let noteStackProof: bigint[];
            try {
                noteStackProof = await publicClient.readContract({
                    address: ArkanaAddress,
                    abi: ArkanaAbi,
                    functionName: 'generateProof',
                    args: [tokenAddr, noteStackCommitmentIndex],
                }) as unknown as bigint[];
            } catch {
                const { generateMerkleProof } = await import('@/lib/merkle-proof');
                const res = await generateMerkleProof(contractLeaves, Number(noteStackCommitmentIndex), 32);
                if (res.root !== expectedRoot) throw new Error('Note stack merkle proof root mismatch');
                noteStackProof = res.siblings.map(s => BigInt(s));
            }
            const noteStackMerkleFormatted = Array.from({ length: 32 }, (_, i) => (i < noteStackProof.length ? noteStackProof[i].toString() : '0'));
            const absorbInputs: Record<string, string | string[]> = {
                user_key: fmt(userKeyToUse),
                amount: fmt(amountBigInt),
                previous_nonce: tokenPreviousNonce.toString(),
                current_balance: previousSharesEnc.toString(),
                nullifier: nullifierEnc.toString(),
                previous_unlocks_at: previousUnlocksEnc.toString(),
                previous_commitment_leaf: leafPassed.toString(),
                commitment_index: commitmentIndex.toString(),
                tree_depth: treeDepth.toString(),
                merkle_proof: merkleProofFormatted,
                note_stack_m: noteStackM.toString(),
                note_stack_r: noteStackR.toString(),
                note_stack_commitment_index: noteStackCommitmentIndex.toString(),
                note_stack_merkle_proof: noteStackMerkleFormatted,
                note_stack_x: noteStackX.toString(),
                note_stack_y: noteStackY.toString(),
                token_address: fmt(tokenAddressBigInt),
                chain_id: chainId.toString(),
                expected_root: expectedRoot.toString(),
                receiver_public_key: [receiverX.toString(), receiverY.toString()],
                relayer_fee_amount: fmt(relayerFeeBigInt),
            };
            return { circuit: 'absorb_send' as const, inputs: absorbInputs };
        }

        return {
            circuit: 'send' as const,
            inputs: {
                user_key: fmt(userKeyToUse),
                amount: fmt(amountBigInt),
                previous_nonce: tokenPreviousNonce.toString(),
                previous_shares: previousSharesEnc.toString(),
                nullifier: nullifierEnc.toString(),
                previous_unlocks_at: previousUnlocksEnc.toString(),
                previous_commitment_leaf: leafPassed.toString(),
                commitment_index: commitmentIndex.toString(),
                tree_depth: treeDepth.toString(),
                token_address: fmt(tokenAddressBigInt),
                chain_id: chainId.toString(),
                expected_root: expectedRoot.toString(),
                receiver_public_key: [receiverX.toString(), receiverY.toString()],
                relayer_fee_amount: fmt(relayerFeeBigInt),
                merkle_proof: merkleProofFormatted,
            },
        };
    }, [tokenAddress, amount, receiverZkAddress, relayerFeeAmount, tokenDecimals, zkAddress, publicClient, account?.signature, contextUserKey, userKey, tokenCurrentNonce, balanceEntries, fetchIncomingNotes]);

    const proveSend = useCallback(async () => {
        if (!zkAddress) {
            setProofError('Please sign a message first');
            return;
        }
        if (!tokenAddress || !amount || !receiverZkAddress.trim() || !relayerFeeAmount) {
            setProofError('Please fill token, amount, receiver zkAddress and relayer fee');
            return;
        }
        if (tokenCurrentNonce == null) {
            setProofError('Token nonce not discovered');
            return;
        }
        if (isTokenInitialized === false) {
            setProofError('Token not initialized. Use Initialize first.');
            return;
        }
        try {
            const raw = receiverZkAddress.trim();
            parseZkAddress(raw);
        } catch (e) {
            setProofError('Invalid receiver zkAddress. Expected zk + 128 hex chars (x,y).');
            return;
        }
        try {
            setIsProving(true);
            setProofError(null);
            setProvingTime(null);
            groth16ResultRef.current = null;
            setIsCalculatingInputs(true);
            const start = performance.now();
            const { circuit, inputs } = await calculateCircuitInputs();
            setIsCalculatingInputs(false);
            sendCircuitRef.current = circuit;
            console.log('Send circuit (before proof):', circuit, 'inputs:', inputs);
            const result = await proveWithSnarkjs(inputs, circuit);
            groth16ResultRef.current = result;
            setGroth16Result(result);
            setSendCircuit(circuit);
            setProof('0x01');
            setPublicInputs(result.publicSignals ?? []);
            setProvingTime(Math.round(performance.now() - start));
        } catch (e) {
            console.error('Send proof error:', e);
            setProofError(e instanceof Error ? e.message : 'Failed to generate proof');
        } finally {
            setIsProving(false);
            setIsCalculatingInputs(false);
        }
    }, [zkAddress, tokenAddress, amount, receiverZkAddress, relayerFeeAmount, tokenCurrentNonce, isTokenInitialized, calculateCircuitInputs]);

    const handleSend = useCallback(async () => {
        const groth16 = groth16ResultRef.current;
        if (!groth16?.publicSignals || groth16.publicSignals.length < 17) {
            setTxError('Proof and public inputs required (17 signals). Generate proof first.');
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
            const publicSignals = groth16.publicSignals.slice(0, 17).map((s: string) => BigInt(s)) as [
                bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint
            ];
            const fn = sendCircuitRef.current === 'absorb_send' ? 'absorbSend' : 'send';
            setIsSimulating(true);
            try {
                console.log(`Simulating ${fn}...`);
                const sim = await publicClient.simulateContract({
                    account: address as `0x${string}`,
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: fn,
                    args: [pA, pB, pC, publicSignals],
                });
                setSimulationResult(sim);
                console.log(`${fn} simulation success`, sim);
            } catch (simErr: unknown) {
                const err = simErr as { shortMessage?: string; message?: string };
                const msg = err?.shortMessage ?? err?.message ?? 'Simulation failed';
                console.error(`${fn} simulation failed:`, simErr);
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
                functionName: fn,
                args: [pA, pB, pC, publicSignals],
                gas: BigInt(3_000_000),
            });
        } catch (e) {
            console.error('Error in handleSend:', e);
            setTxError(e instanceof Error ? e.message : 'Send failed');
            setIsSubmitting(false);
        }
    }, [address, publicClient, writeContract]);

    useEffect(() => { if (hash) setTxHash(hash); }, [hash]);
    useEffect(() => {
        if (writeError) {
            setTxError(writeError.message ?? 'Transaction failed');
            setIsSubmitting(false);
        }
    }, [writeError]);
    useEffect(() => { if (isConfirmed) setIsSubmitting(false); }, [isConfirmed]);

    return {
        zkAddress,
        tokenAddress,
        setTokenAddress,
        tokenDecimals,
        amount,
        setAmount,
        receiverZkAddress,
        setReceiverZkAddress,
        relayerFeeAmount,
        setRelayerFeeAmount,
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
        availableBalanceAssets,
        isCalculatingInputs,
        canAbsorb,
        groth16Result,
        sendCircuit,
        proveSend,
        handleSend,
        balanceEntries,
    };
}
