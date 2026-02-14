'use client'

import { wagmiAdapter, projectId, networks, defaultChain } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { ForceAnvilChain } from '@/components/ForceAnvilChain'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'evm-arkana',
    description: 'EVM Arkana Frontend',
    url: 'https://evm-arkana.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal (defaultNetwork = Anvil unless NEXT_PUBLIC_IS_SEPOLIA=true)
const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    defaultNetwork: defaultChain,
    metadata: metadata,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    },
    themeMode: 'dark',
    themeVariables: {
        '--wui-color-fg-100': '#e8e4f0',
        '--wui-color-fg-200': '#e8e4f0',
        '--wui-color-fg-300': '#9a9ab0',
        '--wui-color-bg-100': '#2a2a42',
        '--wui-color-bg-200': '#343450',
        '--wui-color-bg-300': '#343450',
        '--wui-color-accent-100': '#a855f7',
        '--wui-color-accent-090': 'rgba(168, 85, 247, 0.9)',
        '--wui-border-radius-3xs': '0.25rem',
        '--wui-border-radius-2xs': '0.25rem',
        '--wui-border-radius-xs': '0.25rem',
        '--wui-border-radius-s': '0.25rem',
        '--wui-border-radius-m': '0.25rem',
        '--wui-border-radius-l': '0.25rem',
        '--wui-font-family': "'VT323', 'Geist Mono', monospace",
    }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const config = wagmiAdapter.wagmiConfig as Config
    let initialState = cookieToInitialState(config, cookies)
    // When using Anvil (local dev), force initial chain to Anvil so connect flow doesn't stick to Sepolia
    if (defaultChain.id === 31337 && initialState != null && typeof initialState === 'object') {
        const prev = initialState as Record<string, unknown>
        if (prev.state != null && typeof prev.state === 'object') {
            initialState = { ...prev, state: { ...(prev.state as Record<string, unknown>), chainId: 31337 } } as typeof initialState
        }
    }

    return (
        <QueryClientProvider client={queryClient}>
            <WagmiProvider config={config} initialState={initialState}>
                <ForceAnvilChain />
                {children}
            </WagmiProvider>
        </QueryClientProvider>
    )
}

export default ContextProvider

