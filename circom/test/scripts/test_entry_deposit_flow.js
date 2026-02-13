#!/usr/bin/env node

/**
 * Test Entry → Deposit Flow
 * Simulates the full flow: entry circuit → build tree → deposit circuit
 * Uses Circom's Baby Jubjub generators (embedded in Fr)
 * 
 * This matches the Noir test_deposit_flow() test structure
 */

const fs = require('fs');
const path = require('path');
const { poseidon2Hash2 } = require('./poseidon2_hash_helper');
const { simulateLeanIMTInsert, generateMerkleProof } = require('./lean_imt_helpers');
const { simulateContractShareAddition } = require('./babyjub_operations');

// Helper to convert hex to decimal string
function hexToDecimal(hexStr) {
    if (typeof hexStr === 'string' && hexStr.startsWith('0x')) {
        return BigInt(hexStr).toString();
    }
    return hexStr.toString();
}

// Helper to convert decimal to hex
function decimalToHex(decimalStr) {
    return '0x' + BigInt(decimalStr).toString(16);
}

// Run a circuit and return witness
async function runCircuit(circuitName, input) {
    // For main circuits, use build directory
    // For test circuits, use test directory
    let buildDir;
    if (circuitName.includes('_test') || circuitName.includes('test')) {
        buildDir = path.join(__dirname, `../../test/circuits/${circuitName}_js`);
    } else {
        buildDir = path.join(__dirname, `../../build/${circuitName}/${circuitName}_js`);
    }

    const wasmPath = path.join(buildDir, `${circuitName}.wasm`);
    const witnessCalcPath = path.join(buildDir, `witness_calculator.js`);

    if (!fs.existsSync(wasmPath)) {
        throw new Error(`Circuit not compiled: ${circuitName}\nWASM path: ${wasmPath}\nRun: pnpm run compile:${circuitName}`);
    }

    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);

    const witness = await wtnsCalculator.calculateWitness(input, 0);
    return witness;
}

// Wrapper for poseidon2Hash2 to match the async signature expected by lean_imt_helpers
async function hashWrapper(a, b) {
    return await poseidon2Hash2(a, b);
}

