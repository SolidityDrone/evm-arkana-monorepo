// timelock-order.ts
// Creates timelocked encrypted swap orders with nested encryption chain
// Browser-compatible version using Web Crypto API

import { bn254 } from '@noble/curves/bn254.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/curves/utils.js';
import { ensureBufferPolyfill } from './buffer-polyfill';
import { encodeAbiParameters, parseAbiParameters, keccak256 } from 'viem';

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
    // Ensure Buffer is initialized before loading @aztec packages
    await getBuffer();
    const { poseidon2Hash } = await import('@aztec/foundation/crypto');
    return poseidon2Hash;
}

// Drand beacon config (evmnet chain - uses BN254)
const BEACON_ID = 'evmnet';
const DRAND_PUBKEY_HEX = '07e1d1d335df83fa98462005690372c643340060d205306a9aa8106b6bd0b3820557ec32c2ad488e4d4f6008f89a346f18492092ccc0d594610de2732c8b808f0095685ae3a85ba243747b1b2f426049010f6b73a0cf1d389351d5aaaa1047f6297d3a4f9749b33eb2d904c9d9ebf17224150ddd7abd7567a9bec6c74480ee0b';
const GENESIS_TIME = 1727521075;
const PERIOD = 3;

// Operation type enum (must match Solidity)
export enum OperationType {
    SWAP = 0,
    LIQUIDITY = 1
}

// Type definitions
export interface Order {
    sharesAmount?: string | bigint;
    amountOutMin?: string | bigint;
    slippageBps?: number;
    deadline?: number;
    recipient?: string;
    tokenOut?: string;
    executionFeeBps?: number;
}

// Pool Key for Uniswap V4 liquidity
export interface PoolKey {
    currency0: string;
    currency1: string;
    fee: number;
    tickSpacing: number;
    hooks: string;
}

// Liquidity order parameters
export interface LiquidityOrder {
    sharesAmount?: string | bigint;
    poolKey?: PoolKey;
    tickLower?: number;
    tickUpper?: number;
    amount0Max?: string | bigint;
    amount1Max?: string | bigint;
    deadline?: number;
    executionFeeBps?: number;
    recipient?: string;
}

export interface TimelockEncryption {
    V: { x: string; y: string };
    C1: { x0: string; x1: string; y0: string; y1: string };
    H: { x: string; y: string };
    targetRound: number;
    pairingResult: any; // Fp12 element from pairing
}

export interface AESEncryption {
    iv: string;
    ciphertext: string;
}

export interface EncryptedOrder {
    round: number;
    roundTimestamp: number;
    orderData: OrderData;
    timelock: TimelockEncryption;
    aes: AESEncryption;
    fullCiphertext: string;
    hasNextCiphertext: boolean;
    prevHash: string;
    nextHash: string;
    chunkIndex: number;
}

export interface OrderData extends Order {
    prevHash: string;
    nextHash: string;
}

export interface HashChainData {
    initialHashchain: string;
    h0: string;
    tlHashchain: string;
    totalShares: string;
}

export interface OrderChainResult {
    orders: EncryptedOrder[];
    hashChain: HashChainData;
    /** keccak256 hashes of each order chunk for integrity validation on-chain */
    orderHashes: `0x${string}`[];
}

/**
 * Compute keccak256 hash of SWAP order parameters for integrity validation
 * Must match Solidity: keccak256(abi.encode(sharesAmount, amountOutMin, slippageBps, deadline, executionFeeBps, recipient, tokenOut, drandRound))
 */
export function computeOrderHash(
    sharesAmount: bigint,
    amountOutMin: bigint,
    slippageBps: number,
    deadline: number,
    executionFeeBps: number,
    recipient: string,
    tokenOut: string,
    drandRound: number
): `0x${string}` {
    // Encode parameters matching Solidity's abi.encode
    const encoded = encodeAbiParameters(
        parseAbiParameters('uint256, uint256, uint16, uint256, uint256, address, address, uint256'),
        [
            sharesAmount,
            amountOutMin,
            slippageBps,
            BigInt(deadline),
            BigInt(executionFeeBps),
            recipient as `0x${string}`,
            tokenOut as `0x${string}`,
            BigInt(drandRound)
        ]
    );

    // Compute keccak256 hash using viem
    return keccak256(encoded);
}

