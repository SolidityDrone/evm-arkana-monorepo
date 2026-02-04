'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZkAddress } from '@/context/AccountProvider';
import { useAccountSigning } from '@/hooks/useAccountSigning';
import AppKitButtonWrapper from './AppKitButtonWrapper';
import { Button } from './ui/button';
import ZkAddressDisplay from './ZkAddressDisplay';

interface NavItem {
  name: string;
  href: string;
}

interface NavbarProps {
  items?: NavItem[];
}

const defaultNavigation: NavItem[] = [
  { name: 'Home', href: '/' },
];

export default function Navbar({ items = defaultNavigation }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isConnected, address } = useAccount();
  const zkAddress = useZkAddress();
  const { handleSign, isSigning, isLoading } = useAccountSigning();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground/70 hover:text-primary transition-colors font-mono text-base mr-4"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '[X]' : '[≡]'}
          </button>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    px-4 py-2 text-xs md:text-sm font-mono uppercase tracking-wider transition-all rounded-sm
                    ${isActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-[0_0_14px_rgba(196,181,253,0.55)]'
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/10'
                    }
                  `}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side - Wallet & Sign */}
          <div className="flex items-center space-x-3 ml-auto">
            <AppKitButtonWrapper />
            {isConnected && address && (
              <>
                {zkAddress ? (
                  <ZkAddressDisplay zkAddress={zkAddress} variant="desktop" />
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/30">
            <div className="flex flex-col space-y-2">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-4 py-3 text-sm font-mono uppercase tracking-wider transition-all rounded-sm
                      ${isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-[0_0_14px_rgba(196,181,253,0.55)]'
                        : 'text-foreground/70 hover:text-primary hover:bg-primary/10'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Wallet & Sign */}
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
              <div className="w-full">
                <AppKitButtonWrapper />
              </div>
              {isConnected && address && (
                <>
                  {zkAddress ? (
                    <ZkAddressDisplay zkAddress={zkAddress} variant="mobile" />
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
      </div>
    </nav>
  );
}
