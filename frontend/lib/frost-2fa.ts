/**
 * FROST-style 2-of-2 threshold signing for Arkana Baby Jubjub EdDSA-Poseidon.
 *
 * DKG (Distributed Key Generation):
 * - Desktop generates scalar share s1, public key A1 = s1 * B8
 * - Phone generates scalar share s2, public key A2 = s2 * B8  
 * - Group public key: A = A1 + A2 = (s1 + s2) * B8
 * - Neither device ever sees the other's share
 *
 * Signing (2-of-2 threshold):
 * - Desktop generates nonce r1, computes R1 = r1 * B8
 * - Phone generates nonce r2, computes R2 = r2 * B8
 * - Combined nonce: R = R1 + R2
 * - Challenge: H = Poseidon(R.x, R.y, A.x, A.y, M) [matches EdDSAPoseidonVerifier]
 * - Partial signatures: S1 = r1 + H*8*s1, S2 = r2 + H*8*s2
 *   (8x cofactor because EdDSAPoseidonVerifier checks S*B8 == R + H*8*A)
 * - Combined signature: S = S1 + S2
 * - Final signature: (R.x, R.y, S) - verifies with EdDSAPoseidonVerifier
 */

import { poseidonHash } from './circuit-utils';

let _babyJub: any = null;
let _eddsa: any = null;
let _poseidon: any = null;
let _F: any = null;

async function getCircomLib() {
  if (_babyJub && _eddsa && _poseidon && _F) {
    return { babyJub: _babyJub, eddsa: _eddsa, poseidon: _poseidon, F: _F };
  }
  if (typeof window === 'undefined') {
    throw new Error('Circomlib is only available in the browser');
  }
  const circomlibjs = await import('circomlibjs');
  _babyJub = await circomlibjs.buildBabyjub();
  _eddsa = await circomlibjs.buildEddsa();
  _poseidon = await circomlibjs.buildPoseidon();
  _F = _babyJub.F;
  return { babyJub: _babyJub, eddsa: _eddsa, poseidon: _poseidon, F: _F };
}

// Baby Jubjub prime subgroup order (order of base point B8)
// NOT the BN254 scalar field — that's ~2^254 and would overflow Num2Bits(253) in the circuit
const SUBGROUP_ORDER = BigInt('2736030358979909402780800718157159386076813972158567259200215660948447373041');

// ── Types ───────────────────────────────────────────────────────────────

export interface DKGDesktopRound1 {
  desktopPublicKey: [string, string]; // A1 = s1 * B8
}

export interface DKGPhoneRound2 {
  phonePublicKey: [string, string]; // A2 = s2 * B8
}

export interface DKGResult {
  groupPublicKey: [string, string]; // A = A1 + A2
  signerPubkeyHash: string; // Poseidon2(A.x, A.y)
}

export interface SigningRound1 {
  message: string; // Message hash M
  desktopNonce: [string, string]; // R1 = r1 * B8
  groupPublicKey: [string, string]; // A
}

export interface SigningRound2 {
  phoneNonce: [string, string]; // R2 = r2 * B8
  phonePartialSig: string; // S2 = r2 + H * s2
}

export interface ThresholdSignature {
  signature: [string, string, string]; // [R.x, R.y, S] where R = R1 + R2, S = S1 + S2
  message: string;
}

export interface TwoFactorStoredData {
  is2FA: true;
  desktopScalarShare: string; // s1 (hex)
  groupPublicKey: [string, string]; // A
  signerPubkeyHash: string;
}

// ── Scalar Operations ───────────────────────────────────────────────────

function getRandomScalar(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const scalar = BigInt('0x' + hex);
  return scalar % SUBGROUP_ORDER;
}

function scalarToHex(s: bigint): string {
  return s.toString(16).padStart(64, '0');
}

function hexToScalar(hex: string): bigint {
  return BigInt('0x' + hex);
}

/**
 * Compute point = scalar * B8 using direct scalar multiplication.
 * IMPORTANT: Do NOT use eddsa.prv2pub() — it hashes the key with Blake512
 * before multiplying, which breaks the linearity required for threshold signing.
 */
async function scalarMulBase8(scalar: bigint): Promise<[string, string]> {
  const { babyJub, F } = await getCircomLib();
  const point = babyJub.mulPointEscalar(babyJub.Base8, scalar);
  return [F.toObject(point[0]).toString(), F.toObject(point[1]).toString()];
}

// ── DKG: Desktop Side ───────────────────────────────────────────────────

/**
 * Desktop: Generate first round of DKG.
 * Returns public key A1 = s1 * B8 and stores s1 locally.
 */
