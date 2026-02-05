"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Main content */}
      <HeroSection />
      <FeaturesSection />
    </main>
  )
}
