/**
 * Browser-compatible m-of-n multisig for Arkana Baby Jubjub EdDSA.
 *
 * Design:
 * - Initiator generates a random Baby Jubjub scalar as the "group signing key"
 * - Shamir's secret sharing (over SUBGROUP_ORDER) splits it into n shares, threshold m
 * - groupPublicKey = signingKey * B8 (Baby Jubjub point)
 * - signer_pubkey_hash = Poseidon2(groupPublicKey.x, groupPublicKey.y) — used in circuits
 * - groupIdentitySecret = random 32 bytes — separate from signing key
 * - user_key = Poseidon2(identitySecret.lo, identitySecret.hi) — used in entry/deposit circuits
 *
 * For withdrawal: coordinator collects m Shamir shares, uses Lagrange interpolation to
 * reconstruct the signing key, then signs the withdraw message using Baby Jubjub EdDSA.
 * The reconstructed key is ephemeral and immediately discarded after signing.
 *
 * This matches the circom test design in frost_helper.js where:
 * - signer_pubkey_hash = Poseidon2(groupKey.x, groupKey.y)
 * - user_key derived from a separate identity secret (not from the signing key)
 */

import { poseidonHash } from './circuit-utils';

// Baby Jubjub prime subgroup order (same constant as in frost-2fa.ts)
const SUBGROUP_ORDER = BigInt('2736030358979909402780800718157159386076813972158567259200215660948447373041');

// ── circomlibjs singleton ────────────────────────────────────────────────
let _babyJub: any = null;
let _eddsa: any = null;
let _F: any = null;

async function getCircomLib() {
  if (_babyJub && _eddsa && _F) return { babyJub: _babyJub, eddsa: _eddsa, F: _F };
  if (typeof window === 'undefined') {
    throw new Error('frost-multisig is only available in the browser');
  }
  const circomlibjs = await import('circomlibjs');
  _babyJub = await circomlibjs.buildBabyjub();
  _eddsa = await circomlibjs.buildEddsa();
  _F = _babyJub.F;
  return { babyJub: _babyJub, eddsa: _eddsa, F: _F };
}

// ── Utility ─────────────────────────────────────────────────────────────

function modulo(a: bigint, m: bigint): bigint {
  return ((a % m) + m) % m;
}

function modInverse(a: bigint, m: bigint): bigint {
  // Extended Euclidean algorithm
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return modulo(old_s, m);
}

function getRandomScalar(): bigint {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return modulo(BigInt('0x' + hex), SUBGROUP_ORDER);
}

function scalarToHex(s: bigint): string {
  return s.toString(16).padStart(64, '0');
}

function hexToScalar(hex: string): bigint {
  return modulo(BigInt('0x' + hex.replace(/^0x/, '')), SUBGROUP_ORDER);
}

// ── Shamir's Secret Sharing ──────────────────────────────────────────────

export interface ShamirShare {
  index: number;   // x-coordinate (1-based, 1..n)
  share: string;   // y-value as hex string (the scalar f(index) mod SUBGROUP_ORDER)
}

/**
 * Split a secret (Baby Jubjub scalar) into n Shamir shares with threshold m.
 * Polynomial: f(x) = secret + a1*x + ... + a_{m-1}*x^{m-1}  (mod SUBGROUP_ORDER)
 * Each share is (i, f(i)) for i=1..n.
 */
export function shamirSplit(secret: bigint, threshold: number, maxSigners: number): ShamirShare[] {
  if (threshold < 2) throw new Error('Threshold must be at least 2');
  if (maxSigners < threshold) throw new Error('maxSigners must be >= threshold');

  // Random polynomial coefficients: a1, ..., a_{threshold-1}
  const coeffs: bigint[] = [secret];
  for (let i = 1; i < threshold; i++) {
    coeffs.push(getRandomScalar());
  }

  const shares: ShamirShare[] = [];
  for (let i = 1; i <= maxSigners; i++) {
    let y = 0n;
    let xPow = 1n;
    const x = BigInt(i);
    for (const c of coeffs) {
      y = modulo(y + modulo(c * xPow, SUBGROUP_ORDER), SUBGROUP_ORDER);
      xPow = modulo(xPow * x, SUBGROUP_ORDER);
    }
    shares.push({ index: i, share: scalarToHex(y) });
  }
  return shares;
}