/**
 * Compute keccak256 hash of LIQUIDITY order parameters for integrity validation
 * Must match Solidity: keccak256(abi.encode(sharesAmount, poolKeyHash, tickLower, tickUpper, amount0Max, amount1Max, deadline, executionFeeBps, recipient, drandRound))
 */
export function computeLiquidityOrderHash(
    sharesAmount: bigint,
    poolKey: PoolKey,
    tickLower: number,
    tickUpper: number,
    amount0Max: bigint,
    amount1Max: bigint,
    deadline: number,
    executionFeeBps: number,
    recipient: string,
    drandRound: number
): `0x${string}` {
    // First compute the poolKey hash matching Solidity
    const poolKeyEncoded = encodeAbiParameters(
        parseAbiParameters('address, address, uint24, int24, address'),
        [
            poolKey.currency0 as `0x${string}`,
            poolKey.currency1 as `0x${string}`,
            poolKey.fee,
            poolKey.tickSpacing,
            poolKey.hooks as `0x${string}`
        ]
    );
    const poolKeyHash = keccak256(poolKeyEncoded);

    // Encode all parameters
    const encoded = encodeAbiParameters(
        parseAbiParameters('uint256, bytes32, int24, int24, uint256, uint256, uint256, uint256, address, uint256'),
        [
            sharesAmount,
            poolKeyHash,
            tickLower,
            tickUpper,
            amount0Max,
            amount1Max,
            BigInt(deadline),
            BigInt(executionFeeBps),
            recipient as `0x${string}`,
            BigInt(drandRound)
        ]
    );

    return keccak256(encoded);
}

/**
 * Get current dRand round
 */
export function getCurrentRound(): number {
    const now = Math.floor(Date.now() / 1000);
    if (now < GENESIS_TIME) return 0;
    return Math.floor((now - GENESIS_TIME) / PERIOD);
}

/**
 * Get round timestamp (unix seconds)
 */
export function getRoundTimestamp(round: number): number {
    return GENESIS_TIME + (round * PERIOD);
}

/**
 * Convert a timestamp (unix seconds) to a dRand round
 * @param timestamp Unix timestamp in seconds
 * @returns The dRand round number at or after this timestamp
 */
export function timestampToRound(timestamp: number): number {
    if (timestamp < GENESIS_TIME) return 0;
    return Math.ceil((timestamp - GENESIS_TIME) / PERIOD);
}

/**
 * Convert a Date object to a dRand round
 * @param date JavaScript Date object
 * @returns The dRand round number at or after this date
 */
export function dateToRound(date: Date): number {
    return timestampToRound(Math.floor(date.getTime() / 1000));
}

/**
 * Convert a dRand round to a Date object
 * @param round The dRand round number
 * @returns Date object for when this round will be available
 */
export function roundToDate(round: number): Date {
    return new Date(getRoundTimestamp(round) * 1000);
}

/**
 * Get a human-readable time string for a round
 * @param round The dRand round number
 * @returns Formatted date/time string
 */
export function formatRoundTime(round: number): string {
    return roundToDate(round).toLocaleString();
}

/**
 * Get the minimum round (next available round from now)
 * @param offsetSeconds Optional offset in seconds from now (default 60 = 1 minute)
 * @returns The first available round after now + offset
 */
export function getMinimumRound(offsetSeconds: number = 60): number {
    const now = Math.floor(Date.now() / 1000);
    return timestampToRound(now + offsetSeconds);
}

/**
 * Hash to G1 point (BN254) - simplified version using try-and-increment
 * In production, use proper hash-to-curve
 */
