/**
 * Pedersen commitments on Baby Jubjub (BJJ) curve.
 * Matches circom lib/pedersen-commitments (Baby Jubjub) and contract BJJ.sol.
 * Curve: ax² + y² = 1 + dx²y² with a = 168700, d = 168696.
 * Field: BN254 scalar field (Fr).
 */

// BN254 scalar field (Fr) - same as circom and BJJ.sol
const P = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

// Baby Jubjub curve parameters (from BJJ.sol / circomlib)
const A = BigInt(168700);
const D = BigInt(168696);

// Generators for PedersenCommitment5 - MUST match circom pedersen_commitments.circom (lines 355-365)
const GENERATOR_G = {
  x: BigInt('10457101036533406547632367118273992217979173478358440826365724437999023779287'),
  y: BigInt('19824078218392094440610104313265183977899662750282163392862422243483260492317'),
};
const GENERATOR_H = {
  x: BigInt('2671756056509184035029146175565761955751135805354291559563293617232983272177'),
  y: BigInt('2663205510731142763556352975002641716101654201788071096152948830924149045094'),
};
const GENERATOR_D = {
  x: BigInt('5802099305472655231388284418920769829666717045250560929368476121199858275951'),
  y: BigInt('5980429700218124965372158798884772646841287887664001482443826541541529227896'),
};
const GENERATOR_K = {
  x: BigInt('7107336197374528537877327281242680114152313102022415488494307685842428166594'),
  y: BigInt('2857869773864086953506483169737724679646433914307247183624878062391496185654'),
};
const GENERATOR_J = {
  x: BigInt('20265828622013100949498132415626198973119240347465898028410217039057588424236'),
  y: BigInt('1160461593266035632937973507065134938065359936056410650153315956301179689506'),
};

export { GENERATOR_G, GENERATOR_H, GENERATOR_D, GENERATOR_K, GENERATOR_J };

export interface GrumpkinPoint {
  x: bigint;
  y: bigint;
}

function modP(a: bigint): bigint {
  const r = a % P;
  return r >= 0n ? r : r + P;
}

function modInverse(a: bigint): bigint {
  const aMod = modP(a);
  if (aMod === 0n) throw new Error('Cannot compute inverse of 0');
  return modPow(aMod, P - 2n);
}

function modPow(base: bigint, exp: bigint): bigint {
  let result = 1n;
  base = modP(base);
  while (exp > 0n) {
    if (exp & 1n) result = modP(result * base);
    exp >>= 1n;
    base = modP(base * base);
  }
  return result;
}

/**
 * Add two Baby Jubjub points (twisted Edwards).
 * Identity is (0, 1). Formula from BJJ.sol / circomlib BabyAdd.
 */
export function bjjAdd(p1: GrumpkinPoint, p2: GrumpkinPoint): GrumpkinPoint {
  const x1 = modP(p1.x);
  const y1 = modP(p1.y);
  const x2 = modP(p2.x);
  const y2 = modP(p2.y);

  if (x1 === 0n && y1 === 1n) return { x: x2, y: y2 };
  if (x2 === 0n && y2 === 1n) return { x: x1, y: y1 };

  const beta = modP(x1 * y2);
  const gamma = modP(y1 * x2);
  const delta = modP(modP(y1 - A * x1) * modP(x2 + y2));
  const tau = modP(beta * gamma);

  const denomX = modP(1n + D * tau);
  const denomY = modP(1n - D * tau);

  if (denomX === 0n || denomY === 0n) return { x: 0n, y: 1n };

  const xout = modP((beta + gamma) * modInverse(denomX));
  const yout = modP((delta + modP(A * beta) - gamma + P) * modInverse(denomY));
  return { x: xout, y: yout };
}

/**
 * Scalar multiplication on Baby Jubjub: k * P (double-and-add).
 */
export function bjjMul(point: GrumpkinPoint, scalar: bigint): GrumpkinPoint {
  let k = scalar;
  let result: GrumpkinPoint = { x: 0n, y: 1n };
  let addend: GrumpkinPoint = { x: modP(point.x), y: modP(point.y) };

  while (k > 0n) {
    if (k & 1n) result = bjjAdd(result, addend);
    addend = bjjAdd(addend, addend);
    k >>= 1n;
  }
  return result;
}

// Legacy names for compatibility (same curve, different name)
export const grumpkinAdd = bjjAdd;
export const grumpkinMul = bjjMul;
export function grumpkinAddPoints(p1: GrumpkinPoint, p2: GrumpkinPoint): GrumpkinPoint {
  return bjjAdd(p1, p2);
}

function grumpkinNegate(point: GrumpkinPoint): GrumpkinPoint {
  return { x: modP(point.x), y: modP(P - point.y) };
}
export function grumpkinSubtract(p1: GrumpkinPoint, p2: GrumpkinPoint): GrumpkinPoint {
  return bjjAdd(p1, grumpkinNegate(p2));
}

export function grumpkinPointEqual(p1: GrumpkinPoint, p2: GrumpkinPoint): boolean {
  return modP(p1.x) === modP(p2.x) && modP(p1.y) === modP(p2.y);
}

// NULLIFIER_DOMAIN_SEPARATOR (kept for callers that use it)
const NULLIFIER_DOMAIN_SEPARATOR = BigInt('0x100000000000000000000000000000000000000000000000000000000000000');
export function toNullifierDomain(tokenAddress: bigint): bigint {
  return modP(tokenAddress + NULLIFIER_DOMAIN_SEPARATOR);
}

export function aggregateOpeningValue(current: bigint, newValue: bigint): bigint {
  return modP(current + newValue);
}

/**
 * PedersenCommitment5: m1*G + m2*H + m3*D + m4*K + r*J
 * Matches circom PedersenCommitment5 and contract leaf construction.
 */
export function pedersenCommitment5(
  m1: bigint,
  m2: bigint,
  m3: bigint,
  m4: bigint,
  r: bigint
): GrumpkinPoint {
  const m1G = bjjMul(GENERATOR_G, modP(m1));
  const m2H = bjjMul(GENERATOR_H, modP(m2));
  const m3D = bjjMul(GENERATOR_D, modP(m3));
  const m4K = bjjMul(GENERATOR_K, modP(m4));
  const rJ = bjjMul(GENERATOR_J, modP(r));
  return bjjAdd(bjjAdd(bjjAdd(bjjAdd(m1G, m2H), m3D), m4K), rJ);
}

/**
 * PedersenCommitment2: m*G + r*H (for note_stack, nonce_discovery_entry)
 */
export function pedersenCommitment(m: bigint, r: bigint): GrumpkinPoint {
  const mG = bjjMul(GENERATOR_G, modP(m));
  const rH = bjjMul(GENERATOR_H, modP(r));
  return bjjAdd(mG, rH);
}

export function pedersenCommitmentNonHiding(m: bigint, r: bigint): GrumpkinPoint {
  return pedersenCommitment(m, r);
}

/**
 * PedersenCommitment3: m*G + r*H + token_address*D
 */
export function pedersenCommitmentPositive(m: bigint, r: bigint, tokenAddress: bigint): GrumpkinPoint {
  const mG = bjjMul(GENERATOR_G, modP(m));
  const rH = bjjMul(GENERATOR_H, modP(r));
  const tokenD = bjjMul(GENERATOR_D, modP(tokenAddress));
  return bjjAdd(bjjAdd(mG, rH), tokenD);
}
