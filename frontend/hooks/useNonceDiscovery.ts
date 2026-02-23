'use client';

import { useState, useCallback } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { pedersenCommitmentNonHiding, grumpkinAddPoints, aggregateOpeningValue, GrumpkinPoint } from '@/lib/pedersen-commitments';
import { BJJ_IDENTITY, DEFAULT_NONCE_DISCOVERY_POINT, bjjAdd, nonceDiscoveryEntryBJJ, type BJJPoint } from '@/lib/bjj-nonce-discovery';
import { useZkAddress, useAccount as useAccountContext } from '@/context/AccountProvider';
import { poseidonCtrDecrypt } from '@/lib/poseidon-ctr-encryption';
import { DiscoveryMode, type IncomingNote } from '@/lib/indexeddb';
import { getSpendingKeyCircuit, poseidonHash } from '@/lib/circuit-utils';
import { getSignerIdentityFromUserKey } from '@/lib/eddsa-circuit';
import { loadTwoFactorData } from '@/lib/indexeddb';
import { computeSharedKeyHashForNote } from '@/lib/crypto-keys';
import { keccak256, encodePacked } from 'viem';
import { useActiveProfile } from '@/context/ActiveProfileProvider';
export interface BalanceEntry {
  tokenAddress: bigint;
  amount: bigint;
  nonce: bigint;
  /** Decrypted nullifier for this commitment (from encryptedStateDetails, counter 1) */
  nullifier?: bigint;
}

export interface ArchonPosition {
  /** Horizontal offset from base user_key (starts at 1) */
  userKeyOffset: bigint;
  /** Effective user_key for this position (base + offset) */
  userKey: bigint;
  /** Next unused nonce for this position */
  currentNonce: bigint;
  /** Decrypted balance entries for this position */
  balanceEntries: BalanceEntry[];
  /** Unix timestamp when this position can be withdrawn; 0 = no lock */
  unlockAt: bigint;
}

export interface PersonalCommitmentState {
  personal_c_tot: [bigint, bigint];
  personal_c_inner: [bigint, bigint];
  personal_c_outer: [bigint, bigint];
  personal_c_inner_m: bigint;
  personal_c_outer_m: bigint;
  personal_c_outer_r: bigint;
}

