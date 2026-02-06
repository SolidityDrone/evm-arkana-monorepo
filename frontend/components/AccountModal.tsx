'use client';

import { useNonceDiscovery, BalanceEntry } from '@/hooks/useNonceDiscovery';
import { useZkAddress, useAccount } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { usePublicClient } from 'wagmi';
import { Address, formatUnits } from 'viem';
import { saveTokenAccountData, loadTokenAccountData, TokenAccountData, getTokenAddresses, loadAccountData, AccountData, DiscoveryMode, saveDiscoveryMode } from '@/lib/indexeddb';
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

    const isModalClosedRef = useRef(false);

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
    }, [publicClient, tokenDataMap, convertedAssets, isConvertingAssets]);

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-full min-w-0">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Account Management</DialogTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono uppercase">Mode:</span>
                            <div className="flex gap-1 border border-border rounded p-0.5">
                                <Button
                                    size="sm"
                                    variant={discoveryMode === 'mage' ? 'default' : 'ghost'}
                                    onClick={() => handleModeToggle('mage')}
                                    className="h-7 px-3 text-xs"
                                >
                                    Mage
                                </Button>
                                <Button
                                    size="sm"
                                    variant={discoveryMode === 'archon' ? 'default' : 'ghost'}
                                    onClick={() => handleModeToggle('archon')}
                                    className="h-7 px-3 text-xs"
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
                                                <div key={tokenAddress} className="border rounded p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <TokenIcon symbol={tokenSymbol} size={24} />
                                                                <p className="text-sm font-sans font-bold text-foreground uppercase tracking-wider">
                                                                    ${tokenSymbol}
                                                                </p>
                                                            </div>
                                                            <p className="text-xs font-mono text-muted-foreground">
                                                                ${tokenName}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 break-all">
                                                                {tokenAddress}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Current Nonce: {tokenData.currentNonce?.toString() || 'N/A'}
                                                            </p>
                                                            {currentBalanceEntry && (() => {
                                                                const assetKey = `${tokenAddress.toLowerCase()}-${previousNonce.toString()}`;
                                                                const convertedValue = convertedAssets.get(assetKey);
                                                                const isConverting = isConvertingAssets.has(assetKey);
                                                                const decimals = tokenInfo?.decimals || 18;
                                                                
                                                                return (
                                                                    <div className="text-xs text-foreground font-semibold mt-1">
                                                                        <p>Current Balance: {currentBalanceEntry.amount.toString()} shares (at nonce {previousNonce.toString()})</p>
                                                                        {convertedValue !== undefined ? (
                                                                            <p className="text-primary mt-0.5">
                                                                                ≈ {formatTokenValue(convertedValue, decimals)} {tokenSymbol}
                                                                            </p>
                                                                        ) : isConverting ? (
                                                                            <p className="text-muted-foreground mt-0.5">Converting...</p>
                                                                        ) : null}
                                                                    </div>
                                                                );
                                                            })()}
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Balance Entries: {tokenData.balanceEntries.length}
                                                            </p>
                                                            {tokenData.balanceEntries.length > 0 && (() => {
                                                                // Remove duplicates by keeping the last entry for each nonce
                                                                const uniqueEntries = new Map<string | bigint, typeof tokenData.balanceEntries[0]>();
                                                                for (const entry of tokenData.balanceEntries) {
                                                                    uniqueEntries.set(entry.nonce, entry);
                                                                }
                                                                
                                                                // Convert to array and sort by nonce
                                                                const sortedEntries = Array.from(uniqueEntries.values()).sort((a, b) => {
                                                                    const nonceA = typeof a.nonce === 'string' ? BigInt(a.nonce) : a.nonce;
                                                                    const nonceB = typeof b.nonce === 'string' ? BigInt(b.nonce) : b.nonce;
                                                                    if (nonceA < nonceB) return -1;
                                                                    if (nonceA > nonceB) return 1;
                                                                    return 0;
                                                                });
                                                                
                                                                const decimals = tokenInfo?.decimals || 18;
                                                                
                                                                return (
                                                                    <div className="mt-2 space-y-1">
                                                                        {sortedEntries.map((entry) => {
                                                                            const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
                                                                            const isCurrent = entryNonce === previousNonce;
                                                                            const assetKey = `${tokenAddress.toLowerCase()}-${entryNonce.toString()}`;
                                                                            const convertedValue = convertedAssets.get(assetKey);
                                                                            const isConverting = isConvertingAssets.has(assetKey);
                                                                            
                                                                            return (
                                                                                <div 
                                                                                    key={`${tokenAddress}-nonce-${entry.nonce.toString()}`} 
                                                                                    className={`text-xs font-mono ${isCurrent ? 'font-semibold text-foreground bg-primary/10 px-2 py-1 rounded border border-primary/20' : 'text-muted-foreground'}`}
                                                                                >
                                                                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                                                                        <span className="inline-block w-16">Nonce {entry.nonce.toString()}:</span>
                                                                                        <span className={isCurrent ? 'text-primary' : ''}>
                                                                                            {entry.amount.toString()} shares
                                                                                        </span>
                                                                                        {convertedValue !== undefined && (
                                                                                            <span className={`${isCurrent ? 'text-primary/80' : 'text-muted-foreground/80'}`}>
                                                                                                (≈ {formatTokenValue(convertedValue, decimals)} {tokenSymbol})
                                                                                            </span>
                                                                                        )}
                                                                                        {isConverting && (
                                                                                            <span className="text-muted-foreground/60">(...)</span>
                                                                                        )}
                                                                                        {isCurrent && <span className="text-accent">(current)</span>}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDiscoverToken(tokenAddress)}
                                                                disabled={isDiscoveringTokens.has(tokenAddress)}
                                                            >
                                                                {isDiscoveringTokens.has(tokenAddress) ? 'Discovering...' : 'Refresh'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => toggleHistory(tokenAddress)}
                                                                disabled={loadingHistoryToken === tokenAddress}
                                                            >
                                                                {loadingHistoryToken === tokenAddress ? (
                                                                    'Loading...'
                                                                ) : expandedHistoryToken === tokenAddress.toLowerCase() ? (
                                                                    <>
                                                                        <ChevronUp className="w-3 h-3 mr-1" />
                                                                        Hide History
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        View History
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
                                                                            No transaction history found (only showing initialize/deposit/withdraw operations).
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
                                                                                    case 'withdraw': return 'WITHDRAW';
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

