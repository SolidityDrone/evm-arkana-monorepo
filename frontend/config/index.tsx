import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from 'viem'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Anvil local testnet
export const sepolia = defineChain({
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
})

// Support Sepolia (with Anvil RPC)
export const networks = [sepolia]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks,
    transports: {
        [sepolia.id]: http('http://127.0.0.1:8545'),
    }
})

export const config = wagmiAdapter.wagmiConfig