async function testEntryDepositFlow() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Entry → Deposit Flow (Circom Baby Jubjub)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('This test simulates the full flow using Circom\'s Baby Jubjub generators.');
    console.log('It chains entry → deposit and builds the Merkle tree.');
    console.log('');

    // === STEP 1: Run Entry Circuit ===
    console.log('STEP 1: Running Entry Circuit...');
    console.log('');

    const entryInput = {
        user_key: hexToDecimal("0x19e573f3801c7b2e4619998342e8e305e1692184cbacd220c04198a04c36b7d2"),
        token_address: hexToDecimal("0x7775e4b6f4d40be537b55b6c47e09ada0157bd"),
        chain_id: hexToDecimal("0x01")
    };

    console.log('Entry inputs:');
    console.log(`  user_key: ${decimalToHex(entryInput.user_key)}`);
    console.log(`  token_address: ${decimalToHex(entryInput.token_address)}`);
    console.log(`  chain_id: ${decimalToHex(entryInput.chain_id)}`);
    console.log('');

    const entryWitness = await runCircuit('entry', entryInput);

    // Extract outputs: balance_commitment[2], nonce_commitment, nonce_discovery_entry[2]
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const nonce_commitment = entryWitness[3].toString();

    console.log('Entry outputs:');
    console.log(`  balance_commitment: [${decimalToHex(balance_commitment_x)}, ${decimalToHex(balance_commitment_y)}]`);
    console.log(`  nonce_commitment: ${decimalToHex(nonce_commitment)}`);
    console.log('');

    // === STEP 2: Hash commitment point to get leaf ===
    console.log('STEP 2: Hashing commitment point to get leaf...');
    console.log('');

    const entryLeaf = await poseidon2Hash2(balance_commitment_x, balance_commitment_y);

    console.log(`Entry commitment leaf: ${decimalToHex(entryLeaf)}`);
    console.log('');

    // === STEP 3: Build Merkle Tree ===
    console.log('STEP 3: Building Merkle Tree...');
    console.log('');

    let treeSize = 0;
    let treeDepth = 1;
    let sideNodes = new Array(32).fill('0');
    const allLeaves = [entryLeaf];

    // Insert entry leaf using Lean-IMT insertion
    const treeResult = await simulateLeanIMTInsert(entryLeaf, treeSize, treeDepth, sideNodes, hashWrapper);
    const rootAfterEntry = treeResult.root;
    treeDepth = treeResult.depth;
    sideNodes = treeResult.sideNodes;
    treeSize = 1;

    console.log(`Tree after entry:`);
    console.log(`  Root: ${decimalToHex(rootAfterEntry)}`);
    console.log(`  Depth: ${treeDepth}`);
    console.log(`  Size: ${treeSize}`);
    console.log('');

    // === STEP 4: Generate Merkle Proof ===
    console.log('STEP 4: Generating Merkle Proof...');
    console.log('');

    const commitmentIndex = 0;
    const merkleProof = await generateMerkleProof(entryLeaf, commitmentIndex, treeDepth, allLeaves, treeSize, hashWrapper);

    console.log(`Merkle proof for index ${commitmentIndex}:`);
    console.log(`  Proof[0]: ${decimalToHex(merkleProof[0])}`);
    console.log(`  Proof[1]: ${decimalToHex(merkleProof[1])}`);
    console.log(`  (remaining are zeros)`);
    console.log('');

    // === STEP 5: Run Deposit Circuit ===
    console.log('STEP 5: Running Deposit Circuit...');
    console.log('');

    const depositInput = {
        user_key: entryInput.user_key,
        token_address: entryInput.token_address,
        amount: hexToDecimal("0x32"), // 50
        chain_id: entryInput.chain_id,
        previous_nonce: "0", // Entry uses nonce 0
        previous_shares: "1", // Entry starts with 0 shares (encoded as 1)
        nullifier: "1", // Entry uses nullifier 0 (encoded as 1)
        previous_unlocks_at: "1", // Entry initializes to 0 (encoded as 1)
        previous_commitment_leaf: entryLeaf,
        commitment_index: commitmentIndex.toString(),
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterEntry,
        merkle_proof: merkleProof
    };

    console.log('Deposit inputs:');
    console.log(`  previous_nonce: ${depositInput.previous_nonce}`);
    console.log(`  previous_shares: ${depositInput.previous_shares}`);
    console.log(`  previous_commitment_leaf: ${decimalToHex(depositInput.previous_commitment_leaf)}`);
    console.log(`  commitment_index: ${depositInput.commitment_index}`);
    console.log(`  tree_depth: ${depositInput.tree_depth}`);
    console.log(`  expected_root: ${decimalToHex(depositInput.expected_root)}`);
    console.log('');

    try {
        const depositWitness = await runCircuit('deposit', depositInput);

        // Extract outputs
        const commitment_x = depositWitness[1].toString();
        const commitment_y = depositWitness[2].toString();
        const encrypted_balance = depositWitness[3].toString();
        const encrypted_nullifier = depositWitness[4].toString();
        const nonce_discovery_entry_x = depositWitness[5].toString();
        const nonce_discovery_entry_y = depositWitness[6].toString();
        const new_nonce_commitment = depositWitness[7].toString();

        console.log('✅ Deposit circuit test passed!');
        console.log('');
        console.log('Deposit outputs:');
        console.log(`  commitment: [${decimalToHex(commitment_x)}, ${decimalToHex(commitment_y)}]`);
        console.log(`  encrypted_state_details: [${decimalToHex(encrypted_balance)}, ${decimalToHex(encrypted_nullifier)}]`);
        console.log(`  nonce_discovery_entry: [${decimalToHex(nonce_discovery_entry_x)}, ${decimalToHex(nonce_discovery_entry_y)}]`);
        console.log(`  new_nonce_commitment: ${decimalToHex(new_nonce_commitment)}`);
        console.log('');

        // IMPORTANT: The contract adds shares*G to the commitment point before hashing
        // So we need to simulate this to get the correct leaf
        const circuitCommitmentPoint = { x: commitment_x, y: commitment_y };
        const shares = depositInput.amount; // Deposit amount becomes shares

        console.log(`Simulating contract share addition...`);
        console.log(`  Circuit commitment: [${decimalToHex(commitment_x)}, ${decimalToHex(commitment_y)}]`);
        console.log(`  Adding shares*G where shares = ${shares}`);

        const contractResult = await simulateContractShareAddition(circuitCommitmentPoint, shares, poseidon2Hash2);
        const newLeaf = contractResult.leaf;

        console.log(`  Final commitment point: [${decimalToHex(contractResult.finalPoint.x)}, ${decimalToHex(contractResult.finalPoint.y)}]`);
        console.log(`  New commitment leaf (after contract addition): ${decimalToHex(newLeaf)}`);
        console.log('');

        // Save test data for future use
        const testData = {
            entry: {
                inputs: entryInput,
                outputs: {
                    balance_commitment: [balance_commitment_x, balance_commitment_y],
                    nonce_commitment,
                    leaf: entryLeaf
                }
            },
            deposit: {
                inputs: depositInput,
                outputs: {
                    commitment: [commitment_x, commitment_y],
                    encrypted_state_details: [encrypted_balance, encrypted_nullifier],
                    nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y],
                    new_nonce_commitment,
                    leaf: newLeaf
                }
            },
            tree: {
                root_after_entry: rootAfterEntry,
                depth: treeDepth,
                size: treeSize
            }
        };

        // Write test data to file for reference
        const testDataPath = path.join(__dirname, '../../test/inputs/entry_deposit_flow_output.json');
        fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
        console.log(`✅ Test data saved to: ${testDataPath}`);
        console.log('');

        return {
            entry: {
                balance_commitment: [balance_commitment_x, balance_commitment_y],
                nonce_commitment,
                leaf: entryLeaf
            },
            deposit: {
                commitment: [commitment_x, commitment_y],
                encrypted_state_details: [encrypted_balance, encrypted_nullifier],
                nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y],
                new_nonce_commitment,
                leaf: newLeaf
            }
        };
    } catch (err) {
        console.error('❌ Deposit circuit failed:', err.message);
        throw err;
    }
}

