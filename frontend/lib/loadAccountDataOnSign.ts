'use client';

import { computePrivateKeyFromSignature } from './circuit-utils';
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
      if (savedData.currentNonce != null) {
        setters.setCurrentNonce(savedData.currentNonce ?? null);
      }

      if (savedData.balanceEntries && savedData.balanceEntries.length > 0) {
        setters.setBalanceEntries(savedData.balanceEntries);
      }

      // Get or compute userKey
      let userKeyToUse = savedData.userKey;
      if (!userKeyToUse && accountSignature) {
        try {
          const privateKeyHex = await computePrivateKeyFromSignature(accountSignature);
          userKeyToUse = BigInt(privateKeyHex);
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

