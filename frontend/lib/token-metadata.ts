import { Address } from 'viem';

/**
 * Token metadata for common tokens on Sepolia
 * This is a fallback when on-chain calls fail
 */
export interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

/**
 * Mapping of token addresses to their metadata on Sepolia
 * This helps when on-chain calls fail or are slow
 */
export const SEPOLIA_TOKEN_METADATA: Record<string, TokenMetadata> = {
  // WETH on Sepolia
  '0xc558dbdd856501fcd9aaf1e62eae57a9f0629a3c': {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
  },
  // WBTC on Sepolia
  '0x29f2d40b0605204364af54ec677bd022da425d03': {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
  },
  // AAVE on Sepolia
  '0x88541670e55cc00beefd87eb59edd1b7c511ac9a': {
    symbol: 'AAVE',
    name: 'Aave Token',
    decimals: 18,
  },
  // USDC on Sepolia
  '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  },
  // DAI on Sepolia
  '0x3e622317f8c93f7328350cf0b56b9e3b3d8b0b25': {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  // USDT on Sepolia
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  // LINK on Sepolia
  '0x779877a7b0d9e8603169ddbd7836e478b4624789': {
    symbol: 'LINK',
    name: 'Chainlink Token',
    decimals: 18,
  },
  // EURS on Sepolia (if exists)
  '0x6c5024cd4f8a59110119c56f8933403a539555eb': {
    symbol: 'EURS',
    name: 'STASIS EURS Token',
    decimals: 2,
  },
  // iUSDC (Index Dollar)
  '0xe816a9f81b5514708a3ad91bf92a8712d8bdf1f2': {
    symbol: 'iUSDC',
    name: 'Index Dollar',
    decimals: 6,
  },
};

/**
 * Get token metadata from local mapping
 * @param address Token address (case-insensitive)
 * @returns Token metadata or null if not found
 */
export function getTokenMetadata(address: Address | string | undefined | null): TokenMetadata | null {
  if (!address) return null;
  
  const addressLower = address.toLowerCase();
  return SEPOLIA_TOKEN_METADATA[addressLower] || null;
}

/**
 * Get token symbol with fallback
 * @param address Token address
 * @param onChainSymbol Symbol from on-chain call (if available)
 * @returns Token symbol
 */
export function getTokenSymbol(
  address: Address | string | undefined | null,
  onChainSymbol?: string | null
): string {
  // If on-chain symbol is available and not 'UNKNOWN', use it
  if (onChainSymbol && onChainSymbol !== 'UNKNOWN' && onChainSymbol.trim() !== '') {
    return onChainSymbol;
  }
  
  // Try to get from local mapping
  const metadata = getTokenMetadata(address);
  if (metadata) {
    return metadata.symbol;
  }
  
  // Fallback: use first 4 chars of address
  if (address) {
    return address.slice(0, 6) + '...' + address.slice(-4);
  }
  
  return 'UNKNOWN';
}

/**
 * Get token name with fallback
 * @param address Token address
 * @param onChainName Name from on-chain call (if available)
 * @returns Token name
 */
export function getTokenName(
  address: Address | string | undefined | null,
  onChainName?: string | null
): string {
  // If on-chain name is available and not 'Unknown', use it
  if (onChainName && onChainName !== 'Unknown' && onChainName.trim() !== '') {
    return onChainName;
  }
  
  // Try to get from local mapping
  const metadata = getTokenMetadata(address);
  if (metadata) {
    return metadata.name;
  }
  
  return 'Unknown Token';
}

/**
 * Get token decimals with fallback
 * @param address Token address
 * @param onChainDecimals Decimals from on-chain call (if available)
 * @returns Token decimals (defaults to 18)
 */
export function getTokenDecimals(
  address: Address | string | undefined | null,
  onChainDecimals?: number | null
): number {
  // If on-chain decimals are available, use them
  if (onChainDecimals !== null && onChainDecimals !== undefined) {
    return onChainDecimals;
  }
  
  // Try to get from local mapping
  const metadata = getTokenMetadata(address);
  if (metadata) {
    return metadata.decimals;
  }
  
  // Default to 18 (most common)
  return 18;
}