export function useNonceDiscovery() {
  const [isComputing, setIsComputing] = useState(false);
  const [currentNonce, setCurrentNonce] = useState<bigint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonceDiscoveryPoint, setNonceDiscoveryPoint] = useState<BJJPoint | null>(null);
  const [aggregatedM, setAggregatedM] = useState<bigint | null>(null);
  const [aggregatedR, setAggregatedR] = useState<bigint | null>(null);
  const [balanceEntries, setBalanceEntries] = useState<BalanceEntry[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const publicClient = usePublicClient();
  const { address } = useAccount();
  const zkAddress = useZkAddress();
  const { account } = useAccountContext();
  const { activeMultisigProfile, effectiveUserKey: msigUserKey, effectiveZkAddress } = useActiveProfile();

  const computePrivateKeyFromSignature = useCallback(async (signature: string): Promise<bigint> => {
    const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
    await ensureBufferPolyfill();

    if (typeof window === 'undefined' || !globalThis.Buffer) {
      throw new Error('Buffer is not available after polyfill');
    }

    const sigHex = signature.startsWith('0x') ? signature.slice(2) : signature;
    const sigBuffer = globalThis.Buffer.from(sigHex, 'hex');

    if (sigBuffer.length !== 65) {
      throw new Error(`Signature must be 65 bytes, got ${sigBuffer.length}`);
    }

    const chunk1 = sigBuffer.slice(0, 31);
    const chunk2 = sigBuffer.slice(31, 62);
    const chunk3 = sigBuffer.slice(62, 65);

    const chunk1BigInt = BigInt('0x' + chunk1.toString('hex'));
    const chunk2BigInt = BigInt('0x' + chunk2.toString('hex'));
    const chunk3BigInt = BigInt('0x' + chunk3.toString('hex'));

    const privateKey = await poseidonHash([chunk1BigInt, chunk2BigInt, chunk3BigInt]);
    return privateKey;
  }, []);

  const toBigInt = (hash: any): bigint => {
    if (typeof hash === 'bigint') return hash;
    if (hash != null && 'toBigInt' in hash && typeof hash.toBigInt === 'function') return hash.toBigInt();
    if (hash != null && 'value' in hash) return BigInt(hash.value);
    return BigInt(hash.toString());
  };

  // spending_key = Poseidon4(user_key, chain_id, token_address, signer_pubkey_hash)
  const getSpendingKeyForDiscovery = useCallback(
    async (userKey: bigint, chainId: bigint, tokenAddress: bigint): Promise<bigint> => {
      // Multisig: use the group's signer_pubkey_hash directly
      if (activeMultisigProfile?.signerPubkeyHash) {
        return getSpendingKeyCircuit(userKey, chainId, tokenAddress, activeMultisigProfile.signerPubkeyHash);
      }
      // Single/2FA: check 2FA data for override, then derive from user_key
      const zkAddr = zkAddress?.replace('zk', '') || '';
      const stored2FA = zkAddr ? await loadTwoFactorData(zkAddr) : undefined;
      const signerHash = stored2FA?.is2FA
        ? stored2FA.signerPubkeyHash
        : (await getSignerIdentityFromUserKey(userKey)).signer_pubkey_hash;
      return getSpendingKeyCircuit(userKey, chainId, tokenAddress, signerHash);
    },
    [zkAddress, activeMultisigProfile]
  );

  const getNonceCommitmentForDiscovery = useCallback(
    async (spendingKey: bigint, nonce: bigint, tokenAddress: bigint): Promise<bigint> => {
      const h = await poseidonHash([spendingKey, nonce, tokenAddress]);
      return toBigInt(h);
    },
    []
  );

  const readNonceDiscoveryFromContract = useCallback(async (tokenAddress: `0x${string}`) => {
    if (!publicClient) {
      throw new Error('Public client not available');
    }

    try {
      const result = await publicClient.readContract({
        address: ArkanaAddress,
        abi: ArkanaAbi,
        functionName: 'getNonceDiscoveryInfo',
        args: [tokenAddress],
      }) as [bigint, bigint, bigint, bigint];

      const [x, y, m, r] = result;

      return {
        point: { x, y } as BJJPoint,
        aggregatedM: m,
        aggregatedR: r,
      };
    } catch (err) {
      console.error('Error reading nonce discovery info:', err);
      // Same default as Arkana.sol getNonceDiscoveryInfo (DEFAULT_NONCE_DISCOVERY_* with M=1, R=1)
      return {
        point: DEFAULT_NONCE_DISCOVERY_POINT,
        aggregatedM: BigInt(1),
        aggregatedR: BigInt(1),
      };
    }
  }, [publicClient]);

  /**
   * Fetch and decrypt incoming notes for a token (receiver = our zkAddress).
   * Uses pubkey_reference_hash = keccak256(abi.encodePacked(receiverX, receiverY)), then
   * getIncomingNotesCount + tokenUserEncryptedNotes(index), ECDH with sender pubkey to get shared_key_hash, decrypt amount.
   * Returns list of IncomingNote (amount, sharedKeyHash for absorb opening) and aggregated (note_stack_m, note_stack_r).
   */
  const fetchIncomingNotes = useCallback(
    async (
      tokenAddress: `0x${string}`,
      receiverPublicKeyX: bigint,
      receiverPublicKeyY: bigint,
      receiverPrivateKey: bigint
    ): Promise<{ notes: IncomingNote[]; noteStackM: bigint; noteStackR: bigint }> => {
      if (!publicClient) throw new Error('Public client not available');

      const pubkeyHash = keccak256(
        encodePacked(
          ['uint256', 'uint256'],
          [receiverPublicKeyX, receiverPublicKeyY]
        )
      ) as `0x${string}`;

      const count = await publicClient.readContract({
        address: ArkanaAddress,
        abi: ArkanaAbi,
        functionName: 'getIncomingNotesCount',
        args: [tokenAddress, pubkeyHash],
      }) as bigint;

      const notes: IncomingNote[] = [];
      let noteStackM = BigInt(0);
      let noteStackR = BigInt(0);

      for (let i = 0; i < Number(count); i++) {
        const raw = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'tokenUserEncryptedNotes',
          args: [tokenAddress, pubkeyHash, BigInt(i)],
        });
        const encryptedAmount = Array.isArray(raw) ? raw[0] : (raw as any).encryptedAmountForReceiver;
        const senderPk = Array.isArray(raw) ? raw[1] : (raw as any).senderPublicKey;
        const senderX = typeof senderPk === 'object' && senderPk !== null && 'x' in senderPk ? senderPk.x : senderPk[0];
        const senderY = typeof senderPk === 'object' && senderPk !== null && 'y' in senderPk ? senderPk.y : senderPk[1];

        const sharedKeyHash = await computeSharedKeyHashForNote(
          receiverPrivateKey,
          BigInt(senderX),
          BigInt(senderY)
        );
        const amount = await poseidonCtrDecrypt(
          BigInt(encryptedAmount),
          sharedKeyHash,
          0
        );

        notes.push({
          tokenAddress,
          amount,
          sharedKeyHash,
          senderPublicKey: { x: BigInt(senderX), y: BigInt(senderY) },
          index: i,
        });
        noteStackM += amount;
        noteStackR += sharedKeyHash;
      }

      return { notes, noteStackM, noteStackR };
    },
    [publicClient]
  );

  const decryptBalances = useCallback(async (highestNonce: bigint, userKey: bigint, lowestNonce: bigint = BigInt(0), tokenAddress: bigint) => {
    if (!publicClient || (!msigUserKey && !account?.signature)) {
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
      await ensureBufferPolyfill();

      const VIEW_STRING = BigInt('0x76696577696e675f6b6579');
      const viewKeyBigInt = await poseidonHash([VIEW_STRING, userKey]);
      const entries: BalanceEntry[] = [];
      const chainId = BigInt(await publicClient.getChainId());

      for (let nonce = BigInt(0); nonce <= highestNonce; nonce++) {
        const spendingKeyBigInt = await getSpendingKeyForDiscovery(userKey, chainId, tokenAddress);
        const nonceCommitmentBigInt = await getNonceCommitmentForDiscovery(spendingKeyBigInt, nonce, tokenAddress);

        const { padHex: padHexState } = await import('viem');
        const nonceCommitmentBytes32ForState = padHexState(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

        const encryptedState = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'encryptedStateDetails',
          args: [nonceCommitmentBytes32ForState],
        }) as [`0x${string}`, `0x${string}`];

        const encryptedBalance = BigInt(encryptedState[0]);
        const encryptedNullifier = BigInt(encryptedState[1]);
        const encryptedTokenAddress = tokenAddress;

        const nullifier = await poseidonCtrDecrypt(encryptedNullifier, viewKeyBigInt, 1);

        let amount: bigint;
        let decryptedTokenAddress: bigint;

        if (nonce === BigInt(0)) {
          amount = encryptedBalance;
          decryptedTokenAddress = encryptedTokenAddress;
        } else {
          const previousShares = await poseidonCtrDecrypt(encryptedBalance, viewKeyBigInt, 0);
          const { padHex: padHexForInfo } = await import('viem');
          const nonceCommitmentBytes32ForInfo = padHexForInfo(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

          const operationInfo = await publicClient.readContract({
            address: ArkanaAddress,
            abi: ArkanaAbi,
            functionName: 'getNonceCommitmentInfo',
            args: [nonceCommitmentBytes32ForInfo],
          }) as [number, bigint, string, `0x${string}`, `0x${string}`, bigint];

          const [operationType, sharesMinted] = operationInfo;

          if (operationType === 0 || operationType === 1) {
            amount = previousShares + sharesMinted;
          } else {
            amount = previousShares;
          }

          decryptedTokenAddress = tokenAddress;
        }

        entries.push({ tokenAddress: decryptedTokenAddress, amount, nonce, nullifier });
      }

      setBalanceEntries(entries);
      return entries;
    } catch (error) {
      console.error('Error decrypting balances:', error);
      setError(error instanceof Error ? error.message : 'Failed to decrypt balances');
      return [];
    } finally {
      setIsDecrypting(false);
    }
  }, [publicClient, account?.signature, msigUserKey, getSpendingKeyForDiscovery]);

  const computeCurrentNonceArchon = useCallback(async (tokenAddress: `0x${string}`, _cachedNonce: bigint | null = null, _cachedBalanceEntries: BalanceEntry[] = [], _cachedUserKeyOffset: bigint | null = null) => {
    setIsComputing(true);
    setError(null);

    try {
      const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
      await ensureBufferPolyfill();

      if (!publicClient) {
        throw new Error('Public client not available.');
      }

      if (!msigUserKey && !account?.signature) {
        throw new Error('No signature available. Please sign the message first.');
      }

      if (!msigUserKey && !zkAddress) {
        throw new Error('zkAddress not available. Please sign the message first.');
      }

      const tokenAddressBigInt = BigInt(tokenAddress);
      const baseUserKey = msigUserKey !== null ? msigUserKey : await computePrivateKeyFromSignature(account!.signature!);
      const { padHex } = await import('viem');
      const chainId = BigInt(await publicClient.getChainId());

      // Archon mode: user_key+0 is reserved for Mage; Archon starts at offset 1.
      // Search horizontally through offsets 1..maxOffset.
      // For each offset n:
      //   - If nonce 0 not used → no position at n, STOP horizontal search.
      //   - If nonce 0 used → find the highest used nonce (vertical search), collect balance entries,
      //     fetch unlockAt from operationInfo of nonce 0, record as a position, then advance to n+1.
      const maxOffset = BigInt(100);
      const maxNoncePerPosition = BigInt(100);
      const positions: ArchonPosition[] = [];

      for (let offset = BigInt(1); offset < maxOffset; offset++) {
        const currentUserKey = baseUserKey + offset;
        const spendingKey = await getSpendingKeyForDiscovery(currentUserKey, chainId, tokenAddressBigInt);

        // Check nonce 0 — if not used, no more positions
        const nonce0Commitment = await getNonceCommitmentForDiscovery(spendingKey, BigInt(0), tokenAddressBigInt);
        const nonce0Bytes32 = padHex(`0x${nonce0Commitment.toString(16)}`, { size: 32 }) as `0x${string}`;
        const nonce0Used = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'usedCommitments',
          args: [nonce0Bytes32],
        }) as boolean;

        if (!nonce0Used) break; // No position at this offset or beyond

        // Vertical search: find the first unused nonce for this position
        let positionCurrentNonce = BigInt(0);
        for (let n = BigInt(1); n < maxNoncePerPosition; n++) {
          const nCommitment = await getNonceCommitmentForDiscovery(spendingKey, n, tokenAddressBigInt);
          const nBytes32 = padHex(`0x${nCommitment.toString(16)}`, { size: 32 }) as `0x${string}`;
          const nUsed = await publicClient.readContract({
            address: ArkanaAddress,
            abi: ArkanaAbi,
            functionName: 'usedCommitments',
            args: [nBytes32],
          }) as boolean;
          if (!nUsed) {
            positionCurrentNonce = n;
            break;
          }
          // If all nonces up to max are used, position is exhausted
          if (n === maxNoncePerPosition - BigInt(1)) {
            positionCurrentNonce = maxNoncePerPosition;
          }
        }

        // Decrypt balance entries for this position (nonces 0..positionCurrentNonce-1)
        const highestUsedNonce = positionCurrentNonce > BigInt(0) ? positionCurrentNonce - BigInt(1) : BigInt(0);
        const entries = await decryptBalances(highestUsedNonce, currentUserKey, BigInt(0), tokenAddressBigInt);
        const positionEntries = entries || [];

        // Fetch unlockAt from operationInfo of nonce 0 (set during initialize)
        let unlockAt = BigInt(0);
        try {
          const opInfo = await publicClient.readContract({
            address: ArkanaAddress,
            abi: ArkanaAbi,
            functionName: 'getNonceCommitmentInfo',
            args: [nonce0Bytes32],
          }) as [number, bigint, string, `0x${string}`, `0x${string}`, bigint];
          unlockAt = opInfo[5] ?? BigInt(0);
        } catch {
          // Contract may not have unlockAt yet (old deployment); ignore
        }

        positions.push({
          userKeyOffset: offset,
          userKey: currentUserKey,
          currentNonce: positionCurrentNonce,
          balanceEntries: positionEntries,
          unlockAt,
        });
      }

      // Flatten all positions' balance entries for tokenDataMap (aggregate view)
      const allEntries = positions.flatMap(p => p.balanceEntries);
      const totalNonce = BigInt(positions.length);

      setCurrentNonce(totalNonce);
      setBalanceEntries(allEntries);

      return {
        currentNonce: totalNonce,
        balanceEntries: allEntries,
        userKey: baseUserKey,
        archonPositions: positions,
      };

    } catch (err) {
      console.error('Error computing current nonce (Archon mode):', err);
      setError(err instanceof Error ? err.message : 'Failed to compute current nonce');
      return null;
    } finally {
      setIsComputing(false);
    }
  }, [account?.signature, zkAddress, msigUserKey, getSpendingKeyForDiscovery, computePrivateKeyFromSignature, decryptBalances, publicClient]);

  const computeCurrentNonce = useCallback(async (tokenAddress: `0x${string}`, cachedNonce: bigint | null = null, cachedBalanceEntries: BalanceEntry[] = [], mode: DiscoveryMode = 'mage') => {
    setIsComputing(true);
    setError(null);

    console.log('🔍 [DISCOVERY] computeCurrentNonce called with mode:', mode);

    try {
      const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
      await ensureBufferPolyfill();

      if (!publicClient) {
        throw new Error('Public client not available.');
      }

      // For multisig profiles, user_key comes from the profile (msigUserKey) — no signature needed.
      if (!msigUserKey && !account?.signature) {
        throw new Error('No signature available. Please sign the message first.');
      }

      if (!msigUserKey && !zkAddress) {
        throw new Error('zkAddress not available. Please sign the message first.');
      }

      // If Archon mode, use Archon discovery logic
      if (mode === 'archon') {
        console.log('🔍 [DISCOVERY] Routing to ARCHON discovery...');
        return await computeCurrentNonceArchon(tokenAddress, cachedNonce, cachedBalanceEntries, null);
      }

      console.log('🔍 [DISCOVERY] Using MAGE discovery...');

      let finalCachedNonce = cachedNonce;
      let finalCachedBalanceEntries = cachedBalanceEntries;

      const activeZkAddressForDiscovery = effectiveZkAddress ?? zkAddress;
      if (finalCachedNonce === null && activeZkAddressForDiscovery) {
        try {
          const { loadTokenAccountData } = await import('@/lib/indexeddb');
          const normalizedTokenAddress = tokenAddress.toLowerCase();
          // This is Mage mode discovery, so load from mage token data
          const tokenData = await loadTokenAccountData(activeZkAddressForDiscovery, normalizedTokenAddress, 'mage');
          if (tokenData && tokenData.currentNonce !== null) {
            finalCachedNonce = tokenData.currentNonce;
            finalCachedBalanceEntries = tokenData.balanceEntries || [];
          }
        } catch (error) {
          // Continue with null cachedNonce
        }
      }

      const tokenAddressBigInt = BigInt(tokenAddress);
      const { point, aggregatedM: totM, aggregatedR: totR } = await readNonceDiscoveryFromContract(tokenAddress);
      setNonceDiscoveryPoint(point);
      setAggregatedM(totM);
      setAggregatedR(totR);

      // For multisig profiles, use the profile's user_key directly; otherwise derive from signature
      const userKey = msigUserKey !== null ? msigUserKey : await computePrivateKeyFromSignature(account!.signature!);
      console.log('🔍 [MAGE DISCOVERY] tokenAddress:', tokenAddress, '| tokenAddressBigInt:', tokenAddressBigInt.toString());
      console.log('🔍 [MAGE DISCOVERY] user_key:', userKey.toString(), msigUserKey ? '(multisig)' : '(wallet)');
      cachedNonce = finalCachedNonce;
      cachedBalanceEntries = finalCachedBalanceEntries;

      const { padHex } = await import('viem');
      let chainId = BigInt(await publicClient.getChainId());
      console.log('🔍 [MAGE DISCOVERY] chainId:', chainId.toString());
      // If deposit used hardcoded 31337 (old useDeposit bug), nonce 0 won't be found with real chainId; try 31337
      const ANVIL_CHAIN_ID = BigInt(31337);

      // Log frontend spending_key and nonce_commitment (same formula as circuits: Poseidon2Hash3(user_key, chain_id, token_address))
      try {
        const spendingKeyLog = await getSpendingKeyForDiscovery(userKey, chainId, tokenAddressBigInt);
        const nonce0CommitmentLog = await getNonceCommitmentForDiscovery(spendingKeyLog, BigInt(0), tokenAddressBigInt);
        console.log('🔍 [MAGE DISCOVERY] circuit spending_key (hex):', '0x' + spendingKeyLog.toString(16));
        console.log('🔍 [MAGE DISCOVERY] circuit nonce_commitment(0) (hex):', '0x' + nonce0CommitmentLog.toString(16));
      } catch (circuitLogErr) {
        console.warn('🔍 [DISCOVERY] Circuit log failed:', circuitLogErr);
      }

      const toBigInt = async (hash: any): Promise<bigint> => {
        if (typeof hash === 'bigint') return hash;
        if ('toBigInt' in hash && typeof hash.toBigInt === 'function') return hash.toBigInt();
        if ('value' in hash) return BigInt(hash.value);
        return BigInt(hash.toString());
      };

      let startNonce = BigInt(0);
      let ourLocalPoint: BJJPoint;
      let ourLocalM: bigint;
      let ourLocalR: bigint;
      let skipToCachedNonce = false;
      let shouldSkipDebugVerification = false;
      let foundAtLeastOne = false; // Declare here before use

      if (cachedNonce !== null && cachedNonce !== undefined && cachedNonce > BigInt(0)) {
        const spendingKeyForCacheBigInt =
          await getSpendingKeyForDiscovery(userKey, chainId, tokenAddressBigInt);
        const cachedNonceCommitmentBigInt =
          await getNonceCommitmentForDiscovery(spendingKeyForCacheBigInt, cachedNonce, tokenAddressBigInt);
        const cachedNonceCommitmentBytes32 = padHex(`0x${cachedNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

        const isCachedNonceKnown = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'usedCommitments',
          args: [cachedNonceCommitmentBytes32],
        }) as boolean;

        if (!isCachedNonceKnown) {
          startNonce = cachedNonce;
          skipToCachedNonce = true;
          shouldSkipDebugVerification = true;
          if (cachedNonce > BigInt(0)) {
            foundAtLeastOne = true;
          }
        } else {
          startNonce = cachedNonce + BigInt(1);
          skipToCachedNonce = true;
          shouldSkipDebugVerification = true;
          foundAtLeastOne = true;
        }
      }

      if (!shouldSkipDebugVerification) {
        let spendingKeyDebugBigInt =
          await getSpendingKeyForDiscovery(userKey, chainId, tokenAddressBigInt);
        let nonce0CommitmentDebugBigInt =
          await getNonceCommitmentForDiscovery(spendingKeyDebugBigInt, BigInt(0), tokenAddressBigInt);
        let nonce0CommitmentBytes32Debug = padHex(`0x${nonce0CommitmentDebugBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

        let nonce0Exists = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'usedCommitments',
          args: [nonce0CommitmentBytes32Debug],
        }) as boolean;

        console.log('🔍 [MAGE DISCOVERY] spending_key (decimal):', spendingKeyDebugBigInt.toString());
        console.log('🔍 [MAGE DISCOVERY] spending_key (hex):    0x' + spendingKeyDebugBigInt.toString(16));
        console.log('🔍 [MAGE DISCOVERY] nonce_commitment (decimal):', nonce0CommitmentDebugBigInt.toString());
        console.log('🔍 [MAGE DISCOVERY] nonce_commitment (hex):    0x' + nonce0CommitmentDebugBigInt.toString(16));
        console.log('🔍 [MAGE DISCOVERY] nonce=0 | commitment(hex):', nonce0CommitmentBytes32Debug, '| usedCommitments:', nonce0Exists);

        if (!nonce0Exists && chainId !== ANVIL_CHAIN_ID) {
          spendingKeyDebugBigInt =
            await getSpendingKeyForDiscovery(userKey, ANVIL_CHAIN_ID, tokenAddressBigInt);
          nonce0CommitmentDebugBigInt =
            await getNonceCommitmentForDiscovery(spendingKeyDebugBigInt, BigInt(0), tokenAddressBigInt);
          nonce0CommitmentBytes32Debug = padHex(`0x${nonce0CommitmentDebugBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
          nonce0Exists = await publicClient.readContract({
            address: ArkanaAddress,
            abi: ArkanaAbi,
            functionName: 'usedCommitments',
            args: [nonce0CommitmentBytes32Debug],
          }) as boolean;
          if (nonce0Exists) {
            chainId = ANVIL_CHAIN_ID;
            console.warn('🔍 [MAGE DISCOVERY] Using chainId 31337 (deposit may have used hardcoded Anvil chain_id).');
            console.log('🔍 [MAGE DISCOVERY] spending_key (chainId 31337, decimal):', spendingKeyDebugBigInt.toString());
            console.log('🔍 [MAGE DISCOVERY] spending_key (chainId 31337, hex):    0x' + spendingKeyDebugBigInt.toString(16));
            console.log('🔍 [MAGE DISCOVERY] nonce_commitment (chainId 31337, decimal):', nonce0CommitmentDebugBigInt.toString());
            console.log('🔍 [MAGE DISCOVERY] nonce_commitment (chainId 31337, hex):    0x' + nonce0CommitmentDebugBigInt.toString(16));
            console.log('🔍 [MAGE DISCOVERY] nonce=0 (chainId 31337) | commitment(hex):', nonce0CommitmentBytes32Debug, '| usedCommitments: true');
          }
        }

        if (!nonce0Exists) {
          setCurrentNonce(BigInt(0));
          return {
            currentNonce: BigInt(0),
            balanceEntries: cachedBalanceEntries,
            userKey: userKey,
            archonPositions: [],
          };
        }
      }

      const userKeyHash = await poseidonHash([userKey]);
      const userKeyHashBigInt = await toBigInt(userKeyHash);

      if (skipToCachedNonce && cachedNonce !== null) {
        ourLocalPoint = BJJ_IDENTITY;
        ourLocalM = BigInt(1);
        ourLocalR = BigInt(1);

        const lastNonceToRebuild = startNonce > BigInt(0) ? startNonce - BigInt(1) : BigInt(-1);
        if (lastNonceToRebuild >= BigInt(0)) {
          for (let n = BigInt(0); n <= lastNonceToRebuild; n++) {
            const spendingKeyBigInt =
              await getSpendingKeyForDiscovery(userKey, chainId, tokenAddressBigInt);
            const nonceCommitmentBigInt = await getNonceCommitmentForDiscovery(spendingKeyBigInt, n, tokenAddressBigInt);
            const inner = nonceDiscoveryEntryBJJ(nonceCommitmentBigInt);
            ourLocalPoint = bjjAdd(ourLocalPoint, inner);
            ourLocalM = aggregateOpeningValue(ourLocalM, BigInt(1));
            ourLocalR = aggregateOpeningValue(ourLocalR, nonceCommitmentBigInt);
          }
        }
      } else {
        ourLocalPoint = BJJ_IDENTITY;
        ourLocalM = BigInt(1);
        ourLocalR = BigInt(1);
      }

      let nonce = startNonce;
      const maxNonce = BigInt(100);
      console.log('🔍 [MAGE DISCOVERY] startNonce:', startNonce.toString(), '| checking usedCommitments for nonces...');

      while (nonce < maxNonce) {
        const spendingKeyBigInt =
          await getSpendingKeyForDiscovery(userKey, chainId, tokenAddressBigInt);
        const nonceCommitmentBigInt = await getNonceCommitmentForDiscovery(spendingKeyBigInt, nonce, tokenAddressBigInt);
        const nonceCommitmentBytes32 = padHex(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

        const isKnown = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'usedCommitments',
          args: [nonceCommitmentBytes32],
        }) as boolean;

        if (nonce <= BigInt(5) || isKnown) {
          console.log(`🔍 [MAGE DISCOVERY] nonce=${nonce.toString()} | commitment(hex): ${nonceCommitmentBytes32} | usedCommitments: ${isKnown}`);
        }

        if (isKnown) {
          foundAtLeastOne = true;
        }

        if (!isKnown && !foundAtLeastOne) {
          if (nonce === BigInt(0)) {
            setCurrentNonce(BigInt(0));
            return {
              currentNonce: BigInt(0),
              balanceEntries: cachedBalanceEntries,
              userKey: userKey,
              archonPositions: [],
            };
          } else {
            nonce++;
            continue;
          }
        }

        if (!isKnown) {
          if (foundAtLeastOne) {
            const nextNonce = nonce + BigInt(1);
            if (nextNonce <= BigInt(10)) {
              const nextNonceCommitmentBigInt =
                await getNonceCommitmentForDiscovery(spendingKeyBigInt, nextNonce, tokenAddressBigInt);

              const nextNonceCommitmentBytes32 = padHex(`0x${nextNonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;
              const nextIsKnown = await publicClient.readContract({
                address: ArkanaAddress,
                abi: ArkanaAbi,
                functionName: 'usedCommitments',
                args: [nextNonceCommitmentBytes32],
              }) as boolean;

              if (!nextIsKnown) {
                setCurrentNonce(nonce);
                break;
              } else {
                nonce++;
                continue;
              }
            } else {
              setCurrentNonce(nonce);
              break;
            }
          }
          if (!foundAtLeastOne) {
            nonce++;
            continue;
          }
        }

        if (isKnown) {
          const inner = nonceDiscoveryEntryBJJ(nonceCommitmentBigInt);
          const newOurLocalPoint = bjjAdd(ourLocalPoint, inner);
          const newOurLocalM = aggregateOpeningValue(ourLocalM, BigInt(1));
          const newOurLocalR = aggregateOpeningValue(ourLocalR, nonceCommitmentBigInt);
          ourLocalPoint = newOurLocalPoint;
          ourLocalM = newOurLocalM;
          ourLocalR = newOurLocalR;
        }

        nonce++;
      }

      if (nonce >= maxNonce) {
        throw new Error(`Could not find current nonce after checking ${maxNonce.toString()} nonces`);
      }

      setCurrentNonce(nonce);

      let finalBalanceEntries: BalanceEntry[] = finalCachedBalanceEntries;

      console.log('🔍 computeCurrentNonce - Balance Entries Calculation:');
      console.log('  Current Nonce:', nonce.toString());
      console.log('  Start Nonce:', startNonce.toString());
      console.log('  Cached Balance Entries Count:', finalCachedBalanceEntries.length);
      console.log('  Cached Balance Entries:', finalCachedBalanceEntries.map(e => ({
        nonce: e.nonce.toString(),
        amount: e.amount.toString(),
        tokenAddress: e.tokenAddress.toString()
      })));

      if (nonce > BigInt(0)) {
        const highestNonceToDecrypt = nonce - BigInt(1); // Previous nonce (the one we need for withdraw)

        // Find the highest nonce we already have in cached entries
        const highestCachedNonce = finalCachedBalanceEntries.length > 0
          ? finalCachedBalanceEntries.reduce((max, entry) => {
            const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
            return entryNonce > max ? entryNonce : max;
          }, BigInt(-1))
          : BigInt(-1);

        // We need to decrypt from the next nonce after the highest cached one, up to the previous nonce
        const lowestNonceToDecrypt = highestCachedNonce >= BigInt(0) ? highestCachedNonce + BigInt(1) : BigInt(0);

        console.log('  Highest Nonce To Decrypt (previous nonce):', highestNonceToDecrypt.toString());
        console.log('  Highest Cached Nonce:', highestCachedNonce.toString());
        console.log('  Lowest Nonce To Decrypt:', lowestNonceToDecrypt.toString());

        if (highestNonceToDecrypt >= lowestNonceToDecrypt && lowestNonceToDecrypt >= BigInt(0)) {
          console.log('  ✅ Decrypting balances from nonce', lowestNonceToDecrypt.toString(), 'to', highestNonceToDecrypt.toString());
          const newEntries = await decryptBalances(highestNonceToDecrypt, userKey, lowestNonceToDecrypt, tokenAddressBigInt);
          const entriesToMerge = newEntries || [];
          console.log('  Decrypted Entries Count:', entriesToMerge.length);
          console.log('  Decrypted Entries:', entriesToMerge.map(e => ({
            nonce: e.nonce.toString(),
            amount: e.amount.toString(),
            tokenAddress: e.tokenAddress.toString()
          })));

          // Merge: keep cached entries with nonce < lowestNonceToDecrypt, then add all decrypted entries
          const filteredCached = finalCachedBalanceEntries.filter(e => {
            const entryNonce = typeof e.nonce === 'string' ? BigInt(e.nonce) : e.nonce;
            return entryNonce < lowestNonceToDecrypt;
          });
          console.log('  Filtered Cached Entries (nonce <', lowestNonceToDecrypt.toString(), '):', filteredCached.length);
          finalBalanceEntries = [...filteredCached, ...entriesToMerge];
          console.log('  Final Balance Entries Count:', finalBalanceEntries.length);
          console.log('  Final Balance Entries:', finalBalanceEntries.map(e => ({
            nonce: e.nonce.toString(),
            amount: e.amount.toString(),
            tokenAddress: e.tokenAddress.toString()
          })));
          setBalanceEntries(finalBalanceEntries);
        } else {
          console.log('  ⚠️ Skipping decryption (condition not met)');
          // Even if we skip decryption, check if we have all needed entries
          const hasAllEntries = finalCachedBalanceEntries.some(e => {
            const entryNonce = typeof e.nonce === 'string' ? BigInt(e.nonce) : e.nonce;
            return entryNonce === highestNonceToDecrypt;
          });
          if (!hasAllEntries && highestNonceToDecrypt >= BigInt(0)) {
            console.log('  ⚠️ Missing balance entry for nonce', highestNonceToDecrypt.toString(), '- attempting full decryption');
            // Try to decrypt all nonces from 0 to highestNonceToDecrypt
            const allEntries = await decryptBalances(highestNonceToDecrypt, userKey, BigInt(0), tokenAddressBigInt);
            if (allEntries && allEntries.length > 0) {
              finalBalanceEntries = allEntries;
              console.log('  ✅ Full decryption successful, entries count:', finalBalanceEntries.length);
              setBalanceEntries(finalBalanceEntries);
            } else {
              setBalanceEntries(finalCachedBalanceEntries);
            }
          } else {
            setBalanceEntries(finalCachedBalanceEntries);
          }
        }
      } else {
        console.log('  ⚠️ Nonce is 0, using cached balance entries only');
        setBalanceEntries(finalCachedBalanceEntries);
      }

      return {
        currentNonce: nonce,
        balanceEntries: finalBalanceEntries,
        userKey: userKey,
        archonPositions: [],
      };

    } catch (err) {
      console.error('Error computing current nonce:', err);
      setError(err instanceof Error ? err.message : 'Failed to compute current nonce');
      return null;
    } finally {
      setIsComputing(false);
    }
  }, [account?.signature, zkAddress, msigUserKey, activeMultisigProfile, getSpendingKeyForDiscovery, readNonceDiscoveryFromContract, computePrivateKeyFromSignature, decryptBalances, publicClient, computeCurrentNonceArchon]);

  const reconstructPersonalCommitmentState = useCallback(async (
    balance: bigint,
    tokenAddress: bigint,
    userKey: bigint
  ): Promise<PersonalCommitmentState> => {
    const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
    await ensureBufferPolyfill();

    const userKeyHashBigInt = await poseidonHash([userKey]);

    const personalCInnerMHashBigInt = await poseidonHash([balance, userKeyHashBigInt]);
    const personalCInnerTokenAddressHashBigInt = await poseidonHash([tokenAddress, userKeyHashBigInt]);

    const personalCInner = pedersenCommitmentNonHiding(personalCInnerMHashBigInt, personalCInnerTokenAddressHashBigInt);
    const personalCOuter = pedersenCommitmentNonHiding(BigInt(0), tokenAddress);
    const initializer = pedersenCommitmentNonHiding(tokenAddress, userKeyHashBigInt);
    const personalCTot = grumpkinAddPoints(
      grumpkinAddPoints(personalCInner, personalCOuter),
      initializer
    );

    return {
      personal_c_tot: [personalCTot.x, personalCTot.y],
      personal_c_inner: [personalCInner.x, personalCInner.y],
      personal_c_outer: [personalCOuter.x, personalCOuter.y],
      personal_c_inner_m: balance,
      personal_c_outer_m: BigInt(0),
      personal_c_outer_r: tokenAddress,
    };
  }, []);

  return {
    computeCurrentNonce,
    fetchIncomingNotes,
    isComputing,
    currentNonce,
    error,
    nonceDiscoveryPoint,
    aggregatedM,
    aggregatedR,
    balanceEntries,
    isDecrypting,
    reconstructPersonalCommitmentState,
  };
}


