import type { Metadata } from 'next'
import { Press_Start_2P, VT323 } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import ContextProvider from '@/context'
import { AccountProvider } from '@/context/AccountProvider'
import { AccountStateProvider } from '@/context/AccountStateProvider'
import { BufferInit } from '@/components/BufferInit'
import { ArcaneHeader } from '@/components/arcane-header'

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EVM Arkana',
  description: 'Private and verifiable computing platform',
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} ${vt323.variable} font-sans text-foreground`}>
        {/* Subtle scanline overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0, 0, 0, 0.015) 4px, rgba(0, 0, 0, 0.015) 8px)"
          }}
        />

        {/* Deep vignette for mystery */}
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(20, 20, 32, 0.4) 70%, rgba(20, 20, 32, 0.6) 100%)"
          }}
        />

        <BufferInit />
        <ContextProvider cookies={cookies}>
          <AccountProvider>
            <AccountStateProvider>
              <ArcaneHeader />
              <main className="relative z-10">{children}</main>
            </AccountStateProvider>
          </AccountProvider>
        </ContextProvider>
      </body>
    </html>
  )
}


