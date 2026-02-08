"use client"

import { useState } from "react"
import type { ReactNode } from "react"

interface SpellButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary"
  onClick?: () => void
  className?: string
  disabled?: boolean
}

export function SpellButton({ children, variant = "primary", onClick, className = "", disabled = false }: SpellButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isPrimary = variant === "primary"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative px-6 py-3 text-sm font-medium tracking-wide uppercase overflow-hidden
        transition-all duration-300 cursor-pointer rounded-xl
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${isPrimary 
          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border border-primary/30" 
          : "bg-secondary/50 text-foreground/90 border border-border/40 hover:border-primary/40 hover:text-foreground hover:bg-secondary/70"
        }
        ${className}
      `}
      style={{
        boxShadow: isHovered 
          ? isPrimary 
            ? "0 8px 32px rgba(168, 85, 247, 0.35), 0 4px 16px rgba(168, 85, 247, 0.25)" 
            : "0 4px 20px rgba(168, 85, 247, 0.15)"
          : isPrimary 
            ? "0 4px 16px rgba(168, 85, 247, 0.2)"
            : "none"
      }}
    >
      {/* Gradient overlay on hover */}
      <span 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-xl"
        style={{
          opacity: isHovered ? 1 : 0,
          background: isPrimary 
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)"
            : "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, transparent 50%, rgba(168, 85, 247, 0.05) 100%)"
        }}
      />
      
      {/* Text */}
      <span 
        className="relative z-10 transition-all duration-300"
        style={{
          textShadow: isHovered && isPrimary ? "0 0 20px rgba(255, 255, 255, 0.5)" : "none"
        }}
      >
        {children}
      </span>
    </button>
  )
}
