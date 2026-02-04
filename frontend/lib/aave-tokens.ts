import { createPublicClient, http, Address, PublicClient } from 'viem';
import { sepolia } from '@/config';
import { getTokenSymbol, getTokenName, getTokenDecimals } from './token-metadata';

// Aave v3 Pool ABI - minimal interface for getting reserves
const AAVE_POOL_ABI = [
  {
    name: 'getReservesList',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    name: 'getReserveData',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'asset', type: 'address' }],
    outputs: [
      {
        name: 'configuration',
        type: 'tuple',
        components: [
          { name: 'data', type: 'uint256' },
        ],
      },
      { name: 'liquidityIndex', type: 'uint128' },
      { name: 'currentLiquidityRate', type: 'uint128' },
      { name: 'variableBorrowIndex', type: 'uint128' },
      { name: 'currentVariableBorrowRate', type: 'uint128' },
      { name: 'currentStableBorrowRate', type: 'uint128' },
      { name: 'lastUpdateTimestamp', type: 'uint40' },
      { name: 'id', type: 'uint16' },
      { name: 'aTokenAddress', type: 'address' },
      { name: 'stableDebtTokenAddress', type: 'address' },
      { name: 'variableDebtTokenAddress', type: 'address' },
      { name: 'interestRateStrategyAddress', type: 'address' },
      { name: 'accruedToTreasury', type: 'uint128' },
      { name: 'unbacked', type: 'uint128' },
      { name: 'isolationModeTotalDebt', type: 'uint128' },
    ],
  },
] as const;

// ERC20 ABI for token info
const ERC20_ABI = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

export interface AaveTokenInfo {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  aTokenAddress: Address;
  isActive: boolean;
}

/**
 * Get all available tokens from Aave v3 Pool
 * @param poolAddress The Aave Pool contract address
 * @param publicClient Optional public client (will create one if not provided)
 * @returns Array of token information
 */
export async function getAaveTokens(
  poolAddress: Address,
  publicClient?: PublicClient
): Promise<AaveTokenInfo[]> {
  const client = publicClient || createPublicClient({
    chain: sepolia,
    transport: http('http://127.0.0.1:8545'),
  });

  try {
    // Get list of all reserves
    const reserves = await client.readContract({
      address: poolAddress,
      abi: AAVE_POOL_ABI,
      functionName: 'getReservesList',
    }) as Address[];

    // Get reserve data for each token
    const tokenPromises = reserves.map(async (tokenAddress) => {
      try {
        const reserveData = await client.readContract({
          address: poolAddress,
          abi: AAVE_POOL_ABI,
          functionName: 'getReserveData',
          args: [tokenAddress],
        }) as {
          aTokenAddress: Address;
          stableDebtTokenAddress: Address;
          variableDebtTokenAddress: Address;
          [key: string]: any;
        };

        const aTokenAddress = reserveData.aTokenAddress;

        // Check if reserve is active (aTokenAddress != address(0))
        if (aTokenAddress === '0x0000000000000000000000000000000000000000') {
          return null;
        }

        // Get token info (name, symbol, decimals) with fallback to local metadata
        const [onChainName, onChainSymbol, onChainDecimals] = await Promise.all([
          client.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'name',
          }).catch(() => null),
          client.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'symbol',
          }).catch(() => null),
          client.readContract({
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'decimals',
          }).catch(() => null),
        ]);

        // Use local metadata as fallback if on-chain calls fail
        const name = getTokenName(tokenAddress, onChainName as string | null);
        const symbol = getTokenSymbol(tokenAddress, onChainSymbol as string | null);
        const decimals = getTokenDecimals(tokenAddress, onChainDecimals as number | null);

        return {
          address: tokenAddress,
          name,
          symbol,
          decimals,
          aTokenAddress,
          isActive: true,
        } as AaveTokenInfo;
      } catch (error) {
        return null;
      }
    });

    const tokens = await Promise.all(tokenPromises);
    return tokens.filter((token): token is AaveTokenInfo => token !== null);
  } catch (error) {
    console.error('Error fetching Aave tokens:', error);
    throw error;
  }
}

/**
 * Get Aave Pool address from environment variable
 * Falls back to Sepolia Aave Pool if env var is not set
 */
export function getAavePoolAddress(): Address {
  const envAddress = process.env.NEXT_PUBLIC_SEPOLIA_ETHEREUM_AAVE_POOL;
  
  if (envAddress) {
    return envAddress as Address;
  }

  // Fallback to Sepolia Aave Pool
  return '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951' as Address;
}

/**
 * Get token logo URL from Trust Wallet assets
 * Falls back to a placeholder if not available
 */
export function getTokenLogoUrl(address: Address, chainId: number = 1): string {
  // For Ethereum mainnet, use Trust Wallet assets
  // For other chains, we can extend this later
  if (chainId === 1) {
    const addressLower = address.toLowerCase();
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${addressLower}/logo.png`;
  }
  
  // For testnets or other chains, use a generic placeholder
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address.toLowerCase()}/logo.png`;
}

