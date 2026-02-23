"use client"

import { useEffect, useState, useRef } from "react"
import { RitualCircle } from "./ritual-circle"
import Image from "next/image"

// Ambient rune particles — predefined so there's no hydration mismatch
const AMBIENT_RUNES = [
  { l: "3%",   t: "7%",   s: 22, d: "0s",   dur: "9s",  o: 0.22, r: "ᚠ" },
  { l: "90%",  t: "5%",   s: 16, d: "1.3s",  dur: "11s", o: 0.16, r: "ᚦ" },
  { l: "6%",   t: "33%",  s: 26, d: "0.7s",  dur: "8s",  o: 0.20, r: "ᚨ" },
  { l: "94%",  t: "30%",  s: 19, d: "2.1s",  dur: "10s", o: 0.18, r: "ᚱ" },
  { l: "1%",   t: "62%",  s: 15, d: "1.9s",  dur: "12s", o: 0.15, r: "ᚹ" },
  { l: "87%",  t: "58%",  s: 24, d: "0.5s",  dur: "9s",  o: 0.20, r: "ᛋ" },
  { l: "14%",  t: "83%",  s: 18, d: "3.1s",  dur: "10s", o: 0.17, r: "ᛏ" },
  { l: "81%",  t: "86%",  s: 17, d: "1.6s",  dur: "13s", o: 0.14, r: "ᛟ" },
  { l: "11%",  t: "17%",  s: 13, d: "2.6s",  dur: "11s", o: 0.13, r: "◈" },
  { l: "77%",  t: "13%",  s: 16, d: "0.9s",  dur: "8s",  o: 0.17, r: "✦" },
  { l: "49%",  t: "3%",   s: 12, d: "3.7s",  dur: "10s", o: 0.12, r: "ᚢ" },
  { l: "21%",  t: "48%",  s: 11, d: "1.2s",  dur: "12s", o: 0.14, r: "ᛒ" },
  { l: "71%",  t: "46%",  s: 14, d: "2.9s",  dur: "11s", o: 0.13, r: "ᛗ" },
  { l: "37%",  t: "91%",  s: 16, d: "0.8s",  dur: "9s",  o: 0.15, r: "ᛚ" },
  { l: "61%",  t: "93%",  s: 13, d: "2.3s",  dur: "8s",  o: 0.14, r: "ᛜ" },
  { l: "31%",  t: "11%",  s: 11, d: "4.1s",  dur: "14s", o: 0.11, r: "✧" },
  { l: "67%",  t: "9%",   s: 12, d: "1.8s",  dur: "12s", o: 0.12, r: "ᚷ" },
  { l: "96%",  t: "76%",  s: 14, d: "0.4s",  dur: "10s", o: 0.16, r: "ᛁ" },
  { l: "0.5%", t: "77%",  s: 13, d: "3.3s",  dur: "11s", o: 0.13, r: "ᚾ" },
  { l: "45%",  t: "1.5%", s: 10, d: "2.7s",  dur: "9s",  o: 0.11, r: "ᛞ" },
  { l: "56%",  t: "55%",  s: 10, d: "5s",    dur: "15s", o: 0.09, r: "ᛇ" },
  { l: "26%",  t: "68%",  s: 11, d: "1.4s",  dur: "10s", o: 0.10, r: "ᛈ" },
] as const

