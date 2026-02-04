'use client';

import React from 'react';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { getAavePoolAddress } from '@/lib/aave-tokens';
import { AaveTokenCard } from '@/components/aave-token-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AaveTokensPage() {
  const { tokens, isLoading, error } = useAaveTokens();
  const poolAddress = getAavePoolAddress();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Subtle ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.06) 0%, transparent 60%)"
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/50 text-sm">◈</span>
            <span className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.2em] uppercase">
              The Sacred Vaults
            </span>
            <span className="text-primary/50 text-sm">◈</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <h1 className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wider mb-4">
            THE GRIMOIRE
          </h1>
          <p className="font-mono text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-4">
            The sacred tome containing all tokens blessed by the Aave v3 protocol.
            Each entry represents a token that has been consecrated in the arcane liquidity pools.
          </p>
          <p className="text-xs font-mono text-muted-foreground/60">
            Aave Pool Address: <span className="text-primary/80">{poolAddress}</span>
          </p>
        </div>

        {/* Content Card */}
        <Card className="bg-card/60 backdrop-blur-sm border-primary/30">
          <CardHeader className="border-b border-primary/20">
            <CardTitle className="text-center font-sans text-xl md:text-2xl tracking-wider uppercase">
              Blessed Tokens
            </CardTitle>
            <CardDescription className="text-center font-mono text-sm">
              {isLoading ? 'Reading the grimoire...' :
                error ? 'The grimoire is sealed' :
                  tokens.length === 0 ? 'No entries found in the grimoire' :
                    `${tokens.length} sacred token${tokens.length !== 1 ? 's' : ''} inscribed`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center gap-3">
                  <span className="text-primary font-mono text-sm animate-pulse">⟳</span>
                  <p className="text-sm font-mono text-muted-foreground">
                    Deciphering the ancient runes...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="inline-flex flex-col items-center gap-3">
                  <span className="text-destructive text-2xl">⚡</span>
                  <p className="text-sm font-mono text-destructive">
                    {error}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground max-w-md">
                    The grimoire is sealed. Ensure you're connected to the correct network
                    and the Aave Pool address is correct. The arcane connection may be severed.
                  </p>
                </div>
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex flex-col items-center gap-3">
                  <span className="text-muted-foreground text-2xl">◯</span>
                  <p className="text-sm font-mono text-muted-foreground">
                    The grimoire is empty
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {tokens.map((token) => (
                  <AaveTokenCard key={token.address} token={token} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decorative divider */}
        <div className="max-w-4xl mx-auto mt-12 px-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
            <span className="text-primary/30 text-lg">✧</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

