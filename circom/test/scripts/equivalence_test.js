#!/usr/bin/env node

/**
 * Poseidon2 Equivalence Test
 * Matches the output format of contracts/test/Poseidon2Test.t.sol
 * Uses the generated witness calculator directly (no snarkjs needed)
 */

const fs = require('fs');
const path = require('path');

const TEST_INPUT = "0x10";

async function runHash1(input) {
    const testDir = path.join(__dirname, '..');
    const jsDir = path.join(testDir, 'poseidon2_test1_js');
    const wasmPath = path.join(jsDir, 'poseidon2_test1.wasm');
    const witnessCalcPath = path.join(jsDir, 'witness_calculator.js');
    
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}. Please compile first with: circom test/circuits/poseidon2_test1.circom --r1cs --wasm --sym --c -o test/`);
    }
    
    if (!fs.existsSync(witnessCalcPath)) {
        throw new Error(`Witness calculator not found: ${witnessCalcPath}`);
    }
    
    // Load witness calculator
    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    
    // Prepare input (convert hex string to number if needed)
    let inputValue = input;
    if (typeof input === 'string' && input.startsWith('0x')) {
        inputValue = BigInt(input).toString();
    }
    
    const inputObj = {
        in: inputValue.toString()
    };
    
    // Calculate witness
    const witness = await wtnsCalculator.calculateWitness(inputObj, 0);
    
    // Output is at index 1 (after constant 1)
    const output = witness[1].toString();
    
    return output;
}

async function main() {
    console.log("========================================================================");
    console.log("      TEST: Poseidon2 Hardcoded Values (Circom)");
    console.log("========================================================================");
    console.log("");

    // Test 1: Hash single value (0x10)
    console.log("Test 1: Poseidon2::hash_1([input])");
    const input1 = TEST_INPUT;
    const output1 = await runHash1(input1);
    console.log(`  Input:  0x${BigInt(input1).toString(16)}`);
    console.log(`  Output: 0x${BigInt(output1).toString(16)}`);
    console.log("");

    // Test 2: Hash the result again (2-hash chain)
    console.log("Test 2: Poseidon2::hash_1([hash1]) - 2-hash chain");
    const output2 = await runHash1(output1);
    console.log(`  Input:  0x${BigInt(output1).toString(16)}`);
    console.log(`  Output: 0x${BigInt(output2).toString(16)}`);
    console.log("");

    // Test 3: 100-hash chain
    console.log("Test 3: 100-hash chain");
    let currentHash = input1;
    
    for (let i = 0; i < 100; i++) {
        currentHash = await runHash1(currentHash);
        
        // Print first few iterations and every 10th (matching Solidity test)
        if (i < 3 || (i + 1) % 10 == 0) {
            console.log(`  Iteration ${i + 1}: 0x${BigInt(currentHash).toString(16)}`);
        }
    }

    console.log("");
    console.log("Final result after 100 hashes:");
    console.log(`  Output: 0x${BigInt(currentHash).toString(16)}`);
    console.log("");
}

if (require.main === module) {
    main().catch((error) => {
        console.error("Error:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    });
}
