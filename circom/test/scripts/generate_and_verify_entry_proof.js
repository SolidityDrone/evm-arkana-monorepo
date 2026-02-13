#!/usr/bin/env node

/**
 * Generate and Verify Entry Circuit Proof
 * 
 * This script demonstrates how to:
 * 1. Generate a proof for the entry circuit using snarkjs
 * 2. Verify the proof using snarkjs
 * 
 * Usage: node test/scripts/generate_and_verify_entry_proof.js [input.json]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function generateAndVerifyProof(inputFile) {
    const buildDir = path.join(__dirname, '../../build/entry');
    const wasmPath = path.join(buildDir, 'entry_js/entry.wasm');
    const zkeyPath = path.join(buildDir, 'entry_final.zkey');
    const vkeyPath = path.join(buildDir, 'entry_vkey.json');
    const proofPath = path.join(buildDir, 'proof.json');
    const publicPath = path.join(buildDir, 'public.json');
    
    // Check if required files exist
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}\nPlease compile first: npm run compile:entry`);
    }
    
    if (!fs.existsSync(zkeyPath)) {
        throw new Error(`Zkey file not found: ${zkeyPath}\nPlease build verifiers first: ./scripts/build_verifiers.sh`);
    }
    
    if (!fs.existsSync(vkeyPath)) {
        throw new Error(`Verification key not found: ${vkeyPath}\nPlease build verifiers first: ./scripts/build_verifiers.sh`);
    }
    
    // Load or create input JSON
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
    console.log('      GENERATE AND VERIFY ENTRY CIRCUIT PROOF');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Input:');
    console.log(JSON.stringify(processedInput, null, 2));
    console.log('');
    
    // Save input to temporary file for snarkjs
    const inputPath = path.join(buildDir, 'input.json');
    fs.writeFileSync(inputPath, JSON.stringify(processedInput, null, 2));
    
    // Step 1: Generate proof
    console.log('Step 1: Generating proof...');
    console.log(`  Using WASM: ${wasmPath}`);
    console.log(`  Using zkey: ${zkeyPath}`);
    console.log('');
    
    try {
        execSync(
            `snarkjs groth16 fullprove ${inputPath} ${wasmPath} ${zkeyPath} ${proofPath} ${publicPath}`,
            { stdio: 'inherit', cwd: path.join(__dirname, '../..') }
        );
        console.log('');
        console.log('✓ Proof generated successfully!');
        console.log(`  Proof saved to: ${proofPath}`);
        console.log(`  Public inputs saved to: ${publicPath}`);
    } catch (error) {
        console.error('❌ Failed to generate proof:', error.message);
        process.exit(1);
    }
    
    // Step 2: Verify proof
    console.log('');
    console.log('Step 2: Verifying proof...');
    console.log(`  Using verification key: ${vkeyPath}`);
    console.log(`  Using proof: ${proofPath}`);
    console.log(`  Using public inputs: ${publicPath}`);
    console.log('');
    
    try {
        execSync(
            `snarkjs groth16 verify ${vkeyPath} ${publicPath} ${proofPath}`,
            { stdio: 'inherit', cwd: path.join(__dirname, '../..') }
        );
        console.log('');
        console.log('✅ Proof verified successfully!');
    } catch (error) {
        console.error('');
        console.error('❌ Proof verification failed!');
        process.exit(1);
    }
    
    // Display proof and public inputs
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      PROOF DETAILS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicInputs = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
    
    console.log('Public Inputs (what is revealed):');
    console.log(JSON.stringify(publicInputs, null, 2));
    console.log('');
    
    console.log('Proof (A, B, C points):');
    console.log(`  A: [${proof.pi_a[0]}, ${proof.pi_a[1]}]`);
    console.log(`  B: [[${proof.pi_b[0][0]}, ${proof.pi_b[0][1]}], [${proof.pi_b[1][0]}, ${proof.pi_b[1][1]}]]`);
    console.log(`  C: [${proof.pi_c[0]}, ${proof.pi_c[1]}]`);
    console.log('');
    
    console.log('✅ All done! Proof generated and verified.');
    console.log('');
    
    // Clean up temporary input file
    if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
    }
}

// Run
const inputFile = process.argv[2];
generateAndVerifyProof(inputFile).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});

