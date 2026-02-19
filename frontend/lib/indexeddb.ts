'use client';

import { BalanceEntry } from '@/hooks/useNonceDiscovery';

// Discovery mode type
export type DiscoveryMode = 'mage' | 'archon';

/** Decrypted incoming note (received via send). Used to aggregate for absorb. */
export interface IncomingNote {
    /** Token address (hex) */
    tokenAddress: string;
    /** Decrypted amount (shares) */
    amount: bigint;
    /** shared_key_hash for this note (opening r for Pedersen) */
    sharedKeyHash: bigint;
    /** Sender public key (for display/debug) */
    senderPublicKey: { x: bigint; y: bigint };
    /** Index in contract array */
    index: number;
}

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
    commitmentLeaf: bigint; // Hash of commitment point: Poseidon([x, y])
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
    /** Aggregated incoming notes (for absorb): decrypted and summed for note_stack_m / note_stack_r */
    incomingNotes?: IncomingNote[];
    lastUpdated: number;
}

export interface TwoFactorData {
    is2FA: true;
    browserShare: string;
    signerPublicKey: [string, string];
    signerPubkeyHash: string;
}

export interface AccountData {
    zkAddress: string;
    userKey: bigint | null;
    tokenData: TokenAccountData[];
    lastUpdated: number;
    currentNonce?: bigint | null;
    balanceEntries?: BalanceEntry[];
    discoveryMode?: DiscoveryMode;
    mageTokenData?: TokenAccountData[];
    archonTokenData?: TokenAccountData[];
    twoFactor?: TwoFactorData;
}

const DB_NAME = 'arkana_account_db';
const DB_VERSION = 3;
const STORE_NAME = 'account_data';

let dbInstance: IDBDatabase | null = null;
let dbOpenFailed = false;

