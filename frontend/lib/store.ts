'use client';

// Temporary type for TransactionHistoryEntry - can be expanded later
export interface TransactionHistoryEntry {
  type: 'initialize' | 'deposit' | 'send' | 'withdraw' | 'absorb';
  nonce?: bigint;
  nonceCommitment?: bigint;
  tokenAddress?: bigint;
  amount?: bigint;
  timestamp?: bigint;
  blockNumber?: bigint;
  transactionHash?: string;
  receiverPublicKey?: { x: bigint; y: bigint };
  absorbedAmount?: bigint;
  nullifier?: bigint;
  sharesMinted?: bigint;
  personalCTotM?: bigint;
  personalCTotR?: bigint;
}

// Import BalanceEntry from useNonceDiscovery (will be created next)
export interface BalanceEntry {
  tokenAddress: bigint;
  amount: bigint;
  nonce: bigint;
}

const DB_NAME = 'arkana_account_db';
const DB_VERSION = 1;
const STORE_NAME = 'account_data';
const HISTORY_STORE_NAME = 'transaction_history';
const COMMITMENT_STORE_NAME = 'commitment_states';
const NOTES_STORE_NAME = 'incoming_notes';

// Pedersen commitment point (x, y coordinates)
export interface CommitmentPoint {
  x: bigint;
  y: bigint;
}

// State for a specific (nonce, tokenAddress) combination
export interface CommitmentState {
  nonce: bigint;
  tokenAddress: bigint;
  commitmentPoint: CommitmentPoint;
  commitmentLeaf: bigint;
  nonceCommitment: bigint;
  shares: bigint;
  nullifier: bigint;
  unlocksAt: bigint;
  chainId: bigint;
}

// Merkle tree state
export interface MerkleTreeState {
  root: bigint;
  depth: bigint;
  size: bigint;
}

// Incoming note (DH encrypted)
export interface IncomingNote {
  index: number;
  senderPublicKey: CommitmentPoint;
  encryptedAmountForReceiver: bigint;
  encryptedTokenAddressForReceiver: bigint;
  decryptedAmount?: bigint;
  decryptedTokenAddress?: bigint;
  timestamp: number;
}

// Token-specific account data
export interface TokenAccountData {
  tokenAddress: string;
  currentNonce: bigint | null;
  balanceEntries: BalanceEntry[];
  lastUpdated: number;
}

export interface AccountData {
  zkAddress: string;
  userKey: bigint | null;
  tokenData: TokenAccountData[];
  merkleTreeState: MerkleTreeState | null;
  lastUpdated: number;
  currentNonce?: bigint | null;
  balanceEntries?: BalanceEntry[];
}

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

      if (!db.objectStoreNames.contains(HISTORY_STORE_NAME)) {
        const historyStore = db.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'zkAddress' });
        historyStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
      }

      if (!db.objectStoreNames.contains(COMMITMENT_STORE_NAME)) {
        const commitmentStore = db.createObjectStore(COMMITMENT_STORE_NAME, { keyPath: ['zkAddress', 'nonce', 'tokenAddress'] });
        commitmentStore.createIndex('zkAddress', 'zkAddress', { unique: false });
        commitmentStore.createIndex('nonce', 'nonce', { unique: false });
        commitmentStore.createIndex('tokenAddress', 'tokenAddress', { unique: false });
      }

      if (!db.objectStoreNames.contains(NOTES_STORE_NAME)) {
        const notesStore = db.createObjectStore(NOTES_STORE_NAME, { keyPath: ['zkAddress', 'index'] });
        notesStore.createIndex('zkAddress', 'zkAddress', { unique: false });
        notesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function saveAccountData(data: AccountData): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const dataToStore: any = {
      zkAddress: data.zkAddress,
      userKey: data.userKey !== null ? data.userKey.toString() : null,
      tokenData: data.tokenData ? data.tokenData.map((token: TokenAccountData) => ({
        tokenAddress: token.tokenAddress,
        currentNonce: token.currentNonce !== null ? token.currentNonce.toString() : null,
        balanceEntries: token.balanceEntries.map((entry: BalanceEntry) => ({
          tokenAddress: entry.tokenAddress.toString(),
          amount: entry.amount.toString(),
          nonce: entry.nonce.toString(),
        })),
        lastUpdated: token.lastUpdated || Date.now(),
      })) : [],
      merkleTreeState: data.merkleTreeState ? {
        root: data.merkleTreeState.root.toString(),
        depth: data.merkleTreeState.depth.toString(),
        size: data.merkleTreeState.size.toString(),
      } : null,
      lastUpdated: Date.now(),
      currentNonce: data.currentNonce !== null && data.currentNonce !== undefined ? data.currentNonce.toString() : null,
      balanceEntries: data.balanceEntries ? data.balanceEntries.map((entry: BalanceEntry) => ({
        tokenAddress: entry.tokenAddress.toString(),
        amount: entry.amount.toString(),
        nonce: entry.nonce.toString(),
      })) : [],
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
          tokenData: result.tokenData ? result.tokenData.map((token: any): TokenAccountData => ({
            tokenAddress: token.tokenAddress,
            currentNonce: token.currentNonce !== null ? BigInt(token.currentNonce) : null,
            balanceEntries: token.balanceEntries.map((entry: any) => ({
              tokenAddress: BigInt(entry.tokenAddress),
              amount: BigInt(entry.amount),
              nonce: BigInt(entry.nonce),
            })),
            lastUpdated: token.lastUpdated || result.lastUpdated,
          })) : [],
          merkleTreeState: result.merkleTreeState ? {
            root: BigInt(result.merkleTreeState.root),
            depth: BigInt(result.merkleTreeState.depth),
            size: BigInt(result.merkleTreeState.size),
          } : null,
          lastUpdated: result.lastUpdated,
          currentNonce: result.currentNonce !== null ? BigInt(result.currentNonce) : null,
          balanceEntries: result.balanceEntries ? result.balanceEntries.map((entry: any) => ({
            tokenAddress: BigInt(entry.tokenAddress),
            amount: BigInt(entry.amount),
            nonce: BigInt(entry.nonce),
          })) : [],
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
  balanceEntries: BalanceEntry[]
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

    const filteredTokens = existingData?.tokenData
      ? existingData.tokenData.filter(t => t.tokenAddress.toLowerCase() !== normalizedTokenAddress)
      : [];

    const updatedData: AccountData = {
      zkAddress,
      userKey: existingData?.userKey || null,
      tokenData: [...filteredTokens, tokenData],
      merkleTreeState: existingData?.merkleTreeState || null,
      lastUpdated: Date.now(),
    };

    await saveAccountData(updatedData);
  } catch (error) {
    console.error('Error saving token account data to IndexedDB:', error);
  }
}

