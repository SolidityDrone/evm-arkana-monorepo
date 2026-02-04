"use client"

import { useEffect, useState } from "react"
import { RitualCircle } from "./ritual-circle"
import { SpellButton } from "./spell-button"
import Link from "next/link"
import Image from "next/image"

export function HeroSection() {
    const [typedText, setTypedText] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const fullText = "Your transactions, shrouded in ancient cryptographic sorcery"

    useEffect(() => {
        let index = 0
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                setTypedText(fullText.slice(0, index))
                index++
            } else {
                clearInterval(interval)
            }
        }, 50)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 530)
        return () => clearInterval(cursorInterval)
    }, [])

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background ritual circle - subtle and mystical (slightly smaller to fit below navbar) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <RitualCircle className="w-[560px] h-[560px] md:w-[720px] md:h-[720px]" />
            </div>

            {/* Mage image centered in ritual circle - masked to inner circle - behind Arkana logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div
                    className="relative w-[216px] h-[216px] md:w-[278px] md:h-[278px]"
                    style={{
                        clipPath: "circle(50%)",
                        borderRadius: "50%",
                        overflow: "hidden"
                    }}
                >
                    <Image
                        src="/mage.png"
                        alt="Mage"
                        fill
                        className="object-contain opacity-80"
                        style={{
                            filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))"
                        }}
                        priority
                    />
                </div>
            </div>

            {/* Bottom fade gradient - only for this section */}
            <div
                className="absolute inset-0"
                style={{
                    background: "radial-gradient(circle at 50% 100%, rgba(20, 20, 32, 0.7) 0%, transparent 60%)"
                }}
            />

            {/* Content */}
            <div className="relative z-20 max-w-5xl mx-auto px-4 text-center mt-[250px] md:mt-[300px]">
                <h1 className="font-sans text-3xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight tracking-wider">
                    <span
                        className="block text-primary"
                        style={{
                            textShadow: `
                                -2px -2px 0 rgba(255, 255, 255, 0.8),
                                2px -2px 0 rgba(255, 255, 255, 0.8),
                                -2px 2px 0 rgba(255, 255, 255, 0.8),
                                2px 2px 0 rgba(255, 255, 255, 0.8),
                                0 0 30px rgba(168, 85, 247, 0.7),
                                0 0 60px rgba(168, 85, 247, 0.5)
                            `,
                            WebkitTextStroke: "1px rgba(255, 255, 255, 0.6)",
                            paintOrder: "stroke fill"
                        }}
                    >
                        ARKANA
                    </span>
                    <span
                        className="block mt-3 text-lg md:text-2xl lg:text-3xl text-foreground/80 font-mono tracking-widest"
                        style={{
                            textShadow: `
                                -1px -1px 0 rgba(255, 255, 255, 0.7),
                                1px -1px 0 rgba(255, 255, 255, 0.7),
                                -1px 1px 0 rgba(255, 255, 255, 0.7),
                                1px 1px 0 rgba(255, 255, 255, 0.7),
                                0 0 20px rgba(168, 85, 247, 0.5)
                            `,
                            WebkitTextStroke: "0.5px rgba(255, 255, 255, 0.5)",
                            paintOrder: "stroke fill"
                        }}
                    >
                        PRIVACY MAGERY
                    </span>
                </h1>

                {/* Typed description */}
                <p
                    className="font-mono text-base md:text-lg text-muted-foreground mb-12 h-14 md:h-10 max-w-xl mx-auto"
                    style={{
                        textShadow: `
                            -1px -1px 0 rgba(255, 255, 255, 0.6),
                            1px -1px 0 rgba(255, 255, 255, 0.6),
                            -1px 1px 0 rgba(255, 255, 255, 0.6),
                            1px 1px 0 rgba(255, 255, 255, 0.6),
                            0 0 15px rgba(168, 85, 247, 0.4)
                        `,
                        WebkitTextStroke: "0.5px rgba(255, 255, 255, 0.4)",
                        paintOrder: "stroke fill"
                    }}
                >
                    {typedText}
                    <span
                        className="inline-block w-2 h-4 bg-primary/70 ml-1 align-middle"
                        style={{ opacity: showCursor ? 1 : 0 }}
                    />
                </p>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/40" />
                    <span className="text-primary/40 text-lg">◈</span>
                    <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/40" />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/initialize">
                        <SpellButton variant="primary">
                            Begin the Ritual
                        </SpellButton>
                    </Link>
                    <SpellButton variant="secondary">
                        Read the Grimoire
                    </SpellButton>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                    <span className="font-mono text-xs md:text-sm text-muted-foreground/60 tracking-[0.3em] uppercase">Descend</span>
                    <div className="w-px h-10 bg-gradient-to-b from-primary/30 to-transparent animate-pulse" />
                </div>
            </div>
        </section>
    )
}

