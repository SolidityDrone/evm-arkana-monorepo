'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { BalanceEntry } from '@/hooks/useAccountSigning'

interface AccountStateContextType {
  balanceEntries: BalanceEntry[]
  setBalanceEntries: (entries: BalanceEntry[]) => void
  currentNonce: bigint | null
  setCurrentNonce: (nonce: bigint | null) => void
  userKey: bigint | null
  setUserKey: (key: bigint | null) => void
  clearAccountState: () => void
  isSyncing: boolean
  setIsSyncing: (syncing: boolean) => void
}

const AccountStateContext = createContext<AccountStateContextType | undefined>(undefined)

export function AccountStateProvider({ children }: { children: ReactNode }) {
  const [balanceEntries, setBalanceEntriesState] = useState<BalanceEntry[]>([])
  const [currentNonce, setCurrentNonceState] = useState<bigint | null>(null)
  const [userKey, setUserKeyState] = useState<bigint | null>(null)
  const [isSyncing, setIsSyncingState] = useState<boolean>(false)

  const setBalanceEntries = useCallback((entries: BalanceEntry[]) => {
    setBalanceEntriesState(entries)
  }, [])

  const setCurrentNonce = useCallback((nonce: bigint | null) => {
    setCurrentNonceState(nonce)
  }, [])

  const setUserKey = useCallback((key: bigint | null) => {
    setUserKeyState(key)
  }, [])

  const setIsSyncing = useCallback((syncing: boolean) => {
    setIsSyncingState(syncing)
  }, [])

  const clearAccountState = useCallback(() => {
    setBalanceEntriesState([])
    setCurrentNonceState(null)
    setUserKeyState(null)
  }, [])

  return (
    <AccountStateContext.Provider
      value={{
        balanceEntries,
        setBalanceEntries: setBalanceEntries,
        currentNonce,
        setCurrentNonce,
        userKey,
        setUserKey,
        clearAccountState,
        isSyncing,
        setIsSyncing,
      }}
    >
      {children}
    </AccountStateContext.Provider>
  )
}

export function useAccountState() {
  const context = useContext(AccountStateContext)
  if (context === undefined) {
    throw new Error('useAccountState must be used within an AccountStateProvider')
  }
  return context
}

