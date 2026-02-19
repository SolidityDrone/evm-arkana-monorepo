/**
 * Poseidon hash helper for circuit tests (circomlib-compatible).
 * Replaces poseidon2_hash_helper; uses circomlibjs buildPoseidon() to match circuits.
 */

const BN254 = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

let _poseidon = null;
let _F = null;

async function getPoseidon() {
    if (_poseidon) return { poseidon: _poseidon, F: _F };
    const circomlibjs = require('circomlibjs');
    const poseidon = await circomlibjs.buildPoseidon();
    _F = poseidon.F;
    _poseidon = poseidon;
    return { poseidon: _poseidon, F: _F };
}

function toBigInt(v) {
    if (typeof v === 'bigint') return v;
    const s = String(v);
    const n = s.startsWith('0x') ? BigInt(s) : BigInt(s);
    return n % BN254;
}

/**
 * Poseidon hash of one field element (same API as old poseidon2Hash1).
 */
async function poseidon2Hash1(a) {
    const { poseidon, F } = await getPoseidon();
    const out = poseidon([toBigInt(a)]);
    return F.toString(out);
}

/**
 * Poseidon hash of two field elements (same API as old poseidon2Hash2).
 */
async function poseidon2Hash2(a, b) {
    const { poseidon, F } = await getPoseidon();
    const out = poseidon([toBigInt(a), toBigInt(b)]);
    return F.toString(out);
}

/**
 * Poseidon hash of three field elements (same API as old poseidon2Hash3).
 */
async function poseidon2Hash3(a, b, c) {
    const { poseidon, F } = await getPoseidon();
    const out = poseidon([toBigInt(a), toBigInt(b), toBigInt(c)]);
    return F.toString(out);
}

/**
 * Poseidon hash of four field elements.
 */
async function poseidon2Hash4(a, b, c, d) {
    const { poseidon, F } = await getPoseidon();
    const out = poseidon([toBigInt(a), toBigInt(b), toBigInt(c), toBigInt(d)]);
    return F.toString(out);
}

/**
 * Spending key = Poseidon4(user_key, chain_id, token_address, signer_pubkey_hash).
 * Matches circuit spending_key_hash = Poseidon2Hash4().
 */
async function getSpendingKeyFromHashes(userKey, chainId, tokenAddress, signerPubkeyHash) {
    return poseidon2Hash4(userKey, chainId, tokenAddress, signerPubkeyHash);
}

/**
 * Send message = Hash2(Hash3(ta, ch, amount), Hash3(fee, receiver_pubkey_hash, nonce)).
 */
async function getSendMessageHash(tokenAddress, chainId, amount, relayerFeeAmount, receiverPubkeyHash, currentNonce) {
    const left = await poseidon2Hash3(tokenAddress, chainId, amount);
    const right = await poseidon2Hash3(relayerFeeAmount, receiverPubkeyHash, currentNonce);
    return poseidon2Hash2(left, right);
}

/**
 * Withdraw message = Hash2(Hash3(ta, ch, amount), Hash2(fee, current_nonce)).
 */
async function getWithdrawMessageHash(tokenAddress, chainId, amount, relayerFeeAmount, currentNonce) {
    const left = await poseidon2Hash3(tokenAddress, chainId, amount);
    const right = await poseidon2Hash2(relayerFeeAmount, currentNonce);
    return poseidon2Hash2(left, right);
}

module.exports = {
    poseidon2Hash1,
    poseidon2Hash2,
    poseidon2Hash3,
    poseidon2Hash4,
    getSpendingKeyFromHashes,
    getSendMessageHash,
    getWithdrawMessageHash
};
