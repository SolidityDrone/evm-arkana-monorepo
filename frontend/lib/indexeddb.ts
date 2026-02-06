'use client';

import { BalanceEntry } from '@/hooks/useNonceDiscovery';

// Pedersen commitment point (x, y coordinates)
export interface CommitmentPoint {
    x: bigint;
    y: bigint;
}

// State for a specific (nonce, tokenAddress) combination
export interface CommitmentState {
    nonce: bigint;
    tokenAddress: bigint;
    commitmentPoint: CommitmentPoint; // Pedersen commitment point (x, y)
    commitmentLeaf: bigint; // Hash of commitment point: Poseidon2::hash([x, y], 2)
    nonceCommitment: bigint; // Nonce commitment for this nonce
    shares: bigint; // Shares for this commitment
    nullifier: bigint; // Nullifier for this commitment
    unlocksAt: bigint; // Unlocks_at timestamp (0 = unlocked)
    chainId: bigint; // Chain ID for this commitment
}

export interface TokenAccountData {
    tokenAddress: string;
    currentNonce: bigint | null;
    balanceEntries: BalanceEntry[];
    lastUpdated: number;
}

export type DiscoveryMode = 'mage' | 'archon';

export interface AccountData {
    zkAddress: string;
    userKey: bigint | null;
    tokenData: TokenAccountData[]; // Legacy - kept for backward compatibility
    mageTokenData: TokenAccountData[]; // Token data discovered in Mage mode
    archonTokenData: TokenAccountData[]; // Token data discovered in Archon mode
    lastUpdated: number;
    currentNonce?: bigint | null;
    balanceEntries?: BalanceEntry[];
    discoveryMode?: DiscoveryMode;
}

const DB_NAME = 'arkana_account_db';
const DB_VERSION = 4; // Bumped for mode-separated token data
const STORE_NAME = 'account_data';

let dbInstance: IDBDatabase | null = null;

async function getDB(): Promise<IDBDatabase> {
    if (dbInstance) {
        return dbInstance;
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'zkAddress' });
                objectStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
            }
        };
    });
}

const serializeTokenData = (tokenData: TokenAccountData[] | undefined): any[] => {
    if (!tokenData) return [];
    return tokenData.map((token: TokenAccountData) => ({
        tokenAddress: token.tokenAddress,
        currentNonce: token.currentNonce !== null ? token.currentNonce.toString() : null,
        balanceEntries: token.balanceEntries.map((entry: BalanceEntry) => ({
            tokenAddress: entry.tokenAddress.toString(),
            amount: entry.amount.toString(),
            nonce: entry.nonce.toString(),
        })),
        lastUpdated: token.lastUpdated || Date.now(),
    }));
};

