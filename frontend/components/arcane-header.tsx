"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAccount } from 'wagmi'
import { useZkAddress } from '@/context/AccountProvider'
import { useAccountSigning } from '@/hooks/useAccountSigning'
import AppKitButtonWrapper from './AppKitButtonWrapper'
import { Button } from './ui/button'
import ZkAddressDisplay from './ZkAddressDisplay'
import Link from "next/link"
import AccountModal from './AccountModal'
import ZkAddressModal from './ZkAddressModal'
import { ProfileBootstrapModal, type ProfileSetupResult } from './ProfileBootstrapModal'
import { checkProfileSetup, saveProfileType, listMultisigProfiles } from '@/lib/indexeddb'
import { useActiveProfile } from '@/context/ActiveProfileProvider'
import { Users, ChevronDown, Key } from 'lucide-react'

export function ArcaneHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [accountModalOpen, setAccountModalOpen] = useState(false)
    const [zkAddressModalOpen, setZkAddressModalOpen] = useState(false)
    const [profileBootstrapOpen, setProfileBootstrapOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
    const [hasStoredMultisigs, setHasStoredMultisigs] = useState(false)
    const { isConnected, address } = useAccount()
    const zkAddress = useZkAddress()
    const { handleSign, isSigning, isLoading } = useAccountSigning()
    const { activeProfileId, activeMultisigProfile, availableMultisigs, switchProfile, effectiveZkAddress, isSignerMode, enterSignerMode } = useActiveProfile()

    // Check if device has any stored multisig profiles (for walletless signer mode)
    useEffect(() => {
        listMultisigProfiles()
            .then(profiles => setHasStoredMultisigs(profiles.length > 0))
            .catch(() => setHasStoredMultisigs(false))
    }, [])

    // Check if profile has been set up whenever zkAddress becomes available
    useEffect(() => {
        if (!zkAddress) return
        const rawHex = zkAddress.replace('zk', '')
        checkProfileSetup(rawHex).then(status => {
            if (status === 'not-initialized') {
                setProfileBootstrapOpen(true)
            }
        }).catch(() => { /* DB unavailable — skip bootstrap */ })
    }, [zkAddress])

    const handleProfileBootstrapComplete = async (result: ProfileSetupResult) => {
        if (!zkAddress) return
        const rawHex = zkAddress.replace('zk', '')
        await saveProfileType(rawHex, result.type, result.twoFactorData)
        setProfileBootstrapOpen(false)
    }

    const navLinks = [
        { label: "Grimoire", href: "/aave-tokens" },
        { label: "Rituals", href: "/rituals" },
        { label: "Send", href: "/send" },
        { label: "Spells", href: "/withdraw" }
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/30 w-full overflow-visible">
            <nav className="max-w-7xl mx-auto px-4 md:px-8 w-full">
                <div className="flex items-center justify-between h-16 md:h-20 relative">
                    {/* Logo - Overflowing outside navbar on desktop, normal on mobile */}
                    <Link href="/" className="group relative z-10">
                        {/* Mobile: Normal positioning, smaller size */}
                        <div className="relative w-16 h-16 md:absolute md:-top-10 md:-left-6 md:w-40 md:h-40">
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
                                className="font-mono text-sm text-muted-foreground/80 hover:text-foreground/90 transition-all duration-300 tracking-wider uppercase relative group"
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

                        {/* ── Signer mode (no wallet) ── */}
                        {isSignerMode ? (
                            <>
                                {/* Profile switcher — multisig only, no "Main Account" */}
                                <ProfileSwitcher
                                    availableMultisigs={availableMultisigs}
                                    activeProfileId={activeProfileId}
                                    activeMultisigProfile={activeMultisigProfile}
                                    switchProfile={switchProfile}
                                    profileDropdownOpen={profileDropdownOpen}
                                    setProfileDropdownOpen={setProfileDropdownOpen}
                                    showMain={false}
                                />
                                <Button
                                    onClick={() => setAccountModalOpen(true)}
                                    size="sm"
                                    variant="outline"
                                    className="text-sm md:text-base font-mono font-bold uppercase tracking-wider transition-colors border-sky-500/50 hover:bg-sky-500/10 hover:border-sky-500 text-sky-300"
                                >
                                    ACCOUNT
                                </Button>
                            </>
                        ) : (
                            <>
                                <AppKitButtonWrapper />

                                {/* ── Wallet connected ── */}
                                {isConnected && address && (
                                    <>
                                        {zkAddress ? (
                                            <>
                                                <ZkAddressDisplay
                                                    zkAddress={effectiveZkAddress ?? zkAddress}
                                                    variant="desktop"
                                                    onClick={() => setZkAddressModalOpen(true)}
                                                />
                                                {availableMultisigs.length > 0 && (
                                                    <ProfileSwitcher
                                                        availableMultisigs={availableMultisigs}
                                                        activeProfileId={activeProfileId}
                                                        activeMultisigProfile={activeMultisigProfile}
                                                        switchProfile={switchProfile}
                                                        profileDropdownOpen={profileDropdownOpen}
                                                        setProfileDropdownOpen={setProfileDropdownOpen}
                                                        showMain={true}
                                                    />
                                                )}
                                                <Button
                                                    onClick={() => setAccountModalOpen(true)}
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-sm md:text-base font-mono font-bold uppercase tracking-wider transition-colors border-primary/50 hover:bg-primary/10 hover:border-primary"
                                                >
                                                    ACCOUNT
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={handleSign}
                                                disabled={isSigning || isLoading}
                                                size="sm"
                                                className="text-sm md:text-base bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-[0_0_14px_rgba(196,181,253,0.45)]"
                                            >
                                                {isSigning || isLoading ? 'SIGNING...' : 'SIGN SIGIL'}
                                            </Button>
                                        )}
                                    </>
                                )}

                                {/* ── No wallet, but stored multisigs → offer signer mode ── */}
                                {!isConnected && hasStoredMultisigs && (
                                    <Button
                                        onClick={() => enterSignerMode()}
                                        size="sm"
                                        variant="outline"
                                        className="text-xs font-mono uppercase tracking-wider border-sky-500/40 text-sky-300/70 hover:border-sky-500/70 hover:text-sky-300 hover:bg-sky-500/10"
                                    >
                                        <Key className="w-3.5 h-3.5 mr-1.5" />
                                        Continue as Signer
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
                                    className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wider uppercase py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Mobile Wallet & Sign */}
                        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                            {isSignerMode ? (
                                <>
                                    <ProfileSwitcher
                                        availableMultisigs={availableMultisigs}
                                        activeProfileId={activeProfileId}
                                        activeMultisigProfile={activeMultisigProfile}
                                        switchProfile={switchProfile}
                                        profileDropdownOpen={profileDropdownOpen}
                                        setProfileDropdownOpen={setProfileDropdownOpen}
                                        showMain={false}
                                    />
                                    <Button
                                        onClick={() => { setAccountModalOpen(true); setMobileMenuOpen(false); }}
                                        variant="outline"
                                        className="w-full text-base font-mono font-bold uppercase tracking-wider border-sky-500/50 text-sky-300 hover:bg-sky-500/10"
                                    >
                                        ACCOUNT
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-full">
                                        <AppKitButtonWrapper />
                                    </div>
                                    {isConnected && address && (
                                        <>
                                            {zkAddress ? (
                                                <>
                                                    <ZkAddressDisplay
                                                        zkAddress={effectiveZkAddress ?? zkAddress}
                                                        variant="mobile"
                                                        onClick={() => {
                                                            setZkAddressModalOpen(true)
                                                            setMobileMenuOpen(false)
                                                        }}
                                                    />
                                                    <Button
                                                        onClick={() => {
                                                            setAccountModalOpen(true)
                                                            setMobileMenuOpen(false)
                                                        }}
                                                        variant="outline"
                                                        className="w-full text-base font-mono font-bold uppercase tracking-wider transition-colors border-primary/50 hover:bg-primary/10 hover:border-primary"
                                                    >
                                                        ACCOUNT
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={handleSign}
                                                    disabled={isSigning || isLoading}
                                                    className="w-full text-base bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50 shadow-[0_0_14px_rgba(196,181,253,0.45)]"
                                                >
                                                    {isSigning || isLoading ? 'SIGNING...' : 'SIGN SIGIL'}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                    {!isConnected && hasStoredMultisigs && (
                                        <Button
                                            onClick={() => { enterSignerMode(); setMobileMenuOpen(false); }}
                                            variant="outline"
                                            className="w-full text-sm font-mono uppercase tracking-wider border-sky-500/40 text-sky-300/70 hover:border-sky-500/70 hover:text-sky-300"
                                        >
                                            <Key className="w-3.5 h-3.5 mr-1.5" />
                                            Continue as Signer
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <AccountModal isOpen={accountModalOpen} onClose={() => setAccountModalOpen(false)} />
            <ZkAddressModal isOpen={zkAddressModalOpen} onClose={() => setZkAddressModalOpen(false)} />
            <ProfileBootstrapModal
                open={profileBootstrapOpen}
                onComplete={handleProfileBootstrapComplete}
            />
        </header>
    )
}

// ── Shared profile-switcher dropdown ────────────────────────────────────────
function ProfileSwitcher({
    availableMultisigs,
    activeProfileId,
    activeMultisigProfile,
    switchProfile,
    profileDropdownOpen,
    setProfileDropdownOpen,
    showMain,
}: {
    availableMultisigs: import('@/context/ActiveProfileProvider').ProfileSummary[]
    activeProfileId: string
    activeMultisigProfile: import('@/lib/indexeddb').MultisigProfileData | null
    switchProfile: (id: string) => void
    profileDropdownOpen: boolean
    setProfileDropdownOpen: (v: boolean | ((prev: boolean) => boolean)) => void
    showMain: boolean
}) {
    const label = activeProfileId === 'main'
        ? 'Main'
        : (activeMultisigProfile?.name ?? 'Multisig')

    return (
        <div className="relative">
            <button
                onClick={() => setProfileDropdownOpen(v => !v)}
                className="
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                    border border-sky-500/30 bg-sky-500/10 text-sky-300/70 text-xs font-mono
                    hover:bg-sky-500/15 hover:text-sky-300 hover:border-sky-500/50 transition-all
                "
            >
                <Users className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileDropdownOpen && (
                <div
                    className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-xl border border-white/[0.08] bg-background/95 backdrop-blur-md shadow-xl overflow-hidden"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                    {showMain && (
                        <button
                            onClick={() => { switchProfile('main'); setProfileDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 text-xs hover:bg-white/[0.06] transition-colors ${activeProfileId === 'main' ? 'text-white/90 bg-violet-500/10' : 'text-white/60'}`}
                        >
                            Main Account
                        </button>
                    )}
                    {availableMultisigs.map(ms => (
                        <button
                            key={ms.profileId}
                            onClick={() => { switchProfile(ms.profileId); setProfileDropdownOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 text-xs hover:bg-white/[0.06] transition-colors ${activeProfileId === ms.profileId ? 'text-white/90 bg-sky-500/10' : 'text-white/60'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-3 h-3 text-sky-400/50 shrink-0" />
                                <span className="truncate">{ms.name}</span>
                                <span className="text-[9px] text-white/30 ml-auto">{ms.threshold}/{ms.maxSigners}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

