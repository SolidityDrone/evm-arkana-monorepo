'use client';

import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { Address } from 'viem';
import { getAaveTokens, getAavePoolAddress, AaveTokenInfo } from '@/lib/aave-tokens';
import { ARKANA_ADDRESS, ARKANA_ABI } from '@/lib/abi/ArkanaConst';

// ArkanaVault ABI - minimal for reading total assets/shares
const ARKANA_VAULT_ABI = [
  {
    name: 'totalAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function useAaveTokens() {
  const [tokens, setTokens] = useState<AaveTokenInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchTokens = async () => {
      // Don't fetch if publicClient is not available
      if (!publicClient) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const poolAddress = getAavePoolAddress();
        const aaveTokens = await getAaveTokens(poolAddress, publicClient);
        
        // Enrich tokens with vault data (silently fail for individual tokens)
        const enrichedTokens = await Promise.all(
          aaveTokens.map(async (token) => {
            try {
              // Get vault address from Arkana contract
              const vaultAddress = await publicClient.readContract({
                address: ARKANA_ADDRESS as Address,
                abi: ARKANA_ABI,
                functionName: 'tokenVaults',
                args: [token.address],
              }).catch(() => null) as Address | null;
              
              // Check if vault exists (not zero address)
              if (!vaultAddress || vaultAddress === '0x0000000000000000000000000000000000000000') {
                return { ...token, hasVault: false };
              }
              
              // Get vault total assets and shares
              const [totalAssets, totalShares] = await Promise.all([
                publicClient.readContract({
                  address: vaultAddress,
                  abi: ARKANA_VAULT_ABI,
                  functionName: 'totalAssets',
                }).catch(() => BigInt(0)) as Promise<bigint>,
                publicClient.readContract({
                  address: vaultAddress,
                  abi: ARKANA_VAULT_ABI,
                  functionName: 'totalSupply',
                }).catch(() => BigInt(0)) as Promise<bigint>,
              ]);
              
              return {
                ...token,
                vaultAddress,
                vaultTotalAssets: totalAssets,
                vaultTotalShares: totalShares,
                hasVault: true,
              };
            } catch (err) {
              // Silently fail for individual tokens - just return without vault data
              return { ...token, hasVault: false };
            }
          })
        );
        
        setTokens(enrichedTokens);
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