async function hashToG1(message: Uint8Array): Promise<typeof bn254.G1.Point> {
    const Buffer = await getBuffer();
    const G1 = bn254.G1;
    const Fp = bn254.fields.Fp;
    const p = Fp.ORDER; // BN254 field modulus

    // BN254 curve: y^2 = x^3 + 3
    const b = 3n;

    // Hash message to get initial x coordinate
    let messageHash = sha256(message);
    let x = BigInt('0x' + Buffer.from(messageHash).toString('hex')) % p;

    // Try-and-increment: find a valid point
    for (let i = 0n; i < 256n; i++) {
        // Compute y^2 = x^3 + 3
        const x3 = (x * x % p) * x % p;
        const y2 = (x3 + b) % p;

        // Check if y^2 is a quadratic residue
        const exp = (p - 1n) / 2n;
        const legendre = modPow(y2, exp, p);

        if (legendre === 1n) {
            // y^2 is a quadratic residue, compute y
            const y = modPow(y2, (p + 1n) / 4n, p);

            // Create uncompressed point format
            const xHex = x.toString(16).padStart(64, '0');
            const yHex = y.toString(16).padStart(64, '0');
            const pointHex = '04' + xHex + yHex;

            try {
                const point = G1.Point.fromHex(pointHex);
                return point;
            } catch (e) {
                // Point not on curve, try next x
            }
        }

        // Increment x and try again
        x = (x + 1n) % p;
    }

    throw new Error('Failed to hash to G1 after 256 attempts');
}

// Helper: Modular exponentiation
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n;
    base = base % mod;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return result;
}

/**
 * KDF from pairing result (Fp12 element) - same as timelock-prep.js
 * Uses Poseidon2 to match Noir circuit implementation
 */
async function kdf(pairingResult: any): Promise<bigint> {
    const Buffer = await getBuffer();
    const pairingStr = JSON.stringify({
        c0: pairingResult.c0.toString(),
        c1: pairingResult.c1.toString()
    });
    const pairingHash = sha256(new TextEncoder().encode(pairingStr));
    const pairingFieldRaw = BigInt('0x' + Buffer.from(pairingHash).toString('hex'));

    // Aztec Fr field modulus (same as Noir)
    const FR_MODULUS = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
    const pairingField = pairingFieldRaw % FR_MODULUS;

    // Use Poseidon2 hash (same as Noir circuit)
    const poseidon2Hash = await getPoseidon2Hash();
    const fields = [pairingField];
    const kdfResult = await poseidon2Hash(fields);
    return kdfResult.toBigInt();
}

/**
 * Derive AES-128 key from pairing result
 * @param pairingResult Pairing result (Fp12 element from e(V, drandPubkey))
 * @returns AES-128 key (16 bytes)
 */
async function deriveAESKey(pairingResult: any): Promise<Uint8Array> {
    const Buffer = await getBuffer();
    // Use KDF to get a field value, then hash to 16 bytes
    const kdfValue = await kdf(pairingResult);
    const kdfBytes = Buffer.from(kdfValue.toString(16).padStart(64, '0'), 'hex');
    const keyHash = sha256(kdfBytes);
    return new Uint8Array(keyHash.slice(0, 16)); // 16 bytes for AES-128
}

/**
 * Encrypt data with AES-128-CBC using Web Crypto API
 * @param data Data to encrypt (string)
 * @param key AES-128 key (16 bytes)
 * @returns {iv, ciphertext} as hex strings
 */
async function encryptAES128(data: string, key: Uint8Array): Promise<AESEncryption> {
    const Buffer = await getBuffer();
    // Generate random IV (16 bytes)
    const iv = new Uint8Array(16);
    crypto.getRandomValues(iv);

    // Import key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC', length: 128 },
        false,
        ['encrypt']
    );

    // Encrypt data
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv },
        cryptoKey,
        new TextEncoder().encode(data)
    );

    return {
        iv: Buffer.from(iv).toString('hex'),
        ciphertext: Buffer.from(encrypted).toString('hex')
    };
}

/**
 * Decrypt data with AES-128-CBC using Web Crypto API
 * @param ciphertext Encrypted data (hex string)
 * @param key AES-128 key (16 bytes)
 * @param iv Initialization vector (hex string)
 * @returns Decrypted data as string
 */