export async function saveAccountData(data: AccountData): Promise<void> {
    try {
        const db = await getDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const dataToStore: any = {
            zkAddress: data.zkAddress,
            userKey: data.userKey !== null ? data.userKey.toString() : null,
            tokenData: serializeTokenData(data.tokenData), // Legacy
            mageTokenData: serializeTokenData(data.mageTokenData),
            archonTokenData: serializeTokenData(data.archonTokenData),
            lastUpdated: Date.now(),
            currentNonce: data.currentNonce !== null && data.currentNonce !== undefined ? data.currentNonce.toString() : null,
            balanceEntries: data.balanceEntries ? data.balanceEntries.map((entry: BalanceEntry) => ({
                tokenAddress: entry.tokenAddress.toString(),
                amount: entry.amount.toString(),
                nonce: entry.nonce.toString(),
            })) : [],
            discoveryMode: data.discoveryMode || 'mage',
        };

        await new Promise<void>((resolve, reject) => {
            const request = store.put(dataToStore);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error saving account data to IndexedDB:', error);
    }
}

const deserializeTokenData = (tokenData: any[] | undefined, fallbackLastUpdated: number): TokenAccountData[] => {
    if (!tokenData) return [];
    return tokenData.map((token: any): TokenAccountData => ({
        tokenAddress: token.tokenAddress,
        currentNonce: token.currentNonce !== null ? BigInt(token.currentNonce) : null,
        balanceEntries: token.balanceEntries.map((entry: any) => ({
            tokenAddress: BigInt(entry.tokenAddress),
            amount: BigInt(entry.amount),
            nonce: BigInt(entry.nonce),
        })),
        lastUpdated: token.lastUpdated || fallbackLastUpdated,
    }));
};

export async function loadAccountData(zkAddress: string): Promise<AccountData | null> {
    try {
        const db = await getDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise<AccountData | null>((resolve, reject) => {
            const request = store.get(zkAddress);
            request.onsuccess = () => {
                const result = request.result;
                if (!result) {
                    resolve(null);
                    return;
                }

                const data: AccountData = {
                    zkAddress: result.zkAddress,
                    userKey: result.userKey !== null ? BigInt(result.userKey) : null,
                    tokenData: deserializeTokenData(result.tokenData, result.lastUpdated), // Legacy
                    mageTokenData: deserializeTokenData(result.mageTokenData, result.lastUpdated),
                    archonTokenData: deserializeTokenData(result.archonTokenData, result.lastUpdated),
                    lastUpdated: result.lastUpdated,
                    currentNonce: result.currentNonce !== null ? BigInt(result.currentNonce) : null,
                    balanceEntries: result.balanceEntries ? result.balanceEntries.map((entry: any) => ({
                        tokenAddress: BigInt(entry.tokenAddress),
                        amount: BigInt(entry.amount),
                        nonce: BigInt(entry.nonce),
                    })) : [],
                    discoveryMode: result.discoveryMode || 'mage',
                };

                resolve(data);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error loading account data from IndexedDB:', error);
        return null;
    }
}

export async function saveTokenAccountData(
    zkAddress: string,
    tokenAddress: string,
    currentNonce: bigint | null,
    balanceEntries: BalanceEntry[],
    mode: DiscoveryMode = 'mage'
): Promise<void> {
    try {
        const existingData = await loadAccountData(zkAddress);
        const normalizedTokenAddress = tokenAddress.toLowerCase();

        const tokenData: TokenAccountData = {
            tokenAddress: normalizedTokenAddress,
            currentNonce,
            balanceEntries,
            lastUpdated: Date.now(),
        };

        // Get existing mode-specific token data
        const existingMageTokenData = existingData?.mageTokenData || [];
        const existingArchonTokenData = existingData?.archonTokenData || [];

        let updatedMageTokenData = existingMageTokenData;
        let updatedArchonTokenData = existingArchonTokenData;

        if (mode === 'mage') {
            // Filter out existing entry for this token in mage data
            const filteredMageTokens = existingMageTokenData.filter(
                t => t.tokenAddress.toLowerCase() !== normalizedTokenAddress
            );
            updatedMageTokenData = [...filteredMageTokens, tokenData];
        } else {
            // Filter out existing entry for this token in archon data
            const filteredArchonTokens = existingArchonTokenData.filter(
                t => t.tokenAddress.toLowerCase() !== normalizedTokenAddress
            );
            updatedArchonTokenData = [...filteredArchonTokens, tokenData];
        }

        const updatedData: AccountData = {
            zkAddress,
            userKey: existingData?.userKey || null,
            tokenData: existingData?.tokenData || [], // Legacy
            mageTokenData: updatedMageTokenData,
            archonTokenData: updatedArchonTokenData,
            lastUpdated: Date.now(),
            discoveryMode: existingData?.discoveryMode || 'mage',
        };

        await saveAccountData(updatedData);
    } catch (error) {
        console.error('Error saving token account data to IndexedDB:', error);
    }
}

export async function loadTokenAccountData(
    zkAddress: string,
    tokenAddress: string,
    mode: DiscoveryMode = 'mage'
): Promise<TokenAccountData | null> {
    try {
        const accountData = await loadAccountData(zkAddress);
        if (!accountData) {
            return null;
        }

        // Get mode-specific token data
        const tokenDataArray = mode === 'mage' 
            ? accountData.mageTokenData 
            : accountData.archonTokenData;

        if (!tokenDataArray) {
            return null;
        }

        const tokenData = tokenDataArray.find(t => t.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
        return tokenData || null;
    } catch (error) {
        console.error('Error loading token account data from IndexedDB:', error);
        return null;
    }
}

export async function getTokenAddresses(zkAddress: string, mode: DiscoveryMode = 'mage'): Promise<string[]> {
    try {
        const accountData = await loadAccountData(zkAddress);
        if (!accountData) {
            return [];
        }
        
        const tokenDataArray = mode === 'mage' 
            ? accountData.mageTokenData 
            : accountData.archonTokenData;
            
        if (!tokenDataArray) {
            return [];
        }
        return tokenDataArray.map(t => t.tokenAddress);
    } catch (error) {
        console.error('Error getting token addresses from IndexedDB:', error);
        return [];
    }
}

export async function saveDiscoveryMode(zkAddress: string, mode: DiscoveryMode): Promise<void> {
    try {
        const existingData = await loadAccountData(zkAddress);
        const updatedData: AccountData = {
            zkAddress,
            userKey: existingData?.userKey || null,
            tokenData: existingData?.tokenData || [],
            lastUpdated: Date.now(),
            currentNonce: existingData?.currentNonce || null,
            balanceEntries: existingData?.balanceEntries || [],
            discoveryMode: mode,
        };
        await saveAccountData(updatedData);
    } catch (error) {
        console.error('Error saving discovery mode to IndexedDB:', error);
    }
}

