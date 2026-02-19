#!/usr/bin/env node

/**
 * Test FROST 3-of-5 → Entry → Deposit → Withdraw Flow
 *
 * 1. Run FROST key generation (3/5) + group identity agreement (user_key from identity secret, not pubkey).
 * 2. Derive Baby Jubjub signer identity from the FROST group public key (signer_pubkey_hash for circuits).
 * 3. Run entry with user_key from group identity secret and signer_pubkey_hash.
 * 4. Run deposit, then withdraw.
 * 5. Withdraw is signed with the key derived from the FROST group key so the circuit's EdDSAPoseidonVerifier passes.
 *
 * user_key is derived from a separate group identity secret so that exposing a signature (e.g. in a proposal)
 * does not reveal user_key / view / spending.
 */

const fs = require('fs');
const path = require('path');
const { poseidon2Hash2, poseidon2Hash3, getSpendingKeyFromHashes } = require('./poseidon_hash_helper');
const { getFrostSignerIdentityWithGroupIdentity, signWithdrawMessageFrost, FROST_THRESHOLD, FROST_MAX_SIGNERS } = require('../../lib/frost/frost_helper');
const { simulateLeanIMTInsert, generateMerkleProof } = require('./lean_imt_helpers');
const { simulateContractShareAddition } = require('./babyjub_operations');

function hexToDecimal(hexStr) {
    if (typeof hexStr === 'string' && hexStr.startsWith('0x')) {
        return BigInt(hexStr).toString();
    }
    return hexStr.toString();
}

function decimalToHex(decimalStr) {
    return '0x' + BigInt(decimalStr).toString(16);
}

async function runCircuit(circuitName, input) {
    const buildDir = path.join(__dirname, `../../build/${circuitName}/${circuitName}_js`);
    const wasmPath = path.join(buildDir, `${circuitName}.wasm`);
    const witnessCalcPath = path.join(buildDir, 'witness_calculator.js');

    if (!fs.existsSync(wasmPath)) {
        throw new Error(`Circuit not compiled: ${circuitName}\nWASM path: ${wasmPath}\nRun: npm run compile:${circuitName}`);
    }

    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);
    const witness = await wtnsCalculator.calculateWitness(input, 0);
    return witness;
}

async function hashWrapper(a, b) {
    return await poseidon2Hash2(a, b);
}

