#!/usr/bin/env node

/**
 * Test that a single participant can derive the correct user_key offline, without
 * any other signers being online. Simulates: after FROST setup + group identity
 * agreement, participant 1 stores only the group identity secret; later, alone,
 * they compute user_key = deriveUserKeyFromGroupIdentitySecret(stored_secret)
 * and get the same value used in the full flow.
 */

const fs = require('fs');
const path = require('path');
const {
    getFrostSignerIdentityWithGroupIdentity,
    deriveUserKeyFromGroupIdentitySecret
} = require('../../lib/frost/frost_helper');

function decimalToHex(decimalStr) {
    return '0x' + BigInt(decimalStr).toString(16);
}

async function runCircuit(circuitName, input) {
    const buildDir = path.join(__dirname, `../../build/${circuitName}/${circuitName}_js`);
    const wasmPath = path.join(buildDir, `${circuitName}.wasm`);
    const witnessCalcPath = path.join(buildDir, 'witness_calculator.js');
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`Circuit not compiled: ${circuitName}. Run: npm run compile:${circuitName}`);
    }
    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    return await wtnsCalculator.calculateWitness(input, 0);
}

function hexToDecimal(hexStr) {
    if (typeof hexStr === 'string' && hexStr.startsWith('0x')) {
        return BigInt(hexStr).toString();
    }
    return hexStr.toString();
}

async function testFrostUserKeyIndependent() {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('   TEST: One participant derives user_key independently (no others online)');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');

    // === STEP 1: Full setup once (FROST keygen + group identity agreement) ===
    console.log('STEP 1: Run FROST setup + group identity agreement once...');
    const frost = await getFrostSignerIdentityWithGroupIdentity();
    const {
        groupPublicKey,
        signer_pubkey_hash,
        groupIdentitySecret,
        groupIdentitySecretHex,
        user_key: user_key_from_setup
    } = frost;
    console.log('  user_key from setup: ' + decimalToHex(user_key_from_setup));
    console.log('  groupIdentitySecret (hex, first 16 chars): ' + groupIdentitySecretHex.slice(0, 16) + '...');
    console.log('');

    // === STEP 2: Simulate "participant 1" storing only what they need ===
    console.log('STEP 2: Participant 1 stores only group identity secret (no other members online)...');
    const storedByParticipant1 = {
        groupIdentitySecret
    };
    console.log('  Stored: groupIdentitySecret (32 bytes)');
    console.log('');

    // === STEP 3: Participant 1 alone derives user_key from stored secret ===
    console.log('STEP 3: Participant 1 derives user_key from stored secret (offline)...');
    const user_key_independent = await deriveUserKeyFromGroupIdentitySecret(storedByParticipant1.groupIdentitySecret);
    console.log('  user_key (derived alone): ' + decimalToHex(user_key_independent));
    console.log('');

    // === STEP 4: Assert equality ===
    console.log('STEP 4: Assert independently-derived user_key matches setup user_key...');
    if (user_key_independent !== user_key_from_setup) {
        throw new Error(
            'user_key mismatch: independent=' + decimalToHex(user_key_independent) + ', setup=' + decimalToHex(user_key_from_setup)
        );
    }
    console.log('  OK: user_key (independent) === user_key (from setup)');
    console.log('');

    // === STEP 5: Run entry circuit with independently-derived user_key ===
    console.log('STEP 5: Run Entry circuit with independently-derived user_key...');
    const entryInput = {
        user_key: user_key_independent,
        signer_pubkey_hash,
        token_address: hexToDecimal('0x7775e4b6f4d40be537b55b6c47e09ada0157bd'),
        chain_id: hexToDecimal('0x01')
    };
    const entryWitness = await runCircuit('entry', entryInput);
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const nonce_commitment = entryWitness[3].toString();
    console.log('  Entry outputs: balance_commitment [..., ...], nonce_commitment ' + decimalToHex(nonce_commitment).slice(0, 18) + '...');
    console.log('  Entry circuit passed with independently-derived user_key.');
    console.log('');

    console.log('FROST user_key independent derivation test passed.');
    console.log('  Any participant with the stored group identity secret can compute user_key without other signers.');
    return {
        user_key: user_key_independent,
        user_key_hex: decimalToHex(user_key_independent),
        entry_ok: true
    };
}

testFrostUserKeyIndependent().catch(err => {
    console.error('Test failed:', err.message);
    process.exit(1);
});
