'use client';

import { useState, useEffect } from 'react';
import { getCurrentSupplyAPY, fetchSupplyAPYHistory, APYSample } from '@/lib/aave-apy';

export function useAaveAPY(tokenSymbol: string | null) {
  const [currentAPY, setCurrentAPY] = useState<string | null>(null);
  const [apyHistory, setApyHistory] = useState<APYSample[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenSymbol) {
      setCurrentAPY(null);
      setApyHistory([]);
      return;
    }

    const fetchAPY = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch current APY using token symbol (will use mainnet address)
        const apy = await getCurrentSupplyAPY(tokenSymbol);
        setCurrentAPY(apy);

        // Fetch 7 days of history
        const history = await fetchSupplyAPYHistory(tokenSymbol, 7);
        setApyHistory(history);
      } catch (err) {
        console.error('Error fetching Aave APY:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch APY');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAPY();
  }, [tokenSymbol]);

  return { currentAPY, apyHistory, isLoading, error };
}