async function getDB(): Promise<IDBDatabase | null> {
    if (dbInstance) {
        return dbInstance;
    }
    if (dbOpenFailed) {
        return null;
    }

    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            if (!dbOpenFailed) {
                dbOpenFailed = true;
                console.warn('IndexedDB unavailable (private mode or storage disabled). Account cache will not persist.');
            }
            resolve(null);
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

export async function saveAccountData(data: AccountData): Promise<void> {
    try {
        const db = await getDB();
        if (!db) return;
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const serializeTokenData = (tokens: TokenAccountData[] | undefined) => {
            if (!tokens) return [];
            return tokens.map((token: TokenAccountData) => ({
                tokenAddress: token.tokenAddress,
                currentNonce: token.currentNonce !== null ? token.currentNonce.toString() : null,
                balanceEntries: token.balanceEntries.map((entry: BalanceEntry) => ({
                    tokenAddress: entry.tokenAddress.toString(),
                    amount: entry.amount.toString(),
                    nonce: entry.nonce.toString(),
                    nullifier: (entry as any).nullifier != null ? (entry as any).nullifier.toString() : '0',
                })),
                incomingNotes: (token.incomingNotes ?? []).map((n: IncomingNote) => ({
                    tokenAddress: n.tokenAddress,
                    amount: n.amount.toString(),
                    sharedKeyHash: n.sharedKeyHash.toString(),
                    senderPublicKey: { x: n.senderPublicKey.x.toString(), y: n.senderPublicKey.y.toString() },
                    index: n.index,
                })),
                lastUpdated: token.lastUpdated || Date.now(),
            }));
        };

        const dataToStore: any = {
            zkAddress: data.zkAddress,
            userKey: data.userKey !== null ? data.userKey.toString() : null,
            tokenData: serializeTokenData(data.tokenData),
            lastUpdated: Date.now(),
            currentNonce: data.currentNonce !== null && data.currentNonce !== undefined ? data.currentNonce.toString() : null,
            balanceEntries: data.balanceEntries ? data.balanceEntries.map((entry: BalanceEntry) => ({
                tokenAddress: entry.tokenAddress.toString(),
                amount: entry.amount.toString(),
                nonce: entry.nonce.toString(),
                nullifier: (entry as any).nullifier != null ? (entry as any).nullifier.toString() : '0',
            })) : [],
            discoveryMode: data.discoveryMode || 'mage',
            mageTokenData: serializeTokenData(data.mageTokenData),
            archonTokenData: serializeTokenData(data.archonTokenData),
            twoFactor: data.twoFactor ?? undefined,
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

export async function loadAccountData(zkAddress: string): Promise<AccountData | null> {
    try {
        const db = await getDB();
        if (!db) return null;
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

                const deserializeTokenData = (tokens: any[] | undefined): TokenAccountData[] => {
                    if (!tokens) return [];
                    return tokens.map((token: any): TokenAccountData => ({
                        tokenAddress: token.tokenAddress,
                        currentNonce: token.currentNonce !== null ? BigInt(token.currentNonce) : null,
                        balanceEntries: token.balanceEntries ? token.balanceEntries.map((entry: any) => ({
                            tokenAddress: BigInt(entry.tokenAddress),
                            amount: BigInt(entry.amount),
                            nonce: BigInt(entry.nonce),
                            nullifier: entry.nullifier != null ? BigInt(entry.nullifier) : BigInt(0),
                        })) : [],
                        incomingNotes: token.incomingNotes?.map((n: any): IncomingNote => ({
                            tokenAddress: n.tokenAddress,
                            amount: BigInt(n.amount),
                            sharedKeyHash: BigInt(n.sharedKeyHash),
                            senderPublicKey: { x: BigInt(n.senderPublicKey.x), y: BigInt(n.senderPublicKey.y) },
                            index: n.index,
                        })),
                        lastUpdated: token.lastUpdated || result.lastUpdated,
                    }));
                };

                const data: AccountData = {
                    zkAddress: result.zkAddress,
                    userKey: result.userKey !== null ? BigInt(result.userKey) : null,
                    tokenData: deserializeTokenData(result.tokenData),
                    lastUpdated: result.lastUpdated,
                    currentNonce: result.currentNonce !== null ? BigInt(result.currentNonce) : null,
                    balanceEntries: result.balanceEntries ? result.balanceEntries.map((entry: any) => ({
                        tokenAddress: BigInt(entry.tokenAddress),
                        amount: BigInt(entry.amount),
                        nonce: BigInt(entry.nonce),
                        nullifier: entry.nullifier != null ? BigInt(entry.nullifier) : BigInt(0),
                    })) : [],
                    discoveryMode: result.discoveryMode || 'mage',
                    mageTokenData: deserializeTokenData(result.mageTokenData),
                    archonTokenData: deserializeTokenData(result.archonTokenData),
                    twoFactor: result.twoFactor ?? undefined,
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

export function isIndexedDBAvailable(): boolean {
    return !dbOpenFailed && dbInstance !== null;
}

export async function saveTokenAccountData(
    zkAddress: string,
    tokenAddress: string,
    currentNonce: bigint | null,
    balanceEntries: BalanceEntry[],
    mode: DiscoveryMode = 'mage',
    incomingNotes?: IncomingNote[]
): Promise<void> {
    try {
        const existingData = await loadAccountData(zkAddress);
        const normalizedTokenAddress = tokenAddress.toLowerCase();

        const tokenData: TokenAccountData = {
            tokenAddress: normalizedTokenAddress,
            currentNonce,
            balanceEntries,
            lastUpdated: Date.now(),
            ...(incomingNotes != null && incomingNotes.length > 0 ? { incomingNotes } : {}),
        };

        // Get the appropriate token array based on mode
        const existingMageTokens = existingData?.mageTokenData || existingData?.tokenData || [];
        const existingArchonTokens = existingData?.archonTokenData || [];

        let mageTokenData: TokenAccountData[];
        let archonTokenData: TokenAccountData[];

        if (mode === 'archon') {
            mageTokenData = existingMageTokens;
            archonTokenData = [
                ...existingArchonTokens.filter(t => t.tokenAddress.toLowerCase() !== normalizedTokenAddress),
                tokenData
            ];
        } else {
            mageTokenData = [
                ...existingMageTokens.filter(t => t.tokenAddress.toLowerCase() !== normalizedTokenAddress),
                tokenData
            ];
            archonTokenData = existingArchonTokens;
        }

        const updatedData: AccountData = {
            zkAddress,
            userKey: existingData?.userKey || null,
            tokenData: mageTokenData,
            mageTokenData,
            archonTokenData,
            lastUpdated: Date.now(),
            discoveryMode: existingData?.discoveryMode || 'mage',
            twoFactor: existingData?.twoFactor,
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

        // Use mode-specific token data if available, fallback to legacy tokenData
        const tokenDataArray = mode === 'archon' 
            ? (accountData.archonTokenData || accountData.tokenData || [])
            : (accountData.mageTokenData || accountData.tokenData || []);

        const tokenData = tokenDataArray.find(t => t.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
        return tokenData || null;
    } catch (error) {
        console.error('Error loading token account data from IndexedDB:', error);
        return null;
    }
}

export async function getTokenAddresses(zkAddress: string): Promise<string[]> {
    try {
        const accountData = await loadAccountData(zkAddress);
        if (!accountData || !accountData.tokenData) {
            return [];
        }
        return accountData.tokenData.map(t => t.tokenAddress);
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
            discoveryMode: mode,
            mageTokenData: existingData?.mageTokenData,
            archonTokenData: existingData?.archonTokenData,
        };

        await saveAccountData(updatedData);
    } catch (error) {
        console.error('Error saving discovery mode to IndexedDB:', error);
    }
}

export async function loadDiscoveryMode(zkAddress: string): Promise<DiscoveryMode> {
    try {
        const accountData = await loadAccountData(zkAddress);
        return accountData?.discoveryMode || 'mage';
    } catch (error) {
        console.error('Error loading discovery mode from IndexedDB:', error);
        return 'mage';
    }
}

export async function saveTwoFactorData(zkAddress: string, twoFactor: TwoFactorData): Promise<void> {
    try {
        const existingData = await loadAccountData(zkAddress);
        const updatedData: AccountData = {
            zkAddress,
            userKey: existingData?.userKey || null,
            tokenData: existingData?.tokenData || [],
            lastUpdated: Date.now(),
            discoveryMode: existingData?.discoveryMode || 'mage',
            mageTokenData: existingData?.mageTokenData,
            archonTokenData: existingData?.archonTokenData,
            twoFactor,
        };
        await saveAccountData(updatedData);
    } catch (error) {
        console.error('Error saving 2FA data to IndexedDB:', error);
    }
}

export async function loadTwoFactorData(zkAddress: string): Promise<TwoFactorData | undefined> {
    try {
        const accountData = await loadAccountData(zkAddress);
        return accountData?.twoFactor;
    } catch (error) {
        console.error('Error loading 2FA data from IndexedDB:', error);
        return undefined;
    }
}

