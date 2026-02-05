/**
 * TypeScript implementation of pedersen_commitment_non_hiding
 * Matches the Noir implementation in circuits/lib/pedersen-commitments/src/pedersen_commitments.nr
 * 
 * Uses Grumpkin curve (BN254 scalar field) with generators G and D
 * Commitment: m*G + token_address*D
 */

// Grumpkin curve field modulus (BN254 scalar field)
const GRUMPKIN_FIELD_MODULUS = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

// Hardcoded generators matching Noir's derive_generators("PEDERSEN_COMMITMENT", 0)
// Generator G (for shares) - MUST match Generators.sol
export const GENERATOR_G = {
  x: BigInt('0x0949873ea2ea8f16b075c794aecf36efd5da1c9c8679737e7ec1aff775cc3b5c'),
  y: BigInt('0x1336d7f5bf34c2fe63e44461e86dd0a86b852c30d9c7213dd6c5d434ea3f9d38')
};

// Generator H (for nullifier) - MUST match Generators.sol
const GENERATOR_H = {
  x: BigInt('0x229d4910f0d7e6fd2bed571a885241049eee73d5f9adc0d9ef2ce724aa1df3fa'),
  y: BigInt('0x20f8c9b24f986b93052ab51f5068bc690e35e9508d5b0951b0d4cad1ea04b28e')
};

// Generator D (for spending_key) - MUST match Generators.sol
const GENERATOR_D = {
  x: BigInt('0x2bcc449b1a2840cf9327f846fe78db60aad3ddecff43c3c3facd13aba3cb1479'),
  y: BigInt('0x25e9a7bcc28000fc69f14bbe8a2ec561fd854ea6489f38e63ba4a40d34113717')
};

// Generator K (for unlocks_at) - MUST match Generators.sol
const GENERATOR_K = {
  x: BigInt('0x19355291a8bf98b3533c01d677b184a4f6a4c5dd2d40f8b51c4ba0af75b89ed3'),
  y: BigInt('0x060541537d013b7d1a38b19db2a6be1f49e0002f84b0cc237a87c288154329a7')
};

// Generator J (for nonce_commitment) - MUST match Generators.sol
const GENERATOR_J = {
  x: BigInt('0x10ed9cb73e6d8d98631a692fbc5761871595a39b9e7ab703d177c9ba9a44837f'),
  y: BigInt('0x1f76373da7dd8eef4dfada6743746d262ead94c38dd4192a9308aee33ea11594')
};

// NULLIFIER_DOMAIN_SEPARATOR from pedersen_commitments.nr
const NULLIFIER_DOMAIN_SEPARATOR = BigInt('0x100000000000000000000000000000000000000000000000000000000000000');

export interface GrumpkinPoint {
  x: bigint;
  y: bigint;
}

/**
 * Add two Grumpkin curve points
 * Curve equation: y^2 = x^3 - 17 (mod p)
 */
export function grumpkinAdd(p1: GrumpkinPoint, p2: GrumpkinPoint): GrumpkinPoint {
  const p = GRUMPKIN_FIELD_MODULUS;

  // Ensure all values are BigInt
  const x1 = typeof p1.x === 'bigint' ? p1.x : BigInt(p1.x);
  const y1 = typeof p1.y === 'bigint' ? p1.y : BigInt(p1.y);
  const x2 = typeof p2.x === 'bigint' ? p2.x : BigInt(p2.x);
  const y2 = typeof p2.y === 'bigint' ? p2.y : BigInt(p2.y);

  // Handle point at infinity (0, 0)
  if (x1 === BigInt(0) && y1 === BigInt(0)) return { x: x2, y: y2 };
  if (x2 === BigInt(0) && y2 === BigInt(0)) return { x: x1, y: y1 };

  // Handle negation: if p2 is the negation of p1, result is point at infinity
  if (x1 === x2 && y1 === (p - y2) % p) {
    return { x: BigInt(0), y: BigInt(0) };
  }

  // Same point: use tangent formula
  if (x1 === x2 && y1 === y2) {
    // Slope = (3*x^2) / (2*y)
    const numerator = (BigInt(3) * x1 * x1) % p;
    const denominator = (BigInt(2) * y1) % p;
    const invDenominator = modInverse(denominator, p);
    const slope = (numerator * invDenominator) % p;

    const x3 = (slope * slope - BigInt(2) * x1) % p;
    const y3 = (slope * (x1 - x3) - y1) % p;
    return { x: x3 < BigInt(0) ? x3 + p : x3, y: y3 < BigInt(0) ? y3 + p : y3 };
  }

  // Different points: use secant formula
  const xDiff = (x2 - x1 + p) % p;
  const yDiff = (y2 - y1 + p) % p;
  const invXDiff = modInverse(xDiff, p);
  const slope = (yDiff * invXDiff) % p;

  const x3 = (slope * slope - x1 - x2) % p;
  const y3 = (slope * (x1 - x3) - y1) % p;
  return { x: x3 < BigInt(0) ? x3 + p : x3, y: y3 < BigInt(0) ? y3 + p : y3 };
}

