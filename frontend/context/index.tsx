'use client'

import { wagmiAdapter, projectId, networks } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

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

// Create the modal
const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks,
    defaultNetwork: networks[0],
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
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider

