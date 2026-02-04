'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-primary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Left spacer */}
          <div className="flex items-center h-full" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground/70 hover:text-primary transition-colors font-mono text-base"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '[X]' : '[≡]'}
          </button>

          {/* Right spacer for desktop */}
          <div className="hidden md:flex items-center space-x-3" />
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
          </div>
        )}
      </div>
    </nav>
  );
}


