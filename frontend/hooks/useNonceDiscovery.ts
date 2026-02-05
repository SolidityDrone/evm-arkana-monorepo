'use client';

import { useState, useCallback } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { pedersenCommitmentNonHiding, grumpkinAddPoints, aggregateOpeningValue, GrumpkinPoint } from '@/lib/pedersen-commitments';
import { useZkAddress, useAccount as useAccountContext } from '@/context/AccountProvider';
import { poseidonCtrDecrypt } from '@/lib/poseidon-ctr-encryption';

export interface BalanceEntry {
  tokenAddress: bigint;
  amount: bigint;
  nonce: bigint;
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
  const [nonceDiscoveryPoint, setNonceDiscoveryPoint] = useState<GrumpkinPoint | null>(null);
  const [aggregatedM, setAggregatedM] = useState<bigint | null>(null);
  const [aggregatedR, setAggregatedR] = useState<bigint | null>(null);
  const [balanceEntries, setBalanceEntries] = useState<BalanceEntry[]>([]);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const publicClient = usePublicClient();
  const { address } = useAccount();
  const zkAddress = useZkAddress();
  const { account } = useAccountContext();

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

    const { poseidon2Hash } = await import('@aztec/foundation/crypto');
    const poseidonHash = await poseidon2Hash([chunk1BigInt, chunk2BigInt, chunk3BigInt]);

    let privateKey: bigint;
    if (typeof poseidonHash === 'bigint') {
      privateKey = poseidonHash;
    } else if ('toBigInt' in poseidonHash && typeof (poseidonHash as any).toBigInt === 'function') {
      privateKey = (poseidonHash as any).toBigInt();
    } else if ('value' in poseidonHash) {
      privateKey = BigInt((poseidonHash as any).value);
    } else {
      privateKey = BigInt((poseidonHash as any).toString());
    }