async function decryptAES128(ciphertext: string, key: Uint8Array, iv: string): Promise<string> {
    const Buffer = await getBuffer();
    // Import key for Web Crypto API
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC', length: 128 },
        false,
        ['decrypt']
    );

    // Decrypt data
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: Buffer.from(iv, 'hex') },
        cryptoKey,
        Buffer.from(ciphertext, 'hex')
    );

    return new TextDecoder().decode(decrypted);
}

/**
 * Parse dRand public key (G2 point on BN254)
 */
function parseDrandPubkey(): typeof bn254.G2.Point {
    const G2 = bn254.G2;
    const pubkeyX0Hex = DRAND_PUBKEY_HEX.substring(0, 64);
    const pubkeyX1Hex = DRAND_PUBKEY_HEX.substring(64, 128);
    const pubkeyY0Hex = DRAND_PUBKEY_HEX.substring(128, 192);
    const pubkeyY1Hex = DRAND_PUBKEY_HEX.substring(192, 256);

    // Try different coordinate orderings (same as timelock-prep.js)
    const orderings = [
        { name: 'x0,x1,y0,y1', hex: '04' + pubkeyX0Hex + pubkeyX1Hex + pubkeyY0Hex + pubkeyY1Hex },
        { name: 'x1,x0,y1,y0', hex: '04' + pubkeyX1Hex + pubkeyX0Hex + pubkeyY1Hex + pubkeyY0Hex },
        { name: 'y1,y0,x1,x0', hex: '04' + pubkeyY1Hex + pubkeyY0Hex + pubkeyX1Hex + pubkeyX0Hex },
        { name: 'y0,y1,x0,x1', hex: '04' + pubkeyY0Hex + pubkeyY1Hex + pubkeyX0Hex + pubkeyX1Hex },
    ];

    for (const ordering of orderings) {
        try {
            const drandPubkey = G2.Point.fromHex(ordering.hex);
            return drandPubkey;
        } catch (e) {
            // Continue to next ordering
        }
    }

    throw new Error('Could not parse drand pubkey as G2 point');
}

/**
 * Create timelock encryption for a round using real dRand pairing
 * @param plaintext Plaintext to encrypt (JSON string)
 * @param targetRound Target dRand round
 * @returns {ciphertext, V, C1, H, pairingResult} for verification
 */
async function createTimelockEncryption(plaintext: string, targetRound: number): Promise<TimelockEncryption> {
    const Buffer = await getBuffer();
    const G2 = bn254.G2;
    const Fr = bn254.fields.Fr;

    // Generate random r (must be in scalar field)
    const rRaw = BigInt('0x' + Buffer.from(randomBytes(32)).toString('hex'));
    const r = Fr.create(rRaw % Fr.ORDER);

    // Hash round to G1: H = hash_to_curve(round)
    const roundBytes = new TextEncoder().encode(targetRound.toString());
    const H = await hashToG1(roundBytes);

    // V = r * H (on G1)
    const V = H.multiply(r);

    // C1 = r * G2_gen (on G2) - needed for on-chain pairing verification
    const C1 = G2.Point.BASE.multiply(r);

    // Parse dRand public key (G2 point)
    const drandPubkey = parseDrandPubkey();

    // Pairing: e(V, drandPubkey) - this is the shared secret
    const pairingResult = bn254.pairing(V, drandPubkey);

    // Get C1 affine coordinates (G2 point has Fp2 coordinates)
    const C1_affine = C1.toAffine();

    return {
        V: { x: V.x.toString(), y: V.y.toString() },
        C1: {
            x0: C1_affine.x.c0.toString(),
            x1: C1_affine.x.c1.toString(),
            y0: C1_affine.y.c0.toString(),
            y1: C1_affine.y.c1.toString()
        },
        H: { x: H.x.toString(), y: H.y.toString() },
        targetRound,
        pairingResult // Store for deriving AES key
    };
}

