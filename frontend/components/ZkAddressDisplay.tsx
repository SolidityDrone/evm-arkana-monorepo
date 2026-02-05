"use client"

interface ZkAddressDisplayProps {
    zkAddress: string
    variant?: "desktop" | "mobile"
    onClick?: () => void
}

export default function ZkAddressDisplay({ zkAddress, variant = "desktop", onClick }: ZkAddressDisplayProps) {
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
                <div 
                    className={`px-3 py-2 bg-muted/30 border border-primary/20 rounded-md ${onClick ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/40 transition-all duration-200' : ''}`}
                    onClick={onClick}
                >
                    <p className="text-xs font-mono text-muted-foreground mb-1">ZK Address</p>
                    <p className="text-sm font-mono text-foreground break-all">{zkAddress}</p>
                </div>
            </div>
        )
    }

    return (
        <div 
            className={`px-3 py-1.5 bg-muted/30 border border-primary/20 rounded-md ${onClick ? 'cursor-pointer hover:bg-muted/50 hover:border-primary/40 transition-all duration-200' : ''}`}
            onClick={onClick}
        >
            <span className="text-xs font-mono text-foreground">{truncated}</span>
        </div>
    )
}

