'use client';

import React from 'react';
import { AaveTokenInfo } from '@/lib/aave-tokens';
import { TokenIcon } from '@/lib/token-icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ExternalLink, Copy, Check, Shield, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface AaveTokenCardProps {
  token: AaveTokenInfo;
}

// Format large numbers with abbreviations
function formatAmount(amount: bigint, decimals: number): string {
  const value = Number(amount) / Math.pow(10, decimals);
  
  if (value === 0) return '0';
  if (value < 0.01) return '<0.01';
  if (value < 1000) return value.toFixed(2);
  if (value < 1000000) return (value / 1000).toFixed(2) + 'K';
  if (value < 1000000000) return (value / 1000000).toFixed(2) + 'M';
  return (value / 1000000000).toFixed(2) + 'B';
}

// Get anonymity rating based on total assets
function getAnonymityRating(totalAssets: bigint | undefined, decimals: number): {
  level: 'high' | 'medium' | 'low' | 'none';
  label: string;
  color: string;
} {
  if (!totalAssets || totalAssets === BigInt(0)) {
    return { level: 'none', label: 'No Liquidity', color: 'text-muted-foreground' };
  }
  
  const value = Number(totalAssets) / Math.pow(10, decimals);
  
  // Thresholds (adjust based on your needs)
  if (value >= 100000) { // 100K+
    return { level: 'high', label: 'Strong Privacy', color: 'text-accent' };
  }
  if (value >= 10000) { // 10K+
    return { level: 'medium', label: 'Good Privacy', color: 'text-yellow-400' };
  }
  if (value > 0) {
    return { level: 'low', label: 'Limited Privacy', color: 'text-orange-400' };
  }
  
  return { level: 'none', label: 'No Liquidity', color: 'text-muted-foreground' };
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
  
  const anonymityRating = getAnonymityRating(token.vaultTotalAssets, token.decimals);

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
        {/* Vault Liquidity / Anonymity Set - PROMINENT */}
        <div className="relative border border-primary/30 bg-primary/5 backdrop-blur-sm p-3 rounded-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-foreground uppercase tracking-wider font-bold">
                Privacy Pool
              </span>
            </div>
            <span className={`text-xs font-mono font-bold ${anonymityRating.color}`}>
              {anonymityRating.label}
            </span>
          </div>
          
          {token.hasVault ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">Total Liquidity</span>
                <span className="text-sm font-mono text-foreground font-bold" style={{ textShadow: token.vaultTotalAssets && token.vaultTotalAssets > BigInt(0) ? "0 0 8px rgba(139, 92, 246, 0.3)" : "none" }}>
                  {formatAmount(token.vaultTotalAssets || BigInt(0), token.decimals)} {token.symbol}
                </span>
              </div>
              
              {/* Anonymity indicator bar */}
              <div className="w-full h-1.5 bg-border/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    anonymityRating.level === 'high' ? 'bg-accent' :
                    anonymityRating.level === 'medium' ? 'bg-yellow-400' :
                    anonymityRating.level === 'low' ? 'bg-orange-400' :
                    'bg-muted-foreground/30'
                  }`}
                  style={{ 
                    width: anonymityRating.level === 'high' ? '100%' :
                           anonymityRating.level === 'medium' ? '66%' :
                           anonymityRating.level === 'low' ? '33%' : '5%',
                    boxShadow: anonymityRating.level === 'high' ? '0 0 8px rgba(0, 255, 136, 0.5)' :
                               anonymityRating.level === 'medium' ? '0 0 8px rgba(250, 204, 21, 0.5)' : 'none'
                  }}
                />
              </div>
              
              {anonymityRating.level === 'low' && (
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="w-3 h-3 text-orange-400" />
                  <span className="text-[10px] font-mono text-orange-400">
                    Low liquidity may reduce anonymity
                  </span>
                </div>
              )}
              
              {anonymityRating.level === 'none' && (
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    No deposits yet - be the first!
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <span className="text-[11px] font-mono text-muted-foreground">
                Vault not initialized
              </span>
            </div>
          )}
        </div>

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
          {token.vaultAddress && token.hasVault && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase">Vault Address</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-foreground/90">{formatAddress(token.vaultAddress)}</span>
                <a
                  href={`https://sepolia.etherscan.io/address/${token.vaultAddress}`}
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
