import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { anvil, sepolia, getRpcUrl, IS_SEPOLIA } from '@/lib/rpc-config'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Support both Anvil and Sepolia networks (user can switch)
export const networks = [anvil, sepolia]

// Get RPC URLs for each network
const anvilRpcUrl = process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'
const sepoliaRpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks,
    transports: {
        [anvil.id]: http(anvilRpcUrl),
        [sepolia.id]: http(sepoliaRpcUrl),
    }
})

export const config = wagmiAdapter.wagmiConfig

// Re-export chain utilities for convenience
export { anvil, sepolia, getActiveChain, getChainId, getRpcUrl, getRpcUrlForChain, getChainById, IS_SEPOLIA } from '@/lib/rpc-config'

