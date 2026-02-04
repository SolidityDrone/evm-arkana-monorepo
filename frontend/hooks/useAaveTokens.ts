'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { getAaveTokens, getAavePoolAddress, AaveTokenInfo } from '@/lib/aave-tokens';

export function useAaveTokens() {
  const [tokens, setTokens] = useState<AaveTokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const poolAddress = getAavePoolAddress();
        const aaveTokens = await getAaveTokens(poolAddress, publicClient || undefined);
        setTokens(aaveTokens);
      } catch (err) {
        console.error('Error fetching Aave tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Aave tokens');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [publicClient]);

  return { tokens, isLoading, error };
}