export async function dkgDesktopRound1(): Promise<{
  desktopScalarShare: string; // s1 (hex) - store this!
  desktopPublicKey: [string, string]; // A1 - send to phone
}> {
  // Generate random scalar share
  const s1 = getRandomScalar();
  const s1Hex = scalarToHex(s1);
  
  // Compute public key: A1 = s1 * B8 (direct scalar multiplication)
  const [A1x, A1y] = await scalarMulBase8(s1);
  
  return {
    desktopScalarShare: s1Hex,
    desktopPublicKey: [A1x, A1y],
  };
}

/**
 * Desktop: Complete DKG after receiving phone's public key.
 * Returns group public key A = A1 + A2.
 */
export async function dkgDesktopRound2(
  desktopPublicKey: [string, string],
  phonePublicKey: [string, string],
): Promise<DKGResult> {
  const { babyJub, F } = await getCircomLib();
  
  // A1 and A2 as points
  const A1 = [F.e(desktopPublicKey[0]), F.e(desktopPublicKey[1])];
  const A2 = [F.e(phonePublicKey[0]), F.e(phonePublicKey[1])];
  
  // Group public key: A = A1 + A2
  const A = babyJub.addPoint(A1, A2);
  const Ax = F.toObject(A[0]).toString();
  const Ay = F.toObject(A[1]).toString();
  
  // signer_pubkey_hash = Poseidon2(A.x, A.y)
  const signerPubkeyHash = (await poseidonHash([BigInt(Ax), BigInt(Ay)])).toString();
  
  return {
    groupPublicKey: [Ax, Ay],
    signerPubkeyHash,
  };
}

// ── DKG: Phone Side ─────────────────────────────────────────────────────

/**
 * Phone: Generate second round of DKG using deterministic derivation.
 * Derives scalar share s2 from passkey/seedphrase/eoa instead of random generation.
 * Returns public key A2 = s2 * B8. The scalar is NOT stored - it's re-derived each time.
 */
export async function dkgPhoneRound2(
  derivationScalar: bigint, // s2 derived from passkey/seedphrase/eoa
): Promise<{
  phonePublicKey: [string, string]; // A2 - send to desktop
}> {
  // Compute public key: A2 = s2 * B8 (direct scalar multiplication)
  const [A2x, A2y] = await scalarMulBase8(derivationScalar);
  
  return {
    phonePublicKey: [A2x, A2y],
  };
}

/**
 * Phone: Complete DKG after receiving desktop's public key.
 * Returns group public key A = A1 + A2.
 */
export async function dkgPhoneRound3(
  desktopPublicKey: [string, string],
  phonePublicKey: [string, string],
): Promise<DKGResult> {
  // Same as desktop round 2
  return dkgDesktopRound2(desktopPublicKey, phonePublicKey);
}

// ── Signing: Desktop Side ────────────────────────────────────────────────

/**
 * Desktop: Generate first round of threshold signing.
 * Returns R1 = r1 * B8 for phone to use.
 */
export async function signingDesktopRound1(
  message: string,
  groupPublicKey: [string, string],
): Promise<{
  desktopNonceScalar: string; // r1 (hex) - store temporarily!
  desktopNonce: [string, string]; // R1 - send to phone
  round1Data: SigningRound1; // Complete round 1 data
}> {
  // Generate random nonce
  const r1 = getRandomScalar();
  const r1Hex = scalarToHex(r1);
  
  // Compute nonce point: R1 = r1 * B8 (direct scalar multiplication)
  const [R1x, R1y] = await scalarMulBase8(r1);
  
  return {
    desktopNonceScalar: r1Hex,
    desktopNonce: [R1x, R1y],
    round1Data: {
      message,
      desktopNonce: [R1x, R1y],
      groupPublicKey,
    },
  };
}

/**
 * Desktop: Complete threshold signing after receiving phone's partial signature.
 * Combines S1 and S2 to produce final signature (R, S).
 */
