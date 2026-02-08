/**
 * RPC Configuration Utility
 * Determines whether to use Sepolia or Anvil based on environment variables
 */

import { defineChain } from 'viem';
import { sepolia as viemSepolia } from 'viem/chains';

// Check if we should use Sepolia (production/testnet) or Anvil (local development)
// Defaults to false (Anvil) if not explicitly set to 'true' or '1'
const isSepoliaEnv = process.env.NEXT_PUBLIC_IS_SEPOLIA;
export const IS_SEPOLIA = isSepoliaEnv === 'true' || isSepoliaEnv === '1';

// Get RPC URL from environment or use defaults
export const getRpcUrl = (): string => {
  if (IS_SEPOLIA) {
    return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 
           'https://ethereum-sepolia-rpc.publicnode.com';
  }
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 
         'http://127.0.0.1:8545';
};

// Get RPC URL for a specific chain ID
export const getRpcUrlForChain = (chainId: number): string => {
  if (chainId === sepolia.id) {
    return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 
           'https://ethereum-sepolia-rpc.publicnode.com';
  }
  // Default to Anvil for chain ID 31337 or any other chain
  return process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 
         'http://127.0.0.1:8545';
};

// Get chain object for a specific chain ID
export const getChainById = (chainId: number) => {
  return chainId === sepolia.id ? sepolia : anvil;
};

// Anvil local testnet chain definition
export const anvil = defineChain({
  id: 31337,
  name: 'Anvil',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Anvil Explorer',
      url: 'http://localhost:8545',
    },
  },
  testnet: true,
});

// Sepolia testnet chain definition (using viem's sepolia)
export const sepolia = viemSepolia;

// Get the active chain based on configuration
export const getActiveChain = () => {
  return IS_SEPOLIA ? sepolia : anvil;
};

// Get chain ID
export const getChainId = (): number => {
  return IS_SEPOLIA ? sepolia.id : anvil.id;
};

