"use client"

import { useState } from "react"
import { AaveTokenInfo, getTokenLogoUrl } from "@/lib/aave-tokens"
import { Copy, Check, ExternalLink } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"

interface AaveTokenCardProps {
  token: AaveTokenInfo
}

export function AaveTokenCard({ token }: AaveTokenCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const logoUrl = getTokenLogoUrl(token.address)

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error(`Failed to copy ${type}:`, error)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle ethereal border */}
      <div 
        className="absolute inset-0 border border-primary/10 transition-all duration-700"
        style={{
          boxShadow: isHovered 
            ? "0 0 30px rgba(167, 139, 250, 0.2), inset 0 0 20px rgba(167, 139, 250, 0.08)" 
            : "none"
        }}
      />
      
      {/* Corner sigils */}
      <div 
        className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t border-l border-primary/30 transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.7)" : undefined }}
      />
      <div 
        className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t border-r border-primary/30 transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.7)" : undefined }}
      />
      <div 
        className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b border-l border-primary/30 transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.7)" : undefined }}
      />
      <div 
        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b border-r border-primary/30 transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.7)" : undefined }}
      />

      <Card className="relative bg-card/60 backdrop-blur-sm transition-all duration-500">
        <CardContent className="p-6">
          {/* Token Header with Logo */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              {!logoError ? (
                <img
                  src={logoUrl}
                  alt={token.symbol}
                  className="w-12 h-12 rounded-full border-2 border-primary/30 pixel-perfect"
                  onError={() => setLogoError(true)}
                  style={{
                    filter: isHovered ? "drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))" : "none"
                  }}
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center bg-primary/10"
                  style={{
                    filter: isHovered ? "drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))" : "none"
                  }}
                >
                  <span className="text-primary/60 font-mono text-lg">{token.symbol[0]}</span>
                </div>
              )}
              {/* Active indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-card flex items-center justify-center">
                <div className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-sans text-sm md:text-base text-foreground/90 mb-1 tracking-wider uppercase">
                {token.symbol}
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                {token.name}
              </p>
            </div>
          </div>

          {/* Token Details */}
          <div className="space-y-3 pt-4 border-t border-primary/10">
            {/* Token Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Token Address
                </p>
                <button
                  onClick={() => handleCopy(token.address, 'token address')}
                  className="p-1 text-muted-foreground/60 hover:text-primary transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-mono text-primary/80 break-all bg-primary/5 px-2 py-1 rounded border border-primary/20">
                  {formatAddress(token.address)}
                </p>
                <a
                  href={`https://sepolia.etherscan.io/address/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/60 hover:text-primary transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* aToken Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  aToken Address
                </p>
                <button
                  onClick={() => handleCopy(token.aTokenAddress, 'aToken address')}
                  className="p-1 text-muted-foreground/60 hover:text-primary transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-mono text-accent/80 break-all bg-accent/5 px-2 py-1 rounded border border-accent/20">
                  {formatAddress(token.aTokenAddress)}
                </p>
                <a
                  href={`https://sepolia.etherscan.io/address/${token.aTokenAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent/60 hover:text-accent transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Decimals */}
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Decimals
              </p>
              <p className="text-xs font-mono text-foreground/80 bg-secondary/30 px-2 py-1 rounded border border-secondary/50 inline-block">
                {token.decimals}
              </p>
            </div>
          </div>

          {/* Subtle mystical overlay on hover */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
              background: "radial-gradient(ellipse at 50% 0%, rgba(167, 139, 250, 0.08) 0%, transparent 70%)"
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

