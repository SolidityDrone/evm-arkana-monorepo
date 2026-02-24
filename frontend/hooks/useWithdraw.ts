'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useAccount as useAccountContext, useZkAddress } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { useActiveProfile } from '@/context/ActiveProfileProvider';
import { parseAbi, Address, keccak256, padHex } from 'viem';
import { getChainId } from '@/config';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { useNonceDiscovery, type ArchonPosition } from '@/hooks/useNonceDiscovery';
import { loadAccountData, saveTokenAccountData } from '@/lib/indexeddb';
import { parseZkAddress } from '@/lib/zk-address';
import { convertSharesToAssets } from '@/lib/shares-to-assets';
import { convertAssetsToShares } from '@/lib/shares-to-assets';
import { computePrivateKeyFromSignature, getSpendingKeyCircuit, getViewKeyFromUserKey, poseidonHash, reduceToBn254Field } from '@/lib/circuit-utils';
import { getSignerIdentityFromUserKey, signWithdrawMessage } from '@/lib/eddsa-circuit';
import {
  signingDesktopRound1,
  signingDesktopRound2,
  getWithdrawMessageForThreshold,
  decodeFrostPayload,
  encodeFrostPayload,
  type SigningRound2,
  type SigningRequestPayload,
} from '@/lib/frost-2fa';
import type { SigningRequestPayload as MsigSigningRequestPayload } from '@/lib/frost-multisig';
import { loadTwoFactorData, type TwoFactorData } from '@/lib/indexeddb';
import { proveWithSnarkjs } from '@/lib/circuit-prove';
import type { Groth16Args } from '@/lib/groth16';
import { pedersenCommitment } from '@/lib/pedersen-commitments';

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

    const { computeCurrentNonce, fetchIncomingNotes } = useNonceDiscovery();

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
    const [availableBalanceAssets, setAvailableBalanceAssets] = useState<bigint | null>(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [canAbsorb, setCanAbsorb] = useState(false);

    const groth16ResultRef = useRef<Groth16Args | null>(null);
    const [groth16Result, setGroth16Result] = useState<Groth16Args | null>(null);
    const withdrawCircuitRef = useRef<'withdraw' | 'absorb_withdraw'>('withdraw');
    const [withdrawCircuit, setWithdrawCircuit] = useState<'withdraw' | 'absorb_withdraw'>('withdraw');

    // Archon mode state
    const [withdrawMode, setWithdrawModeInternal] = useState<'mage' | 'archon'>('mage');
    const [archonPositions, setArchonPositions] = useState<ArchonPosition[]>([]);
    const [selectedArchonPosition, setSelectedArchonPositionInternal] = useState<ArchonPosition | null>(null);
    const withdrawModeRef = useRef<'mage' | 'archon'>('mage');
    const selectedArchonPositionRef = useRef<ArchonPosition | null>(null);

    // 2FA state
    const [twoFactorSignOpen, setTwoFactorSignOpen] = useState(false);
    const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
    const [twoFactorSigning, setTwoFactorSigning] = useState(false);
    const twoFactorDataRef = useRef<TwoFactorData | null>(null);
    const signingRound1Ref = useRef<{
        desktopNonceScalar: string;
        round1Data: any;
        signingRequestPayload?: SigningRequestPayload;
        signingAmounts?: { amount: string; fee: string; nonce: string };
    } | null>(null);

    const { balanceEntries } = useAccountState();

    // Multisig signing state
    const [multisigSignOpen, setMultisigSignOpen] = useState(false);
    const [multisigRequest, setMultisigRequest] = useState<MsigSigningRequestPayload | null>(null);

    // Active profile — for multisig, these override the wallet-derived values
    const { effectiveUserKey: msigUserKey, effectiveSignerPubkeyHash: msigSignerPubkeyHash, effectiveZkAddress, activeMultisigProfile } = useActiveProfile();
    const activeZkAddress = effectiveZkAddress ?? zkAddress;

    const setWithdrawMode = useCallback((mode: 'mage' | 'archon') => {
        withdrawModeRef.current = mode;
        setWithdrawModeInternal(mode);
        selectedArchonPositionRef.current = null;
        setSelectedArchonPositionInternal(null);
        setArchonPositions([]);
        setTokenCurrentNonce(null);
        setIsTokenInitialized(null);
    }, []);

    const setSelectedArchonPosition = useCallback((pos: ArchonPosition | null) => {
        selectedArchonPositionRef.current = pos;
        setSelectedArchonPositionInternal(pos);
        if (pos) {
            setTokenCurrentNonce(pos.currentNonce);
            setIsTokenInitialized(true);
        } else {
            setTokenCurrentNonce(null);
            setIsTokenInitialized(null);
        }
    }, []);

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
            if (msigUserKey) {
                setUserKey('0x' + msigUserKey.toString(16));
                return;
            }
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
    }, [zkAddress, account?.signature, userKey, contextUserKey, msigUserKey]);

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

    // Reset archon position when token address changes
    useEffect(() => {
        selectedArchonPositionRef.current = null;
        setSelectedArchonPositionInternal(null);
        if (withdrawModeRef.current === 'archon') {
            setTokenCurrentNonce(null);
            setIsTokenInitialized(null);
        }
    }, [tokenAddress]);

    useEffect(() => {
        const loadTokenNonce = async () => {
            if (!tokenAddress || !activeZkAddress) {
                setTokenCurrentNonce(null);
                setIsTokenInitialized(null);
                return;
            }
            const normalized = tokenAddress.startsWith('0x') ? tokenAddress.toLowerCase() : '0x' + tokenAddress.toLowerCase();

            if (withdrawMode === 'archon') {
                // Archon: discover all positions for this token
                if (!publicClient || !account?.signature) return;
                setIsCheckingTokenState(true);
                setIsTokenInitialized(null);
                try {
                    const result = await computeCurrentNonce(tokenAddress as `0x${string}`, null, [], 'archon');
                    if (result?.archonPositions && result.archonPositions.length > 0) {
                        setArchonPositions(result.archonPositions);
                    } else {
                        setArchonPositions([]);
                        setIsTokenInitialized(false);
                    }
                    // tokenCurrentNonce stays null until user selects a position
                } catch (e) {
                    console.error('Error discovering archon positions for withdraw:', e);
                    setArchonPositions([]);
                    setIsTokenInitialized(false);
                } finally {
                    setIsCheckingTokenState(false);
                }
                return;
            }

            if (!publicClient || !account?.signature) {
                try {
                    const { loadTokenAccountData } = await import('@/lib/indexeddb');
                    const tokenData = await loadTokenAccountData(activeZkAddress!, normalized, 'mage');
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
                const cachedData = await loadAccountData(activeZkAddress!);
                const mageTokenData = cachedData?.mageTokenData || [];
                const tokenData = mageTokenData.find(t => t.tokenAddress.toLowerCase() === normalized);
                const cachedNonce = tokenData?.currentNonce ?? null;
                const cachedBalanceEntries = tokenData?.balanceEntries || [];
                const result = await computeCurrentNonce(tokenAddress as `0x${string}`, cachedNonce, cachedBalanceEntries, 'mage');
                if (result) {
                    await saveTokenAccountData(activeZkAddress!, tokenAddress, result.currentNonce, result.balanceEntries, 'mage');
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
    }, [tokenAddress, activeZkAddress, publicClient, account?.signature, computeCurrentNonce, setBalanceEntries, withdrawMode]);

    // Available balance = current + (incoming - nullifier). Fetch incoming notes when token/zk/nonce/balanceEntries ready.
    useEffect(() => {
        if (!tokenAddress || !activeZkAddress || !tokenCurrentNonce || tokenCurrentNonce === BigInt(0)) {
            setAvailableBalance(null);
            setAvailableBalanceAssets(null);
            setCanAbsorb(false);
            return;
        }
        const tokenAddrBigInt = BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress);
        const prevNonce = tokenCurrentNonce - BigInt(1);

        // For archon mode: use the selected position's balance entries directly
        let entry;
        if (withdrawMode === 'archon' && selectedArchonPosition) {
            entry = selectedArchonPosition.balanceEntries.find(e => {
                const n = typeof e.nonce === 'string' ? BigInt(e.nonce) : e.nonce;
                return n === prevNonce;
            });
        } else {
            entry = balanceEntries.find(e => {
                const a = typeof e.tokenAddress === 'string' ? BigInt(e.tokenAddress) : e.tokenAddress;
                const n = typeof e.nonce === 'string' ? BigInt(e.nonce) : e.nonce;
                return a === tokenAddrBigInt && n === prevNonce;
            });
        }

        const currentShares = entry?.amount != null ? (typeof entry.amount === 'string' ? BigInt(entry.amount) : entry.amount) : BigInt(0);
        const nullifier = (entry as { nullifier?: bigint } | undefined)?.nullifier ?? BigInt(0);

        // Archon mode: just show current shares, no incoming notes
        if (withdrawMode === 'archon') {
            setAvailableBalance(currentShares);
            setCanAbsorb(false);
            return;
        }

        if (!fetchIncomingNotes || !account?.signature || !publicClient) {
            setAvailableBalance(currentShares);
            setCanAbsorb(false);
            return;
        }
        // Show current balance immediately; async will add absorbable
        setAvailableBalance(currentShares);

        let cancelled = false;
        (async () => {
            try {
                const userKeyHex = contextUserKey ? '0x' + contextUserKey.toString(16) : userKey;
                let userKeyBigInt: bigint | null = userKeyHex ? BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex) : null;
                if (!userKeyBigInt && account?.signature) {
                    const hex = await computePrivateKeyFromSignature(account.signature);
                    userKeyBigInt = BigInt(hex.startsWith('0x') ? hex : '0x' + hex);
                }
                if (!userKeyBigInt) {
                    if (!cancelled) setAvailableBalance(currentShares);
                    return;
                }
                const { x: rx, y: ry } = parseZkAddress(activeZkAddress!);
                const { notes } = await fetchIncomingNotes(tokenAddress as `0x${string}`, rx, ry, userKeyBigInt);
                if (cancelled) return;
                const sumIncoming = notes.reduce((acc, n) => acc + n.amount, BigInt(0));
                const absorbable = sumIncoming > nullifier ? sumIncoming - nullifier : BigInt(0);
                const displayBalance = currentShares + absorbable;
                setAvailableBalance(displayBalance);
                setCanAbsorb(absorbable > BigInt(0));
            } catch {
                if (!cancelled) {
                    setAvailableBalance(currentShares);
                    setCanAbsorb(false);
                }
            }
        })();
        return () => { cancelled = true; };
    }, [tokenAddress, activeZkAddress, balanceEntries, tokenCurrentNonce, account?.signature, contextUserKey, userKey, fetchIncomingNotes, publicClient, withdrawMode, selectedArchonPosition]);

    // Convert available balance (shares) to assets for display
    useEffect(() => {
        if (!publicClient || !tokenAddress || availableBalance === null) {
            setAvailableBalanceAssets(null);
            return;
        }
        let cancelled = false;
        convertSharesToAssets(publicClient, tokenAddress as Address, availableBalance).then((assets) => {
            if (!cancelled && assets != null) setAvailableBalanceAssets(assets);
        }).catch(() => {
            if (!cancelled) setAvailableBalanceAssets(null);
        });
        return () => { cancelled = true; };
    }, [publicClient, tokenAddress, availableBalance]);

    const calculateCircuitInputs = useCallback(async (phonePartialSig?: SigningRound2, msigGroupSigningKey?: bigint) => {
        if (!tokenAddress || !amount || !receiverAddress || !receiverFeeAmount || !zkAddress || !publicClient) {
            throw new Error('Missing required fields or client');
        }
        if (tokenCurrentNonce === null) {
            throw new Error('Token nonce not discovered. Wait for token discovery.');
        }
        setIsCalculatingInputs(true);
        try {
        let userKeyToUse: string | null = null;
        if (msigUserKey) {
            userKeyToUse = '0x' + msigUserKey.toString(16);
        } else {
            userKeyToUse = contextUserKey ? '0x' + contextUserKey.toString(16) : userKey;
            if (!userKeyToUse && account?.signature) {
                const hex = await computePrivateKeyFromSignature(account.signature);
                userKeyToUse = hex.startsWith('0x') ? hex : '0x' + hex;
                if (userKeyToUse) setUserKey(userKeyToUse);
            }
        }
        if (!userKeyToUse) throw new Error('Missing userKey. Sign the message first.');

        // For archon mode: override userKey with the selected position's effective userKey (base + offset)
        if (!msigUserKey && withdrawModeRef.current === 'archon' && selectedArchonPositionRef.current) {
            userKeyToUse = '0x' + selectedArchonPositionRef.current.userKey.toString(16);
        }

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
        const tokenAddr = tokenAddress.startsWith('0x') ? (tokenAddress as Address) : (`0x${tokenAddress}` as Address);
        let amountBigInt: bigint;
        let receiverFeeAmountBigInt: bigint;
        // If 2FA signing already happened, reuse the EXACT amounts from signing to guarantee
        // the circuit's message hash matches the signed message hash.
        const storedSigningAmounts = signingRound1Ref.current?.signingAmounts;
        if (phonePartialSig && storedSigningAmounts) {
            amountBigInt = BigInt(storedSigningAmounts.amount);
            receiverFeeAmountBigInt = BigInt(storedSigningAmounts.fee);
            console.log('[FROST calculateCircuitInputs] Using stored signing amounts:', storedSigningAmounts);
        } else {
            const amountInRaw = parseAmount(amount, dec);
            const feeInRaw = parseAmount(receiverFeeAmount, dec);
            const amountShares = await convertAssetsToShares(publicClient, tokenAddr, amountInRaw);
            const feeShares = await convertAssetsToShares(publicClient, tokenAddr, feeInRaw);
            amountBigInt = amountShares ?? amountInRaw;
            receiverFeeAmountBigInt = feeShares ?? feeInRaw;
        }
        const receiverAddressBigInt = BigInt(receiverAddress.startsWith('0x') ? receiverAddress : '0x' + receiverAddress);
        // Use chain block timestamp (+ 1 min buffer) so proof is valid regardless of system clock (contract: 30 min tolerance)
        const block = await publicClient.getBlock({ blockTag: 'latest' });
        const declaredTimeReference = block.timestamp + 60n;

        const userKeyBigInt = BigInt(userKeyToUse.startsWith('0x') ? userKeyToUse : '0x' + userKeyToUse);
        const chainId = BigInt(await publicClient.getChainId());

        let previousSharesForReconstruction: bigint;
        let nullifierValue: bigint;
        let unlocksAtValue: bigint;
        let previousOpType: number = 0;

        // Resolve signer identity: multisig > 2FA > single-key
        let wdSignerHash: string;
        let wdSignerPk: [string, string];
        if (msigSignerPubkeyHash && activeMultisigProfile) {
            wdSignerHash = msigSignerPubkeyHash;
            wdSignerPk = activeMultisigProfile.groupPublicKey;
            twoFactorDataRef.current = null;
        } else {
            const zkAddr = zkAddress?.replace('zk', '') || '';
            const storedTwoFactor = zkAddr ? await loadTwoFactorData(zkAddr) : undefined;
            twoFactorDataRef.current = storedTwoFactor ?? null;
            if (storedTwoFactor?.is2FA) {
                wdSignerHash = storedTwoFactor.signerPubkeyHash;
                wdSignerPk = storedTwoFactor.signerPublicKey;
            } else {
                const signerIdentity = await getSignerIdentityFromUserKey(userKeyBigInt);
                wdSignerHash = signerIdentity.signer_pubkey_hash;
                wdSignerPk = signerIdentity.signer_public_key;
            }
        }

        let sharesFromContract: bigint | undefined;
        if (tokenPreviousNonce === BigInt(0)) {
            const viewKey0 = await getViewKeyFromUserKey(userKeyBigInt);
            const nonceCommitmentBigInt = await poseidonHash([viewKey0, tokenPreviousNonce, tokenAddressBigInt]);
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
            const finalPreviousNonceCommitmentBigInt = await poseidonHash([viewKeyBigInt, tokenPreviousNonce, tokenAddressBigInt]);
            const finalPreviousNonceCommitmentBytes32 = padHex(`0x${finalPreviousNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
            const operationInfo = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getNonceCommitmentInfo',
                args: [finalPreviousNonceCommitmentBytes32],
            }) as [number, bigint, string, `0x${string}`, `0x${string}`, bigint];
            const [opType, sharesMinted, , encryptedBalance, encryptedNullifier] = operationInfo;
            previousOpType = opType;
            let decryptedShares: bigint;
            if (opType === 0) {
                decryptedShares = BigInt(encryptedBalance);
            } else {
                decryptedShares = await poseidonCtrDecrypt(BigInt(encryptedBalance), viewKeyBigInt, 0);
            }
            previousSharesForReconstruction = (opType === 0 || opType === 1) ? decryptedShares + sharesMinted : decryptedShares;
            const prevNonceCommitmentBigInt = await poseidonHash([viewKeyBigInt, tokenPreviousNonce, tokenAddressBigInt]);
            const prevNonceCommitmentBytes32 = padHex(`0x${prevNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
            const [, , , , prevEncryptedNullifier] = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'getNonceCommitmentInfo',
                args: [prevNonceCommitmentBytes32],
            }) as [number, bigint, string, `0x${string}`, `0x${string}`, bigint];
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
            const spendingKeyForCommit = await getSpendingKeyCircuit(userKeyBigInt, chainId, tokenAddressBigInt, wdSignerHash);
            const viewKeyForCommit = await getViewKeyFromUserKey(userKeyBigInt);
            const prevNonceCommitmentBigInt = await poseidonHash([viewKeyForCommit, tokenPreviousNonce, tokenAddressBigInt]);
            const sharesEncodedForLeaf = previousSharesForReconstruction; // No encoding, use 0 directly
            // After AbsorbWithdraw(5) or AbsorbSend(4), the new commitment reuses base3 with OLD nullifier but we store NEW nullifier; use old = new - noteStackM for leaf
            let nullifierEncodedForLeaf: bigint;
            if (tokenPreviousNonce === BigInt(0)) {
                nullifierEncodedForLeaf = nullifierValue; // Use 0 directly, no encoding
            } else if (previousOpType === 5 || previousOpType === 4) {
                const { x: ourX, y: ourY } = parseZkAddress(activeZkAddress!);
                const { noteStackM } = await fetchIncomingNotes(tokenAddr, ourX, ourY, userKeyBigInt);
                nullifierEncodedForLeaf = nullifierValue > noteStackM ? nullifierValue - noteStackM : BigInt(0);
            } else {
                nullifierEncodedForLeaf = nullifierValue;
            }
            const unlocksAtEncodedForLeaf = unlocksAtValue; // Use 0 directly, no encoding
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

        const formatFieldElement = (value: bigint | string): string =>
            typeof value === 'bigint' ? value.toString() : BigInt(value.startsWith('0x') ? value : '0x' + value).toString();

        const previousSharesEncoded = previousSharesForReconstruction; // No encoding, use 0 directly
        // After AbsorbWithdraw(5) or AbsorbSend(4), the leaf was built with the OLD nullifier (circuit reused base3),
        // but the contract stored the NEW nullifier. The withdraw circuit recomputes the leaf from inputs, so it must
        // receive the OLD nullifier to satisfy leaf_eq at circom withdraw.circom line 113.
        let nullifierEncoded: bigint;
        if (tokenPreviousNonce === BigInt(0)) {
            nullifierEncoded = nullifierValue; // Use 0 directly, no encoding
        } else if (previousOpType === 5 || previousOpType === 4) {
            const { x: ourX, y: ourY } = parseZkAddress(activeZkAddress!);
            const { noteStackM } = await fetchIncomingNotes(tokenAddr, ourX, ourY, userKeyBigInt);
            nullifierEncoded = nullifierValue > noteStackM ? nullifierValue - noteStackM : BigInt(0);
        } else {
            nullifierEncoded = nullifierValue;
        }
        const previousUnlocksAtEncoded = unlocksAtValue; // Use 0 directly, no encoding

        const leafFromContract = contractLeaves[Number(commitmentIndex)];
        const previousCommitmentLeafPassed = leafFromContract ?? previousCommitmentLeaf;

        // Withdraw circuit asserts: previous_shares >= amount + relayer_fee_amount (no encoding)
        const previousSharesNum = BigInt(previousSharesEncoded);
        const totalRequired = amountBigInt + receiverFeeAmountBigInt; // No encoding
        const actualBalance = previousSharesNum; // No encoding

        if (previousSharesNum < totalRequired) {
            // Try absorb_withdraw: need absorbable notes to cover the shortfall
            const { x: receiverX, y: receiverY } = parseZkAddress(activeZkAddress!);
            const { noteStackM, noteStackR } = await fetchIncomingNotes(
                tokenAddr,
                receiverX,
                receiverY,
                userKeyBigInt
            );
            const absorbable = noteStackM > nullifierValue ? noteStackM - nullifierValue : BigInt(0);
            const totalAvailable = actualBalance + absorbable;
            if (amountBigInt + receiverFeeAmountBigInt > totalAvailable) {
                throw new Error(
                    `Insufficient balance (on-chain + absorbable). Available: ${totalAvailable.toString()} shares, required: ${amountBigInt + receiverFeeAmountBigInt}.`
                );
            }
            if (absorbable === BigInt(0)) {
                throw new Error(
                    `Insufficient on-chain balance (${actualBalance.toString()} shares) and no absorbable notes. Required: ${amountBigInt + receiverFeeAmountBigInt}.`
                );
            }
            // Build absorb_withdraw inputs. current_balance for commitment = same encoding as leaf (previousSharesEncoded)
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
            const noteStackMerkleFormatted: string[] = [];
            for (let i = 0; i < 32; i++) {
                noteStackMerkleFormatted.push(i < noteStackProof.length ? noteStackProof[i].toString() : '0');
            }
            const currentNonceForAbsorbSig = (tokenPreviousNonce + BigInt(1)).toString();
            let absorbWdSig: { signature: [string, string, string]; message: string };
            if (msigGroupSigningKey) {
                absorbWdSig = await signWithdrawMessage(
                    msigGroupSigningKey, tokenAddressBigInt.toString(), chainId.toString(),
                    amountBigInt.toString(), receiverFeeAmountBigInt.toString(), currentNonceForAbsorbSig,
                    BigInt(arbitraryCalldataHash).toString(),
                    receiverAddressBigInt.toString(),
                );
            } else if (twoFactorDataRef.current?.is2FA && phonePartialSig) {
                // Threshold signing: combine partial signatures
                const message = await getWithdrawMessageForThreshold(
                    tokenAddressBigInt.toString(), chainId.toString(),
                    amountBigInt.toString(), receiverFeeAmountBigInt.toString(), currentNonceForAbsorbSig,
                    BigInt(arbitraryCalldataHash).toString(),
                    receiverAddressBigInt.toString(),
                );
                const round1 = signingRound1Ref.current!;
                absorbWdSig = await signingDesktopRound2(
                    twoFactorDataRef.current.browserShare,
                    round1.desktopNonceScalar,
                    phonePartialSig,
                    round1.round1Data,
                );
            } else {
                absorbWdSig = await signWithdrawMessage(
                    userKeyBigInt, tokenAddressBigInt.toString(), chainId.toString(),
                    amountBigInt.toString(), receiverFeeAmountBigInt.toString(), currentNonceForAbsorbSig,
                    BigInt(arbitraryCalldataHash).toString(),
                    receiverAddressBigInt.toString(),
                );
            }
            const absorbInputs: Record<string, string | string[]> = {
                user_key: formatFieldElement(userKeyToUse),
                signer_pubkey_hash: wdSignerHash,
                signer_public_key: [wdSignerPk[0], wdSignerPk[1]],
                signature: absorbWdSig.signature,
                previous_nonce: tokenPreviousNonce.toString(),
                current_balance: previousSharesEncoded.toString(),
                nullifier: nullifierEncoded.toString(),
                previous_unlocks_at: previousUnlocksAtEncoded.toString(),
                previous_commitment_leaf: previousCommitmentLeafPassed.toString(),
                commitment_index: commitmentIndex.toString(),
                tree_depth: treeDepth.toString(),
                merkle_proof: merkleProofFormatted,
                note_stack_m: noteStackM.toString(),
                note_stack_r: noteStackR.toString(),
                note_stack_commitment_index: noteStackCommitmentIndex.toString(),
                note_stack_merkle_proof: noteStackMerkleFormatted,
                note_stack_x: noteStackX.toString(),
                note_stack_y: noteStackY.toString(),
                token_address: formatFieldElement(tokenAddressBigInt),
                amount: formatFieldElement(amountBigInt),
                chain_id: chainId.toString(),
                expected_root: expectedRoot.toString(),
                declared_time_reference: declaredTimeReference.toString(),
                arbitrary_calldata_hash: formatFieldElement(BigInt(arbitraryCalldataHash)),
                receiver_address: formatFieldElement(receiverAddressBigInt),
                relayer_fee_amount: formatFieldElement(receiverFeeAmountBigInt),
            };
            return { circuit: 'absorb_withdraw' as const, inputs: absorbInputs };
        }

        const currentNonceForSig = (tokenPreviousNonce + BigInt(1)).toString();
        console.log('[FROST calculateCircuitInputs] Circuit message inputs:', {
            tokenAddress_decimal: tokenAddressBigInt.toString(),
            chainId: chainId.toString(),
            amount: amountBigInt.toString(),
            fee: receiverFeeAmountBigInt.toString(),
            previousNonce: tokenPreviousNonce.toString(),
            currentNonceForSig,
            signerPubkeyHash: wdSignerHash,
            signerPublicKey: wdSignerPk,
        });
        let wdSig: { signature: [string, string, string]; message: string };
        if (msigGroupSigningKey) {
            wdSig = await signWithdrawMessage(
                msigGroupSigningKey, tokenAddressBigInt.toString(), chainId.toString(),
                amountBigInt.toString(), receiverFeeAmountBigInt.toString(), currentNonceForSig,
                BigInt(arbitraryCalldataHash).toString(),
                receiverAddressBigInt.toString(),
            );
        } else if (twoFactorDataRef.current?.is2FA && phonePartialSig) {
            // Threshold signing: combine partial signatures
            const message = await getWithdrawMessageForThreshold(
                tokenAddressBigInt.toString(), chainId.toString(),
                amountBigInt.toString(), receiverFeeAmountBigInt.toString(), currentNonceForSig,
                BigInt(arbitraryCalldataHash).toString(),
                receiverAddressBigInt.toString(),
            );
            console.log('[FROST calculateCircuitInputs] Recomputed message hash:', message);
            console.log('[FROST calculateCircuitInputs] Original signing message from round1:', signingRound1Ref.current?.round1Data?.message);
            console.log('[FROST calculateCircuitInputs] Messages match:', message === signingRound1Ref.current?.round1Data?.message);
            const round1 = signingRound1Ref.current!;
            wdSig = await signingDesktopRound2(
                twoFactorDataRef.current.browserShare,
                round1.desktopNonceScalar,
                phonePartialSig,
                round1.round1Data,
            );
        } else {
            wdSig = await signWithdrawMessage(
                userKeyBigInt, tokenAddressBigInt.toString(), chainId.toString(),
                amountBigInt.toString(), receiverFeeAmountBigInt.toString(), currentNonceForSig,
                BigInt(arbitraryCalldataHash).toString(),
                receiverAddressBigInt.toString(),
            );
        }
        return {
            circuit: 'withdraw' as const,
            inputs: {
                user_key: formatFieldElement(userKeyToUse),
                signer_pubkey_hash: wdSignerHash,
                signer_public_key: [wdSignerPk[0], wdSignerPk[1]],
                signature: wdSig.signature,
                token_address: formatFieldElement(tokenAddressBigInt),
                amount: formatFieldElement(amountBigInt),
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
                receiver_address: formatFieldElement(receiverAddressBigInt),
                relayer_fee_amount: formatFieldElement(receiverFeeAmountBigInt),
                arbitrary_calldata_hash: formatFieldElement(BigInt(arbitraryCalldataHash)),
            },
        };
    } finally {
        setIsCalculatingInputs(false);
    }
    }, [
        tokenAddress, amount, receiverAddress, receiverFeeAmount, arbitraryCalldataHash, tokenDecimals,
        zkAddress, publicClient, account?.signature, contextUserKey, userKey, tokenCurrentNonce, balanceEntries,
        fetchIncomingNotes, msigUserKey, msigSignerPubkeyHash, activeMultisigProfile,
    ]);

    const runWithdrawProof = useCallback(async (phonePartialSig?: SigningRound2, msigGroupSigningKey?: bigint) => {
        try {
            setIsProving(true);
            setProofError(null);
            setProvingTime(null);
            groth16ResultRef.current = null;
            const startTime = performance.now();
            const { circuit, inputs } = await calculateCircuitInputs(phonePartialSig, msigGroupSigningKey);
            withdrawCircuitRef.current = circuit;
            console.log('Circuit (before proof):', circuit, 'inputs:', inputs);
            const result = await proveWithSnarkjs(inputs, circuit);
            groth16ResultRef.current = result;
            setGroth16Result(result);
            setWithdrawCircuit(circuit);
            setProof('0x01');
            setPublicInputs(result.publicSignals ?? []);
            setProvingTime(Math.round(performance.now() - startTime));
        } catch (e) {
            console.error('Error generating withdraw proof:', e);
            const msg = e instanceof Error ? e.message : 'Failed to generate proof';
            if (msg.includes('Assert Failed') && msg.includes('Withdraw')) {
                setProofError(
                    msg + ' Usually this means: (1) amount + fee exceeds your on-chain balance, or (2) reconstructed commitment leaf does not match the tree (wrong nonce/state). Try a smaller amount or ensure token discovery has finished.'
                );
            } else {
                setProofError(msg);
            }
        } finally {
            setIsProving(false);
        }
    }, [calculateCircuitInputs]);

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
        // Check if multisig profile is active
        if (activeMultisigProfile && msigSignerPubkeyHash) {
            if (!publicClient || tokenDecimals === null) {
                setProofError('Public client or token decimals not available');
                return;
            }
            const parseAmountLocal = (value: string, decimals: number): bigint => {
                if (!value || value === '') return BigInt(0);
                const sanitized = (value || '').trim().replace(',', '.');
                if (!/^\d+\.?\d*$/.test(sanitized)) return BigInt(0);
                const parts = sanitized.split('.');
                if (parts.length === 1) return BigInt(sanitized) * BigInt(10 ** decimals);
                const intPart = parts[0] || '0';
                const decPart = (parts[1] || '').slice(0, decimals).padEnd(decimals, '0');
                return BigInt(intPart) * BigInt(10 ** decimals) + BigInt(decPart);
            };
            const tokenAddr = (tokenAddress.startsWith('0x') ? tokenAddress : `0x${tokenAddress}`) as `0x${string}`;
            const amountInRaw = parseAmountLocal(amount, tokenDecimals);
            const feeInRaw = parseAmountLocal(receiverFeeAmount, tokenDecimals);
            const amountShares = await convertAssetsToShares(publicClient, tokenAddr, amountInRaw);
            const feeShares = await convertAssetsToShares(publicClient, tokenAddr, feeInRaw);
            const msigRequest: MsigSigningRequestPayload = {
                type: 'msig-sign-request',
                profileId: activeMultisigProfile.profileId,
                tokenAddress: BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress).toString(),
                amount: (amountShares ?? amountInRaw).toString(),
                fee: (feeShares ?? feeInRaw).toString(),
                nonce: tokenCurrentNonce!.toString(),
                calldataHash: BigInt(arbitraryCalldataHash).toString(),
                receiver: BigInt(receiverAddress.startsWith('0x') ? receiverAddress : '0x' + receiverAddress).toString(),
            };
            setMultisigRequest(msigRequest);
            setMultisigSignOpen(true);
            return;
        }
        // Check if 2FA is active
        const zkAddr = zkAddress?.replace('zk', '') || '';
        const stored2FA = zkAddr ? await loadTwoFactorData(zkAddr) : undefined;
        if (stored2FA?.is2FA) {
            twoFactorDataRef.current = stored2FA;
            setTwoFactorError(null);
            
            if (!publicClient) {
                setProofError('Public client not available');
                return;
            }
            
            // Get chainId
            const chainIdForSig = await publicClient.getChainId();
            
            // Convert decimal amounts to BigInt and then to shares (must match calculateCircuitInputs)
            if (tokenDecimals === null) {
                setProofError('Token decimals not loaded');
                return;
            }
            const parseAmount = (value: string, decimals: number): bigint => {
                if (!value || value === '') return BigInt(0);
                const sanitized = (value || '').trim().replace(',', '.');
                if (!/^\d+\.?\d*$/.test(sanitized)) return BigInt(0);
                const parts = sanitized.split('.');
                if (parts.length === 1) return BigInt(sanitized) * BigInt(10 ** decimals);
                const intPart = parts[0] || '0';
                const decPart = (parts[1] || '').slice(0, decimals).padEnd(decimals, '0');
                return BigInt(intPart) * BigInt(10 ** decimals) + BigInt(decPart);
            };
            const tokenAddr = (tokenAddress.startsWith('0x') ? tokenAddress : `0x${tokenAddress}`) as `0x${string}`;
            const amountInRaw = parseAmount(amount, tokenDecimals);
            const feeInRaw = parseAmount(receiverFeeAmount, tokenDecimals);
            const amountShares = await convertAssetsToShares(publicClient, tokenAddr, amountInRaw);
            const feeShares = await convertAssetsToShares(publicClient, tokenAddr, feeInRaw);
            const amountBigInt = amountShares ?? amountInRaw;
            const receiverFeeAmountBigInt = feeShares ?? feeInRaw;
            
            // Signing nonce = tokenPreviousNonce + 1 = tokenCurrentNonce
            // (calculateCircuitInputs sets previous_nonce = tokenCurrentNonce - 1,
            //  and the circuit computes current_nonce = previous_nonce + 1 = tokenCurrentNonce)
            const currentNonce = tokenCurrentNonce!.toString();
            console.log('[FROST proveWithdraw] Signing message inputs:', {
                tokenAddress,
                tokenAddress_asBigInt: BigInt(tokenAddress.startsWith('0x') ? tokenAddress : '0x' + tokenAddress).toString(),
                chainId: chainIdForSig.toString(),
                amount: amountBigInt.toString(),
                fee: receiverFeeAmountBigInt.toString(),
                currentNonce,
                tokenCurrentNonce: tokenCurrentNonce!.toString(),
                groupPublicKey: stored2FA.signerPublicKey,
                browserShare_prefix: stored2FA.browserShare.slice(0, 16) + '...',
            });
            const arbitraryCalldataHashForSig = BigInt(arbitraryCalldataHash).toString();
            const receiverAddrForSig = BigInt(receiverAddress.startsWith('0x') ? receiverAddress : '0x' + receiverAddress).toString();
            const message = await getWithdrawMessageForThreshold(
                tokenAddress, chainIdForSig.toString(),
                amountBigInt.toString(), receiverFeeAmountBigInt.toString(), currentNonce,
                arbitraryCalldataHashForSig,
                receiverAddrForSig,
            );
            console.log('[FROST proveWithdraw] Message hash:', message);
            const round1 = await signingDesktopRound1(message, stored2FA.signerPublicKey);
            
            // Convert SigningRound1 to SigningRequestPayload for the modal
            const signingRequestPayload: SigningRequestPayload = {
                type: 'signing-request',
                message: round1.round1Data.message,
                desktopNonce: round1.round1Data.desktopNonce,
                groupPublicKey: round1.round1Data.groupPublicKey,
            };
            
            signingRound1Ref.current = {
                ...round1,
                signingRequestPayload,
                signingAmounts: {
                    amount: amountBigInt.toString(),
                    fee: receiverFeeAmountBigInt.toString(),
                    nonce: currentNonce,
                },
            };
            
            setTwoFactorSignOpen(true);
            return;
        }
        await runWithdrawProof();
    }, [zkAddress, tokenAddress, amount, receiverAddress, receiverFeeAmount, arbitraryCalldataHash, tokenCurrentNonce, isTokenInitialized, tokenDecimals, publicClient, runWithdrawProof, activeMultisigProfile, msigSignerPubkeyHash, convertAssetsToShares]);

    const onMultisigSigningKeyReady = useCallback(async (signingKey: bigint) => {
        setMultisigSignOpen(false);
        await runWithdrawProof(undefined, signingKey);
    }, [runWithdrawProof]);

    const onTwoFactorWithdrawSign = useCallback(async (phoneResponse: string) => {
        setTwoFactorSigning(true);
        setTwoFactorError(null);
        try {
            const decoded = decodeFrostPayload(phoneResponse.trim());
            if (!decoded || decoded.type !== 'signing-response') {
                setTwoFactorError('Invalid response from phone. Expected partial signature.');
                setTwoFactorSigning(false);
                return;
            }
            const phonePartialSig: SigningRound2 = {
                phoneNonce: decoded.phoneNonce,
                phonePartialSig: decoded.phonePartialSig,
            };
            
            setTwoFactorSignOpen(false);
            await runWithdrawProof(phonePartialSig);
        } catch (err: any) {
            setTwoFactorError(err?.message || 'Signing failed. Check the phone response.');
            setTwoFactorSignOpen(true);
        } finally {
            setTwoFactorSigning(false);
        }
    }, [runWithdrawProof]);

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

            const fn = withdrawCircuitRef.current === 'absorb_withdraw' ? 'absorbWithdraw' : 'withdraw';
            setIsSimulating(true);
            try {
                console.log(`Simulating ${fn}...`, { publicSignalsCount: publicSignalsTuple.length, callDataLength: callData.length });
                const sim = await publicClient.simulateContract({
                    account: address as `0x${string}`,
                    address: ArkanaAddress as `0x${string}`,
                    abi: ArkanaAbi,
                    functionName: fn,
                    args: [pA, pB, pC, publicSignalsTuple, callData],
                });
                setSimulationResult(sim);
                console.log(`${fn} simulation success`, sim);
            } catch (simErr: unknown) {
                const err = simErr as { shortMessage?: string; message?: string; details?: string; cause?: unknown };
                const msg = err?.shortMessage ?? err?.message ?? (err?.details as string) ?? (err?.cause as Error)?.message ?? 'Simulation failed';
                console.error(`${fn} simulation failed:`, simErr);
                console.error(`${fn} simulation error message:`, msg);
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
        availableBalanceAssets,
        isLoadingBalance,
        isCalculatingInputs,
        canAbsorb,
        groth16Result,
        withdrawCircuit,
        proveWithdraw,
        handleWithdraw,
        balanceEntries,
        // 2FA
        twoFactorSignOpen,
        setTwoFactorSignOpen,
        twoFactorError,
        twoFactorSigning,
        onTwoFactorWithdrawSign,
        twoFactorSigningRequest: signingRound1Ref.current?.signingRequestPayload || null,
        // Multisig
        multisigSignOpen,
        setMultisigSignOpen,
        multisigRequest,
        activeMultisigProfile,
        onMultisigSigningKeyReady,
        // Archon mode
        withdrawMode,
        setWithdrawMode,
        archonPositions,
        selectedArchonPosition,
        setSelectedArchonPosition,
    };
}