async function testFrostEntryDepositWithdrawFlow() {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('   TEST: FROST 3/5 → Entry → Deposit → Withdraw Flow');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');

    // === STEP 0: FROST 3-of-5 key generation + group identity agreement ===
    console.log('STEP 0: FROST key generation + group identity (threshold ' + FROST_THRESHOLD + '/' + FROST_MAX_SIGNERS + ')...');
    console.log('');

    const frost = await getFrostSignerIdentityWithGroupIdentity();
    const { groupPublicKey, keyPackages, signer_pubkey_hash, signer_public_key, derivedPrivKeyHex, user_key: frostUserKey } = frost;

    const groupKeyHex = Buffer.from(groupPublicKey.point || groupPublicKey).toString('hex');
    console.log('  FROST group public key (Ed25519, 32 bytes):');
    console.log('  ' + groupKeyHex.slice(0, 32) + '...');
    console.log('  Key packages: ' + keyPackages.length + ' (use any ' + FROST_THRESHOLD + ' to threshold-sign Ed25519)');
    console.log('  Derived Baby Jubjub signer_pubkey_hash (for circuits): ' + decimalToHex(signer_pubkey_hash));
    console.log('  user_key (from group identity secret): ' + decimalToHex(frostUserKey));
    console.log('');

    // === STEP 1: Run Entry Circuit ===
    console.log('STEP 1: Running Entry Circuit (user_key from group identity, signer_pubkey_hash from group pubkey)...');
    console.log('');

    const entryInput = {
        user_key: frostUserKey,
        signer_pubkey_hash,
        token_address: hexToDecimal('0x7775e4b6f4d40be537b55b6c47e09ada0157bd'),
        chain_id: hexToDecimal('0x01')
    };

    console.log('Entry inputs:');
    console.log('  user_key: ' + decimalToHex(entryInput.user_key));
    console.log('  token_address: ' + decimalToHex(entryInput.token_address));
    console.log('  chain_id: ' + decimalToHex(entryInput.chain_id));
    console.log('');

    const entryWitness = await runCircuit('entry', entryInput);
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const nonce_commitment = entryWitness[3].toString();

    console.log('Entry outputs:');
    console.log('  balance_commitment: [' + decimalToHex(balance_commitment_x) + ', ' + decimalToHex(balance_commitment_y) + ']');
    console.log('  nonce_commitment: ' + decimalToHex(nonce_commitment));
    console.log('');

    // === STEP 2: Hash commitment → leaf ===
    console.log('STEP 2: Hashing entry commitment point to get leaf...');
    const entryLeaf = await poseidon2Hash2(balance_commitment_x, balance_commitment_y);
    console.log('Entry commitment leaf: ' + decimalToHex(entryLeaf));
    console.log('');

    // === STEP 3: Build Merkle tree with entry ===
    console.log('STEP 3: Building Merkle Tree with Entry...');
    let treeSize = 0;
    let treeDepth = 1;
    let sideNodes = new Array(32).fill('0');
    const allLeaves = [entryLeaf];

    const treeResult1 = await simulateLeanIMTInsert(entryLeaf, treeSize, treeDepth, sideNodes, hashWrapper);
    const rootAfterEntry = treeResult1.root;
    treeDepth = treeResult1.depth;
    sideNodes = treeResult1.sideNodes;
    treeSize = 1;

    console.log('Tree after entry: Root ' + decimalToHex(rootAfterEntry) + ', depth ' + treeDepth + ', size ' + treeSize);
    console.log('');

    // === STEP 4: Run Deposit Circuit ===
    console.log('STEP 4: Running Deposit Circuit...');
    const depositAmount = hexToDecimal('0x32'); // 50
    const depositInput = {
        user_key: entryInput.user_key,
        signer_pubkey_hash,
        token_address: entryInput.token_address,
        amount: depositAmount,
        chain_id: entryInput.chain_id,
        previous_nonce: '0',
        previous_shares: '0',
        nullifier: '0',
        previous_unlocks_at: '0',
        previous_commitment_leaf: entryLeaf,
        commitment_index: '0',
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterEntry,
        merkle_proof: await generateMerkleProof(entryLeaf, 0, treeDepth, allLeaves, treeSize, hashWrapper)
    };

    const depositWitness = await runCircuit('deposit', depositInput);
    const deposit_commitment_x = depositWitness[1].toString();
    const deposit_commitment_y = depositWitness[2].toString();
    const deposit_nonce_commitment = depositWitness[7].toString();

    console.log('Deposit outputs: commitment [' + decimalToHex(deposit_commitment_x) + ', ' + decimalToHex(deposit_commitment_y) + '], new_nonce_commitment ' + decimalToHex(deposit_nonce_commitment));
    console.log('');

    // === STEP 5: Contract share addition + insert into tree ===
    console.log('STEP 5: Simulating contract share addition and inserting into tree...');
    const circuitCommitmentPoint = { x: deposit_commitment_x, y: deposit_commitment_y };
    const shares = depositAmount;
    const contractResult = await simulateContractShareAddition(circuitCommitmentPoint, shares, poseidon2Hash2);
    const depositLeaf = contractResult.leaf;
    allLeaves.push(depositLeaf);

    const treeResult2 = await simulateLeanIMTInsert(depositLeaf, treeSize, treeDepth, sideNodes, hashWrapper);
    const rootAfterDeposit = treeResult2.root;
    treeDepth = treeResult2.depth;
    sideNodes = treeResult2.sideNodes;
    treeSize = 2;

    console.log('Tree after deposit: Root ' + decimalToHex(rootAfterDeposit) + ', depth ' + treeDepth + ', size ' + treeSize);
    console.log('');

    // === STEP 6: Run Withdraw Circuit (signed with FROST-derived key) ===
    console.log('STEP 6: Running Withdraw Circuit (signature from FROST-derived Baby Jubjub key)...');
    const withdrawAmount = hexToDecimal('0x31'); // 49
    const previousShares = BigInt(depositAmount).toString(); // Shares after deposit (no encoding)
    const relayerFeeAmount = '1';

    const currentNonceForWithdraw = '2'; // previous_nonce is 1, sign with current_nonce = previous + 1
    // Sign with FROST-derived Baby Jubjub key (same message format as eddsa_helper.signWithdrawMessage)
    const { signature } = await signWithdrawMessageFrost(
        derivedPrivKeyHex,
        entryInput.token_address,
        entryInput.chain_id,
        withdrawAmount,
        relayerFeeAmount,
        currentNonceForWithdraw
    );

    const withdrawInput = {
        user_key: entryInput.user_key,
        signer_pubkey_hash,
        signer_public_key,
        signature,
        token_address: entryInput.token_address,
        amount: withdrawAmount,
        chain_id: entryInput.chain_id,
        previous_nonce: '1',
        previous_shares: previousShares,
        nullifier: depositInput.nullifier,
        previous_unlocks_at: depositInput.previous_unlocks_at,
        declared_time_reference: '1000000',
        previous_commitment_leaf: depositLeaf,
        commitment_index: '1',
        tree_depth: treeDepth.toString(),
        expected_root: rootAfterDeposit,
        merkle_proof: await generateMerkleProof(depositLeaf, 1, treeDepth, allLeaves, treeSize, hashWrapper),
        arbitrary_calldata_hash: hexToDecimal('0x1234567890abcdef'),
        receiver_address: hexToDecimal('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6'),
        relayer_fee_amount: relayerFeeAmount
    };

    const withdrawWitness = await runCircuit('withdraw', withdrawInput);
    const commitment_x = withdrawWitness[1].toString();
    const commitment_y = withdrawWitness[2].toString();
    const new_nonce_commitment = withdrawWitness[3].toString();
    const encrypted_balance = withdrawWitness[4].toString();
    const encrypted_nullifier = withdrawWitness[5].toString();
    const nonce_discovery_entry_x = withdrawWitness[6].toString();
    const nonce_discovery_entry_y = withdrawWitness[7].toString();

    console.log('Withdraw outputs:');
    console.log('  commitment: [' + decimalToHex(commitment_x) + ', ' + decimalToHex(commitment_y) + ']');
    console.log('  new_nonce_commitment: ' + decimalToHex(new_nonce_commitment));
    console.log('  encrypted_state_details: [' + decimalToHex(encrypted_balance) + ', ' + decimalToHex(encrypted_nullifier) + ']');
    console.log('  nonce_discovery_entry: [' + decimalToHex(nonce_discovery_entry_x) + ', ' + decimalToHex(nonce_discovery_entry_y) + ']');
    console.log('');

    const newLeaf = await poseidon2Hash2(commitment_x, commitment_y);
    console.log('New commitment leaf: ' + decimalToHex(newLeaf));
    console.log('');

    const testData = {
        frost: {
            threshold: FROST_THRESHOLD,
            maxSigners: FROST_MAX_SIGNERS,
            group_public_key_hex: groupKeyHex,
            signer_pubkey_hash,
            signer_public_key,
            user_key_from_identity: frostUserKey
        },
        entry: {
            inputs: entryInput,
            outputs: { balance_commitment: [balance_commitment_x, balance_commitment_y], nonce_commitment, leaf: entryLeaf }
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
        tree: { root_after_entry: rootAfterEntry, root_after_deposit: rootAfterDeposit, depth: treeDepth, size: treeSize }
    };

    const testDataPath = path.join(__dirname, '../inputs/frost_entry_withdraw_flow_output.json');
    fs.mkdirSync(path.dirname(testDataPath), { recursive: true });
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    console.log('Test data saved to: ' + testDataPath);
    console.log('');
    console.log('FROST 3/5 -> Entry -> Deposit -> Withdraw flow test passed.');
    return testData;
}

testFrostEntryDepositWithdrawFlow().catch(err => {
    console.error('Test failed:', err.message);
    process.exit(1);
});
