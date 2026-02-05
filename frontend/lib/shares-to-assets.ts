import { Address, PublicClient, parseAbi } from 'viem';
import { ARKANA_ADDRESS, ARKANA_ABI } from './abi/ArkanaConst';

// ABI for ArkanaVault conversion functions
const ARKANA_VAULT_ABI = parseAbi([
  'function convertToAssets(uint256 shares) view returns (uint256)',
  'function convertToShares(uint256 assets) view returns (uint256)',
]);

/**
 * Convert shares to assets (aTokens) using the vault's convertToAssets function
 * @param publicClient The public client for reading from the blockchain
 * @param tokenAddress The underlying token address
 * @param shares The amount of shares to convert
 * @returns The amount of assets (aTokens) equivalent to the shares, or null if conversion fails
 */
export async function convertSharesToAssets(
  publicClient: PublicClient,
  tokenAddress: Address,
  shares: bigint
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

    // Convert shares to assets using the vault
    const assets = await publicClient.readContract({
      address: vaultAddress,
      abi: ARKANA_VAULT_ABI,
      functionName: 'convertToAssets',
      args: [shares],
    }) as bigint;

    return assets;
  } catch (error) {
    console.error('Error converting shares to assets:', error);
    return null;
  }
}

/**
 * Batch convert multiple shares amounts to assets for different tokens
 * @param publicClient The public client for reading from the blockchain
 * @param conversions Array of { tokenAddress, shares } to convert
 * @returns Map of tokenAddress -> assets (aTokens)
 */
export async function batchConvertSharesToAssets(
  publicClient: PublicClient,
  conversions: Array<{ tokenAddress: Address; shares: bigint }>
): Promise<Map<string, bigint>> {
  const results = new Map<string, bigint>();

  // Process in parallel for better performance
  const promises = conversions.map(async ({ tokenAddress, shares }) => {
    const assets = await convertSharesToAssets(publicClient, tokenAddress, shares);
    if (assets !== null) {
      results.set(tokenAddress.toLowerCase(), assets);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Convert assets (aTokens) to shares using the vault's convertToShares function
 * @param publicClient The public client for reading from the blockchain
 * @param tokenAddress The underlying token address
 * @param assets The amount of assets (aTokens) to convert
 * @returns The amount of shares equivalent to the assets, or null if conversion fails
 */
export async function convertAssetsToShares(
  publicClient: PublicClient,
  tokenAddress: Address,
  assets: bigint
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

    // Convert assets to shares using the vault
    const shares = await publicClient.readContract({
      address: vaultAddress,
      abi: ARKANA_VAULT_ABI,
      functionName: 'convertToShares',
      args: [assets],
    }) as bigint;

    return shares;
  } catch (error) {
    console.error('Error converting assets to shares:', error);
    return null;
  }
}


