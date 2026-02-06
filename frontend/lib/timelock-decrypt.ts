// timelock-decrypt.ts
// Decrypts timelock-encrypted orders using drand signatures
// Browser-compatible version

import { bn254 } from '@noble/curves/bn254.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { ensureBufferPolyfill } from './buffer-polyfill';

// Constants
const GENESIS_TIME = 1727521075;
const PERIOD = 3;

// Helper to get Buffer safely
async function getBuffer(): Promise<typeof import('buffer').Buffer> {
    await ensureBufferPolyfill();
    if (!globalThis.Buffer) {
        const { Buffer } = await import('buffer');
        globalThis.Buffer = Buffer;
    }
    return globalThis.Buffer;
}

// Helper to get poseidon2Hash - must be loaded AFTER Buffer is initialized
async function getPoseidon2Hash() {
    await getBuffer();
    const { poseidon2Hash } = await import('@aztec/foundation/crypto');
    return poseidon2Hash;
}

/**
 * Get timestamp for a drand round
 */
export function getRoundTimestamp(round: number): number {
    return GENESIS_TIME + (round * PERIOD);
}

/**
 * Get current drand round
 */
export function getCurrentRound(): number {
    const now = Math.floor(Date.now() / 1000);
    if (now < GENESIS_TIME) return 0;
    return Math.floor((now - GENESIS_TIME) / PERIOD);
}

/**
 * Check if a round is available for decryption
 */
export function isRoundAvailable(targetRound: number): boolean {
    return getCurrentRound() >= targetRound;
}

/**
 * Fetch drand signature for a specific round
 */
export async function fetchDrandSignature(round: number): Promise<string> {
    const url = `https://api.drand.sh/v2/beacons/evmnet/rounds/${round}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch drand round ${round}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.signature;
}

/**
 * Parse G1 signature from drand (uncompressed format)
 */
function parseG1Signature(signatureHex: string): typeof bn254.G1.Point {
    const sigBytes = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;
    
    if (sigBytes.length !== 128) {
        throw new Error(`Invalid signature length: expected 128 hex chars, got ${sigBytes.length}`);
    }
    
    const pointHex = '04' + sigBytes;
    const G1 = bn254.G1;
    const point = G1.Point.fromHex(pointHex);
    
    return point;
}

/**
 * Parse G2 point from stored C1 data
 */
function parseG2Point(c1: { x0: string; x1: string; y0: string; y1: string }): typeof bn254.G2.Point {
    const G2 = bn254.G2;
    
    // Build uncompressed G2 point format
    const x0Hex = BigInt(c1.x0).toString(16).padStart(64, '0');
    const x1Hex = BigInt(c1.x1).toString(16).padStart(64, '0');
    const y0Hex = BigInt(c1.y0).toString(16).padStart(64, '0');
    const y1Hex = BigInt(c1.y1).toString(16).padStart(64, '0');
    
    // G2 point format: 04 + x0 + x1 + y0 + y1 (uncompressed)
    const pointHex = '04' + x0Hex + x1Hex + y0Hex + y1Hex;
    
    try {
        return G2.Point.fromHex(pointHex);
    } catch (e) {
        // Try alternative ordering
        const altPointHex = '04' + x1Hex + x0Hex + y1Hex + y0Hex;
        return G2.Point.fromHex(altPointHex);
    }
}

/**
 * KDF from pairing result using Poseidon2 (same as encryption)
 */
async function kdf(pairingResult: any): Promise<bigint> {
    const Buffer = await getBuffer();
    const pairingStr = JSON.stringify({
        c0: pairingResult.c0.toString(),
        c1: pairingResult.c1.toString()
    });
    const pairingHash = sha256(new TextEncoder().encode(pairingStr));
    const pairingFieldRaw = BigInt('0x' + Buffer.from(pairingHash).toString('hex'));

    // BN254 Fr field modulus
    const FR_MODULUS = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
    const pairingField = pairingFieldRaw % FR_MODULUS;

    // Use Poseidon2 hash (same as Noir circuit)
    const poseidon2Hash = await getPoseidon2Hash();
    const kdfResult = await poseidon2Hash([pairingField]);
    return kdfResult.toBigInt();
}

/**
 * Derive AES-128 key from pairing result
 */
async function deriveAESKey(pairingResult: any): Promise<Uint8Array> {
    const Buffer = await getBuffer();
    const kdfValue = await kdf(pairingResult);
    const kdfBytes = Buffer.from(kdfValue.toString(16).padStart(64, '0'), 'hex');
    const keyHash = sha256(kdfBytes);
    return new Uint8Array(keyHash.slice(0, 16)); // 16 bytes for AES-128
}

/**
 * Decrypt AES-128-CBC encrypted data
 */
async function decryptAES128(ciphertext: string, key: Uint8Array, iv: string): Promise<string> {
    const Buffer = await getBuffer();
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC', length: 128 },
        false,
        ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: Buffer.from(iv, 'hex') },
        cryptoKey,
        Buffer.from(ciphertext, 'hex')
    );

    return new TextDecoder().decode(decrypted);
}

export interface TimelockData {
    H: { x: string; y: string };
    V: { x: string; y: string };
    C1: { x0: string; x1: string; y0: string; y1: string };
    targetRound: number;
}

export interface AESData {
    iv: string;
    ciphertext: string;
}

export interface EncryptedOrderData {
    aes: AESData;
    round: number;
    timelock: TimelockData;
}

export interface DecryptedOrder {
    sharesAmount: string;
    amountOutMin: string;
    slippageBps: number;
    deadline: number;
    recipient: string;
    tokenOut: string;
    executionFeeBps: number;
    prevHash: string;
    nextHash: string;
    nextCiphertext?: string;
}

/**
 * Decrypt a timelock-encrypted order
 * @param encryptedData The parsed encrypted order data (from IPFS)
 * @param drandSignature The drand signature for the target round
 * @returns Decrypted order data
 */
export async function decryptTimelockOrder(
    encryptedData: EncryptedOrderData,
    drandSignature: string
): Promise<DecryptedOrder> {
    // Parse drand signature as G1 point
    const sigmaPoint = parseG1Signature(drandSignature);
    
    // Parse C1 from encrypted data as G2 point
    const C1 = parseG2Point(encryptedData.timelock.C1);
    
    // Compute pairing: e(sigma, C1)
    // This equals e(s*H, r*G2) = e(H, G2)^(s*r) = e(r*H, s*G2) = e(V, P)
    // where P is drand public key, s is drand secret
    const pairingResult = bn254.pairing(sigmaPoint, C1);
    
    // Derive AES key from pairing result
    const aesKey = await deriveAESKey(pairingResult);
    
    // Decrypt AES-encrypted data
    const decrypted = await decryptAES128(
        encryptedData.aes.ciphertext,
        aesKey,
        encryptedData.aes.iv
    );
    
    return JSON.parse(decrypted);
}

/**
 * Parse encrypted order data - handles both direct JSON and IPFS CID
 * @param dataOrCid Either direct JSON string or IPFS CID
 * @returns The encrypted order data
 */
export async function parseOrFetchEncryptedData(dataOrCid: string): Promise<EncryptedOrderData> {
    // Check if it's direct JSON data (starts with '{')
    const trimmed = dataOrCid.trim();
    if (trimmed.startsWith('{')) {
        try {
            return JSON.parse(trimmed);
        } catch (e) {
            throw new Error(`Failed to parse direct JSON: ${(e as Error).message}`);
        }
    }
    
    // Otherwise treat as IPFS CID
    return fetchFromIPFS(dataOrCid);
}

/**
 * Fetch encrypted order from IPFS
 * @param ipfsCid The IPFS CID (can be in various formats)
 * @returns The encrypted order data
 */
export async function fetchFromIPFS(ipfsCid: string): Promise<EncryptedOrderData> {
    // Clean up CID if needed
    let cid = ipfsCid;
    if (cid.startsWith('ipfs://')) {
        cid = cid.slice(7);
    }
    
    // Try multiple gateways
    const gateways = [
        `https://dweb.link/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`,
    ];
    
    let lastError: Error | null = null;
    
    for (const gateway of gateways) {
        try {
            const response = await fetch(gateway, { 
                signal: AbortSignal.timeout(10000) // 10s timeout
            });
            if (response.ok) {
                const text = await response.text();
                return JSON.parse(text);
            }
        } catch (e) {
            lastError = e as Error;
            continue;
        }
    }
    
    throw lastError || new Error('Failed to fetch from IPFS');
}

