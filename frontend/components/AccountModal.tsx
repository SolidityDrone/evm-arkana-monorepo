'use client';

import { useNonceDiscovery, BalanceEntry, ArchonPosition } from '@/hooks/useNonceDiscovery';
import { useZkAddress, useAccount } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { Address, formatUnits, keccak256, encodePacked } from 'viem';
import { saveTokenAccountData, loadTokenAccountData, TokenAccountData, getTokenAddresses, loadAccountData, AccountData, DiscoveryMode, saveDiscoveryMode, checkProfileSetup } from '@/lib/indexeddb';
import { parseZkAddress } from '@/lib/zk-address';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { reconstructTokenHistory, TransactionHistoryEntry } from '@/lib/transaction-history';
import { computePrivateKeyFromSignature } from '@/lib/circuit-utils';
import { ChevronDown, ChevronUp, Clock, Key, Shield, X, Users, Plus, Crown, UserPlus } from 'lucide-react';
import { TokenIcon } from '@/lib/token-icons';
import { convertSharesToAssets } from '@/lib/shares-to-assets';
import { MultisigSetupWizard } from './MultisigSetupWizard';
import { useActiveProfile } from '@/context/ActiveProfileProvider';
import type { MultisigProfileData } from '@/lib/indexeddb';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
    const {
        computeCurrentNonce,
        isComputing,
        currentNonce,
        error,
        balanceEntries,
        isDecrypting,
        fetchIncomingNotes,
    } = useNonceDiscovery();

    const {
        setBalanceEntries,
        setCurrentNonce,
        userKey: contextUserKey,
    } = useAccountState();

    const zkAddress = useZkAddress();
    const { account } = useAccount();
    const publicClient = usePublicClient();
    const { tokens: aaveTokens, isLoading: isLoadingAaveTokens } = useAaveTokens();

    const [tokenDataMap, setTokenDataMap] = useState<Map<string, TokenAccountData>>(new Map());
    const [isDiscoveringTokens, setIsDiscoveringTokens] = useState<Set<string>>(new Set());
    const [discoveryErrors, setDiscoveryErrors] = useState<Map<string, string>>(new Map());
    const [dataLastSaved, setDataLastSaved] = useState<number | null>(null);
    const [isLoadingSavedData, setIsLoadingSavedData] = useState(false);
    const [historyModalToken, setHistoryModalToken] = useState<string | null>(null);
    const [tokenHistoryMap, setTokenHistoryMap] = useState<Map<string, TransactionHistoryEntry[]>>(new Map());
    const [loadingHistoryToken, setLoadingHistoryToken] = useState<string | null>(null);
    const [historyErrors, setHistoryErrors] = useState<Map<string, string>>(new Map());
    const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('mage');
    const [skipCacheOnNextDiscovery, setSkipCacheOnNextDiscovery] = useState(false);
    // Archon mode: per-token array of discovered positions (indexed by tokenAddress lower)
    const [archonPositionsMap, setArchonPositionsMap] = useState<Map<string, ArchonPosition[]>>(new Map());
    // Map of "tokenAddress-nonce" -> converted asset value (bigint)
    const [convertedAssets, setConvertedAssets] = useState<Map<string, bigint>>(new Map());
    const [isConvertingAssets, setIsConvertingAssets] = useState<Set<string>>(new Set());
    // Incoming notes count per token (tokenAddress -> count)
    const [incomingNotesCountMap, setIncomingNotesCountMap] = useState<Map<string, number>>(new Map());
    // Decrypted incoming notes per token (tokenAddress -> IncomingNote[])
    const [incomingNotesByToken, setIncomingNotesByToken] = useState<Map<string, import('@/lib/indexeddb').IncomingNote[]>>(new Map());
    const [loadingIncomingToken, setLoadingIncomingToken] = useState<Set<string>>(new Set());
    const fetchedIncomingNotesRef = useRef<Set<string>>(new Set());
    const [profileType, setProfileType] = useState<'single' | '2fa' | undefined>(undefined);
    const [multisigWizardOpen, setMultisigWizardOpen] = useState(false);
    const tokenDataMapRef = useRef<Map<string, TokenAccountData>>(new Map());

    const { availableMultisigs, switchProfile, activeProfileId, refreshProfiles, effectiveZkAddress, effectiveUserKey, activeMultisigProfile, isSignerMode } = useActiveProfile();
    // Use the effective zkAddress (multisig or main) for all IndexedDB/discovery operations
    const activeAccountKey = effectiveZkAddress ?? zkAddress;

    const isModalClosedRef = useRef(false);
    // Generation counter: incremented every time activeAccountKey changes.
    // loadSavedData captures the generation at call time and discards results if stale.
    const loadGenRef = useRef(0);

    useEffect(() => {
        tokenDataMapRef.current = tokenDataMap;
    }, [tokenDataMap]);

    // Load profile type (and 2FA status) when modal opens
    useEffect(() => {
        if (!isOpen) return;
        if (activeMultisigProfile) {
            // Multisig profile is active — badge is handled separately via activeMultisigProfile
            setProfileType(undefined);
            return;
        }
        if (!zkAddress) return;
        const rawHex = zkAddress.replace('zk', '');
        checkProfileSetup(rawHex).then(status => {
            if (status === 'single' || status === '2fa') setProfileType(status);
            else setProfileType(undefined);
        }).catch(() => setProfileType(undefined));
    }, [isOpen, zkAddress, activeMultisigProfile]);

    // Helper function to format value with decimals
    const formatTokenValue = useCallback((value: bigint, decimals: number, maxDecimals: number = 6): string => {
        const formatted = formatUnits(value, decimals);
        const parts = formatted.split('.');
        if (parts.length === 1) return parts[0];
        const intPart = parts[0];
        const decPart = parts[1].slice(0, maxDecimals);
        // Remove trailing zeros
        const trimmedDec = decPart.replace(/0+$/, '');
        if (!trimmedDec) return intPart;
        return `${intPart}.${trimmedDec}`;
    }, []);

    // Ref to track pending conversions to avoid duplicates
    const pendingConversionsRef = useRef<Set<string>>(new Set());

    // Convert shares to assets for all balance entries when tokenDataMap changes
    useEffect(() => {
        if (!publicClient || (tokenDataMap.size === 0 && archonPositionsMap.size === 0)) return;

        const convertAll = async () => {
            const conversionsToMake: Array<{ tokenAddress: string; nonce: bigint; shares: bigint; key: string }> = [];

            for (const [tokenAddress, tokenData] of tokenDataMap.entries()) {
                for (const entry of tokenData.balanceEntries) {
                    const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
                    const key = `${tokenAddress.toLowerCase()}-${entryNonce.toString()}`;

                    // Skip if already converted, currently converting, or pending
                    if (convertedAssets.has(key) || isConvertingAssets.has(key) || pendingConversionsRef.current.has(key)) {
                        continue;
                    }

                    if (entry.amount > BigInt(0)) {
                        conversionsToMake.push({ tokenAddress, nonce: entryNonce, shares: entry.amount, key });
                        pendingConversionsRef.current.add(key);
                    }
                }
            }
            // Incoming notes: convert each note amount, the sum, and absorbable (sum - nullifier) to assets
            for (const [tokenAddress, notes] of incomingNotesByToken.entries()) {
                const tokenData = tokenDataMap.get(tokenAddress);
                const currentNonce = tokenData?.currentNonce ?? BigInt(0);
                const previousNonce = currentNonce > BigInt(0) ? currentNonce - BigInt(1) : BigInt(0);
                const currentEntry = tokenData?.balanceEntries?.find((e: { nonce: bigint | string }) => (typeof e.nonce === 'string' ? BigInt(e.nonce) : e.nonce) === previousNonce);
                const nullifier = (currentEntry as { nullifier?: bigint } | undefined)?.nullifier ?? BigInt(0);

                let sumShares = BigInt(0);
                for (let idx = 0; idx < notes.length; idx++) {
                    const key = `${tokenAddress.toLowerCase()}-incoming-${idx}`;
                    if (convertedAssets.has(key) || isConvertingAssets.has(key) || pendingConversionsRef.current.has(key)) continue;
                    if (notes[idx].amount > BigInt(0)) {
                        conversionsToMake.push({ tokenAddress, nonce: BigInt(idx), shares: notes[idx].amount, key });
                        pendingConversionsRef.current.add(key);
                        sumShares += notes[idx].amount;
                    }
                }
                const sumKey = `${tokenAddress.toLowerCase()}-incoming-sum`;
                if (sumShares > BigInt(0) && !convertedAssets.has(sumKey) && !isConvertingAssets.has(sumKey) && !pendingConversionsRef.current.has(sumKey)) {
                    conversionsToMake.push({ tokenAddress, nonce: BigInt(-1), shares: sumShares, key: sumKey });
                    pendingConversionsRef.current.add(sumKey);
                }
                // Absorbable = sum of incoming - nullifier (how much already absorbed); convert for display
                const absorbableShares = sumShares > nullifier ? sumShares - nullifier : BigInt(0);
                const absorbableKey = `${tokenAddress.toLowerCase()}-absorbable`;
                if (absorbableShares > BigInt(0) && !convertedAssets.has(absorbableKey) && !isConvertingAssets.has(absorbableKey) && !pendingConversionsRef.current.has(absorbableKey)) {
                    conversionsToMake.push({ tokenAddress, nonce: BigInt(-2), shares: absorbableShares, key: absorbableKey });
                    pendingConversionsRef.current.add(absorbableKey);
                }
            }

            // Archon mode: convert each position's latest balance and the overall total
            for (const [tokenAddress, positions] of archonPositionsMap.entries()) {
                for (const pos of positions) {
                    const latestEntry = pos.balanceEntries.length > 0
                        ? pos.balanceEntries[pos.balanceEntries.length - 1]
                        : null;
                    if (!latestEntry || latestEntry.amount <= BigInt(0)) continue;
                    const key = `${tokenAddress.toLowerCase()}-archon-${pos.userKeyOffset.toString()}`;
                    if (!convertedAssets.has(key) && !isConvertingAssets.has(key) && !pendingConversionsRef.current.has(key)) {
                        conversionsToMake.push({ tokenAddress, nonce: pos.userKeyOffset, shares: latestEntry.amount, key });
                        pendingConversionsRef.current.add(key);
                    }
                }
                // Also convert total across all positions
                const totalShares = positions.reduce((sum, pos) => {
                    const latest = pos.balanceEntries.length > 0 ? pos.balanceEntries[pos.balanceEntries.length - 1] : null;
                    return sum + (latest?.amount ?? BigInt(0));
                }, BigInt(0));
                if (totalShares > BigInt(0)) {
                    const totalKey = `${tokenAddress.toLowerCase()}-archon-total`;
                    if (!convertedAssets.has(totalKey) && !isConvertingAssets.has(totalKey) && !pendingConversionsRef.current.has(totalKey)) {
                        conversionsToMake.push({ tokenAddress, nonce: BigInt(-3), shares: totalShares, key: totalKey });
                        pendingConversionsRef.current.add(totalKey);
                    }
                }
            }

            if (conversionsToMake.length === 0) return;

            // Mark all as converting
            setIsConvertingAssets(prev => {
                const newSet = new Set(prev);
                conversionsToMake.forEach(c => newSet.add(c.key));
                return newSet;
            });

            // Convert in parallel
            const results = await Promise.all(
                conversionsToMake.map(async ({ tokenAddress, shares, key }) => {
                    try {
                        const assets = await convertSharesToAssets(publicClient, tokenAddress as Address, shares);
                        return { key, assets };
                    } catch (error) {
                        console.error('Error converting shares to assets:', error);
                        return { key, assets: null };
                    }
                })
            );

            // Update state with all results
            setConvertedAssets(prev => {
                const newMap = new Map(prev);
                for (const { key, assets } of results) {
                    if (assets !== null) {
                        newMap.set(key, assets);
                    }
                }
                return newMap;
            });

            // Clear converting state
            setIsConvertingAssets(prev => {
                const newSet = new Set(prev);
                conversionsToMake.forEach(c => {
                    newSet.delete(c.key);
                    pendingConversionsRef.current.delete(c.key);
                });
                return newSet;
            });
        };

        convertAll();
    }, [publicClient, tokenDataMap, archonPositionsMap, incomingNotesByToken, convertedAssets, isConvertingAssets]);

    const loadSavedData = useCallback(async () => {
        if (!activeAccountKey) return;
        // Capture current generation — if it changes before we finish, discard stale results
        const gen = loadGenRef.current;

        try {
            setIsLoadingSavedData(true);
            const savedData = await loadAccountData(activeAccountKey);

            // Profile switched while we were loading — discard
            if (loadGenRef.current !== gen) return;

            if (savedData) {
                const savedMode = savedData.discoveryMode || 'mage';
                setDiscoveryMode(savedMode);

                const tokenMap = new Map<string, TokenAccountData>();

                // Load mode-specific token data
                const modeTokenData = savedMode === 'mage'
                    ? savedData.mageTokenData
                    : savedData.archonTokenData;

                if (modeTokenData && modeTokenData.length > 0) {
                    for (const tokenData of modeTokenData) {
                        tokenMap.set(tokenData.tokenAddress.toLowerCase(), tokenData);
                    }
                }

                setTokenDataMap(tokenMap);
                setDataLastSaved(savedData.lastUpdated);

                if (savedData.currentNonce !== null && savedData.currentNonce !== undefined) {
                    setCurrentNonce(savedData.currentNonce);
                }
                if (savedData.balanceEntries && savedData.balanceEntries.length > 0) {
                    setBalanceEntries(savedData.balanceEntries);
                }
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        } finally {
            if (loadGenRef.current === gen) setIsLoadingSavedData(false);
        }
    }, [activeAccountKey, setCurrentNonce, setBalanceEntries]);

    // Discover nonce for all Aave tokens
    const discoverAllTokens = useCallback(async () => {
        const hasCredentials = activeMultisigProfile ? !!effectiveUserKey : !!account?.signature;
        if (!publicClient || !hasCredentials || !activeAccountKey) {
            return;
        }

        // Wait for Aave tokens to load
        if (isLoadingAaveTokens) {
            return;
        }

        if (aaveTokens.length === 0) {
            return;
        }

        // Capture generation to detect profile switches mid-discovery
        const gen = loadGenRef.current;

        setIsDiscoveringTokens(new Set(aaveTokens.map(t => t.address)));
        setDiscoveryErrors(new Map());

        const newTokenDataMap = new Map<string, TokenAccountData>();

        // Check if we should skip cache (mode just changed)
        const shouldSkipCache = skipCacheOnNextDiscovery;
        if (shouldSkipCache) {
            console.log('🔍 [MODAL] Skipping cache - mode just changed');
            setSkipCacheOnNextDiscovery(false);
        }

        for (const token of aaveTokens) {
            if (isModalClosedRef.current || loadGenRef.current !== gen) {
                break;
            }

            try {
                let cachedNonce: bigint | null = null;
                let cachedBalanceEntries: BalanceEntry[] = [];

                // Only use cache if we're not skipping it
                if (!shouldSkipCache) {
                    // Reload cached data before each token to get the latest state
                    const cachedData = await loadAccountData(activeAccountKey);
                    const tokenAddressLower = token.address.toLowerCase();

                    // Get cached data for this specific token
                    const cachedTokenData = cachedData?.tokenData?.find(t => {
                        return t.tokenAddress.toLowerCase() === tokenAddressLower;
                    });
                    cachedNonce = cachedTokenData?.currentNonce || null;
                    cachedBalanceEntries = cachedTokenData?.balanceEntries || [];
                }

                // Compute nonce for this token
                const result = await computeCurrentNonce(token.address as `0x${string}`, cachedNonce, cachedBalanceEntries, discoveryMode);

                if (result && !isModalClosedRef.current) {
                    // Save token-specific data (per mode)
                    await saveTokenAccountData(activeAccountKey, token.address, result.currentNonce, result.balanceEntries, discoveryMode);

                    newTokenDataMap.set(token.address.toLowerCase(), {
                        tokenAddress: token.address,
                        currentNonce: result.currentNonce,
                        balanceEntries: result.balanceEntries,
                        lastUpdated: Date.now(),
                    });

                    // Capture per-position data in archon mode
                    if (result.archonPositions && result.archonPositions.length > 0) {
                        setArchonPositionsMap(prev => {
                            const next = new Map(prev);
                            next.set(token.address.toLowerCase(), result.archonPositions!);
                            return next;
                        });
                    }

                    // Update state immediately for this token to show progress
                    setTokenDataMap(new Map(newTokenDataMap));
                }

                setIsDiscoveringTokens(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(token.address);
                    return newSet;
                });
            } catch (error) {
                // Skip this token and continue to next one
                setIsDiscoveringTokens(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(token.address);
                    return newSet;
                });
            }

            // Yield to browser every token to allow DOM updates
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (!isModalClosedRef.current && loadGenRef.current === gen) {
            setTokenDataMap(newTokenDataMap);
            setDataLastSaved(Date.now());
        }
    }, [publicClient, account?.signature, activeAccountKey, activeMultisigProfile, effectiveUserKey, isLoadingAaveTokens, aaveTokens, computeCurrentNonce, discoveryMode, skipCacheOnNextDiscovery]);

    const handleDiscoverToken = useCallback(async (tokenAddress: string) => {
        const hasCredentials = activeMultisigProfile ? !!effectiveUserKey : !!account?.signature;
        if (!activeAccountKey || !publicClient || !hasCredentials || isModalClosedRef.current) {
            return;
        }

        const normalizedTokenAddress = tokenAddress.toLowerCase();
        if (isDiscoveringTokens.has(normalizedTokenAddress)) {
            return;
        }

        setIsDiscoveringTokens(prev => new Set(prev).add(normalizedTokenAddress));
        setDiscoveryErrors(prev => {
            const newMap = new Map(prev);
            newMap.delete(normalizedTokenAddress);
            return newMap;
        });

        try {
            if (isModalClosedRef.current) return;

            // Load cached data for this token (mode-specific)
            const cachedTokenData = await loadTokenAccountData(activeAccountKey, normalizedTokenAddress, discoveryMode);
            const cachedNonce = cachedTokenData?.currentNonce || null;
            const cachedBalanceEntries = cachedTokenData?.balanceEntries || [];

            const result = await computeCurrentNonce(
                normalizedTokenAddress as `0x${string}`,
                cachedNonce,
                cachedBalanceEntries,
                discoveryMode
            );

            if (isModalClosedRef.current) return;

            if (result) {
                await saveTokenAccountData(
                    activeAccountKey,
                    normalizedTokenAddress,
                    result.currentNonce,
                    result.balanceEntries,
                    discoveryMode
                );

                setTokenDataMap(prev => {
                    const newMap = new Map(prev);
                    newMap.set(normalizedTokenAddress, {
                        tokenAddress: normalizedTokenAddress,
                        currentNonce: result.currentNonce,
                        balanceEntries: result.balanceEntries,
                        lastUpdated: Date.now(),
                    });
                    return newMap;
                });

                if (result.archonPositions && result.archonPositions.length > 0) {
                    setArchonPositionsMap(prev => {
                        const next = new Map(prev);
                        next.set(normalizedTokenAddress, result.archonPositions!);
                        return next;
                    });
                }

                setCurrentNonce(result.currentNonce);
                setBalanceEntries(result.balanceEntries);
                setDataLastSaved(Date.now());
            }
        } catch (error) {
            console.error('Error discovering token:', error);
            setDiscoveryErrors(prev => {
                const newMap = new Map(prev);
                newMap.set(normalizedTokenAddress, error instanceof Error ? error.message : 'Failed to discover token');
                return newMap;
            });
        } finally {
            setIsDiscoveringTokens(prev => {
                const newSet = new Set(prev);
                newSet.delete(normalizedTokenAddress);
                return newSet;
            });
        }
    }, [activeAccountKey, publicClient, account?.signature, activeMultisigProfile, effectiveUserKey, computeCurrentNonce, setCurrentNonce, setBalanceEntries, discoveryMode]);

    // Load transaction history for a specific token
    const loadTokenHistory = useCallback(async (tokenAddress: string) => {
        if (!publicClient || !account?.signature || !activeAccountKey || isModalClosedRef.current) {
            return;
        }

        const normalizedTokenAddress = tokenAddress.toLowerCase();
        setLoadingHistoryToken(normalizedTokenAddress);
        setHistoryErrors(prev => {
            const newMap = new Map(prev);
            newMap.delete(normalizedTokenAddress);
            return newMap;
        });

        try {
            // Get userKey — use profile's effective key if multisig is active
            let userKey: bigint | null = effectiveUserKey ?? contextUserKey;
            if (!userKey && account?.signature) {
                const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                userKey = BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
            }

            if (!userKey) {
                throw new Error('Failed to compute userKey');
            }

            // Get current nonce for this token
            const tokenData = tokenDataMap.get(normalizedTokenAddress);
            if (!tokenData || !tokenData.currentNonce) {
                throw new Error('Token data not available');
            }

            const history = await reconstructTokenHistory(
                publicClient,
                userKey,
                normalizedTokenAddress as Address,
                tokenData.currentNonce
            );

            setTokenHistoryMap(prev => {
                const newMap = new Map(prev);
                newMap.set(normalizedTokenAddress, history);
                return newMap;
            });
        } catch (error) {
            console.error('Error loading token history:', error);
            setHistoryErrors(prev => {
                const newMap = new Map(prev);
                newMap.set(normalizedTokenAddress, error instanceof Error ? error.message : 'Failed to load history');
                return newMap;
            });
        } finally {
            setLoadingHistoryToken(null);
        }
    }, [publicClient, account?.signature, activeAccountKey, contextUserKey, tokenDataMap]);

    // Toggle history modal for a token
    const toggleHistory = useCallback((tokenAddress: string) => {
        const normalizedTokenAddress = tokenAddress.toLowerCase();
        if (historyModalToken === normalizedTokenAddress) {
            setHistoryModalToken(null);
        } else {
            setHistoryModalToken(normalizedTokenAddress);
            // Load history if not already loaded
            if (!tokenHistoryMap.has(normalizedTokenAddress)) {
                loadTokenHistory(normalizedTokenAddress);
            }
        }
    }, [historyModalToken, tokenHistoryMap, loadTokenHistory]);

    // Toggle discovery mode
    const handleModeToggle = useCallback(async (newMode: DiscoveryMode) => {
        if (!activeAccountKey) return;
        console.log('🔍 [MODAL] Mode changed to:', newMode);
        setDiscoveryMode(newMode);
        await saveDiscoveryMode(activeAccountKey, newMode);
        // Set flag to skip cache on next discovery
        setSkipCacheOnNextDiscovery(true);
        // Clear token data to trigger re-discovery with new mode
        setTokenDataMap(new Map());
        setArchonPositionsMap(new Map());
        // Clear converted assets for new mode
        setConvertedAssets(new Map());
        pendingConversionsRef.current.clear();
    }, [activeAccountKey]);

    // Fetch incoming notes count for each discovered token (on-chain only, no decrypt). Run only when discovery is idle to avoid loop/flicker.
    useEffect(() => {
        if (!isOpen || !publicClient || !activeAccountKey || tokenDataMap.size === 0 || isDiscoveringTokens.size > 0) return;

        let cancelled = false;
        const tokens = Array.from(tokenDataMap.keys());

        (async () => {
            try {
                const { x, y } = parseZkAddress(activeAccountKey!);
                const pubkeyHash = keccak256(
                    encodePacked(['uint256', 'uint256'], [x, y])
                ) as `0x${string}`;

                const next = new Map<string, number>();
                for (const tokenAddress of tokens) {
                    if (cancelled || isModalClosedRef.current) break;
                    try {
                        const count = await publicClient.readContract({
                            address: ArkanaAddress,
                            abi: ArkanaAbi,
                            functionName: 'getIncomingNotesCount',
                            args: [tokenAddress as Address, pubkeyHash],
                        }) as bigint;
                        next.set(tokenAddress, Number(count));
                    } catch {
                        next.set(tokenAddress, 0);
                    }
                }
                if (!cancelled && !isModalClosedRef.current) {
                    setIncomingNotesCountMap(next);
                }
            } catch {
                // invalid zkAddress or other
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isOpen, publicClient, activeAccountKey, tokenDataMap, isDiscoveringTokens.size]);

    // Clear "already fetched" ref when modal closes or account changes so we can re-fetch next time
    useEffect(() => {
        if (!isOpen) {
            fetchedIncomingNotesRef.current = new Set();
        }
    }, [isOpen, activeAccountKey]);

    // Fetch and decrypt incoming notes for tokens that have count > 0 (run only when count map changes, not when our own state updates)
    useEffect(() => {
        const hasCredentials = activeMultisigProfile ? !!effectiveUserKey : !!account?.signature;
        if (!isOpen || !hasCredentials || !activeAccountKey || !fetchIncomingNotes) return;

        const tokensToFetch = Array.from(incomingNotesCountMap.entries())
            .filter(([, count]) => count > 0)
            .filter(([token]) => !fetchedIncomingNotesRef.current.has(token))
            .map(([token]) => token);

        if (tokensToFetch.length === 0) return;

        tokensToFetch.forEach(t => fetchedIncomingNotesRef.current.add(t));

        let cancelled = false;
        (async () => {
            // For multisig, use the profile's userKey directly; otherwise derive from signature
            let userKey: bigint | null = effectiveUserKey ?? contextUserKey;
            if (!userKey && account?.signature) {
                try {
                    const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                    userKey = BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                } catch {
                    return;
                }
            }
            if (!userKey) return;

            const { x: receiverX, y: receiverY } = parseZkAddress(activeAccountKey!);
            setLoadingIncomingToken(prev => {
                const next = new Set(prev);
                tokensToFetch.forEach(t => next.add(t));
                return next;
            });

            const nextNotes = new Map<string, import('@/lib/indexeddb').IncomingNote[]>();
            for (const tokenAddress of tokensToFetch) {
                if (cancelled || isModalClosedRef.current) break;
                try {
                    const { notes } = await fetchIncomingNotes(
                        tokenAddress as `0x${string}`,
                        receiverX,
                        receiverY,
                        userKey
                    );
                    nextNotes.set(tokenAddress, notes);
                } catch (e) {
                    console.error('Failed to fetch incoming notes for', tokenAddress, e);
                }
            }
            if (!cancelled && !isModalClosedRef.current) {
                setIncomingNotesByToken(prev => {
                    const merged = new Map(prev);
                    nextNotes.forEach((notes, token) => merged.set(token, notes));
                    return merged;
                });
                const latestTokenData = tokenDataMapRef.current;
                const mode = discoveryMode;
                for (const tokenAddress of tokensToFetch) {
                    const notes = nextNotes.get(tokenAddress);
                    if (!notes?.length) continue;
                    const tokenData = latestTokenData.get(tokenAddress);
                    if (tokenData?.currentNonce != null) {
                        saveTokenAccountData(
                            activeAccountKey!,
                            tokenAddress,
                            tokenData.currentNonce,
                            tokenData.balanceEntries,
                            mode,
                            notes
                        ).catch(() => { });
                    }
                }
            }
            if (!cancelled) {
                setLoadingIncomingToken(prev => {
                    const next = new Set(prev);
                    tokensToFetch.forEach(t => next.delete(t));
                    return next;
                });
            }
        })();
        return () => { cancelled = true; };
    }, [isOpen, account?.signature, activeAccountKey, contextUserKey, fetchIncomingNotes, incomingNotesCountMap, discoveryMode]);

    // Reset token data when the active profile changes so discovery re-runs for the new profile.
    // Incrementing loadGenRef invalidates any in-flight loadSavedData calls from the previous profile.
    useEffect(() => {
        loadGenRef.current += 1;
        setTokenDataMap(new Map());
        setArchonPositionsMap(new Map());
        setConvertedAssets(new Map());
        fetchedIncomingNotesRef.current.clear();
    }, [activeAccountKey]);

    // Auto-discover tokens when modal opens
    useEffect(() => {
        if (isOpen) {
            isModalClosedRef.current = false;
            loadSavedData();
        }
    }, [isOpen, loadSavedData]);

    // Discover all tokens when Aave tokens are loaded or mode changes
    useEffect(() => {
        // For multisig profiles, effectiveUserKey replaces the signature requirement
        const hasCredentials = activeMultisigProfile ? !!effectiveUserKey : !!account?.signature;
        if (isOpen && activeAccountKey && hasCredentials && !isLoadingAaveTokens && aaveTokens.length > 0 && tokenDataMap.size === 0) {
            const timeoutId = setTimeout(() => {
                discoverAllTokens();
            }, 100); // Small delay to ensure modal is rendered

            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, activeAccountKey, activeMultisigProfile, effectiveUserKey, account?.signature, isLoadingAaveTokens, aaveTokens.length, tokenDataMap.size, discoverAllTokens]);

    if (!isOpen) return null;

    return (
    <>
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full min-w-0 p-4 sm:p-6">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 rounded-lg p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all z-10"
                    aria-label="Close"
                >
                    <X size={16} />
                </button>
                <DialogHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                            Account
                            {activeMultisigProfile ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/20">
                                    <Users className="w-3 h-3" /> {activeMultisigProfile.name || `Multisig ${activeMultisigProfile.threshold}-of-${activeMultisigProfile.maxSigners}`}
                                </span>
                            ) : profileType === 'single' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/50 border border-white/10">
                                    <Key className="w-3 h-3" /> Single Key
                                </span>
                            ) : profileType === '2fa' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/15 text-primary border border-primary/20">
                                    <Shield className="w-3 h-3" /> 2FA
                                </span>
                            ) : null}
                        </DialogTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">Mode:</span>
                            <div className="flex gap-1 border border-border rounded-lg p-0.5">
                                <Button
                                    size="sm"
                                    variant={discoveryMode === 'mage' ? 'default' : 'ghost'}
                                    onClick={() => handleModeToggle('mage')}
                                    className="h-7 px-2 sm:px-3 text-[10px] sm:text-xs"
                                >
                                    Mage
                                </Button>
                                <Button
                                    size="sm"
                                    variant={discoveryMode === 'archon' ? 'default' : 'ghost'}
                                    onClick={() => handleModeToggle('archon')}
                                    className="h-7 px-2 sm:px-3 text-[10px] sm:text-xs"
                                >
                                    Archon
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {!activeAccountKey && (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Please sign in to view your account.</p>
                            </CardContent>
                        </Card>
                    )}

                    {activeAccountKey && (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">Token Balances</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingSavedData && (
                                        <p className="text-xs text-muted-foreground mb-4">Loading saved data...</p>
                                    )}
                                    {isDiscoveringTokens.size > 0 && (
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Discovering {isDiscoveringTokens.size} token{isDiscoveringTokens.size > 1 ? 's' : ''}...
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {Array.from(tokenDataMap.entries()).length === 0 && !isDiscoveringTokens.size && !isLoadingSavedData && (
                                            <p className="text-xs text-muted-foreground">No tokens discovered yet. Discovery will start automatically.</p>
                                        )}
                                        {Array.from(tokenDataMap.entries()).map(([tokenAddress, tokenData]) => {
                                            // Find token info from aaveTokens
                                            const tokenInfo = aaveTokens.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
                                            const tokenName = tokenInfo?.name || 'Unknown Token';
                                            const tokenSymbol = tokenInfo?.symbol || tokenAddress.slice(0, 6) + '...' + tokenAddress.slice(-4);

                                            // Find the current balance (highest nonce entry)
                                            const currentNonce = tokenData.currentNonce || BigInt(0);
                                            const previousNonce = currentNonce > BigInt(0) ? currentNonce - BigInt(1) : BigInt(0);
                                            const currentBalanceEntry = tokenData.balanceEntries.find(entry => {
                                                const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
                                                return entryNonce === previousNonce;
                                            });


                                            return (
                                                <div
                                                    key={tokenAddress}
                                                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm overflow-hidden"
                                                >
                                                    {/* ── Card Header ─────────────────────────────────────────────────── */}
                                                    <div className="flex items-center justify-between px-4 pt-4 pb-3">
                                                        {/* Left: icon + name + address */}
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="shrink-0 w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
                                                                <TokenIcon symbol={tokenSymbol} size={20} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-semibold text-white tracking-tight">
                                                                        {tokenSymbol}
                                                                    </span>
                                                                    <span className="text-[10px] font-mono text-white/30 truncate">
                                                                        {tokenAddress.slice(0, 8)}…{tokenAddress.slice(-6)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[11px] text-white/40">{tokenName}</span>
                                                                    <span className="text-white/20 text-[10px]">·</span>
                                                                    {discoveryMode === 'archon' && archonPositionsMap.has(tokenAddress) ? (
                                                                        <span className="text-[11px] text-white/40">
                                                                            {archonPositionsMap.get(tokenAddress)!.length} position{archonPositionsMap.get(tokenAddress)!.length !== 1 ? 's' : ''}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[11px] text-white/40">
                                                                            Nonce&nbsp;
                                                                            <span className="text-white/60 font-mono">
                                                                                {tokenData.currentNonce?.toString() ?? "—"}
                                                                            </span>
                                                                        </span>
                                                                    )}
                                                                    {incomingNotesCountMap.has(tokenAddress) && (
                                                                        <>
                                                                            <span className="text-white/20 text-[10px]">·</span>
                                                                            <span className="text-[11px] text-violet-400/80">
                                                                                {incomingNotesCountMap.get(tokenAddress)} incoming
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right: action buttons */}
                                                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                                            <button
                                                                onClick={() => handleDiscoverToken(tokenAddress)}
                                                                disabled={isDiscoveringTokens.has(tokenAddress)}
                                                                className="
              h-7 px-3 rounded-lg text-[11px] font-medium
              border border-white/10 bg-white/[0.04] text-white/60
              hover:bg-white/[0.08] hover:text-white/90 hover:border-white/20
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150
            "
                                                            >
                                                                {isDiscoveringTokens.has(tokenAddress) ? (
                                                                    <span className="opacity-60">…</span>
                                                                ) : (
                                                                    "Refresh"
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleHistory(tokenAddress)}
                                                                disabled={loadingHistoryToken === tokenAddress}
                                                                className="
              h-7 px-3 rounded-lg text-[11px] font-medium
              border border-white/10 bg-white/[0.04] text-white/60
              hover:bg-white/[0.08] hover:text-white/90 hover:border-white/20
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150
              flex items-center gap-1
            "
                                                            >
                                                                <Clock size={11} className="opacity-60" />
                                                                {loadingHistoryToken === tokenAddress ? "…" : "History"}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* ── Balance Body ────────────────────────────────────────────────── */}
                                                    <div className="px-4 pb-4 space-y-2">

                                                        {/* ── Archon mode: per-position breakdown ─────────────────── */}
                                                        {discoveryMode === 'archon' && archonPositionsMap.has(tokenAddress) && (() => {
                                                            const positions = archonPositionsMap.get(tokenAddress)!;
                                                            const decimals = tokenInfo?.decimals || 18;
                                                            const totalKey = `${tokenAddress.toLowerCase()}-archon-total`;
                                                            const totalConverted = convertedAssets.get(totalKey);
                                                            const totalConverting = isConvertingAssets.has(totalKey);
                                                            const now = Math.floor(Date.now() / 1000);

                                                            const totalShares = positions.reduce((sum, pos) => {
                                                                const latest = pos.balanceEntries.length > 0 ? pos.balanceEntries[pos.balanceEntries.length - 1] : null;
                                                                return sum + (latest?.amount ?? BigInt(0));
                                                            }, BigInt(0));

                                                            return (
                                                                <div className="space-y-1.5">
                                                                    {/* Total balance */}
                                                                    {totalShares > BigInt(0) && (
                                                                        <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 flex items-center justify-between gap-4">
                                                                            <div>
                                                                                <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">
                                                                                    Total ({positions.length} position{positions.length !== 1 ? 's' : ''})
                                                                                </p>
                                                                                <p className="text-[11px] font-mono text-white/50">
                                                                                    {totalShares.toString()} <span className="text-white/25">shares</span>
                                                                                </p>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                {totalConverted !== undefined ? (
                                                                                    <p className="text-base font-semibold text-violet-300 tracking-tight">
                                                                                        ≈&thinsp;{formatTokenValue(totalConverted, decimals)} <span className="text-sm">{tokenSymbol}</span>
                                                                                    </p>
                                                                                ) : totalConverting ? (
                                                                                    <p className="text-xs text-white/30 italic">converting…</p>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Per-position breakdown */}
                                                                    <details className="group">
                                                                        <summary className="
                                                                            inline-flex items-center gap-1 cursor-pointer select-none
                                                                            text-[10px] text-white/35 hover:text-white/60
                                                                            border border-white/[0.06] rounded-md px-2 py-1
                                                                            hover:border-white/10 transition-colors
                                                                            list-none [&::-webkit-details-marker]:hidden
                                                                        ">
                                                                            <ChevronDown size={10} className="group-open:hidden opacity-50" />
                                                                            <ChevronUp size={10} className="hidden group-open:block opacity-50" />
                                                                            {positions.length} archon position{positions.length !== 1 ? 's' : ''}
                                                                        </summary>
                                                                        <div className="mt-1.5 rounded-lg border border-white/[0.06] bg-black/20 divide-y divide-white/[0.04] overflow-hidden">
                                                                            {positions.map((pos) => {
                                                                                const firstEntry = pos.balanceEntries.length > 0
                                                                                    ? pos.balanceEntries[0]
                                                                                    : null;
                                                                                const latestEntry = pos.balanceEntries.length > 0
                                                                                    ? pos.balanceEntries[pos.balanceEntries.length - 1]
                                                                                    : null;
                                                                                const posKey = `${tokenAddress.toLowerCase()}-archon-${pos.userKeyOffset.toString()}`;
                                                                                const posConverted = convertedAssets.get(posKey);
                                                                                const posConverting = isConvertingAssets.has(posKey);
                                                                                const unlockSec = Number(pos.unlockAt);
                                                                                const isLocked = unlockSec > 0 && unlockSec > now;
                                                                                const wasLocked = unlockSec > 0 && unlockSec <= now;
                                                                                const withdrawnShares = firstEntry && latestEntry && latestEntry.amount < firstEntry.amount
                                                                                    ? firstEntry.amount - latestEntry.amount
                                                                                    : BigInt(0);

                                                                                return (
                                                                                    <div key={pos.userKeyOffset.toString()} className="px-3 py-2.5 space-y-1">
                                                                                        <div className="flex items-center justify-between gap-3">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-[10px] font-mono text-white/40">
                                                                                                    Position #{pos.userKeyOffset.toString()}
                                                                                                </span>
                                                                                                <span className="text-[10px] font-mono text-white/50">
                                                                                                    {latestEntry ? `${latestEntry.amount.toString()} ` : '0 '}
                                                                                                    <span className="text-white/25">shares</span>
                                                                                                </span>
                                                                                                <span className="text-[9px] font-mono text-white/25">
                                                                                                    nonce {pos.currentNonce.toString()}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                                                {posConverted !== undefined && (
                                                                                                    <span className="text-[10px] text-violet-300/70 font-mono">
                                                                                                        ≈&thinsp;{formatTokenValue(posConverted, decimals)}
                                                                                                    </span>
                                                                                                )}
                                                                                                {posConverting && (
                                                                                                    <span className="text-[9px] text-white/20 italic">…</span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        {/* Withdrawn amount */}
                                                                                        {withdrawnShares > BigInt(0) && (
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <span className="text-[9px] text-rose-400/60">
                                                                                                    Withdrawn: {withdrawnShares.toString()} shares
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                        {/* Lock status */}
                                                                                        {isLocked ? (
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <Clock size={9} className="text-amber-400/60" />
                                                                                                <span className="text-[9px] text-amber-400/70">
                                                                                                    Locked until {new Date(unlockSec * 1000).toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                        ) : wasLocked ? (
                                                                                            <div className="flex items-center gap-1.5">
                                                                                                <span className="text-[9px] text-emerald-400/60">
                                                                                                    Unlocked since {new Date(unlockSec * 1000).toLocaleString()}
                                                                                                </span>
                                                                                            </div>
                                                                                        ) : null}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </details>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Available balance pill (Mage mode only) */}
                                                        {discoveryMode !== 'archon' && currentBalanceEntry && (() => {
                                                            const assetKey = `${tokenAddress.toLowerCase()}-${previousNonce.toString()}`;
                                                            const convertedValue = convertedAssets.get(assetKey);
                                                            const isConverting = isConvertingAssets.has(assetKey);
                                                            const decimals = tokenInfo?.decimals || 18;
                                                            return (
                                                                <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2.5 flex items-center justify-between gap-4">
                                                                    <div>
                                                                        <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">
                                                                            Available
                                                                        </p>
                                                                        <p className="text-[11px] font-mono text-white/50">
                                                                            {currentBalanceEntry.amount.toString()}{" "}
                                                                            <span className="text-white/25">shares</span>
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        {convertedValue !== undefined ? (
                                                                            <p className="text-base font-semibold text-violet-300 tracking-tight">
                                                                                ≈&thinsp;{formatTokenValue(convertedValue, decimals)}{" "}
                                                                                <span className="text-sm">{tokenSymbol}</span>
                                                                            </p>
                                                                        ) : isConverting ? (
                                                                            <p className="text-xs text-white/30 italic">converting…</p>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Incoming / To-be-absorbed block */}
                                                        {incomingNotesByToken.get(tokenAddress) &&
                                                            incomingNotesByToken.get(tokenAddress)!.length > 0 &&
                                                            (() => {
                                                                const notes = incomingNotesByToken.get(tokenAddress)!;
                                                                const sumShares = notes.reduce((acc, n) => acc + n.amount, BigInt(0));
                                                                const nullifier =
                                                                    (currentBalanceEntry as { nullifier?: bigint } | undefined)
                                                                        ?.nullifier ?? BigInt(0);
                                                                const absorbableShares =
                                                                    sumShares > nullifier ? sumShares - nullifier : BigInt(0);
                                                                const absorbableKey = `${tokenAddress.toLowerCase()}-absorbable`;
                                                                const absorbableConverted = convertedAssets.get(absorbableKey);
                                                                const absorbableConverting = isConvertingAssets.has(absorbableKey);
                                                                const decimals = tokenInfo?.decimals || 18;

                                                                return (
                                                                    <div className="rounded-lg bg-amber-500/[0.05] border border-amber-500/[0.15] px-3 py-2.5">
                                                                        <div className="flex items-center justify-between gap-4">
                                                                            <div className="min-w-0">
                                                                                <p className="text-[9px] font-semibold uppercase tracking-widest text-amber-400/60 mb-0.5">
                                                                                    To Be Absorbed
                                                                                </p>
                                                                                <p className="text-[11px] font-mono text-white/50">
                                                                                    {notes.length} note{notes.length !== 1 ? "s" : ""}
                                                                                    <span className="text-white/25 mx-1.5">·</span>
                                                                                    {sumShares.toString()}{" "}
                                                                                    <span className="text-white/25">shares</span>
                                                                                </p>
                                                                                {nullifier > BigInt(0) && (
                                                                                    <p className="text-[10px] font-mono text-white/30 mt-0.5">
                                                                                        Nullifier&nbsp;
                                                                                        <span className="text-white/20">{nullifier.toString()}</span>
                                                                                        <span className="text-white/20 mx-1">→</span>
                                                                                        Absorbable&nbsp;
                                                                                        <span className="text-white/40">
                                                                                            {absorbableShares.toString()} shares
                                                                                        </span>
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            <div className="text-right shrink-0">
                                                                                {absorbableConverted !== undefined ? (
                                                                                    <p className="text-base font-semibold text-amber-300 tracking-tight">
                                                                                        ≈&thinsp;{formatTokenValue(absorbableConverted, decimals)}{" "}
                                                                                        <span className="text-sm">{tokenSymbol}</span>
                                                                                    </p>
                                                                                ) : absorbableConverting ? (
                                                                                    <p className="text-xs text-white/30 italic">…</p>
                                                                                ) : null}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })()}

                                                        {/* Footer meta row */}
                                                        {(() => {
                                                            const uniqueEntries = new Map();
                                                            for (const entry of tokenData.balanceEntries) {
                                                                uniqueEntries.set(entry.nonce, entry);
                                                            }
                                                            const sortedEntries = Array.from(uniqueEntries.values()).sort((a, b) => {
                                                                const nonceA = typeof a.nonce === "string" ? BigInt(a.nonce) : a.nonce;
                                                                const nonceB = typeof b.nonce === "string" ? BigInt(b.nonce) : b.nonce;
                                                                if (nonceA < nonceB) return -1;
                                                                if (nonceA > nonceB) return 1;
                                                                return 0;
                                                            });
                                                            const decimals = tokenInfo?.decimals || 18;

                                                            return (
                                                                <>
                                                                    {/* Compact meta chips */}
                                                                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                                                        {/* Balance entries toggle */}
                                                                        <details className="group">
                                                                            <summary className="
                    inline-flex items-center gap-1 cursor-pointer select-none
                    text-[10px] text-white/35 hover:text-white/60
                    border border-white/[0.06] rounded-md px-2 py-1
                    hover:border-white/10 transition-colors
                    list-none [&::-webkit-details-marker]:hidden
                  ">
                                                                                <ChevronDown size={10} className="group-open:hidden opacity-50" />
                                                                                <ChevronUp size={10} className="hidden group-open:block opacity-50" />
                                                                                {sortedEntries.length} balance entr{sortedEntries.length === 1 ? "y" : "ies"}
                                                                            </summary>
                                                                            {sortedEntries.length > 0 && (
                                                                                <div className="mt-1.5 rounded-lg border border-white/[0.06] bg-black/20 divide-y divide-white/[0.04] overflow-hidden">
                                                                                    {sortedEntries.map((entry) => {
                                                                                        const entryNonce =
                                                                                            typeof entry.nonce === "string"
                                                                                                ? BigInt(entry.nonce)
                                                                                                : entry.nonce;
                                                                                        const isCurrent = entryNonce === previousNonce;
                                                                                        const assetKey = `${tokenAddress.toLowerCase()}-${entryNonce.toString()}`;
                                                                                        const convertedValue = convertedAssets.get(assetKey);
                                                                                        const isConverting = isConvertingAssets.has(assetKey);

                                                                                        return (
                                                                                            <div
                                                                                                key={entry.nonce.toString()}
                                                                                                className={`px-3 py-2 flex items-center justify-between gap-3 ${isCurrent ? "bg-violet-500/[0.05]" : ""
                                                                                                    }`}
                                                                                            >
                                                                                                <div className="flex items-center gap-2 min-w-0">
                                                                                                    <span className="text-[10px] font-mono text-white/30">
                                                                                                        #{entry.nonce.toString()}
                                                                                                    </span>
                                                                                                    <span className="text-[10px] font-mono text-white/50 truncate">
                                                                                                        {entry.amount.toString()}{" "}
                                                                                                        <span className="text-white/25">shares</span>
                                                                                                    </span>
                                                                                                    {(entry as { nullifier?: bigint }).nullifier != null && (
                                                                                                        <span className="text-[9px] font-mono text-white/20 truncate">
                                                                                                            nul: …
                                                                                                            {(entry as { nullifier?: bigint })
                                                                                                                .nullifier!.toString(16)
                                                                                                                .slice(-6)}
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                                                    {convertedValue !== undefined && (
                                                                                                        <span className="text-[10px] text-violet-300/70 font-mono">
                                                                                                            ≈&thinsp;{formatTokenValue(convertedValue, decimals)}
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {isConverting && (
                                                                                                        <span className="text-[9px] text-white/20 italic">…</span>
                                                                                                    )}
                                                                                                    {isCurrent && (
                                                                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300/70 font-medium">
                                                                                                            current
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </details>

                                                                        {/* Incoming notes chip */}
                                                                        {incomingNotesCountMap.get(tokenAddress) != null &&
                                                                            (incomingNotesCountMap.get(tokenAddress) ?? 0) > 0 && (
                                                                                <details className="group">
                                                                                    <summary className="
                        inline-flex items-center gap-1 cursor-pointer select-none
                        text-[10px] text-amber-400/50 hover:text-amber-400/80
                        border border-amber-500/20 rounded-md px-2 py-1
                        hover:border-amber-500/30 transition-colors
                        list-none [&::-webkit-details-marker]:hidden
                      ">
                                                                                        <ChevronDown size={10} className="group-open:hidden opacity-50" />
                                                                                        <ChevronUp size={10} className="hidden group-open:block opacity-50" />
                                                                                        {loadingIncomingToken.has(tokenAddress)
                                                                                            ? "Loading incoming…"
                                                                                            : `${incomingNotesCountMap.get(tokenAddress)} incoming note${(incomingNotesCountMap.get(tokenAddress) ?? 0) !== 1
                                                                                                ? "s"
                                                                                                : ""
                                                                                            }`}
                                                                                    </summary>
                                                                                    {!loadingIncomingToken.has(tokenAddress) &&
                                                                                        incomingNotesByToken.get(tokenAddress) && (
                                                                                            <div className="mt-1.5 rounded-lg border border-amber-500/10 bg-black/20 divide-y divide-white/[0.04] overflow-hidden">
                                                                                                {incomingNotesByToken.get(tokenAddress)!.map((note, idx) => {
                                                                                                    const assetKey = `${tokenAddress.toLowerCase()}-incoming-${idx}`;
                                                                                                    const convertedValue = convertedAssets.get(assetKey);
                                                                                                    const isConverting = isConvertingAssets.has(assetKey);
                                                                                                    const decimals = tokenInfo?.decimals || 18;
                                                                                                    return (
                                                                                                        <div
                                                                                                            key={idx}
                                                                                                            className="px-3 py-2 flex items-center justify-between gap-3"
                                                                                                        >
                                                                                                            <span className="text-[10px] font-mono text-white/40">
                                                                                                                Note #{idx} · {note.amount.toString()} shares
                                                                                                            </span>
                                                                                                            {convertedValue !== undefined && (
                                                                                                                <span className="text-[10px] text-amber-300/70 font-mono">
                                                                                                                    ≈&thinsp;{formatTokenValue(convertedValue, decimals)}{" "}
                                                                                                                    {tokenSymbol}
                                                                                                                </span>
                                                                                                            )}
                                                                                                            {isConverting && (
                                                                                                                <span className="text-[9px] text-white/20 italic">…</span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        )}
                                                                                </details>
                                                                            )}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}

                                                        {/* Discovery error */}
                                                        {discoveryErrors.has(tokenAddress) && (
                                                            <p className="text-[11px] text-red-400/70 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                                                                {discoveryErrors.get(tokenAddress)}
                                                            </p>
                                                        )}
                                                    </div>

                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {dataLastSaved && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-muted-foreground">
                                            Last saved: {new Date(dataLastSaved).toLocaleString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ── Multisig Accounts ────────────────────────────────────────── */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Users className="w-4 h-4 text-sky-400/60" />
                                            Multisig Accounts
                                        </CardTitle>
                                        {/* Signer mode: can't create new multisigs without a wallet */}
                                        {!isSignerMode && (
                                            <button
                                                onClick={() => setMultisigWizardOpen(true)}
                                                className="
                                                    inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium
                                                    border border-sky-500/20 bg-sky-500/10 text-sky-300/70
                                                    hover:bg-sky-500/15 hover:text-sky-300 hover:border-sky-500/30
                                                    transition-all duration-150
                                                "
                                            >
                                                <Plus className="w-3 h-3" /> Add Multisig
                                            </button>
                                        )}
                                    </div>
                                    {isSignerMode && (
                                        <p className="text-[10px] text-sky-400/60 mt-1">
                                            Signer mode — connect a wallet to create or join new multisig groups.
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {availableMultisigs.length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic">
                                            No multisig accounts yet. Create or join one to get started.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {availableMultisigs.map(ms => {
                                                const isActive = activeProfileId === ms.profileId;
                                                return (
                                                    <div
                                                        key={ms.profileId}
                                                        className={`
                                                            rounded-xl border px-4 py-3 flex items-center justify-between gap-3
                                                            ${isActive
                                                                ? 'border-sky-500/30 bg-sky-500/[0.06]'
                                                                : 'border-white/[0.06] bg-white/[0.02]'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {ms.role === 'initiator'
                                                                ? <Crown className="w-4 h-4 text-amber-400/60 shrink-0" />
                                                                : <UserPlus className="w-4 h-4 text-sky-400/60 shrink-0" />
                                                            }
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-white/90 truncate">{ms.name}</p>
                                                                <p className="text-[10px] text-white/40 font-mono">
                                                                    {ms.threshold}-of-{ms.maxSigners} · {ms.role}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {isActive && (
                                                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300/70 font-medium">
                                                                    active
                                                                </span>
                                                            )}
                                                            {!isActive && (
                                                                <button
                                                                    onClick={() => {
                                                                        switchProfile(ms.profileId);
                                                                        onClose();
                                                                    }}
                                                                    className="
                                                                        h-7 px-3 rounded-lg text-[11px] font-medium
                                                                        border border-white/10 bg-white/[0.04] text-white/60
                                                                        hover:bg-white/[0.08] hover:text-white/90
                                                                        transition-all duration-150
                                                                    "
                                                                >
                                                                    Switch
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </DialogContent>

            <MultisigSetupWizard
                open={multisigWizardOpen}
                onClose={() => { setMultisigWizardOpen(false); refreshProfiles(); }}
            />
        </Dialog>

        {/* ── History Modal (on top of AccountModal) ──────────────────────── */}
        {historyModalToken && (() => {
            const tokenAddress = historyModalToken;
            const tokenInfo = aaveTokens.find(t => t.address.toLowerCase() === tokenAddress);
            const tokenSymbol = tokenInfo?.symbol ?? tokenAddress.slice(0, 6);
            const history = tokenHistoryMap.get(tokenAddress) || [];
            const typeColors: Record<string, string> = {
                initialize: "text-sky-400/70 bg-sky-500/10 border-sky-500/20",
                deposit: "text-emerald-400/70 bg-emerald-500/10 border-emerald-500/20",
                send: "text-orange-400/70 bg-orange-500/10 border-orange-500/20",
                withdraw: "text-red-400/70 bg-red-500/10 border-red-500/20",
                absorb_send: "text-violet-400/70 bg-violet-500/10 border-violet-500/20",
                absorb_withdraw: "text-pink-400/70 bg-pink-500/10 border-pink-500/20",
                absorb: "text-amber-400/70 bg-amber-500/10 border-amber-500/20",
            };
            return (
                <Dialog open={true} onOpenChange={() => setHistoryModalToken(null)}>
                    <DialogContent className="max-w-lg w-[95vw] sm:w-[500px] max-h-[80vh] overflow-y-auto">
                        <button
                            onClick={() => setHistoryModalToken(null)}
                            className="absolute top-3 right-3 rounded-lg p-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all z-10"
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                        <DialogHeader className="pb-3">
                            <DialogTitle className="text-sm font-sans tracking-wider uppercase text-center"
                                style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
                                {tokenSymbol} History
                            </DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-end mb-3">
                            <button
                                onClick={() => loadTokenHistory(tokenAddress)}
                                disabled={loadingHistoryToken === tokenAddress}
                                className="h-6 px-2 rounded text-[10px] border border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20 disabled:opacity-40 transition-all"
                            >
                                {loadingHistoryToken === tokenAddress ? "Loading…" : "Refresh"}
                            </button>
                        </div>
                        {historyErrors.has(tokenAddress) && (
                            <p className="text-[11px] text-red-400/70 bg-red-500/10 rounded-lg px-3 py-2 mb-3 border border-red-500/20">
                                {historyErrors.get(tokenAddress)}
                            </p>
                        )}
                        {loadingHistoryToken === tokenAddress ? (
                            <p className="text-[11px] text-white/30 italic py-4 text-center">Loading history…</p>
                        ) : history.length === 0 ? (
                            <p className="text-[11px] text-white/30 italic py-4 text-center">No transaction history found.</p>
                        ) : (
                            <div className="space-y-1.5">
                                {history.map((entry, idx) => {
                                    const label = entry.type.replace(/_/g, " ").toUpperCase();
                                    const colorClass = typeColors[entry.type] || "text-white/40 bg-white/[0.04] border-white/[0.06]";
                                    return (
                                        <div key={idx} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-[10px] font-mono text-white/30">#{entry.nonce.toString()}</span>
                                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${colorClass}`}>{label}</span>
                                                {entry.blockNumber > BigInt(0) && (
                                                    <span className="text-[9px] text-white/20 font-mono ml-auto">Block {entry.blockNumber.toString()}</span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
                                                <span className="text-[10px] font-mono text-white/40">
                                                    {entry.amount.toString()} <span className="text-white/20">shares</span>
                                                </span>
                                                {entry.sharesMinted && entry.sharesMinted > BigInt(0) && (
                                                    <span className="text-[10px] font-mono text-emerald-400/60">+{entry.sharesMinted.toString()} minted</span>
                                                )}
                                                {entry.transactionHash && (
                                                    <span className="text-[10px] font-mono text-white/25">
                                                        {entry.transactionHash.slice(0, 8)}…{entry.transactionHash.slice(-6)}
                                                    </span>
                                                )}
                                                {entry.timestamp > BigInt(0) && (
                                                    <span className="text-[10px] text-white/25">
                                                        {new Date(Number(entry.timestamp) * 1000).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            );
        })()}
    </>
    );
}

