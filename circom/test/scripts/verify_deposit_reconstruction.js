#!/usr/bin/env node

/**
 * Verify Deposit Commitment Reconstruction
 * Test if we can reconstruct the deposit leaf using PedersenCommitment5
 */

const fs = require('fs');
const path = require('path');

async function runCircuit(circuitName, input) {
    const testDir = path.join(__dirname, '../../test/circuits');
    const buildDir = path.join(testDir, `${circuitName}_js`);
    const wasmPath = path.join(buildDir, `${circuitName}.wasm`);
    const witnessCalcPath = path.join(buildDir, `witness_calculator.js`);
    
    if (!fs.existsSync(wasmPath)) {
        // Compile it
        const { execSync } = require('child_process');
        const circuitPath = path.join(testDir, `${circuitName}.circom`);
        if (!fs.existsSync(circuitPath)) {
            throw new Error(`Circuit file not found: ${circuitPath}`);
        }
        execSync(`cd ${testDir} && circom ${circuitName}.circom --r1cs --wasm --sym --c -o . 2>&1`, {
            stdio: 'inherit',
            cwd: testDir
        });
    }
    
    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    
    const witness = await wtnsCalculator.calculateWitness(input, 0);
    return witness;
}

async function verifyReconstruction() {
    console.log('Verifying deposit commitment reconstruction...');
    console.log('');
    
    // From the deposit flow test
    const user_key = "11713229458004520562570243222640664850795753646312424508910340281637138773970";
    const token_address = "2664058643649534556292438344945749496508274621";
    const chain_id = "1";
    const previous_nonce = "1";
    const previous_shares = "50"; // Actual shares after deposit
    const nullifier = "0";
    const previous_unlocks_at = "0";
    const expectedLeaf = "1795bc1b14e436a804110aa18d891cc3cb05ab1dc3bba35ea1d3ad8b2ea4941e";
    
    // Compute spending_key = Poseidon2Hash3(user_key, chain_id, token_address)
    // We need a Poseidon2Hash3 helper...
    // For now, let's just test with the values we have
    
    console.log('Testing reconstruction with:');
    console.log(`  m1 (shares): ${previous_shares}`);
    console.log(`  m2 (nullifier): ${nullifier}`);
    console.log(`  m3 (spending_key): computed from user_key, chain_id, token_address`);
    console.log(`  m4 (unlocks_at): ${previous_unlocks_at}`);
    console.log(`  r (nonce_commitment): computed from spending_key, nonce=${previous_nonce}, token_address`);
    console.log(`  Expected leaf: 0x${expectedLeaf}`);
    console.log('');
    
    // We need to compute spending_key and nonce_commitment first
    // This requires Poseidon2Hash3, which we don't have a helper for yet
    console.log('⚠️  Need Poseidon2Hash3 helper to compute spending_key and nonce_commitment');
    console.log('   For now, this is a placeholder');
}

verifyReconstruction().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});

