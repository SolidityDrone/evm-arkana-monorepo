'use client';

import { useZkAddress } from '@/context/AccountProvider';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ZkAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ZkAddressModal({ isOpen, onClose }: ZkAddressModalProps) {
    const zkAddress = useZkAddress();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!zkAddress) return;
        try {
            await navigator.clipboard.writeText(zkAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    if (!zkAddress) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card/95 backdrop-blur-md border-primary/30">
                <DialogHeader>
                    <DialogTitle className="font-sans text-xl uppercase tracking-wider text-center">
                        ZK Address
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                        <div className="p-4 bg-white rounded-lg">
                            <QRCodeSVG
                                value={zkAddress}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    </div>

                    {/* ZK Address */}
                    <Card className="bg-card/60 border-primary/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                                Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <p className="flex-1 font-mono text-sm text-foreground break-all">
                                    {zkAddress}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-8 w-8 p-0 flex-shrink-0"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-primary" />
                                    ) : (
                                        <Copy className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

