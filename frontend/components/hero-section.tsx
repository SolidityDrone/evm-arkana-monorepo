"use client"

import { useEffect, useState } from "react"
import { RitualCircle } from "./ritual-circle"
import Image from "next/image"

export function HeroSection() {
    const [typedText, setTypedText] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const fullText = "Your DeFi ops, shrouded in crypto-sorcery"

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
                        className="block"
                        style={{
                            color: "#000000",
                            textShadow: `
                                -2px -2px 0 rgba(255, 255, 255, 1),
                                2px -2px 0 rgba(255, 255, 255, 1),
                                -2px 2px 0 rgba(255, 255, 255, 1),
                                2px 2px 0 rgba(255, 255, 255, 1),
                                -3px -3px 0 rgba(255, 255, 255, 0.8),
                                3px -3px 0 rgba(255, 255, 255, 0.8),
                                -3px 3px 0 rgba(255, 255, 255, 0.8),
                                3px 3px 0 rgba(255, 255, 255, 0.8),
                                0 0 30px rgba(168, 85, 247, 0.7),
                                0 0 60px rgba(168, 85, 247, 0.5)
                            `,
                            WebkitTextStroke: "2px rgba(255, 255, 255, 1)",
                            paintOrder: "stroke fill"
                        }}
                    >
                        ARKANA
                    </span>
                    <span
                        className="block mt-3 text-lg md:text-2xl lg:text-3xl font-mono tracking-widest"
                        style={{
                            color: "#000000",
                            textShadow: `
                                -1px -1px 0 rgba(255, 255, 255, 1),
                                1px -1px 0 rgba(255, 255, 255, 1),
                                -1px 1px 0 rgba(255, 255, 255, 1),
                                1px 1px 0 rgba(255, 255, 255, 1),
                                -2px -2px 0 rgba(255, 255, 255, 0.8),
                                2px -2px 0 rgba(255, 255, 255, 0.8),
                                -2px 2px 0 rgba(255, 255, 255, 0.8),
                                2px 2px 0 rgba(255, 255, 255, 0.8),
                                0 0 20px rgba(168, 85, 247, 0.5)
                            `,
                            WebkitTextStroke: "1.5px rgba(255, 255, 255, 1)",
                            paintOrder: "stroke fill"
                        }}
                    >
                        PRIVACY MAGERY
                    </span>
                </h1>

                {/* Typed description */}
                <div className="mb-12 max-w-2xl mx-auto">
                    <p
                        className="font-mono text-lg md:text-xl lg:text-xl text-white/95 h-20 md:h-16 px-6 py-3 rounded-lg inline-block"
                        style={{
                            background: "linear-gradient(135deg, rgba(0, 0, 0, 0.75) 0%, rgba(30, 20, 50, 0.85) 100%)",
                            backdropFilter: "blur(8px)",
                            boxShadow: "0 4px 30px rgba(168, 85, 247, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)"
                        }}
                    >
                        {typedText}
                        <span
                            className="inline-block w-3 h-6 bg-primary ml-1 align-middle"
                            style={{ opacity: showCursor ? 1 : 0 }}
                        />
                    </p>
                </div>

                {/* Decorative line */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary/40" />
                    <span className="text-primary/40 text-lg">◈</span>
                    <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary/40" />
                </div>

                {/* Built With */}
                <div className="flex flex-col items-center gap-5">
                    <span className="text-xs text-muted-foreground/50 tracking-[0.3em] uppercase">
                        Built With
                    </span>
                    <div className="flex items-center justify-center gap-4 md:gap-6">
                        <a
                            href="https://aave.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105 bg-white/90 hover:bg-white rounded-xl px-4 py-3"
                        >
                            <Image
                                src="/aavelogotext.png"
                                alt="Aave"
                                width={140}
                                height={48}
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                        </a>
                        <a
                            href="https://drand.love"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105 bg-white/90 hover:bg-white rounded-xl px-4 py-3"
                        >
                            <Image
                                src="/drandlogotext.png"
                                alt="drand"
                                width={140}
                                height={48}
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                        </a>
                        <a
                            href="https://uniswap.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-105 bg-white/90 hover:bg-white rounded-xl px-4 py-3"
                        >
                            <Image
                                src="/unilogotext.png"
                                alt="Uniswap"
                                width={140}
                                height={48}
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
                    <div className="w-px h-10 bg-gradient-to-b from-primary/30 to-transparent animate-pulse" />
                </div>
            </div>
        </section>
    )
}

