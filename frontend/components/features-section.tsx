"use client"

import { ArcaneFeatureCard } from "./arcane-feature-card"

function ShieldIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="7" y="1" width="2" height="1" />
      <rect x="5" y="2" width="6" height="1" />
      <rect x="4" y="3" width="8" height="1" />
      <rect x="3" y="4" width="10" height="1" />
      <rect x="3" y="5" width="10" height="1" />
      <rect x="3" y="6" width="10" height="1" />
      <rect x="3" y="7" width="10" height="1" />
      <rect x="4" y="8" width="8" height="1" />
      <rect x="4" y="9" width="8" height="1" />
      <rect x="5" y="10" width="6" height="1" />
      <rect x="5" y="11" width="6" height="1" />
      <rect x="6" y="12" width="4" height="1" />
      <rect x="6" y="13" width="4" height="1" />
      <rect x="7" y="14" width="2" height="1" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="5" y="5" width="6" height="1" />
      <rect x="3" y="6" width="2" height="1" />
      <rect x="11" y="6" width="2" height="1" />
      <rect x="2" y="7" width="1" height="2" />
      <rect x="13" y="7" width="1" height="2" />
      <rect x="3" y="9" width="2" height="1" />
      <rect x="11" y="9" width="2" height="1" />
      <rect x="5" y="10" width="6" height="1" />
      <rect x="6" y="7" width="4" height="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="7" y="7" width="2" height="2" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="5" y="2" width="6" height="1" />
      <rect x="4" y="3" width="1" height="4" />
      <rect x="11" y="3" width="1" height="4" />
      <rect x="3" y="7" width="10" height="1" />
      <rect x="3" y="8" width="10" height="6" />
      <rect x="7" y="10" width="2" height="3" fill="#0a0a0f" />
    </svg>
  )
}

function GhostIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="5" y="2" width="6" height="1" />
      <rect x="4" y="3" width="1" height="1" />
      <rect x="11" y="3" width="1" height="1" />
      <rect x="3" y="4" width="1" height="8" />
      <rect x="12" y="4" width="1" height="8" />
      <rect x="4" y="4" width="8" height="8" />
      <rect x="5" y="6" width="2" height="2" fill="#0a0a0f" />
      <rect x="9" y="6" width="2" height="2" fill="#0a0a0f" />
      <rect x="4" y="12" width="2" height="2" />
      <rect x="7" y="12" width="2" height="1" />
      <rect x="10" y="12" width="2" height="2" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="7" y="1" width="2" height="3" />
      <rect x="7" y="12" width="2" height="3" />
      <rect x="1" y="7" width="3" height="2" />
      <rect x="12" y="7" width="3" height="2" />
      <rect x="3" y="3" width="2" height="2" />
      <rect x="11" y="3" width="2" height="2" />
      <rect x="3" y="11" width="2" height="2" />
      <rect x="11" y="11" width="2" height="2" />
      <rect x="6" y="6" width="4" height="4" />
    </svg>
  )
}

function ScrollIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-full h-full pixel-perfect" fill="currentColor">
      <rect x="3" y="2" width="8" height="1" />
      <rect x="2" y="3" width="1" height="2" />
      <rect x="11" y="3" width="1" height="1" />
      <rect x="12" y="4" width="1" height="2" />
      <rect x="3" y="5" width="9" height="1" />
      <rect x="3" y="6" width="9" height="7" />
      <rect x="5" y="8" width="5" height="1" />
      <rect x="5" y="10" width="4" height="1" />
      <rect x="3" y="13" width="10" height="1" />
      <rect x="12" y="11" width="1" height="2" />
    </svg>
  )
}

const features = [
  {
    icon: <ShieldIcon />,
    title: "Zero-Knowledge Shields",
    description: "Ancient zkSNARK sorcery ensures your transactions remain invisible to prying eyes. Mathematical proofs without revelation.",
    runeSymbol: "ᛟ"
  },
  {
    icon: <EyeIcon />,
    title: "All-Seeing Blindness",
    description: "Validators verify without seeing. The network confirms without knowing. True privacy through cryptographic paradox.",
    runeSymbol: "ᛞ"
  },
  {
    icon: <LockIcon />,
    title: "Cryptographic Wards",
    description: "Ancient cryptographic barriers protect your assets with proven mathematical sorcery.",
    runeSymbol: "ᛗ"
  },
  {
    icon: <GhostIcon />,
    title: "Phantom Mixing",
    description: "Your transactions dissolve into the void, emerging untraceable. Origin and destination become myth.",
    runeSymbol: "ᛚ"
  },
  {
    icon: <SparkleIcon />,
    title: "Arcane Compliance",
    description: "Selective revelation spells allow regulatory compliance without sacrificing your sovereign privacy.",
    runeSymbol: "ᛝ"
  },
  {
    icon: <ScrollIcon />,
    title: "Immutable Grimoire",
    description: "Every protection spell is eternally inscribed. Audited by masters. Open for all seekers of truth.",
    runeSymbol: "ᛖ"
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Subtle ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(167, 139, 250, 0.06) 0%, transparent 60%)"
        }}
      />

      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/50 text-sm">◈</span>
            <span className="font-mono text-sm md:text-base text-muted-foreground tracking-[0.2em] uppercase">
              The Sacred Rituals
            </span>
            <span className="text-primary/50 text-sm">◈</span>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wider mb-4">
            PRIVACY INCANTATIONS
          </h2>
          <p className="font-mono text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Each spell in our grimoire has been crafted by master cryptographers,
            tested in the fires of adversarial networks.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, i) => (
            <ArcaneFeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              runeSymbol={feature.runeSymbol}
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

