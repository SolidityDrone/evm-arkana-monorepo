#!/usr/bin/env node

/**
 * Verify the entry proof from proofs_for_solidity.json using snarkjs.
 * This checks whether the proof + public signals verify against the same
 * verification key used to build the Solidity verifier.
 *
 * Usage (from circom dir):
 *   node test/scripts/verify_entry_proof_from_json.js [path/to/proofs_for_solidity.json]
 * Default path: ../contracts/test/test-proofs/proofs_for_solidity.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function hexToDecimal(hexStr) {
    if (typeof hexStr === 'string' && hexStr.startsWith('0x')) {
        return BigInt(hexStr).toString();
    }
    return String(hexStr);
}

function main() {
    const circomDir = path.join(__dirname, '../..');
    const defaultJsonPath = path.join(circomDir, '../contracts/test/test-proofs/proofs_for_solidity.json');
    const jsonPath = process.argv[2] || defaultJsonPath;

    if (!fs.existsSync(jsonPath)) {
        console.error('JSON not found:', jsonPath);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const entry = data.entry;
    if (!entry || !entry.proof || !entry.publicSignals) {
        console.error('Invalid JSON: missing entry.proof or entry.publicSignals');
        process.exit(1);
    }

    // Convert Solidity-style proof (hex) to snarkjs format (decimal strings)
    const proof = {
        pi_a: entry.proof.a.map(hexToDecimal),
        pi_b: entry.proof.b.map(row => row.map(hexToDecimal)),
        pi_c: entry.proof.c.map(hexToDecimal)
    };

    // Public signals: same order as in JSON (decimal strings for snarkjs)
    const publicSignals = entry.publicSignals.map(hexToDecimal);

    const buildDir = path.join(circomDir, 'build/entry');
    const proofPath = path.join(buildDir, 'proof_from_json.json');
    const publicPath = path.join(buildDir, 'public_from_json.json');
    const vkeyPath = path.join(buildDir, 'entry_vkey.json');

    if (!fs.existsSync(vkeyPath)) {
        console.error('Verification key not found:', vkeyPath);
        console.error('Run: ./scripts/build_verifiers.sh entry');
        process.exit(1);
    }

    fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));
    fs.writeFileSync(publicPath, JSON.stringify(publicSignals, null, 2));

    console.log('Verifying entry proof from', jsonPath);
    console.log('  vkey:    ', vkeyPath);
    console.log('  public:  ', publicPath);
    console.log('  proof:   ', proofPath);
    console.log('  publicSignals count:', publicSignals.length);
    console.log('');

    try {
        execSync(
            `snarkjs groth16 verify ${vkeyPath} ${publicPath} ${proofPath}`,
            { stdio: 'inherit', cwd: circomDir }
        );
        console.log('');
        console.log('✅ snarkjs verification passed. Proof + public signals match this build\'s vkey.');
        console.log('   If Solidity still fails, the Solidity verifier may be from a different build.');
    } catch (err) {
        console.error('');
        console.error('❌ snarkjs verification failed.');
        console.error('   Proof and/or public signals do not match build/entry/entry_vkey.json.');
        console.error('   Regenerate proof and verifier from the same build:');
        console.error('     1. ./scripts/build_verifiers.sh entry');
        console.error('     2. node test/scripts/generate_all_proofs.js');
        console.error('     3. Copy output to contracts/test/test-proofs/proofs_for_solidity.json');
        process.exit(1);
    }
}

main();
