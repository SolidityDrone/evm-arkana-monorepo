// timelock-prep.js

import { bn254 } from '@noble/curves/bn254.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hexToBytes } from '@noble/curves/utils.js';
import { randomBytes } from '@noble/curves/utils.js';
import { webcrypto } from 'node:crypto';
import { poseidon2Hash } from '@aztec/foundation/crypto';

// Set up crypto.getRandomValues for Node.js
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = webcrypto;
}

// Drand beacon config (evmnet chain - uses BN254, not BLS12-381!)
const BEACON_ID = 'evmnet';
const DRAND_PUBKEY_HEX = '07e1d1d335df83fa98462005690372c643340060d205306a9aa8106b6bd0b3820557ec32c2ad488e4d4f6008f89a346f18492092ccc0d594610de2732c8b808f0095685ae3a85ba243747b1b2f426049010f6b73a0cf1d389351d5aaaa1047f6297d3a4f9749b33eb2d904c9d9ebf17224150ddd7abd7567a9bec6c74480ee0b';
const GENESIS_TIME = 1727521075;
const PERIOD = 3;

// Helper: KDF from pairing result (Fp12 element)
// Uses Poseidon2 to match Noir circuit implementation
async function kdf(pairingResult) {
    // Pairing result is an Fp12 element with c0 and c1 components
    // We serialize it to a Field value for Poseidon2
    // Convert pairing result to a single Field by hashing its components
    const pairingStr = JSON.stringify({
        c0: pairingResult.c0.toString(),
        c1: pairingResult.c1.toString()
    });
    const pairingHash = sha256(new TextEncoder().encode(pairingStr));
    const pairingFieldRaw = BigInt('0x' + Buffer.from(pairingHash).toString('hex'));

    // Aztec Fr field modulus (same as Noir)
    // Fr modulus for Grumpkin/BN254: 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001
    const FR_MODULUS = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
    const pairingField = pairingFieldRaw % FR_MODULUS;

    // Use Poseidon2 hash (same as Noir circuit)
    // poseidon2Hash takes an array of fields and returns a field (async)
    const fields = [pairingField];
    const kdfResult = await poseidon2Hash(fields);

    // Convert result to BigInt
    return kdfResult.toBigInt();
}

// Helper: Get current round
function getCurrentRound() {
    const now = Math.floor(Date.now() / 1000);
    return Math.floor((now - GENESIS_TIME) / PERIOD);
}

// Helper: Hash to G1 curve point (try-and-increment method)
// This simulates hash_to_curve for BN254 G1
function hashToG1(message) {
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

        // Check if y^2 is a quadratic residue (has a square root in Fp)
        // Use Euler's criterion: y^2^((p-1)/2) == 1 mod p
        const exp = (p - 1n) / 2n;
        const legendre = modPow(y2, exp, p);

        if (legendre === 1n) {
            // y^2 is a quadratic residue, compute y = sqrt(y^2)
            // For p ≡ 3 mod 4, y = y^2^((p+1)/4) mod p
            const y = modPow(y2, (p + 1n) / 4n, p);

            // Create uncompressed point format: 0x04 + x (32 bytes) + y (32 bytes)
            const xHex = x.toString(16).padStart(64, '0');
            const yHex = y.toString(16).padStart(64, '0');
            const pointHex = '04' + xHex + yHex;

            try {
                const point = G1.Point.fromHex(pointHex);
                return point;
            } catch (e) {
                // Point not on curve (shouldn't happen), try next x
            }
        }

        // Increment x and try again
        x = (x + 1n) % p;
    }

    throw new Error('Failed to hash to G1 after 256 attempts');
}

