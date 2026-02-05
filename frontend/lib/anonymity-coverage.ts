import { Address, PublicClient, parseAbi } from 'viem';
import { ARKANA_ADDRESS, ARKANA_ABI } from './abi/ArkanaConst';

// ABI for ERC20 balanceOf
const ERC20_ABI = parseAbi([
  'function balanceOf(address) view returns (uint256)',
]);

// ABI for ArkanaVault totalAssets
const ARKANA_VAULT_ABI = parseAbi([
  'function totalAssets() view returns (uint256)',
  'function asset() view returns (address)',
]);

/**
 * Get anonymity coverage for a token
 * Anonymity coverage is the total balance of aTokens in the vault for that token
 * This represents the total liquidity available for private deposits
 * 
 * @param publicClient The public client for reading from the blockchain
 * @param tokenAddress The underlying token address
 * @returns The anonymity coverage (total aToken balance in vault), or null if unavailable
 */
export async function getAnonymityCoverage(
  publicClient: PublicClient,
  tokenAddress: Address
): Promise<bigint | null> {
  try {
    // Get vault address from Arkana contract
    const vaultAddress = await publicClient.readContract({
      address: ARKANA_ADDRESS as Address,
      abi: ARKANA_ABI,
      functionName: 'tokenVaults',
      args: [tokenAddress],
    }) as Address;

    // If no vault exists, return null
    if (!vaultAddress || vaultAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    // Get the aToken address (the vault's asset)
    const aTokenAddress = await publicClient.readContract({
      address: vaultAddress,
      abi: ARKANA_VAULT_ABI,
      functionName: 'asset',
    }) as Address;

    if (!aTokenAddress || aTokenAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    // Get the vault's total assets (aTokens) - this is the anonymity coverage
    // Use totalAssets() from the vault instead of balanceOf to avoid historical state issues
    try {
      const totalAssets = await publicClient.readContract({
        address: vaultAddress,
        abi: ARKANA_VAULT_ABI,
        functionName: 'totalAssets',
      }) as bigint;

      return totalAssets;
    } catch (error) {
      // Fallback to balanceOf if totalAssets fails
      try {
        const aTokenBalance = await publicClient.readContract({
          address: aTokenAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [vaultAddress],
        }) as bigint;

        return aTokenBalance;
      } catch (fallbackError) {
        console.error('Error getting anonymity coverage (both methods failed):', fallbackError);
        return null;
      }
    }
  } catch (error) {
    console.error('Error getting anonymity coverage:', error);
    return null;
  }
}

/**
 * Format anonymity coverage for display
 * @param coverage The anonymity coverage in raw units
 * @param decimals The token decimals
 * @returns Formatted string (e.g., "1,234.56")
 */
export function formatAnonymityCoverage(
  coverage: bigint | null,
  decimals: number | null
): string {
  if (coverage === null || decimals === null) return 'N/A';
  
  const divisor = BigInt(10 ** decimals);
  const integerPart = coverage / divisor;
  const decimalPart = coverage % divisor;
  const decimalStr = decimalPart.toString().padStart(decimals, '0');
  const decimalStrTrimmed = decimalStr.replace(/0+$/, '');
  
  const formatted = decimalStrTrimmed === ''
    ? integerPart.toString()
    : `${integerPart.toString()}.${decimalStrTrimmed}`;
  
  // Add thousand separators
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

