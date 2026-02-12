#!/usr/bin/env node

/**
 * Deposit Circuit Test
 * Equivalent to Noir's Prover.toml workflow
 * Usage: node test/scripts/test_deposit.js [input.json]
 */

const fs = require('fs');
const path = require('path');

async function testDeposit(inputFile) {
    const buildDir = path.join(__dirname, '../../build/deposit/deposit_js');
    const wasmPath = path.join(buildDir, 'deposit.wasm');
    const witnessCalcPath = path.join(buildDir, 'witness_calculator.js');
    
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}\nPlease compile first: pnpm run compile:deposit`);
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
        // NOTE: previous_shares, nullifier, previous_unlocks_at use encoding where 1 represents 0
        // This is to avoid 0*G calculations in the circuit
        input = {
            user_key: "0x19e573f3801c7b2e4619998342e8e305e1692184cbacd220c04198a04c36b7d2",
            token_address: "0x7775e4b6f4d40be537b55b6c47e09ada0157bd",
            amount: "0x32",
            chain_id: "0x01",
            previous_nonce: "0x00",
            previous_shares: "0x01", // 0 shares encoded as 1
            nullifier: "0x01", // 0 nullifier encoded as 1
            previous_unlocks_at: "0x01", // 0 unlocks_at encoded as 1
            previous_commitment_leaf: "0x0000000000000000000000000000000000000000000000000000000000000000", // Will be computed from entry
            commitment_index: "0x00",
            tree_depth: "0x01",
            expected_root: "0x0000000000000000000000000000000000000000000000000000000000000000", // Will be computed
            merkle_proof: new Array(32).fill("0x00")
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
    console.log('      TEST: Deposit Circuit');
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
    let witness;
    try {
        witness = await wtnsCalculator.calculateWitness(processedInput, 0);
    } catch (err) {
        console.error('❌ Witness calculation failed:', err.message);
        console.log('');
        console.log('This usually means the input data is invalid or doesn\'t match a valid previous commitment.');
        console.log('The circuit is checking that the reconstructed previous commitment leaf matches the provided one.');
        console.log('');
        console.log('To debug, you can:');
        console.log('1. Verify the input values match a valid previous state');
        console.log('2. Check that previous_commitment_leaf corresponds to the reconstructed commitment');
        console.log('3. Ensure previous_nonce, previous_shares, nullifier, etc. are correct');
        throw err;
    }
    
    // Extract outputs: commitment[2], encrypted_state_details[2], nonce_discovery_entry[2], new_nonce_commitment
    // After constant 1 at index 0, outputs start at index 1
    const commitment_x = witness[1].toString();
    const commitment_y = witness[2].toString();
    const encrypted_balance = witness[3].toString();
    const encrypted_nullifier = witness[4].toString();
    const nonce_discovery_entry_x = witness[5].toString();
    const nonce_discovery_entry_y = witness[6].toString();
    const new_nonce_commitment = witness[7].toString();
    
    console.log('Outputs:');
    console.log(`  commitment: [${commitment_x}, ${commitment_y}]`);
    console.log(`  encrypted_state_details: [${encrypted_balance}, ${encrypted_nullifier}]`);
    console.log(`  nonce_discovery_entry: [${nonce_discovery_entry_x}, ${nonce_discovery_entry_y}]`);
    console.log(`  new_nonce_commitment: ${new_nonce_commitment}`);
    console.log('');
    
    // Basic assertions
    if (commitment_x === '0' || commitment_y === '0') {
        throw new Error('❌ commitment should not be zero');
    }
    if (new_nonce_commitment === '0') {
        throw new Error('❌ new_nonce_commitment should not be zero');
    }
    
    console.log('✅ Deposit circuit test passed!');
    console.log('');
    
    return {
        commitment: [commitment_x, commitment_y],
        encrypted_state_details: [encrypted_balance, encrypted_nullifier],
        nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y],
        new_nonce_commitment
    };
}

const inputFile = process.argv[2];
testDeposit(inputFile).catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});

