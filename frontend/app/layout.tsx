import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import ContextProvider from '@/context'
import { AccountProvider } from '@/context/AccountProvider'
import { AccountStateProvider } from '@/context/AccountStateProvider'
import { BufferInit } from '@/components/BufferInit'
import { ArcaneHeader } from '@/components/arcane-header'
import { ToastContainer } from '@/components/Toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
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
    <html lang="en" className="w-full overflow-x-hidden">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans text-foreground w-full overflow-x-hidden antialiased`}>
        {/* Subtle gradient overlay for depth */}
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(15, 15, 26, 0.3) 70%, rgba(15, 15, 26, 0.5) 100%)"
          }}
        />

        <BufferInit />
        <ContextProvider cookies={cookies}>
          <AccountProvider>
            <AccountStateProvider>
              <ArcaneHeader />
              <main className="relative z-10 w-full min-w-0">{children}</main>
              <ToastContainer />
            </AccountStateProvider>
          </AccountProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
