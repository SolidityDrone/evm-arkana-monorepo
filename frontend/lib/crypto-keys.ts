/**
 * Cryptographic key generation utilities
 * Baby Jubjub curve operations for public key derivation
 */

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

