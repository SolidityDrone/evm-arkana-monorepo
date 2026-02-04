'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface ZkAddressDisplayProps {
    zkAddress: string;
    variant?: 'desktop' | 'mobile';
}

export default function ZkAddressDisplay({ zkAddress, variant = 'desktop' }: ZkAddressDisplayProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(zkAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy zk address:', error);
        }
    };

    const displayAddress = variant === 'desktop'
        ? `${zkAddress.slice(0, 6)}...${zkAddress.slice(-4)}`
        : `${zkAddress.slice(0, 8)}...${zkAddress.slice(-6)}`;

    return (
        <>
            <button
                onClick={() => setShowDialog(true)}
                className="flex items-center space-x-2 px-3 py-1.5 border border-primary/30 bg-primary/10 backdrop-blur-sm rounded-sm hover:bg-primary/20 transition-colors cursor-pointer"
            >
                <span className="text-sm font-mono text-foreground/90">
                    {displayAddress}
                </span>
            </button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-center font-mono uppercase tracking-wider">
                            Your ZK Address
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-4 py-4">
                        {/* QR Code */}
                        <div className="p-4 bg-white rounded-lg border border-primary/30">
                            <QRCodeSVG
                                value={zkAddress}
                                size={200}
                                level="M"
                                includeMargin={false}
                            />
                        </div>

                        {/* Full Address */}
                        <div className="w-full px-4 py-2 bg-background/50 border border-primary/20 rounded-sm">
                            <p className="text-xs font-mono text-foreground/70 text-center break-all">
                                {zkAddress}
                            </p>
                        </div>

                        {/* Copy Button */}
                        <Button
                            onClick={handleCopy}
                            variant="default"
                            className="w-full font-mono uppercase tracking-wider"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Address
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

