'use client'

import { useEffect, useRef } from 'react'
import { useChainId } from 'wagmi'
import { switchChain } from 'wagmi/actions'
import { config, defaultChain } from '@/config'

const ANVIL_CHAIN_ID = 31337
const SEPOLIA_CHAIN_ID = 11155111

/**
 * When NEXT_PUBLIC_IS_SEPOLIA is false, we want to use Anvil. If Wagmi's state
 * (e.g. from cookie) has Sepolia, usePublicClient() uses Sepolia RPC and the dapp
 * won't see Anvil balance. This component forces a switch to Anvil so the app
 * uses the Anvil transport and sees the correct balance.
 */
export function ForceAnvilChain() {
    const chainId = useChainId()
    const switchedRef = useRef(false)

    useEffect(() => {
        if (defaultChain.id !== ANVIL_CHAIN_ID) return
        if (chainId !== SEPOLIA_CHAIN_ID) return
        if (switchedRef.current) return
        switchedRef.current = true
        switchChain(config, { chainId: ANVIL_CHAIN_ID }).catch(() => {
            switchedRef.current = false
        })
    }, [chainId])

    return null
}
