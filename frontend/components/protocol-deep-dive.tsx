"use client"

import { useEffect, useRef, useState } from "react"

// ─── scroll hook ──────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true) }, { threshold })
    ob.observe(el)
    return () => ob.unobserve(el)
  }, [threshold])
  return { ref, inView: v }
}

// ─── colour tokens ────────────────────────────────────────────────────────────
const K = {
  purple: "#a855f7", green: "#22c55e", cyan: "#06b6d4",
  amber: "#f59e0b", red: "#ef4444", ghost: "#6b7280",
} as const
type Col = keyof typeof K

// ─── diagram primitives ───────────────────────────────────────────────────────

function Box({ label, sub, col, wide }: { label: string; sub?: string; col: Col; wide?: boolean }) {
  return (
    <div
      className={`px-3 py-2 rounded-lg text-center ${wide ? "w-full" : ""}`}
      style={{ background: `${K[col]}0c`, border: `1px solid ${K[col]}3a` }}
    >
      <div className="font-mono text-xs font-semibold" style={{ color: K[col] }}>{label}</div>
      {sub && <div className="font-mono mt-0.5" style={{ fontSize: 9, color: K[col], opacity: 0.5 }}>{sub}</div>}
    </div>
  )
}

function VArr({ col, label }: { col: Col; label?: string }) {
  return (
    <div className="flex flex-col items-center" style={{ margin: "2px 0" }}>
      <div style={{ width: 1, height: 12, background: `${K[col]}55` }} />
      {label && (
        <div className="font-mono px-1.5 py-0.5 my-0.5 rounded" style={{ fontSize: 8, color: K[col], opacity: 0.6, background: `${K[col]}0c`, border: `1px solid ${K[col]}22` }}>
          {label}
        </div>
      )}
      <div style={{ width: 1, height: 12, background: `${K[col]}30` }} />
      <div style={{ width: 0, height: 0, borderLeft: "3.5px solid transparent", borderRight: "3.5px solid transparent", borderTop: `5px solid ${K[col]}`, opacity: 0.55 }} />
    </div>
  )
}

function Chain({ items }: { items: { label: string; sub?: string; col: Col; edge?: string }[] }) {
  return (
    <div className="flex flex-col items-center w-full">
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center w-full">
          <Box label={it.label} sub={it.sub} col={it.col} wide />
          {i < items.length - 1 && <VArr col={it.col} label={it.edge} />}
        </div>
      ))}
    </div>
  )
}

// ─── fork / join helpers ──────────────────────────────────────────────────────

/** Splits one line into two branches (Y-fork going down). leftCol / rightCol tint each side. */
function Fork({ leftCol, rightCol }: { leftCol: Col; rightCol: Col }) {
  return (
    <div className="flex justify-center my-0.5">
      <div style={{ width: "60%", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ height: 18, borderRight: `1px solid ${K[leftCol]}35`, borderBottom: `1px solid ${K[leftCol]}35`, borderBottomRightRadius: 7 }} />
        <div style={{ height: 18, borderLeft: `1px solid ${K[rightCol]}35`, borderBottom: `1px solid ${K[rightCol]}35`, borderBottomLeftRadius: 7 }} />
      </div>
    </div>
  )
}

/** Merges two branches into one (Y-join going down). */
function Join({ leftCol, rightCol }: { leftCol: Col; rightCol: Col }) {
  return (
    <>
      <div className="flex justify-center">
        <div style={{ width: "60%", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ height: 16, borderRight: `1px solid ${K[leftCol]}35`, borderBottom: `1px solid ${K[leftCol]}35`, borderBottomRightRadius: 7 }} />
          <div style={{ height: 16, borderLeft: `1px solid ${K[rightCol]}35`, borderBottom: `1px solid ${K[rightCol]}35`, borderBottomLeftRadius: 7 }} />
        </div>
      </div>
      <div className="flex justify-center">
        <div style={{ width: 0, height: 0, borderLeft: "3.5px solid transparent", borderRight: "3.5px solid transparent", borderTop: `5px solid ${K[leftCol]}`, opacity: 0.55 }} />
      </div>
    </>
  )
}

// ─── text helpers ─────────────────────────────────────────────────────────────

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-5 h-5 rounded-full border border-white/8 flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{n}</div>
      <p className="font-mono text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}

function Tag({ col = "ghost", children }: { col?: Col; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-xs"
      style={{ background: `${K[col]}0c`, border: `1px solid ${K[col]}28`, color: K[col] }}>
      {children}
    </span>
  )
}

function Callout({ title, col = "ghost", children }: { title: string; col?: Col; children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-4 py-3 space-y-1.5" style={{ background: "rgba(8,8,18,0.6)", border: `1px solid ${K[col]}1e` }}>
      <div className="font-mono text-xs font-semibold" style={{ color: K[col] }}>{title}</div>
      <div className="font-mono text-xs leading-relaxed" style={{ color: "rgba(160,155,180,0.7)" }}>{children}</div>
    </div>
  )
}

// ─── note helper ──────────────────────────────────────────────────────────────
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded px-2 py-1.5" style={{ background: "rgba(8,8,18,0.55)", border: "1px dashed rgba(90,90,120,0.22)" }}>
      <div className="font-mono" style={{ fontSize: 8.5, color: "rgba(150,145,170,0.8)" }}>{children}</div>
    </div>
  )
}

// ─── diagram card wrapper ─────────────────────────────────────────────────────

