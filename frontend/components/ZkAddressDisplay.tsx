"use client"

interface ZkAddressDisplayProps {
    zkAddress: string
    variant?: "desktop" | "mobile"
}

export default function ZkAddressDisplay({ zkAddress, variant = "desktop" }: ZkAddressDisplayProps) {
    // Truncate zkAddress: show first 6 chars after "zk" and last 4 chars
    const truncateAddress = (address: string) => {
        if (!address) return ""
        const withoutPrefix = address.startsWith("zk") ? address.slice(2) : address
        if (withoutPrefix.length <= 10) return address
        return `zk${withoutPrefix.slice(0, 6)}...${withoutPrefix.slice(-4)}`
    }

    const truncated = truncateAddress(zkAddress)

    if (variant === "mobile") {
        return (
            <div className="w-full">
                <div className="px-3 py-2 bg-muted/30 border border-primary/20 rounded-md">
                    <p className="text-xs font-mono text-muted-foreground mb-1">ZK Address</p>
                    <p className="text-sm font-mono text-foreground break-all">{zkAddress}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="px-3 py-1.5 bg-muted/30 border border-primary/20 rounded-md">
            <span className="text-xs font-mono text-foreground">{truncated}</span>
        </div>
    )
}

