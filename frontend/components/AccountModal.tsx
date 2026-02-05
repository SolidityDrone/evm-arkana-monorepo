'use client';

import { useNonceDiscovery, BalanceEntry } from '@/hooks/useNonceDiscovery';
import { useZkAddress, useAccount } from '@/context/AccountProvider';
import { useAccountState } from '@/context/AccountStateProvider';
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePublicClient } from 'wagmi';
import { Address } from 'viem';
import { saveTokenAccountData, loadTokenAccountData, TokenAccountData, getTokenAddresses, loadAccountData, AccountData } from '@/lib/indexeddb';
import { useAaveTokens } from '@/hooks/useAaveTokens';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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

    const isModalClosedRef = useRef(false);

    const loadSavedData = useCallback(async () => {
        if (!zkAddress) return;

        try {
            setIsLoadingSavedData(true);
            const savedData = await loadAccountData(zkAddress);

            if (savedData) {
                const tokenMap = new Map<string, TokenAccountData>();

                if (savedData.tokenData) {
                    for (const tokenData of savedData.tokenData) {
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

        for (const token of aaveTokens) {
            if (isModalClosedRef.current) {
                break;
            }

            try {
                // Reload cached data before each token to get the latest state
                const cachedData = await loadAccountData(zkAddress);
                const tokenAddressLower = token.address.toLowerCase();

                // Get cached data for this specific token
                const cachedTokenData = cachedData?.tokenData?.find(t => {
                    return t.tokenAddress.toLowerCase() === tokenAddressLower;
                });
                const cachedNonce = cachedTokenData?.currentNonce || null;
                const cachedBalanceEntries = cachedTokenData?.balanceEntries || [];

                // Compute nonce for this token
                const result = await computeCurrentNonce(token.address as `0x${string}`, cachedNonce, cachedBalanceEntries);

                if (result && !isModalClosedRef.current) {
                    // Save token-specific data
                    await saveTokenAccountData(zkAddress, token.address, result.currentNonce, result.balanceEntries);

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
    }, [publicClient, account?.signature, zkAddress, isLoadingAaveTokens, aaveTokens, computeCurrentNonce]);

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

            // Load cached data for this token
            const cachedData = await loadAccountData(zkAddress);
            const cachedTokenData = cachedData?.tokenData?.find(t => {
                return t.tokenAddress.toLowerCase() === normalizedTokenAddress;
            });
            const cachedNonce = cachedTokenData?.currentNonce || null;
            const cachedBalanceEntries = cachedTokenData?.balanceEntries || [];

            const result = await computeCurrentNonce(
                normalizedTokenAddress as `0x${string}`,
                cachedNonce,
                cachedBalanceEntries
            );

            if (isModalClosedRef.current) return;

            if (result) {
                await saveTokenAccountData(
                    zkAddress,
                    normalizedTokenAddress,
                    result.currentNonce,
                    result.balanceEntries
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
    }, [zkAddress, publicClient, account?.signature, computeCurrentNonce, setCurrentNonce, setBalanceEntries]);

    // Auto-discover tokens when modal opens
    useEffect(() => {
        if (isOpen) {
            isModalClosedRef.current = false;
            loadSavedData();
        }
    }, [isOpen, loadSavedData]);

    // Discover all tokens when Aave tokens are loaded
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
                    <DialogTitle>Account Management</DialogTitle>
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
                                                            <p className="text-sm font-sans font-bold text-foreground uppercase tracking-wider">
                                                                {tokenSymbol}
                                                            </p>
                                                            <p className="text-xs font-mono text-muted-foreground">
                                                                {tokenName}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-muted-foreground/60 mt-1 break-all">
                                                                {tokenAddress}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-2">
                                                                Current Nonce: {tokenData.currentNonce?.toString() || 'N/A'}
                                                            </p>
                                                            {currentBalanceEntry && (
                                                                <p className="text-xs text-foreground font-semibold mt-1">
                                                                    Current Balance: {currentBalanceEntry.amount.toString()} shares (at nonce {previousNonce.toString()})
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Balance Entries: {tokenData.balanceEntries.length}
                                                            </p>
                                                            {tokenData.balanceEntries.length > 0 && (
                                                                <div className="mt-2 space-y-1">
                                                                    {tokenData.balanceEntries.map((entry, idx) => {
                                                                        const entryNonce = typeof entry.nonce === 'string' ? BigInt(entry.nonce) : entry.nonce;
                                                                        const isCurrent = entryNonce === previousNonce;
                                                                        return (
                                                                            <div key={idx} className={`text-xs ${isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                                                                Nonce {entry.nonce.toString()}: {entry.amount.toString()} shares {isCurrent && '(current)'}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDiscoverToken(tokenAddress)}
                                                            disabled={isDiscoveringTokens.has(tokenAddress)}
                                                        >
                                                            {isDiscoveringTokens.has(tokenAddress) ? 'Discovering...' : 'Refresh'}
                                                        </Button>
                                                    </div>
                                                    {discoveryErrors.has(tokenAddress) && (
                                                        <p className="text-xs text-red-500 mt-2">
                                                            {discoveryErrors.get(tokenAddress)}
                                                        </p>
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