function DiagramCard({ accent, label, children }: { accent: string; label: string; children: React.ReactNode }) {
  return (
    <div className="relative mt-2">
      {[["top-0 left-0 border-t border-l"], ["top-0 right-0 border-t border-r"],
        ["bottom-0 left-0 border-b border-l"], ["bottom-0 right-0 border-b border-r"]].map(([cls], i) => (
        <div key={i} className={`absolute w-4 h-4 ${cls}`} style={{ borderColor: `${accent}50` }} />
      ))}
      <div className="rounded-xl p-5 m-1" style={{ background: "rgba(7,7,15,0.94)", backdropFilter: "blur(14px)", border: "1px solid rgba(50,50,75,0.28)" }}>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
          <span className="font-mono text-xs tracking-[0.18em] uppercase" style={{ color: `${accent}60` }}>{label}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── section layout ───────────────────────────────────────────────────────────

interface SectionProps {
  n: string; label: string; title: string; sub?: string
  accent: string; accentCol: Col
  text: React.ReactNode; diagram: React.ReactNode
  flip?: boolean
}

function Section({ n, label, title, sub, accent, accentCol, text, diagram, flip }: SectionProps) {
  const { ref, inView } = useInView()
  return (
    <div ref={ref} className="relative border-t border-border/15 py-20 lg:py-28 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at ${flip ? "70% 40%" : "30% 40%"},${accent}04 0%,transparent 60%)` }} />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        {/* text */}
        <div className={`space-y-5 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${flip ? "lg:order-2" : "lg:order-1"}`}>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs" style={{ color: `${accent}50` }}>{n}</span>
            <div className="h-px w-5" style={{ background: `${accent}28` }} />
            <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: `${accent}70` }}>{label}</span>
          </div>
          <div>
            <h2 className="font-sans text-3xl lg:text-4xl font-bold text-foreground leading-tight tracking-wide">{title}</h2>
            {sub && <p className="mt-1.5 font-mono text-sm" style={{ color: "rgba(160,155,180,0.5)" }}>{sub}</p>}
          </div>
          <div className="h-px w-10 rounded" style={{ background: `linear-gradient(to right,${accent},transparent)` }} />
          <div className="space-y-3.5">{text}</div>
        </div>

        {/* diagram */}
        <div className={`transition-all duration-700 delay-100 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${flip ? "lg:order-1" : "lg:order-2"}`}>
          <DiagramCard accent={accent} label={label}>{diagram}</DiagramCard>
        </div>
      </div>
    </div>
  )
}

function Div({ rune = "◈" }: { rune?: string }) {
  return (
    <div className="flex items-center gap-4 px-8 py-1">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(255,255,255,0.05),transparent)" }} />
      <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 13 }}>{rune}</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(255,255,255,0.05),transparent)" }} />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// DIAGRAMS
// ════════════════════════════════════════════════════════════════════════════

// ─── 01 Spending key & View key ───────────────────────────────────────────────
function SpendViewDiagram() {
  return (
    <div className="space-y-2">
      <Box label="Wallet (EOA)" sub='signMessage("Arkana Sigil")' col="amber" wide />
      <VArr col="amber" label="64-byte ECDSA signature" />
      <Box label="user_key" sub="32-byte scalar — deterministic, never leaves browser" col="purple" wide />

      <Fork leftCol="red" rightCol="green" />

      <div className="grid grid-cols-2 gap-2">
        {/* spending key */}
        <div className="space-y-1.5">
          <div className="font-mono text-center font-semibold" style={{ fontSize: 9.5, color: K.red }}>SPENDING KEY</div>
          <div className="rounded-lg p-2.5 space-y-1" style={{ background: `${K.red}08`, border: `1px solid ${K.red}35` }}>
            {["generate ZK proofs", "sign transactions", "controls all funds"].map(t => (
              <div key={t} className="font-mono" style={{ fontSize: 9, color: K.red, opacity: 0.7 }}>· {t}</div>
            ))}
          </div>
          <div className="rounded text-center py-1 font-mono" style={{ fontSize: 9, background: `${K.red}10`, color: K.red, border: `1px solid ${K.red}35` }}>
            ⚠ never export
          </div>
        </div>

        {/* view key */}
        <div className="space-y-1.5">
          <div className="font-mono text-center font-semibold" style={{ fontSize: 9.5, color: K.green }}>VIEW KEY</div>
          <div className="rounded-lg p-2.5 space-y-1" style={{ background: `${K.green}07`, border: `1px solid ${K.green}30` }}>
            {["scan your notes", "read balances", "cannot spend"].map(t => (
              <div key={t} className="font-mono" style={{ fontSize: 9, color: K.green, opacity: 0.7 }}>· {t}</div>
            ))}
          </div>
          <div className="rounded text-center py-1 font-mono" style={{ fontSize: 9, background: `${K.green}09`, color: K.green, border: `1px solid ${K.green}35` }}>
            ✓ safe to share
          </div>
        </div>
      </div>

      <Note>view key = user_key — same scalar, read-only semantics when shared</Note>
    </div>
  )
}

// ─── 02 zkAddress derivation ──────────────────────────────────────────────────
function ZkKeyDiagram() {
  return (
    <Chain items={[
      { label: "Wallet (EOA)", sub: 'signMessage("Arkana Sigil")', col: "amber", edge: "64-byte signature" },
      { label: "keccak256(sig)", sub: "64 bytes → 32-byte scalar in 𝔽ₚ", col: "amber", edge: "scalar s" },
      { label: "user_key  (private)", sub: "deterministic · never leaves browser", col: "purple", edge: "s × G  on BabyJubjub" },
      { label: "public point (x, y)", sub: "one-way — cannot reverse to recover user_key", col: "purple", edge: 'hex-encode, prepend "zk"' },
      { label: '"zk" + hex(x‖y)', sub: "public zkAddress — share freely", col: "purple" },
    ]} />
  )
}

