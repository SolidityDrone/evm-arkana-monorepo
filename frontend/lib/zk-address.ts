/**
 * Zero-knowledge address computation and utilities
 * 
 * The zkAddress is derived from an Ethereum signature using:
 * 1. Poseidon2 hash of signature chunks → private key
 * 2. Baby Jubjub public key derivation → zkAddress
 */

import { ensureBufferPolyfill, polyfillBufferBigIntMethods } from './buffer-polyfill';
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
 * 2. Compute Poseidon2 hash of chunks → This is the private key (numeric)
 * 3. Derive Baby Jubjub public key from private key using BASE8 generator
 * 4. Format as zk+{pubkey_x}{pubkey_y} (concatenated hex coordinates)
 * 
 * The public key is derived on Baby Jubjub using the Poseidon2 hash
 * of the Ethereum signature chunks as the private key.
 */
export async function computeZkAddress(signature: string): Promise<string> {
    try {
        // Ensure Buffer is available before importing @aztec packages
        // This is critical because @aztec/bb.js uses Buffer during module evaluation
        await ensureBufferPolyfill();

        // Double-check Buffer is available and has the required method
        if (!globalThis.Buffer || typeof globalThis.Buffer.prototype.writeBigUInt64BE !== 'function') {
            throw new Error('Buffer polyfill is not properly initialized. writeBigUInt64BE method is missing.');
        }

        // Ensure Buffer is available in ALL possible scopes where @aztec/bb.js might look
        if (typeof window !== 'undefined') {
            // @ts-ignore
            window.Buffer = globalThis.Buffer;
            // @ts-ignore
            (window as any).global = window;
            // @ts-ignore
            (window as any).global.Buffer = globalThis.Buffer;
        }
        if (typeof global !== 'undefined') {
            // @ts-ignore
            global.Buffer = globalThis.Buffer;
        }

        // Also check if webpack ProvidePlugin made Buffer available (for Turbopack compatibility)
        // @ts-ignore
        if (typeof Buffer !== 'undefined' && Buffer !== globalThis.Buffer) {
            // @ts-ignore
            globalThis.Buffer = Buffer;
        }

        // Polyfill BigInt methods if they don't exist (buffer v6.0.3 doesn't have them)
        polyfillBufferBigIntMethods(globalThis.Buffer);

        // Create a test buffer to verify writeBigUInt64BE works before importing
        const testBuf = globalThis.Buffer.alloc(8);

        // Check if the method exists after polyfill
        if (typeof testBuf.writeBigUInt64BE !== 'function') {
            throw new Error(
                `Buffer.writeBigUInt64BE is not available even after polyfill. ` +
                `This method is required by @aztec/bb.js`
            );
        }

        try {
            testBuf.writeBigUInt64BE(BigInt(1), 0);
        } catch (e) {
            throw new Error(
                `Buffer.writeBigUInt64BE exists but threw an error: ${(e as Error).message}. ` +
                `Buffer polyfill may be incomplete or incompatible.`
            );
        }

        // Now import @aztec/foundation/crypto for Poseidon2 hashing
        const cryptoModule = await import('@aztec/foundation/crypto');
        const { poseidon2Hash } = cryptoModule;

        // Convert signature hex string to Buffer (remove 0x prefix if present)
        const sigHex = signature.startsWith('0x') ? signature.slice(2) : signature;
        const sigBuffer = globalThis.Buffer.from(sigHex, 'hex');

        // Verify signature is 65 bytes
        if (sigBuffer.length !== 65) {
            throw new Error(`Signature must be 65 bytes, got ${sigBuffer.length}`);
        }

        // Split signature into 31, 31, 3 bytes
        const chunk1 = sigBuffer.slice(0, 31);  // First 31 bytes
        const chunk2 = sigBuffer.slice(31, 62); // Next 31 bytes
        const chunk3 = sigBuffer.slice(62, 65); // Last 3 bytes

        // Convert each chunk to bigint (big-endian)
        // Each chunk fits in the BN254 field (31 bytes = 248 bits < 254 bits)
        const chunk1BigInt = BigInt('0x' + chunk1.toString('hex'));
        const chunk2BigInt = BigInt('0x' + chunk2.toString('hex'));
        const chunk3BigInt = BigInt('0x' + chunk3.toString('hex'));

        // Compute poseidon hash of the three chunks
        // This poseidon hash is the private key (numeric value, not converted to hex)
        const poseidonHash = await poseidon2Hash([chunk1BigInt, chunk2BigInt, chunk3BigInt]);

        // Convert poseidon2 result to bigint (keep as numeric, don't convert to hex)
        let privateKey: bigint;
        if (typeof poseidonHash === 'bigint') {
            privateKey = poseidonHash;
        } else if ('toBigInt' in poseidonHash && typeof (poseidonHash as any).toBigInt === 'function') {
            privateKey = (poseidonHash as any).toBigInt();
        } else if ('value' in poseidonHash) {
            privateKey = BigInt((poseidonHash as any).value);
        } else {
            privateKey = BigInt((poseidonHash as any).toString());
        }

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
    // Remove "zk" prefix if present
    let pubKeyHex = zkAddress.startsWith('zk') ? zkAddress.slice(2) : zkAddress;

    // Remove "0x" prefix if present
    pubKeyHex = pubKeyHex.startsWith('0x') ? pubKeyHex.slice(2) : pubKeyHex;

    // Each coordinate is 64 hex characters (256 bits)
    // Total should be 128 hex characters
    if (pubKeyHex.length !== 128) {
        throw new Error(`Invalid zkAddress format: expected 128 hex characters (64 for x + 64 for y), got ${pubKeyHex.length}`);
    }

    // Extract x and y coordinates
    const pubKeyXHex = pubKeyHex.slice(0, 64);
    const pubKeyYHex = pubKeyHex.slice(64, 128);

    // Convert to bigints
    const x = BigInt('0x' + pubKeyXHex);
    const y = BigInt('0x' + pubKeyYHex);

    return { x, y };
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
