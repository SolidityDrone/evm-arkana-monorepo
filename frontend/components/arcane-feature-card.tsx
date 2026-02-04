"use client"

import { useState } from "react"
import type { ReactNode } from "react"

interface ArcaneFeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  runeSymbol: string
}

export function ArcaneFeatureCard({ icon, title, description, runeSymbol }: ArcaneFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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
      <div className="relative bg-card/60 backdrop-blur-sm p-6 transition-all duration-500">
        {/* Floating rune - more subtle reveal */}
        <div 
          className="absolute -top-3 -right-1 text-2xl transition-all duration-700"
          style={{
            color: isHovered ? "rgba(167, 139, 250, 0.6)" : "rgba(167, 139, 250, 0.3)",
            transform: isHovered ? "translateY(-4px) rotate(5deg)" : "translateY(0) rotate(0)",
            textShadow: isHovered ? "0 0 15px rgba(167, 139, 250, 0.5)" : "none",
            filter: isHovered ? "blur(0px)" : "blur(0.5px)"
          }}
        >
          {runeSymbol}
        </div>
        {/* Icon with candle flicker on hover */}
        <div 
          className="w-10 h-10 mb-4 text-primary/80 transition-all duration-300"
          style={{
            filter: isHovered ? "drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))" : "none"
          }}
        >
          {icon}
        </div>
        {/* Title */}
        <h3 className="font-sans text-xs md:text-sm text-foreground/90 mb-3 tracking-wider uppercase">
          {title}
        </h3>
        {/* Description */}
        <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
        {/* Subtle mystical overlay on hover */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: "radial-gradient(ellipse at 50% 0%, rgba(167, 139, 250, 0.08) 0%, transparent 70%)"
          }}
        />
      </div>
    </div>
  )
}

