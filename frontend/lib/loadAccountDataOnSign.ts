'use client';

import { loadAccountData } from './store';
export interface BalanceEntry {
  tokenAddress: bigint;
  amount: bigint;
  nonce: bigint;
}

/**
 * Loads all saved account data from IndexedDB and updates the account state
 * This should be called after signing and computing zkAddress
 */
export async function loadAccountDataOnSign(
  zkAddress: string,
  setters: {
    setCurrentNonce: (nonce: bigint | null) => void;
    setBalanceEntries: (entries: BalanceEntry[]) => void;
    setUserKey: (key: bigint | null) => void;
  },
  accountSignature?: string
): Promise<void> {
  try {
    const savedData = await loadAccountData(zkAddress);

    if (savedData) {
      // Update all state from saved data
      if (savedData.currentNonce !== null) {
        setters.setCurrentNonce(savedData.currentNonce);
      }

      if (savedData.balanceEntries && savedData.balanceEntries.length > 0) {
        setters.setBalanceEntries(savedData.balanceEntries);
      }

      // Get or compute userKey
      let userKeyToUse = savedData.userKey;
      if (!userKeyToUse && accountSignature) {
        try {
          const { ensureBufferPolyfill } = await import('@/lib/zk-address');
          await ensureBufferPolyfill();

          const sigHex = accountSignature.startsWith('0x') ? accountSignature.slice(2) : accountSignature;
          const sigBuffer = globalThis.Buffer.from(sigHex, 'hex');

          if (sigBuffer.length === 65) {
            const chunk1 = sigBuffer.slice(0, 31);
            const chunk2 = sigBuffer.slice(31, 62);
            const chunk3 = sigBuffer.slice(62, 65);

            const chunk1BigInt = BigInt('0x' + chunk1.toString('hex'));
            const chunk2BigInt = BigInt('0x' + chunk2.toString('hex'));
            const chunk3BigInt = BigInt('0x' + chunk3.toString('hex'));

            const { poseidon2Hash } = await import('@aztec/foundation/crypto');
            const poseidonHash = await poseidon2Hash([chunk1BigInt, chunk2BigInt, chunk3BigInt]);

            if (typeof poseidonHash === 'bigint') {
              userKeyToUse = poseidonHash;
            } else if ('toBigInt' in poseidonHash && typeof (poseidonHash as any).toBigInt === 'function') {
              userKeyToUse = (poseidonHash as any).toBigInt();
            } else if ('value' in poseidonHash) {
              userKeyToUse = BigInt((poseidonHash as any).value);
            } else {
              userKeyToUse = BigInt((poseidonHash as any).toString());
            }
          }
        } catch (error) {
          console.error('  ❌ Error computing userKey from signature:', error);
        }
      }

      if (userKeyToUse) {
        setters.setUserKey(userKeyToUse);
      }
    }
  } catch (error) {
    console.error('❌ Error loading saved account data:', error);
    // Don't throw - allow the app to continue even if loading fails
  }
}