/**
 * Create nested encryption chain for sequential orders with hash chain verification
 * @param orders Array of order objects: [{sharesAmount, amountOutMin, slippageBps, deadline, recipient, tokenOut, executionFeeBps}, ...]
 * @param startRound Starting dRand round
 * @param roundStep Step between rounds (e.g., 1000)
 * @param userKey User key (Field) for hash chain initialization
 * @param previousNonce Previous nonce (Field) for hash chain initialization
 * @returns Array of encrypted orders with nested ciphertexts and hash chain data
 */
export async function createOrderChain(
    orders: Order[],
    startRound: number,
    roundStep: number = 1000,
    userKey: bigint,
    previousNonce: bigint
): Promise<OrderChainResult> {
    const encryptedOrders: EncryptedOrder[] = [];

    // Calculate total shares (sum of all chunks)
    const totalShares = orders.reduce((sum, order) => {
        return sum + BigInt(order.sharesAmount?.toString() || '0');
    }, 0n);

    // Get poseidon2Hash after Buffer is initialized
    const poseidon2Hash = await getPoseidon2Hash();

    // Calculate initial_hashchain = Poseidon2::hash([user_key, previous_nonce], 2)
    const initialHashchain = await poseidon2Hash([userKey, previousNonce]);
    const initialHashchainBigInt = initialHashchain.toBigInt();

    // Calculate h0 = Poseidon2::hash([initial_hashchain, amount], 2)
    // where amount = totalShares (the total shares being allocated)
    const h0 = await poseidon2Hash([initialHashchainBigInt, totalShares]);
    let currentHash = h0.toBigInt();

    // Calculate hash chain for all chunks (forward direction)
    // h1 = hash(h0, chunk1), h2 = hash(h1, chunk2), etc.
    const hashChain: bigint[] = [currentHash]; // Start with h0
    for (let i = 0; i < orders.length; i++) {
        const chunkShares = BigInt(orders[i].sharesAmount?.toString() || '0');
        const nextHash = await poseidon2Hash([currentHash, chunkShares]);
        currentHash = nextHash.toBigInt();
        hashChain.push(currentHash); // Store h1, h2, h3, ...
    }

    // The final hash (tl_hashchain) is the last element
    const tlHashchain = hashChain[hashChain.length - 1];

    // Start from the last order and work backwards
    // Each order contains the ciphertext of the next order
    for (let i = orders.length - 1; i >= 0; i--) {
        const order = orders[i];
        const round = startRound + (i * roundStep);
        const chunkIndex = i; // Index in forward order (0 = first chunk)

        // Create order JSON
        // Note: sharesAmount is encrypted (amount of shares to withdraw from Arkana)
        // amountOutMin is the target output amount for the swap
        const orderData: OrderData = {
            sharesAmount: order.sharesAmount?.toString() || '0',
            amountOutMin: order.amountOutMin?.toString() || '0',
            slippageBps: order.slippageBps || 0,
            deadline: order.deadline || 0,
            recipient: order.recipient || '',
            tokenOut: order.tokenOut || '',
            executionFeeBps: order.executionFeeBps || 0,
            // Include hash chain data for verification
            // When this chunk is decrypted, we can verify: hash(prevHash, sharesAmount) == nextHash
            prevHash: hashChain[chunkIndex].toString(), // h_i (hash before this chunk)
            nextHash: hashChain[chunkIndex + 1].toString() // h_{i+1} (hash after this chunk)
        };

        // If this is not the last order, include the next order's ciphertext
        let plaintext: string;
        if (i < orders.length - 1) {
            // Include next order's encrypted data (already encrypted in previous iteration)
            const nextOrder = encryptedOrders[0]; // Last encrypted (first in reverse order)
            plaintext = JSON.stringify({
                ...orderData,
                nextCiphertext: nextOrder.fullCiphertext // Include nested ciphertext
            });
        } else {
            // Last order in chain - no next ciphertext
            plaintext = JSON.stringify(orderData);
        }

        // Create timelock encryption (uses real dRand pairing)
        const timelock = await createTimelockEncryption(plaintext, round);

        // Derive AES-128 key from pairing result
        const aesKey = await deriveAESKey(timelock.pairingResult);

        // Encrypt order data with AES-128-CBC
        const aesEncrypted = await encryptAES128(plaintext, aesKey);

        // Full ciphertext for contract registration (AES-128-CBC encrypted JSON)
        // This is what gets registered on-chain
        const fullCiphertext = JSON.stringify({
            aes: aesEncrypted, // AES-128-CBC encrypted data
            round,
            // Include timelock proof data for on-chain verification
            timelock: {
                H: timelock.H,
                V: timelock.V,
                C1: timelock.C1,
                targetRound: timelock.targetRound
            }
        });

        const encryptedOrder: EncryptedOrder = {
            round,
            roundTimestamp: getRoundTimestamp(round),
            orderData,
            timelock,
            aes: aesEncrypted,
            fullCiphertext,
            hasNextCiphertext: i < orders.length - 1,
            // Hash chain data for verification
            prevHash: hashChain[chunkIndex].toString(),
            nextHash: hashChain[chunkIndex + 1].toString(),
            chunkIndex
        };

        // Add to beginning (since we're working backwards)
        encryptedOrders.unshift(encryptedOrder);
    }

    // Compute keccak256 hashes for each order chunk (for on-chain integrity validation)
    // These hashes are computed in forward order (matching chunk indices)
    const orderHashes: `0x${string}`[] = [];
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const round = startRound + (i * roundStep);
        
        const hash = computeOrderHash(
            BigInt(order.sharesAmount?.toString() || '0'),
            BigInt(order.amountOutMin?.toString() || '0'),
            order.slippageBps || 0,
            order.deadline || 0,
            order.executionFeeBps || 0,
            order.recipient || '',
            order.tokenOut || '',
            round
        );
        orderHashes.push(hash);
    }

    // Return encrypted orders with hash chain metadata and order hashes
    return {
        orders: encryptedOrders,
        hashChain: {
            initialHashchain: initialHashchainBigInt.toString(),
            h0: hashChain[0].toString(),
            tlHashchain: tlHashchain.toString(), // Final hash (public on-chain)
            totalShares: totalShares.toString()
        },
        orderHashes // keccak256 hashes for on-chain integrity validation
    };
}

