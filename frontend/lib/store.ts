'use client';

// Simplified version - just the types and basic structure needed for loadAccountDataOnSign
export interface BalanceEntry {
  tokenAddress: bigint;
  amount: bigint;
  nonce: bigint;
}

export interface AccountData {
  zkAddress: string;
  userKey: bigint | null;
  currentNonce: bigint | null;
  balanceEntries: BalanceEntry[];
  lastUpdated: number;
}

const DB_NAME = 'arkana_account_db';
const DB_VERSION = 1;
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

      // Account data store
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'zkAddress' });
        objectStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
      }
    };
  });
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

        // Convert strings back to bigints
        const data: AccountData = {
          zkAddress: result.zkAddress,
          userKey: result.userKey !== null ? BigInt(result.userKey) : null,
          currentNonce: result.currentNonce !== null ? BigInt(result.currentNonce) : null,
          balanceEntries: result.balanceEntries ? result.balanceEntries.map((entry: any) => ({
            tokenAddress: BigInt(entry.tokenAddress),
            amount: BigInt(entry.amount),
            nonce: BigInt(entry.nonce),
          })) : [],
          lastUpdated: result.lastUpdated,
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
