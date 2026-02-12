#!/usr/bin/env node

/**
 * Send Circuit Test
 * Equivalent to Noir's Prover.toml workflow
 * Usage: node test/scripts/test_send.js [input.json]
 */

const fs = require('fs');
const path = require('path');

async function testSend(inputFile) {
    const buildDir = path.join(__dirname, '../../build/send/send_js');
    const wasmPath = path.join(buildDir, 'send.wasm');
    const witnessCalcPath = path.join(buildDir, 'witness_calculator.js');
    
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}\nPlease compile first: pnpm run compile:send`);
    }
    
    if (!fs.existsSync(witnessCalcPath)) {
        throw new Error(`Witness calculator not found: ${witnessCalcPath}`);
    }
    
    // Load input JSON
    let input;
    if (inputFile) {
        if (!fs.existsSync(inputFile)) {
            throw new Error(`Input file not found: ${inputFile}`);
        }
        input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    } else {
        // Default test input
        input = {
            user_key: "0x1234567890abcdef",
            previous_nonce: "0x00",
            previous_shares: "0x64",
            nullifier: "0x1234567890abcdef",
            previous_unlocks_at: "0x00",
            previous_commitment_leaf: "0xff58323ee5d94cdd69fb9f2724a596ccbc0982dadd95da2ce70ecdb66dc350",
            commitment_index: "0x01",
            tree_depth: "0x01",
            expected_root: "0x2b47e95d5944952f9cdff22f5ece26b5d5219c85d154711620d1a6d21e5b270b",
            merkle_proof: ["0x03fe455b25403d09c842fd0be7fbad55c8abda9148850b3d21cfc427b8ee98f3", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00"],
            token_address: "0x02",
            chain_id: "0x01",
            amount: "0x32",
            receiver_public_key: ["0x0bd0e01a563a7b2bbd4b14702542d1e09ee93b4bd996f8c2d1502d05e7ac9941", "0x146a1e792e301e0c53e2422f11b3e09c9c4b58f849fc3aa1c34ea13cb8e02254"],
            relayer_fee_amount: "0x01"
        };
    }
    
    // Convert hex strings to decimal strings
    const processedInput = {};
    for (const [key, value] of Object.entries(input)) {
        if (Array.isArray(value)) {
            processedInput[key] = value.map(v => {
                if (typeof v === 'string' && v.startsWith('0x')) {
                    return BigInt(v).toString();
                }
                return v.toString();
            });
        } else if (typeof value === 'string' && value.startsWith('0x')) {
            processedInput[key] = BigInt(value).toString();
        } else {
            processedInput[key] = value.toString();
        }
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Send Circuit');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Input:');
    console.log(JSON.stringify(processedInput, null, 2));
    console.log('');
    
    // Load witness calculator
    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    
    // Calculate witness
    const witness = await wtnsCalculator.calculateWitness(processedInput, 0);
    
    // Extract outputs: new_commitment_leaf, new_nonce_commitment, encrypted_note[3], sender_pub_key[2], nonce_discovery_entry[2], note_commitment[2]
    const new_commitment_leaf = witness[1].toString();
    const new_nonce_commitment = witness[2].toString();
    const receiver_note_amount = witness[3].toString();
    const sender_balance = witness[4].toString();
    const sender_nullifier = witness[5].toString();
    const sender_pub_key_x = witness[6].toString();
    const sender_pub_key_y = witness[7].toString();
    const nonce_discovery_entry_x = witness[8].toString();
    const nonce_discovery_entry_y = witness[9].toString();
    const note_commitment_x = witness[10].toString();
    const note_commitment_y = witness[11].toString();
    
    console.log('Outputs:');
    console.log(`  new_commitment_leaf: ${new_commitment_leaf}`);
    console.log(`  new_nonce_commitment: ${new_nonce_commitment}`);
    console.log(`  encrypted_note: [${receiver_note_amount}, ${sender_balance}, ${sender_nullifier}]`);
    console.log(`  sender_pub_key: [${sender_pub_key_x}, ${sender_pub_key_y}]`);
    console.log(`  nonce_discovery_entry: [${nonce_discovery_entry_x}, ${nonce_discovery_entry_y}]`);
    console.log(`  note_commitment: [${note_commitment_x}, ${note_commitment_y}]`);
    console.log('');
    
    // Basic assertions
    if (new_commitment_leaf === '0') {
        throw new Error('❌ new_commitment_leaf should not be zero');
    }
    if (new_nonce_commitment === '0') {
        throw new Error('❌ new_nonce_commitment should not be zero');
    }
    
    console.log('✅ Send circuit test passed!');
    console.log('');
    
    return {
        new_commitment_leaf,
        new_nonce_commitment,
        encrypted_note: [receiver_note_amount, sender_balance, sender_nullifier],
        sender_pub_key: [sender_pub_key_x, sender_pub_key_y],
        nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y],
        note_commitment: [note_commitment_x, note_commitment_y]
    };
}

const inputFile = process.argv[2];
testSend(inputFile).catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});

