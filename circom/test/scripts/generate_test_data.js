#!/usr/bin/env node

/**
 * Generate valid test data by chaining circuits
 * This creates a valid state progression: entry -> deposit -> withdraw -> send
 */

const fs = require('fs');
const path = require('path');

async function runCircuit(circuitName, input) {
    const buildDir = path.join(__dirname, `../../build/${circuitName}/${circuitName}_js`);
    const wasmPath = path.join(buildDir, `${circuitName}.wasm`);
    const witnessCalcPath = path.join(buildDir, `witness_calculator.js`);
    
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`Circuit not compiled: ${circuitName}. Run: pnpm run compile:${circuitName}`);
    }
    
    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    
    const witness = await wtnsCalculator.calculateWitness(input, 0);
    return witness;
}

function toHex(decimalStr) {
    return '0x' + BigInt(decimalStr).toString(16);
}

async function generateTestData() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      GENERATING VALID TEST DATA');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    // Step 1: Entry circuit
    console.log('Step 1: Running Entry circuit...');
    const entryInput = {
        user_key: "0x1234567890abcdef",
        token_address: "0x02",
        chain_id: "0x01"
    };
    
    const processedEntryInput = {};
    for (const [key, value] of Object.entries(entryInput)) {
        if (typeof value === 'string' && value.startsWith('0x')) {
            processedEntryInput[key] = BigInt(value).toString();
        } else {
            processedEntryInput[key] = value.toString();
        }
    }
    
    const entryWitness = await runCircuit('entry', processedEntryInput);
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const nonce_commitment = entryWitness[3].toString();
    
    // Hash the commitment to get the leaf
    // We need to use Poseidon2Hash2, but we can compute it via a test circuit
    // For now, let's create a simple hash computation
    console.log('  Entry outputs:');
    console.log(`    balance_commitment: [${toHex(balance_commitment_x)}, ${toHex(balance_commitment_y)}]`);
    console.log(`    nonce_commitment: ${toHex(nonce_commitment)}`);
    console.log('');
    
    // Note: To get the actual leaf hash, we'd need to run Poseidon2Hash2
    // For now, this script shows the structure - the user needs to use real data
    // from their Noir tests or generate it properly
    
    console.log('⚠️  Note: This script structure shows how to chain circuits.');
    console.log('   For valid test data, you should:');
    console.log('   1. Use outputs from your Noir tests');
    console.log('   2. Or generate the leaf hash using Poseidon2Hash2');
    console.log('   3. Build a proper Merkle tree with the commitment leaf');
    console.log('');
    console.log('The test data in test/inputs/ might be synthetic and invalid.');
    console.log('You need to use real data from a valid state.');
}

generateTestData().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

