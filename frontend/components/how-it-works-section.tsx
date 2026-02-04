"use client"

import { ArcaneFeatureCard } from "./arcane-feature-card"

function Step1Icon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="7" y="2" width="2" height="12" />
      <rect x="2" y="7" width="12" height="2" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  )
}

function Step2Icon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="3" y="3" width="10" height="10" />
      <rect x="5" y="5" width="6" height="6" fill="#0a0a0f" />
      <rect x="6" y="6" width="4" height="4" />
    </svg>
  )
}

function Step3Icon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="2" y="7" width="12" height="2" />
      <rect x="7" y="2" width="2" height="12" />
      <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

const steps = [
  {
    icon: <Step1Icon />,
    title: "Initialize Account",
    description: "Sign a message to generate your zero-knowledge identity. Your private key remains encrypted and never leaves your device.",
    runeSymbol: "ᚱ"
  },
  {
    icon: <Step2Icon />,
    title: "Deposit Assets",
    description: "Deposit tokens into the Arkana vault. Your balance is cryptographically committed and hidden from all observers.",
    runeSymbol: "ᚷ"
  },
  {
    icon: <Step3Icon />,
    title: "Send Privately",
    description: "Send tokens to any recipient while maintaining complete privacy. Only you and the recipient know the transaction details.",
    runeSymbol: "ᚹ"
  },
]

export function HowItWorksSection() {
  return (
    <section id="protocol" className="relative py-24 md:py-32">
      {/* Subtle ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139, 92, 246, 0.04) 0%, transparent 60%)"
        }}
      />

      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/50 text-sm">◈</span>
            <span className="font-mono text-xs text-muted-foreground tracking-[0.2em] uppercase">
              The Sacred Path
            </span>
            <span className="text-primary/50 text-sm">◈</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <h2 className="font-sans text-lg md:text-xl text-foreground tracking-wider mb-4">
            HOW IT WORKS
          </h2>
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Three simple steps to enter the void and claim your privacy sovereignty.
          </p>
        </div>
      </div>

      {/* Steps grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((step, i) => (
            <ArcaneFeatureCard
              key={i}
              icon={step.icon}
              title={step.title}
              description={step.description}
              runeSymbol={step.runeSymbol}
            />
          ))}
        </div>
      </div>

      {/* Decorative divider */}
      <div className="max-w-4xl mx-auto mt-24 px-8">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
          <span className="text-primary/30 text-lg">✧</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>
      </div>
    </section>
  )
}

