'use client';

import { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, ShieldCheck, Copy, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  decodeMsigPayload,
  encodeMsigPayload,
  type SigningRequestPayload,
  type ShareResponsePayload,
} from '@/lib/frost-multisig';
import { loadMultisigProfile, type MultisigProfileData } from '@/lib/indexeddb';

type Mode = 'loading' | 'input' | 'confirm' | 'done' | 'no-profile' | 'error';

export default function MultisigSignPage() {
  const [mode, setMode] = useState<Mode>('loading');
  const [request, setRequest] = useState<SigningRequestPayload | null>(null);
  const [profile, setProfile] = useState<MultisigProfileData | null>(null);
  const [responsePayload, setResponsePayload] = useState<string | null>(null);
  const [pastedInput, setPastedInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Try to load profile for a decoded request
  const loadProfileForRequest = async (req: SigningRequestPayload): Promise<MultisigProfileData | null> => {
    try {
      return await loadMultisigProfile(req.profileId);
    } catch {
      return null;
    }
  };

  // Generate the share response payload from profile + request
  const buildResponse = (prof: MultisigProfileData, req: SigningRequestPayload): string => {
    const resp: ShareResponsePayload = {
      type: 'msig-share-response',
      profileId: req.profileId,
      signerIndex: prof.myIndex,
      share: prof.myShare,
    };
    return encodeMsigPayload(resp);
  };

  // Decode a raw payload string and proceed
  const processPayload = async (raw: string) => {
    setError(null);
    const decoded = decodeMsigPayload(raw.trim());
    if (!decoded || decoded.type !== 'msig-sign-request') {
      setError('Invalid signing request. Expected ARKANA-MSIG-v1:… from the coordinator.');
      setMode('input');
      return;
    }
    const req = decoded as SigningRequestPayload;
    setRequest(req);
    const prof = await loadProfileForRequest(req);
    if (!prof) {
      setMode('no-profile');
      return;
    }
    setProfile(prof);
    setMode('confirm');
  };

  // On mount: check URL ?request= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('request');
    if (raw) {
      processPayload(decodeURIComponent(raw));
    } else {
      setMode('input');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParseInput = () => {
    processPayload(pastedInput);
  };

  const handleApprove = () => {
    if (!profile || !request) return;
    const resp = buildResponse(profile, request);
    setResponsePayload(resp);
    setMode('done');
  };

  const handleCopyText = async () => {
    if (!responsePayload) return;
    try {
      await navigator.clipboard.writeText(responsePayload);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch { /* ignore */ }
  };

  const handleCopyUrl = async () => {
    if (!responsePayload) return;
    try {
      const url = `${window.location.origin}/multisig/sign?response=${encodeURIComponent(responsePayload)}`;
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Key className="w-10 h-10 text-primary" />
          </div>
          <h1
            className="text-xl font-sans tracking-wider uppercase"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
          >
            Sign Request
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and approve a multisig operation.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {mode === 'loading' && (
          <div className="py-10 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Reading request…</p>
          </div>
        )}

        {/* Input: paste payload manually */}
        {mode === 'input' && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <p className="text-xs text-muted-foreground">
              Paste the signing request from the coordinator:
            </p>
            <textarea
              value={pastedInput}
              onChange={e => { setPastedInput(e.target.value); setError(null); }}
              placeholder="ARKANA-MSIG-v1:…"
              rows={5}
              className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />
            <Button
              className="w-full"
              size="sm"
              onClick={handleParseInput}
              disabled={!pastedInput.trim()}
            >
              Review Request
            </Button>
          </div>
        )}

        {/* No local profile found */}
        {mode === 'no-profile' && request && (
          <div className="space-y-4 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05]">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">No key share found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No multisig profile for this group was found on this device.
                  You need to join the group first using the setup payload from the initiator.
                </p>
              </div>
            </div>
            <p className="text-[10px] font-mono text-white/30 break-all">
              Group: {request.profileId.slice(0, 20)}…
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => { setRequest(null); setMode('input'); }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                className="flex-1"
                variant="outline"
                onClick={() => { window.location.href = '/'; }}
              >
                Go to App
              </Button>
            </div>
          </div>
        )}

        {/* Confirm: show tx details + approve */}
        {mode === 'confirm' && request && profile && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-border/40 bg-card/80 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium">{profile.name}</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20 font-medium">
                  Signer #{profile.myIndex}
                </span>
              </div>

              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                  Operation Details
                </p>
                <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 text-xs">
                  <span className="text-white/40">Token</span>
                  <span className="font-mono text-white/70 truncate">
                    {request.tokenAddress.slice(0, 10)}…{request.tokenAddress.slice(-6)}
                  </span>
                  <span className="text-white/40">Amount</span>
                  <span className="font-mono text-white/70">{request.amount}</span>
                  <span className="text-white/40">Fee</span>
                  <span className="font-mono text-white/70">{request.fee}</span>
                  <span className="text-white/40">Nonce</span>
                  <span className="font-mono text-white/70">{request.nonce}</span>
                  {request.receiver && request.receiver !== '0' && (
                    <>
                      <span className="text-white/40">Receiver</span>
                      <span className="font-mono text-white/70 truncate">
                        {request.receiver.slice(0, 10)}…
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-200/80">
                  Approving will generate your key share response. Verify these details match
                  what the coordinator told you before approving.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => { setRequest(null); setProfile(null); setMode('input'); }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" className="flex-1" onClick={handleApprove}>
                Approve & Generate Response
              </Button>
            </div>
          </div>
        )}

        {/* Done: show response payload to copy */}
        {mode === 'done' && responsePayload && profile && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <Check className="w-4 h-4" />
              Response Generated
            </div>
            <p className="text-xs text-muted-foreground">
              Send this back to the coordinator. They will paste it into their signing modal.
            </p>

            {/* Response text payload */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Response Payload</p>
              <div className="relative">
                <div className="p-3 rounded-lg bg-black/40 border border-green-500/20 font-mono text-[10px] break-all max-h-24 overflow-y-auto select-all text-white/60">
                  {responsePayload}
                </div>
                <button
                  onClick={handleCopyText}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors"
                >
                  {copiedText
                    ? <Check className="w-3.5 h-3.5 text-green-400" />
                    : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyText}>
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedText ? 'Copied!' : 'Copy Payload'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-violet-200"
                  onClick={handleCopyUrl}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedUrl ? 'URL Copied!' : 'Copy Response URL'}
                </Button>
              </div>
            </div>

            <p className="text-[10px] text-white/30">
              Signer #{profile.myIndex} of <strong className="text-white/40">{profile.name}</strong>.
              Your key share was never transmitted — only this approval token is shared.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/60">
          Key shares never leave this device.
        </p>
      </div>
    </div>
  );
}
