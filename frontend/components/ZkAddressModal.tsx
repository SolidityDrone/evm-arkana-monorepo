'use client';

import { useZkAddress, useAccount } from '@/context/AccountProvider';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Key } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { computePrivateKeyFromSignature, getViewKeyFromUserKey } from '@/lib/circuit-utils';

interface ZkAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ZkAddressModal({ isOpen, onClose }: ZkAddressModalProps) {
    const zkAddress = useZkAddress();
    const { account } = useAccount();
    const [copied, setCopied] = useState(false);
    const [viewingKeyRevealed, setViewingKeyRevealed] = useState(false);
    const [viewingKey, setViewingKey] = useState<string | null>(null);
    const [isComputing, setIsComputing] = useState(false);
    const [viewingKeyCopied, setViewingKeyCopied] = useState(false);

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

    const handleExportViewingKey = async () => {
        if (!account?.signature || viewingKeyRevealed) {
            setViewingKeyRevealed(!viewingKeyRevealed);
            return;
        }

        setIsComputing(true);
        try {
            // Compute private key from signature
            const privateKeyHex = await computePrivateKeyFromSignature(account.signature);
            const privateKeyBigInt = BigInt(privateKeyHex);
            
            // Compute viewing key
            const viewKeyBigInt = await getViewKeyFromUserKey(privateKeyBigInt);
            const viewKeyHex = '0x' + viewKeyBigInt.toString(16);
            
            setViewingKey(viewKeyHex);
            setViewingKeyRevealed(true);
        } catch (error) {
            console.error('Failed to compute viewing key:', error);
        } finally {
            setIsComputing(false);
        }
    };

    const handleCopyViewingKey = async () => {
        if (!viewingKey) return;
        try {
            await navigator.clipboard.writeText(viewingKey);
            setViewingKeyCopied(true);
            setTimeout(() => setViewingKeyCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy viewing key:', error);
        }
    };

    if (!zkAddress) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm w-auto mx-auto bg-card/95 backdrop-blur-md border-primary/30">
                <DialogHeader>
                    <DialogTitle className="font-sans text-xl uppercase tracking-wider text-center">
                        ZK Address
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* QR Code */}
                    <div className="flex justify-center">
                        <div className="p-3 bg-white rounded-lg">
                            <QRCodeSVG
                                value={zkAddress}
                                size={180}
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
                                <p className="flex-1 font-mono text-xs text-foreground break-all">
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

                    {/* Export Viewing Key Button */}
                    <Button
                        onClick={handleExportViewingKey}
                        disabled={isComputing}
                        variant="outline"
                        className="w-full font-mono text-sm uppercase tracking-wider border-primary/50 hover:bg-primary/10 hover:border-primary"
                    >
                        <Key className="w-4 h-4 mr-2" />
                        {isComputing ? 'Computing...' : viewingKeyRevealed ? 'Hide Viewing Key' : 'Export Viewing Key'}
                    </Button>

                    {/* Viewing Key Display */}
                    {viewingKeyRevealed && viewingKey && (
                        <Card className="bg-card/60 border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                                    Viewing Key
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <p className="flex-1 font-mono text-xs text-foreground break-all">
                                        {viewingKey}
                                    </p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyViewingKey}
                                        className="h-8 w-8 p-0 flex-shrink-0"
                                    >
                                        {viewingKeyCopied ? (
                                            <Check className="w-4 h-4 text-primary" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