/**
 * Reconstruct the secret from m Shamir shares via Lagrange interpolation (mod SUBGROUP_ORDER).
 * Must provide at least `threshold` shares.
 */
export function shamirCombine(shares: ShamirShare[]): bigint {
  if (shares.length < 2) throw new Error('Need at least 2 shares to combine');

  let secret = 0n;
  for (let i = 0; i < shares.length; i++) {
    const xi = BigInt(shares[i].index);
    const yi = hexToScalar(shares[i].share);

    // Lagrange basis polynomial at 0
    let num = 1n;
    let den = 1n;
    for (let j = 0; j < shares.length; j++) {
      if (i === j) continue;
      const xj = BigInt(shares[j].index);
      num = modulo(num * modulo(-xj, SUBGROUP_ORDER), SUBGROUP_ORDER);
      den = modulo(den * modulo(xi - xj, SUBGROUP_ORDER), SUBGROUP_ORDER);
    }

    const lagrange = modulo(num * modInverse(den, SUBGROUP_ORDER), SUBGROUP_ORDER);
    secret = modulo(secret + modulo(yi * lagrange, SUBGROUP_ORDER), SUBGROUP_ORDER);
  }
  return secret;
}

// ── Group Setup ──────────────────────────────────────────────────────────

export interface MultisigGroupSetup {
  name: string;
  threshold: number;
  maxSigners: number;
  /** Baby Jubjub group public key [x, y] as decimal strings */
  groupPublicKey: [string, string];
  /** Poseidon2(groupPublicKey.x, groupPublicKey.y) — decimal string, used in circuits */
  signerPubkeyHash: string;
  /** Random 32-byte identity secret (shared among all participants, not the signing key) */
  groupIdentitySecret: string; // hex
  /** user_key = Poseidon2(identitySecret.lo, identitySecret.hi) — decimal string */
  userKey: string;
  /** Shamir shares for each participant (index 1..n) */
  shares: ShamirShare[];
}

/**
 * Create a new multisig group: generate signing key, Shamir shares, group identity.
 * The initiator calls this and distributes each share to the appropriate signer.
 */
