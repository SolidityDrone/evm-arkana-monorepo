"use client"

import { HeroSection } from "@/components/hero-section"
import { ProtocolDeepDive } from "@/components/protocol-deep-dive"

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      <HeroSection />
      <ProtocolDeepDive />
    </main>
  )
}
