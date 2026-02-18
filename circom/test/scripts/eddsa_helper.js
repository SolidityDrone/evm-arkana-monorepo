/**
 * EdDSA (Baby Jubjub + Poseidon) helper for circuit tests.
 * Signer key and signatures for withdraw/send message hashes.
 * Uses circomlibjs buildEddsa (same as circomlib's EdDSAPoseidonVerifier).
 */

const { poseidon2Hash2, getSendMessageHash, getWithdrawMessageHash } = require('./poseidon_hash_helper');

let _eddsa = null;
let _F = null;

async function getEddsa() {
    if (_eddsa && _F) return { eddsa: _eddsa, F: _F };
    const circomlibjs = require('circomlibjs');
    const babyJub = await circomlibjs.buildBabyjub();
    _eddsa = await circomlibjs.buildEddsa();
    _F = babyJub.F;
    return { eddsa: _eddsa, F: _F };
}

/** Fixed test signer private key (32 bytes hex) - same across tests so signer_pubkey_hash is consistent */
const TEST_SIGNER_PRIVKEY_HEX = '0001020304050607080900010203040506070809000102030405060708090001';

/**
 * Get signer key pair and signer_pubkey_hash for circuit inputs.
 * @param {string} [privKeyHex] - Optional 32-byte hex private key; defaults to TEST_SIGNER_PRIVKEY_HEX
 * @returns {Promise<{ signer_pubkey_hash: string, signer_public_key: [string, string] }>}
 */
async function getSignerKeyPair(privKeyHex = TEST_SIGNER_PRIVKEY_HEX) {
    const { eddsa, F } = await getEddsa();
    const prvKey = Buffer.from(privKeyHex, 'hex');
    const pubKey = eddsa.prv2pub(prvKey);
    const Ax = F.toObject(pubKey[0]).toString();
    const Ay = F.toObject(pubKey[1]).toString();
    const signer_pubkey_hash = await poseidon2Hash2(Ax, Ay);
    return {
        signer_pubkey_hash,
        signer_public_key: [Ax, Ay]
    };
}

/**
 * Sign the withdraw message. Message = Poseidon2Hash2(Hash3(ta,ch,amount), Hash2(fee, current_nonce)).
 */
async function signWithdrawMessage(privKeyHex, token_address, chain_id, amount, relayer_fee_amount, current_nonce) {
    const { eddsa, F } = await getEddsa();
    const message = await getWithdrawMessageHash(
        token_address.toString(),
        chain_id.toString(),
        amount.toString(),
        relayer_fee_amount.toString(),
        current_nonce.toString()
    );
    const msgField = F.e(BigInt(message));
    const prvKey = Buffer.from(privKeyHex, 'hex');
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
 * Sign the send message. Message = Poseidon2Hash2(Hash3(ta,ch,amount), Hash3(fee, receiver_pubkey_hash, nonce)).
 */
async function signSendMessage(privKeyHex, token_address, chain_id, amount, relayer_fee_amount, receiver_public_key_x, receiver_public_key_y, current_nonce) {
    const { eddsa, F } = await getEddsa();
    const receiver_pubkey_hash = await poseidon2Hash2(receiver_public_key_x.toString(), receiver_public_key_y.toString());
    const message = await getSendMessageHash(
        token_address.toString(),
        chain_id.toString(),
        amount.toString(),
        relayer_fee_amount.toString(),
        receiver_pubkey_hash,
        current_nonce.toString()
    );
    const msgField = F.e(BigInt(message));
    const prvKey = Buffer.from(privKeyHex, 'hex');
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

module.exports = {
    getEddsa,
    getSignerKeyPair,
    signWithdrawMessage,
    signSendMessage,
    TEST_SIGNER_PRIVKEY_HEX
};
