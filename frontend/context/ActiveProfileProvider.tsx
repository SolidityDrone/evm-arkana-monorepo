'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { listMultisigProfiles, loadMultisigProfile, type MultisigProfileData } from '@/lib/indexeddb';
import { useAccount } from '@/context/AccountProvider';
import { constructZkAddress } from '@/lib/zk-address';
import { getOrCreateDeviceKey, setIdbKey } from '@/lib/idb-crypto';

const SESSION_KEY = 'arkana_active_profile';
const SIGNER_MODE_KEY = 'arkana_signer_mode';

export interface ProfileSummary {
  profileId: string; // 'main' or the multisig zkAddress
  name: string;
  role?: 'initiator' | 'signer';
  threshold?: number;
  maxSigners?: number;
}

interface ActiveProfileContextType {
  /** 'main' or the multisig profileId (zkAddress) */
  activeProfileId: string;
  /** Full multisig profile data when a multisig is active, null for main account */
  activeMultisigProfile: MultisigProfileData | null;
  /**
   * Effective user_key for circuit inputs.
   * null means "use the wallet-signature-derived key" (main account behaviour).
   * Non-null means use this value directly (multisig account).
   */
  effectiveUserKey: bigint | null;
  /** Effective signer_pubkey_hash for circuit inputs. null = derive from effectiveUserKey. */
  effectiveSignerPubkeyHash: string | null;
  /** Effective Baby Jubjub group public key [x, y]. null = derive from effectiveUserKey. */
  effectiveGroupPublicKey: [string, string] | null;
  /**
   * The zkAddress to use for IndexedDB token discovery lookups.
   * For main account = wallet-derived zkAddress ("zk" + 128-hex pubkey).
   * For multisig = constructZkAddress(groupPublicKey) from the profile.
   */
  effectiveZkAddress: string | null;
  /** All available multisig profiles for this device */
  availableMultisigs: ProfileSummary[];
  /**
   * True when the user authenticated as a multisig-only signer (no wallet).
   * In this mode only multisig profiles are available; "Main Account" is hidden.
   */
  isSignerMode: boolean;
  /** Switch to main account or a multisig by profileId */
  switchProfile: (id: 'main' | string) => Promise<void>;
  /** Reload the available multisig list from IndexedDB */
  refreshProfiles: () => Promise<void>;
  /**
   * Enter walletless signer mode. Loads the first (or previously saved) multisig
   * profile from IndexedDB. Call this when the user clicks "Continue as Signer".
   */
  enterSignerMode: () => Promise<void>;
  /** Exit signer mode (e.g. if the user connects a wallet afterwards). */
  exitSignerMode: () => void;
}

