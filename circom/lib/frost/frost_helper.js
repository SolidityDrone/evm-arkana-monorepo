/**
 * FROST (RFC 9591) helper for multisig / threshold signer identity.
 * Uses @substrate-system/frost for Ed25519 3-of-5 threshold key generation.
 *
 * The circuits verify Baby Jubjub EdDSA, so we derive a single Baby Jubjub key
 * from the FROST group public key. That key's hash is used as signer_pubkey_hash
 * in entry/deposit/withdraw; withdraw is signed with the same derived key so
 * the circuit's EdDSAPoseidonVerifier passes.
 *
 * Full threshold signing in-circuit would require an Ed25519 verifier in Circom.
 *
 * --- user_key for FROST (multisig) ---
 * user_key is derived from a separate "group identity secret" (not from the group
 * signing public key), so that exposing a signature during a proposal does not
 * reveal user_key / view / spending. The group agrees on this identity secret
 * during setup (e.g. second DKG or contribution round); each participant stores it.
 * Any participant can then derive user_key offline: user_key = Poseidon2(identity_secret).
 */

const path = require('path');

// Ensure Web Crypto API is available for @substrate-system/frost
const nodeCrypto = require('node:crypto');
const webcrypto = nodeCrypto.webcrypto || nodeCrypto;
if (typeof globalThis.crypto === 'undefined') globalThis.crypto = webcrypto;
if (typeof global.crypto === 'undefined') global.crypto = webcrypto;

// @substrate-system/frost is ESM-only; load dynamically
let _frost = null;
async function getFrost() {
    if (_frost) return _frost;
    _frost = await import('@substrate-system/frost');
    return _frost;
}
const circomlibjs = require('circomlibjs');

// Poseidon helper (test/scripts) - required from circom root when tests run
function getPoseidon2Hash2() {
    const mod = require(path.join(__dirname, '../../test/scripts/poseidon_hash_helper.js'));
    return mod.poseidon2Hash2;
}

let _eddsa = null;
let _F = null;
async function getEddsa() {
    if (_eddsa && _F) return { eddsa: _eddsa, F: _F };
    const babyJub = await circomlibjs.buildBabyjub();
    _eddsa = await circomlibjs.buildEddsa();
    _F = babyJub.F;
    return { eddsa: _eddsa, F: _F };
}

/** 3-of-5 FROST config */
const FROST_THRESHOLD = 3;
const FROST_MAX_SIGNERS = 5;

/**
 * Create 3-of-5 FROST config and generate keys.
 * @returns {Promise<{ config, groupPublicKey, keyPackages }>}
 */
async function createFrost3of5() {
    const frost = await getFrost();
    const config = frost.createFrostConfig(FROST_THRESHOLD, FROST_MAX_SIGNERS);
    const { groupPublicKey, keyPackages } = frost.generateKeys(config);
    return { config, groupPublicKey, keyPackages };
}

/**
 * Derive Baby Jubjub signer identity from FROST group public key.
 * Uses first 32 bytes of group public key as Baby Jubjub private key seed so
 * the same logical "FROST group" is committed as signer_pubkey_hash in the note.
 *
 * @param {object} groupPublicKey - FROST group public key (has .point or similar)
 * @returns {Promise<{ signer_pubkey_hash: string, signer_public_key: [string, string], derivedPrivKeyHex: string }>}
 */
async function frostGroupKeyToSignerIdentity(groupPublicKey) {
    const poseidon2Hash2 = getPoseidon2Hash2();
    const { eddsa, F } = await getEddsa();

    // Ed25519 group public key → derive Baby Jubjub private key via SHA256 so scalar is in valid range
    const pointBytes = groupPublicKey.point || groupPublicKey;
    const bytes = pointBytes instanceof Uint8Array ? Buffer.from(pointBytes) : Buffer.from(pointBytes);
    const { createHash } = require('node:crypto');
    const privKey = createHash('sha256').update(bytes).digest();

    const pubKey = eddsa.prv2pub(privKey);
    const Ax = F.toObject(pubKey[0]).toString();
    const Ay = F.toObject(pubKey[1]).toString();
    const signer_pubkey_hash = await poseidon2Hash2(Ax, Ay);

    return {
        signer_pubkey_hash,
        signer_public_key: [Ax, Ay],
        derivedPrivKeyHex: privKey.toString('hex')
    };
}

/**
 * Get FROST 3-of-5 setup and signer identity for use in entry/deposit/withdraw.
 * @returns {Promise<{ config, groupPublicKey, keyPackages, signer_pubkey_hash, signer_public_key, derivedPrivKeyHex }>}
 */
async function getFrostSignerIdentity() {
    const { config, groupPublicKey, keyPackages } = await createFrost3of5();
    const identity = await frostGroupKeyToSignerIdentity(groupPublicKey);
    return {
        config,
        groupPublicKey,
        keyPackages,
        ...identity
    };
}

