#!/usr/bin/env node

/**
 * Test Absorb-Send Flow
 * Flow: Entry (nonce 0) → Send to yourself (nonce 1) → Absorb-Send (nonce 2)
 * 
 * This test simulates:
 * 1. Entry to initialize state
 * 2. Send to yourself (creates note_stack)
 * 3. Absorb-Send (absorbs note_stack then sends)
 */

const fs = require('fs');
const path = require('path');
const { poseidon2Hash1, poseidon2Hash2, poseidon2Hash3, getSpendingKeyFromHashes, getViewKeyFromUserKey, getNonceCommitmentFromViewKey } = require('./poseidon_hash_helper');
const { getSignerKeyPair, signSendMessage, TEST_SIGNER_PRIVKEY_HEX } = require('./eddsa_helper');
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

async function testAbsorbSendFlow() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Entry → Send to Self → Absorb-Send Flow');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Flow:');
    console.log('  1. Entry (nonce 0) - initialize state');
    console.log('  2. Send to yourself (nonce 1) - creates note_stack');
    console.log('  3. Absorb-Send (nonce 2) - absorbs note_stack then sends');
    console.log('');
    
    // === STEP 1: Run Entry Circuit ===
    console.log('STEP 1: Running Entry Circuit (nonce 0)...');
    console.log('');
    
    const userKey = hexToDecimal("0x1234567890abcdef");
    const tokenAddress = hexToDecimal("0x02");
    const chainId = hexToDecimal("0x01");
    const { signer_pubkey_hash, signer_public_key } = await getSignerKeyPair();
    
    const entryInput = {
        user_key: userKey,
        signer_pubkey_hash,
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
        signer_pubkey_hash,
        token_address: tokenAddress,
        amount: depositAmount,
        chain_id: chainId,
        previous_nonce: "0",
        previous_shares: "0", // Entry starts with 0 shares (now using 0 directly)
        nullifier: "0", // Entry uses nullifier 0
        previous_unlocks_at: "0", // Entry initializes to 0
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
    // The circuit computes sender_private_key from Poseidon2Hash2(user_key, nonce) truncated to 253 bits
    const sendNonce = 2; // Send uses nonce 2 (previous_nonce was 1)
    const senderPrivHash = await poseidon2Hash2(userKey, sendNonce.toString());
    // Truncate to 253 bits (same as circuit: Bits2Num(253) after Num2Bits(254))
    const TWO_TO_253 = BigInt('2') ** BigInt('253');
    const senderPrivateKey = (BigInt(senderPrivHash) % TWO_TO_253).toString();
    const myPublicKey = await calculatePublicKey(senderPrivateKey);
    
    console.log(`Your public key at nonce 2 (for send):`);
    console.log(`  [${decimalToHex(myPublicKey[0])}, ${decimalToHex(myPublicKey[1])}]`);
    console.log('');
    
    // === STEP 6: Run Send Circuit (send to yourself) ===
    console.log('STEP 6: Running Send Circuit (send to yourself, nonce 1)...');
    console.log('');
    
    const sendAmount = hexToDecimal("0x32"); // 50
    const relayerFeeAmountSend = "1";
    const previousShares = BigInt(depositAmount).toString(); // Shares after deposit = 100 (no encoding)
    const currentNonceForSend = "2"; // previous_nonce is 1, sign with current_nonce = previous + 1
    const { signature: sendSignature } = await signSendMessage(TEST_SIGNER_PRIVKEY_HEX, tokenAddress, chainId, sendAmount, relayerFeeAmountSend, myPublicKey[0], myPublicKey[1], currentNonceForSend);
    const sendInput = {
        user_key: userKey,
        signer_pubkey_hash,
        signer_public_key,
        signature: sendSignature,
        token_address: tokenAddress,
        amount: sendAmount,
        chain_id: chainId,
        previous_nonce: "1", // Deposit used nonce 0, so send uses nonce 1
        previous_shares: previousShares, // Actual shares 100 (no encoding)
        nullifier: depositInput.nullifier, // Must match what deposit used: "0"
        previous_unlocks_at: depositInput.previous_unlocks_at, // Must match what deposit used: "0"
        previous_commitment_leaf: depositLeaf,
        commitment_index: "1", // Deposit is at index 1
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterDeposit,
        merkle_proof: await generateMerkleProof(depositLeaf, 1, treeDepth, allLeaves, treeSize, hashWrapper),
        receiver_public_key: myPublicKey, // Send to yourself
        relayer_fee_amount: relayerFeeAmountSend
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
    // For note_stack_r, we need the shared_key_hash from the send
    // The shared_key_hash is computed in send circuit, but we can reconstruct it
    // shared_key = sender_private_key * receiver_public_key (point multiplication)
    // shared_key_hash = Poseidon2Hash2(shared_key.x, shared_key.y)
    
    // Calculate shared key: DH outputs shared_key = x-coordinate of (sender_private * receiver_public)
    // Then send circuit does shared_key_hash = Poseidon2Hash1(shared_key), note_commit.r = shared_key_hash
    const sharedKeyPoint = await scalarMul(senderPrivateKey, myPublicKey);
    const sharedKey = sharedKeyPoint.x.toString(); // DH circuit outputs out[0] (x only)
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
    
    // === STEP 7: Run Absorb-Send Circuit (nonce 2) ===
    console.log('STEP 7: Running Absorb-Send Circuit (nonce 2)...');
    console.log('');
    
    // After send, the balance is: previous_shares (100) - amount (50) - fee (1) = 49
    // The send circuit stores the commitment with m1 = new_shares = 49 (no encoding)
    // The absorb circuit reconstructs with m1 = current_balance
    // To match, we need current_balance = 49 (the actual shares after send)
    const finalSharesAfterSend = (BigInt(previousShares) - BigInt(sendAmount) - BigInt(relayerFeeAmountSend)).toString(); // 100 - 50 - 1 = 49
    const current_balance = finalSharesAfterSend; // 49 (actual shares after send, no encoding)
    const nullifier_after_send = "0"; // Nullifier stays 0 after send
    
    // Calculate previous_nonce_commitment for absorb (debug) — nonceCommitment uses view_key
    // The send used nonce 1, so previous_nonce should be 1
    const view_key = await getViewKeyFromUserKey(userKey);
    const previous_nonce_commitment_1 = await getNonceCommitmentFromViewKey(view_key, "1", tokenAddress);
    
    const absorbSendAmount = hexToDecimal("0x1e"); // 30
    const relayerFee = "1"; // Single fee for absorb+send
    
    // Calculate your public key at nonce 3 for the absorb-send
    // The circuit will compute nonce = previous_nonce + 1 = 2 + 1 = 3
    const nonce3 = 3;
    const senderPrivHash3 = await poseidon2Hash2(userKey, nonce3.toString());
    const senderPrivateKey3 = (BigInt(senderPrivHash3) % TWO_TO_253).toString();
    const myPublicKey3 = await calculatePublicKey(senderPrivateKey3);
    
    // Sign SEND message for absorb_send: Poseidon2(Poseidon3(ta, ch, amount), Poseidon3(fee, receiver_pubkey_hash, nonce))
    const currentNonceForAbsorbSend = "3"; // previous_nonce is 2, current_nonce = previous + 1
    const { signature: absorbSendSignature } = await signSendMessage(TEST_SIGNER_PRIVKEY_HEX, tokenAddress, chainId, absorbSendAmount, relayerFee, myPublicKey3[0], myPublicKey3[1], currentNonceForAbsorbSend);
    
    const absorbSendInput = {
        user_key: userKey,
        signer_pubkey_hash,
        signer_public_key,
        signature: absorbSendSignature,
        amount: absorbSendAmount,
        previous_nonce: "2", // Send created new commitment with nonce 2, so this is the previous nonce
        current_balance: current_balance,
        nullifier: nullifier_after_send,
        previous_unlocks_at: "0", // Must be 0
        previous_commitment_leaf: send_new_commitment_leaf,
        commitment_index: "2", // Send commitment is at index 2
        tree_depth: treeDepth.toString(),
        merkle_proof: await generateMerkleProof(send_new_commitment_leaf, 2, treeDepth, allLeaves, treeSize, hashWrapper),
        note_stack_m: note_stack_m,
        note_stack_r: note_stack_r,
        note_stack_commitment_index: "3", // Note stack is at index 3
        note_stack_merkle_proof: await generateMerkleProof(note_stack_leaf, 3, treeDepth, allLeaves, treeSize, hashWrapper),
        token_address: tokenAddress,
        chain_id: chainId,
        expected_root: rootAfterSend,
        note_stack_x: note_stack_x,
        note_stack_y: note_stack_y,
        receiver_public_key: myPublicKey3, // Send to yourself again
        relayer_fee_amount: relayerFee
    };
    
    console.log('Absorb-Send inputs:');
    console.log(`  previous_nonce: ${absorbSendInput.previous_nonce}`);
    console.log(`  current_balance: ${absorbSendInput.current_balance} (should be 49 - actual shares after send)`);
    console.log(`  nullifier: ${absorbSendInput.nullifier} (should be 0)`);
    console.log(`  previous_unlocks_at: ${absorbSendInput.previous_unlocks_at} (should be 0)`);
    console.log(`  previous_commitment_leaf: ${decimalToHex(absorbSendInput.previous_commitment_leaf)}`);
    console.log(`  note_stack_m: ${decimalToHex(absorbSendInput.note_stack_m)}`);
    console.log(`  amount: ${decimalToHex(absorbSendInput.amount)}`);
    console.log(`  receiver_public_key: [${decimalToHex(absorbSendInput.receiver_public_key[0])}, ${decimalToHex(absorbSendInput.receiver_public_key[1])}]`);
    console.log('');
    console.log('Debug: Send operation details:');
    console.log(`  Send final_shares (encoded): ${finalSharesAfterSend}`);
    console.log(`  Send new_nonce_commitment: ${decimalToHex(send_new_nonce_commitment)}`);
    console.log(`  Send new_commitment_leaf: ${decimalToHex(send_new_commitment_leaf)}`);
    console.log(`  Computed previous_nonce_commitment (from nonce 1): ${decimalToHex(previous_nonce_commitment_1)}`);
    console.log('');
    
    try {
        const absorbSendWitness = await runCircuit('absorb_send', absorbSendInput);
        
        // Extract outputs: new_commitment_leaf, new_nonce_commitment, encrypted_note[3], sender_pub_key[2], nonce_discovery_entry[2], note_commitment[2]
        const new_commitment_leaf = absorbSendWitness[1].toString();
        const new_nonce_commitment = absorbSendWitness[2].toString();
        const note_commitment_x_out = absorbSendWitness[10].toString();
        const note_commitment_y_out = absorbSendWitness[11].toString();
        
        console.log('✅ Absorb-Send circuit test passed!');
        console.log('');
        console.log('Absorb-Send outputs:');
        console.log(`  new_commitment_leaf: ${decimalToHex(new_commitment_leaf)}`);
        console.log(`  new_nonce_commitment: ${decimalToHex(new_nonce_commitment)}`);
        console.log(`  note_commitment: [${decimalToHex(note_commitment_x_out)}, ${decimalToHex(note_commitment_y_out)}]`);
        console.log('');
        
        return {
            success: true,
            new_commitment_leaf,
            new_nonce_commitment
        };
    } catch (err) {
        console.error('❌ Absorb-Send circuit failed:', err.message);
        throw err;
    }
}

// Run the test
testAbsorbSendFlow().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});

