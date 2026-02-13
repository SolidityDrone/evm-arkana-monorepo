#!/usr/bin/env node

/**
 * Generate Proofs for All Circuits
 * 
 * This script:
 * 1. Uses flow test logic to generate valid inputs for each circuit
 * 2. Generates proofs for all circuits (entry, deposit, withdraw, send, absorb_send, absorb_withdraw)
 * 3. Verifies all proofs
 * 4. Outputs a JSON file with all inputs, proofs, and public signals
 *    that can be used to test Solidity verifiers
 * 
 * Usage: node test/scripts/generate_all_proofs.js [output.json]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import helpers from flow tests
const { poseidon2Hash1, poseidon2Hash2, poseidon2Hash3 } = require('./poseidon2_hash_helper');
const { simulateLeanIMTInsert, generateMerkleProof } = require('./lean_imt_helpers');
const { simulateContractShareAddition, scalarMul } = require('./babyjub_operations');

// All circuits to process
const CIRCUITS = [
    'entry',
    'deposit',
    'withdraw',
    'send',
    'absorb_send',
    'absorb_withdraw'
];

// Helper to convert hex to decimal string
function hexToDecimal(hexStr) {
    if (typeof hexStr === 'string' && hexStr.startsWith('0x')) {
        return BigInt(hexStr).toString();
    }
    return hexStr.toString();
}

// Helper to convert decimal to hex (with padding for Solidity)
function decimalToHex(decimalStr) {
    const bigInt = BigInt(decimalStr);
    return '0x' + bigInt.toString(16).padStart(64, '0');
}

// Map public signals to their names for each circuit
// Note: In Groth16 with snarkjs, the public signals array from snarkjs only includes OUTPUTS
// But Solidity contracts expect BOTH public inputs AND outputs
// So we prepend inputs and label the full array
const PUBLIC_SIGNAL_NAMES = {
    entry: [
        // Public inputs (2)
        'token_address',
        'chain_id',
        // Public outputs (5)
        'balance_commitment_x',
        'balance_commitment_y',
        'nonce_commitment',
        'nonce_discovery_entry_x',
        'nonce_discovery_entry_y'
    ],
    deposit: [
        // Public inputs (4)
        'token_address',
        'amount',
        'chain_id',
        'expected_root',
        // Public outputs (7)
        'commitment_x',
        'commitment_y',
        'encrypted_state_details_balance',
        'encrypted_state_details_nullifier',
        'nonce_discovery_entry_x',
        'nonce_discovery_entry_y',
        'new_nonce_commitment'
    ],
    withdraw: [
        // Public inputs (8)
        'token_address',
        'amount',
        'chain_id',
        'expected_root',
        'declared_time_reference',
        'arbitrary_calldata_hash',
        'receiver_address',
        'relayer_fee_amount',
        // Public outputs (7)
        'commitment_x',
        'commitment_y',
        'new_nonce_commitment',
        'encrypted_state_details_balance',
        'encrypted_state_details_nullifier',
        'nonce_discovery_entry_x',
        'nonce_discovery_entry_y'
    ],
    send: [
        // Public inputs (6)
        'token_address',
        'chain_id',
        'expected_root',
        'receiver_public_key_x',
        'receiver_public_key_y',
        'relayer_fee_amount',
        // Public outputs (11)
        'new_commitment_leaf',
        'new_nonce_commitment',
        'encrypted_note_receiver_amount',
        'encrypted_note_sender_balance',
        'encrypted_note_sender_nullifier',
        'sender_pub_key_x',
        'sender_pub_key_y',
        'nonce_discovery_entry_x',
        'nonce_discovery_entry_y',
        'note_commitment_x',
        'note_commitment_y'
    ],
    absorb_send: [
        // Public inputs (6)
        'token_address',
        'chain_id',
        'expected_root',
        'receiver_public_key_x',
        'receiver_public_key_y',
        'relayer_fee_amount',
        // Public outputs (11)
        'new_commitment_leaf',
        'new_nonce_commitment',
        'encrypted_note_receiver_amount',
        'encrypted_note_sender_balance',
        'encrypted_note_sender_nullifier',
        'sender_pub_key_x',
        'sender_pub_key_y',
        'nonce_discovery_entry_x',
        'nonce_discovery_entry_y',
        'note_commitment_x',
        'note_commitment_y'
    ],
    absorb_withdraw: [
        // Public inputs (8)
        'token_address',
        'amount',
        'chain_id',
        'expected_root',
        'declared_time_reference',
        'arbitrary_calldata_hash',
        'receiver_address',
        'relayer_fee_amount',
        // Public outputs (7)
        'commitment_x',
        'commitment_y',
        'new_nonce_commitment',
        'encrypted_state_details_balance',
        'encrypted_state_details_nullifier',
        'nonce_discovery_entry_x',
        'nonce_discovery_entry_y'
    ]
};

// Create labeled public signals object
function labelPublicSignals(circuitName, publicSignals) {
    const names = PUBLIC_SIGNAL_NAMES[circuitName];
    if (!names) {
        // Fallback: just number them
        return publicSignals.map((sig, idx) => ({
            index: idx,
            name: `signal_${idx}`,
            value: sig
        }));
    }

    // If we have more signals than names, pad with generic names
    const labeled = publicSignals.map((sig, idx) => ({
        index: idx,
        name: names[idx] || `signal_${idx}`,
        value: sig
    }));

    return labeled;
}

// Process input: convert hex strings to decimal for Circom
function processInput(input) {
    const processed = {};
    for (const [key, value] of Object.entries(input)) {
        if (Array.isArray(value)) {
            processed[key] = value.map(v => hexToDecimal(v));
        } else {
            processed[key] = hexToDecimal(value);
        }
    }
    return processed;
}

// Run a circuit and return witness (for getting outputs)
async function runCircuit(circuitName, input) {
    const buildDir = path.join(__dirname, `../../build/${circuitName}/${circuitName}_js`);
    const wasmPath = path.join(buildDir, `${circuitName}.wasm`);
    const witnessCalcPath = path.join(buildDir, `witness_calculator.js`);

    if (!fs.existsSync(wasmPath)) {
        throw new Error(`Circuit not compiled: ${circuitName}`);
    }

    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);

    const witness = await wtnsCalculator.calculateWitness(input, 0);
    return witness;
}

// Wrapper for poseidon2Hash2 to match async signature
async function hashWrapper(a, b) {
    return await poseidon2Hash2(a, b);
}

// Baby Jubjub BASE8 generator
const BASE8_X = "5299619240641551281634865583518297030282874472190772894086521144482721001553";
const BASE8_Y = "16950150798460657717958625567821834550301663161624707787222815936182638968203";

// Calculate public key from private key
async function calculatePublicKey(privateKey) {
    const pubKey = await scalarMul(privateKey.toString(), [BASE8_X, BASE8_Y]);
    return [pubKey.x, pubKey.y];
}

// Generate inputs for each circuit using flow test logic
async function getInputsFromFlow(circuitName, sharedState = {}) {
    // Common setup
    const userKey = hexToDecimal("0x1234567890abcdef");
    const tokenAddress = hexToDecimal("0x02");
    const chainId = hexToDecimal("0x01");

    // === ENTRY ===
    if (!sharedState.entry) {
        const entryInput = {
            user_key: userKey,
            token_address: tokenAddress,
            chain_id: chainId
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

        sharedState.entry = {
            input: entryInput,
            leaf: entryLeaf,
            treeSize,
            treeDepth,
            sideNodes,
            allLeaves,
            root: rootAfterEntry
        };
    }

    const { entry } = sharedState;
    const entryMerkleProof = await generateMerkleProof(entry.leaf, 0, entry.treeDepth, entry.allLeaves, entry.treeSize, hashWrapper);

    if (circuitName === 'entry') {
        return entry.input;
    }

    // === DEPOSIT ===
    if (!sharedState.deposit && (circuitName === 'deposit' || circuitName === 'withdraw' || circuitName === 'send' || circuitName.startsWith('absorb'))) {
        // For absorb flows, use 0x64 (100), for others use 0x32 (50)
        const depositAmount = circuitName.startsWith('absorb') ? hexToDecimal("0x64") : hexToDecimal("0x32");
        const depositInput = {
            user_key: userKey,
            token_address: tokenAddress,
            amount: depositAmount,
            chain_id: chainId,
            previous_nonce: "0",
            previous_shares: "1",
            nullifier: "1",
            previous_unlocks_at: "1",
            previous_commitment_leaf: entry.leaf,
            commitment_index: "0",
            tree_depth: entry.treeDepth.toString(),
            expected_root: entry.root,
            merkle_proof: entryMerkleProof
        };

        const depositWitness = await runCircuit('deposit', depositInput);
        const deposit_commitment_x = depositWitness[1].toString();
        const deposit_commitment_y = depositWitness[2].toString();

        const circuitCommitmentPoint = { x: deposit_commitment_x, y: deposit_commitment_y };
        const shares = depositAmount;
        const contractResult = await simulateContractShareAddition(circuitCommitmentPoint, shares, poseidon2Hash2);
        const depositLeaf = contractResult.leaf;

        entry.allLeaves.push(depositLeaf);
        const treeResult2 = await simulateLeanIMTInsert(depositLeaf, entry.treeSize, entry.treeDepth, entry.sideNodes, hashWrapper);
        const rootAfterDeposit = treeResult2.root;
        const depositTreeDepth = treeResult2.depth;
        const depositSideNodes = treeResult2.sideNodes;
        const depositTreeSize = 2;

        sharedState.deposit = {
            input: depositInput,
            leaf: depositLeaf,
            treeSize: depositTreeSize,
            treeDepth: depositTreeDepth,
            sideNodes: depositSideNodes,
            allLeaves: [...entry.allLeaves],
            root: rootAfterDeposit
        };
    }

    if (circuitName === 'deposit') {
        return sharedState.deposit.input;
    }

    const { deposit } = sharedState;
    const depositMerkleProof = await generateMerkleProof(deposit.leaf, 1, deposit.treeDepth, deposit.allLeaves, deposit.treeSize, hashWrapper);
    // Calculate previousShares based on actual deposit amount used
    const depositAmountUsed = deposit.input.amount;
    const previousShares = (BigInt(1) + BigInt(depositAmountUsed)).toString();

    if (circuitName === 'withdraw') {
        return {
            user_key: userKey,
            token_address: tokenAddress,
            amount: hexToDecimal("0x31"), // 49
            chain_id: chainId,
            previous_nonce: "1",
            previous_shares: previousShares,
            nullifier: "1",
            previous_unlocks_at: "1",
            declared_time_reference: "1000000",
            previous_commitment_leaf: deposit.leaf,
            commitment_index: "1",
            tree_depth: deposit.treeDepth.toString(),
            expected_root: deposit.root,
            merkle_proof: depositMerkleProof,
            arbitrary_calldata_hash: hexToDecimal("0x1234567890abcdef"),
            receiver_address: hexToDecimal("0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6"),
            relayer_fee_amount: "1"
        };
    }

    // === SEND ===
    if (!sharedState.send && (circuitName === 'send' || circuitName.startsWith('absorb'))) {
        // For send to self, calculate public key at nonce 2
        const sendNonce = 2;
        const senderPrivateKey = (BigInt(userKey) + BigInt(sendNonce)).toString();
        const myPublicKey = await calculatePublicKey(senderPrivateKey);

        // For absorb flows, send 0x32 (50), for regular send use 0x31 (49)
        const sendAmount = circuitName.startsWith('absorb') ? hexToDecimal("0x32") : hexToDecimal("0x31");
        const sendInput = {
            user_key: userKey,
            token_address: tokenAddress,
            amount: sendAmount,
            chain_id: chainId,
            previous_nonce: "1",
            previous_shares: previousShares,
            nullifier: "1",
            previous_unlocks_at: "1",
            previous_commitment_leaf: deposit.leaf,
            commitment_index: "1",
            tree_depth: deposit.treeDepth.toString(),
            expected_root: deposit.root,
            merkle_proof: depositMerkleProof,
            receiver_public_key: myPublicKey,
            relayer_fee_amount: "1"
        };

        const sendWitness = await runCircuit('send', sendInput);
        const send_new_commitment_leaf = sendWitness[1].toString();
        const note_commitment_x = sendWitness[10].toString();
        const note_commitment_y = sendWitness[11].toString();

        // Calculate note_stack_r
        const sharedKeyPoint = await scalarMul(senderPrivateKey, myPublicKey);
        const sharedKey = await poseidon2Hash2(sharedKeyPoint.x, sharedKeyPoint.y);
        const note_stack_r = await poseidon2Hash1(sharedKey);

        const note_stack_leaf = await poseidon2Hash2(note_commitment_x, note_commitment_y);

        deposit.allLeaves.push(send_new_commitment_leaf);
        const treeResult3 = await simulateLeanIMTInsert(send_new_commitment_leaf, deposit.treeSize, deposit.treeDepth, deposit.sideNodes, hashWrapper);
        const rootAfterSend1 = treeResult3.root;
        const sendTreeSize1 = deposit.treeSize + 1;

        deposit.allLeaves.push(note_stack_leaf);
        const treeResult4 = await simulateLeanIMTInsert(note_stack_leaf, sendTreeSize1, treeResult3.depth, treeResult3.sideNodes, hashWrapper);
        const rootAfterSend = treeResult4.root;
        const sendTreeDepth = treeResult4.depth;
        const sendSideNodes = treeResult4.sideNodes;
        const sendTreeSize = sendTreeSize1 + 1;

        const finalSharesAfterSend = (BigInt(previousShares) - BigInt(sendAmount) - BigInt(1)).toString(); // 51 - 50 - 1 = 50

        sharedState.send = {
            input: sendInput,
            new_commitment_leaf: send_new_commitment_leaf,
            note_stack_x: note_commitment_x,
            note_stack_y: note_commitment_y,
            note_stack_m: sendAmount,
            note_stack_r: note_stack_r.toString(),
            note_stack_leaf: note_stack_leaf,
            treeSize: sendTreeSize,
            treeDepth: sendTreeDepth,
            sideNodes: sendSideNodes,
            allLeaves: [...deposit.allLeaves],
            root: rootAfterSend,
            finalShares: finalSharesAfterSend
        };
    }

    if (circuitName === 'send') {
        return sharedState.send.input;
    }

    // === ABSORB_SEND ===
    if (circuitName === 'absorb_send') {
        const { send } = sharedState;
        const nonce3 = 3;
        const senderPrivateKey3 = (BigInt(userKey) + BigInt(nonce3)).toString();
        const myPublicKey3 = await calculatePublicKey(senderPrivateKey3);

        const absorbSendAmount = hexToDecimal("0x1e"); // 30
        const relayerFee = "1"; // Single fee for absorb+send

        const sendMerkleProof = await generateMerkleProof(send.new_commitment_leaf, 2, send.treeDepth, send.allLeaves, send.treeSize, hashWrapper);
        const noteStackMerkleProof = await generateMerkleProof(send.note_stack_leaf, 3, send.treeDepth, send.allLeaves, send.treeSize, hashWrapper);

        return {
            user_key: userKey,
            amount: absorbSendAmount,
            previous_nonce: "2",
            current_balance: send.finalShares,
            nullifier: "1",
            previous_unlocks_at: "1",
            previous_commitment_leaf: send.new_commitment_leaf,
            commitment_index: "2",
            tree_depth: send.treeDepth.toString(),
            merkle_proof: sendMerkleProof,
            note_stack_m: send.note_stack_m,
            note_stack_r: send.note_stack_r,
            note_stack_commitment_index: "3",
            note_stack_merkle_proof: noteStackMerkleProof,
            token_address: tokenAddress,
            chain_id: chainId,
            expected_root: send.root,
            note_stack_x: send.note_stack_x,
            note_stack_y: send.note_stack_y,
            receiver_public_key: myPublicKey3,
            relayer_fee_amount: relayerFee
        };
    }

    // === ABSORB_WITHDRAW ===
    if (circuitName === 'absorb_withdraw') {
        const { send } = sharedState;

        const absorbWithdrawAmount = hexToDecimal("0x1e"); // 30
        const relayerFee = "1"; // Single fee for absorb+withdraw

        const sendMerkleProof = await generateMerkleProof(send.new_commitment_leaf, 2, send.treeDepth, send.allLeaves, send.treeSize, hashWrapper);
        const noteStackMerkleProof = await generateMerkleProof(send.note_stack_leaf, 3, send.treeDepth, send.allLeaves, send.treeSize, hashWrapper);

        return {
            user_key: userKey,
            amount: absorbWithdrawAmount,
            previous_nonce: "2",
            current_balance: send.finalShares,
            nullifier: "1",
            previous_unlocks_at: "1",
            previous_commitment_leaf: send.new_commitment_leaf,
            commitment_index: "2",
            tree_depth: send.treeDepth.toString(),
            merkle_proof: sendMerkleProof,
            note_stack_m: send.note_stack_m,
            note_stack_r: send.note_stack_r,
            note_stack_commitment_index: "3",
            note_stack_merkle_proof: noteStackMerkleProof,
            token_address: tokenAddress,
            chain_id: chainId,
            expected_root: send.root,
            note_stack_x: send.note_stack_x,
            note_stack_y: send.note_stack_y,
            declared_time_reference: "1000000",
            arbitrary_calldata_hash: hexToDecimal("0x1234567890abcdef"),
            receiver_address: hexToDecimal("0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6"),
            relayer_fee_amount: relayerFee
        };
    }

    throw new Error(`Unknown circuit: ${circuitName}`);
}

// Generate proof for a circuit
async function generateProof(circuitName, input) {
    const buildDir = path.join(__dirname, `../../build/${circuitName}`);
    const wasmPath = path.join(buildDir, `${circuitName}_js/${circuitName}.wasm`);
    const zkeyPath = path.join(buildDir, `${circuitName}_final.zkey`);
    const proofPath = path.join(buildDir, 'proof.json');
    const publicPath = path.join(buildDir, 'public.json');
    const inputPath = path.join(buildDir, 'input.json');

    // Check required files
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM not found: ${wasmPath}\nRun: npm run compile:${circuitName}`);
    }

    if (!fs.existsSync(zkeyPath)) {
        throw new Error(`Zkey not found: ${zkeyPath}\nRun: ./scripts/build_verifiers.sh`);
    }

    // Process and save input
    const processedInput = processInput(input);
    fs.writeFileSync(inputPath, JSON.stringify(processedInput, null, 2));

    // Generate proof
    try {
        execSync(
            `snarkjs groth16 fullprove ${inputPath} ${wasmPath} ${zkeyPath} ${proofPath} ${publicPath}`,
            { stdio: 'pipe', cwd: path.join(__dirname, '../..') }
        );
    } catch (error) {
        const errorMsg = error.stdout?.toString() || error.stderr?.toString() || error.message;
        throw new Error(`Failed to generate proof for ${circuitName}:\n${errorMsg}`);
    }

    // Load proof and public inputs
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    const publicInputs = JSON.parse(fs.readFileSync(publicPath, 'utf8'));

    // Verify proof
    const vkeyPath = path.join(buildDir, `${circuitName}_vkey.json`);
    if (!fs.existsSync(vkeyPath)) {
        throw new Error(`Verification key not found: ${vkeyPath}`);
    }

    try {
        execSync(
            `snarkjs groth16 verify ${vkeyPath} ${publicPath} ${proofPath}`,
            { stdio: 'pipe', cwd: path.join(__dirname, '../..') }
        );
    } catch (error) {
        throw new Error(`Proof verification failed for ${circuitName}`);
    }

    // Clean up
    if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
    }

    return {
        proof,
        publicInputs,
        input: processedInput
    };
}

/**
 * Run snarkjs generatecall on public.json and proof.json.
 * generatecall outputs human-readable format: [pA],[pB],[pC],[publicSignals]
 * (comma-separated arrays of hex strings). Parse that into our proof + publicSignals.
 * @param {string} publicPath - full path to public.json (e.g. circom/build/entry/public.json)
 * @param {string} proofPath - full path to proof.json
 * @param {number} nPublic - number of public signals
 * @returns {{ calldata: string, proof: { a: string[], b: string[][], c: string[] }, publicSignals: string[] }}
 */