/**
 * Simulate group identity agreement: produces a 32-byte shared secret that each
 * participant would store after the real protocol (e.g. second DKG or contribution round).
 * In production the group runs a real MPC; here we generate one random secret for tests.
 * @param {number} [numParticipants=5] - Number of participants (for simulation only).
 * @returns {Promise<{ groupIdentitySecret: Buffer, groupIdentitySecretHex: string }>}
 */
async function simulateGroupIdentityAgreement(numParticipants = FROST_MAX_SIGNERS) {
    const { randomBytes } = require('node:crypto');
    const groupIdentitySecret = randomBytes(32);
    return {
        groupIdentitySecret,
        groupIdentitySecretHex: groupIdentitySecret.toString('hex')
    };
}

/**
 * Derive user_key from the group identity secret (Poseidon2 of two 128-bit halves).
 * Any participant who stored groupIdentitySecret from setup can compute this offline.
 * @param {Buffer|string} groupIdentitySecret - 32-byte Buffer or hex string.
 * @returns {Promise<string>} user_key as decimal string (for circuit input).
 */
async function deriveUserKeyFromGroupIdentitySecret(groupIdentitySecret) {
    const poseidon2Hash2 = getPoseidon2Hash2();
    const buf = Buffer.isBuffer(groupIdentitySecret)
        ? groupIdentitySecret
        : Buffer.from(groupIdentitySecret.replace(/^0x/, ''), 'hex');
    if (buf.length !== 32) throw new Error('groupIdentitySecret must be 32 bytes');
    const lo = buf.readBigUInt64BE(0) * (2n ** 64n) + buf.readBigUInt64BE(8);
    const hi = buf.readBigUInt64BE(16) * (2n ** 64n) + buf.readBigUInt64BE(24);
    return await poseidon2Hash2(lo.toString(), hi.toString());
}

/**
 * Full FROST setup with group identity: returns signer identity + group identity secret + user_key.
 * Use this for multisig flows so user_key is not tied to the signing public key.
 * @returns {Promise<{ config, groupPublicKey, keyPackages, signer_pubkey_hash, signer_public_key, derivedPrivKeyHex, groupIdentitySecret, groupIdentitySecretHex, user_key }>}
 */
async function getFrostSignerIdentityWithGroupIdentity() {
    const frost = await getFrostSignerIdentity();
    const { groupIdentitySecret, groupIdentitySecretHex } = await simulateGroupIdentityAgreement();
    const user_key = await deriveUserKeyFromGroupIdentitySecret(groupIdentitySecret);
    return {
        ...frost,
        groupIdentitySecret,
        groupIdentitySecretHex,
        user_key
    };
}

/**
 * Sign withdraw message with the Baby Jubjub key derived from FROST group key.
 * Same message format as eddsa_helper.signWithdrawMessage: Poseidon(5)(..., current_nonce). Pass previous_nonce + 1 as current_nonce.
 */
async function signWithdrawMessageFrost(derivedPrivKeyHex, token_address, chain_id, amount, relayer_fee_amount, current_nonce) {
    const { eddsa, F } = await getEddsa();
    const { getWithdrawMessageHash } = require(path.join(__dirname, '../../test/scripts/poseidon_hash_helper'));
    const message = await getWithdrawMessageHash(
        token_address.toString(),
        chain_id.toString(),
        amount.toString(),
        relayer_fee_amount.toString(),
        current_nonce.toString()
    );
    const msgField = F.e(BigInt(message));
    const prvKey = Buffer.from(derivedPrivKeyHex, 'hex');
    const sig = eddsa.signPoseidon(prvKey, msgField);
    return {
        signature: [
            F.toObject(sig.R8[0]).toString(),
            F.toObject(sig.R8[1]).toString(),
            sig.S.toString()
        ],
        message
    };
}

/**
 * Produce Ed25519 threshold signature over raw message (for verification outside circuit).
 * Use any FROST_THRESHOLD (3) of keyPackages.
 */
async function frostThresholdSign(keyPackages, messageBytes, groupPublicKey, config) {
    const frost = await getFrost();
    const subset = keyPackages.slice(0, FROST_THRESHOLD);
    return await frost.thresholdSign(subset, messageBytes, groupPublicKey, config);
}

/**
 * Produce Ed25519 threshold signature using exactly numSigners key packages (numSigners >= threshold).
 * Used to verify that 3/5, 4/5, 5/5 all produce signatures verifiable by the same group public key.
 */
async function frostThresholdSignWithSubset(keyPackages, numSigners, messageBytes, groupPublicKey, config) {
    const frost = await getFrost();
    const subset = keyPackages.slice(0, numSigners);
    return await frost.thresholdSign(subset, messageBytes, groupPublicKey, config);
}

module.exports = {
    FROST_THRESHOLD,
    FROST_MAX_SIGNERS,
    createFrost3of5,
    frostGroupKeyToSignerIdentity,
    getFrostSignerIdentity,
    getFrostSignerIdentityWithGroupIdentity,
    simulateGroupIdentityAgreement,
    deriveUserKeyFromGroupIdentitySecret,
    signWithdrawMessageFrost,
    thresholdSign: frostThresholdSign,
    thresholdSignWithSubset: frostThresholdSignWithSubset
};