/**
 * Create nested encryption chain for LIQUIDITY orders (Uniswap V4)
 * @param orders Array of liquidity order objects
 * @param startRound Starting dRand round
 * @param roundStep Step between rounds (e.g., 1000)
 * @param userKey User key (Field) for hash chain initialization
 * @param previousNonce Previous nonce (Field) for hash chain initialization
 * @returns Array of encrypted orders with nested ciphertexts and hash chain data
 */
export async function createLiquidityOrderChain(
    orders: LiquidityOrder[],
    startRound: number,
    roundStep: number = 1000,
    userKey: bigint,
    previousNonce: bigint
): Promise<OrderChainResult> {
    const encryptedOrders: EncryptedOrder[] = [];

    // Calculate total shares (sum of all chunks)
    const totalShares = orders.reduce((sum, order) => {
        return sum + BigInt(order.sharesAmount?.toString() || '0');
    }, 0n);

    // Get poseidon2Hash after Buffer is initialized
    const poseidon2Hash = await getPoseidon2Hash();

    // Calculate initial_hashchain = Poseidon2::hash([user_key, previous_nonce], 2)
    const initialHashchain = await poseidon2Hash([userKey, previousNonce]);
    const initialHashchainBigInt = initialHashchain.toBigInt();

    // Calculate h0 = Poseidon2::hash([initial_hashchain, amount], 2)
    const h0 = await poseidon2Hash([initialHashchainBigInt, totalShares]);
    let currentHash = h0.toBigInt();

    // Calculate hash chain for all chunks
    const hashChain: bigint[] = [currentHash];
    for (let i = 0; i < orders.length; i++) {
        const chunkShares = BigInt(orders[i].sharesAmount?.toString() || '0');
        const nextHash = await poseidon2Hash([currentHash, chunkShares]);
        currentHash = nextHash.toBigInt();
        hashChain.push(currentHash);
    }

    const tlHashchain = hashChain[hashChain.length - 1];

    // Start from the last order and work backwards
    for (let i = orders.length - 1; i >= 0; i--) {
        const order = orders[i];
        const round = startRound + (i * roundStep);
        const chunkIndex = i;

        // Create liquidity order JSON
        const orderData: any = {
            operationType: OperationType.LIQUIDITY,
            sharesAmount: order.sharesAmount?.toString() || '0',
            poolKey: order.poolKey,
            tickLower: order.tickLower || 0,
            tickUpper: order.tickUpper || 0,
            amount0Max: order.amount0Max?.toString() || '0',
            amount1Max: order.amount1Max?.toString() || '0',
            deadline: order.deadline || 0,
            executionFeeBps: order.executionFeeBps || 0,
            recipient: order.recipient || '',
            drandRound: round,
            // Hash chain data for verification
            prevHash: hashChain[chunkIndex].toString(),
            nextHash: hashChain[chunkIndex + 1].toString()
        };

        // Include next order's ciphertext if not last
        let plaintext: string;
        if (i < orders.length - 1) {
            const nextOrder = encryptedOrders[0];
            plaintext = JSON.stringify({
                ...orderData,
                nextCiphertext: nextOrder.fullCiphertext
            });
        } else {
            plaintext = JSON.stringify(orderData);
        }

        // Create timelock encryption
        const timelock = await createTimelockEncryption(plaintext, round);
        const aesKey = await deriveAESKey(timelock.pairingResult);
        const aesEncrypted = await encryptAES128(plaintext, aesKey);

        const fullCiphertext = JSON.stringify({
            aes: aesEncrypted,
            round,
            timelock: {
                H: timelock.H,
                V: timelock.V,
                C1: timelock.C1,
                targetRound: timelock.targetRound
            }
        });

        const encryptedOrder: EncryptedOrder = {
            round,
            roundTimestamp: getRoundTimestamp(round),
            orderData: orderData as OrderData,
            timelock,
            aes: aesEncrypted,
            fullCiphertext,
            hasNextCiphertext: i < orders.length - 1,
            prevHash: hashChain[chunkIndex].toString(),
            nextHash: hashChain[chunkIndex + 1].toString(),
            chunkIndex
        };

        encryptedOrders.unshift(encryptedOrder);
    }

    // Compute keccak256 hashes for each liquidity order chunk
    const orderHashes: `0x${string}`[] = [];
    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const round = startRound + (i * roundStep);

        if (!order.poolKey) throw new Error('Pool key is required for liquidity orders');
        
        const hash = computeLiquidityOrderHash(
            BigInt(order.sharesAmount?.toString() || '0'),
            order.poolKey,
            order.tickLower || 0,
            order.tickUpper || 0,
            BigInt(order.amount0Max?.toString() || '0'),
            BigInt(order.amount1Max?.toString() || '0'),
            order.deadline || 0,
            order.executionFeeBps || 0,
            order.recipient || '',
            round
        );
        orderHashes.push(hash);
    }

    return {
        orders: encryptedOrders,
        hashChain: {
            initialHashchain: initialHashchainBigInt.toString(),
            h0: hashChain[0].toString(),
            tlHashchain: tlHashchain.toString(),
            totalShares: totalShares.toString()
        },
        orderHashes
    };
}

/**
 * Decrypt order from chain (when round is available)
 * @param encryptedOrder Encrypted order object
 * @param drandSignature dRand signature for the round (G1 point)
 * @returns Decrypted order data and next ciphertext if available
 */
export async function decryptOrder(encryptedOrder: EncryptedOrder, drandSignature: any): Promise<any> {
    // Derive AES key from signature
    const aesKey = await deriveAESKey(drandSignature);

    // Decrypt AES-encrypted data
    const decrypted = await decryptAES128(encryptedOrder.aes.ciphertext, aesKey, encryptedOrder.aes.iv);
    const orderData = JSON.parse(decrypted);

    return {
        ...orderData,
        round: encryptedOrder.round
    };
}

