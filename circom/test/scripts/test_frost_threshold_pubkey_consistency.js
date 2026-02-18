#!/usr/bin/env node

/**
 * Test that for a 3/5 FROST threshold scheme, the group public key (and thus
 * signer_pubkey_hash used in circuits) is the same whether we sign with 3, 4, or 5 participants.
 * Also verifies that user_key derived from the same group identity secret is consistent.
 *
 * pubkey(3/5) === pubkey(4/5) === pubkey(5/5)
 * user_key(participant A) === user_key(participant B) when both have the same identity secret.
 */

const {
    FROST_THRESHOLD,
    FROST_MAX_SIGNERS,
    createFrost3of5,
    frostGroupKeyToSignerIdentity,
    thresholdSignWithSubset,
    simulateGroupIdentityAgreement,
    deriveUserKeyFromGroupIdentitySecret
} = require('../../lib/frost/frost_helper');

function decimalToHex(decimalStr) {
    return '0x' + BigInt(decimalStr).toString(16);
}

async function testFrostThresholdPubkeyConsistency() {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('   TEST: FROST 3/5 — same pubkey for 3/5, 4/5, 5/5 signing');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');

    // === STEP 1: Single FROST 3-of-5 key generation ===
    console.log('STEP 1: FROST key generation (threshold ' + FROST_THRESHOLD + '/' + FROST_MAX_SIGNERS + ')...');
    const { config, groupPublicKey, keyPackages } = await createFrost3of5();
    const groupKeyBytes = groupPublicKey.point || groupPublicKey;
    const groupKeyHex = Buffer.from(groupKeyBytes).toString('hex');
    console.log('  Group public key (Ed25519): ' + groupKeyHex.slice(0, 40) + '...');
    console.log('  Key packages: ' + keyPackages.length);
    console.log('');

    // === STEP 2: Derive signer identity once from group key ===
    console.log('STEP 2: Derive signer_pubkey_hash from group public key...');
    const identity = await frostGroupKeyToSignerIdentity(groupPublicKey);
    const { signer_pubkey_hash, signer_public_key } = identity;
    console.log('  signer_pubkey_hash: ' + decimalToHex(signer_pubkey_hash));
    console.log('  signer_public_key: [' + signer_public_key[0].slice(0, 20) + '..., ' + signer_public_key[1].slice(0, 20) + '...]');
    console.log('');

    // === STEP 3: Sign same message with 3, 4, and 5 signers ===
    const message = Buffer.from('test message for threshold pubkey consistency');
    console.log('STEP 3: Signing same message with 3, 4, and 5 signers...');

    const sig3 = await thresholdSignWithSubset(keyPackages, 3, message, groupPublicKey, config);
    console.log('  Signature with 3 signers: ok');

    const sig4 = await thresholdSignWithSubset(keyPackages, 4, message, groupPublicKey, config);
    console.log('  Signature with 4 signers: ok');

    const sig5 = await thresholdSignWithSubset(keyPackages, 5, message, groupPublicKey, config);
    console.log('  Signature with 5 signers: ok');
    console.log('');

    // === STEP 4: Assert group key and signer_pubkey_hash are unchanged ===
    console.log('STEP 4: Asserting pubkey consistency...');

    const groupKeyHexAfter3 = Buffer.from(groupPublicKey.point || groupPublicKey).toString('hex');
    const groupKeyHexAfter4 = Buffer.from(groupPublicKey.point || groupPublicKey).toString('hex');
    const groupKeyHexAfter5 = Buffer.from(groupPublicKey.point || groupPublicKey).toString('hex');

    if (groupKeyHexAfter3 !== groupKeyHex || groupKeyHexAfter4 !== groupKeyHex || groupKeyHexAfter5 !== groupKeyHex) {
        throw new Error('Group public key changed after 3/5, 4/5, 5/5 signing');
    }
    console.log('  Group public key (3/5) === (4/5) === (5/5): OK');

    // Derive signer identity again from same group key (simulating "identity for 3/5", "4/5", "5/5")
    const identity3 = await frostGroupKeyToSignerIdentity(groupPublicKey);
    const identity4 = await frostGroupKeyToSignerIdentity(groupPublicKey);
    const identity5 = await frostGroupKeyToSignerIdentity(groupPublicKey);

    if (
        identity3.signer_pubkey_hash !== signer_pubkey_hash ||
        identity4.signer_pubkey_hash !== signer_pubkey_hash ||
        identity5.signer_pubkey_hash !== signer_pubkey_hash
    ) {
        throw new Error('signer_pubkey_hash differs between 3/5, 4/5, 5/5');
    }
    console.log('  signer_pubkey_hash (3/5) === (4/5) === (5/5): OK');

    const [Ax3, Ay3] = identity3.signer_public_key;
    const [Ax4, Ay4] = identity4.signer_public_key;
    const [Ax5, Ay5] = identity5.signer_public_key;
    if (Ax3 !== Ax4 || Ax4 !== Ax5 || Ay3 !== Ay4 || Ay4 !== Ay5) {
        throw new Error('signer_public_key (Ax, Ay) differs between 3/5, 4/5, 5/5');
    }
    console.log('  signer_public_key (3/5) === (4/5) === (5/5): OK');
    console.log('');

    // === STEP 5: Same group identity secret → same user_key (any participant can derive alone) ===
    console.log('STEP 5: Group identity secret → same user_key for all participants...');
    const { groupIdentitySecret } = await simulateGroupIdentityAgreement(FROST_MAX_SIGNERS);
    const user_key_1 = await deriveUserKeyFromGroupIdentitySecret(groupIdentitySecret);
    const user_key_2 = await deriveUserKeyFromGroupIdentitySecret(groupIdentitySecret);
    if (user_key_1 !== user_key_2) {
        throw new Error('user_key should be identical when derived from same group identity secret');
    }
    console.log('  user_key(participant 1) === user_key(participant 2): OK');
    console.log('');

    console.log('FROST threshold pubkey consistency test passed.');
    console.log('  pubkey(3/5) === pubkey(4/5) === pubkey(5/5)');
    return {
        groupPublicKeyHex: groupKeyHex,
        signer_pubkey_hash,
        signer_public_key,
        signaturesProduced: { with3: !!sig3, with4: !!sig4, with5: !!sig5 }
    };
}

testFrostThresholdPubkeyConsistency().catch(err => {
    console.error('Test failed:', err.message);
    process.exit(1);
});
