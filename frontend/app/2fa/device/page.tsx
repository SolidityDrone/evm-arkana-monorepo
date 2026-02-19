'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, Copy, Check, QrCode, AlertCircle, Key, Fingerprint, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  dkgPhoneRound2,
  dkgPhoneRound3,
  signingPhoneRound2,
  encodeFrostPayload,
  decodeFrostPayload,
  type DKGDesktopPayload,
  type DKGPhonePayload,
  type SigningRequestPayload,
  type SigningResponsePayload,
  type DerivationMethod,
} from '@/lib/frost-2fa';
import {
  deriveScalarShare,
  createPasskeyCredential,
  authenticateAndDeriveFromPasskey,
  requestEOASignatureForDerivation,
  deriveScalarFromSeedPhrase,
  type DerivationConfig,
} from '@/lib/frost-2fa-derivation';
import { useSignMessage } from 'wagmi';
import { useAccount } from 'wagmi';

const STORAGE_KEY_DERIVATION = 'arkana_2fa_derivation';

interface StoredDerivation {
  method: DerivationMethod;
  info: string; // Credential ID, mnemonic hash, or address
}

function loadStoredDerivation(): StoredDerivation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DERIVATION);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDerivation;
  } catch {
    return null;
  }
}

function saveStoredDerivation(derivation: StoredDerivation) {
  localStorage.setItem(STORAGE_KEY_DERIVATION, JSON.stringify(derivation));
}

function clearStoredDerivation() {
  localStorage.removeItem(STORAGE_KEY_DERIVATION);
}

type Mode = 'idle' | 'choose_method' | 'dkg_setup' | 'dkg' | 'signing' | 'complete';