const ActiveProfileContext = createContext<ActiveProfileContextType | undefined>(undefined);

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const { account } = useAccount();

  const [activeProfileId, setActiveProfileId] = useState<string>('main');
  const [activeMultisigProfile, setActiveMultisigProfile] = useState<MultisigProfileData | null>(null);
  const [effectiveUserKey, setEffectiveUserKey] = useState<bigint | null>(null);
  const [effectiveSignerPubkeyHash, setEffectiveSignerPubkeyHash] = useState<string | null>(null);
  const [effectiveGroupPublicKey, setEffectiveGroupPublicKey] = useState<[string, string] | null>(null);
  const [effectiveZkAddress, setEffectiveZkAddress] = useState<string | null>(null);
  const [availableMultisigs, setAvailableMultisigs] = useState<ProfileSummary[]>([]);
  const [isSignerMode, setIsSignerMode] = useState<boolean>(false);

  // The wallet-derived zkAddress (the "main" account address)
  const mainZkAddress = account?.zkAddress ? `zk${account.zkAddress}` : null;

  const refreshProfiles = useCallback(async () => {
    try {
      const profiles = await listMultisigProfiles();
      setAvailableMultisigs(
        profiles.map(p => ({
          profileId: p.profileId,
          name: p.name,
          role: p.role,
          threshold: p.threshold,
          maxSigners: p.maxSigners,
        }))
      );
    } catch {
      setAvailableMultisigs([]);
    }
  }, []);

  const applyProfile = useCallback(async (id: string) => {
    if (id === 'main') {
      setActiveProfileId('main');
      setActiveMultisigProfile(null);
      setEffectiveUserKey(null);
      setEffectiveSignerPubkeyHash(null);
      setEffectiveGroupPublicKey(null);
      setEffectiveZkAddress(mainZkAddress);
      try {
        sessionStorage.setItem(SESSION_KEY, 'main');
      } catch { /* ignore */ }
      return;
    }

    // Load multisig profile
    const profile = await loadMultisigProfile(id);
    if (!profile) {
      console.warn('[ActiveProfileProvider] Multisig profile not found:', id);
      return;
    }

    setActiveProfileId(id);
    setActiveMultisigProfile(profile);
    setEffectiveUserKey(BigInt(profile.userKey));
    setEffectiveSignerPubkeyHash(profile.signerPubkeyHash);
    setEffectiveGroupPublicKey(profile.groupPublicKey);
    setEffectiveZkAddress(profile.profileId); // profileId IS the zkAddress
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch { /* ignore */ }
  }, [mainZkAddress]);

  const switchProfile = useCallback(async (id: 'main' | string) => {
    await applyProfile(id);
  }, [applyProfile]);

  const enterSignerMode = useCallback(async () => {
    // Load available profiles first
    let profiles: MultisigProfileData[] = [];
    try {
      profiles = await listMultisigProfiles();
    } catch { /* ignore */ }

    if (profiles.length === 0) return; // Nothing to do without profiles

    // Set device-bound IDB encryption key for signer mode (before loading profile)
    try {
      const key = await getOrCreateDeviceKey();
      setIdbKey(key);
    } catch { /* ignore — IDB stays unencrypted this session */ }

    setIsSignerMode(true);
    try { sessionStorage.setItem(SIGNER_MODE_KEY, '1'); } catch { /* ignore */ }

    // Prefer the previously saved active profile, else use first available
    const savedId = (() => {
      try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
    })();
    const target = profiles.find(p => p.profileId === savedId) ?? profiles[0];
    await applyProfile(target.profileId);
  }, [applyProfile]);

  const exitSignerMode = useCallback(() => {
    setIsSignerMode(false);
    try { sessionStorage.removeItem(SIGNER_MODE_KEY); } catch { /* ignore */ }
    // Reset to main (wallet-derived) address
    setActiveProfileId('main');
    setActiveMultisigProfile(null);
    setEffectiveUserKey(null);
    setEffectiveSignerPubkeyHash(null);
    setEffectiveGroupPublicKey(null);
    setEffectiveZkAddress(mainZkAddress);
    try { sessionStorage.setItem(SESSION_KEY, 'main'); } catch { /* ignore */ }
  }, [mainZkAddress]);

  // On mount: restore active profile and signer mode from sessionStorage
  useEffect(() => {
    const signerMode = (() => {
      try { return sessionStorage.getItem(SIGNER_MODE_KEY) === '1'; } catch { return false; }
    })();
    const saved = (() => {
      try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
    })();

    if (signerMode) {
      // Restore signer mode — enter without wallet
      setIsSignerMode(true);
      // Restore device-bound IDB encryption key
      getOrCreateDeviceKey().then(setIdbKey).catch(() => { /* ignore */ });
      if (saved && saved !== 'main') {
        applyProfile(saved).catch(() => { /* profile may have been deleted */ });
      } else {
        // Pick first available multisig
        listMultisigProfiles().then(profiles => {
          if (profiles.length > 0) applyProfile(profiles[0].profileId).catch(() => { });
        }).catch(() => { });
      }
    } else if (saved && saved !== 'main') {
      applyProfile(saved).catch(() => applyProfile('main'));
    } else {
      // Default: main
      setEffectiveZkAddress(mainZkAddress);
    }
    refreshProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // When main account zkAddress changes (e.g. wallet sign), update effectiveZkAddress if on main
  useEffect(() => {
    if (activeProfileId === 'main') {
      setEffectiveZkAddress(mainZkAddress);
    }
  }, [mainZkAddress, activeProfileId]);

  // If a wallet connects while in signer mode, exit signer mode automatically
  useEffect(() => {
    if (isSignerMode && mainZkAddress) {
      exitSignerMode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainZkAddress]);

  return (
    <ActiveProfileContext.Provider
      value={{
        activeProfileId,
        activeMultisigProfile,
        effectiveUserKey,
        effectiveSignerPubkeyHash,
        effectiveGroupPublicKey,
        effectiveZkAddress,
        availableMultisigs,
        isSignerMode,
        switchProfile,
        refreshProfiles,
        enterSignerMode,
        exitSignerMode,
      }}
    >
      {children}
    </ActiveProfileContext.Provider>
  );
}

export function useActiveProfile(): ActiveProfileContextType {
  const ctx = useContext(ActiveProfileContext);
  if (!ctx) throw new Error('useActiveProfile must be used within ActiveProfileProvider');
  return ctx;
}
