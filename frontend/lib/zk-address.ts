/**
 * Zero-knowledge address computation and utilities
 *
 * The zkAddress is derived from an Ethereum signature using:
 * 1. Poseidon hash of signature chunks → private key
 * 2. Baby Jubjub public key derivation → zkAddress
 */

import { ensureBufferPolyfill } from './buffer-polyfill';
import { computePrivateKeyFromSignature } from './circuit-utils';
import { generatePublicKey } from './crypto-keys';

/**
 * The sacred incantation that binds your Ethereum signature to the Arkana network.
 * This signature becomes your arcane key, unlocking the cryptographic rituals
 * that shield your transactions in the void.
 * 
 * ⚠️ WARNING: This signature is your access key to the network and required for client-side proving.
 * Guard it as you would guard the most powerful spell in your grimoire.
 * Never share this signature with others, lest they gain access to your arcane identity.
 * 
 * 🔮 VERIFICATION: Ensure the domain you are connected to is correct before signing.
 * The void is vast, and malicious entities may attempt to intercept your arcane key.
 */
export const ARKANA_MESSAGE = `By signing this message, you invoke the ancient cryptographic rituals of Arkana.

This signature shall become your arcane key—a binding seal that grants you access to the privacy magery network.
Through this signature, your transactions shall be shrouded in cryptographic sorcery, invisible to prying eyes.

This signature is required for client-side proving and must remain in your possession.
Do not share this signature with others, for it is the key to your arcane identity.

⚠️  CAUTION: Verify that the domain you are connected to is correct before proceeding.
The void is vast, and only the true Arkana domain can safely bind your arcane key.`;

/**
 * Compute zkAddress from an Ethereum signature
 * 
 * Flow:
 * 1. Split 65-byte Ethereum signature into chunks: 31, 31, 3 bytes
 * 2. Compute Poseidon hash of chunks → This is the private key (numeric)
 * 3. Derive Baby Jubjub public key from private key using BASE8 generator
 * 4. Format as zk+{pubkey_x}{pubkey_y} (concatenated hex coordinates)
 */
export async function computeZkAddress(signature: string): Promise<string> {
    try {
        await ensureBufferPolyfill();

        const privateKeyHex = await computePrivateKeyFromSignature(signature);
        const privateKey = BigInt(privateKeyHex)

        // Derive public key from private key using Baby Jubjub
        const publicKey = await generatePublicKey(privateKey);

        // Format public key as hex string: concatenate x and y coordinates
        // Remove 0x prefix if present and pad to ensure consistent length
        const pubKeyXHex = publicKey.x.toString(16).padStart(64, '0');
        const pubKeyYHex = publicKey.y.toString(16).padStart(64, '0');
        const pubKeyHex = pubKeyXHex + pubKeyYHex;

        // Return as hex string (will be formatted as zk+{pubkey} in useZkAddress hook)
        return pubKeyHex;
    } catch (error) {
        console.error('Error computing zkAddress:', error);
        throw error;
    }
}

/**
 * Sign message and compute zkAddress
 */
export async function signAndComputeZkAddress(
    signMessage: (message: string) => Promise<string>
): Promise<string> {
    const signature = await signMessage(ARKANA_MESSAGE);
    return await computeZkAddress(signature);
}

const HEX_ONLY = /^[0-9a-fA-F]+$/;

/**
 * Validate zkAddress and optionally return parsed x, y.
 * Does not throw; returns { valid, x?, y?, error? }.
 *
 * Format: zk{pubkey_x}{pubkey_y} or 128 hex chars
 * - pubkey_x: 64 hex characters (256 bits)
 * - pubkey_y: 64 hex characters (256 bits)
 */
export function validateZkAddress(zkAddress: string): {
    valid: boolean;
    x?: bigint;
    y?: bigint;
    error?: string;
} {
    if (!zkAddress || !zkAddress.trim()) {
        return { valid: false, error: 'Enter a zk address' };
    }
    let pubKeyHex = zkAddress.trim().startsWith('zk') ? zkAddress.trim().slice(2) : zkAddress.trim();
    pubKeyHex = pubKeyHex.startsWith('0x') ? pubKeyHex.slice(2) : pubKeyHex;

    if (pubKeyHex.length !== 128) {
        return {
            valid: false,
            error: `Expected 128 hex characters (64 for x + 64 for y), got ${pubKeyHex.length}`,
        };
    }
    if (!HEX_ONLY.test(pubKeyHex)) {
        return { valid: false, error: 'zk address must contain only hex characters (0-9, a-f)' };
    }

    try {
        const pubKeyXHex = pubKeyHex.slice(0, 64);
        const pubKeyYHex = pubKeyHex.slice(64, 128);
        const x = BigInt('0x' + pubKeyXHex);
        const y = BigInt('0x' + pubKeyYHex);
        return { valid: true, x, y };
    } catch (e) {
        return { valid: false, error: e instanceof Error ? e.message : 'Invalid zk address' };
    }
}

/**
 * Parse zkAddress back to x and y coordinates
 * 
 * Format: zk{pubkey_x}{pubkey_y}
 * - pubkey_x: 64 hex characters (256 bits)
 * - pubkey_y: 64 hex characters (256 bits)
 * 
 * @param zkAddress - The zkAddress string (with or without "zk" prefix)
 * @returns Object with x and y coordinates as bigints
 */
export function parseZkAddress(zkAddress: string): { x: bigint; y: bigint } {
    const result = validateZkAddress(zkAddress);
    if (!result.valid || result.x === undefined || result.y === undefined) {
        throw new Error(result.error ?? 'Invalid zkAddress format');
    }
    return { x: result.x, y: result.y };
}

/**
 * Construct zkAddress from x and y coordinates
 * 
 * @param x - X coordinate as bigint or string
 * @param y - Y coordinate as bigint or string
 * @returns zkAddress string in format zk{pubkey_x}{pubkey_y}
 */
export function constructZkAddress(x: bigint | string, y: bigint | string): string {
    const xBigInt = typeof x === 'string' ? BigInt(x) : x;
    const yBigInt = typeof y === 'string' ? BigInt(y) : y;

    // Convert to hex and pad to 64 characters each
    const pubKeyXHex = xBigInt.toString(16).padStart(64, '0');
    const pubKeyYHex = yBigInt.toString(16).padStart(64, '0');

    // Concatenate and add "zk" prefix
    return 'zk' + pubKeyXHex + pubKeyYHex;
}