export async function signingDesktopRound2(
  desktopScalarShare: string, // s1
  desktopNonceScalar: string, // r1
  phoneRound2: SigningRound2, // {R2, S2}
  round1Data: SigningRound1, // {M, R1, A}
): Promise<ThresholdSignature> {
  const { babyJub, poseidon, F } = await getCircomLib();
  
  console.log('[FROST Desktop Round2] Inputs:', {
    s1_hex: desktopScalarShare.slice(0, 16) + '...',
    r1_hex: desktopNonceScalar.slice(0, 16) + '...',
    R1: round1Data.desktopNonce,
    R2_phone: phoneRound2.phoneNonce,
    A: round1Data.groupPublicKey,
    M: round1Data.message,
    phonePartialSig: phoneRound2.phonePartialSig.slice(0, 20) + '...',
  });
  
  // Combined nonce: R = R1 + R2
  const R1 = [F.e(round1Data.desktopNonce[0]), F.e(round1Data.desktopNonce[1])];
  const R2 = [F.e(phoneRound2.phoneNonce[0]), F.e(phoneRound2.phoneNonce[1])];
  const R = babyJub.addPoint(R1, R2);
  const Rx = F.toObject(R[0]).toString();
  const Ry = F.toObject(R[1]).toString();
  
  // Challenge: H = Poseidon(R.x, R.y, A.x, A.y, M) [matches EdDSAPoseidonVerifier]
  const Ax = round1Data.groupPublicKey[0];
  const Ay = round1Data.groupPublicKey[1];
  const M = round1Data.message;
  
  const H = poseidon([F.e(Rx), F.e(Ry), F.e(Ax), F.e(Ay), F.e(M)]);
  const HBigInt = F.toObject(H);
  
  // Partial signature: S1 = r1 + H * 8 * s1
  // The 8x cofactor is required because EdDSAPoseidonVerifier checks S*B8 == R + H*8*A
  const r1 = hexToScalar(desktopNonceScalar);
  const s1 = hexToScalar(desktopScalarShare);
  const S1 = (r1 + HBigInt * 8n * s1) % SUBGROUP_ORDER;
  
  // Phone's partial signature: S2 (transmitted as decimal string)
  const S2 = BigInt(phoneRound2.phonePartialSig);
  
  // Combined signature: S = S1 + S2
  const S = (S1 + S2) % SUBGROUP_ORDER;
  
  console.log('[FROST Desktop Round2] Result:', {
    R: [Rx.slice(0, 20) + '...', Ry.slice(0, 20) + '...'],
    H: HBigInt.toString().slice(0, 20) + '...',
    S1: S1.toString().slice(0, 20) + '...',
    S2: S2.toString().slice(0, 20) + '...',
    S: S.toString(),
    S_lt_suborder: S < SUBGROUP_ORDER,
    S_lt_2pow253: S < (1n << 253n),
  });
  
  return {
    signature: [Rx, Ry, S.toString()],
    message: M,
  };
}

// ── Signing: Phone Side ─────────────────────────────────────────────────

/**
 * Phone: Generate second round of threshold signing.
 * Produces partial signature S2 = r2 + H * s2.
 * The scalar s2 is derived deterministically (not stored).
 */
export async function signingPhoneRound2(
  phoneScalarShare: bigint, // s2 (derived, not stored)
  round1Data: SigningRound1, // {M, R1, A}
): Promise<SigningRound2> {
  const { babyJub, poseidon, F } = await getCircomLib();
  
  console.log('[FROST Phone Round2] Inputs:', {
    s2_len: phoneScalarShare.toString().length,
    s2_lt_suborder: phoneScalarShare < SUBGROUP_ORDER,
    M: round1Data.message,
    R1: round1Data.desktopNonce,
    A: round1Data.groupPublicKey,
  });
  
  // Generate random nonce
  const r2 = getRandomScalar();
  
  // Compute nonce point: R2 = r2 * B8 (direct scalar multiplication)
  const [R2x, R2y] = await scalarMulBase8(r2);
  
  // Combined nonce: R = R1 + R2
  const R1 = [F.e(round1Data.desktopNonce[0]), F.e(round1Data.desktopNonce[1])];
  const R2 = [F.e(R2x), F.e(R2y)];
  const R = babyJub.addPoint(R1, R2);
  const Rx = F.toObject(R[0]).toString();
  const Ry = F.toObject(R[1]).toString();
  
  // Challenge: H = Poseidon(R.x, R.y, A.x, A.y, M) [matches EdDSAPoseidonVerifier]
  const Ax = round1Data.groupPublicKey[0];
  const Ay = round1Data.groupPublicKey[1];
  const M = round1Data.message;
  
  const H = poseidon([F.e(Rx), F.e(Ry), F.e(Ax), F.e(Ay), F.e(M)]);
  const HBigInt = F.toObject(H);
  
  // Partial signature: S2 = r2 + H * 8 * s2
  // The 8x cofactor is required because EdDSAPoseidonVerifier checks S*B8 == R + H*8*A
  const S2 = (r2 + HBigInt * 8n * phoneScalarShare) % SUBGROUP_ORDER;
  
  console.log('[FROST Phone Round2] Result:', {
    R2: [R2x.slice(0, 20) + '...', R2y.slice(0, 20) + '...'],
    R: [Rx.slice(0, 20) + '...', Ry.slice(0, 20) + '...'],
    H: HBigInt.toString().slice(0, 20) + '...',
    S2: S2.toString().slice(0, 20) + '...',
    S2_lt_suborder: S2 < SUBGROUP_ORDER,
  });
  
  return {
    phoneNonce: [R2x, R2y],
    phonePartialSig: S2.toString(),
  };
}