export async function createMultisigGroup(
  threshold: number,
  maxSigners: number,
  name: string
): Promise<MultisigGroupSetup> {
  const { eddsa, F } = await getCircomLib();

  // 1. Generate random Baby Jubjub group signing key
  const signingKey = getRandomScalar();

  // 2. Compute group public key: groupPubKey = signingKey * B8
  const privKeyBuf = Buffer.from(scalarToHex(signingKey), 'hex');
  const pubKey = eddsa.prv2pub(privKeyBuf);
  const Ax = F.toObject(pubKey[0]).toString();
  const Ay = F.toObject(pubKey[1]).toString();

  // 3. signer_pubkey_hash = Poseidon2(Ax, Ay)
  const signerPubkeyHash = (await poseidonHash([BigInt(Ax), BigInt(Ay)])).toString();

  // 4. Generate random group identity secret (32 bytes) — separate from signing key
  const identitySecretBytes = new Uint8Array(32);
  crypto.getRandomValues(identitySecretBytes);
  const groupIdentitySecret = Array.from(identitySecretBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // 5. user_key = Poseidon2(lo, hi) of identity secret
  const buf = Buffer.from(groupIdentitySecret, 'hex');
  const lo = buf.readBigUInt64BE(0) * (2n ** 64n) + buf.readBigUInt64BE(8);
  const hi = buf.readBigUInt64BE(16) * (2n ** 64n) + buf.readBigUInt64BE(24);
  const userKey = (await poseidonHash([lo, hi])).toString();

  // 6. Shamir split the signing key
  const shares = shamirSplit(signingKey, threshold, maxSigners);

  return {
    name,
    threshold,
    maxSigners,
    groupPublicKey: [Ax, Ay],
    signerPubkeyHash,
    groupIdentitySecret,
    userKey,
    shares,
  };
}

/**
 * Reconstruct the group signing key from m Shamir shares and sign the withdraw message.
 * Message format matches eddsa-circuit.ts signWithdrawMessage.
 */
export async function multisigSign(
  shares: ShamirShare[],
  tokenAddress: string,
  chainId: string,
  amount: string,
  fee: string,
  nonce: string,
  calldataHash: string,
  receiver: string
): Promise<{ signature: [string, string, string]; message: string }> {
  const { eddsa, F } = await getCircomLib();
  const { signWithdrawMessage } = await import('./eddsa-circuit');

  const signingKey = shamirCombine(shares);
  const result = await signWithdrawMessage(signingKey, tokenAddress, chainId, amount, fee, nonce, calldataHash, receiver);
  return result;
}

// ── Payload Encoding ─────────────────────────────────────────────────────

export const MSIG_PAYLOAD_PREFIX = 'ARKANA-MSIG-v1:';

export interface SignerSetupPayload {
  type: 'msig-signer-setup';
  name: string;
  threshold: number;
  maxSigners: number;
  signerPubkeyHash: string;
  groupPublicKey: [string, string];
  groupIdentitySecret: string;
  userKey: string;
  myIndex: number;
  myShare: string;
}

export interface SigningRequestPayload {
  type: 'msig-sign-request';
  profileId: string;  // the zkAddress of the multisig group
  tokenAddress: string;
  amount: string;
  fee: string;
  nonce: string;
  calldataHash: string;
  receiver: string;
}

export interface ShareResponsePayload {
  type: 'msig-share-response';
  profileId: string;
  signerIndex: number;
  share: string; // hex Shamir share value
}

type MsigPayload = SignerSetupPayload | SigningRequestPayload | ShareResponsePayload;

export function encodeMsigPayload(data: MsigPayload): string {
  const json = JSON.stringify(data);
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  return MSIG_PAYLOAD_PREFIX + b64;
}

export function decodeMsigPayload(raw: string): MsigPayload | null {
  try {
    const trimmed = raw.trim();
    if (!trimmed.startsWith(MSIG_PAYLOAD_PREFIX)) return null;
    const b64 = trimmed.slice(MSIG_PAYLOAD_PREFIX.length);
    const json = Buffer.from(b64, 'base64').toString('utf8');
    return JSON.parse(json) as MsigPayload;
  } catch {
    return null;
  }
}

/** Encode a signer setup payload for a specific signer index. */
export function encodeSignerSetupPayload(
  setup: MultisigGroupSetup,
  signerIndex: number
): string {
  const share = setup.shares.find(s => s.index === signerIndex);
  if (!share) throw new Error(`No share for index ${signerIndex}`);

  const payload: SignerSetupPayload = {
    type: 'msig-signer-setup',
    name: setup.name,
    threshold: setup.threshold,
    maxSigners: setup.maxSigners,
    signerPubkeyHash: setup.signerPubkeyHash,
    groupPublicKey: setup.groupPublicKey,
    groupIdentitySecret: setup.groupIdentitySecret,
    userKey: setup.userKey,
    myIndex: signerIndex,
    myShare: share.share,
  };
  return encodeMsigPayload(payload);
}

/** Construct the zkAddress for a multisig group from its group public key. */
export function multisigZkAddress(groupPublicKey: [string, string]): string {
  const { constructZkAddress } = require('./zk-address');
  return constructZkAddress(BigInt(groupPublicKey[0]), BigInt(groupPublicKey[1]));
}