    return privateKey;
  }, []);

  const readNonceDiscoveryFromContract = useCallback(async (tokenAddress: `0x${string}`) => {
    if (!publicClient || !address) {
      throw new Error('Public client or address not available');
    }

    const result = await publicClient.readContract({
      address: ArkanaAddress,
      abi: ArkanaAbi,
      functionName: 'getNonceDiscoveryInfo',
      args: [tokenAddress],
    }) as [bigint, bigint, bigint, bigint];

    const [x, y, m, r] = result;

    return {
      point: { x, y } as GrumpkinPoint,
      aggregatedM: m,
      aggregatedR: r,
    };
  }, [publicClient, address]);

  const decryptBalances = useCallback(async (highestNonce: bigint, userKey: bigint, lowestNonce: bigint = BigInt(0), tokenAddress: bigint) => {
    if (!publicClient || !account?.signature) {
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
      await ensureBufferPolyfill();

      const { poseidon2Hash } = await import('@aztec/foundation/crypto');
      const VIEW_STRING = BigInt('0x76696577696e675f6b6579');
      const viewKey = await poseidon2Hash([VIEW_STRING, userKey]);
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

      const entries: BalanceEntry[] = [];
      const chainId = BigInt(await publicClient.getChainId());

      for (let nonce = BigInt(0); nonce <= highestNonce; nonce++) {
        const spendingKey = await poseidon2Hash([userKey, chainId, tokenAddress]);
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

        const nonceCommitment = await poseidon2Hash([spendingKeyBigInt, nonce, tokenAddress]);
        let nonceCommitmentBigInt: bigint;
        if (typeof nonceCommitment === 'bigint') {
          nonceCommitmentBigInt = nonceCommitment;
        } else if ('toBigInt' in nonceCommitment && typeof (nonceCommitment as any).toBigInt === 'function') {
          nonceCommitmentBigInt = (nonceCommitment as any).toBigInt();
        } else if ('value' in nonceCommitment) {
          nonceCommitmentBigInt = BigInt((nonceCommitment as any).value);
        } else {
          nonceCommitmentBigInt = BigInt((nonceCommitment as any).toString());
        }

        const { padHex: padHexState } = await import('viem');
        const nonceCommitmentBytes32ForState = padHexState(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

        const encryptedState = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'encryptedStateDetails',
          args: [nonceCommitmentBytes32ForState],
        }) as [`0x${string}`, `0x${string}`];

        const encryptedBalance = BigInt(encryptedState[0]);
        const encryptedTokenAddress = tokenAddress;

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
          }) as [number, bigint, string, `0x${string}`, `0x${string}`];

          const [operationType, sharesMinted] = operationInfo;

          if (operationType === 0 || operationType === 1) {
            amount = previousShares + sharesMinted;
          } else {
            amount = previousShares;
          }

          decryptedTokenAddress = tokenAddress;
        }

        entries.push({ tokenAddress: decryptedTokenAddress, amount, nonce });
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
  }, [publicClient, account?.signature]);

  const computeCurrentNonce = useCallback(async (tokenAddress: `0x${string}`, cachedNonce: bigint | null = null, cachedBalanceEntries: BalanceEntry[] = []) => {
    setIsComputing(true);
    setError(null);

    try {
      const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
      await ensureBufferPolyfill();

      if (!publicClient) {
        throw new Error('Public client not available.');
      }

      if (!account?.signature) {
        throw new Error('No signature available. Please sign the message first.');
      }

      if (!zkAddress) {
        throw new Error('zkAddress not available. Please sign the message first.');
      }

      let finalCachedNonce = cachedNonce;
      let finalCachedBalanceEntries = cachedBalanceEntries;

      if (finalCachedNonce === null && zkAddress) {
        try {
          const { loadTokenAccountData } = await import('@/lib/indexeddb');
          const normalizedTokenAddress = tokenAddress.toLowerCase();
          const tokenData = await loadTokenAccountData(zkAddress, normalizedTokenAddress);
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

      const userKey = await computePrivateKeyFromSignature(account.signature);
      cachedNonce = finalCachedNonce;
      cachedBalanceEntries = finalCachedBalanceEntries;

      const initialNonceDiscoveryPoint: GrumpkinPoint = {
        x: BigInt('0x098b60b4fb636ed774329d8bb20eb1f9bd2f1b53445e991de219b50739e95c16'),
        y: BigInt('0x1b82bb29393d7897d102bc412ca1b3353e78ecc738baf483fed847ef9e212997')
      };

      const { poseidon2Hash } = await import('@aztec/foundation/crypto');
      const { padHex } = await import('viem');
      const chainId = BigInt(await publicClient.getChainId());

      const toBigInt = async (hash: any): Promise<bigint> => {
        if (typeof hash === 'bigint') return hash;
        if ('toBigInt' in hash && typeof hash.toBigInt === 'function') return hash.toBigInt();
        if ('value' in hash) return BigInt(hash.value);
        return BigInt(hash.toString());
      };

      let startNonce = BigInt(0);
      let ourLocalPoint: GrumpkinPoint;
      let ourLocalM: bigint;
      let ourLocalR: bigint;
      let skipToCachedNonce = false;
      let shouldSkipDebugVerification = false;
      let foundAtLeastOne = false; // Declare here before use

      if (cachedNonce !== null && cachedNonce !== undefined && cachedNonce > BigInt(0)) {
        const spendingKeyForCache = await poseidon2Hash([userKey, chainId, tokenAddressBigInt]);
        const spendingKeyForCacheBigInt = await toBigInt(spendingKeyForCache);
        const cachedNonceCommitment = await poseidon2Hash([spendingKeyForCacheBigInt, cachedNonce, tokenAddressBigInt]);
        const cachedNonceCommitmentBigInt = await toBigInt(cachedNonceCommitment);
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
        const spendingKeyDebug = await poseidon2Hash([userKey, chainId, tokenAddressBigInt]);
        const spendingKeyDebugBigInt = await toBigInt(spendingKeyDebug);
        const nonce0CommitmentDebug = await poseidon2Hash([spendingKeyDebugBigInt, BigInt(0), tokenAddressBigInt]);
        const nonce0CommitmentDebugBigInt = await toBigInt(nonce0CommitmentDebug);
        const nonce0CommitmentBytes32Debug = padHex(`0x${nonce0CommitmentDebugBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

        const nonce0Exists = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'usedCommitments',
          args: [nonce0CommitmentBytes32Debug],
        }) as boolean;

        if (!nonce0Exists) {
          setCurrentNonce(BigInt(0));
          return {
            currentNonce: BigInt(0),
            balanceEntries: cachedBalanceEntries,
            userKey: userKey,
          };
        }
      }

      const userKeyHash = await poseidon2Hash([userKey]);
      const userKeyHashBigInt = await toBigInt(userKeyHash);

      if (skipToCachedNonce && cachedNonce !== null) {
        ourLocalPoint = initialNonceDiscoveryPoint;
        ourLocalM = BigInt(1);
        ourLocalR = BigInt(1);

        const lastNonceToRebuild = startNonce > BigInt(0) ? startNonce - BigInt(1) : BigInt(-1);
        if (lastNonceToRebuild >= BigInt(0)) {
          for (let n = BigInt(0); n <= lastNonceToRebuild; n++) {
            const spendingKey = await poseidon2Hash([userKey, chainId, tokenAddressBigInt]);
            const spendingKeyBigInt = await toBigInt(spendingKey);
            const nonceCommitment = await poseidon2Hash([spendingKeyBigInt, n, tokenAddressBigInt]);
            const nonceCommitmentBigInt = await toBigInt(nonceCommitment);
            const inner = pedersenCommitmentNonHiding(BigInt(1), nonceCommitmentBigInt);
            ourLocalPoint = grumpkinAddPoints(ourLocalPoint, inner);
            ourLocalM = aggregateOpeningValue(ourLocalM, BigInt(1));
            ourLocalR = aggregateOpeningValue(ourLocalR, nonceCommitmentBigInt);
          }
        }
      } else {
        ourLocalPoint = initialNonceDiscoveryPoint;
        ourLocalM = BigInt(1);
        ourLocalR = BigInt(1);
      }

      let nonce = startNonce;
      const maxNonce = BigInt(100);

      while (nonce < maxNonce) {
        const spendingKey = await poseidon2Hash([userKey, chainId, tokenAddressBigInt]);
        const spendingKeyBigInt = await toBigInt(spendingKey);
        const nonceCommitment = await poseidon2Hash([spendingKeyBigInt, nonce, tokenAddressBigInt]);
        const nonceCommitmentBigInt = await toBigInt(nonceCommitment);
        const nonceCommitmentBytes32 = padHex(`0x${nonceCommitmentBigInt.toString(16)}`, { size: 32 }) as `0x${string}`;

        const isKnown = await publicClient.readContract({
          address: ArkanaAddress,
          abi: ArkanaAbi,
          functionName: 'usedCommitments',
          args: [nonceCommitmentBytes32],
        }) as boolean;

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
              const nextNonceCommitment = await poseidon2Hash([spendingKeyBigInt, nextNonce, tokenAddressBigInt]);
              let nextNonceCommitmentBigInt: bigint;
              if (typeof nextNonceCommitment === 'bigint') {
                nextNonceCommitmentBigInt = nextNonceCommitment;
              } else if ('toBigInt' in nextNonceCommitment && typeof (nextNonceCommitment as any).toBigInt === 'function') {
                nextNonceCommitmentBigInt = (nextNonceCommitment as any).toBigInt();
              } else if ('value' in nextNonceCommitment) {
                nextNonceCommitmentBigInt = BigInt((nextNonceCommitment as any).value);
              } else {
                nextNonceCommitmentBigInt = BigInt((nextNonceCommitment as any).toString());
              }

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
          const inner = pedersenCommitmentNonHiding(BigInt(1), nonceCommitmentBigInt);
          const newOurLocalPoint = grumpkinAddPoints(ourLocalPoint, inner);
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
      };

    } catch (err) {
      console.error('Error computing current nonce:', err);
      setError(err instanceof Error ? err.message : 'Failed to compute current nonce');
      return null;
    } finally {
      setIsComputing(false);
    }
  }, [account?.signature, zkAddress, readNonceDiscoveryFromContract, computePrivateKeyFromSignature, decryptBalances, publicClient]);

  const reconstructPersonalCommitmentState = useCallback(async (
    balance: bigint,
    tokenAddress: bigint,
    userKey: bigint
  ): Promise<PersonalCommitmentState> => {
    const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
    await ensureBufferPolyfill();

    const { poseidon2Hash } = await import('@aztec/foundation/crypto');
    const userKeyHash = await poseidon2Hash([userKey]);
    let userKeyHashBigInt: bigint;
    if (typeof userKeyHash === 'bigint') {
      userKeyHashBigInt = userKeyHash;
    } else if ('toBigInt' in userKeyHash && typeof (userKeyHash as any).toBigInt === 'function') {
      userKeyHashBigInt = (userKeyHash as any).toBigInt();
    } else if ('value' in userKeyHash) {
      userKeyHashBigInt = BigInt((userKeyHash as any).value);
    } else {
      userKeyHashBigInt = BigInt((userKeyHash as any).toString());
    }

    const personalCInnerMHash = await poseidon2Hash([balance, userKeyHashBigInt]);
    let personalCInnerMHashBigInt: bigint;
    if (typeof personalCInnerMHash === 'bigint') {
      personalCInnerMHashBigInt = personalCInnerMHash;
    } else if ('toBigInt' in personalCInnerMHash && typeof (personalCInnerMHash as any).toBigInt === 'function') {
      personalCInnerMHashBigInt = (personalCInnerMHash as any).toBigInt();
    } else if ('value' in personalCInnerMHash) {
      personalCInnerMHashBigInt = BigInt((personalCInnerMHash as any).value);
    } else {
      personalCInnerMHashBigInt = BigInt((personalCInnerMHash as any).toString());
    }

    const personalCInnerTokenAddressHash = await poseidon2Hash([tokenAddress, userKeyHashBigInt]);
    let personalCInnerTokenAddressHashBigInt: bigint;
    if (typeof personalCInnerTokenAddressHash === 'bigint') {
      personalCInnerTokenAddressHashBigInt = personalCInnerTokenAddressHash;
    } else if ('toBigInt' in personalCInnerTokenAddressHash && typeof (personalCInnerTokenAddressHash as any).toBigInt === 'function') {
      personalCInnerTokenAddressHashBigInt = (personalCInnerTokenAddressHash as any).toBigInt();
    } else if ('value' in personalCInnerTokenAddressHash) {
      personalCInnerTokenAddressHashBigInt = BigInt((personalCInnerTokenAddressHash as any).value);
    } else {
      personalCInnerTokenAddressHashBigInt = BigInt((personalCInnerTokenAddressHash as any).toString());
    }

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


