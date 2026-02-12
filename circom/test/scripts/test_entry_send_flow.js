#!/usr/bin/env node

/**
 * Test Entry → Send Flow
 * Simulates the full flow: entry → send
 * Uses Circom's Baby Jubjub generators (embedded in Fr)
 * 
 * This matches the Noir test structure for send
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

async function testEntrySendFlow() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Entry → Deposit → Send Flow (Circom Baby Jubjub)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('This test simulates: entry → deposit → send');
    console.log('(Send requires shares >= amount, so we need deposit first)');
    console.log('All using Circom\'s Baby Jubjub generators.');
    console.log('');
    
    // === STEP 1: Run Entry Circuit ===
    console.log('STEP 1: Running Entry Circuit...');
    console.log('');
    
    const entryInput = {
        user_key: hexToDecimal("0x1234567890abcdef"),
        token_address: hexToDecimal("0x02"),
        chain_id: hexToDecimal("0x01")
    };
    
    console.log('Entry inputs:');
    console.log(`  user_key: ${decimalToHex(entryInput.user_key)}`);
    console.log(`  token_address: ${decimalToHex(entryInput.token_address)}`);
    console.log(`  chain_id: ${decimalToHex(entryInput.chain_id)}`);
    console.log('');
    
    const entryWitness = await runCircuit('entry', entryInput);
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const nonce_commitment = entryWitness[3].toString();
    
    console.log('Entry outputs:');
    console.log(`  balance_commitment: [${decimalToHex(balance_commitment_x)}, ${decimalToHex(balance_commitment_y)}]`);
    console.log(`  nonce_commitment: ${decimalToHex(nonce_commitment)}`);
    console.log('');
    
    // === STEP 2: Hash commitment point to get leaf ===
    console.log('STEP 2: Hashing entry commitment point to get leaf...');
    console.log('');
    
    const entryLeaf = await poseidon2Hash2(balance_commitment_x, balance_commitment_y);
    console.log(`Entry commitment leaf: ${decimalToHex(entryLeaf)}`);
    console.log('');
    
    // === STEP 3: Build Merkle Tree with Entry ===
    console.log('STEP 3: Building Merkle Tree with Entry...');
    console.log('');
    
    let treeSize = 0;
    let treeDepth = 1;
    let sideNodes = new Array(32).fill('0');
    const allLeaves = [entryLeaf];
    
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
    
    // === STEP 4: Run Deposit Circuit (needed for send to have shares) ===
    console.log('STEP 4: Running Deposit Circuit...');
    console.log('');
    
    const depositAmount = hexToDecimal("0x32"); // 50
    const depositInput = {
        user_key: entryInput.user_key,
        token_address: entryInput.token_address,
        amount: depositAmount,
        chain_id: entryInput.chain_id,
        previous_nonce: "0",
        previous_shares: "1", // Entry starts with 0 shares (encoded as 1)
        nullifier: "1", // Entry uses nullifier 0 (encoded as 1)
        previous_unlocks_at: "1", // Entry initializes to 0 (encoded as 1)
        previous_commitment_leaf: entryLeaf,
        commitment_index: "0",
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterEntry,
        merkle_proof: await generateMerkleProof(entryLeaf, 0, treeDepth, allLeaves, treeSize, hashWrapper)
    };
    
    const depositWitness = await runCircuit('deposit', depositInput);
    const deposit_commitment_x = depositWitness[1].toString();
    const deposit_commitment_y = depositWitness[2].toString();
    const deposit_nonce_commitment = depositWitness[7].toString();
    
    console.log('Deposit outputs:');
    console.log(`  commitment: [${decimalToHex(deposit_commitment_x)}, ${decimalToHex(deposit_commitment_y)}]`);
    console.log(`  new_nonce_commitment: ${decimalToHex(deposit_nonce_commitment)}`);
    console.log('');
    
    // IMPORTANT: The contract adds shares*G to the commitment point before hashing
    // So we need to simulate this to get the correct leaf
    const circuitCommitmentPoint = {
        x: deposit_commitment_x,
        y: deposit_commitment_y
    };
    const shares = depositAmount; // Deposit amount becomes shares
    
    console.log(`Simulating contract share addition...`);
    console.log(`  Circuit commitment: [${decimalToHex(circuitCommitmentPoint.x)}, ${decimalToHex(circuitCommitmentPoint.y)}]`);
    console.log(`  Adding shares*G where shares = ${shares}`);
    
    const contractResult = await simulateContractShareAddition(circuitCommitmentPoint, shares, poseidon2Hash2);
    const depositLeaf = contractResult.leaf;
    
    console.log(`  Final commitment point: [${decimalToHex(contractResult.finalPoint.x)}, ${decimalToHex(contractResult.finalPoint.y)}]`);
    console.log(`  Deposit leaf (after contract addition): ${decimalToHex(depositLeaf)}`);
    console.log('');
    
    allLeaves.push(depositLeaf);
    
    const treeResult2 = await simulateLeanIMTInsert(depositLeaf, treeSize, treeDepth, sideNodes, hashWrapper);
    const rootAfterDeposit = treeResult2.root;
    treeDepth = treeResult2.depth;
    sideNodes = treeResult2.sideNodes;
    treeSize = 2;
    
    console.log(`Tree after deposit:`);
    console.log(`  Root: ${decimalToHex(rootAfterDeposit)}`);
    console.log(`  Depth: ${treeDepth}`);
    console.log(`  Size: ${treeSize}`);
    console.log('');
    
    // === STEP 5: Run Send Circuit ===
    console.log('STEP 5: Running Send Circuit...');
    console.log('');
    
    // For send, we need a receiver public key (Baby Jubjub point)
    const receiverPublicKey = [
        hexToDecimal("0x0bd0e01a563a7b2bbd4b14702542d1e09ee93b4bd996f8c2d1502d05e7ac9941"),
        hexToDecimal("0x146a1e792e301e0c53e2422f11b3e09c9c4b58f849fc3aa1c34ea13cb8e02254")
    ];
    
    // IMPORTANT: We can only send up to the actual shares we have
    // previous_shares = 51 (encoded) represents 50 real shares
    // So we can send at most 50 total (amount + relayer_fee_amount)
    // Let's send 49 + 1 = 50 total
    const sendAmount = hexToDecimal("0x31"); // 49 (so total_deduct = 49 + 1 = 50)
    // After deposit, entry used m1=1 (base value), contract added shares*G
    // So final commitment has m1 = 1 + shares = 1 + 50 = 51
    const previousShares = (BigInt(1) + BigInt(depositAmount)).toString(); // Base 1 + shares 50 = 51
    const sendInput = {
        user_key: entryInput.user_key,
        token_address: entryInput.token_address,
        amount: sendAmount,
        chain_id: entryInput.chain_id,
        previous_nonce: "1", // Deposit used nonce 0, so send uses nonce 1
        previous_shares: previousShares, // Actual shares 50 → pass 51 to circuit
        nullifier: depositInput.nullifier, // Must match what deposit used: "1" (represents 0)
        previous_unlocks_at: depositInput.previous_unlocks_at, // Must match what deposit used: "1" (represents 0)
        previous_commitment_leaf: depositLeaf, // Use deposit leaf, not entry leaf
        commitment_index: "1", // Deposit is at index 1
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterDeposit,
        merkle_proof: await generateMerkleProof(depositLeaf, 1, treeDepth, allLeaves, treeSize, hashWrapper),
        receiver_public_key: receiverPublicKey,
        relayer_fee_amount: "1"
    };
    
    // Verify we can reconstruct the deposit leaf
    console.log('Verifying deposit leaf reconstruction...');
    console.log(`  Using previous_nonce: ${sendInput.previous_nonce}`);
    console.log(`  Using previous_shares: ${sendInput.previous_shares}`);
    console.log(`  Using nullifier: ${sendInput.nullifier}`);
    console.log(`  Using previous_unlocks_at: ${sendInput.previous_unlocks_at}`);
    console.log(`  Expected leaf: ${decimalToHex(depositLeaf)}`);
    console.log('');
    
    console.log('Send inputs:');
    console.log(`  previous_nonce: ${sendInput.previous_nonce}`);
    console.log(`  previous_shares: ${sendInput.previous_shares}`);
    console.log(`  amount: ${decimalToHex(sendInput.amount)}`);
    console.log(`  nullifier: ${decimalToHex(sendInput.nullifier)}`);
    console.log(`  previous_commitment_leaf: ${decimalToHex(sendInput.previous_commitment_leaf)}`);
    console.log(`  receiver_public_key: [${decimalToHex(sendInput.receiver_public_key[0])}, ${decimalToHex(sendInput.receiver_public_key[1])}]`);
    console.log(`  expected_root: ${decimalToHex(sendInput.expected_root)}`);
    console.log('');
    
    try {
        const sendWitness = await runCircuit('send', sendInput);
        
        // Extract outputs: new_commitment_leaf, new_nonce_commitment, encrypted_note[3], sender_pub_key[2], nonce_discovery_entry[2], note_commitment[2]
        const new_commitment_leaf = sendWitness[1].toString();
        const new_nonce_commitment = sendWitness[2].toString();
        const receiver_note_amount = sendWitness[3].toString();
        const sender_balance = sendWitness[4].toString();
        const sender_nullifier = sendWitness[5].toString();
        const sender_pub_key_x = sendWitness[6].toString();
        const sender_pub_key_y = sendWitness[7].toString();
        const nonce_discovery_entry_x = sendWitness[8].toString();
        const nonce_discovery_entry_y = sendWitness[9].toString();
        const note_commitment_x = sendWitness[10].toString();
        const note_commitment_y = sendWitness[11].toString();
        
        console.log('✅ Send circuit test passed!');
        console.log('');
        console.log('Send outputs:');
        console.log(`  new_commitment_leaf: ${decimalToHex(new_commitment_leaf)}`);
        console.log(`  new_nonce_commitment: ${decimalToHex(new_nonce_commitment)}`);
        console.log(`  encrypted_note: [${decimalToHex(receiver_note_amount)}, ${decimalToHex(sender_balance)}, ${decimalToHex(sender_nullifier)}]`);
        console.log(`  sender_pub_key: [${decimalToHex(sender_pub_key_x)}, ${decimalToHex(sender_pub_key_y)}]`);
        console.log(`  nonce_discovery_entry: [${decimalToHex(nonce_discovery_entry_x)}, ${decimalToHex(nonce_discovery_entry_y)}]`);
        console.log(`  note_commitment: [${decimalToHex(note_commitment_x)}, ${decimalToHex(note_commitment_y)}]`);
        console.log('');
        
        // Save test data
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
                    commitment: [deposit_commitment_x, deposit_commitment_y],
                    nonce_commitment: deposit_nonce_commitment,
                    leaf: depositLeaf
                }
            },
            send: {
                inputs: sendInput,
                outputs: {
                    new_commitment_leaf,
                    new_nonce_commitment,
                    encrypted_note: [receiver_note_amount, sender_balance, sender_nullifier],
                    sender_pub_key: [sender_pub_key_x, sender_pub_key_y],
                    nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y],
                    note_commitment: [note_commitment_x, note_commitment_y]
                }
            },
            tree: {
                root_after_entry: rootAfterEntry,
                root_after_deposit: rootAfterDeposit,
                depth: treeDepth,
                size: treeSize
            }
        };
        
        const testDataPath = path.join(__dirname, '../../test/inputs/entry_deposit_send_flow_output.json');
        fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
        console.log(`✅ Test data saved to: ${testDataPath}`);
        console.log('');
        
        return testData;
    } catch (err) {
        console.error('❌ Send circuit failed:', err.message);
        throw err;
    }
}

// Run the test
testEntrySendFlow().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});

