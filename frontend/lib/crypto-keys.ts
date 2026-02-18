/**
 * Cryptographic key generation utilities
 * Baby Jubjub curve operations for public key derivation and ECDH for incoming notes
 */

const BN254_FR = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

/**
 * Generate public key from private key using Baby Jubjub curve
 * Uses BASE8 generator point as specified in EIP-2494
 */
export async function generatePublicKey(privateKey: bigint): Promise<{ x: bigint; y: bigint }> {
    // Dynamic import to avoid SSR issues
    const { babyjubjub } = await import('@noble/curves/misc.js');

    // Use BASE8 (also called Base8), which is the standard base point for Baby Jubjub
    // BASE8 = 8 * Generator
    // Coordinates from: https://eips.ethereum.org/EIPS/eip-2494
    const BASE8_X = BigInt('5299619240641551281634865583518297030282874472190772894086521144482721001553');
    const BASE8_Y = BigInt('16950150798460657717958625567821834550301663161624707787222815936182638968203');

    const BASE8 = babyjubjub.Point.fromAffine({ x: BASE8_X, y: BASE8_Y });
    const publicKeyPoint = BASE8.multiply(privateKey);

    return { x: publicKeyPoint.x, y: publicKeyPoint.y };
}

/**
 * ECDH: compute shared_key_hash for decrypting an incoming note.
 * Circuit encrypts with shared_key_hash = Poseidon(shared_key) where shared_key = x(sender_private * receiver_public).
 * As receiver we compute shared_key = x(receiver_private * sender_public) (same by commutativity).
 * Returns the key to use with poseidonCtrDecrypt(encryptedAmount, key, 0).
 */
export async function computeSharedKeyHashForNote(
    receiverPrivateKey: bigint,
    senderPublicKeyX: bigint,
    senderPublicKeyY: bigint
): Promise<bigint> {
    const { babyjubjub } = await import('@noble/curves/misc.js');
    const { poseidonHash } = await import('@/lib/circuit-utils');

    const senderPoint = babyjubjub.Point.fromAffine({
        x: senderPublicKeyX,
        y: senderPublicKeyY,
    });
    const sharedPoint = senderPoint.multiply(receiverPrivateKey);
    const sharedKey = sharedPoint.x % BN254_FR;
    const sharedKeyHash = await poseidonHash([sharedKey]);
    return typeof sharedKeyHash === 'bigint' ? sharedKeyHash : BigInt(sharedKeyHash.toString());
}

