"use client"

export function RitualCircle({ className = "" }: { className?: string }) {

  // Create ring with more runes and some ETH logos
  const ringGlyphs: Array<
    | { kind: "eth"; size: number }
    | { kind: "rune"; symbol: string; size: number }
  > = []




  // Circular text phrases in Cirth runes
  const phrases = [
    "ᛋ ᛟ ᚹ ᚱ ᛂ ᛝ ᛁ ᚿ ᛁ ᛏ ᛦ - ᚱ ᛏ ᚢ ᛋ ᛏ ᛚ ᛂ ᛋ ᛋ - ᚴ ᛟ ᚿ ᛚ ᛟ ᚹ ᛂ ᚵ ᛂ - ᛈ ᚱ ᛁ ᚹ ᛆ ᛏ ᛂ ᛁ ᛋ ᚠ ᚱ ᛂ ᛑ ᛟ ᛘ -"

  ]

  return (
    // Hydration warning suppressed because SVG trig math can differ by tiny float epsilons between server and client
    <div className={`relative ${className}`} suppressHydrationWarning>
      {/* Outer circle - slow rotation; suppress hydration warnings for tiny float diffs */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full animate-spin"
        style={{ animationDuration: "60s" }}
        suppressHydrationWarning
      >
        {/* Outermost ethereal ring */}
        <circle
          cx="200"
          cy="200"
          r="195"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary/90 drop-shadow-[0_0_12px_rgba(168,85,247,0.55)]"
        />

        {/* Outer ring with subtle dashes */}
        <circle
          cx="200"
          cy="200"
          r="185"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-primary/85 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]"
          strokeDasharray="20 10 5 10"
        />

        {/* Inner ring */}
        <circle
          cx="200"
          cy="200"
          r="155"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary/90 drop-shadow-[0_0_10px_rgba(168,85,247,0.45)]"
        />

        {/* Circular text phrases in Cirth runes - outer ring */}
        <g>
          {phrases.map((phrase, phraseIndex) => {
            // Calculate angle for this phrase section (3 phrases = 120 degrees each)
            const sectionAngle = 360 / phrases.length
            const baseAngle = (phraseIndex * sectionAngle - 90) * Math.PI / 180
            const radius = 175
            const centerX = 200
            const centerY = 200
            const chars = phrase.split("")
            // Distribute characters across the section, leaving space for separator
            const charsPerSection = Math.floor((sectionAngle * Math.PI / 180 * radius) / 12)
            const anglePerChar = (sectionAngle * Math.PI / 180) / (charsPerSection + 1)
            const startOffset = -chars.length / 2 * anglePerChar

            return (
              <g key={`phrase-${phraseIndex}`}>
                {chars.map((char, charIndex) => {
                  if (char === " ") {
                    // Skip spaces
                    return null
                  }
                  const charAngle = baseAngle + startOffset + charIndex * anglePerChar
                  const x = centerX + radius * Math.cos(charAngle)
                  const y = centerY + radius * Math.sin(charAngle)
                  // Rotate -90 degrees to point toward center
                  const rotation = (charAngle * 180 / Math.PI) - 90

                  return (
                    <text
                      key={charIndex}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgb(119, 25, 207)"
                      transform={`rotate(${rotation} ${x} ${y})`}
                      style={{
                        fontSize: "22px",
                        fontFamily: "monospace",
                        letterSpacing: "0.5px",
                        stroke: "rgba(255, 240, 255, 0.8)",
                        strokeWidth: "0.3px",
                        paintOrder: "stroke fill"
                      }}
                    >
                      {char}
                    </text>
                  )
                })}
                {/* Add separator "-" after each phrase (including after last to complete circle) */}
                <text
                  x={centerX + radius * Math.cos(baseAngle + (sectionAngle / 2) * Math.PI / 180)}
                  y={centerY + radius * Math.sin(baseAngle + (sectionAngle / 2) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgb(119, 25, 207)"
                  transform={`rotate(${baseAngle * 180 / Math.PI + sectionAngle / 2 - 90} ${centerX + radius * Math.cos(baseAngle + (sectionAngle / 2) * Math.PI / 180)} ${centerY + radius * Math.sin(baseAngle + (sectionAngle / 2) * Math.PI / 180)})`}
                  style={{
                    fontSize: "12px",
                    fontFamily: "monospace",
                    stroke: "rgba(255, 240, 255, 0.7)",
                    strokeWidth: "0.2px",
                    paintOrder: "stroke fill"
                  }}
                >
                  -
                </text>
              </g>
            )
          })}
        </g>

        {/* Cirth runes around the circle - pointing toward center */}
        <g>
          {ringGlyphs.map((glyph, i) => {
            const angle = (i * 360 / ringGlyphs.length) - 90 // Start at top
            const rad = (angle * Math.PI) / 180
            const radius = 170
            const x = 200 + radius * Math.cos(rad)
            const y = 200 + radius * Math.sin(rad)
            // Rotation to point toward center: angle - 90 degrees
            const rotation = angle - 90

            if (glyph.kind === "eth") {
              return (
                <g
                  key={i}
                  transform={`translate(${x}, ${y}) rotate(${rotation})`}
                >
                  <image
                    href="/eth_logo.svg"
                    x={-glyph.size / 2}
                    y={-glyph.size / 2}
                    width={glyph.size}
                    height={glyph.size}
                    className="opacity-95"
                    style={{
                      filter: "drop-shadow(0 0 4px rgba(168, 85, 247, 0.9))"
                    }}
                  />
                </g>
              )
            }

            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-primary/95 fill-current"
                transform={`rotate(${rotation} ${x} ${y})`}
                style={{
                  fontSize: `${glyph.size}px`,
                  fontFamily: "monospace",
                  stroke: "rgba(255, 240, 255, 0.7)",
                  strokeWidth: "0.3px",
                  paintOrder: "stroke fill"
                }}
              >
                {glyph.symbol}
              </text>
            )
          })}
        </g>

        {/* Properly centered pentagram */}
        {(() => {
          const centerX = 200
          const centerY = 200
          const outerRadius = 150
          const innerRadius = outerRadius * 0.382 // Golden ratio for pentagram

          // Calculate pentagram points (5 outer points, 5 inner points alternating)
          const points = []
          for (let i = 0; i < 10; i++) {
            const angle = (i * 36 - 90) * Math.PI / 180 // Start at top, 36° increments
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)
            points.push(`${x},${y}`)
          }
          return (
            <polygon
              points={points.join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-primary/85"
            />
          )
        })()}

        {/* Inner pentagram - smaller and properly centered */}
        {(() => {
          const centerX = 200
          const centerY = 200
          const outerRadius = 120
          const innerRadius = outerRadius * 0.382

          const points = []
          for (let i = 0; i < 10; i++) {
            const angle = (i * 36 - 90) * Math.PI / 180
            const radius = i % 2 === 0 ? outerRadius : innerRadius
            const x = centerX + radius * Math.cos(angle)
            const y = centerY + radius * Math.sin(angle)
            points.push(`${x},${y}`)
          }
          return (
            <polygon
              points={points.join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-primary/75"
            />
          )
        })()}
      </svg>
      {/* Inner circle - very slow counter-rotation (still lightweight) */}
      <div
        className="absolute inset-[20%] animate-spin"
        style={{ animationDuration: "90s", animationDirection: "reverse" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-primary/85"
            strokeDasharray="8 4"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-primary/80"
          />
          {/* Inner Cirth runes */}
          <g>
            {[0, 90, 180, 270].map((angle, i) => {
              const rad = (angle * Math.PI) / 180
              const x = 50 + 30 * Math.cos(rad)
              const y = 50 + 30 * Math.sin(rad)
              const rotation = angle - 90 // Point toward center (-90 degrees)
              const runes = ["ᚠ", "ᚦ", "ᚨ", "ᚱ"] // Power, Protection, Strength, Journey
              return (
                <text
                  key={i}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-primary/90 fill-current"
                  transform={`rotate(${rotation} ${x} ${y})`}
                  style={{
                    fontSize: "8px",
                    fontFamily: "monospace",
                    stroke: "rgba(255, 240, 255, 0.6)",
                    strokeWidth: "0.2px",
                    paintOrder: "stroke fill"
                  }}
                >
                  {runes[i]}
                </text>
              )
            })}
          </g>
        </svg>
      </div>
      {/* Center glow - subtle pulsing using Tailwind animate-pulse */}
      <div
        className="absolute inset-[38%] rounded-full animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.95) 0%, rgba(168, 85, 247, 0.8) 40%, rgba(168, 85, 247, 0.5) 70%, transparent 90%)"
        }}
      />
    </div>
  )
}