/**
 * Full decryption flow: parse/fetch data, check round, decrypt
 * @param dataOrCid Either direct JSON data or IPFS CID of the encrypted order
 * @returns Decrypted order or status info
 */
export async function decryptOrderFromIPFS(dataOrCid: string): Promise<{
    success: boolean;
    order?: DecryptedOrder;
    encryptedData?: EncryptedOrderData;
    error?: string;
    roundInfo?: {
        targetRound: number;
        currentRound: number;
        availableAt: Date;
        isAvailable: boolean;
    };
}> {
    try {
        // Parse direct JSON or fetch from IPFS
        const encryptedData = await parseOrFetchEncryptedData(dataOrCid);
        
        const targetRound = encryptedData.timelock.targetRound;
        const currentRound = getCurrentRound();
        const isAvailable = currentRound >= targetRound;
        const availableAt = new Date(getRoundTimestamp(targetRound) * 1000);
        
        const roundInfo = {
            targetRound,
            currentRound,
            availableAt,
            isAvailable
        };
        
        if (!isAvailable) {
            return {
                success: false,
                encryptedData,
                roundInfo,
                error: `Round ${targetRound} not yet available. Available at ${availableAt.toISOString()}`
            };
        }
        
        // Fetch drand signature
        const signature = await fetchDrandSignature(targetRound);
        
        // Decrypt order
        const order = await decryptTimelockOrder(encryptedData, signature);
        
        return {
            success: true,
            order,
            encryptedData,
            roundInfo
        };
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message
        };
    }
}

/**
 * Recursively decrypt all orders in a chain
 * @param ipfsCid Initial IPFS CID
 * @returns Array of all decrypted orders
 */
export async function decryptOrderChain(ipfsCid: string): Promise<{
    orders: DecryptedOrder[];
    pendingRounds: number[];
    errors: string[];
}> {
    const orders: DecryptedOrder[] = [];
    const pendingRounds: number[] = [];
    const errors: string[] = [];
    
    let currentCid: string | null = ipfsCid;
    
    while (currentCid) {
        const result = await decryptOrderFromIPFS(currentCid);
        
        if (!result.success) {
            if (result.roundInfo && !result.roundInfo.isAvailable) {
                pendingRounds.push(result.roundInfo.targetRound);
            }
            if (result.error) {
                errors.push(result.error);
            }
            break;
        }
        
        if (result.order) {
            orders.push(result.order);
            
            // Check for nested ciphertext
            if (result.order.nextCiphertext) {
                // The nextCiphertext is another full encrypted order JSON
                try {
                    const nextEncrypted = JSON.parse(result.order.nextCiphertext);
                    // This is inline data, not IPFS, so we need to handle differently
                    // For now, store it as pending
                    currentCid = null;
                } catch {
                    currentCid = null;
                }
            } else {
                currentCid = null;
            }
        } else {
            break;
        }
    }
    
    return { orders, pendingRounds, errors };
}

