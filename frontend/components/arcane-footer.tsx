"use client"

import { PixelLogo } from "./pixel-logo"

export function ArcaneFooter() {
    const links = {
        protocol: [
            { label: "Documentation", href: "#" },
            { label: "Whitepaper", href: "#" },
            { label: "Audit Reports", href: "#" },
            { label: "GitHub", href: "#" },
        ],
        community: [
            { label: "Discord", href: "#" },
            { label: "Twitter", href: "#" },
            { label: "Telegram", href: "#" },
            { label: "Forum", href: "#" },
        ],
        resources: [
            { label: "Blog", href: "#" },
            { label: "FAQ", href: "#" },
            { label: "Brand Kit", href: "#" },
            { label: "Bug Bounty", href: "#" },
        ],
    }

    return (
        <footer className="relative border-t border-border/30 bg-card/30">
            {/* Subtle top gradient */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                    background: "linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)"
                }}
            />
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <PixelLogo className="w-7 h-7 text-primary/80" />
                            <span className="font-sans text-[9px] text-foreground/80 tracking-widest">
                                ARKANA
                            </span>
                        </div>
                        <p className="font-mono text-sm text-muted-foreground/70 mb-6 leading-relaxed">
                            Privacy is not a crime.<br />
                            Sovereignty is not a sin.
                        </p>
                        <div className="flex gap-3">
                            {/* Social icons */}
                            {["X", "D", "T", "G"].map((letter, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="w-8 h-8 border border-border/50 flex items-center justify-center text-muted-foreground/60 hover:text-primary/80 hover:border-primary/40 transition-all duration-300"
                                >
                                    <span className="font-mono text-xs">{letter}</span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Protocol links */}
                    <div>
                        <h4 className="font-mono text-[10px] text-foreground/70 tracking-wider mb-4 uppercase">Protocol</h4>
                        <ul className="space-y-2.5">
                            {links.protocol.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="font-mono text-sm text-muted-foreground/60 hover:text-foreground/80 transition-colors duration-300"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community links */}
                    <div>
                        <h4 className="font-mono text-[10px] text-foreground/70 tracking-wider mb-4 uppercase">Community</h4>
                        <ul className="space-y-2.5">
                            {links.community.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="font-mono text-sm text-muted-foreground/60 hover:text-foreground/80 transition-colors duration-300"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources links */}
                    <div>
                        <h4 className="font-mono text-[10px] text-foreground/70 tracking-wider mb-4 uppercase">Resources</h4>
                        <ul className="space-y-2.5">
                            {links.resources.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="font-mono text-sm text-muted-foreground/60 hover:text-foreground/80 transition-colors duration-300"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="font-mono text-xs text-muted-foreground/50">
                        2026 ARKANA PROTOCOL
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="font-mono text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-300">
                            Privacy Policy
                        </a>
                        <a href="#" className="font-mono text-xs text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-300">
                            Terms of Service
                        </a>
                    </div>
                </div>

                {/* Decorative sigil */}
                <div className="text-center mt-10">
                    <span className="text-xl text-primary/15">⁂</span>
                </div>
            </div>
        </footer>
    )
}