// Export function and inputs for use by other scripts
if (require.main === module) {
    // Run the test if called directly
    testEntryDepositFlow().catch(err => {
        console.error('❌ Test failed:', err.message);
        process.exit(1);
    });
} else {
    // Export for use by other scripts
    module.exports = { testEntryDepositFlow };
}

// Export a function to get deposit inputs
async function getDepositInputs() {
    const result = await testEntryDepositFlow();
    // We need to reconstruct the deposit input from the test
    // Let's modify the function to return inputs as well
    return null; // Will be implemented below
}

// Actually, let's modify testEntryDepositFlow to return inputs
async function getDepositInputsFromFlow() {
    const entryInput = {
        user_key: hexToDecimal("0x19e573f3801c7b2e4619998342e8e305e1692184cbacd220c04198a04c36b7d2"),
        token_address: hexToDecimal("0x7775e4b6f4d40be537b55b6c47e09ada0157bd"),
        chain_id: hexToDecimal("0x01")
    };
    
    const entryWitness = await runCircuit('entry', entryInput);
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const entryLeaf = await poseidon2Hash2(balance_commitment_x, balance_commitment_y);
    
    let treeSize = 0;
    let treeDepth = 1;
    let sideNodes = new Array(32).fill('0');
    const allLeaves = [entryLeaf];
    
    const treeResult = await simulateLeanIMTInsert(entryLeaf, treeSize, treeDepth, sideNodes, hashWrapper);
    const rootAfterEntry = treeResult.root;
    treeDepth = treeResult.depth;
    sideNodes = treeResult.sideNodes;
    treeSize = 1;
    
    const commitmentIndex = 0;
    const merkleProof = await generateMerkleProof(entryLeaf, commitmentIndex, treeDepth, allLeaves, treeSize, hashWrapper);
    
    const depositInput = {
        user_key: entryInput.user_key,
        token_address: entryInput.token_address,
        amount: hexToDecimal("0x32"),
        chain_id: entryInput.chain_id,
        previous_nonce: "0",
        previous_shares: "1",
        nullifier: "1",
        previous_unlocks_at: "1",
        previous_commitment_leaf: entryLeaf,
        commitment_index: commitmentIndex.toString(),
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterEntry,
        merkle_proof: merkleProof
    };
    
    return depositInput;
}

module.exports.getDepositInputs = getDepositInputsFromFlow;

