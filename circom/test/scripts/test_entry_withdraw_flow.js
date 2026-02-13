#!/usr/bin/env node

/**
 * Test Entry → Deposit → Withdraw Flow
 * Simulates the full flow: entry → deposit → withdraw
 * Uses Circom's Baby Jubjub generators (embedded in Fr)
 * 
 * This matches the Noir test structure for withdraw
 */

const fs = require('fs');
const path = require('path');
const { poseidon2Hash2, poseidon2Hash3 } = require('./poseidon2_hash_helper');
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

async function testEntryDepositWithdrawFlow() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Entry → Deposit → Withdraw Flow (Circom Baby Jubjub)');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('This test simulates: entry → deposit → withdraw');
    console.log('All using Circom\'s Baby Jubjub generators.');
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
    
    const treeResult1 = await simulateLeanIMTInsert(entryLeaf, treeSize, treeDepth, sideNodes, hashWrapper);
    const rootAfterEntry = treeResult1.root;
    treeDepth = treeResult1.depth;
    sideNodes = treeResult1.sideNodes;
    treeSize = 1;
    
    console.log(`Tree after entry:`);
    console.log(`  Root: ${decimalToHex(rootAfterEntry)}`);
    console.log(`  Depth: ${treeDepth}`);
    console.log(`  Size: ${treeSize}`);
    console.log('');
    
    // === STEP 4: Run Deposit Circuit ===
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
    
    // === STEP 5: Simulate contract's share addition and insert into tree ===
    console.log('STEP 5: Simulating contract share addition and inserting into tree...');
    console.log('');
    
    // IMPORTANT: The contract adds shares*G to the circuit commitment point before hashing
    // So the actual leaf in the tree is: hash(circuit_point + shares*G)
    // We need to simulate this to get the correct leaf
    
    const circuitCommitmentPoint = {
        x: deposit_commitment_x,
        y: deposit_commitment_y
    };
    
    // For deposit, shares = deposit_amount (simplified - in reality it's converted via vault)
    const shares = depositAmount; // 50
    
    console.log(`Simulating contract operation:`);
    console.log(`  Circuit commitment: [${decimalToHex(circuitCommitmentPoint.x)}, ${decimalToHex(circuitCommitmentPoint.y)}]`);
    console.log(`  Adding shares*G where shares = ${shares}`);
    console.log('');
    
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
    
    // === STEP 6: Run Withdraw Circuit ===
    console.log('STEP 6: Running Withdraw Circuit...');
    console.log('');
    
    // IMPORTANT: To reconstruct the deposit commitment, we need the EXACT same values
    // that were used when creating it. The deposit circuit used:
    // - previous_nonce: 0 (from entry)
    // - previous_shares: 0 (from entry) - but the contract adds shares*G after
    // - nullifier: 0 (from entry)
    // - previous_unlocks_at: 0 (from entry)
    // And created a new commitment with new_nonce_commitment (which uses nonce 1)
    // 
    // NOTE: The deposit circuit outputs a commitment with m1=previous_shares (0),
    // but the contract then adds shares*G to the commitment point before hashing to get the leaf.
    // For testing, we need to account for this. The actual shares after deposit would be
    // previous_shares + deposit_amount, but the circuit commitment uses previous_shares.
    // 
    // However, to reconstruct the leaf that was actually inserted into the tree,
    // we need to know what the contract did. For simplicity in testing, we'll assume
    // the shares value matches what makes sense: after a deposit of 50, we'd have 50 shares.
    // But the commitment reconstruction still uses the circuit's m1 value (0).
    //
    // Actually, wait - the leaf is the hash of the commitment point AFTER the contract
    // adds shares*G. So we can't easily reconstruct it without the contract logic.
    // For now, let's use previous_shares = deposit_amount to make the withdraw check pass,
    // but note that this is a simplification.
    
    // IMPORTANT: We can only withdraw up to the actual shares we have
    // previous_shares = 51 (encoded) represents 50 real shares
    // So we can withdraw at most 50 total (amount + relayer_fee_amount)
    // Let's withdraw 49 + 1 = 50 total
    const withdrawAmount = hexToDecimal("0x31"); // 49 (so total_withdraw = 49 + 1 = 50)
    
    // IMPORTANT: Understanding the deposit → withdraw flow:
    //
    // 1. Deposit circuit creates commitment with:
    //    - m1 = previous_shares (0 from entry)
    //    - Circuit outputs: commitment_point = 0*G + 0*H + spending_key*D + 0*K + new_nonce_commitment*J
    //
    // 2. Contract then:
    //    - Adds shares*G to commitment_point: final_point = commitment_point + shares*G
    //    - Hashes final_point to get leaf: leaf = Poseidon2Hash2(final_point)
    //    - Actual shares after deposit = previous_shares + deposit_amount = 0 + 50 = 50
    //
    // 3. Withdraw circuit needs to:
    //    - Reconstruct the deposit commitment using m1=0 (what deposit circuit used)
    //    - This gives: reconstructed_point = 0*G + 0*H + spending_key*D + 0*K + new_nonce_commitment*J
    //    - Hash: reconstructed_leaf = Poseidon2Hash2(reconstructed_point)
    //    - But the actual leaf in tree is: hash(reconstructed_point + shares*G)
    //
    // PROBLEM: The withdraw circuit reconstructs using m1=0, but the tree leaf includes shares*G.
    // The circuit can't know about the contract's share addition!
    //
    // SOLUTION: The withdraw circuit must reconstruct using m1=shares (the actual shares value),
    // not m1=0. This way: reconstructed_point = shares*G + ... = (0*G + shares*G) + ... = final_point
    //
    // So we use previous_shares = actual shares after deposit (50)
    
    // For withdraw, entry used m1=1 (base value), contract added shares*G
    // So final commitment has m1 = 1 + shares = 1 + 50 = 51
    const previousShares = (BigInt(1) + BigInt(depositAmount)).toString(); // Base 1 + shares 50 = 51
    const withdrawInput = {
        user_key: entryInput.user_key,
        token_address: entryInput.token_address,
        amount: withdrawAmount,
        chain_id: entryInput.chain_id,
        previous_nonce: "1", // Deposit created commitment with nonce_commitment using nonce 1
        previous_shares: previousShares, // Actual shares 50 → pass 51 to circuit
        nullifier: depositInput.nullifier, // Must match what deposit used: "1" (represents 0)
        previous_unlocks_at: depositInput.previous_unlocks_at, // Must match what deposit used: "1" (represents 0)
        declared_time_reference: "1000000", // Current time reference
        previous_commitment_leaf: depositLeaf,
        commitment_index: "1",
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterDeposit,
        merkle_proof: await generateMerkleProof(depositLeaf, 1, treeDepth, allLeaves, treeSize, hashWrapper),
        arbitrary_calldata_hash: hexToDecimal("0x1234567890abcdef"),
        receiver_address: hexToDecimal("0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6"),
        relayer_fee_amount: "1"
    };
    
    // Verify we can reconstruct the deposit leaf
    console.log('Verifying deposit leaf reconstruction...');
    console.log(`  Using previous_nonce: ${withdrawInput.previous_nonce}`);
    console.log(`  Using previous_shares: ${withdrawInput.previous_shares}`);
    console.log(`  Using nullifier: ${withdrawInput.nullifier}`);
    console.log(`  Using previous_unlocks_at: ${withdrawInput.previous_unlocks_at}`);
    console.log(`  Expected leaf: ${decimalToHex(depositLeaf)}`);
    console.log('');
    
    // Debug: Try to manually reconstruct to see what we get
    try {
        // Compute spending_key = Poseidon2Hash3(user_key, chain_id, token_address)
        const spending_key = await poseidon2Hash3(
            withdrawInput.user_key,
            withdrawInput.chain_id,
            withdrawInput.token_address
        );
        
        // Compute previous_nonce_commitment = Poseidon2Hash3(spending_key, previous_nonce, token_address)
        const previous_nonce_commitment = await poseidon2Hash3(
            spending_key,
            withdrawInput.previous_nonce,
            withdrawInput.token_address
        );
        
        console.log('Debug reconstruction values:');
        console.log(`  spending_key: ${decimalToHex(spending_key)}`);
        console.log(`  previous_nonce_commitment: ${decimalToHex(previous_nonce_commitment)}`);
        console.log(`  deposit's new_nonce_commitment: ${decimalToHex(deposit_nonce_commitment)}`);
        console.log(`  Match: ${previous_nonce_commitment === deposit_nonce_commitment ? '✅ YES' : '❌ NO'}`);
        console.log('');
        
        // Try to reconstruct the commitment using PedersenCommitment5 test circuit
        try {
            const testDir = path.join(__dirname, '../../test/circuits');
            const testCircuitPath = path.join(testDir, 'pedersen_commitment5_test.circom');
            const testJsPath = path.join(testDir, 'pedersen_commitment5_test_js');
            const wasmPath = path.join(testJsPath, 'pedersen_commitment5_test.wasm');
            
            if (!fs.existsSync(wasmPath)) {
                // Compile it
                const { execSync } = require('child_process');
                execSync(`cd ${testDir} && circom pedersen_commitment5_test.circom --r1cs --wasm --sym --c --O2 -o . 2>&1`, {
                    stdio: 'inherit',
                    cwd: testDir
                });
            }
            
            const witnessCalculator = require(path.join(testJsPath, 'witness_calculator.js'));
            const buffer = fs.readFileSync(wasmPath);
            const wtnsCalculator = await witnessCalculator(buffer);
            
            const reconInput = {
                m1: withdrawInput.previous_shares, // 50
                m2: withdrawInput.nullifier, // 0
                m3: spending_key,
                m4: withdrawInput.previous_unlocks_at, // 0
                r: previous_nonce_commitment
            };
            
            const reconWitness = await wtnsCalculator.calculateWitness(reconInput, 0);
            const reconCommitmentX = reconWitness[1].toString();
            const reconCommitmentY = reconWitness[2].toString();
            const reconLeaf = reconWitness[3].toString();
            
            console.log('Reconstruction test:');
            const depositFinalPoint = global.depositContractResult ? global.depositContractResult.finalPoint : null;
            console.log(`  Reconstructed commitment: [${decimalToHex(reconCommitmentX)}, ${decimalToHex(reconCommitmentY)}]`);
            if (depositFinalPoint) {
                console.log(`  Deposit final commitment: [${decimalToHex(depositFinalPoint.x)}, ${decimalToHex(depositFinalPoint.y)}]`);
                console.log(`  Commitment point match: ${reconCommitmentX === depositFinalPoint.x && reconCommitmentY === depositFinalPoint.y ? '✅ YES' : '❌ NO'}`);
            }
            console.log(`  Reconstructed leaf: ${decimalToHex(reconLeaf)}`);
            console.log(`  Expected leaf: ${decimalToHex(depositLeaf)}`);
            console.log(`  Leaf match: ${reconLeaf === depositLeaf ? '✅ YES' : '❌ NO'}`);
            console.log('');
        } catch (err) {
            console.log(`  Could not test reconstruction: ${err.message}`);
            console.log('');
        }
    } catch (err) {
        console.log(`  Could not compute debug values: ${err.message}`);
        console.log('');
    }
    
    console.log('Withdraw inputs:');
    console.log(`  previous_nonce: ${withdrawInput.previous_nonce}`);
    console.log(`  previous_shares: ${withdrawInput.previous_shares}`);
    console.log(`  amount: ${decimalToHex(withdrawInput.amount)}`);
    console.log(`  previous_commitment_leaf: ${decimalToHex(withdrawInput.previous_commitment_leaf)}`);
    console.log(`  expected_root: ${decimalToHex(withdrawInput.expected_root)}`);
    console.log('');
    
    try {
        const withdrawWitness = await runCircuit('withdraw', withdrawInput);
        
        // Extract outputs: commitment[2], new_nonce_commitment, encrypted_state_details[2], nonce_discovery_entry[2]
        const commitment_x = withdrawWitness[1].toString();
        const commitment_y = withdrawWitness[2].toString();
        const new_nonce_commitment = withdrawWitness[3].toString();
        const encrypted_balance = withdrawWitness[4].toString();
        const encrypted_nullifier = withdrawWitness[5].toString();
        const nonce_discovery_entry_x = withdrawWitness[6].toString();
        const nonce_discovery_entry_y = withdrawWitness[7].toString();
        
        console.log('✅ Withdraw circuit test passed!');
        console.log('');
        console.log('Withdraw outputs:');
        console.log(`  commitment: [${decimalToHex(commitment_x)}, ${decimalToHex(commitment_y)}]`);
        console.log(`  new_nonce_commitment: ${decimalToHex(new_nonce_commitment)}`);
        console.log(`  encrypted_state_details: [${decimalToHex(encrypted_balance)}, ${decimalToHex(encrypted_nullifier)}]`);
        console.log(`  nonce_discovery_entry: [${decimalToHex(nonce_discovery_entry_x)}, ${decimalToHex(nonce_discovery_entry_y)}]`);
        console.log('');
        
        // Hash new commitment to get new leaf
        const newLeaf = await poseidon2Hash2(commitment_x, commitment_y);
        console.log(`New commitment leaf: ${decimalToHex(newLeaf)}`);
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
            withdraw: {
                inputs: withdrawInput,
                outputs: {
                    commitment: [commitment_x, commitment_y],
                    new_nonce_commitment,
                    encrypted_state_details: [encrypted_balance, encrypted_nullifier],
                    nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y],
                    leaf: newLeaf
                }
            },
            tree: {
                root_after_entry: rootAfterEntry,
                root_after_deposit: rootAfterDeposit,
                depth: treeDepth,
                size: treeSize
            }
        };
        
        const testDataPath = path.join(__dirname, '../../test/inputs/entry_deposit_withdraw_flow_output.json');
        fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
        console.log(`✅ Test data saved to: ${testDataPath}`);
        console.log('');
        
        return testData;
    } catch (err) {
        console.error('❌ Withdraw circuit failed:', err.message);
        throw err;
    }
}

// Run the test
testEntryDepositWithdrawFlow().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});

