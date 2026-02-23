'use client';

/**
 * MultisigSignModal — coordinate m-of-n signing for a withdrawal.
 *
 * The coordinator (who wants to withdraw) broadcasts a SigningRequestPayload to other signers.
 * Each signer decodes the request, verifies the parameters, and returns a ShareResponsePayload
 * containing their Shamir share value. The coordinator collects threshold-1 responses
 * (they already have their own share), reconstructs the signing key, and proceeds.
 */
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Plus, Trash2, Key, X, Link2 } from 'lucide-react';
import {
  encodeMsigPayload,
  decodeMsigPayload,
  shamirCombine,
  type SigningRequestPayload,
  type ShareResponsePayload,
  type ShamirShare,
} from '@/lib/frost-multisig';
import type { MultisigProfileData } from '@/lib/indexeddb';

interface CollectedShare {
  signerIndex: number;
  share: string; // hex
  pastedPayload: string;
}

interface Props {
  open: boolean;
  profile: MultisigProfileData;
  /** The signing request details — shown to user and encoded in the QR/URL */
  request: SigningRequestPayload;
  /** Called when enough shares are collected; provides the reconstructed signing key */
  onSigningKeyReady: (signingKey: bigint) => Promise<void>;
  onCancel: () => void;
}

export function MultisigSignModal({ open, profile, request, onSigningKeyReady, onCancel }: Props) {
  const [requestPayload] = React.useState(() => encodeMsigPayload(request));
  const [copiedRequest, setCopiedRequest] = React.useState(false);
  const [copiedUrl, setCopiedUrl] = React.useState(false);
  const [collectedShares, setCollectedShares] = React.useState<CollectedShare[]>([]);
  const [currentInput, setCurrentInput] = React.useState('');
  const [inputError, setInputError] = React.useState<string | null>(null);
  const [isCombining, setIsCombining] = React.useState(false);
  const [combineError, setCombineError] = React.useState<string | null>(null);

  // My own share (coordinator's share, index = profile.myIndex)
  const myShare: ShamirShare = { index: profile.myIndex, share: profile.myShare };

  // How many more shares we need (threshold includes my own share)
  const needed = profile.threshold - 1;
  const collected = collectedShares.length;
  const canCombine = collected >= needed;

  const handleCopyRequest = async () => {
    try {
      await navigator.clipboard.writeText(requestPayload);
      setCopiedRequest(true);
      setTimeout(() => setCopiedRequest(false), 2000);
    } catch { /* ignore */ }
  };

  const handleCopyRequestUrl = async () => {
    try {
      const url = `${window.location.origin}/multisig/sign?request=${encodeURIComponent(requestPayload)}`;
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch { /* ignore */ }
  };

  const handleAddShare = () => {
    setInputError(null);
    // Accept either raw ARKANA-MSIG-v1:… payload or a URL containing ?response=…
    let rawInput = currentInput.trim();
    try {
      const url = new URL(rawInput);
      const responseParam = url.searchParams.get('response');
      if (responseParam) rawInput = decodeURIComponent(responseParam);
    } catch { /* not a URL, use as-is */ }

    const decoded = decodeMsigPayload(rawInput);
    if (!decoded || decoded.type !== 'msig-share-response') {
      setInputError('Invalid response. Expected ARKANA-MSIG-v1:… payload or a response URL from a signer.');
      return;
    }
    const resp = decoded as ShareResponsePayload;
    if (resp.profileId !== profile.profileId) {
      setInputError('This response is for a different multisig group.');
      return;
    }
    if (resp.signerIndex === profile.myIndex) {
      setInputError('This is your own share — it is already included automatically.');
      return;
    }
    if (collectedShares.some(s => s.signerIndex === resp.signerIndex)) {
      setInputError(`Already have a response from Signer #${resp.signerIndex}.`);
      return;
    }
    setCollectedShares(prev => [
      ...prev,
      { signerIndex: resp.signerIndex, share: resp.share, pastedPayload: currentInput.trim() },
    ]);
    setCurrentInput('');
  };

  const handleRemoveShare = (signerIndex: number) => {
    setCollectedShares(prev => prev.filter(s => s.signerIndex !== signerIndex));
  };

  const handleCombineAndSign = async () => {
    setIsCombining(true);
    setCombineError(null);
    try {
      // Combine my share + collected shares
      const allShares: ShamirShare[] = [
        myShare,
        ...collectedShares.map(s => ({ index: s.signerIndex, share: s.share })),
      ];
      if (allShares.length < profile.threshold) {
        throw new Error(`Need ${profile.threshold} shares, only have ${allShares.length}`);
      }
      const signingKey = shamirCombine(allShares);
      await onSigningKeyReady(signingKey);
    } catch (err: any) {
      setCombineError(err?.message || 'Failed to combine shares or sign');
    } finally {
      setIsCombining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-[500px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 rounded-lg p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all z-10"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm font-sans tracking-wider uppercase text-center"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
            {profile.threshold}-of-{profile.maxSigners} Multisig Signing
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground mb-4">
          Share the signing request with <strong>{needed}</strong> other signer{needed !== 1 ? 's' : ''} from{' '}
          <strong>{profile.name}</strong>. Collect their responses, then submit.
        </p>

        {/* Request summary */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 space-y-1.5 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Withdrawal Details</p>
          <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
            <span className="text-white/40">Token</span>
            <span className="font-mono text-white/70 truncate">{request.tokenAddress.slice(0, 10)}…</span>
            <span className="text-white/40">Amount</span>
            <span className="font-mono text-white/70">{request.amount}</span>
            <span className="text-white/40">Fee</span>
            <span className="font-mono text-white/70">{request.fee}</span>
            <span className="text-white/40">Nonce</span>
            <span className="font-mono text-white/70">{request.nonce}</span>
            {request.receiver && request.receiver !== '0' && (
              <>
                <span className="text-white/40">Receiver</span>
                <span className="font-mono text-white/70 truncate">{request.receiver.slice(0, 10)}…</span>
              </>
            )}
          </div>
        </div>

        {/* Signing request payload to share */}
        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground">Share this request with other signers:</p>
          <div className="relative">
            <div className="p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-[10px] break-all max-h-20 overflow-y-auto select-all text-white/60">
              {requestPayload}
            </div>
            <button
              onClick={handleCopyRequest}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors"
            >
              {copiedRequest
                ? <Check className="w-3.5 h-3.5 text-green-400" />
                : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyRequest}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              {copiedRequest ? 'Copied!' : 'Copy Payload'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-violet-200"
              onClick={handleCopyRequestUrl}
            >
              <Link2 className="w-3.5 h-3.5 mr-1.5" />
              {copiedUrl ? 'URL Copied!' : 'Copy Sign URL'}
            </Button>
          </div>
        </div>

        {/* Collected shares */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Collected responses: <span className="text-white/70 font-mono">{collected}/{needed}</span>
              {' '}(+ yours)
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              canCombine ? 'bg-green-500/20 text-green-300' : 'bg-white/[0.06] text-white/40'
            }`}>
              {canCombine ? 'Ready' : `Need ${needed - collected} more`}
            </span>
          </div>

          {/* My own share (always present) */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <Key className="w-3 h-3 text-violet-400/60 shrink-0" />
            <span className="text-xs text-white/60 flex-1">Signer #{profile.myIndex} (you)</span>
            <Check className="w-3.5 h-3.5 text-green-400" />
          </div>

          {collectedShares.map(s => (
            <div key={s.signerIndex} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Key className="w-3 h-3 text-sky-400/60 shrink-0" />
              <span className="text-xs text-white/60 flex-1">Signer #{s.signerIndex}</span>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <button onClick={() => handleRemoveShare(s.signerIndex)} className="text-white/20 hover:text-red-400 transition-colors ml-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Paste signer response */}
        {!canCombine && (
          <div className="space-y-2 mb-4">
            <p className="text-xs text-muted-foreground">Paste a signer response:</p>
            <textarea
              value={currentInput}
              onChange={e => { setCurrentInput(e.target.value); setInputError(null); }}
              placeholder="ARKANA-MSIG-v1:…"
              rows={3}
              className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />
            {inputError && <p className="text-xs text-red-400">{inputError}</p>}
            <Button size="sm" variant="outline" className="w-full" onClick={handleAddShare} disabled={!currentInput.trim()}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Response
            </Button>
          </div>
        )}

        {combineError && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20 mb-3">
            {combineError}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onCancel} disabled={isCombining}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleCombineAndSign}
            disabled={!canCombine || isCombining}
          >
            {isCombining ? 'Signing…' : `Sign & Prove (${profile.threshold}-of-${profile.maxSigners})`}
          </Button>
        </div>

        <p className="text-[10px] text-white/30 text-center mt-2">
          The signing key is reconstructed locally and discarded immediately after signing.
        </p>
      </DialogContent>
    </Dialog>
  );
}

// ── Signer-side: generate response payload ───────────────────────────────
/**
 * A separate component (or page) for a signer who received a signing request.
 * They decode the request, verify details, and return their share in a response payload.
 */
export function SignerResponseGenerator({ profileId, myIndex, myShare }: {
  profileId: string;
  myIndex: number;
  myShare: string;
}) {
  const [requestInput, setRequestInput] = React.useState('');
  const [responsePayload, setResponsePayload] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    const decoded = decodeMsigPayload(requestInput.trim());
    if (!decoded || decoded.type !== 'msig-sign-request') {
      setError('Invalid signing request payload.');
      return;
    }
    const req = decoded as SigningRequestPayload;
    if (req.profileId !== profileId) {
      setError('This request is for a different multisig group.');
      return;
    }
    const resp: ShareResponsePayload = {
      type: 'msig-share-response',
      profileId,
      signerIndex: myIndex,
      share: myShare,
    };
    setResponsePayload(encodeMsigPayload(resp));
  };

  const handleCopy = async () => {
    if (!responsePayload) return;
    await navigator.clipboard.writeText(responsePayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Paste the signing request from the coordinator:</p>
      <textarea
        value={requestInput}
        onChange={e => { setRequestInput(e.target.value); setError(null); setResponsePayload(null); }}
        placeholder="ARKANA-MSIG-v1:…"
        rows={3}
        className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button size="sm" variant="outline" className="w-full" onClick={handleGenerate} disabled={!requestInput.trim()}>
        Generate My Response
      </Button>
      {responsePayload && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Send this back to the coordinator:</p>
          <div className="relative">
            <div className="p-3 rounded-lg bg-black/40 border border-green-500/20 font-mono text-[10px] break-all max-h-20 overflow-y-auto select-all text-white/60">
              {responsePayload}
            </div>
            <button onClick={handleCopy} className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleCopy}>
            <Copy className="w-3.5 h-3.5 mr-1.5" /> {copied ? 'Copied!' : 'Copy Response'}
          </Button>
        </div>
      )}
    </div>
  );
}
