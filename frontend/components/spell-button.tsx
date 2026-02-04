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
        relative px-8 py-4 font-sans text-[10px] tracking-widest uppercase overflow-hidden
        transition-all duration-500 cursor-pointer
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${isPrimary 
          ? "bg-primary/90 text-primary-foreground border border-primary/60" 
          : "bg-transparent text-foreground/80 border border-border/60 hover:border-primary/40 hover:text-foreground"
        }
        ${className}
      `}
      style={{
        boxShadow: isHovered 
          ? isPrimary 
            ? "0 0 40px rgba(167, 139, 250, 0.4), 0 0 80px rgba(167, 139, 250, 0.2)" 
            : "0 0 30px rgba(167, 139, 250, 0.25)"
          : isPrimary 
            ? "0 0 20px rgba(167, 139, 250, 0.25)"
            : "none"
      }}
    >
      {/* Subtle corner marks */}
      <span 
        className="absolute top-1 left-1 w-2 h-2 border-t border-l transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.9)" : "rgba(167, 139, 250, 0.4)" }}
      />
      <span 
        className="absolute top-1 right-1 w-2 h-2 border-t border-r transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.9)" : "rgba(167, 139, 250, 0.4)" }}
      />
      <span 
        className="absolute bottom-1 left-1 w-2 h-2 border-b border-l transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.9)" : "rgba(167, 139, 250, 0.4)" }}
      />
      <span 
        className="absolute bottom-1 right-1 w-2 h-2 border-b border-r transition-all duration-500"
        style={{ borderColor: isHovered ? "rgba(167, 139, 250, 0.9)" : "rgba(167, 139, 250, 0.4)" }}
      />
      {/* Text with subtle glow on hover */}
      <span 
        className="relative z-10 transition-all duration-500"
        style={{
          textShadow: isHovered ? "0 0 10px rgba(167, 139, 250, 0.6)" : "none"
        }}
      >
        {children}
      </span>
      {/* Ethereal overlay on hover */}
      <span 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          opacity: isHovered ? 1 : 0,
          background: isPrimary 
            ? "radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 50% 50%, rgba(167, 139, 250, 0.15) 0%, transparent 70%)"
        }}
      />
    </button>
  )
}