export async function loadTokenAccountData(
  zkAddress: string,
  tokenAddress: string
): Promise<TokenAccountData | null> {
  try {
    const accountData = await loadAccountData(zkAddress);
    if (!accountData || !accountData.tokenData) {
      return null;
    }

    const tokenData = accountData.tokenData.find(t => t.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
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

export async function clearAccountData(zkAddress: string): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(zkAddress);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error clearing account data from IndexedDB:', error);
  }
}

export async function saveCommitmentState(
  zkAddress: string,
  state: CommitmentState
): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction([COMMITMENT_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(COMMITMENT_STORE_NAME);

    const stateToStore = {
      zkAddress,
      nonce: state.nonce.toString(),
      tokenAddress: state.tokenAddress.toString(),
      commitmentPoint: {
        x: state.commitmentPoint.x.toString(),
        y: state.commitmentPoint.y.toString(),
      },
      commitmentLeaf: state.commitmentLeaf.toString(),
      nonceCommitment: state.nonceCommitment.toString(),
      shares: state.shares.toString(),
      nullifier: state.nullifier.toString(),
      unlocksAt: state.unlocksAt.toString(),
      chainId: state.chainId.toString(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(stateToStore);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error saving commitment state to IndexedDB:', error);
  }
}

export async function loadCommitmentState(
  zkAddress: string,
  nonce: bigint,
  tokenAddress: bigint
): Promise<CommitmentState | null> {
  try {
    const db = await getDB();
    const transaction = db.transaction([COMMITMENT_STORE_NAME], 'readonly');
    const store = transaction.objectStore(COMMITMENT_STORE_NAME);

    return new Promise<CommitmentState | null>((resolve, reject) => {
      const request = store.get([zkAddress, nonce.toString(), tokenAddress.toString()]);
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        const state: CommitmentState = {
          nonce: BigInt(result.nonce),
          tokenAddress: BigInt(result.tokenAddress),
          commitmentPoint: {
            x: BigInt(result.commitmentPoint.x),
            y: BigInt(result.commitmentPoint.y),
          },
          commitmentLeaf: BigInt(result.commitmentLeaf),
          nonceCommitment: BigInt(result.nonceCommitment),
          shares: BigInt(result.shares),
          nullifier: BigInt(result.nullifier),
          unlocksAt: BigInt(result.unlocksAt),
          chainId: BigInt(result.chainId),
        };

        resolve(state);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading commitment state from IndexedDB:', error);
    return null;
  }
}

export async function loadAllCommitmentStates(zkAddress: string): Promise<CommitmentState[]> {
  try {
    const db = await getDB();
    const transaction = db.transaction([COMMITMENT_STORE_NAME], 'readonly');
    const store = transaction.objectStore(COMMITMENT_STORE_NAME);
    const index = store.index('zkAddress');

    return new Promise<CommitmentState[]>((resolve, reject) => {
      const request = index.getAll(zkAddress);
      request.onsuccess = () => {
        const results = request.result || [];
        const states: CommitmentState[] = results.map((result: any) => ({
          nonce: BigInt(result.nonce),
          tokenAddress: BigInt(result.tokenAddress),
          commitmentPoint: {
            x: BigInt(result.commitmentPoint.x),
            y: BigInt(result.commitmentPoint.y),
          },
          commitmentLeaf: BigInt(result.commitmentLeaf),
          nonceCommitment: BigInt(result.nonceCommitment),
          shares: BigInt(result.shares),
          nullifier: BigInt(result.nullifier),
          unlocksAt: BigInt(result.unlocksAt),
          chainId: BigInt(result.chainId),
        }));
        resolve(states);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading all commitment states from IndexedDB:', error);
    return [];
  }
}

export async function deleteCommitmentState(
  zkAddress: string,
  nonce: bigint,
  tokenAddress: bigint
): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction([COMMITMENT_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(COMMITMENT_STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete([zkAddress, nonce.toString(), tokenAddress.toString()]);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error deleting commitment state from IndexedDB:', error);
  }
}

