/**
 * Timelock decryption utilities
 * Decrypts AES-128-CBC encrypted orders using dRand signatures
 */

import { bn254 } from '@noble/curves/bn254.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { createDecipheriv } from 'node:crypto';
import { poseidon2Hash } from '@aztec/foundation/crypto';
import { fetchDrandSignature } from './drand.js';
import { Buffer } from 'node:buffer';

/**
 * Parse G1 signature from hex string
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
 * KDF from pairing result (Fp12 element)
 * Uses Poseidon2 to match Noir circuit implementation
 */
async function kdf(pairingResult: any): Promise<bigint> {
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
    const fields = [pairingField];
    const kdfResult = await poseidon2Hash(fields);
    return kdfResult.toBigInt();
}

/**
 * Derive AES-128 key from pairing result
 */
async function deriveAESKey(pairingResult: any): Promise<Uint8Array> {
    // Use KDF to get a field value, then hash to 16 bytes
    const kdfValue = await kdf(pairingResult);
    const kdfBytes = Buffer.from(kdfValue.toString(16).padStart(64, '0'), 'hex');
    const keyHash = sha256(kdfBytes);
    return new Uint8Array(keyHash.slice(0, 16)); // 16 bytes for AES-128
}

/**
 * Decrypt data with AES-128-CBC
 */
function decryptAES128(ciphertext: string, key: Uint8Array, iv: string): string {
    const decipher = createDecipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * Parse C1 point from timelock data
 */
function parseC1Point(c1: { x0: string; x1: string; y0: string; y1: string }): typeof bn254.G2.Point {
    const G2 = bn254.G2;
    
    // Convert BigInt strings to hex (remove '0x' prefix if present, pad to 64 chars)
    const toHex = (val: string | number): string => {
        if (typeof val === 'number') {
            return val.toString(16).padStart(64, '0');
        }
        // Handle BigInt string (may be decimal or hex)
        let num: bigint;
        if (val.startsWith('0x')) {
            num = BigInt(val);
        } else {
            num = BigInt(val);
        }
        return num.toString(16).padStart(64, '0');
    };
    
    const x0Hex = toHex(c1.x0);
    const x1Hex = toHex(c1.x1);
    const y0Hex = toHex(c1.y0);
    const y1Hex = toHex(c1.y1);
    
    // Try different coordinate orderings (same as encryption)
    const orderings = [
        { name: 'x0,x1,y0,y1', hex: '04' + x0Hex + x1Hex + y0Hex + y1Hex },
        { name: 'x1,x0,y1,y0', hex: '04' + x1Hex + x0Hex + y1Hex + y0Hex },
        { name: 'y1,y0,x1,x0', hex: '04' + y1Hex + y0Hex + x1Hex + x0Hex },
        { name: 'y0,y1,x0,x1', hex: '04' + y0Hex + y1Hex + x0Hex + x1Hex },
    ];

    for (const ordering of orderings) {
        try {
            const point = G2.Point.fromHex(ordering.hex);
            return point;
        } catch (e) {
            // Continue to next ordering
        }
    }

    throw new Error('Could not parse C1 as G2 point');
}

/**
 * Decrypt timelock encrypted order
 * @param ciphertextBytes The full ciphertext bytes from the contract
 * @param targetRound The target dRand round
 * @returns Decrypted order data
 */
export async function decryptTimelockOrder(
    ciphertextBytes: Uint8Array,
    targetRound: number
): Promise<any> {
    // Parse the ciphertext JSON
    const ciphertextStr = new TextDecoder().decode(ciphertextBytes);
    const ciphertextData = JSON.parse(ciphertextStr);

    if (!ciphertextData.aes || !ciphertextData.timelock) {
        throw new Error('Invalid ciphertext structure');
    }

    const { aes, timelock } = ciphertextData;
    const { iv, ciphertext } = aes;
    const { C1 } = timelock;

    // Fetch dRand signature for the round
    const signature = await fetchDrandSignature(targetRound);
    const sigmaPoint = parseG1Signature(signature);

    // Parse C1 point from timelock data
    const C1Point = parseC1Point(C1);

    // Compute pairing: e(signature, C1) = e(s*H, r*G2) = e(r*H, s*G2) = e(V, P)
    const pairingResult = bn254.pairing(sigmaPoint, C1Point);

    // Derive AES-128 key from pairing result
    const aesKey = await deriveAESKey(pairingResult);

    // Decrypt AES-encrypted data
    const decrypted = decryptAES128(ciphertext, aesKey, iv);
    const orderData = JSON.parse(decrypted);

    return {
        ...orderData,
        round: targetRound,
        nextCiphertext: orderData.nextCiphertext // May contain nested order
    };
}

