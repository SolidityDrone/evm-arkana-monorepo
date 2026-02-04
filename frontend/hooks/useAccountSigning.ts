import { useState, useCallback } from 'react';
import { useSignMessage } from 'wagmi';
import { useAccount as useAccountContext } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { computeZkAddress, ARKANA_MESSAGE } from '@/lib/zk-address';
import { loadAccountDataOnSign } from '@/lib/loadAccountDataOnSign';
import { computePrivateKeyFromSignature } from '@/lib/circuit-utils';

export interface BalanceEntry {
  tokenAddress: bigint;
  amount: bigint;
  nonce: bigint;
}

interface UseAccountSigningReturn {
  isLoading: boolean;
  error: string | null;
  isSigning: boolean;
  handleSign: () => Promise<void>;
  localUserKey: string;
  setLocalUserKey: (key: string) => void;
}

/**
 * Shared hook for account signing and data loading
 * This logic is duplicated across multiple pages - extracted here for reuse
 */
export function useAccountSigning(): UseAccountSigningReturn {
  const { setZkAddress, account } = useAccountContext();
  const {
    currentNonce,
    userKey: contextUserKey,
    setCurrentNonce,
    setBalanceEntries,
    setUserKey,
  } = useAccountState();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUserKey, setLocalUserKey] = useState<string>('');

  const handleSign = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Sign the message using wagmi
      const signatureValue = await signMessageAsync({ message: ARKANA_MESSAGE });

      // Compute zkAddress (public key) and store in context with signature
      const zkAddr = await computeZkAddress(signatureValue);
      setZkAddress(zkAddr, signatureValue);

      // Load all saved account data from IndexedDB
      await loadAccountDataOnSign(zkAddr, {
        setCurrentNonce,
        setBalanceEntries,
        setUserKey,
      }, account?.signature);

      // Compute private key (user_key) from signature (only if not loaded from IndexedDB)
      if (!contextUserKey) {
        const userKeyHex = await computePrivateKeyFromSignature(signatureValue);
        // Ensure userKey always has 0x prefix
        setLocalUserKey(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
        console.log('User key (private key) computed:', userKeyHex);
      }

    } catch (error) {
      console.error('Error signing message:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign message');
    } finally {
      setIsLoading(false);
    }
  }, [signMessageAsync, setZkAddress, account?.signature, setCurrentNonce, setBalanceEntries, setUserKey, contextUserKey]);

  return {
    isLoading,
    error,
    isSigning,
    handleSign,
    localUserKey,
    setLocalUserKey,
  };
}

