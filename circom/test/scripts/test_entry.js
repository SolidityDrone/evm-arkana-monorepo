#!/usr/bin/env node

/**
 * Entry Circuit Test
 * Equivalent to Noir's Prover.toml workflow
 * Usage: node test/scripts/test_entry.js [input.json]
 */

const fs = require('fs');
const path = require('path');

async function testEntry(inputFile) {
    const buildDir = path.join(__dirname, '../../build/entry/entry_js');
    const wasmPath = path.join(buildDir, 'entry.wasm');
    const witnessCalcPath = path.join(buildDir, 'witness_calculator.js');
    
    // Check if circuit is compiled
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}\nPlease compile first: pnpm run compile:entry`);
    }
    
    if (!fs.existsSync(witnessCalcPath)) {
        throw new Error(`Witness calculator not found: ${witnessCalcPath}`);
    }
    
    // Load input JSON (equivalent to Prover.toml)
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
            token_address: "0x02",
            chain_id: "0x01"
        };
    }
    
    // Convert hex strings to decimal strings for Circom
    const processedInput = {};
    for (const [key, value] of Object.entries(input)) {
        if (typeof value === 'string' && value.startsWith('0x')) {
            processedInput[key] = BigInt(value).toString();
        } else {
            processedInput[key] = value.toString();
        }
    }
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Entry Circuit');
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
    
    // Extract outputs (based on circuit structure)
    // Outputs are: balance_commitment[2], nonce_commitment, nonce_discovery_entry[2]
    // After constant 1 at index 0, outputs start at index 1
    const balance_commitment_x = witness[1].toString();
    const balance_commitment_y = witness[2].toString();
    const nonce_commitment = witness[3].toString();
    const nonce_discovery_entry_x = witness[4].toString();
    const nonce_discovery_entry_y = witness[5].toString();
    
    console.log('Outputs:');
    console.log(`  balance_commitment: [${balance_commitment_x}, ${balance_commitment_y}]`);
    console.log(`  nonce_commitment: ${nonce_commitment}`);
    console.log(`  nonce_discovery_entry: [${nonce_discovery_entry_x}, ${nonce_discovery_entry_y}]`);
    console.log('');
    
    // Basic assertions
    if (balance_commitment_x === '0' || balance_commitment_y === '0') {
        throw new Error('❌ balance_commitment should not be zero');
    }
    if (nonce_commitment === '0') {
        throw new Error('❌ nonce_commitment should not be zero');
    }
    if (nonce_discovery_entry_x === '0' || nonce_discovery_entry_y === '0') {
        throw new Error('❌ nonce_discovery_entry should not be zero');
    }
    
    console.log('✅ Entry circuit test passed!');
    console.log('');
    
    return {
        balance_commitment: [balance_commitment_x, balance_commitment_y],
        nonce_commitment,
        nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y]
    };
}

// Run test
const inputFile = process.argv[2];
testEntry(inputFile).catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});




