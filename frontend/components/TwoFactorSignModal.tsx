'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';
import { encodeFrostPayload, type SigningRequestPayload } from '@/lib/frost-2fa';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the phone partial signature response when user submits. */
  onSubmit: (phoneResponse: string) => void;
  /** Signing round 1 data (message, desktopNonce, groupPublicKey) */
  signingRequest?: SigningRequestPayload | null;
  /** Operation description shown to the user. */
  operationLabel?: string;
  isSigning?: boolean;
  error?: string | null;
}

export function TwoFactorSignModal({
  open,
  onOpenChange,
  onSubmit,
  signingRequest,
  operationLabel = 'transaction',
  isSigning = false,
  error = null,
}: Props) {
  const [phoneResponse, setPhoneResponse] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  const signingUrl = React.useMemo(() => {
    if (!signingRequest) return '';
    const encoded = encodeFrostPayload(signingRequest);
    return `${window.location.origin}/2fa/device?sign=${encodeURIComponent(encoded)}`;
  }, [signingRequest]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(signingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const handleSubmit = () => {
    const trimmed = phoneResponse.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && phoneResponse.trim() && !isSigning) {
      handleSubmit();
    }
  };

  React.useEffect(() => {
    if (!open) {
      setPhoneResponse('');
      setCopied(false);
    }
  }, [open]);

  if (!signingRequest) {
    return null; // Don't show modal if no signing request
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isSigning) onOpenChange(v); }}>
      <DialogContent
        className="max-w-md w-[90vw] sm:w-[420px] bg-card/95 backdrop-blur-sm border-primary/30 mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="pb-2">
          <DialogTitle
            className="text-center text-sm sm:text-base font-sans tracking-wider uppercase flex items-center justify-center gap-2"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
          >
            <Shield className="w-4 h-4" />
            2FA Authorization
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground text-center mb-4">
          Open this link on your second device to generate a partial signature for this {operationLabel}.
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Smartphone className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-200/80">
              Your phone will generate a partial signature using its share.
              <strong className="text-blue-300"> Your share never leaves your phone.</strong>
            </p>
          </div>

          <div className="relative">
            <div className="p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs break-all max-h-32 overflow-y-auto select-all">
              {signingUrl}
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
              onClick={() => window.open(signingUrl, '_blank')}
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
              After your phone generates the partial signature, paste the response here:
            </p>
            <textarea
              value={phoneResponse}
              onChange={(e) => setPhoneResponse(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ARKANA-FROST-v1:..."
              rows={3}
              disabled={isSigning}
              className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />

            {error && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 mt-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSigning}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!phoneResponse.trim() || isSigning}
          >
            {isSigning ? 'Signing...' : 'Complete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
