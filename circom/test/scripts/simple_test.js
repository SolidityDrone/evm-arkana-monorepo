#!/usr/bin/env node

/**
 * Simple test script for Poseidon2 Circom circuit
 * Usage: node simple_test.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🧪 Testing Poseidon2 Circom Circuit\n");

// Test 1: Compile the circuit
console.log("1️⃣  Compiling Poseidon2Hash1 circuit...");
try {
    execSync(
        'circom test/poseidon2_hash1_test.circom --r1cs --wasm --sym --c -o test/ 2>&1',
        { cwd: path.join(__dirname, '..'), stdio: 'inherit' }
    );
    console.log("✅ Compilation successful!\n");
} catch (error) {
    console.error("❌ Compilation failed!");
    console.error("Make sure circom is installed: npm install -g circom");
    process.exit(1);
}

// Test 2: Check if files were generated
console.log("2️⃣  Checking generated files...");
const requiredFiles = [
    'test/poseidon2_hash1_test.r1cs',
    'test/poseidon2_hash1_test_js/poseidon2_hash1_test.wasm',
    'test/poseidon2_hash1_test_js/generate_witness.js'
];

let allFilesExist = true;
for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - NOT FOUND`);
        allFilesExist = false;
    }
}

if (!allFilesExist) {
    console.error("\n❌ Some required files are missing!");
    process.exit(1);
}

console.log("\n✅ All files generated successfully!\n");

// Test 3: Generate witness
console.log("3️⃣  Generating witness...");
const input = { in: "0x10" };
const inputPath = path.join(__dirname, '..', 'test', 'input.json');
fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

try {
    execSync(
        `node test/poseidon2_hash1_test_js/generate_witness.js test/poseidon2_hash1_test_js/poseidon2_hash1_test.wasm test/input.json test/witness.wtns 2>&1`,
        { cwd: path.join(__dirname, '..'), stdio: 'inherit' }
    );
    console.log("✅ Witness generated!\n");
} catch (error) {
    console.error("❌ Witness generation failed!");
    console.error("Make sure snarkjs is installed: npm install -g snarkjs");
    process.exit(1);
}

// Test 4: Check witness
console.log("4️⃣  Verifying witness...");
try {
    execSync(
        'snarkjs wtns check test/poseidon2_hash1_test.r1cs test/witness.wtns 2>&1',
        { cwd: path.join(__dirname, '..'), stdio: 'inherit' }
    );
    console.log("✅ Witness is valid!\n");
} catch (error) {
    console.error("❌ Witness verification failed!");
    process.exit(1);
}

// Test 5: Print witness values
console.log("5️⃣  Extracting output from witness...");
try {
    const output = execSync(
        'snarkjs wtns export test/witness.wtns 2>&1',
        { cwd: path.join(__dirname, '..'), encoding: 'utf-8' }
    );
    
    // Parse JSON output
    const witness = JSON.parse(output);
    
    // Find the output signal (usually the last non-zero value or we need to check the symbol file)
    console.log("\n📊 Witness values (first 10):");
    for (let i = 0; i < Math.min(10, witness.length); i++) {
        console.log(`   [${i}]: ${witness[i]}`);
    }
    
    // The output is typically at index 1 (after the constant 1)
    if (witness.length > 1) {
        console.log(`\n🎯 Hash output (estimated): ${witness[1]}`);
        console.log(`   (Compare with Noir output from test_poseidon.nr)`);
    }
    
} catch (error) {
    console.error("❌ Failed to extract witness values");
    console.error("You can manually check: snarkjs wtns export test/witness.wtns");
}

console.log("\n✨ Test complete!");
console.log("\nNext steps:");
console.log("1. Compare output with Noir: cd circuits && nargo test --package poseidon");
console.log("2. Test with different inputs by editing test/input.json");
console.log("3. Run full test suite: npm run test:poseidon2");

