'use client';

import { useState, useEffect } from 'react';
import { Users, Check, AlertCircle, ShieldCheck, ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  decodeMsigPayload,
  multisigZkAddress,
  type SignerSetupPayload,
} from '@/lib/frost-multisig';
import { saveMultisigProfile, type MultisigProfileData } from '@/lib/indexeddb';

type Mode = 'loading' | 'input' | 'confirm' | 'saving' | 'done' | 'error';

export default function MultisigJoinPage() {
  const [mode, setMode] = useState<Mode>('loading');
  const [joinData, setJoinData] = useState<SignerSetupPayload | null>(null);
  const [pastedPayload, setPastedPayload] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('payload');
    if (raw) {
      const decoded = decodeMsigPayload(decodeURIComponent(raw));
      if (decoded && decoded.type === 'msig-signer-setup') {
        setJoinData(decoded as SignerSetupPayload);
        setMode('confirm');
      } else {
        setError('Invalid or unrecognised payload in URL.');
        setMode('input');
      }
    } else {
      setMode('input');
    }
  }, []);

  const handleParseInput = () => {
    setError(null);
    const decoded = decodeMsigPayload(pastedPayload.trim());
    if (!decoded || decoded.type !== 'msig-signer-setup') {
      setError('Invalid signer payload. Expected ARKANA-MSIG-v1:… from the initiator.');
      return;
    }
    setJoinData(decoded as SignerSetupPayload);
    setMode('confirm');
  };

  const handleJoin = async () => {
    if (!joinData) return;
    setMode('saving');
    setError(null);
    try {
      const profileId = multisigZkAddress(joinData.groupPublicKey);
      const profile: MultisigProfileData = {
        profileId,
        name: joinData.name,
        threshold: joinData.threshold,
        maxSigners: joinData.maxSigners,
        role: 'signer',
        signerPubkeyHash: joinData.signerPubkeyHash,
        groupPublicKey: joinData.groupPublicKey,
        groupIdentitySecret: joinData.groupIdentitySecret,
        userKey: joinData.userKey,
        myIndex: joinData.myIndex,
        myShare: joinData.myShare,
        participants: Array.from({ length: joinData.maxSigners }, (_, i) => ({ index: i + 1 })),
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      await saveMultisigProfile(profile);
      setMode('done');
    } catch (err: any) {
      setError(err?.message || 'Failed to save multisig profile.');
      setMode('confirm');
    }
  };

  const handleCopyProfileId = async () => {
    if (!joinData) return;
    try {
      await navigator.clipboard.writeText(multisigZkAddress(joinData.groupPublicKey));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h1
            className="text-xl font-sans tracking-wider uppercase"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
          >
            Join Multisig
          </h1>
          <p className="text-sm text-muted-foreground">
            Accept your key share to join the signing group.
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
            <p className="text-sm text-muted-foreground">Reading payload…</p>
          </div>
        )}

        {/* Input: paste payload manually */}
        {mode === 'input' && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <p className="text-xs text-muted-foreground">
              Paste the payload you received from the group initiator:
            </p>
            <textarea
              value={pastedPayload}
              onChange={e => setPastedPayload(e.target.value)}
              placeholder="ARKANA-MSIG-v1:…"
              rows={5}
              className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />
            <Button
              className="w-full"
              size="sm"
              onClick={handleParseInput}
              disabled={!pastedPayload.trim()}
            >
              Parse Payload
            </Button>
          </div>
        )}

        {/* Confirm join */}
        {mode === 'confirm' && joinData && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-border/40 bg-card/80 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium">{joinData.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div className="text-muted-foreground">Threshold</div>
                <div className="font-mono text-right">
                  {joinData.threshold}-of-{joinData.maxSigners}
                </div>
                <div className="text-muted-foreground">Your Signer Index</div>
                <div className="font-mono text-right">#{joinData.myIndex}</div>
                <div className="text-muted-foreground">Group ID</div>
                <div className="font-mono text-right text-white/40">
                  {joinData.signerPubkeyHash.slice(0, 14)}…
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-200/80">
                Verify the group name and threshold match what the initiator told you before joining.
                Your key share will be stored locally in this browser.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => { setJoinData(null); setMode('input'); }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" className="flex-1" onClick={handleJoin}>
                Join Group
              </Button>
            </div>
          </div>
        )}

        {/* Saving */}
        {mode === 'saving' && (
          <div className="py-10 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Saving your key share…</p>
          </div>
        )}

        {/* Done */}
        {mode === 'done' && joinData && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <Check className="w-4 h-4" />
              Joined Successfully
            </div>
            <p className="text-xs text-muted-foreground">
              You are now Signer #{joinData.myIndex} of <strong>{joinData.name}</strong>.
              Your key share has been saved to this device.
            </p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Group zkAddress:</p>
              <button
                onClick={handleCopyProfileId}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-black/40 border border-border/30 hover:border-primary/40 transition-colors group"
              >
                <span className="font-mono text-[10px] text-white/50 truncate flex-1 text-left">
                  {multisigZkAddress(joinData.groupPublicKey)}
                </span>
                {copied
                  ? <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  : <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white/70 shrink-0 transition-colors" />
                }
              </button>
            </div>
            <Button
              className="w-full"
              size="sm"
              variant="outline"
              onClick={() => { window.location.href = '/'; }}
            >
              Go to App
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/60">
          Key shares are stored locally and never leave this device.
        </p>
      </div>
    </div>
  );
}
