"use client"

// Rune ring — 18 Elder Futhark runes at 20° intervals
const RUNE_RING_18 = [
  "ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ",
  "ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ",
  "ᛇ","ᛈ","ᛉ","ᛋ","ᛏ","ᛒ",
]

// Inner ring — 6 runes at 60° intervals
const RUNE_RING_6 = ["ᛖ","ᛗ","ᛚ","ᛜ","ᛞ","ᛟ"]

// Cirth phrase on the text ring
const PHRASE = "ᛋ ᛟ ᚹ ᚱ ᛂ ᛝ ᛁ ᚿ ᛁ ᛏ ᛦ - ᚱ ᛏ ᚢ ᛋ ᛏ ᛚ ᛂ ᛋ ᛋ - ᚴ ᛟ ᚿ ᛚ ᛟ ᚹ ᛂ ᚵ ᛂ - ᛈ ᚱ ᛁ ᚹ ᛆ ᛏ ᛂ ᛁ ᛋ ᚠ ᚱ ᛂ ᛑ ᛟ ᛘ -"

const CX = 200
const CY = 200

// Build the 10-point pentagram polygon
function pentagramPoints(outerR: number): string {
  const pts: string[] = []
  const innerR = outerR * 0.382
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * Math.PI / 180
    const r = i % 2 === 0 ? outerR : innerR
    pts.push(`${CX + r * Math.cos(angle)},${CY + r * Math.sin(angle)}`)
  }
  return pts.join(" ")
}

// Build two triangles for hexagram
function hexagramTriangles(r: number): { t1: string; t2: string } {
  const t1: string[] = [], t2: string[] = []
  for (let i = 0; i < 3; i++) {
    const a1 = (i * 120 - 90) * Math.PI / 180
    const a2 = (i * 120 + 30) * Math.PI / 180
    t1.push(`${CX + r * Math.cos(a1)},${CY + r * Math.sin(a1)}`)
    t2.push(`${CX + r * Math.cos(a2)},${CY + r * Math.sin(a2)}`)
  }
  return { t1: t1.join(" "), t2: t2.join(" ") }
}

