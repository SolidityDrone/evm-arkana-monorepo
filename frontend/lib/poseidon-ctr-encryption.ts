/**
 * TypeScript implementation of Poseidon CTR Mode Encryption
 * Matches the Noir implementation in circuits/lib/poseidon-ctr-encryption/src/lib.nr
 * 
 * Provides Poseidon-based encryption in CTR mode for field elements.
 * Includes functions for encrypting individual fields and batch encryption.
 */

// BN254 scalar field modulus
const BN254_SCALAR_FIELD_MODULUS = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

/**
 * Ensure counter is within u32 range (0 to 4294967295)
 */
function validateCounter(counter: number): void {
    if (!Number.isInteger(counter) || counter < 0 || counter > 4294967295) {
        throw new Error(`Counter must be a u32 (0 to 4294967295), got: ${counter}`);
    }
}

/**
 * Reduce a bigint to the BN254 scalar field
 */
function reduceToField(value: bigint): bigint {
    return value % BN254_SCALAR_FIELD_MODULUS;
}

/**
 * Generate a keystream using Poseidon with key and nonce
 * Matches: pub fn poseidon_keystream(key: Field, nonce: u32) -> Field
 */
export async function poseidonKeystream(key: bigint, nonce: number): Promise<bigint> {
    validateCounter(nonce);

    // Ensure Buffer polyfill is available
    const { ensureBufferPolyfill } = await import('@/lib/buffer-polyfill');
    await ensureBufferPolyfill();

    // Dynamic import of poseidon2Hash
    const { poseidon2Hash } = await import('@aztec/foundation/crypto');

    // Reduce key to field
    const keyField = reduceToField(key);

    // Generate keystream using Poseidon2 with key and nonce
    // Poseidon2::hash([key, nonce as Field], 2)
    const keystream = await poseidon2Hash([keyField, BigInt(nonce)]);

    // Convert to bigint
    let keystreamBigInt: bigint;
    if (typeof keystream === 'bigint') {
        keystreamBigInt = keystream;
    } else if ('toBigInt' in keystream && typeof (keystream as any).toBigInt === 'function') {
        keystreamBigInt = (keystream as any).toBigInt();
    } else if ('value' in keystream) {
        keystreamBigInt = BigInt((keystream as any).value);
    } else {
        keystreamBigInt = BigInt((keystream as any).toString());
    }

    return reduceToField(keystreamBigInt);
}

/**
 * Encrypt a single field using Poseidon CTR mode
 * Matches: pub fn poseidon_ctr_encrypt(plaintext: Field, key: Field, counter: u32) -> Field
 */
export async function poseidonCtrEncrypt(
    plaintext: bigint,
    key: bigint,
    counter: number
): Promise<bigint> {
    validateCounter(counter);

    // Reduce plaintext to field
    const plaintextField = reduceToField(plaintext);

    // Generate keystream using Poseidon with key and counter
    const keystream = await poseidonKeystream(key, counter);

    // Encrypt by adding keystream to plaintext (field arithmetic equivalent of XOR)
    // ciphertext = plaintext + keystream
    const ciphertext = reduceToField(plaintextField + keystream);

    return ciphertext;
}

/**
 * Decrypt a single field using Poseidon CTR mode
 * Matches: pub fn poseidon_ctr_decrypt(ciphertext: Field, key: Field, counter: u32) -> Field
 */
export async function poseidonCtrDecrypt(
    ciphertext: bigint,
    key: bigint,
    counter: number
): Promise<bigint> {
    validateCounter(counter);

    // Reduce ciphertext to field
    const ciphertextField = reduceToField(ciphertext);

    // Generate the same keystream
    const keystream = await poseidonKeystream(key, counter);

    // Decrypt by subtracting keystream from ciphertext
    // plaintext = ciphertext - keystream
    // Handle negative result by adding field modulus
    const plaintext = reduceToField(ciphertextField + BN254_SCALAR_FIELD_MODULUS - keystream);

    return plaintext;
}