/**
 * Scalar multiplication on Grumpkin curve: k * P
 */
export function grumpkinMul(point: GrumpkinPoint, scalar: bigint): GrumpkinPoint {
  const p = GRUMPKIN_FIELD_MODULUS;
  // Ensure scalar is BigInt
  const scalarBigInt = typeof scalar === 'bigint' ? scalar : BigInt(scalar);
  // Ensure point coordinates are BigInt
  const x = typeof point.x === 'bigint' ? point.x : BigInt(point.x);
  const y = typeof point.y === 'bigint' ? point.y : BigInt(point.y);
  const normalizedPoint: GrumpkinPoint = { x, y };

  let result: GrumpkinPoint = { x: BigInt(0), y: BigInt(0) }; // Point at infinity
  let temp = normalizedPoint;
  let k = scalarBigInt % p;

  while (k > BigInt(0)) {
    if (k & BigInt(1)) {
      result = grumpkinAdd(result, temp);
    }
    temp = grumpkinAdd(temp, temp);
    k = k >> BigInt(1);
  }

  return result;
}

/**
 * Modular inverse using Fermat's little theorem: a^(-1) = a^(p-2) mod p
 */
function modInverse(a: bigint, p: bigint): bigint {
  if (a === BigInt(0)) throw new Error('Cannot compute inverse of 0');
  return modPow(a, p - BigInt(2), p);
}

/**
 * Modular exponentiation: base^exp mod mod
 */
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = BigInt(1);
  base = base % mod;
  while (exp > BigInt(0)) {
    if (exp & BigInt(1)) {
      result = (result * base) % mod;
    }
    exp = exp >> BigInt(1);
    base = (base * base) % mod;
  }
  return result;
}

/**
 * Negate a Grumpkin point: -P = (x, -y mod p)
 */
function grumpkinNegate(point: GrumpkinPoint): GrumpkinPoint {
  const p = GRUMPKIN_FIELD_MODULUS;
  // Ensure all values are BigInt
  const x = typeof point.x === 'bigint' ? point.x : BigInt(point.x);
  const y = typeof point.y === 'bigint' ? point.y : BigInt(point.y);
  return {
    x: x,
    y: (p - y) % p
  };
}

/**
 * Subtract two Grumpkin points: P1 - P2 = P1 + (-P2)
 */
export function grumpkinSubtract(p1: GrumpkinPoint, p2: GrumpkinPoint): GrumpkinPoint {
  return grumpkinAdd(p1, grumpkinNegate(p2));
}

/**
 * Add two Grumpkin points (exported for use in hooks)
 */
export function grumpkinAddPoints(p1: GrumpkinPoint, p2: GrumpkinPoint): GrumpkinPoint {
  return grumpkinAdd(p1, p2);
}

/**
 * Compute to_nullifier_domain(token_address)
 * Returns: token_address + NULLIFIER_DOMAIN_SEPARATOR
 */
export function toNullifierDomain(tokenAddress: bigint): bigint {
  const p = GRUMPKIN_FIELD_MODULUS;
  const tokenAddressField = tokenAddress % p;
  return (tokenAddressField + NULLIFIER_DOMAIN_SEPARATOR) % p;
}

/**
 * Aggregate opening values using BN254 scalar field addition
 * Matches the contract's aggregateOpeningValue function
 * Uses BN254 scalar field modulus: 21888242871839275222246405745257275088548364400416034343698204186575808495617
 */
