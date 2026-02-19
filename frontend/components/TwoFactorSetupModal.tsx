'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Copy, Check, Smartphone, Key, QrCode, ExternalLink } from 'lucide-react';
import {
  dkgDesktopRound1,
  dkgDesktopRound2,
  encodeFrostPayload,
  decodeFrostPayload,
  type DKGDesktopPayload,
  type DKGPhonePayload,
} from '@/lib/frost-2fa';

export type SecurityMode = 'single' | '2fa';

export interface TwoFactorSetupResult_UI {
  mode: SecurityMode;
  signerPubkeyHash?: string;
  signerPublicKey?: [string, string];
  desktopScalarShare?: string; // s1 - store this! (was browserShare)
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (result: TwoFactorSetupResult_UI) => void;
}

type Step = 'choose' | 'generating' | 'waiting_phone' | 'complete';

export function TwoFactorSetupModal({ open, onOpenChange, onComplete }: Props) {
  const [step, setStep] = React.useState<Step>('choose');
  const [desktopShare, setDesktopShare] = React.useState<string | null>(null);
  const [desktopPublicKey, setDesktopPublicKey] = React.useState<[string, string] | null>(null);
  const [dkgUrl, setDkgUrl] = React.useState<string>('');
  const [copied, setCopied] = React.useState(false);
  const [phoneResponse, setPhoneResponse] = React.useState<string>('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reset = () => {
    setStep('choose');
    setDesktopShare(null);
    setDesktopPublicKey(null);
    setDkgUrl('');
    setCopied(false);
    setPhoneResponse('');
    setIsGenerating(false);
    setError(null);
  };

  const handleSelectSingle = () => {
    onComplete({ mode: 'single' });
    reset();
  };

  const handleSelect2FA = async () => {
    setStep('generating');
    setIsGenerating(true);
    setError(null);
    try {
      // Desktop generates its share
      const { desktopScalarShare, desktopPublicKey: A1 } = await dkgDesktopRound1();
      setDesktopShare(desktopScalarShare);
      setDesktopPublicKey(A1);

      // Create DKG URL for phone to join
      const payload: DKGDesktopPayload = {
        type: 'dkg-desktop',
        desktopPublicKey: A1,
      };
      const encoded = encodeFrostPayload(payload);
      const url = `${window.location.origin}/2fa/device?dkg=${encodeURIComponent(encoded)}`;
      setDkgUrl(url);
      setStep('waiting_phone');
    } catch (err: any) {
      console.error('Failed to generate 2FA keys:', err);
      setError(err?.message || 'Failed to generate 2FA setup');
      setStep('choose');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(dkgUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePhoneResponse = async () => {
    if (!phoneResponse.trim() || !desktopPublicKey || !desktopShare) return;

    setError(null);
    setIsGenerating(true);
    try {
      const decoded = decodeFrostPayload(phoneResponse.trim());
      if (!decoded || decoded.type !== 'dkg-phone') {
        setError('Invalid response from phone. Expected DKG phone payload.');
        return;
      }

      const phonePayload = decoded as DKGPhonePayload;
      const dkgResult = await dkgDesktopRound2(desktopPublicKey, phonePayload.phonePublicKey);

      onComplete({
        mode: '2fa',
        signerPubkeyHash: dkgResult.signerPubkeyHash,
        signerPublicKey: dkgResult.groupPublicKey,
        desktopScalarShare: desktopShare,
      });
      reset();
    } catch (err: any) {
      console.error('Failed to complete DKG:', err);
      setError(err?.message || 'Failed to complete 2FA setup');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent
        className="max-w-md w-[90vw] sm:w-[440px] bg-card/95 backdrop-blur-sm border-primary/30 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Step 1: Choose mode ──────────────────────────────── */}
        {step === 'choose' && (
          <>
            <DialogHeader className="pb-2">
              <DialogTitle
                className="text-center text-sm sm:text-base font-sans tracking-wider uppercase"
                style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
              >
                Security Mode
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Choose how to secure your signing key for this account.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSelectSingle}
                className="w-full p-4 rounded-xl border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <div className="font-medium text-sm">Single Key</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Standard mode. Signing key derived from your wallet signature.
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleSelect2FA}
                className="w-full p-4 rounded-xl border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div>
                    <div className="font-medium text-sm">2FA (2-of-2)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Split signing key between this browser and a second device.
                      Both devices generate their own shares independently.
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}

        {/* ── Generating ───────────────────────────────────────── */}
        {step === 'generating' && (
          <div className="py-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Generating your 2FA share...</p>
          </div>
        )}

        {/* ── Step 2: Show DKG URL ─────────────────────────────── */}
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
                  Open this link on your second device (phone). Your phone will generate its own share independently.
                  <strong className="text-blue-300"> Neither device sees the other&apos;s share.</strong>
                </p>
              </div>

              <div className="relative">
                <div className="p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs break-all max-h-32 overflow-y-auto select-all">
                  {dkgUrl}
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy URL
                </Button>
                <Button
                  onClick={() => window.open(dkgUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Open
                </Button>
              </div>

              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-2">
                  After your phone generates its share, paste the response here:
                </p>
                <textarea
                  value={phoneResponse}
                  onChange={(e) => setPhoneResponse(e.target.value)}
                  placeholder="ARKANA-FROST-v1:..."
                  rows={3}
                  className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
                />
                {error && (
                  <p className="text-xs text-red-400 mt-2">{error}</p>
                )}
                <Button
                  onClick={handlePhoneResponse}
                  disabled={!phoneResponse.trim() || isGenerating}
                  className="w-full mt-2"
                  size="sm"
                >
                  {isGenerating ? 'Completing...' : 'Complete Setup'}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" size="sm" onClick={() => { reset(); }}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