function getSolidityCalldataProof(publicPath, proofPath, nPublic) {
    const buildDir = path.dirname(publicPath);
    const circomDir = path.resolve(__dirname, '../..');
    // Relative paths from circom dir so npx finds local snarkjs
    const publicRel = path.relative(circomDir, publicPath);
    const proofRel = path.relative(circomDir, proofPath);
    let stdout = '';

    for (const cmd of [
        `npx snarkjs generatecall "${publicRel}" "${proofRel}"`,
        `npx snarkjs zkey export soliditycalldata "${publicRel}" "${proofRel}"`,
        `snarkjs generatecall "${publicRel}" "${proofRel}"`,
        `snarkjs zkey export soliditycalldata "${publicRel}" "${proofRel}"`
    ]) {
        try {
            stdout = execSync(cmd, {
                encoding: 'utf8',
                maxBuffer: 1024 * 1024,
                cwd: circomDir
            }).trim();
            if (stdout && stdout.length > 0) break;
        } catch (e) {
            // try next command
        }
    }

    if (!stdout || stdout.length === 0) {
        throw new Error(
            'snarkjs returned empty output. From repo root run: cd circom && npx snarkjs generatecall build/entry/public.json build/entry/proof.json ' +
            'Ensure snarkjs is installed in circom: cd circom && npm list snarkjs'
        );
    }

    // Format A: human-readable [pA],[pB],[pC],[publicSignals] with hex strings
    const hexRegex = /0x[0-9a-fA-F]+/g;
    const all = stdout.match(hexRegex);
    const need = 2 + 4 + 2 + nPublic;

    if (all && all.length >= need) {
        let idx = 0;
        const pA = [normalizeHex(all[idx++]), normalizeHex(all[idx++])];
        const pB = [
            [normalizeHex(all[idx++]), normalizeHex(all[idx++])],
            [normalizeHex(all[idx++]), normalizeHex(all[idx++])]
        ];
        const pC = [normalizeHex(all[idx++]), normalizeHex(all[idx++])];
        const publicSignals = [];
        for (let i = 0; i < nPublic; i++) {
            publicSignals.push(normalizeHex(all[idx++]));
        }
        return { calldata: stdout, proof: { a: pA, b: pB, c: pC }, publicSignals };
    }

    // Format B: raw hex calldata (single 0x... string, no brackets)
    const hexOnly = /^0x[0-9a-fA-F]+$/.test(stdout.replace(/\s/g, ''));
    if (hexOnly) {
        const hex = stdout.replace(/\s/g, '').replace(/^0x/, '');
        const calldata = Buffer.from(hex, 'hex');
        const minLen = 4 + 64 + 128 + 64 + nPublic * 32;
        if (calldata.length >= minLen) {
            let offset = 4;
            const readU256 = () => {
                const slice = calldata.subarray(offset, offset + 32);
                offset += 32;
                return BigInt('0x' + slice.toString('hex')).toString(16);
            };
            const toHex = (n) => '0x' + n.padStart(64, '0');
            return {
                calldata: stdout,
                proof: {
                    a: [toHex(readU256()), toHex(readU256())],
                    b: [
                        [toHex(readU256()), toHex(readU256())],
                        [toHex(readU256()), toHex(readU256())]
                    ],
                    c: [toHex(readU256()), toHex(readU256())]
                },
                publicSignals: Array.from({ length: nPublic }, () => toHex(readU256()))
            };
        }
    }

    throw new Error(
        `snarkjs output could not be parsed. Got ${all ? all.length : 0} hex values (need ${need}). ` +
        `First 150 chars: ${stdout.slice(0, 150)}`
    );
}

