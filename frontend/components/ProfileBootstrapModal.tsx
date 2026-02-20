'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Key, Smartphone, Copy, Check, ExternalLink } from 'lucide-react';
import {
    dkgDesktopRound1,
    dkgDesktopRound2,
    encodeFrostPayload,
    decodeFrostPayload,
    type DKGDesktopPayload,
    type DKGPhonePayload,
} from '@/lib/frost-2fa';
import type { TwoFactorData } from '@/lib/indexeddb';

export interface ProfileSetupResult {
    type: 'single' | '2fa';
    twoFactorData?: TwoFactorData;
}

interface Props {
    open: boolean;
    onComplete: (result: ProfileSetupResult) => Promise<void> | void;
}

type Step = 'choose' | 'generating' | 'waiting_phone';

/**
 * Non-dismissable modal shown on first connect (no profile in IndexedDB).
 * The user must choose Single Key or 2FA before they can use the app.
 */
export function ProfileBootstrapModal({ open, onComplete }: Props) {
    const [step, setStep] = React.useState<Step>('choose');
    const [desktopShare, setDesktopShare] = React.useState<string | null>(null);
    const [desktopPublicKey, setDesktopPublicKey] = React.useState<[string, string] | null>(null);
    const [dkgUrl, setDkgUrl] = React.useState<string>('');
    const [copied, setCopied] = React.useState(false);
    const [phoneResponse, setPhoneResponse] = React.useState<string>('');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSelectSingle = async () => {
        setIsProcessing(true);
        try {
            await onComplete({ type: 'single' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSelect2FA = async () => {
        setStep('generating');
        setIsProcessing(true);
        setError(null);
        try {
            const { desktopScalarShare, desktopPublicKey: A1 } = await dkgDesktopRound1();
            setDesktopShare(desktopScalarShare);
            setDesktopPublicKey(A1);

            const payload: DKGDesktopPayload = {
                type: 'dkg-desktop',
                desktopPublicKey: A1,
            };
            const encoded = encodeFrostPayload(payload);
            const url = `${window.location.origin}/2fa/device?dkg=${encodeURIComponent(encoded)}`;
            setDkgUrl(url);
            setStep('waiting_phone');
        } catch (err: any) {
            setError(err?.message || 'Failed to generate 2FA setup');
            setStep('choose');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(dkgUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    const handlePhoneResponse = async () => {
        if (!phoneResponse.trim() || !desktopPublicKey || !desktopShare) return;

        setError(null);
        setIsProcessing(true);
        try {
            const decoded = decodeFrostPayload(phoneResponse.trim());
            if (!decoded || decoded.type !== 'dkg-phone') {
                setError('Invalid response from phone. Expected DKG phone payload.');
                return;
            }

            const phonePayload = decoded as DKGPhonePayload;
            const dkgResult = await dkgDesktopRound2(desktopPublicKey, phonePayload.phonePublicKey);

            const twoFactorData: TwoFactorData = {
                is2FA: true,
                browserShare: desktopShare,
                signerPublicKey: dkgResult.groupPublicKey,
                signerPubkeyHash: dkgResult.signerPubkeyHash,
            };

            await onComplete({ type: '2fa', twoFactorData });
        } catch (err: any) {
            setError(err?.message || 'Failed to complete 2FA setup');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={() => { /* non-dismissable */ }}
            onPointerDownOutside={() => { /* block backdrop close */ }}
        >
            <DialogContent className="max-w-md w-[90vw] sm:w-[440px]">
                {/* ── Choose profile ─────────────────────────────── */}
                {step === 'choose' && (
                    <>
                        <DialogHeader className="pb-2">
                            <DialogTitle
                                className="text-center text-sm sm:text-base font-sans tracking-wider uppercase"
                                style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
                            >
                                Welcome to Arkana
                            </DialogTitle>
                        </DialogHeader>

                        <p className="text-xs text-muted-foreground text-center mb-5">
                            Before you begin, choose how to secure your account.
                            This is your main profile — you can only set it once.
                        </p>

                        {error && (
                            <p className="text-xs text-red-400 text-center mb-3">{error}</p>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={handleSelectSingle}
                                disabled={isProcessing}
                                className="w-full p-4 rounded-xl border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3">
                                    <Key className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                    <div>
                                        <div className="font-medium text-sm">Single Key</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Signing key derived directly from your wallet signature. Simple and fast.
                                        </div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={handleSelect2FA}
                                disabled={isProcessing}
                                className="w-full p-4 rounded-xl border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                    <div>
                                        <div className="font-medium text-sm">2FA (2-of-2)</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            Split signing key between this device and a second device (phone).
                                            Both are required to sign — maximum security.
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* ── Generating desktop share ────────────────────── */}
                {step === 'generating' && (
                    <div className="py-10 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">Generating your 2FA share…</p>
                    </div>
                )}

                {/* ── Waiting for phone ───────────────────────────── */}
                {step === 'waiting_phone' && dkgUrl && (
                    <>
                        <DialogHeader className="pb-2">
                            <DialogTitle
                                className="text-center text-sm sm:text-base font-sans tracking-wider uppercase"
                                style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
                            >
                                Join with Your Phone
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Smartphone className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-blue-200/80">
                                    Open this link on your second device. It will generate its own share
                                    independently.{' '}
                                    <strong className="text-blue-300">
                                        Neither device sees the other&apos;s share.
                                    </strong>
                                </p>
                            </div>

                            <div className="relative">
                                <div className="p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs break-all max-h-28 overflow-y-auto select-all">
                                    {dkgUrl}
                                </div>
                                <button
                                    onClick={handleCopyUrl}
                                    className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors"
                                    title="Copy URL"
                                >
                                    {copied
                                        ? <Check className="w-3.5 h-3.5 text-green-400" />
                                        : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleCopyUrl} variant="outline" size="sm" className="flex-1">
                                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy URL
                                </Button>
                                <Button
                                    onClick={() => window.open(dkgUrl, '_blank')}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open
                                </Button>
                            </div>

                            <div className="pt-2 border-t border-border/30">
                                <p className="text-xs text-muted-foreground mb-2">
                                    After your phone generates its share, paste the response here:
                                </p>
                                <textarea
                                    value={phoneResponse}
                                    onChange={(e) => setPhoneResponse(e.target.value)}
                                    placeholder="ARKANA-FROST-v1:…"
                                    rows={3}
                                    className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
                                />
                                {error && (
                                    <p className="text-xs text-red-400 mt-2">{error}</p>
                                )}
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => {
                                            setStep('choose');
                                            setPhoneResponse('');
                                            setError(null);
                                        }}
                                        disabled={isProcessing}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handlePhoneResponse}
                                        disabled={!phoneResponse.trim() || isProcessing}
                                        size="sm"
                                        className="flex-1"
                                    >
                                        {isProcessing ? 'Completing…' : 'Complete Setup'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
