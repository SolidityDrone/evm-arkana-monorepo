'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, Check, ArrowLeft, ShieldCheck, Crown, UserPlus, X, Plus, Minus, Link2 } from 'lucide-react';
import {
  createMultisigGroup,
  encodeSignerSetupPayload,
  decodeMsigPayload,
  multisigZkAddress,
  type MultisigGroupSetup,
  type SignerSetupPayload,
} from '@/lib/frost-multisig';
import { saveMultisigProfile, type MultisigProfileData } from '@/lib/indexeddb';
import { useActiveProfile } from '@/context/ActiveProfileProvider';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step =
  | 'role'
  | 'config'
  | 'generating'
  | 'ceremony'
  | 'join-input'
  | 'join-confirm';

export function MultisigSetupWizard({ open, onClose }: Props) {
  const { refreshProfiles } = useActiveProfile();

  const [step, setStep] = React.useState<Step>('role');
  const [name, setName] = React.useState('');
  const [threshold, setThreshold] = React.useState(2);
  const [maxSigners, setMaxSigners] = React.useState(3);
  const [groupSetup, setGroupSetup] = React.useState<MultisigGroupSetup | null>(null);
  const [activeSignerIdx, setActiveSignerIdx] = React.useState(1);
  const [copied, setCopied] = React.useState<Record<number, boolean>>({});
  const [copiedUrl, setCopiedUrl] = React.useState<Record<number, boolean>>({});
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Signer join flow
  const [joinPayload, setJoinPayload] = React.useState('');
  const [joinData, setJoinData] = React.useState<SignerSetupPayload | null>(null);

  const reset = () => {
    setStep('role');
    setName('');
    setThreshold(2);
    setMaxSigners(3);
    setGroupSetup(null);
    setActiveSignerIdx(1);
    setCopied({});
    setIsProcessing(false);
    setError(null);
    setJoinPayload('');
    setJoinData(null);
    setCopiedUrl({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // ── INITIATOR: Generate group ────────────────────────────────────────
  const handleGenerate = async () => {
    if (!name.trim()) { setError('Enter a name for this multisig'); return; }
    if (threshold < 2) { setError('Threshold must be at least 2'); return; }
    if (maxSigners < threshold) { setError('Total signers must be ≥ threshold'); return; }

    setStep('generating');
    setIsProcessing(true);
    setError(null);
    try {
      const setup = await createMultisigGroup(threshold, maxSigners, name.trim());
      setGroupSetup(setup);
      setStep('ceremony');
    } catch (err: any) {
      setError(err?.message || 'Failed to generate multisig group');
      setStep('config');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyPayload = async (signerIndex: number) => {
    if (!groupSetup) return;
    try {
      const payload = encodeSignerSetupPayload(groupSetup, signerIndex);
      await navigator.clipboard.writeText(payload);
      setCopied(prev => ({ ...prev, [signerIndex]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [signerIndex]: false })), 2000);
    } catch { /* ignore */ }
  };

  const handleCopyUrl = async (signerIndex: number) => {
    if (!groupSetup) return;
    try {
      const payload = encodeSignerSetupPayload(groupSetup, signerIndex);
      const url = `${window.location.origin}/multisig/join?payload=${encodeURIComponent(payload)}`;
      await navigator.clipboard.writeText(url);
      setCopiedUrl(prev => ({ ...prev, [signerIndex]: true }));
      setTimeout(() => setCopiedUrl(prev => ({ ...prev, [signerIndex]: false })), 2000);
    } catch { /* ignore */ }
  };

  const handleCompleteInitiator = async () => {
    if (!groupSetup) return;
    setIsProcessing(true);
    setError(null);
    try {
      const profileId = multisigZkAddress(groupSetup.groupPublicKey);
      const profile: MultisigProfileData = {
        profileId,
        name: groupSetup.name,
        threshold: groupSetup.threshold,
        maxSigners: groupSetup.maxSigners,
        role: 'initiator',
        signerPubkeyHash: groupSetup.signerPubkeyHash,
        groupPublicKey: groupSetup.groupPublicKey,
        groupIdentitySecret: groupSetup.groupIdentitySecret,
        userKey: groupSetup.userKey,
        myIndex: 1, // initiator takes index 1
        myShare: groupSetup.shares[0].share,
        participants: groupSetup.shares.map((_, i) => ({ index: i + 1 })),
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      await saveMultisigProfile(profile);
      await refreshProfiles();
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save multisig profile');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── SIGNER: Join group ───────────────────────────────────────────────
  const handleParseJoinPayload = () => {
    setError(null);
    const decoded = decodeMsigPayload(joinPayload.trim());
    if (!decoded || decoded.type !== 'msig-signer-setup') {
      setError('Invalid signer payload. Expected ARKANA-MSIG-v1:… from the initiator.');
      return;
    }
    setJoinData(decoded as SignerSetupPayload);
    setStep('join-confirm');
  };

  const handleCompleteJoin = async () => {
    if (!joinData) return;
    setIsProcessing(true);
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
      await refreshProfiles();
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save multisig profile');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-[500px] max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 rounded-lg p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all z-10"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm sm:text-base font-sans tracking-wider uppercase text-center"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
            {step === 'role' && 'Add Multisig'}
            {step === 'config' && 'Configure Group'}
            {step === 'generating' && 'Generating Keys…'}
            {step === 'ceremony' && 'Distribute Key Shares'}
            {step === 'join-input' && 'Join a Multisig'}
            {step === 'join-confirm' && 'Confirm & Join'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20 mb-3">{error}</p>
        )}

        {/* ── Choose role ─────────────────────────────────────────── */}
        {step === 'role' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Are you creating a new multisig group, or joining one someone else set up?
            </p>
            <button
              onClick={() => setStep('config')}
              className="w-full p-4 rounded-xl border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-400/60 group-hover:text-amber-400 transition-colors shrink-0" />
                <div>
                  <div className="font-medium text-sm">Create Group (Initiator)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Generate keys, set threshold, distribute shares to other signers.
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setStep('join-input')}
              className="w-full p-4 rounded-xl border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-5 h-5 text-sky-400/60 group-hover:text-sky-400 transition-colors shrink-0" />
                <div>
                  <div className="font-medium text-sm">Join Group (Signer)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Paste the payload you received from the group initiator.
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* ── Configure group ──────────────────────────────────────── */}
        {step === 'config' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Group Name</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Team Treasury"
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Threshold (m)
                  <span className="ml-1 text-white/30">required</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setThreshold(Math.max(2, threshold - 1))}
                    className="w-8 h-8 rounded-lg border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 flex items-center justify-center text-muted-foreground hover:text-white transition-all shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 text-center font-mono text-sm py-1.5 rounded-lg bg-black/30 border border-border/30 select-none">
                    {threshold}
                  </div>
                  <button
                    type="button"
                    onClick={() => setThreshold(Math.min(maxSigners, threshold + 1))}
                    className="w-8 h-8 rounded-lg border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 flex items-center justify-center text-muted-foreground hover:text-white transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  Total Signers (n)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMaxSigners(Math.max(threshold, maxSigners - 1))}
                    className="w-8 h-8 rounded-lg border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 flex items-center justify-center text-muted-foreground hover:text-white transition-all shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1 text-center font-mono text-sm py-1.5 rounded-lg bg-black/30 border border-border/30 select-none">
                    {maxSigners}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaxSigners(Math.min(10, maxSigners + 1))}
                    className="w-8 h-8 rounded-lg border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 flex items-center justify-center text-muted-foreground hover:text-white transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <p className="text-xs text-violet-200/80">
                <strong>{threshold}-of-{maxSigners}</strong> — any {threshold} of {maxSigners} signers must
                approve each withdrawal. You (the initiator) hold signer #1.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep('role')}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button size="sm" className="flex-1" onClick={handleGenerate} disabled={isProcessing}>
                Generate Keys
              </Button>
            </div>
          </div>
        )}

        {/* ── Generating ───────────────────────────────────────────── */}
        {step === 'generating' && (
          <div className="py-10 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Generating {threshold}-of-{maxSigners} key group…</p>
          </div>
        )}

        {/* ── Ceremony: distribute shares ──────────────────────────── */}
        {step === 'ceremony' && groupSetup && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Send each signer their payload privately (secure channel only). Each payload contains
              a unique key share — never share signer #1's payload (that's yours).
            </p>

            {/* Signer tab list */}
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: groupSetup.maxSigners }, (_, i) => i + 1).map(idx => (
                <button
                  key={idx}
                  onClick={() => setActiveSignerIdx(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                    activeSignerIdx === idx
                      ? 'bg-primary/20 border-primary/40 text-primary'
                      : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white/80'
                  }`}
                >
                  {idx === 1 ? 'Me (#1)' : `Signer #${idx}`}
                </button>
              ))}
            </div>

            {activeSignerIdx === 1 ? (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-200/80">
                  This is <strong>your own share</strong> (Signer #1, Initiator). It will be stored
                  automatically when you complete setup. You do not need to send it anywhere.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Copy and send this payload to <strong>Signer #{activeSignerIdx}</strong>:
                </p>
                <div className="relative">
                  <div className="p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-[10px] break-all max-h-24 overflow-y-auto select-all text-white/60">
                    {encodeSignerSetupPayload(groupSetup, activeSignerIdx)}
                  </div>
                  <button
                    onClick={() => handleCopyPayload(activeSignerIdx)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors"
                    title="Copy payload"
                  >
                    {copied[activeSignerIdx]
                      ? <Check className="w-3.5 h-3.5 text-green-400" />
                      : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleCopyPayload(activeSignerIdx)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {copied[activeSignerIdx] ? 'Copied!' : 'Copy Payload'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-violet-500/30 hover:border-violet-500/60 text-violet-300 hover:text-violet-200"
                    onClick={() => handleCopyUrl(activeSignerIdx)}
                  >
                    <Link2 className="w-3.5 h-3.5 mr-1.5" />
                    {copiedUrl[activeSignerIdx] ? 'URL Copied!' : 'Copy Join URL'}
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-3">
                Once you've distributed all payloads, complete setup to save your profile.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep('config')}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={handleCompleteInitiator}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Saving…' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Join: input payload ──────────────────────────────────── */}
        {step === 'join-input' && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Paste the payload you received from the group initiator:
            </p>
            <textarea
              value={joinPayload}
              onChange={e => setJoinPayload(e.target.value)}
              placeholder="ARKANA-MSIG-v1:…"
              rows={4}
              className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep('role')}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button size="sm" className="flex-1" onClick={handleParseJoinPayload} disabled={!joinPayload.trim()}>
                Parse Payload
              </Button>
            </div>
          </div>
        )}

        {/* ── Join: confirm ────────────────────────────────────────── */}
        {step === 'join-confirm' && joinData && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium">{joinData.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-muted-foreground">Threshold</div>
                <div className="font-mono text-right">{joinData.threshold}-of-{joinData.maxSigners}</div>
                <div className="text-muted-foreground">Your Index</div>
                <div className="font-mono text-right">Signer #{joinData.myIndex}</div>
                <div className="text-muted-foreground">Group ID</div>
                <div className="font-mono text-right text-white/40">
                  {joinData.signerPubkeyHash.slice(0, 12)}…
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-200/80">
                Verify that the group name and parameters match what the initiator told you
                before confirming. Your key share will be stored locally.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setJoinData(null); setStep('join-input'); }}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
              </Button>
              <Button size="sm" className="flex-1" onClick={handleCompleteJoin} disabled={isProcessing}>
                {isProcessing ? 'Saving…' : 'Join Group'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