// ─── 03 Commitments & Positions ──────────────────────────────────────────────
function CommitPosDiagram() {
  return (
    <div className="space-y-3">
      {/* ── Pedersen split ── */}
      <div className="font-mono text-center" style={{ fontSize: 9, color: K.ghost, letterSpacing: "0.12em" }}>SPLIT PEDERSEN COMMITMENT</div>

      <div className="grid grid-cols-2 gap-2 items-start">
        <div className="space-y-1.5">
          <div className="font-mono text-center pb-1 border-b" style={{ fontSize: 9, color: K.purple, borderColor: `${K.purple}22` }}>CIRCUIT · private</div>
          <Box label="spending_key" sub="H(user_key, chain, token)" col="purple" wide />
          <VArr col="purple" />
          <Box label="partial commit  P" sub="sk·D + nc·J   (Grumpkin)" col="purple" wide />
        </div>
        <div className="space-y-1.5">
          <div className="font-mono text-center pb-1 border-b" style={{ fontSize: 9, color: K.cyan, borderColor: `${K.cyan}20` }}>CONTRACT · public</div>
          <Box label="P  +  shares·G" sub="shares known after ERC-4626 mint" col="cyan" wide />
          <VArr col="cyan" label="Poseidon2" />
          <Box label="Merkle leaf" sub="H(Q.x, Q.y)  →  tree insert" col="cyan" wide />
        </div>
      </div>

      <Note>P is a public proof output — circuit commits to private values, contract adds shares·G once minted</Note>

      {/* ── Positions in shares ── */}
      <div className="pt-1">
        <div className="font-mono text-center mb-2" style={{ fontSize: 9, color: K.ghost, letterSpacing: "0.12em" }}>POSITIONS IN SHARES</div>
        <Chain items={[
          { label: "ArkanaVault  (ERC-4626)", sub: "tokens → Aave → aTokens (rebasing)", col: "cyan", edge: "totalAssets grows, totalSupply fixed" },
          { label: "share price rises over time", sub: "each share worth more tokens as yield accrues", col: "cyan", edge: "withdraw: shares × price = tokens + yield" },
          { label: "Merkle leaf stores share count", sub: "hidden position · silent yield", col: "purple" },
        ]} />
      </div>

      <Note>fee charged upfront at deposit → all withdrawals look identical on-chain</Note>
    </div>
  )
}

