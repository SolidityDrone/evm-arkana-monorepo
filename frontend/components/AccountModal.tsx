'use client';

import { useNonceDiscovery, BalanceEntry } from '@/hooks/useNonceDiscovery';
import { useZkAddress, useAccount } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { Address, formatUnits, keccak256, encodePacked } from 'viem';
import { saveTokenAccountData, loadTokenAccountData, TokenAccountData, getTokenAddresses, loadAccountData, AccountData, DiscoveryMode, saveDiscoveryMode } from '@/lib/indexeddb';
import { parseZkAddress } from '@/lib/zk-address';
import { ARKANA_ADDRESS as ArkanaAddress, ARKANA_ABI as ArkanaAbi } from '@/lib/abi/ArkanaConst';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { reconstructTokenHistory, TransactionHistoryEntry } from '@/lib/transaction-history';
import { computePrivateKeyFromSignature } from '@/lib/circuit-utils';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { TokenIcon } from '@/lib/token-icons';
import { convertSharesToAssets } from '@/lib/shares-to-assets';

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
    const [expandedHistoryToken, setExpandedHistoryToken] = useState<string | null>(null);
    const [tokenHistoryMap, setTokenHistoryMap] = useState<Map<string, TransactionHistoryEntry[]>>(new Map());
    const [loadingHistoryToken, setLoadingHistoryToken] = useState<string | null>(null);
    const [historyErrors, setHistoryErrors] = useState<Map<string, string>>(new Map());
    const [discoveryMode, setDiscoveryMode] = useState<DiscoveryMode>('mage');
    const [skipCacheOnNextDiscovery, setSkipCacheOnNextDiscovery] = useState(false);
    // Map of "tokenAddress-nonce" -> converted asset value (bigint)
    const [convertedAssets, setConvertedAssets] = useState<Map<string, bigint>>(new Map());
    const [isConvertingAssets, setIsConvertingAssets] = useState<Set<string>>(new Set());
    // Incoming notes count per token (tokenAddress -> count)
    const [incomingNotesCountMap, setIncomingNotesCountMap] = useState<Map<string, number>>(new Map());
    // Decrypted incoming notes per token (tokenAddress -> IncomingNote[])
    const [incomingNotesByToken, setIncomingNotesByToken] = useState<Map<string, import('@/lib/indexeddb').IncomingNote[]>>(new Map());
    const [loadingIncomingToken, setLoadingIncomingToken] = useState<Set<string>>(new Set());
    const fetchedIncomingNotesRef = useRef<Set<string>>(new Set());
    const tokenDataMapRef = useRef<Map<string, TokenAccountData>>(new Map());

    const isModalClosedRef = useRef(false);

    useEffect(() => {
        tokenDataMapRef.current = tokenDataMap;
    }, [tokenDataMap]);

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
        if (!publicClient || tokenDataMap.size === 0) return;

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
    }, [publicClient, tokenDataMap, incomingNotesByToken, convertedAssets, isConvertingAssets]);

    const loadSavedData = useCallback(async () => {
        if (!zkAddress) return;

        try {
            setIsLoadingSavedData(true);
            const savedData = await loadAccountData(zkAddress);

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
            setIsLoadingSavedData(false);
        }
    }, [zkAddress, setCurrentNonce, setBalanceEntries]);

    // Discover nonce for all Aave tokens
    const discoverAllTokens = useCallback(async () => {
        if (!publicClient || !account?.signature || !zkAddress) {
            return;
        }

        // Wait for Aave tokens to load
        if (isLoadingAaveTokens) {
            return;
        }

        if (aaveTokens.length === 0) {
            return;
        }

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
            if (isModalClosedRef.current) {
                break;
            }

            try {
                let cachedNonce: bigint | null = null;
                let cachedBalanceEntries: BalanceEntry[] = [];

                // Only use cache if we're not skipping it
                if (!shouldSkipCache) {
                    // Reload cached data before each token to get the latest state
                    const cachedData = await loadAccountData(zkAddress);
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
                    await saveTokenAccountData(zkAddress, token.address, result.currentNonce, result.balanceEntries, discoveryMode);

                    newTokenDataMap.set(token.address.toLowerCase(), {
                        tokenAddress: token.address,
                        currentNonce: result.currentNonce,
                        balanceEntries: result.balanceEntries,
                        lastUpdated: Date.now(),
                    });

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

        if (!isModalClosedRef.current) {
            setTokenDataMap(newTokenDataMap);
            setDataLastSaved(Date.now());
        }
    }, [publicClient, account?.signature, zkAddress, isLoadingAaveTokens, aaveTokens, computeCurrentNonce, discoveryMode, skipCacheOnNextDiscovery]);

    const handleDiscoverToken = useCallback(async (tokenAddress: string) => {
        if (!zkAddress || !publicClient || !account?.signature || isModalClosedRef.current) {
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
            const cachedTokenData = await loadTokenAccountData(zkAddress, normalizedTokenAddress, discoveryMode);
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
                    zkAddress,
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
    }, [zkAddress, publicClient, account?.signature, computeCurrentNonce, setCurrentNonce, setBalanceEntries, discoveryMode]);

    // Load transaction history for a specific token
    const loadTokenHistory = useCallback(async (tokenAddress: string) => {
        if (!publicClient || !account?.signature || !zkAddress || isModalClosedRef.current) {
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
            // Get userKey
            let userKey: bigint | null = contextUserKey;
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
    }, [publicClient, account?.signature, zkAddress, contextUserKey, tokenDataMap]);

    // Toggle history view for a token
    const toggleHistory = useCallback((tokenAddress: string) => {
        const normalizedTokenAddress = tokenAddress.toLowerCase();
        if (expandedHistoryToken === normalizedTokenAddress) {
            setExpandedHistoryToken(null);
        } else {
            setExpandedHistoryToken(normalizedTokenAddress);
            // Load history if not already loaded
            if (!tokenHistoryMap.has(normalizedTokenAddress)) {
                loadTokenHistory(normalizedTokenAddress);
            }
        }
    }, [expandedHistoryToken, tokenHistoryMap, loadTokenHistory]);

    // Toggle discovery mode
    const handleModeToggle = useCallback(async (newMode: DiscoveryMode) => {
        if (!zkAddress) return;
        console.log('🔍 [MODAL] Mode changed to:', newMode);
        setDiscoveryMode(newMode);
        await saveDiscoveryMode(zkAddress, newMode);
        // Set flag to skip cache on next discovery
        setSkipCacheOnNextDiscovery(true);
        // Clear token data to trigger re-discovery with new mode
        setTokenDataMap(new Map());
        // Clear converted assets for new mode
        setConvertedAssets(new Map());
        pendingConversionsRef.current.clear();
    }, [zkAddress]);

    // Fetch incoming notes count for each discovered token (on-chain only, no decrypt). Run only when discovery is idle to avoid loop/flicker.
    useEffect(() => {
        if (!isOpen || !publicClient || !zkAddress || tokenDataMap.size === 0 || isDiscoveringTokens.size > 0) return;

        let cancelled = false;
        const tokens = Array.from(tokenDataMap.keys());

        (async () => {
            try {
                const { x, y } = parseZkAddress(zkAddress);
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
    }, [isOpen, publicClient, zkAddress, tokenDataMap, isDiscoveringTokens.size]);

    // Clear "already fetched" ref when modal closes or account changes so we can re-fetch next time
    useEffect(() => {
        if (!isOpen) {
            fetchedIncomingNotesRef.current = new Set();
        }
    }, [isOpen, zkAddress]);

    // Fetch and decrypt incoming notes for tokens that have count > 0 (run only when count map changes, not when our own state updates)
    useEffect(() => {
        if (!isOpen || !account?.signature || !zkAddress || !fetchIncomingNotes) return;

        const tokensToFetch = Array.from(incomingNotesCountMap.entries())
            .filter(([, count]) => count > 0)
            .filter(([token]) => !fetchedIncomingNotesRef.current.has(token))
            .map(([token]) => token);

        if (tokensToFetch.length === 0) return;

        tokensToFetch.forEach(t => fetchedIncomingNotesRef.current.add(t));

        let cancelled = false;
        (async () => {
            let userKey: bigint | null = contextUserKey;
            if (!userKey && account?.signature) {
                try {
                    const userKeyHex = await computePrivateKeyFromSignature(account.signature);
                    userKey = BigInt(userKeyHex.startsWith('0x') ? userKeyHex : '0x' + userKeyHex);
                } catch {
                    return;
                }
            }
            if (!userKey) return;

            const { x: receiverX, y: receiverY } = parseZkAddress(zkAddress);
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
                            zkAddress,
                            tokenAddress,
                            tokenData.currentNonce,
                            tokenData.balanceEntries,
                            mode,
                            notes
                        ).catch(() => {});
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
    }, [isOpen, account?.signature, zkAddress, contextUserKey, fetchIncomingNotes, incomingNotesCountMap, discoveryMode]);

    // Auto-discover tokens when modal opens
    useEffect(() => {
        if (isOpen) {
            isModalClosedRef.current = false;
            loadSavedData();
        }
    }, [isOpen, loadSavedData]);

    // Discover all tokens when Aave tokens are loaded or mode changes
    useEffect(() => {
        if (isOpen && zkAddress && account?.signature && !isLoadingAaveTokens && aaveTokens.length > 0 && tokenDataMap.size === 0) {
            const timeoutId = setTimeout(() => {
                discoverAllTokens();
            }, 100); // Small delay to ensure modal is rendered

            return () => clearTimeout(timeoutId);
        }
    }, [isOpen, zkAddress, account?.signature, isLoadingAaveTokens, aaveTokens.length, tokenDataMap.size, discoverAllTokens]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto w-[95vw] sm:w-full min-w-0 p-4 sm:p-6">
                <DialogHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <DialogTitle className="text-lg sm:text-xl">Account</DialogTitle>
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
                    {!zkAddress && (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-sm text-muted-foreground">Please sign in to view your account.</p>
                            </CardContent>
                        </Card>
                    )}

                    {zkAddress && (
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
                                                <div key={tokenAddress} className="border border-border/40 rounded-xl p-3 sm:p-4">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <TokenIcon symbol={tokenSymbol} size={20} />
                                                                <p className="text-sm font-semibold text-foreground">
                                                                    {tokenSymbol}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {tokenName}
                                                            </p>
                                                            <p className="text-[9px] sm:text-[10px] font-mono text-muted-foreground/50 mt-1 truncate">
                                                                {tokenAddress.slice(0, 10)}...{tokenAddress.slice(-8)}
                                                            </p>
                                                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">
                                                                Nonce: {tokenData.currentNonce?.toString() || 'N/A'}
                                                                {incomingNotesCountMap.has(tokenAddress) && (
                                                                    <span className="ml-2 text-primary">
                                                                        · Incoming: {incomingNotesCountMap.get(tokenAddress)}
                                                                    </span>
                                                                )}
                                                            </p>
                                                            {/* Available balance (current state) */}
                                                            {currentBalanceEntry && (() => {
                                                                const assetKey = `${tokenAddress.toLowerCase()}-${previousNonce.toString()}`;
                                                                const convertedValue = convertedAssets.get(assetKey);
                                                                const isConverting = isConvertingAssets.has(assetKey);
                                                                const decimals = tokenInfo?.decimals || 18;
                                                                return (
                                                                    <div className="text-[10px] sm:text-xs text-foreground font-semibold mt-1">
                                                                        <p className="text-muted-foreground text-[9px] uppercase tracking-wider">available</p>
                                                                        <p className="break-words">{currentBalanceEntry.amount.toString()} shares</p>
                                                                        {convertedValue !== undefined ? (
                                                                            <p className="text-primary mt-0.5 text-sm sm:text-base font-bold">
                                                                                ≈ {formatTokenValue(convertedValue, decimals)} {tokenSymbol}
                                                                            </p>
                                                                        ) : isConverting ? (
                                                                            <p className="text-muted-foreground mt-0.5">Converting...</p>
                                                                        ) : null}
                                                                    </div>
                                                                );
                                                            })()}
                                                            {/* To be absorbed: sum of incoming note shares minus nullifier (already absorbed) = absorbable */}
                                                            {incomingNotesByToken.get(tokenAddress) && incomingNotesByToken.get(tokenAddress)!.length > 0 && (() => {
                                                                const notes = incomingNotesByToken.get(tokenAddress)!;
                                                                const sumShares = notes.reduce((acc, n) => acc + n.amount, BigInt(0));
                                                                const nullifier = (currentBalanceEntry as { nullifier?: bigint } | undefined)?.nullifier ?? BigInt(0);
                                                                const absorbableShares = sumShares > nullifier ? sumShares - nullifier : BigInt(0);
                                                                const absorbableKey = `${tokenAddress.toLowerCase()}-absorbable`;
                                                                const absorbableConverted = convertedAssets.get(absorbableKey);
                                                                const absorbableConverting = isConvertingAssets.has(absorbableKey);
                                                                const decimals = tokenInfo?.decimals || 18;
                                                                return (
                                                                    <div className="text-[10px] sm:text-xs mt-2 pt-2 border-t border-border/40">
                                                                        <p className="text-muted-foreground text-[9px] uppercase tracking-wider">to be absorbed</p>
                                                                        <p className="break-words">sum of {notes.length} note{notes.length !== 1 ? 's' : ''}: {sumShares.toString()} shares</p>
                                                                        {nullifier > BigInt(0) && (
                                                                            <p className="text-muted-foreground text-[9px]">minus nullifier (already absorbed): {nullifier.toString()} → absorbable: {absorbableShares.toString()} shares</p>
                                                                        )}
                                                                        <p className="break-words font-medium text-foreground mt-0.5">absorbable: {absorbableShares.toString()} shares</p>
                                                                        {absorbableConverted !== undefined ? (
                                                                            <p className="text-primary mt-0.5 font-semibold">≈ {formatTokenValue(absorbableConverted, decimals)} {tokenSymbol}</p>
                                                                        ) : absorbableConverting ? (
                                                                            <p className="text-muted-foreground mt-0.5">…</p>
                                                                        ) : null}
                                                                    </div>
                                                                );
                                                            })()}
                                                            <details className="mt-2">
                                                                {(() => {
                                                                    // Remove duplicates by keeping the last entry for each nonce (fixes wrong count when duplicates exist)
                                                                    const uniqueEntries = new Map<string | bigint, typeof tokenData.balanceEntries[0]>();
                                                                    for (const entry of tokenData.balanceEntries) {
                                                                        uniqueEntries.set(entry.nonce, entry);
                                                                    }
                                                                    const sortedEntries = Array.from(uniqueEntries.values()).sort((a, b) => {
                                                                        const nonceA = typeof a.nonce === 'string' ? BigInt(a.nonce) : a.nonce;
                                                                        const nonceB = typeof b.nonce === 'string' ? BigInt(b.nonce) : b.nonce;
                                                                        if (nonceA < nonceB) return -1;
                                                                        if (nonceA > nonceB) return 1;
                                                                        return 0;
                                                                    });
                                                                    const decimals = tokenInfo?.decimals || 18;
                                                                    return (
                                                                        <>
                                                                        <summary className="text-[10px] sm:text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                                                            {sortedEntries.length} balance entries
                                                                        </summary>
                                                                        {sortedEntries.length > 0 && (
                                                                        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                                                            {sortedEntries.map((entry) => {
                                                                                const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
                                                                                const isCurrent = entryNonce === previousNonce;
                                                                                const assetKey = `${tokenAddress.toLowerCase()}-${entryNonce.toString()}`;
                                                                                const convertedValue = convertedAssets.get(assetKey);
                                                                                const isConverting = isConvertingAssets.has(assetKey);
                                                                                
                                                                                return (
                                                                                    <div 
                                                                                        key={`${tokenAddress}-nonce-${entry.nonce.toString()}`} 
                                                                                        className={`text-[10px] sm:text-xs font-mono ${isCurrent ? 'font-semibold text-foreground bg-primary/10 px-2 py-1 rounded-lg border border-primary/20' : 'text-muted-foreground px-2'}`}
                                                                                    >
                                                                                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline gap-0.5 sm:gap-x-2">
                                                                                            <span className="font-medium">#{entry.nonce.toString()}</span>
                                                                                            <span className={isCurrent ? 'text-primary' : ''}>
                                                                                                {entry.amount.toString()}
                                                                                            </span>
                                                                                            {convertedValue !== undefined && (
                                                                                                <span className={`${isCurrent ? 'text-primary/80' : 'text-muted-foreground/80'}`}>
                                                                                                    ≈ {formatTokenValue(convertedValue, decimals)}
                                                                                                </span>
                                                                                            )}
                                                                                            {isConverting && (
                                                                                                <span className="text-muted-foreground/60">...</span>
                                                                                            )}
                                                                                            {isCurrent && <span className="text-accent text-[9px]">current</span>}
                                                                                            {(entry as { nullifier?: bigint }).nullifier != null && (
                                                                                                <span className="text-muted-foreground/70 text-[9px] font-mono ml-1" title={(entry as { nullifier?: bigint }).nullifier!.toString()}>
                                                                                                    nullifier: 0x…{(entry as { nullifier?: bigint }).nullifier!.toString(16).slice(-8)}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                        )}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </details>
                                                            {/* Incoming notes (decrypted) */}
                                                            {incomingNotesCountMap.get(tokenAddress) != null && (incomingNotesCountMap.get(tokenAddress) ?? 0) > 0 && (
                                                                <details className="mt-2">
                                                                    <summary className="text-[10px] sm:text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                                                        {loadingIncomingToken.has(tokenAddress)
                                                                            ? `Incoming notes: loading...`
                                                                            : `${incomingNotesCountMap.get(tokenAddress)} incoming note${(incomingNotesCountMap.get(tokenAddress) ?? 0) !== 1 ? 's' : ''}`}
                                                                    </summary>
                                                                    {!loadingIncomingToken.has(tokenAddress) && incomingNotesByToken.get(tokenAddress) && (() => {
                                                                        const notes = incomingNotesByToken.get(tokenAddress)!;
                                                                        const decimals = tokenInfo?.decimals || 18;
                                                                        return (
                                                                            <div className="mt-2 space-y-1 max-h-28 overflow-y-auto">
                                                                                {notes.map((note, idx) => {
                                                                                    const assetKey = `${tokenAddress.toLowerCase()}-incoming-${idx}`;
                                                                                    const convertedValue = convertedAssets.get(assetKey);
                                                                                    const isConverting = isConvertingAssets.has(assetKey);
                                                                                    return (
                                                                                        <div key={`incoming-${tokenAddress}-${idx}`} className="text-[10px] sm:text-xs font-mono text-muted-foreground px-2 py-1 rounded border border-border/40">
                                                                                            <span className="font-medium text-foreground">Note #{idx}</span>
                                                                                            {' '}
                                                                                            <span>{note.amount.toString()} shares</span>
                                                                                            {convertedValue !== undefined && (
                                                                                                <span className="ml-1 text-primary">≈ {formatTokenValue(convertedValue, decimals)} {tokenSymbol}</span>
                                                                                            )}
                                                                                            {isConverting && <span className="ml-1 text-muted-foreground">…</span>}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </details>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 flex-shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDiscoverToken(tokenAddress)}
                                                                disabled={isDiscoveringTokens.has(tokenAddress)}
                                                                className="text-[10px] sm:text-xs px-2 sm:px-3 h-8"
                                                            >
                                                                {isDiscoveringTokens.has(tokenAddress) ? '...' : 'Refresh'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => toggleHistory(tokenAddress)}
                                                                disabled={loadingHistoryToken === tokenAddress}
                                                                className="text-[10px] sm:text-xs px-2 sm:px-3 h-8"
                                                            >
                                                                {loadingHistoryToken === tokenAddress ? (
                                                                    '...'
                                                                ) : expandedHistoryToken === tokenAddress.toLowerCase() ? (
                                                                    <>
                                                                        <ChevronUp className="w-3 h-3 sm:mr-1" />
                                                                        <span className="hidden sm:inline">Hide</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Clock className="w-3 h-3 sm:mr-1" />
                                                                        <span className="hidden sm:inline">History</span>
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {discoveryErrors.has(tokenAddress) && (
                                                        <p className="text-xs text-red-500 mt-2">
                                                            {discoveryErrors.get(tokenAddress)}
                                                        </p>
                                                    )}
                                                    
                                                    {/* Transaction History */}
                                                    {expandedHistoryToken === tokenAddress.toLowerCase() && (
                                                        <div className="mt-4 pt-4 border-t border-border/30">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-xs font-sans font-bold text-foreground uppercase tracking-wider">
                                                                    Transaction History
                                                                </p>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => loadTokenHistory(tokenAddress)}
                                                                    disabled={loadingHistoryToken === tokenAddress}
                                                                    className="h-6 px-2 text-xs"
                                                                >
                                                                    {loadingHistoryToken === tokenAddress ? 'Loading...' : 'Refresh'}
                                                                </Button>
                                                            </div>
                                                            
                                                            {historyErrors.has(tokenAddress) && (
                                                                <p className="text-xs text-red-500 mb-2">
                                                                    {historyErrors.get(tokenAddress)}
                                                                </p>
                                                            )}
                                                            
                                                            {loadingHistoryToken === tokenAddress ? (
                                                                <p className="text-xs text-muted-foreground">Loading history...</p>
                                                            ) : (() => {
                                                                const history = tokenHistoryMap.get(tokenAddress.toLowerCase()) || [];
                                                                if (history.length === 0) {
                                                                    return (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            No transaction history found.
                                                                        </p>
                                                                    );
                                                                }
                                                                
                                                                return (
                                                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                                                        {history.map((entry, idx) => {
                                                                            const getTypeLabel = (type: string) => {
                                                                                switch (type) {
                                                                                    case 'initialize': return 'INITIALIZE';
                                                                                    case 'deposit': return 'DEPOSIT';
                                                                                    case 'send': return 'SEND';
                                                                                    case 'withdraw': return 'WITHDRAW';
                                                                                    case 'absorb_send': return 'ABSORB + SEND';
                                                                                    case 'absorb_withdraw': return 'ABSORB + WITHDRAW';
                                                                                    case 'absorb': return 'ABSORB';
                                                                                    default: return type.toUpperCase();
                                                                                }
                                                                            };
                                                                            
                                                                            return (
                                                                                <div 
                                                                                    key={idx} 
                                                                                    className="text-xs font-mono border border-primary/20 bg-card/30 p-2 rounded"
                                                                                >
                                                                                    <div className="flex justify-between items-start mb-1">
                                                                                        <span className="font-bold text-foreground">
                                                                                            #{entry.nonce.toString()} - {getTypeLabel(entry.type)}
                                                                                        </span>
                                                                                        {entry.blockNumber > BigInt(0) && (
                                                                                            <span className="text-muted-foreground text-[10px]">
                                                                                                Block {entry.blockNumber.toString()}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="text-muted-foreground">
                                                                                        <p>Amount: {entry.amount.toString()} shares</p>
                                                                                        {entry.sharesMinted && entry.sharesMinted > BigInt(0) && (
                                                                                            <p className="text-[10px]">+{entry.sharesMinted.toString()} minted</p>
                                                                                        )}
                                                                                        {entry.transactionHash && (
                                                                                            <p className="text-[10px] break-all mt-1">
                                                                                                TX: {entry.transactionHash.slice(0, 10)}...{entry.transactionHash.slice(-8)}
                                                                                            </p>
                                                                                        )}
                                                                                        {entry.timestamp > BigInt(0) && (
                                                                                            <p className="text-[10px] mt-1">
                                                                                                {new Date(Number(entry.timestamp) * 1000).toLocaleString()}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
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
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

