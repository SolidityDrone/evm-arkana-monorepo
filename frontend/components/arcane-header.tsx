"use client"

import { useState } from "react"
import Image from "next/image"
import { useAccount } from 'wagmi'
import { useZkAddress } from '@/context/AccountProvider'
import { useAccountSigning } from '@/hooks/useAccountSigning'
import AppKitButtonWrapper from './AppKitButtonWrapper'
import { Button } from './ui/button'
import ZkAddressDisplay from './ZkAddressDisplay'
import Link from "next/link"
import AccountModal from './AccountModal'

export function ArcaneHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [accountModalOpen, setAccountModalOpen] = useState(false)
    const { isConnected, address } = useAccount()
    const zkAddress = useZkAddress()
    const { handleSign, isSigning, isLoading } = useAccountSigning()

    const navLinks = [
        { label: "Grimoire", href: "/aave-tokens" },
        { label: "Rituals", href: "/rituals" },
        { label: "Spells", href: "/withdraw" }
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/30 w-full overflow-visible">
            <nav className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                <div className="flex items-center justify-between h-16 md:h-20 relative">
                    {/* Logo - Overflowing outside navbar */}
                    <Link href="/" className="group relative z-10">
                        <div className="absolute -top-8 -left-4 md:-top-10 md:-left-6 w-32 h-32 md:w-40 md:h-40">
                            <Image
                                src="/logo.webp"
                                alt="Arkana Logo"
                                fill
                                className="object-contain transition-all duration-500 group-hover:scale-110"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="font-mono text-xs text-muted-foreground/80 hover:text-foreground/90 transition-all duration-300 tracking-wider uppercase relative group"
                            >
                                {link.label}
                                <span
                                    className="absolute -bottom-1 left-0 w-0 h-px bg-primary/50 transition-all duration-500 group-hover:w-full"
                                    style={{
                                        boxShadow: "0 0 8px rgba(139, 92, 246, 0.3)"
                                    }}
                                />
                            </a>
                        ))}
                    </div>

                    {/* Wallet & Sign Buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        <AppKitButtonWrapper />
                        {isConnected && address && (
                            <>
                                {zkAddress ? (
                                    <>
                                        <ZkAddressDisplay zkAddress={zkAddress} variant="desktop" />
                                        <Button
                                            onClick={() => setAccountModalOpen(true)}
                                            size="sm"
                                            variant="outline"
                                            className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider transition-colors border-primary/50 hover:bg-primary/10 hover:border-primary"
                                        >
                                            ACCOUNT
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleSign}
                                        disabled={isSigning || isLoading}
                                        size="sm"
                                        className="text-xs md:text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-[0_0_14px_rgba(196,181,253,0.45)]"
                                    >
                                        {isSigning || isLoading ? 'SIGNING...' : 'SIGN SIGIL'}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        className="md:hidden p-2 text-foreground/80"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <div className="w-6 h-5 flex flex-col justify-between">
                            <span className={`h-px w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                            <span className={`h-px w-full bg-current transition-opacity duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
                            <span className={`h-px w-full bg-current transition-transform duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-6 border-t border-border/30">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Mobile Wallet & Sign */}
                        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                            <div className="w-full">
                                <AppKitButtonWrapper />
                            </div>
                            {isConnected && address && (
                                <>
                                    {zkAddress ? (
                                        <>
                                            <ZkAddressDisplay zkAddress={zkAddress} variant="mobile" />
                                            <Button
                                                onClick={() => {
                                                    setAccountModalOpen(true)
                                                    setMobileMenuOpen(false)
                                                }}
                                                variant="outline"
                                                className="w-full text-sm font-mono font-bold uppercase tracking-wider transition-colors border-primary/50 hover:bg-primary/10 hover:border-primary"
                                            >
                                                ACCOUNT
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            onClick={handleSign}
                                            disabled={isSigning || isLoading}
                                            className="w-full text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-[0_0_14px_rgba(196,181,253,0.45)]"
                                        >
                                            {isSigning || isLoading ? 'SIGNING...' : 'SIGN SIGIL'}
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <AccountModal isOpen={accountModalOpen} onClose={() => setAccountModalOpen(false)} />
        </header>
    )
}

