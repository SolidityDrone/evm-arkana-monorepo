'use client';

import React from 'react';
import { AaveTokenInfo } from '@/lib/aave-tokens';
import { TokenIcon } from '@/lib/token-icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface AaveTokenCardProps {
  token: AaveTokenInfo;
}

export function AaveTokenCard({ token }: AaveTokenCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatAddress = (address: string | undefined | null) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displaySymbol = `$${token.symbol}`;
  const displayName = `$${token.name}`;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-primary/30 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <TokenIcon symbol={token.symbol} size={40} className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl font-sans font-bold text-foreground uppercase tracking-wider truncate">
              {displaySymbol}
            </CardTitle>
            <p className="text-sm md:text-base font-mono text-muted-foreground truncate">
              {displayName}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Token Address</span>
            {token.address && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-foreground/90">{formatAddress(token.address)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopy(token.address)}
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
                <a
                  href={`https://sepolia.etherscan.io/address/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
          {token.aTokenAddress && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase">aToken Address</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-foreground/90">{formatAddress(token.aTokenAddress)}</span>
                <a
                  href={`https://sepolia.etherscan.io/address/${token.aTokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Decimals</span>
            <span className="text-xs font-mono text-foreground/90">{token.decimals}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Status</span>
            <span className={`text-xs font-mono ${token.isActive ? 'text-accent' : 'text-muted-foreground'}`}>
              {token.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