export default function TwoFactorDevicePage() {
  const [mode, setMode] = useState<Mode>('idle');
  const [storedDerivation, setStoredDerivation] = useState<StoredDerivation | null>(loadStoredDerivation());
  const [selectedMethod, setSelectedMethod] = useState<DerivationMethod | null>(null);
  const [dkgResponse, setDkgResponse] = useState<string>('');
  const [signingResponse, setSigningResponse] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // For seedphrase method
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [accountIndex, setAccountIndex] = useState(0);
  
  // For passkey
  const [passkeyCredentialId, setPasskeyCredentialId] = useState<string | null>(null);
  
  // For EOA
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const deriveScalarFromStored = async (challenge?: Uint8Array): Promise<bigint> => {
    if (!storedDerivation) {
      throw new Error('No derivation method stored');
    }

    switch (storedDerivation.method) {
      case 'passkey': {
        if (!challenge) {
          throw new Error('Challenge required for passkey authentication');
        }
        const { scalar } = await authenticateAndDeriveFromPasskey(storedDerivation.info, challenge);
        return scalar;
      }
      case 'seedphrase': {
        // Parse stored info (hash:index)
        const [hashHex, indexStr] = storedDerivation.info.split(':');
        const accountIndex = parseInt(indexStr || '0', 10);
        // Note: In production, you'd need to store the mnemonic securely (encrypted)
        // or prompt user to re-enter it. For now, we'll need user to re-enter.
        throw new Error('Seed phrase method requires re-entering mnemonic for security');
      }
      case 'eoa': {
        // Parse stored info (address:sigPrefix)
        const [storedAddress] = storedDerivation.info.split(':');
        if (!address || address.toLowerCase() !== storedAddress.toLowerCase()) {
          throw new Error('Wallet address mismatch');
        }
        if (!signMessageAsync) {
          throw new Error('Wallet not connected');
        }
        // Re-request signature (deterministic message)
        const signature = await requestEOASignatureForDerivation(signMessageAsync, address);
        const { deriveScalarFromEOASignature } = await import('@/lib/frost-2fa-derivation');
        return deriveScalarFromEOASignature(address, signature);
      }
      default:
        throw new Error(`Unknown derivation method: ${storedDerivation.method}`);
    }
  };

  const handleDKGJoin = useCallback(async (encodedPayload: string, derivationOverride?: StoredDerivation) => {
    const derivation = derivationOverride || storedDerivation;
    if (!derivation) {
      setError('No derivation method configured');
      return;
    }

    setError(null);
    setIsProcessing(true);
    try {
      const decoded = decodeFrostPayload(decodeURIComponent(encodedPayload));
      if (!decoded || decoded.type !== 'dkg-desktop') {
        setError('Invalid DKG request format.');
        setIsProcessing(false);
        return;
      }

      const desktopPayload = decoded as DKGDesktopPayload;

      // Derive scalar share (deterministic, not stored)
      let s2: bigint;
      if (derivation.method === 'seedphrase') {
        // For seedphrase, user needs to re-enter (security)
        if (!mnemonicInput.trim()) {
          setMode('dkg_setup');
          setIsProcessing(false);
          return; // Will prompt for mnemonic
        }
        s2 = await deriveScalarFromSeedPhrase({
          mnemonic: mnemonicInput.trim(),
          accountIndex,
        });
        setMnemonicInput(''); // Clear after use
      } else if (derivation.method === 'passkey') {
        // For passkey, we can derive without auth during DKG (just need credential ID)
        const { deriveScalarFromPasskey } = await import('@/lib/frost-2fa-derivation');
        s2 = await deriveScalarFromPasskey(derivation.info);
      } else if (derivation.method === 'eoa') {
        s2 = await deriveScalarFromStored();
      } else {
        throw new Error('No derivation method configured');
      }

      // Generate public key from derived scalar
      const { phonePublicKey } = await dkgPhoneRound2(s2);

      // Complete DKG to get group public key (for display)
      const dkgResult = await dkgPhoneRound3(desktopPayload.desktopPublicKey, phonePublicKey);

      // Create response payload
      const phonePayload: DKGPhonePayload = {
        type: 'dkg-phone',
        phonePublicKey,
        derivationMethod: derivation.method,
        derivationInfo: derivation.info,
      };
      const encoded = encodeFrostPayload(phonePayload);
      setDkgResponse(encoded);
      setMode('dkg');
    } catch (err: any) {
      console.error('DKG join failed:', err);
      setError(err?.message || 'Failed to join DKG ceremony');
      if (err.message.includes('seed phrase') || err.message.includes('mnemonic')) {
        setMode('dkg_setup');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [storedDerivation, mnemonicInput, accountIndex, address, signMessageAsync]);

  // Check URL for DKG or signing request
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dkgParam = params.get('dkg');
    const signingParam = params.get('sign');

    if (dkgParam) {
      if (!storedDerivation) {
        setMode('choose_method');
      } else {
        // We have stored derivation, proceed with DKG
        handleDKGJoin(dkgParam);
      }
    } else if (signingParam) {
      if (!storedDerivation) {
        setError('No derivation method configured. Please complete DKG setup first.');
        setMode('idle');
      } else if (storedDerivation.method === 'seedphrase') {
        // Show mnemonic input first
        setMode('signing');
      } else {
        // Decode the URL-encoded parameter
        handleSigningRequest(decodeURIComponent(signingParam));
      }
    } else if (storedDerivation) {
      setMode('idle');
    } else {
      setMode('idle');
    }
  }, [storedDerivation, handleDKGJoin]); // Re-run when storedDerivation changes

  const handleMethodSelect = (method: DerivationMethod) => {
    setSelectedMethod(method);
    setError(null);
    
    if (method === 'passkey') {
      handlePasskeySetup();
    } else {
      setMode('dkg_setup');
    }
  };

  const handlePasskeySetup = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Create passkey credential
      const userId = address || `user-${Date.now()}`;
      const credential = await createPasskeyCredential(userId, 'Arkana 2FA Device');
      setPasskeyCredentialId(credential.id);
      
      // Store derivation info (credential ID, not the scalar!)
      const derivation: StoredDerivation = {
        method: 'passkey',
        info: credential.id,
      };
      saveStoredDerivation(derivation);
      setStoredDerivation(derivation);
      
      // Check if there's a DKG request in the URL - if so, continue automatically
      const params = new URLSearchParams(window.location.search);
      const dkgParam = params.get('dkg');
      if (dkgParam) {
        // Continue with DKG automatically, passing derivation directly to avoid race condition
        await handleDKGJoin(dkgParam, derivation);
      } else {
        setMode('idle');
      }
    } catch (err: any) {
      console.error('Passkey setup failed:', err);
      setError(err?.message || 'Failed to create passkey');
      setIsProcessing(false);
    }
  };

  const handleSeedPhraseSetup = async () => {
    if (!mnemonicInput.trim()) {
      setError('Please enter your seed phrase');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      // Hash mnemonic for storage (don't store plain mnemonic!)
      const mnemonicHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(mnemonicInput.trim()));
      const hashHex = Array.from(new Uint8Array(mnemonicHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const derivation: StoredDerivation = {
        method: 'seedphrase',
        info: `${hashHex}:${accountIndex}`, // Store hash + index, not mnemonic!
      };
      saveStoredDerivation(derivation);
      setStoredDerivation(derivation);
      
      // Clear mnemonic from memory
      setMnemonicInput('');
      
      // Continue with DKG
      const params = new URLSearchParams(window.location.search);
      const dkgParam = params.get('dkg');
      if (dkgParam) {
        await handleDKGJoin(dkgParam);
      } else {
        setMode('idle');
      }
    } catch (err: any) {
      console.error('Seed phrase setup failed:', err);
      setError(err?.message || 'Failed to setup seed phrase derivation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEOASetup = async () => {
    if (!address || !signMessageAsync) {
      setError('Please connect your wallet');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    try {
      // Request signature for derivation
      const signature = await requestEOASignatureForDerivation(signMessageAsync, address);
      
      const derivation: StoredDerivation = {
        method: 'eoa',
        info: `${address}:${signature.slice(0, 20)}...`, // Store address + sig prefix
      };
      saveStoredDerivation(derivation);
      setStoredDerivation(derivation);
      
      // Continue with DKG
      const params = new URLSearchParams(window.location.search);
      const dkgParam = params.get('dkg');
      if (dkgParam) {
        await handleDKGJoin(dkgParam);
      } else {
        setMode('idle');
      }
    } catch (err: any) {
      console.error('EOA setup failed:', err);
      setError(err?.message || 'Failed to setup EOA derivation');
    } finally {
      setIsProcessing(false);
    }
  };

  // State to hold parsed signing request for review before signing
  const [pendingSignRequest, setPendingSignRequest] = useState<SigningRequestPayload | null>(null);
  const [pendingEncodedPayload, setPendingEncodedPayload] = useState<string | null>(null);

  const handleSigningRequest = async (encodedPayload: string, mnemonicForSigning?: string, skipReview?: boolean) => {
    if (!storedDerivation) {
      setError('No derivation method configured. Please complete DKG setup first.');
      return;
    }

    setError(null);
    try {
      // encodedPayload is already URL-decoded from the useEffect
      const decoded = decodeFrostPayload(encodedPayload);
      if (!decoded || decoded.type !== 'signing-request') {
        setError('Invalid signing request format.');
        return;
      }

      const request = decoded as SigningRequestPayload;

      // Show signing data for review before passkey prompt (unless already reviewed)
      if (!skipReview && storedDerivation.method === 'passkey') {
        setPendingSignRequest(request);
        setPendingEncodedPayload(encodedPayload);
        setMode('signing');
        return;
      }

      setIsProcessing(true);

      // Derive scalar share (deterministic, re-derived each time)
      let s2: bigint;
      if (storedDerivation.method === 'passkey') {
        // For passkey, need to authenticate (challenge derived from message)
        // Use message hash as challenge (deterministic)
        const messageBytes = new TextEncoder().encode(request.message);
        const challenge = new Uint8Array(await crypto.subtle.digest('SHA-256', messageBytes)).slice(0, 32);
        const { scalar } = await authenticateAndDeriveFromPasskey(storedDerivation.info, challenge);
        s2 = scalar;
      } else if (storedDerivation.method === 'seedphrase') {
        // User needs to re-enter mnemonic for signing
        const mnemonic = mnemonicForSigning || mnemonicInput.trim();
        if (!mnemonic) {
          setMode('signing');
          setIsProcessing(false);
          return; // Will show mnemonic input
        }
        const [hashHex, indexStr] = storedDerivation.info.split(':');
        const accountIndex = parseInt(indexStr || '0', 10);
        s2 = await deriveScalarFromSeedPhrase({
          mnemonic: mnemonic.trim(),
          accountIndex,
        });
        if (!mnemonicForSigning) {
          setMnemonicInput(''); // Clear after use
        }
      } else if (storedDerivation.method === 'eoa') {
        s2 = await deriveScalarFromStored();
      } else {
        throw new Error('Unknown derivation method');
      }

      // Generate partial signature
      const round2 = await signingPhoneRound2(s2, request);

      // Create response payload
      const response: SigningResponsePayload = {
        type: 'signing-response',
        phoneNonce: round2.phoneNonce,
        phonePartialSig: round2.phonePartialSig,
      };
      const encoded = encodeFrostPayload(response);
      setSigningResponse(encoded);
      setMode('signing');
    } catch (err: any) {
      console.error('Signing failed:', err);
      setError(err?.message || 'Failed to generate partial signature');
      if (err.message.includes('seed phrase') || err.message.includes('mnemonic')) {
        setMode('signing');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const handleDelete = () => {
    clearStoredDerivation();
    setStoredDerivation(null);
    setMode('idle');
  };

  if (isProcessing && mode !== 'dkg_setup' && mode !== 'signing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1
            className="text-xl font-sans tracking-wider uppercase"
            style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
          >
            Arkana 2FA Device
          </h1>
          <p className="text-sm text-muted-foreground">
            Your second device for threshold signing.
          </p>
        </div>

        {/* ── Error ───────────────────────────────────────────────── */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* ── Choose Method (DKG Setup) ───────────────────────────── */}
        {mode === 'choose_method' && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="w-4 h-4 text-primary" />
              Choose Signing Method
            </div>
            <p className="text-xs text-muted-foreground">
              Select how you want to derive your 2FA share. The share is never stored - it&apos;s derived each time you sign.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => handleMethodSelect('passkey')}
                disabled={!window.PublicKeyCredential}
                className="w-full p-3 rounded-lg border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-sm">Passkey</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Use device biometrics or security key. Most secure and convenient.
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('seedphrase')}
                className="w-full p-3 rounded-lg border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-sm">Seed Phrase</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Enter your seed phrase. You&apos;ll need to re-enter it each time you sign.
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleMethodSelect('eoa')}
                disabled={!address}
                className="w-full p-3 rounded-lg border border-border/40 hover:border-primary/50 bg-card/50 hover:bg-card/80 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  <div>
                    <div className="font-medium text-sm">Wallet Signature</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Sign with your connected wallet. Requires wallet connection.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── DKG Setup (Seed Phrase Input) ────────────────────────── */}
        {mode === 'dkg_setup' && selectedMethod === 'seedphrase' && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="w-4 h-4 text-primary" />
              Enter Seed Phrase
            </div>
            <p className="text-xs text-muted-foreground">
              Your seed phrase is used to derive your 2FA share. It&apos;s never stored.
            </p>
            <textarea
              value={mnemonicInput}
              onChange={(e) => setMnemonicInput(e.target.value)}
              placeholder="word1 word2 word3..."
              rows={3}
              className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={accountIndex}
                onChange={(e) => setAccountIndex(parseInt(e.target.value) || 0)}
                placeholder="Account index"
                className="flex-1 p-2 rounded-lg bg-black/40 border border-border/30 text-xs"
              />
            </div>
            <Button onClick={handleSeedPhraseSetup} className="w-full" size="sm">
              Continue
            </Button>
          </div>
        )}

        {/* ── DKG Setup (EOA) ──────────────────────────────────────── */}
        {mode === 'dkg_setup' && selectedMethod === 'eoa' && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key className="w-4 h-4 text-primary" />
              Sign with Wallet
            </div>
            <p className="text-xs text-muted-foreground">
              Sign a message with your wallet to derive your 2FA share.
            </p>
            <Button onClick={handleEOASetup} className="w-full" size="sm" disabled={!address}>
              {address ? 'Sign Message' : 'Connect Wallet'}
            </Button>
          </div>
        )}

        {/* ── DKG Response ─────────────────────────────────────────── */}
        {mode === 'dkg' && dkgResponse && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <Check className="w-4 h-4" />
              DKG Complete
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this response and paste it into your desktop device to complete setup.
            </p>
            <div className="relative">
              <div className="p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs break-all select-all max-h-32 overflow-y-auto">
                {dkgResponse}
              </div>
              <button
                onClick={() => handleCopy(dkgResponse)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
            <Button onClick={() => handleCopy(dkgResponse)} className="w-full" variant="outline" size="sm">
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Response
            </Button>
          </div>
        )}

        {/* ── Signing Review (Passkey) ─────────────────────────── */}
        {mode === 'signing' && storedDerivation?.method === 'passkey' && pendingSignRequest && !signingResponse && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Fingerprint className="w-4 h-4 text-primary" />
              Review &amp; Sign with Passkey
            </div>
            <p className="text-xs text-muted-foreground">
              You are about to sign the following data. Review it, then authenticate with your passkey.
            </p>
            <div className="space-y-2 p-3 rounded-lg bg-black/40 border border-border/30 text-xs font-mono">
              <div><span className="text-muted-foreground">Message hash:</span></div>
              <div className="break-all text-primary/80">{pendingSignRequest.message}</div>
              <div className="mt-2"><span className="text-muted-foreground">Group Key (Ax):</span></div>
              <div className="break-all">{pendingSignRequest.groupPublicKey[0]}</div>
              <div><span className="text-muted-foreground">Group Key (Ay):</span></div>
              <div className="break-all">{pendingSignRequest.groupPublicKey[1]}</div>
              <div className="mt-2"><span className="text-muted-foreground">Desktop Nonce (R1x):</span></div>
              <div className="break-all">{pendingSignRequest.desktopNonce[0]}</div>
              <div><span className="text-muted-foreground">Desktop Nonce (R1y):</span></div>
              <div className="break-all">{pendingSignRequest.desktopNonce[1]}</div>
            </div>
            <Button
              onClick={async () => {
                if (pendingEncodedPayload) {
                  await handleSigningRequest(pendingEncodedPayload, undefined, true);
                  setPendingSignRequest(null);
                }
              }}
              className="w-full"
              size="sm"
              disabled={isProcessing}
            >
              {isProcessing ? 'Signing...' : 'Authenticate & Sign'}
            </Button>
          </div>
        )}

        {/* ── Signing (Seed Phrase Input) ────────────────────────── */}
        {mode === 'signing' && storedDerivation?.method === 'seedphrase' && !mnemonicInput && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="w-4 h-4 text-primary" />
              Enter Seed Phrase to Sign
            </div>
            <p className="text-xs text-muted-foreground">
              Re-enter your seed phrase to generate the partial signature.
            </p>
            <textarea
              value={mnemonicInput}
              onChange={(e) => setMnemonicInput(e.target.value)}
              placeholder="word1 word2 word3..."
              rows={3}
              className="w-full p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50"
            />
            <Button
              onClick={async () => {
                const params = new URLSearchParams(window.location.search);
                const signingParam = params.get('sign');
                if (signingParam) {
                  await handleSigningRequest(signingParam, mnemonicInput.trim());
                }
              }}
              className="w-full"
              size="sm"
              disabled={!mnemonicInput.trim()}
            >
              Generate Signature
            </Button>
          </div>
        )}

        {/* ── Signing Response ─────────────────────────────────────── */}
        {mode === 'signing' && signingResponse && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <Check className="w-4 h-4" />
              Partial Signature Generated
            </div>
            <p className="text-xs text-muted-foreground">
              Copy this partial signature and paste it into your desktop device to complete the transaction.
            </p>
            <div className="relative">
              <div className="p-3 rounded-lg bg-black/40 border border-border/30 font-mono text-xs break-all select-all max-h-32 overflow-y-auto">
                {signingResponse}
              </div>
              <button
                onClick={() => handleCopy(signingResponse)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-card/80 hover:bg-card border border-border/30 transition-colors"
                title="Copy response"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
            <Button onClick={() => handleCopy(signingResponse)} className="w-full" variant="outline" size="sm">
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Partial Signature
            </Button>
            <Button onClick={() => { setMode('idle'); setSigningResponse(''); }} className="w-full" variant="outline" size="sm">
              Done
            </Button>
          </div>
        )}

        {/* ── Idle: Derivation configured ──────────────────────────── */}
        {mode === 'idle' && storedDerivation && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium text-green-400">
              <Check className="w-4 h-4" />
              2FA Configured
            </div>
            <p className="text-xs text-muted-foreground">
              Method: <span className="font-mono capitalize">{storedDerivation.method}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              This device is ready to participate in threshold signing.
              When your desktop requests a signature, open the signing link here.
            </p>
            <Button onClick={handleDelete} variant="outline" size="sm" className="w-full text-red-400 hover:text-red-300">
              Clear Configuration
            </Button>
          </div>
        )}

        {/* ── Idle: No configuration ───────────────────────────────── */}
        {mode === 'idle' && !storedDerivation && (
          <div className="space-y-4 p-5 rounded-2xl border border-border/30 bg-card/80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <QrCode className="w-4 h-4 text-primary" />
              Waiting for Setup
            </div>
            <p className="text-xs text-muted-foreground">
              Open the DKG link from your desktop device to configure your derivation method.
            </p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground/60">
          Your share is derived deterministically and never stored.
        </p>
      </div>
    </div>
  );
}