/** Ensure hex string is 0x + 64 chars (32 bytes) for Solidity. */
function normalizeHex(s) {
    const h = s.startsWith('0x') ? s.slice(2) : s;
    return '0x' + h.padStart(64, '0');
}

// Main function
async function main() {
    // Default to contracts/test/test-proofs directory
    const projectRoot = path.join(__dirname, '../../..');
    const contractsDir = path.join(projectRoot, 'contracts', 'test', 'test-proofs');
    const defaultOutput = path.join(contractsDir, 'proofs_for_solidity.json');
    const outputFile = process.argv[2] || defaultOutput;

    // Ensure directory exists
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      GENERATE PROOFS FOR ALL CIRCUITS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Output file: ${outputFile}`);
    console.log('');

    const results = {};
    const sharedState = {}; // Share state between circuits

    for (const circuitName of CIRCUITS) {
        console.log(`\n[${circuitName}] Processing...`);

        try {
            // Get inputs from flow
            console.log(`  Generating inputs from flow...`);
            const input = await getInputsFromFlow(circuitName, sharedState);

            // Generate proof
            console.log(`  Generating proof...`);
            const result = await generateProof(circuitName, input);

            // Use snarkjs generatecall (public.json + proof.json) so proof is in the exact format the Solidity verifier expects
            const buildDir = path.join(__dirname, `../../build/${circuitName}`);
            const publicPath = path.resolve(buildDir, 'public.json');
            const proofPath = path.resolve(buildDir, 'proof.json');
            const nPublic = result.publicInputs.length;
            const { calldata: calldataRaw, proof: solidityProof, publicSignals: solidityPublicSignals } =
                getSolidityCalldataProof(publicPath, proofPath, nPublic);

            // Output format: raw snarkjs generatecall string + parsed proof/publicSignals for tests
            const solidityFormat = {
                calldata: calldataRaw,
                proof: solidityProof,
                publicSignals: solidityPublicSignals
            };

            results[circuitName] = solidityFormat;
            console.log(`  ✅ ${circuitName} proof generated and verified (soliditycalldata format)`);
            console.log(`     Public signals: ${solidityPublicSignals.length}`);

        } catch (error) {
            console.error(`  ❌ Error processing ${circuitName}:`, error.message);
            // Continue with other circuits
        }
    }

    // Save results
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Proofs generated! Results saved to: ${outputFile}`);
    console.log('');
    console.log('Summary:');
    for (const [circuit, data] of Object.entries(results)) {
        console.log(`  ${circuit}: ✅ (${data.publicSignals.length} public signals)`);
    }

    const failed = CIRCUITS.filter(c => !results[c]);
    if (failed.length > 0) {
        console.log('');
        console.log('Failed:');
        for (const circuit of failed) {
            console.log(`  ${circuit}: ❌`);
        }
    }

    console.log('');
}

// Run
main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
