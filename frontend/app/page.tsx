"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { ArcaneFooter } from "@/components/arcane-footer"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Main content */}
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ArcaneFooter />
    </main>
  )
}