export function aggregateOpeningValue(current: bigint, newValue: bigint): bigint {
  // BN254 scalar field modulus (BN256 scalar field)
  const BN254_SCALAR_FIELD_MODULUS = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

  // Field addition: (current + newValue) mod PRIME
  const sum = (current + newValue) % BN254_SCALAR_FIELD_MODULUS;
  return sum;
}

/**
 * Check if two Grumpkin points are equal
 */
export function grumpkinPointEqual(p1: GrumpkinPoint, p2: GrumpkinPoint): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

/**
 * TypeScript implementation of pedersen_commitment_positive
 * Matches: pedersen_commitment_positive(m: Field, r: Field, token_address: Field) -> EmbeddedCurvePoint
 * 
 * This uses pedersen_commitment_token which uses 3 generators (G, H, D)
 * Formula: m*G + r*H + token_address*D
 */
export function pedersenCommitmentPositive(m: bigint, r: bigint, tokenAddress: bigint): GrumpkinPoint {
  // Full 3-generator version: m*G + r*H + token_address*D
  const mG = grumpkinMul(GENERATOR_G, m);
  const rH = grumpkinMul(GENERATOR_H, r);
  const tokenD = grumpkinMul(GENERATOR_D, tokenAddress);

  // Add all three: mG + rH + tokenD
  return grumpkinAdd(grumpkinAdd(mG, rH), tokenD);
}

/**
 * TypeScript implementation of pedersen_commitment (2 factors: m*G + r*H)
 * Matches: pedersen_commitment(m: Field, r: Field) -> EmbeddedCurvePoint
 * 
 * Formula: m*G + r*H
 * Used for note_stack commitments and nonce_discovery_entry
 */
export function pedersenCommitment(m: bigint, r: bigint): GrumpkinPoint {
  const mG = grumpkinMul(GENERATOR_G, m);
  const rH = grumpkinMul(GENERATOR_H, r);
  return grumpkinAdd(mG, rH);
}

/**
 * TypeScript implementation of pedersen_commitment_non_hiding
 * Matches: pedersen_commitment_non_hiding(m: Field, r: Field) -> EmbeddedCurvePoint
 * 
 * Formula: m*G + r*H
 * Used for nonce discovery inner commitments
 */
export function pedersenCommitmentNonHiding(m: bigint, r: bigint): GrumpkinPoint {
  return pedersenCommitment(m, r);
}

/**
 * TypeScript implementation of pedersen_commitment_5
 * Matches: pedersen_commitment_5(m1: Field, m2: Field, m3: Field, m4: Field, r: Field) -> EmbeddedCurvePoint
 * 
 * Formula: m1*G + m2*H + m3*D + m4*K + r*J
 * where:
 *   m1 = shares
 *   m2 = nullifier
 *   m3 = spending_key
 *   m4 = unlocks_at
 *   r = nonce_commitment
 */
export function pedersenCommitment5(
  m1: bigint, // shares
  m2: bigint, // nullifier
  m3: bigint, // spending_key
  m4: bigint, // unlocks_at
  r: bigint   // nonce_commitment
): GrumpkinPoint {
  // IMPORTANT: Reduce all scalars modulo the BN254 field modulus before use
  // This matches Noir's from_field() behavior which ensures values are within the field
  const p = GRUMPKIN_FIELD_MODULUS;
  const m1Reduced = m1 % p;
  const m2Reduced = m2 % p;
  const m3Reduced = m3 % p;
  const m4Reduced = m4 % p;
  const rReduced = r % p;

  // Compute m1*G + m2*H + m3*D + m4*K + r*J
  const m1G = grumpkinMul(GENERATOR_G, m1Reduced);
  const m2H = grumpkinMul(GENERATOR_H, m2Reduced);
  const m3D = grumpkinMul(GENERATOR_D, m3Reduced);
  const m4K = grumpkinMul(GENERATOR_K, m4Reduced);
  const rJ = grumpkinMul(GENERATOR_J, rReduced);

  // Add all five components: m1*G + m2*H + m3*D + m4*K + r*J
  return grumpkinAdd(grumpkinAdd(grumpkinAdd(grumpkinAdd(m1G, m2H), m3D), m4K), rJ);
}