// Helper: Modular exponentiation
function modPow(base, exp, mod) {
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

// Main function: prepare inputs for circuit
export async function prepareCircuitInputs(plaintext, targetRound, randomness = null) {
    // BN254 curve (not BLS12-381!)
    // For BN254, we only have G1 (no G2)
    const G1 = bn254.G1;

    // Parse drand public key
    // For BN254 "bls-bn254-unchained-on-g1" scheme:
    // - Signatures are on G1
    // - Public keys are on G2 (128 bytes = 4 x 32 bytes for Fp2 coordinates)
    // The hex is 256 chars = 128 bytes (G2 point in Fp2: x = (x0, x1), y = (y0, y1))
    const G2 = bn254.G2;

    // G2 point format: x0 (32 bytes) + x1 (32 bytes) + y0 (32 bytes) + y1 (32 bytes)
    const pubkeyX0Hex = DRAND_PUBKEY_HEX.substring(0, 64);
    const pubkeyX1Hex = DRAND_PUBKEY_HEX.substring(64, 128);
    const pubkeyY0Hex = DRAND_PUBKEY_HEX.substring(128, 192);
    const pubkeyY1Hex = DRAND_PUBKEY_HEX.substring(192, 256);

    // Convert to BigInt for public inputs
    const pubkeyX0 = BigInt('0x' + pubkeyX0Hex);
    const pubkeyX1 = BigInt('0x' + pubkeyX1Hex);
    const pubkeyY0 = BigInt('0x' + pubkeyY0Hex);
    const pubkeyY1 = BigInt('0x' + pubkeyY1Hex);

    // Try creating G2 point - the format might be different from @noble/curves expectation
    // @noble/curves expects: 0x04 + x_c0 (32) + x_c1 (32) + y_c0 (32) + y_c1 (32) = 129 bytes
    // drand might use a different order: x_c1 || x_c0 || y_c1 || y_c0 or similar
    let drandPubkey;

    // Try different coordinate orderings
    const orderings = [
        // Original order: x0, x1, y0, y1
        { name: 'x0,x1,y0,y1', hex: '04' + pubkeyX0Hex + pubkeyX1Hex + pubkeyY0Hex + pubkeyY1Hex },
        // Swapped within pairs: x1, x0, y1, y0
        { name: 'x1,x0,y1,y0', hex: '04' + pubkeyX1Hex + pubkeyX0Hex + pubkeyY1Hex + pubkeyY0Hex },
        // Fully reversed: y1, y0, x1, x0
        { name: 'y1,y0,x1,x0', hex: '04' + pubkeyY1Hex + pubkeyY0Hex + pubkeyX1Hex + pubkeyX0Hex },
        // y0, y1, x0, x1
        { name: 'y0,y1,x0,x1', hex: '04' + pubkeyY0Hex + pubkeyY1Hex + pubkeyX0Hex + pubkeyX1Hex },
    ];

    for (const ordering of orderings) {
        try {
            drandPubkey = G2.Point.fromHex(ordering.hex);
            console.log(`G2 point created successfully with ordering: ${ordering.name}`);
            break;
        } catch (e) {
            // Continue to next ordering
        }
    }

    if (!drandPubkey) {
        console.error('Failed to parse G2 point with any coordinate ordering');
        console.log('Pubkey coordinates:');
        console.log('  x0:', pubkeyX0Hex);
        console.log('  x1:', pubkeyX1Hex);
        console.log('  y0:', pubkeyY0Hex);
        console.log('  y1:', pubkeyY1Hex);
        throw new Error('Could not parse drand pubkey as G2 point');
    }

    // 1. Generate or use provided random scalar
    let r;
    if (randomness) {
        r = bn254.fields.Fr.create(BigInt(randomness));
    } else {
        const randomBytes32 = randomBytes(32);
        const randomBigInt = BigInt('0x' + Array.from(randomBytes32).map(b => b.toString(16).padStart(2, '0')).join(''));
        r = bn254.fields.Fr.create(randomBigInt);
    }

    // 2. Hash round number to G1
    const roundBytes = new TextEncoder().encode(targetRound.toString());
    const H = hashToG1(roundBytes);

    // 3. Compute V = r * H
    const V = H.multiply(r);

    // 4. Pairing: e(V, drandPubkey)
    // For BN254: G1 x G2 -> GT
    // V is on G1, drandPubkey is on G2
    const pairingResult = bn254.pairing(V, drandPubkey);

    // 5. Derive key using KDF (Poseidon2, same as Noir)
    const K = await kdf(pairingResult);

    // 6. Encrypt (simple field addition)
    const FIELD_MODULUS = bn254.fields.Fr.ORDER;
    const plaintextBigInt = BigInt(plaintext);
    const ciphertext = (plaintextBigInt + K) % FIELD_MODULUS;

    // Convert pairing result to Field (for circuit public input)
    // Pairing result is in GT (Fp12), we need to serialize it to a Field
    // For simplicity, we hash the pairing result string representation to get a Field value
    const pairingStr = JSON.stringify({
        c0: pairingResult.c0.toString(),
        c1: pairingResult.c1.toString()
    });
    const pairingHash = sha256(new TextEncoder().encode(pairingStr));
    const pairingResultField = BigInt('0x' + Buffer.from(pairingHash).toString('hex')) % FIELD_MODULUS;

    return {
        // Private witness for circuit
        private: {
            plaintext: plaintext.toString(),
            randomness: r.toString(),
            H_x: H.x.toString(),
            H_y: H.y.toString()
        },
        // Public inputs for circuit
        public: {
            targetRound: targetRound,
            V_x: V.x.toString(),
            V_y: V.y.toString(),
            pairingResult: pairingResultField.toString(),
            // G2 pubkey coordinates (Fp2)
            drandPubkey_x0: pubkeyX0.toString(),
            drandPubkey_x1: pubkeyX1.toString(),
            drandPubkey_y0: pubkeyY0.toString(),
            drandPubkey_y1: pubkeyY1.toString(),
            ciphertext: ciphertext.toString()
        },
        // Additional info for verification
        computed: {
            H: { x: H.x.toString(), y: H.y.toString() },
            V: { x: V.x.toString(), y: V.y.toString() },
            K: K.toString(),
            pairingResultGT: pairingResult.toString() // Full GT element
        }
    };
}

// Decrypt function (after targetRound arrives)
export async function decryptCiphertext(publicInputs) {
    const { targetRound, U, ciphertext } = publicInputs;

    // 1. Fetch drand signature
    const response = await fetch(
        `https://api.drand.sh/v2/beacons/${BEACON_ID}/rounds/${targetRound}`,
        { headers: { 'Accept': 'application/json' } }
    );
    const data = await response.json();
    const signatureHex = data.signature;

    // 2. Parse points
    const G1 = bn254.G1;
    const signatureBytes = hexToBytes(signatureHex);
    const U_bytes = hexToBytes(U);
    const signature = G1.Point.fromBytes(signatureBytes);
    const U_point = G1.Point.fromBytes(U_bytes);

    // 3. Pairing: e(U, signature)
    // For BN254, both points are on G1
    const shared = bn254.pairing(U_point, signature);

    // 4. Derive same key
    const K = kdf(shared);

    // 5. Decrypt
    const FIELD_MODULUS = bn254.fields.Fr.ORDER;
    const ciphertextBigInt = BigInt(ciphertext);
    const plaintext = (ciphertextBigInt - K + FIELD_MODULUS) % FIELD_MODULUS;

    return plaintext.toString();
}

// Example usage
async function example() {
    const plaintext = 42n;
    const targetRound = 14161727; // Example round from test

    // Use specific randomness for reproducibility (from test)
    const randomness = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

    console.log('=== DRAND TIMELOCK ENCRYPTION PREPARATION ===\n');
    console.log('Plaintext:', plaintext.toString());
    console.log('Target Round:', targetRound);
    console.log('');

    // Prepare circuit inputs (now async due to Poseidon2)
    const inputs = await prepareCircuitInputs(plaintext, targetRound, randomness);

    console.log('=== PRIVATE INPUTS (for circuit witness) ===');
    console.log('plaintext:', inputs.private.plaintext);
    console.log('randomness:', inputs.private.randomness);
    console.log('H_x:', inputs.private.H_x);
    console.log('H_y:', inputs.private.H_y);
    console.log('');

    console.log('=== PUBLIC INPUTS (for circuit) ===');
    console.log('target_round:', inputs.public.targetRound);
    console.log('V_x:', inputs.public.V_x);
    console.log('V_y:', inputs.public.V_y);
    console.log('pairing_result:', inputs.public.pairingResult);
    console.log('drand_pubkey (G2):');
    console.log('  x0:', inputs.public.drandPubkey_x0);
    console.log('  x1:', inputs.public.drandPubkey_x1);
    console.log('  y0:', inputs.public.drandPubkey_y0);
    console.log('  y1:', inputs.public.drandPubkey_y1);
    console.log('ciphertext:', inputs.public.ciphertext);
    console.log('');

    console.log('=== COMPUTED VALUES (for verification) ===');
    console.log('H:', inputs.computed.H);
    console.log('V:', inputs.computed.V);
    console.log('K:', inputs.computed.K);
    console.log('');

    console.log('✅ All values computed successfully!');
    console.log('These can be used as inputs to the Noir circuit.');
}

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    example();
}