export function RitualCircle({ className = "" }: { className?: string }) {
  const { t1, t2 } = hexagramTriangles(128)

  return (
    <div className={`relative ${className}`} suppressHydrationWarning>

      {/* ─── Outer SVG — slow clockwise rotation ────────────────────────── */}
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full animate-spin"
        style={{ animationDuration: "70s" }}
        suppressHydrationWarning
      >
        {/* Outermost glow ring */}
        <circle cx={CX} cy={CY} r="195" fill="none"
          stroke="rgba(168,85,247,0.80)" strokeWidth="1.5"
          style={{ filter: "drop-shadow(0 0 10px rgba(168,85,247,0.45))" }}
        />

        {/* 8 bright nodes at cardinal + ordinal positions on r=193 */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg - 90) * Math.PI / 180
          const x = CX + 193 * Math.cos(rad)
          const y = CY + 193 * Math.sin(rad)
          return (
            <g key={`node-${i}`}>
              <circle cx={x} cy={y} r="4" fill="rgba(168,85,247,0.9)"
                style={{ filter: "drop-shadow(0 0 7px rgba(196,181,253,0.9))" }} />
              <circle cx={x} cy={y} r="2" fill="rgba(240,220,255,0.95)" />
            </g>
          )
        })}

        {/* Dashed decorative ring */}
        <circle cx={CX} cy={CY} r="185" fill="none"
          stroke="rgba(139,92,246,0.45)" strokeWidth="1"
          strokeDasharray="6 5 2 5"
        />

        {/* ── Rune ring: 18 runes at 20° intervals on r=174 ───────────── */}
        {RUNE_RING_18.map((rune, i) => {
          const deg = i * 20 - 90
          const rad = deg * Math.PI / 180
          const r = 174
          const x = CX + r * Math.cos(rad)
          const y = CY + r * Math.sin(rad)
          return (
            <text key={`rune-outer-${i}`}
              x={x} y={y}
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(196,181,253,0.78)"
              transform={`rotate(${deg + 90} ${x} ${y})`}
              style={{
                fontSize: "13px",
                fontFamily: "monospace",
                filter: "drop-shadow(0 0 4px rgba(168,85,247,0.65))",
              }}
            >{rune}</text>
          )
        })}

        {/* Inner boundary ring */}
        <circle cx={CX} cy={CY} r="160" fill="none"
          stroke="rgba(168,85,247,0.75)" strokeWidth="1.8"
          style={{ filter: "drop-shadow(0 0 7px rgba(168,85,247,0.35))" }}
        />

        {/* Cirth text ring at r=148 */}
        {(() => {
          const radius = 148
          const chars = PHRASE.split("")
          const circumference = 2 * Math.PI * radius
          const anglePerChar = (2 * Math.PI) / (circumference / 11)
          const startAngle = -Math.PI / 2

          return (
            <g>
              {chars.map((char, i) => {
                if (char === " ") return null
                const angle = startAngle + i * anglePerChar
                const x = CX + radius * Math.cos(angle)
                const y = CY + radius * Math.sin(angle)
                const rotation = (angle * 180 / Math.PI) - 90
                return (
                  <text key={`cirth-${i}`}
                    x={x} y={y}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(167,120,247,0.72)"
                    transform={`rotate(${rotation} ${x} ${y})`}
                    style={{
                      fontSize: "19px",
                      fontFamily: "monospace",
                      stroke: "rgba(255,240,255,0.55)",
                      strokeWidth: "0.2px",
                      paintOrder: "stroke fill",
                    }}
                  >{char}</text>
                )
              })}
            </g>
          )
        })()}

        {/* Mid ring */}
        <circle cx={CX} cy={CY} r="132" fill="none"
          stroke="rgba(109,40,217,0.40)" strokeWidth="1"
          strokeDasharray="3 7"
        />

        {/* Hexagram (two overlapping triangles) */}
        <polygon points={t1} fill="none"
          stroke="rgba(139,92,246,0.55)" strokeWidth="1.1"
          style={{ filter: "drop-shadow(0 0 4px rgba(139,92,246,0.3))" }}
        />
        <polygon points={t2} fill="none"
          stroke="rgba(139,92,246,0.55)" strokeWidth="1.1"
          style={{ filter: "drop-shadow(0 0 4px rgba(139,92,246,0.3))" }}
        />

        {/* 6 nodes at hexagram points */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg - 90) * Math.PI / 180
          const x = CX + 128 * Math.cos(rad)
          const y = CY + 128 * Math.sin(rad)
          return (
            <circle key={`hnode-${i}`} cx={x} cy={y} r="2.5"
              fill="rgba(139,92,246,0.8)"
              style={{ filter: "drop-shadow(0 0 4px rgba(139,92,246,0.7))" }}
            />
          )
        })}

        {/* Outer pentagram at r=118 */}
        <polygon points={pentagramPoints(118)} fill="none"
          stroke="rgba(168,85,247,0.70)" strokeWidth="1.2"
          style={{ filter: "drop-shadow(0 0 5px rgba(168,85,247,0.25))" }}
        />

        {/* Inner pentagram at r=94 */}
        <polygon points={pentagramPoints(94)} fill="none"
          stroke="rgba(124,58,237,0.55)" strokeWidth="0.9"
        />

        {/* Inner 6-rune ring at r=74 */}
        {RUNE_RING_6.map((rune, i) => {
          const deg = i * 60 - 90
          const rad = deg * Math.PI / 180
          const x = CX + 74 * Math.cos(rad)
          const y = CY + 74 * Math.sin(rad)
          return (
            <text key={`rune-inner-${i}`}
              x={x} y={y}
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(196,181,253,0.60)"
              transform={`rotate(${deg + 90} ${x} ${y})`}
              style={{ fontSize: "11px", fontFamily: "monospace" }}
            >{rune}</text>
          )
        })}
      </svg>

      {/* ─── Inner SVG — slow counter-rotation ──────────────────────────── */}
      <div
        className="absolute inset-[18%] animate-spin"
        style={{ animationDuration: "100s", animationDirection: "reverse" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Outer dashed ring */}
          <circle cx="50" cy="50" r="46" fill="none"
            stroke="rgba(168,85,247,0.70)" strokeWidth="0.7"
            strokeDasharray="8 4"
          />
          {/* Solid inner ring */}
          <circle cx="50" cy="50" r="36" fill="none"
            stroke="rgba(168,85,247,0.65)" strokeWidth="0.6"
          />
          {/* Square at 45° */}
          {(() => {
            const r = 32
            const pts = [0, 90, 180, 270].map(deg => {
              const rad = (deg + 45) * Math.PI / 180
              return `${50 + r * Math.cos(rad)},${50 + r * Math.sin(rad)}`
            })
            return <polygon points={pts.join(" ")} fill="none"
              stroke="rgba(109,40,217,0.45)" strokeWidth="0.5" />
          })()}
          {/* 4 cardinal runes */}
          {(["ᚠ","ᚦ","ᚨ","ᚱ"] as const).map((rune, i) => {
            const rad = (i * 90) * Math.PI / 180
            const x = 50 + 29 * Math.cos(rad)
            const y = 50 + 29 * Math.sin(rad)
            const rotation = i * 90
            return (
              <text key={i} x={x} y={y}
                textAnchor="middle" dominantBaseline="middle"
                fill="rgba(196,181,253,0.80)"
                transform={`rotate(${rotation} ${x} ${y})`}
                style={{
                  fontSize: "7.5px",
                  fontFamily: "monospace",
                  filter: "drop-shadow(0 0 2px rgba(168,85,247,0.7))",
                }}
              >{rune}</text>
            )
          })}
          {/* 4 ordinal small marks */}
          {[45, 135, 225, 315].map((deg, i) => {
            const rad = (deg) * Math.PI / 180
            const x = 50 + 43 * Math.cos(rad)
            const y = 50 + 43 * Math.sin(rad)
            return (
              <circle key={i} cx={x} cy={y} r="1.4"
                fill="rgba(168,85,247,0.65)"
                style={{ filter: "drop-shadow(0 0 2px rgba(168,85,247,0.6))" }}
              />
            )
          })}
        </svg>
      </div>

      {/* ─── Innermost pulse glow ────────────────────────────────────────── */}
      <div
        className="absolute inset-[38%] rounded-full animate-pulse"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,1) 0%, rgba(139,92,246,0.75) 35%, rgba(109,40,217,0.35) 65%, transparent 90%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  )
}