export function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const rafRef = useRef<number>(0)
  const fullText = "Your DeFi ops, shrouded in crypto-sorcery"

  // Smooth scroll-driven parallax
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(rafRef.current) }
  }, [])

  // Typing
  useEffect(() => {
    let i = 0
    const iv = setInterval(() => {
      if (i <= fullText.length) { setTypedText(fullText.slice(0, i)); i++ } else clearInterval(iv)
    }, 50)
    return () => clearInterval(iv)
  }, [])

  // Cursor blink
  useEffect(() => {
    const iv = setInterval(() => setShowCursor(p => !p), 530)
    return () => clearInterval(iv)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* ─── LAYER 0: deep void background ─────────────────────────────── */}
      <div className="absolute inset-0"
        style={{ backgroundColor: "#08080f" }}
      />

      {/* ─── LAYER 0b: radial purple nebula gradients ───────────────────── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(109,40,217,0.22) 0%, transparent 65%)",
            "radial-gradient(ellipse 40% 35% at 20% 25%, rgba(139,92,246,0.10) 0%, transparent 60%)",
            "radial-gradient(ellipse 35% 30% at 80% 70%, rgba(88,28,220,0.10) 0%, transparent 60%)",
            "radial-gradient(ellipse 100% 20% at 50% 100%, rgba(10,10,22,0.95) 0%, transparent 60%)",
          ].join(",")
        }}
      />

      {/* ─── LAYER 0c: subtle hex grid ──────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='97' viewBox='0 0 56 97' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 2L54 16.5v29L28 60 2 45.5v-29Z M0 45.5L26 60v29L0 103.5l-26-14.5v-29Z M56 45.5L82 60v29L56 103.5 30 89V60Z' fill='none' stroke='%23a855f7' stroke-width='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: "56px 97px",
        }}
      />

      {/* ─── LAYER 1: slow nebula blobs (parallax 0.08) ─────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.08}px)`, willChange: "transform" }}
      >
        <div className="absolute" style={{
          left: "8%", top: "18%", width: 500, height: 450,
          background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)",
          filter: "blur(70px)"
        }} />
        <div className="absolute" style={{
          right: "12%", top: "28%", width: 380, height: 350,
          background: "radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 70%)",
          filter: "blur(55px)"
        }} />
        <div className="absolute" style={{
          left: "35%", bottom: "5%", width: 600, height: 320,
          background: "radial-gradient(circle, rgba(76,29,149,0.13) 0%, transparent 70%)",
          filter: "blur(90px)"
        }} />
      </div>

      {/* ─── LAYER 2: ambient floating runes (CSS-animated, parallax 0.12) ─ */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ transform: `translateY(${scrollY * 0.12}px)`, willChange: "transform" }}
        suppressHydrationWarning
      >
        {AMBIENT_RUNES.map((rune, i) => (
          <span
            key={i}
            className="absolute font-mono"
            style={{
              left: rune.l,
              top: rune.t,
              fontSize: rune.s,
              color: `rgba(168,85,247,${rune.o})`,
              animation: `rune-float ${rune.dur} ease-in-out ${rune.d} infinite`,
              textShadow: `0 0 ${rune.s * 1.2}px rgba(168,85,247,0.5)`,
              willChange: "transform",
            }}
          >
            {rune.r}
          </span>
        ))}
      </div>

      {/* ─── LAYER 3: ritual circle (medium parallax 0.18) ──────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.18}px)`, willChange: "transform" }}
      >
        <div style={{ opacity: 0.55 }}>
          <RitualCircle className="w-[620px] h-[620px] md:w-[800px] md:h-[800px]" />
        </div>
      </div>

      {/* ─── LAYER 3b: ring glow aura behind mage ───────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.22}px)`, willChange: "transform" }}
      >
        <div style={{
          width: 280, height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,40,217,0.35) 0%, rgba(88,28,220,0.12) 50%, transparent 80%)",
          filter: "blur(22px)",
          animation: "arcane-pulse 4s ease-in-out infinite"
        }} />
      </div>

      {/* ─── LAYER 4: mage image (parallax 0.28) ────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        style={{ transform: `translateY(${scrollY * 0.28}px)`, willChange: "transform" }}
      >
        <div
          className="relative w-[240px] h-[240px] md:w-[300px] md:h-[300px]"
          style={{ clipPath: "circle(50%)", overflow: "hidden" }}
        >
          <Image
            src="/mage.png"
            alt="Mage"
            fill
            className="object-contain"
            style={{
              opacity: 0.88,
              filter: "drop-shadow(0 0 32px rgba(168,85,247,0.6)) saturate(1.15) brightness(1.05)"
            }}
            priority
          />
        </div>
      </div>

      {/* ─── Bottom fade ────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(8,8,15,0.92) 0%, rgba(8,8,15,0.4) 20%, transparent 50%)"
        }}
      />

      {/* ─── LAYER 5: text content (almost fixed, subtle 0.04) ──────────── */}
      <div
        className="relative z-20 max-w-5xl mx-auto px-4 text-center"
        style={{
          marginTop: "clamp(260px, 32vw, 340px)",
          transform: `translateY(${scrollY * 0.04}px)`,
          willChange: "transform",
        }}
      >

        {/* Title */}
        <h1 className="font-sans leading-none tracking-wider mb-5" style={{ letterSpacing: "0.08em" }}>
          <span
            className="block font-black"
            style={{
              fontSize: "clamp(3.5rem, 9vw, 7rem)",
              background: "linear-gradient(170deg, #ede0ff 0%, #c084fc 25%, #a855f7 55%, #7c3aed 80%, #5b21b6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 50px rgba(168,85,247,0.55))",
              letterSpacing: "0.18em",
            }}
          >
            ARKANA
          </span>

          {/* Rune separator line */}
          <div className="flex items-center justify-center gap-3 my-3">
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: "linear-gradient(to right, transparent, rgba(168,85,247,0.45))" }} />
            <span className="font-mono text-sm tracking-[0.5em]"
              style={{ color: "rgba(168,85,247,0.45)", letterSpacing: "0.4em" }}>ᚠ ◈ ᛟ</span>
            <div className="h-px flex-1 max-w-[80px]"
              style={{ background: "linear-gradient(to left, transparent, rgba(168,85,247,0.45))" }} />
          </div>

          <span
            className="block font-mono font-light"
            style={{
              fontSize: "clamp(0.75rem, 2vw, 1.25rem)",
              letterSpacing: "0.42em",
              color: "rgba(196,181,253,0.55)",
              textShadow: "0 0 30px rgba(168,85,247,0.3)"
            }}
          >
            PRIVACY · MAGERY
          </span>
        </h1>

        {/* Horizontal ornament */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-24"
            style={{ background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4))" }} />
          <span style={{ color: "rgba(139,92,246,0.5)", fontSize: 18 }}>◈</span>
          <div className="h-px w-24"
            style={{ background: "linear-gradient(to left, transparent, rgba(139,92,246,0.4))" }} />
        </div>

        {/* Typed tagline */}
        <div className="mb-12 max-w-xl mx-auto">
          <p
            className="font-mono text-base md:text-lg text-white/90 px-6 py-3 rounded-xl inline-block min-h-[3.2rem]"
            style={{
              background: "linear-gradient(135deg, rgba(15,5,30,0.82) 0%, rgba(45,15,80,0.72) 100%)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(168,85,247,0.22)",
              boxShadow: [
                "0 0 40px rgba(109,40,217,0.15)",
                "0 2px 0 rgba(255,255,255,0.04) inset",
                "0 -1px 0 rgba(0,0,0,0.4) inset",
              ].join(","),
              textShadow: "0 1px 4px rgba(0,0,0,0.7)",
            }}
          >
            {typedText}
            <span
              className="inline-block w-[2px] h-[1.1em] align-middle ml-0.5"
              style={{
                background: "rgba(196,181,253,0.85)",
                opacity: showCursor ? 1 : 0,
                transition: "opacity 0.08s",
                boxShadow: "0 0 8px rgba(168,85,247,0.8)"
              }}
            />
          </p>
        </div>

        {/* Built With */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-8" style={{ background: "rgba(168,85,247,0.2)" }} />
            <span className="font-mono text-xs tracking-[0.35em] uppercase"
              style={{ color: "rgba(168,85,247,0.35)" }}>
              ᚠ &nbsp; Forged With &nbsp; ᛟ
            </span>
            <div className="h-px w-8" style={{ background: "rgba(168,85,247,0.2)" }} />
          </div>
          <a
            href="https://aave.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 hover:scale-105 rounded-xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.87)",
              opacity: 0.65,
              boxShadow: "0 0 24px rgba(109,40,217,0.18)",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.65")}
          >
            <Image
              src="/aavelogotext.png"
              alt="Aave"
              width={140}
              height={48}
              className="h-9 md:h-11 w-auto object-contain"
            />
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="mt-14 flex flex-col items-center gap-2"
          style={{ opacity: Math.max(0, 1 - scrollY / 100) }}
        >
          <div className="w-px h-10"
            style={{
              background: "linear-gradient(to bottom, rgba(168,85,247,0.55), transparent)",
              animation: "float 2s ease-in-out infinite"
            }}
          />
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase"
            style={{ color: "rgba(168,85,247,0.35)" }}>
            scroll
          </span>
        </div>
      </div>
    </section>
  )
}