// ─── 04 Deposit flow ──────────────────────────────────────────────────────────
function DepositDiagram() {
  const colOf: Record<string, Col> = { User: "amber", Arkana: "purple", Vault: "cyan", Aave: "cyan" }
  const steps: { from: string; to: string; msg: string }[] = [
    { from: "User",   to: "Arkana", msg: "deposit(proof, tokens)" },
    { from: "Arkana", to: "Arkana", msg: "verify Groth16 proof  ✓" },
    { from: "Arkana", to: "Vault",  msg: "deposit(tokens)" },
    { from: "Vault",  to: "Aave",   msg: "supply(tokens)" },
    { from: "Aave",   to: "Vault",  msg: "← aTokens returned" },
    { from: "Vault",  to: "Arkana", msg: "← share count" },
    { from: "Arkana", to: "Arkana", msg: "P + shares·G → Q" },
    { from: "Arkana", to: "Arkana", msg: "insertLeaf(Merkle)  ✓" },
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1 mb-1">
        {Object.entries(colOf).map(([name, col]) => (
          <div key={name} className="font-mono text-center rounded py-1" style={{ fontSize: 9, color: K[col], background: `${K[col]}0c`, border: `1px solid ${K[col]}32` }}>
            {name}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {steps.map(({ from, to, msg }, i) => {
          const col = colOf[from]
          const self = from === to
          return (
            <div key={i} className="flex items-center gap-1.5 rounded px-2 py-1.5" style={{ background: `${K[col]}06` }}>
              <span className="font-mono flex-shrink-0" style={{ fontSize: 8, color: K.ghost, width: 18, textAlign: "right" }}>{i + 1}.</span>
              <span className="font-mono flex-shrink-0 font-semibold" style={{ fontSize: 9, color: K[col] }}>{from}</span>
              <span style={{ color: K.ghost, fontSize: 10 }}>{self ? "↩" : "→"}</span>
              <span className="font-mono flex-shrink-0" style={{ fontSize: 9, color: K[colOf[to]] }}>{to}</span>
              <span style={{ color: K.ghost, fontSize: 9 }}>·</span>
              <span className="font-mono" style={{ fontSize: 9, color: "rgba(200,195,220,0.65)" }}>{msg}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 05 Private Withdrawal ────────────────────────────────────────────────────
function WithdrawDiagram() {
  return (
    <Chain items={[
      { label: "Withdraw circuit (browser)", sub: "Groth16 proof of Merkle inclusion", col: "purple", edge: "proof + nullifier" },
      { label: "Contract: nullifier check", sub: "usedNullifiers[n] == false  ✓", col: "purple", edge: "valid → proceed" },
      { label: "Vault burns shares", sub: "ERC-4626 redeem → aTokens → tokens", col: "cyan", edge: "transfer to recipient" },
      { label: "Recipient receives tokens + yield", sub: "any address — unlinkable from depositor", col: "cyan", edge: "mark nullifier used" },
      { label: "Nullifier marked spent", sub: "double-spend permanently prevented", col: "ghost" },
    ]} />
  )
}

// ─── 06 Send & Absorb (P2P) ───────────────────────────────────────────────────
function SendAbsorbDiagram() {
  return (
    <div className="space-y-2">
      {/* SEND */}
      <div className="rounded-lg p-3 space-y-1.5" style={{ background: `${K.purple}07`, border: `1px solid ${K.purple}25` }}>
        <div className="font-mono text-xs font-semibold mb-1" style={{ color: K.purple }}>SEND  ·  Alice</div>
        <Chain items={[
          { label: "Ephemeral keypair  (r, R=r·G)", sub: "one-time — R emitted on-chain for discovery", col: "purple", edge: "ECDH:  S = r · Bob_pk" },
          { label: "Pedersen note  P = amount·G + S·H", sub: "binds amount to shared secret", col: "purple", edge: "contract adds P to note stack" },
          { label: "Note stack updated on-chain", sub: "aggregate Σ Pᵢ stored as Merkle leaf", col: "ghost" },
        ]} />
      </div>

      <div className="flex items-center gap-2 my-0.5">
        <div className="flex-1 h-px" style={{ background: "rgba(80,80,110,0.2)" }} />
        <span className="font-mono" style={{ fontSize: 8, color: K.ghost }}>Merkle tree</span>
        <div className="flex-1 h-px" style={{ background: "rgba(80,80,110,0.2)" }} />
      </div>

      {/* ABSORB */}
      <div className="rounded-lg p-3 space-y-1.5" style={{ background: `${K.cyan}06`, border: `1px solid ${K.cyan}22` }}>
        <div className="font-mono text-xs font-semibold mb-1" style={{ color: K.cyan }}>ABSORB  ·  Bob</div>
        <Chain items={[
          { label: "Scan emitted R values", sub: "compute  Sᵢ = sk_bob · Rᵢ  for each leaf", col: "cyan", edge: "decrypt amountᵢ for matching notes" },
          { label: "Openings to aggregate stack known", sub: "{ amountᵢ, Sᵢ }  →  Σ Pᵢ fully open", col: "cyan", edge: "Absorb-Send or Absorb-Withdraw circuit" },
          { label: "ZK proof: valid stack openings", sub: "nullifies aggregate · creates new commitment", col: "cyan" },
        ]} />
      </div>

      <Note>Observer sees: ephemeral R keys + stack leaf updates. Amounts, identities, and links are all hidden.</Note>
    </div>
  )
}

// ─── 07 FROST Threshold Signing ───────────────────────────────────────────────
function FrostThresholdDiagram() {
  return (
    <div className="space-y-2">
      <div className="rounded px-2 py-1.5 text-center mb-1" style={{ background: `${K.cyan}09`, border: `1px solid ${K.cyan}25` }}>
        <span className="font-mono font-semibold" style={{ fontSize: 9.5, color: K.cyan }}>2-of-2 FROST  ·  any two devices</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Box label="Device A  s₁" sub="share in IndexedDB" col="purple" wide />
          <VArr col="purple" label="r₁ ← random nonce" />
          <Box label="R₁ = r₁ · G" sub="nonce commitment" col="purple" wide />
        </div>
        <div className="space-y-1.5">
          <Box label="Device B  s₂" sub="derived from second wallet sig" col="cyan" wide />
          <VArr col="cyan" label="r₂ ← random nonce" />
          <Box label="R₂ = r₂ · G" sub="nonce commitment" col="cyan" wide />
        </div>
      </div>

      <Join leftCol="purple" rightCol="cyan" />

      <Box label="Aggregate nonce  R = R₁ + R₂" sub="exchange only public commitments" col="purple" wide />
      <VArr col="purple" label="each device: partial response σᵢ" />
      <Box label="Signature  σ = σ₁ + σ₂" sub="Schnorr · indistinguishable from single-signer" col="purple" wide />

      <Note>Device A stolen → useless without B · Device B lost → re-derive s₂ from same wallet</Note>
    </div>
  )
}

// ─── 08 FROST Multisig ────────────────────────────────────────────────────────
function FrostMultisigDiagram() {
  return (
    <div className="space-y-3">
      <div className="rounded px-2 py-1.5 text-center" style={{ background: `${K.amber}09`, border: `1px solid ${K.amber}25` }}>
        <span className="font-mono font-semibold" style={{ fontSize: 9.5, color: K.amber }}>DKG  ·  Distributed Key Generation</span>
        <div className="font-mono mt-0.5" style={{ fontSize: 8.5, color: K.amber, opacity: 0.5 }}>shared public key · each participant holds a private share</div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {["Alice  sₐ", "Bob  s_b", "Carol  s_c", "Dave  s_d"].map(label => (
          <Box key={label} label={label} sub="secret share" col="amber" wide />
        ))}
      </div>

      <div className="rounded-lg p-2.5 space-y-1.5" style={{ background: "rgba(10,10,20,0.65)", border: "1px solid rgba(50,50,75,0.35)" }}>
        <div className="font-mono text-center text-xs" style={{ color: K.ghost }}>threshold  t = 3-of-4</div>
        {[
          { signers: ["Alice", "Bob", "Carol"], ok: true },
          { signers: ["Bob", "Carol", "Dave"],  ok: true },
          { signers: ["Alice", "Dave"],          ok: false },
        ].map(({ signers, ok }, i) => (
          <div key={i} className="flex items-center gap-2 rounded px-2 py-1" style={{ background: ok ? `${K.green}07` : `${K.ghost}07` }}>
            <span style={{ color: ok ? K.green : K.ghost, fontSize: 10 }}>{ok ? "✓" : "✗"}</span>
            <div className="flex gap-1.5 flex-1 flex-wrap">
              {signers.map(s => (
                <span key={s} className="font-mono" style={{ fontSize: 9, color: ok ? K.green : K.ghost, opacity: 0.8 }}>{s}</span>
              ))}
            </div>
            <span className="font-mono" style={{ fontSize: 9, color: ok ? K.green : K.ghost, opacity: 0.6 }}>{ok ? "→ valid" : "→ rejected"}</span>
          </div>
        ))}
      </div>

      <VArr col="amber" label="aggregate partial signatures" />
      <Box label="Signature  σ  (Schnorr)" sub="identical to single-signer · no multisig contract" col="amber" wide />
      <Note>shared Arkana account · DAO custody · protocol treasury — privacy preserved</Note>
    </div>
  )
}

// ─── 09 Nonce Discovery ───────────────────────────────────────────────────────
function NonceDiscoveryDiagram() {
  return (
    <div className="space-y-2">
      <Box label="Start  ·  nonce = 0" sub="local scan, no server" col="cyan" wide />
      <VArr col="cyan" />

      <div className="rounded-lg p-3 space-y-1.5" style={{ background: `${K.cyan}07`, border: `1px solid ${K.cyan}22` }}>
        <div className="font-mono mb-1" style={{ fontSize: 9, color: K.cyan, opacity: 0.6 }}>loop  ↻</div>
        <Chain items={[
          { label: "spending_key", sub: "H(user_key, chain_id, token)", col: "cyan", edge: "hash with nonce" },
          { label: "nonce_commit", sub: "H(view_key, nonce, token)", col: "cyan", edge: "derive leaf candidate" },
          { label: "Merkle leaf candidate", sub: "Poseidon2(commit, ...)  →  check on-chain tree", col: "cyan" },
        ]} />
      </div>

      <div className="flex justify-center">
        <div style={{ width: "70%", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ height: 16, borderRight: `1px solid ${K.green}35`, borderBottom: `1px solid ${K.green}35`, borderBottomRightRadius: 7 }} />
          <div style={{ height: 16, borderLeft: `1px solid ${K.ghost}28`, borderBottom: `1px solid ${K.ghost}28`, borderBottomLeftRadius: 7 }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center gap-1">
          <div style={{ width: 0, height: 0, borderLeft: "3.5px solid transparent", borderRight: "3.5px solid transparent", borderTop: `5px solid ${K.green}`, opacity: 0.6 }} />
          <Box label="found" sub="record nonce · increment" col="green" wide />
          <div className="font-mono" style={{ fontSize: 8, color: K.green, opacity: 0.55 }}>↩ continue</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div style={{ width: 0, height: 0, borderLeft: "3.5px solid transparent", borderRight: "3.5px solid transparent", borderTop: `5px solid ${K.ghost}`, opacity: 0.45 }} />
          <Box label="not found" sub="scan complete" col="ghost" wide />
          <div className="font-mono" style={{ fontSize: 8, color: K.ghost, opacity: 0.45 }}>stop</div>
        </div>
      </div>

      <Note>pure arithmetic · public Merkle state · zero server calls</Note>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════

export function ProtocolDeepDive() {
  return (
    <div className="relative bg-background">

      {/* global ambient */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at 20% 60%,rgba(168,85,247,0.03) 0%,transparent 55%), radial-gradient(ellipse at 80% 30%,rgba(6,182,212,0.03) 0%,transparent 55%)" }} />

      {/* header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-16 pb-4 text-center">
        <div className="inline-flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-white/20" />
          <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13 }}>◈</span>
          <span className="font-mono text-sm tracking-[0.2em] uppercase" style={{ color: "rgba(160,155,180,0.5)" }}>The Arcane Workings</span>
          <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13 }}>◈</span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>
        <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wider mb-3">
          HOW ARKANA WORKS
        </h2>
        <p className="font-mono text-base max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(160,155,180,0.6)" }}>
          Zero-knowledge proofs. Elliptic curves.
        </p>
      </div>

      {/* ── 01 Privacy Model ───────────────────────────────────────── */}
      <Section
        n="01" label="Privacy Model" accent={K.purple} accentCol="purple"
        title="Spending key & View key"
        sub="One scalar. Two roles."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Everything in Arkana derives from a single 32-byte scalar — your <span style={{ color: K.purple }}>user_key</span>. It acts as a spending key internally and as a read-only view key when shared.
          </p>
          <div className="space-y-3">
            <Step n={1}>Your wallet signs a fixed string. The resulting signature is hashed to produce <code style={{ color: K.purple }}>user_key</code> — a private scalar that never leaves your browser.</Step>
            <Step n={2}><span style={{ color: K.red }}>Spending power:</span> per-token <code style={{ color: K.red }}>spending_key</code>s are derived from user_key. They are used inside ZK circuits to authorise deposits, withdrawals, and sends — private inputs that never leave the proof.</Step>
            <Step n={3}><span style={{ color: K.green }}>View key:</span> sharing your <code style={{ color: K.green }}>user_key</code> with an auditor gives them read-only access. They can scan the Merkle tree and reconstruct your full note history — but cannot sign or spend.</Step>
          </div>
          <div className="flex flex-wrap gap-2">
            <Tag col="purple">scalar cryptography</Tag>
            <Tag col="ghost">audit trail</Tag>
            <Tag col="ghost">BabyJubjub</Tag>
          </div>
        </>}
        diagram={<SpendViewDiagram />}
      />

      <Div />

      {/* ── 02 Key Derivation ──────────────────────────────────────── */}
      <Section
        n="02" label="Key Derivation" accent={K.cyan} accentCol="cyan" flip
        title="Your zkAddress from a signature"
        sub="Deterministic. Serverless. Non-custodial."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Arkana never stores keys. Every session re-derives your <span style={{ color: K.cyan }}>zkAddress</span> from your wallet signature — a pure cryptographic function that cannot be reversed.
          </p>
          <div className="space-y-3">
            <Step n={1}>You sign <code style={{ color: K.amber }}>"Arkana Sigil"</code> with your Ethereum wallet. The 64-byte ECDSA signature is deterministic — the same wallet always produces the same bytes.</Step>
            <Step n={2}><code style={{ color: K.cyan }}>keccak256(sig)</code> compresses it to 32 bytes — a valid scalar in the BabyJubjub field. This is your <code style={{ color: K.cyan }}>user_key</code>.</Step>
            <Step n={3}>Scalar multiplication <code style={{ color: K.cyan }}>user_key × G</code> on BabyJubjub produces a public key point <code style={{ color: K.cyan }}>(x, y)</code>. This is one-way — knowing the point tells you nothing about user_key.</Step>
            <Step n={4}>The point is hex-encoded and prefixed with <code style={{ color: K.cyan }}>"zk"</code>. This is your public Arkana identity — safe to share, impossible to reverse.</Step>
          </div>
          <Callout title="Why BabyJubjub?" col="cyan">
            BabyJubjub is defined over the BN254 scalar field — the same field used by Groth16 circuits. The discrete-log relationship between user_key and zkAddress can be expressed efficiently inside a ZK proof.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="cyan">BabyJubjub</Tag>
            <Tag col="ghost">keccak256</Tag>
            <Tag col="ghost">wallet-native</Tag>
          </div>
        </>}
        diagram={<ZkKeyDiagram />}
      />

      <Div rune="✦" />

      {/* ── 03 Commitments & Positions ─────────────────────────────── */}
      <Section
        n="03" label="Commitments & Positions" accent={K.purple} accentCol="purple"
        title="Split Pedersen commitment & positions in shares"
        sub="ZK-bound in the circuit. Completed on-chain with shares. Yield accrues silently."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            A Pedersen commitment binds a secret value to a public curve point: <code style={{ color: K.purple }}>C = v·G + r·H</code>. Arkana splits the computation to avoid a race condition — and stores positions as ERC-4626 shares so yield accrues without any action.
          </p>
          <div className="space-y-3">
            <Step n={1}>The ZK circuit computes a <span style={{ color: K.purple }}>partial commitment P</span> over private values — spending_key and nonce. The share count is left out because it isn't known yet.</Step>
            <Step n={2}>P is a public proof output (a Grumpkin curve point). No private value is revealed — just the point itself.</Step>
            <Step n={3}>The contract mints ERC-4626 shares, then immediately adds <code style={{ color: K.cyan }}>shares·G</code> to P via on-chain curve addition. The share count is now cryptographically bound. <code style={{ color: K.cyan }}>Poseidon2(Q.x, Q.y)</code> produces the final Merkle leaf.</Step>
            <Step n={4}>Your Merkle leaf stores a <span style={{ color: K.cyan }}>share count</span>, not a token amount. As Aave accrues interest, each share appreciates in token value. When you withdraw, <code style={{ color: K.cyan }}>shares × price</code> returns tokens plus all accrued yield — no on-chain interaction needed in between.</Step>
          </div>
          <Callout title="Why split the computation?" col="ghost">
            ERC-4626 share minting is non-deterministic — the exact count depends on current vault state at execution time. Splitting lets the circuit commit to everything it knows; the contract completes the commitment once the share count is finalised.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="purple">Grumpkin curve</Tag>
            <Tag col="ghost">ERC-4626</Tag>
            <Tag col="ghost">Poseidon2</Tag>
            <Tag col="ghost">Aave v3</Tag>
          </div>
        </>}
        diagram={<CommitPosDiagram />}
      />

      <Div />

      {/* ── 04 Deposit Flow ────────────────────────────────────────── */}
      <Section
        n="04" label="Deposit" accent={K.amber} accentCol="amber" flip
        title="Private deposit flow"
        sub="ZK proof generated client-side. Keys never leave your device."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Depositing is a two-phase ceremony: local proof generation followed by on-chain verification and Merkle tree integration.
          </p>
          <div className="space-y-3">
            <Step n={1}><span style={{ color: K.amber }}>Entry circuit</span> (first deposit) or <span style={{ color: K.amber }}>Deposit circuit</span> runs via SnarkJS in your browser. It generates a Groth16 proof that you know a valid spending_key and nonce — without revealing either.</Step>
            <Step n={2}>The proof and tokens are submitted to the Arkana contract. The on-chain Groth16 verifier checks the proof using a pairing — constant cost regardless of circuit size.</Step>
            <Step n={3}>Tokens flow into <code style={{ color: K.amber }}>ArkanaVault → Aave</code>. ERC-4626 converts tokens to shares at the current exchange rate — the first moment the exact share count is known.</Step>
            <Step n={4}>The contract completes the Pedersen commitment (<code style={{ color: K.amber }}>P + shares·G</code>), hashes the result, and inserts the leaf into the per-token incremental Merkle tree.</Step>
          </div>
          <Callout title="Six independent circuits" col="ghost">
            Entry · Deposit · Withdraw · Send · Absorb-Send · Absorb-Withdraw. Each enforces different invariants. All proofs are generated client-side — private inputs never leave the browser.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="amber">Groth16</Tag>
            <Tag col="ghost">SnarkJS</Tag>
            <Tag col="ghost">Poseidon2 Merkle</Tag>
            <Tag col="ghost">client-side proof</Tag>
          </div>
        </>}
        diagram={<DepositDiagram />}
      />

      <Div rune="✧" />

      {/* ── 05 Private Withdrawal ──────────────────────────────────── */}
      <Section
        n="05" label="Withdrawal" accent={K.purple} accentCol="purple"
        title="Private withdrawal"
        sub="Prove ownership. Reveal nothing. Take your yield."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            To withdraw, you prove Merkle membership with a ZK proof — without revealing which leaf, which depositor, or any amount.
          </p>
          <div className="space-y-3">
            <Step n={1}>The <span style={{ color: K.purple }}>Withdraw circuit</span> generates a proof of Merkle inclusion: you know a path from your leaf to the current tree root, without exposing the path or leaf index.</Step>
            <Step n={2}>A <code style={{ color: K.purple }}>nullifier</code> — a deterministic hash of spending_key and nonce — is published. The contract verifies it has never appeared before, preventing double-spending.</Step>
            <Step n={3}>Vault shares are burned. <code style={{ color: K.purple }}>ArkanaVault</code> redeems aTokens from Aave, returning the underlying token amount plus all accrued yield.</Step>
            <Step n={4}>Tokens transfer to any recipient address you specify — typically a fresh wallet with no link to your depositing address. The nullifier is permanently marked spent.</Step>
          </div>
          <Callout title="What an observer learns" col="ghost">
            A nullifier (random-looking), a Merkle root (historical — could be any past state), and a recipient address. No amount. No depositor identity. No deposit-withdrawal link.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="purple">Merkle inclusion</Tag>
            <Tag col="ghost">nullifier</Tag>
            <Tag col="ghost">yield included</Tag>
          </div>
        </>}
        diagram={<WithdrawDiagram />}
      />

      <Div rune="◈" />

      {/* ── 06 Send & Absorb ───────────────────────────────────────── */}
      <Section
        n="06" label="P2P Payments" accent={K.cyan} accentCol="cyan" flip
        title="Send & Absorb — private P2P transfers"
        sub="Ephemeral sender key. Pedersen note stack. Unlinkable."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Private transfers use two circuits: <span style={{ color: K.purple }}>Send</span> (sender's side) and <span style={{ color: K.cyan }}>Absorb</span> (recipient's side). Each send emits an ephemeral public key; the recipient scans for notes addressed to them entirely off-chain.
          </p>
          <div className="space-y-3">
            <Step n={1}><span style={{ color: K.purple }}>Alice generates an ephemeral keypair</span> <code style={{ color: K.purple }}>(r, R = r·G)</code> for this transfer only. R is emitted on-chain so Bob can identify the note.</Step>
            <Step n={2}>Alice computes ECDH shared secret <code style={{ color: K.purple }}>S = r · Bob_pk</code> and creates a Pedersen note <code style={{ color: K.purple }}>P = amount·G + S·H</code>. The contract adds P to an on-chain aggregate note stack associated with Bob's zkAddress.</Step>
            <Step n={3}><span style={{ color: K.cyan }}>Bob scans all emitted R values.</span> For each: <code style={{ color: K.cyan }}>Sᵢ = sk_bob · Rᵢ</code>. When decryption succeeds, the note is his. He collects all openings <code style={{ color: K.cyan }}>{"{"}amountᵢ, Sᵢ{"}"}</code> to the aggregate note stack.</Step>
            <Step n={4}>An <span style={{ color: K.cyan }}>Absorb-Send</span> or <span style={{ color: K.cyan }}>Absorb-Withdraw</span> circuit proves Bob knows all openings to the Pedersen aggregate, that the leaf is in the Merkle tree, and nullifies it — either continuing to a new send or redeeming tokens directly.</Step>
          </div>
          <Callout title="ECDH commutativity & note stack" col="ghost">
            <code>r · Bob_pk = sk_bob · R</code> because both equal <code>r · sk_bob · G</code>. Each send adds a Pedersen note to an on-chain aggregate. Bob proves knowledge of all openings to spend from the aggregate — amounts and sender secrets never appear on-chain.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="cyan">ECDH</Tag>
            <Tag col="ghost">Send circuit</Tag>
            <Tag col="ghost">Absorb circuit</Tag>
            <Tag col="ghost">Pedersen stack</Tag>
          </div>
        </>}
        diagram={<SendAbsorbDiagram />}
      />

      <Div rune="✦" />

      {/* ── 07 FROST Threshold Signing ─────────────────────────────── */}
      <Section
        n="07" label="Threshold Signing" accent={K.cyan} accentCol="cyan"
        title="FROST threshold signing & 2FA"
        sub="Any two devices. No server. No seed backup."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            <span style={{ color: K.cyan }}>FROST</span> (Flexible Round-Optimized Schnorr Threshold) lets n participants each hold a key share, with any t able to produce a valid Schnorr signature. No single share is sufficient alone. Arkana uses 2-of-2 FROST as an optional second factor.
          </p>
          <div className="space-y-3">
            <Step n={1}><span style={{ color: K.cyan }}>Device A share s₁</span> is generated locally and stored in IndexedDB. It never leaves your browser session.</Step>
            <Step n={2}><span style={{ color: K.cyan }}>Device B share s₂</span> is derived deterministically from a second wallet signature — on any device you control. It is never stored. Lost the device? Re-derive s₂ from the same wallet. No backup files needed.</Step>
            <Step n={3}>To sign, both devices independently generate per-round nonces and exchange public commitments <code style={{ color: K.cyan }}>Rᵢ = rᵢ·G</code>. The aggregate nonce <code style={{ color: K.cyan }}>R = R₁ + R₂</code> is computed from these public values — no private data shared.</Step>
            <Step n={4}>Each device produces a partial response. FROST aggregation combines them into a final <code style={{ color: K.cyan }}>σ</code> — a valid Schnorr signature indistinguishable from a single-signer signature. Neither device alone can produce it.</Step>
          </div>
          <Callout title="Any second device" col="ghost">
            Device B can be a phone, a second browser session, a hardware key, or any device where you can sign with a wallet. The protocol is device-agnostic.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="cyan">FROST</Tag>
            <Tag col="ghost">2-of-2</Tag>
            <Tag col="ghost">Schnorr</Tag>
            <Tag col="ghost">no backup</Tag>
          </div>
        </>}
        diagram={<FrostThresholdDiagram />}
      />

      <Div />

      {/* ── 08 FROST Multisig ──────────────────────────────────────── */}
      <Section
        n="08" label="Multisig" accent={K.amber} accentCol="amber" flip
        title="FROST Multisig — shared accounts"
        sub="t-of-n threshold. No on-chain multisig contract. Indistinguishable from a single wallet."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            FROST scales naturally to <span style={{ color: K.amber }}>t-of-n</span> shared accounts — for DAOs, teams, or protocol treasuries. The 2FA mode above is just the 2-of-2 special case of the same protocol.
          </p>
          <div className="space-y-3">
            <Step n={1}><span style={{ color: K.amber }}>Distributed Key Generation (DKG):</span> n participants collaboratively derive a shared Arkana zkAddress. Each receives a private share — no single party ever holds the full key.</Step>
            <Step n={2}>Any subset of t or more participants can initiate a signing round. They exchange nonce commitments (public values only), aggregate to R, and each produces a partial Schnorr response.</Step>
            <Step n={3}>Partial signatures aggregate into one standard Schnorr signature — valid against the shared public key, indistinguishable from a single-signer transaction. An on-chain observer cannot tell whether one person or a 7-of-12 multisig signed.</Step>
            <Step n={4}>Unlike smart-contract multisigs, there is no on-chain signature collection, no multi-step flow, and no additional gas cost. The full Arkana ZK privacy model applies to the shared account identically to a single-user account.</Step>
          </div>
          <Callout title="2FA as a special case" col="ghost">
            Setting t = n = 2 and deriving one share from a second wallet gives the 2FA mode described above. The same signing protocol runs in both cases.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="amber">FROST</Tag>
            <Tag col="ghost">t-of-n</Tag>
            <Tag col="ghost">DKG</Tag>
            <Tag col="ghost">no multisig contract</Tag>
          </div>
        </>}
        diagram={<FrostMultisigDiagram />}
      />

      <Div rune="✧" />

      {/* ── 09 Nonce Discovery ─────────────────────────────────────── */}
      <Section
        n="09" label="State Recovery" accent={K.cyan} accentCol="cyan"
        title="Nonce discovery — recovering your state"
        sub="All off-chain. No server. Pure deterministic arithmetic."
        text={<>
          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
            Arkana has no backend database. Your positions live in the public Merkle tree as opaque leaves. The frontend recovers your state by running a local scan using only your <span style={{ color: K.cyan }}>user_key</span>.
          </p>
          <div className="space-y-3">
            <Step n={1}>Start at <code style={{ color: K.cyan }}>nonce = 0</code>. For each (token, nonce) pair, compute <code style={{ color: K.cyan }}>view_key</code> from user_key, then <code style={{ color: K.cyan }}>nonce_commit</code> = H(view_key, nonce, token).</Step>
            <Step n={2}>Derive the Merkle leaf that would exist if you had a position at that nonce. Query the public on-chain tree — O(log n) Merkle proof check.</Step>
            <Step n={3}>If the leaf is found, record the note (share count, nonce) and increment nonce. If not found, the scan terminates.</Step>
            <Step n={4}>All positions are recovered — balance in shares, full nonce history — without contacting any server. The entire state is reconstructible from your wallet and the public Merkle tree alone.</Step>
          </div>
          <Callout title="View key & state recovery" col="ghost">
            The leaf derivation is pure Poseidon hashing. Any party who knows user_key — used here as a view key — can run the same scan and read your full history. Without it, the leaves are indistinguishable from random field elements.
          </Callout>
          <div className="flex flex-wrap gap-2">
            <Tag col="cyan">Poseidon2</Tag>
            <Tag col="ghost">Merkle scan</Tag>
            <Tag col="ghost">serverless</Tag>
            <Tag col="ghost">deterministic</Tag>
          </div>
        </>}
        diagram={<NonceDiscoveryDiagram />}
      />

      {/* footer */}
      <div className="border-t border-border/15 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(255,255,255,0.12))" }} />
            <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 13 }}>◈</span>
            <div className="w-12 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(255,255,255,0.12))" }} />
          </div>
          <p className="font-mono text-sm" style={{ color: "rgba(160,155,180,0.4)" }}>
            All proofs generated in-browser via SnarkJS · Groth16 · Poseidon2 Merkle trees<br />
            Private keys never touch a server · Balances are opaque field elements on-chain
          </p>
          <p className="font-mono text-xs tracking-widest uppercase" style={{ color: "rgba(160,155,180,0.2)" }}>
            EthGlobal MoneyHack2026 · Proof-of-concept · Not audited
          </p>
          <p className="font-mono text-xs" style={{ color: "rgba(160,155,180,0.25)" }}>
            Trusted ceremony registry available at{" "}
            <a href="" className="underline underline-offset-2 hover:opacity-60 transition-opacity" style={{ color: "rgba(160,155,180,0.35)" }}>
              →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
