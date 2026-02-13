#!/usr/bin/env node

/**
 * Test Absorb-Withdraw Flow
 * Flow: Entry (nonce 0) → Send to yourself (nonce 1) → Absorb-Withdraw (nonce 2)
 * 
 * This test simulates:
 * 1. Entry to initialize state
 * 2. Send to yourself (creates note_stack)
 * 3. Absorb-Withdraw (absorbs note_stack then withdraws)
 */

const fs = require('fs');
const path = require('path');
const { poseidon2Hash2, poseidon2Hash3 } = require('./poseidon2_hash_helper');
const { simulateLeanIMTInsert, generateMerkleProof } = require('./lean_imt_helpers');
const { simulateContractShareAddition, scalarMul } = require('./babyjub_operations');

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

// Baby Jubjub BASE8 generator (from EIP-2494)
const BASE8_X = "5299619240641551281634865583518297030282874472190772894086521144482721001553";
const BASE8_Y = "16950150798460657717958625567821834550301663161624707787222815936182638968203";

// Calculate public key from private key: pub_key = private_key * BASE8
async function calculatePublicKey(privateKey) {
    const pubKey = await scalarMul(privateKey.toString(), [BASE8_X, BASE8_Y]);
    return [pubKey.x, pubKey.y];
}

// Run a circuit and return witness
async function runCircuit(circuitName, input) {
    const buildDir = path.join(__dirname, `../../build/${circuitName}/${circuitName}_js`);
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

async function testAbsorbWithdrawFlow() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Entry → Send to Self → Absorb-Withdraw Flow');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Flow:');
    console.log('  1. Entry (nonce 0) - initialize state');
    console.log('  2. Send to yourself (nonce 1) - creates note_stack');
    console.log('  3. Absorb-Withdraw (nonce 2) - absorbs note_stack then withdraws');
    console.log('');
    
    // === STEP 1: Run Entry Circuit ===
    console.log('STEP 1: Running Entry Circuit (nonce 0)...');
    console.log('');
    
    const userKey = hexToDecimal("0x1234567890abcdef");
    const tokenAddress = hexToDecimal("0x02");
    const chainId = hexToDecimal("0x01");
    
    const entryInput = {
        user_key: userKey,
        token_address: tokenAddress,
        chain_id: chainId
    };
    
    console.log('Entry inputs:');
    console.log(`  user_key: ${decimalToHex(entryInput.user_key)}`);
    console.log(`  token_address: ${decimalToHex(entryInput.token_address)}`);
    console.log(`  chain_id: ${decimalToHex(entryInput.chain_id)}`);
    console.log('');
    
    const entryWitness = await runCircuit('entry', entryInput);
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const nonce_commitment_0 = entryWitness[3].toString();
    
    console.log('Entry outputs:');
    console.log(`  balance_commitment: [${decimalToHex(balance_commitment_x)}, ${decimalToHex(balance_commitment_y)}]`);
    console.log(`  nonce_commitment: ${decimalToHex(nonce_commitment_0)}`);
    console.log('');
    
    // === STEP 2: Hash commitment point to get leaf ===
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
    
    const depositAmount = hexToDecimal("0x64"); // 100
    const depositInput = {
        user_key: userKey,
        token_address: tokenAddress,
        amount: depositAmount,
        chain_id: chainId,
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
    
    // Simulate contract share addition
    const circuitCommitmentPoint = {
        x: deposit_commitment_x,
        y: deposit_commitment_y
    };
    const shares = depositAmount;
    
    const contractResult = await simulateContractShareAddition(circuitCommitmentPoint, shares, poseidon2Hash2);
    const depositLeaf = contractResult.leaf;
    
    console.log(`Deposit leaf (after contract addition): ${decimalToHex(depositLeaf)}`);
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
    
    // === STEP 5: Calculate your own public key for sending to yourself ===
    console.log('STEP 5: Calculating your own public key (for sending to yourself)...');
    console.log('');
    
    // For send, the circuit uses nonce = previous_nonce + 1 = 1 + 1 = 2
    // So sender_private_key = user_key + 2
    const sendNonce = 2; // Send uses nonce 2 (previous_nonce was 1)
    const senderPrivateKey = (BigInt(userKey) + BigInt(sendNonce)).toString();
    const myPublicKey = await calculatePublicKey(senderPrivateKey);
    
    console.log(`Your public key at nonce 2 (for send):`);
    console.log(`  [${decimalToHex(myPublicKey[0])}, ${decimalToHex(myPublicKey[1])}]`);
    console.log('');
    
    // === STEP 6: Run Send Circuit (send to yourself) ===
    console.log('STEP 6: Running Send Circuit (send to yourself, nonce 1)...');
    console.log('');
    
    const sendAmount = hexToDecimal("0x32"); // 50
    const previousShares = (BigInt(1) + BigInt(depositAmount)).toString(); // Base 1 + shares 100 = 101
    const sendInput = {
        user_key: userKey,
        token_address: tokenAddress,
        amount: sendAmount,
        chain_id: chainId,
        previous_nonce: "1", // Deposit used nonce 0, so send uses nonce 1
        previous_shares: previousShares, // Actual shares 100 → pass 101 to circuit
        nullifier: depositInput.nullifier, // Must match what deposit used: "1" (represents 0)
        previous_unlocks_at: depositInput.previous_unlocks_at, // Must match what deposit used: "1" (represents 0)
        previous_commitment_leaf: depositLeaf,
        commitment_index: "1", // Deposit is at index 1
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterDeposit,
        merkle_proof: await generateMerkleProof(depositLeaf, 1, treeDepth, allLeaves, treeSize, hashWrapper),
        receiver_public_key: myPublicKey, // Send to yourself
        relayer_fee_amount: "1"
    };
    
    console.log('Send inputs:');
    console.log(`  previous_nonce: ${sendInput.previous_nonce}`);
    console.log(`  previous_shares: ${sendInput.previous_shares}`);
    console.log(`  amount: ${decimalToHex(sendInput.amount)}`);
    console.log(`  receiver_public_key: [${decimalToHex(sendInput.receiver_public_key[0])}, ${decimalToHex(sendInput.receiver_public_key[1])}]`);
    console.log('');
    
    const sendWitness = await runCircuit('send', sendInput);
    
    // Extract outputs
    const send_new_commitment_leaf = sendWitness[1].toString();
    const send_new_nonce_commitment = sendWitness[2].toString();
    const note_commitment_x = sendWitness[10].toString();
    const note_commitment_y = sendWitness[11].toString();
    
    console.log('Send outputs:');
    console.log(`  new_commitment_leaf: ${decimalToHex(send_new_commitment_leaf)}`);
    console.log(`  new_nonce_commitment: ${decimalToHex(send_new_nonce_commitment)}`);
    console.log(`  note_commitment: [${decimalToHex(note_commitment_x)}, ${decimalToHex(note_commitment_y)}]`);
    console.log('');
    
    // The note_commitment is the note_stack for absorbing
    const note_stack_x = note_commitment_x;
    const note_stack_y = note_commitment_y;
    const note_stack_m = sendAmount; // The amount sent
    // Calculate shared key: shared_key = sender_private_key * receiver_public_key
    // The send circuit computes: shared_key = DH(...), then shared_key_hash = Poseidon2Hash1(shared_key)
    const sharedKeyPoint = await scalarMul(senderPrivateKey, myPublicKey);
    const sharedKey = await poseidon2Hash2(sharedKeyPoint.x, sharedKeyPoint.y); // This is what DH outputs
    // Now hash it with Hash1 to get shared_key_hash (what send uses for note commitment)
    const { poseidon2Hash1 } = require('./poseidon2_hash_helper');
    const sharedKeyHash = await poseidon2Hash1(sharedKey);
    const note_stack_r = sharedKeyHash;
    
    console.log('Note stack (for absorbing):');
    console.log(`  note_stack_x: ${decimalToHex(note_stack_x)}`);
    console.log(`  note_stack_y: ${decimalToHex(note_stack_y)}`);
    console.log(`  note_stack_m: ${decimalToHex(note_stack_m)}`);
    console.log(`  note_stack_r: ${decimalToHex(note_stack_r)}`);
    console.log('');
    
    // Hash note_stack to get leaf
    const note_stack_leaf = await poseidon2Hash2(note_stack_x, note_stack_y);
    
    // Insert send commitment and note_stack into tree
    allLeaves.push(send_new_commitment_leaf);
    const treeResult3 = await simulateLeanIMTInsert(send_new_commitment_leaf, treeSize, treeDepth, sideNodes, hashWrapper);
    const rootAfterSend1 = treeResult3.root;
    treeSize = 3;
    
    allLeaves.push(note_stack_leaf);
    const treeResult4 = await simulateLeanIMTInsert(note_stack_leaf, treeSize, treeResult3.depth, treeResult3.sideNodes, hashWrapper);
    const rootAfterSend = treeResult4.root;
    treeDepth = treeResult4.depth;
    sideNodes = treeResult4.sideNodes;
    treeSize = 4;
    
    console.log(`Tree after send:`);
    console.log(`  Root: ${decimalToHex(rootAfterSend)}`);
    console.log(`  Depth: ${treeDepth}`);
    console.log(`  Size: ${treeSize}`);
    console.log('');
    
    // === STEP 7: Run Absorb-Withdraw Circuit (nonce 2) ===
    console.log('STEP 7: Running Absorb-Withdraw Circuit (nonce 2)...');
    console.log('');
    
    // After send, the balance is: previous_shares (101) - amount (50) - fee (1) = 50
    // In raw balance format (not encoded), this is: 50 - 1 = 49
    // The send circuit uses encoded shares. After send:
    // final_shares = 101 - 50 - 1 = 50 (encoded)
    // Raw balance = 50 - 1 = 49
    
    const finalSharesAfterSend = (BigInt(previousShares) - BigInt(sendAmount) - BigInt(1)).toString(); // 101 - 50 - 1 = 50 (encoded)
    // The send circuit stores commitment with m1 = final_shares (encoded) = 50
    // The absorb circuit reconstructs with m1 = current_balance
    // To match, we need current_balance = 50 (the encoded value)
    const current_balance = finalSharesAfterSend; // 50 (encoded shares value)
    const nullifier_after_send = "1"; // Nullifier stays 0 (encoded as 1) after send
    
    const absorbWithdrawAmount = hexToDecimal("0x1e"); // 30
    const absorbRelayerFee = hexToDecimal("0x05"); // 5
    const withdrawRelayerFee = hexToDecimal("0x01"); // 1
    
    // For withdraw, we need previous_unlocks_at (must be unlocked, so use 1 which represents 0)
    // declared_time_reference must be >= unlocks_at
    const declaredTimeReference = hexToDecimal("0x0f4240"); // 1000000 (large timestamp)
    const arbitraryCalldataHash = hexToDecimal("0x1234567890abcdef");
    const receiverAddress = hexToDecimal("0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6");
    
    const absorbWithdrawInput = {
        user_key: userKey,
        previous_nonce: "2", // Send created new commitment with nonce 2, so this is the previous nonce
        current_balance: current_balance,
        nullifier: nullifier_after_send,
        previous_unlocks_at: "1", // Must be 1 (represents 0, unlocked)
        previous_commitment_leaf: send_new_commitment_leaf,
        commitment_index: "2", // Send commitment is at index 2
        tree_depth: treeDepth.toString(),
        merkle_proof: await generateMerkleProof(send_new_commitment_leaf, 2, treeDepth, allLeaves, treeSize, hashWrapper),
        note_stack_m: note_stack_m,
        note_stack_r: note_stack_r,
        note_stack_commitment_index: "3", // Note stack is at index 3
        note_stack_merkle_proof: await generateMerkleProof(note_stack_leaf, 3, treeDepth, allLeaves, treeSize, hashWrapper),
        token_address: tokenAddress,
        amount: absorbWithdrawAmount,
        chain_id: chainId,
        expected_root: rootAfterSend,
        note_stack_x: note_stack_x,
        note_stack_y: note_stack_y,
        declared_time_reference: declaredTimeReference,
        arbitrary_calldata_hash: arbitraryCalldataHash,
        receiver_address: receiverAddress,
        relayer_fee_amount: absorbRelayerFee,
        withdraw_relayer_fee_amount: withdrawRelayerFee
    };
    
    console.log('Absorb-Withdraw inputs:');
    console.log(`  previous_nonce: ${absorbWithdrawInput.previous_nonce}`);
    console.log(`  current_balance: ${absorbWithdrawInput.current_balance}`);
    console.log(`  note_stack_m: ${decimalToHex(absorbWithdrawInput.note_stack_m)}`);
    console.log(`  amount: ${decimalToHex(absorbWithdrawInput.amount)}`);
    console.log(`  declared_time_reference: ${decimalToHex(absorbWithdrawInput.declared_time_reference)}`);
    console.log(`  receiver_address: ${decimalToHex(absorbWithdrawInput.receiver_address)}`);
    console.log('');
    
    try {
        const absorbWithdrawWitness = await runCircuit('absorb_withdraw', absorbWithdrawInput);
        
        // Extract outputs: commitment[2], new_nonce_commitment, encrypted_state_details[2], nonce_discovery_entry[2]
        const commitment_x = absorbWithdrawWitness[1].toString();
        const commitment_y = absorbWithdrawWitness[2].toString();
        const new_nonce_commitment = absorbWithdrawWitness[3].toString();
        
        console.log('✅ Absorb-Withdraw circuit test passed!');
        console.log('');
        console.log('Absorb-Withdraw outputs:');
        console.log(`  commitment: [${decimalToHex(commitment_x)}, ${decimalToHex(commitment_y)}]`);
        console.log(`  new_nonce_commitment: ${decimalToHex(new_nonce_commitment)}`);
        console.log('');
        
        return {
            success: true,
            commitment: [commitment_x, commitment_y],
            new_nonce_commitment
        };
    } catch (err) {
        console.error('❌ Absorb-Withdraw circuit failed:', err.message);
        throw err;
    }
}

// Run the test
testAbsorbWithdrawFlow().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});