// ── Message Hashing (matches circuit format) ────────────────────────────

/**
 * Compute withdraw message hash for threshold signing.
 * Message = Poseidon2(Poseidon3(ta, ch, amount), Poseidon2(fee, current_nonce))
 */
export async function getWithdrawMessageForThreshold(
  tokenAddress: string,
  chainId: string,
  amount: string,
  relayerFeeAmount: string,
  currentNonce: string,
): Promise<string> {
  console.log('[FROST getWithdrawMessageForThreshold] Raw inputs:', {
    tokenAddress,
    tokenAddress_asBigInt: BigInt(tokenAddress).toString(),
    chainId,
    amount,
    relayerFeeAmount,
    currentNonce,
  });
  const { getWithdrawMessageHash } = await import('./circuit-utils');
  const messageBigInt = await getWithdrawMessageHash(
    BigInt(tokenAddress),
    BigInt(chainId),
    BigInt(amount),
    BigInt(relayerFeeAmount),
    BigInt(currentNonce),
  );
  console.log('[FROST getWithdrawMessageForThreshold] Result:', messageBigInt.toString());
  return messageBigInt.toString();
}

/**
 * Compute send message hash for threshold signing.
 * Message = Poseidon2(Poseidon3(ta, ch, amount), Poseidon3(fee, receiver_pubkey_hash, nonce))
 */
export async function getSendMessageForThreshold(
  tokenAddress: string,
  chainId: string,
  amount: string,
  relayerFeeAmount: string,
  receiverPublicKeyX: string,
  receiverPublicKeyY: string,
  currentNonce: string,
): Promise<string> {
  const { getSendMessageHash, poseidonHash: ph } = await import('./circuit-utils');
  const receiverPubkeyHash = await ph([BigInt(receiverPublicKeyX), BigInt(receiverPublicKeyY)]);
  const messageBigInt = await getSendMessageHash(
    BigInt(tokenAddress),
    BigInt(chainId),
    BigInt(amount),
    BigInt(relayerFeeAmount),
    receiverPubkeyHash,
    BigInt(currentNonce),
  );
  return messageBigInt.toString();
}

// ── Payload Encoding for URL/Copy-Paste ─────────────────────────────────

const PAYLOAD_PREFIX = 'ARKANA-FROST-v1:';

export interface DKGDesktopPayload {
  type: 'dkg-desktop';
  desktopPublicKey: [string, string];
}

export type DerivationMethod = 'passkey' | 'seedphrase' | 'eoa';

export interface DKGPhonePayload {
  type: 'dkg-phone';
  phonePublicKey: [string, string];
  derivationMethod: DerivationMethod;
  derivationInfo: string; // Credential ID, or mnemonic hash, or address (not the actual secret!)
}

export interface SigningRequestPayload {
  type: 'signing-request';
  message: string;
  desktopNonce: [string, string];
  groupPublicKey: [string, string];
}

export interface SigningResponsePayload {
  type: 'signing-response';
  phoneNonce: [string, string];
  phonePartialSig: string;
}

export type FrostPayload = DKGDesktopPayload | DKGPhonePayload | SigningRequestPayload | SigningResponsePayload;

export function encodeFrostPayload(data: FrostPayload): string {
  const json = JSON.stringify(data);
  if (typeof window !== 'undefined' && window.btoa) {
    return PAYLOAD_PREFIX + window.btoa(json);
  }
  return PAYLOAD_PREFIX + Buffer.from(json).toString('base64');
}

export function decodeFrostPayload(encoded: string): FrostPayload | null {
  try {
    const trimmed = encoded.trim();
    if (!trimmed.startsWith(PAYLOAD_PREFIX)) return null;
    const b64 = trimmed.slice(PAYLOAD_PREFIX.length);
    let json: string;
    if (typeof window !== 'undefined' && window.atob) {
      json = window.atob(b64);
    } else {
      json = Buffer.from(b64, 'base64').toString();
    }
    const parsed = JSON.parse(json);
    if (!parsed.type) return null;
    return parsed as FrostPayload;
  } catch {
    return null;
  }
}
