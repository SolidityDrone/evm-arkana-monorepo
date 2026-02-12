/**
 * Poseidon2 Hash Helper
 * Uses the compiled Poseidon2Hash2 circuit to hash values
 */

const fs = require('fs');
const path = require('path');

// Create a simple Poseidon2Hash2 test circuit if it doesn't exist
async function ensureHashCircuit() {
    const testDir = path.join(__dirname, '../../test/circuits');
    const testHashPath = path.join(testDir, 'poseidon2_hash2_test.circom');
    const testHashJsPath = path.join(testDir, 'poseidon2_hash2_test_js');
    const wasmPath = path.join(testHashJsPath, 'poseidon2_hash2_test.wasm');
    
    // Check if already compiled
    if (fs.existsSync(wasmPath)) {
        return testHashJsPath;
    }
    
    // Create test circuit
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testCircuitContent = `pragma circom 2.0.0;
include "../../lib/poseidon/poseidon2.circom";

template Poseidon2Hash2Test() {
    signal input in[2];
    signal output out;
    
    component hash = Poseidon2Hash2();
    hash.in[0] <== in[0];
    hash.in[1] <== in[1];
    out <== hash.out;
}

component main = Poseidon2Hash2Test();
`;
    
    fs.writeFileSync(testHashPath, testCircuitContent);
    
    // Compile it
    const { execSync } = require('child_process');
    try {
        execSync(`cd ${testDir} && circom poseidon2_hash2_test.circom --r1cs --wasm --sym --c -o . 2>&1`, { 
            stdio: 'inherit',
            cwd: testDir
        });
    } catch (err) {
        throw new Error(`Failed to compile Poseidon2Hash2 test circuit: ${err.message}`);
    }
    
    return testHashJsPath;
}

// Hash two field elements using Poseidon2Hash2
async function poseidon2Hash2(a, b) {
    const testHashJsPath = await ensureHashCircuit();
    const wasmPath = path.join(testHashJsPath, 'poseidon2_hash2_test.wasm');
    const witnessCalcPath = path.join(testHashJsPath, 'witness_calculator.js');
    
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`Poseidon2Hash2 WASM not found: ${wasmPath}`);
    }
    
    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    
    const input = {
        in: [a.toString(), b.toString()]
    };
    
    const witness = await wtnsCalculator.calculateWitness(input, 0);
    return witness[1].toString(); // Output is at index 1
}

// Hash three field elements using Poseidon2Hash3
async function poseidon2Hash3(a, b, c) {
    const { execSync } = require('child_process');
    const testDir = path.join(__dirname, '../../test/circuits');
    const testHashPath = path.join(testDir, 'poseidon2_hash3_test.circom');
    const testHashJsPath = path.join(testDir, 'poseidon2_hash3_test_js');
    const wasmPath = path.join(testHashJsPath, 'poseidon2_hash3_test.wasm');
    
    if (!fs.existsSync(wasmPath)) {
        // Create test circuit if it doesn't exist
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        const testCircuitContent = `pragma circom 2.0.0;
include "../../lib/poseidon/poseidon2.circom";

template Poseidon2Hash3Test() {
    signal input in[3];
    signal output out;
    
    component hash = Poseidon2Hash3();
    hash.in[0] <== in[0];
    hash.in[1] <== in[1];
    hash.in[2] <== in[2];
    out <== hash.out;
}

component main = Poseidon2Hash3Test();
`;
        
        fs.writeFileSync(testHashPath, testCircuitContent);
        
        // Compile it
        try {
            execSync(`cd ${testDir} && circom poseidon2_hash3_test.circom --r1cs --wasm --sym --c -o . 2>&1`, { 
                stdio: 'inherit',
                cwd: testDir
            });
        } catch (err) {
            throw new Error(`Failed to compile Poseidon2Hash3 test circuit: ${err.message}`);
        }
    }
    
    const witnessCalculator = require(path.join(testHashJsPath, 'witness_calculator.js'));
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    
    const input = {
        in: [a.toString(), b.toString(), c.toString()]
    };
    
    const witness = await wtnsCalculator.calculateWitness(input, 0);
    return witness[1].toString(); // Output is at index 1
}

module.exports = {
    poseidon2Hash2,
    poseidon2Hash3,
    ensureHashCircuit
};

