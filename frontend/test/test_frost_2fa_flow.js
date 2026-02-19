#!/usr/bin/env node

/**
 * FROST 2-of-2 → Entry → Deposit → Withdraw end-to-end test
 *
 * Simulates:
 *   Bob (desktop)  — holds scalar share s1
 *   BobDevice (2FA) — holds scalar share s2 (derived from passkey mock)
 *
 * 1. DKG: Bob and BobDevice generate shares, derive group public key A
 * 2. Entry circuit: produces balance commitment with FROST group key identity
 * 3. Deposit circuit: adds shares to the note
 * 4. Contract simulation: share addition on commitment point → leaf
 * 5. FROST 2-of-2 signing: both parties sign withdraw message
 * 6. Withdraw circuit: witness generation + Groth16 proof + verification
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────

const BJJ_SUBGROUP_ORDER = BigInt('2736030358979909402780800718157159386076813972158567259200215660948447373041');
const BN254_FIELD = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

// Baby Jubjub curve params (for pure-JS point arithmetic in contract simulation)
const BJJ_A = 168700n;
const BJJ_D = 168696n;

function modFr(a) { return ((a % BN254_FIELD) + BN254_FIELD) % BN254_FIELD; }
function modInverseFr(a) {
    const a_mod = modFr(a);
    let [old_r, r] = [a_mod, BN254_FIELD];
    let [old_s, s] = [1n, 0n];
    while (r !== 0n) {
        const q = old_r / r;
        [old_r, r] = [r, old_r - q * r];
        [old_s, s] = [s, old_s - q * s];
    }
    return modFr(old_s);
}
function babyJubAdd(p1, p2) {
    const [x1, y1, x2, y2] = [BigInt(p1.x), BigInt(p1.y), BigInt(p2.x), BigInt(p2.y)];
    const beta = modFr(x1 * y2), gamma = modFr(y1 * x2);
    const delta = modFr((modFr(-BJJ_A * x1) + y1) * modFr(x2 + y2));
    const tau = modFr(beta * gamma);
    const dx = modFr(1n + BJJ_D * tau), dy = modFr(1n - BJJ_D * tau);
    return {
        x: modFr((beta + gamma) * modInverseFr(dx)),
        y: modFr((delta + BJJ_A * beta - gamma + BN254_FIELD) * modInverseFr(dy))
    };
}
function babyJubScalarMul(scalar, point) {
    const k = BigInt(scalar);
    let result = { x: 0n, y: 1n };
    let addend = { x: BigInt(point.x), y: BigInt(point.y) };
    for (let i = 253; i >= 0; i--) {
        result = babyJubAdd(result, result);
        if ((k >> BigInt(i)) & 1n) result = babyJubAdd(result, addend);
    }
    return result;
}

const GEN_G_X = '10457101036533406547632367118273992217979173478358440826365724437999023779287';
const GEN_G_Y = '19824078218392094440610104313265183977899662750282163392862422243483260492317';

// ─── Circomlibjs lazy init ────────────────────────────────────────────────────

let _babyJub, _poseidon, _F;
async function getCircomLib() {
    if (_babyJub) return { babyJub: _babyJub, poseidon: _poseidon, F: _F };
    const circomlibjs = require('circomlibjs');
    _babyJub = await circomlibjs.buildBabyjub();
    _poseidon = await circomlibjs.buildPoseidon();
    _F = _babyJub.F;
    return { babyJub: _babyJub, poseidon: _poseidon, F: _F };
}

async function poseidonHash(inputs) {
    const { poseidon, F } = await getCircomLib();
    const fieldInputs = inputs.map(v => {
        const n = BigInt(v);
        return ((n % BN254_FIELD) + BN254_FIELD) % BN254_FIELD;
    });
    const out = poseidon(fieldInputs);
    return F.toObject(out).toString();
}

async function scalarMulBase8(scalar) {
    const { babyJub, F } = await getCircomLib();
    const point = babyJub.mulPointEscalar(babyJub.Base8, scalar);
    return [F.toObject(point[0]).toString(), F.toObject(point[1]).toString()];
}

// ─── Random scalar generation ─────────────────────────────────────────────────

function getRandomScalar() {
    const bytes = crypto.randomBytes(32);
    const hex = bytes.toString('hex');
    return BigInt('0x' + hex) % BJJ_SUBGROUP_ORDER;
}

// ─── Lean-IMT helpers ─────────────────────────────────────────────────────────

async function simulateLeanIMTInsert(leaf, currentSize, currentDepth, currentSideNodes) {
    const index = Number(currentSize);
    const depth = Number(currentDepth);
    let treeDepth = depth;
    if (Math.pow(2, depth) < index + 1) treeDepth = depth + 1;
    let node = BigInt(leaf);
    const sideNodes = [...currentSideNodes];
    for (let level = 0; level < 32; level++) {
        if (level < treeDepth) {
            const bit = (index >> level) & 1;
            if (bit === 1) {
                const hashResult = await poseidonHash([sideNodes[level] || '0', node.toString()]);
                node = BigInt(hashResult);
            } else {
                sideNodes[level] = node.toString();
            }
        }
    }
    if (treeDepth < 32) sideNodes[treeDepth] = node.toString();
    return { root: node.toString(), depth: treeDepth, sideNodes };
}

async function generateMerkleProof(leaf, index, treeDepth, allLeaves, treeSize) {
    const proof = new Array(32).fill('0');
    const depth = Number(treeDepth);
    let currentLevel = [...allLeaves.slice(0, Number(treeSize))];
    let currentLevelSize = Number(treeSize);
    for (let level = 0; level < 32; level++) {
        if (level < depth) {
            const nodeIndex = Number(index) >> level;
            const bit = nodeIndex % 2;
            if (bit === 1) {
                const sibIdx = nodeIndex - 1;
                if (sibIdx < currentLevelSize) proof[level] = currentLevel[sibIdx];
            } else {
                const sibIdx = nodeIndex + 1;
                if (sibIdx < currentLevelSize) proof[level] = currentLevel[sibIdx];
            }
            const nextLevelSize = Math.floor((currentLevelSize - 1) / 2) + 1;
            const nextLevel = [];
            for (let i = 0; i < nextLevelSize; i++) {
                const l = i * 2, r = l + 1;
                if (r < currentLevelSize) {
                    nextLevel[i] = await poseidonHash([currentLevel[l], currentLevel[r]]);
                } else if (l < currentLevelSize) {
                    nextLevel[i] = currentLevel[l];
                }
            }
            currentLevel = nextLevel;
            currentLevelSize = nextLevelSize;
        }
    }
    return proof;
}

// ─── Contract share addition simulation ───────────────────────────────────────

async function simulateContractShareAddition(commitPoint, shares) {
    const sharesG = babyJubScalarMul(shares.toString(), { x: GEN_G_X, y: GEN_G_Y });
    const finalPoint = babyJubAdd(
        { x: commitPoint.x, y: commitPoint.y },
        { x: sharesG.x, y: sharesG.y }
    );
    const leaf = await poseidonHash([finalPoint.x.toString(), finalPoint.y.toString()]);
    return { finalPoint, leaf };
}

// ─── Witness calculator / snarkjs helpers ─────────────────────────────────────

const CIRCUITS_DIR = path.join(__dirname, '../public/circuits');

async function loadWitnessCalculator(circuitName) {
    const jsDir = path.join(CIRCUITS_DIR, circuitName, `${circuitName}_js`);
    const wasmPath = path.join(jsDir, `${circuitName}.wasm`);
    const wcPath = path.join(jsDir, 'witness_calculator.js');
    if (!fs.existsSync(wasmPath)) throw new Error(`Missing WASM: ${wasmPath}`);
    const WitnessCalculator = require(wcPath);
    const buffer = fs.readFileSync(wasmPath);
    return await WitnessCalculator(buffer);
}

async function runCircuit(circuitName, input) {
    const wc = await loadWitnessCalculator(circuitName);
    return await wc.calculateWitness(input, 0);
}

async function generateProof(circuitName, input) {
    const wasmPath = path.join(CIRCUITS_DIR, circuitName, `${circuitName}_js`, `${circuitName}.wasm`);
    const zkeyPath = path.join(CIRCUITS_DIR, circuitName, `${circuitName}_final.zkey`);
    const snarkjs = require('snarkjs');
    return await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);
}

async function verifyProof(circuitName, proof, publicSignals) {
    const vkeyPath = path.join(CIRCUITS_DIR, circuitName, `${circuitName}_vkey.json`);
    const vkey = JSON.parse(fs.readFileSync(vkeyPath, 'utf8'));
    const snarkjs = require('snarkjs');
    return await snarkjs.groth16.verify(vkey, publicSignals, proof);
}

// ─── FROST 2-of-2 implementation (mirrors frost-2fa.ts) ──────────────────────

async function frostDKG() {
    const { babyJub, F } = await getCircomLib();

    // Bob (desktop): generate s1
    const s1 = getRandomScalar();
    const [A1x, A1y] = await scalarMulBase8(s1);

    // BobDevice (2FA): generate s2 (mocking passkey derivation)
    const s2 = getRandomScalar();
    const [A2x, A2y] = await scalarMulBase8(s2);

    // Group public key A = A1 + A2
    const A1 = [F.e(A1x), F.e(A1y)];
    const A2 = [F.e(A2x), F.e(A2y)];
    const A = babyJub.addPoint(A1, A2);
    const Ax = F.toObject(A[0]).toString();
    const Ay = F.toObject(A[1]).toString();

    // signer_pubkey_hash = Poseidon(Ax, Ay)
    const signerPubkeyHash = await poseidonHash([Ax, Ay]);

    return {
        s1, s2,
        A1: [A1x, A1y], A2: [A2x, A2y],
        groupPublicKey: [Ax, Ay],
        signerPubkeyHash,
    };
}

async function frostSign(s1, s2, message, groupPublicKey) {
    const { babyJub, poseidon: poseidonFn, F } = await getCircomLib();

    // Bob: generate nonce r1
    const r1 = getRandomScalar();
    const [R1x, R1y] = await scalarMulBase8(r1);

    // BobDevice: generate nonce r2
    const r2 = getRandomScalar();
    const [R2x, R2y] = await scalarMulBase8(r2);

    // Combined nonce R = R1 + R2
    const R = babyJub.addPoint(
        [F.e(R1x), F.e(R1y)],
        [F.e(R2x), F.e(R2y)]
    );
    const Rx = F.toObject(R[0]).toString();
    const Ry = F.toObject(R[1]).toString();

    // Challenge H = Poseidon(Rx, Ry, Ax, Ay, M) — matches EdDSAPoseidonVerifier
    const [Ax, Ay] = groupPublicKey;
    const H = poseidonFn([F.e(Rx), F.e(Ry), F.e(Ax), F.e(Ay), F.e(message)]);
    const HBigInt = F.toObject(H);

    // Partial signatures with 8x cofactor (EdDSAPoseidonVerifier checks S*B8 == R + H*8*A)
    const S1 = (r1 + HBigInt * 8n * s1) % BJJ_SUBGROUP_ORDER;
    const S2 = (r2 + HBigInt * 8n * s2) % BJJ_SUBGROUP_ORDER;
    const S = (S1 + S2) % BJJ_SUBGROUP_ORDER;

    return {
        signature: [Rx, Ry, S.toString()],
        message,
    };
}

// ─── Main test flow ───────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  FROST 2-of-2 → Entry → Deposit → Withdraw (frontend test)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // ── STEP 0: user_key from Bob's ETH signature (mock) ─────────────────
    console.log('STEP 0: Mock user_key from Bob\'s ETH wallet signature...');
    const mockSignature = crypto.randomBytes(32);
    const mockSigBigInt = BigInt('0x' + mockSignature.toString('hex')) % BN254_FIELD;
    const user_key = await poseidonHash([mockSigBigInt.toString()]);
    console.log(`  user_key = ${user_key.slice(0, 20)}...`);

    // ── STEP 1: FROST 2-of-2 DKG ─────────────────────────────────────────
    console.log('\nSTEP 1: FROST 2-of-2 DKG (Bob + BobDevice)...');
    const dkg = await frostDKG();
    console.log(`  Bob s1 (scalar): ${dkg.s1.toString().slice(0, 20)}...`);
    console.log(`  BobDevice s2 (scalar): ${dkg.s2.toString().slice(0, 20)}...`);
    console.log(`  Group public key A = [${dkg.groupPublicKey[0].slice(0, 20)}..., ${dkg.groupPublicKey[1].slice(0, 20)}...]`);
    console.log(`  signer_pubkey_hash = ${dkg.signerPubkeyHash.slice(0, 20)}...`);

    // ── STEP 2: Run Entry Circuit ─────────────────────────────────────────
    console.log('\nSTEP 2: Running Entry Circuit...');
    const token_address = '848718422098705918423371510647535437848016970952';
    const chain_id = '31337';

    const entryInput = {
        user_key,
        signer_pubkey_hash: dkg.signerPubkeyHash,
        token_address,
        chain_id,
    };

    const entryWitness = await runCircuit('entry', entryInput);
    const balance_commitment_x = entryWitness[1].toString();
    const balance_commitment_y = entryWitness[2].toString();
    const nonce_commitment = entryWitness[3].toString();
    console.log(`  balance_commitment = [${balance_commitment_x.slice(0, 20)}..., ${balance_commitment_y.slice(0, 20)}...]`);
    console.log(`  nonce_commitment = ${nonce_commitment.slice(0, 20)}...`);

    // ── STEP 3: Hash commitment → entry leaf ──────────────────────────────
    console.log('\nSTEP 3: Hashing entry commitment to leaf...');
    const entryLeaf = await poseidonHash([balance_commitment_x, balance_commitment_y]);
    console.log(`  entry_leaf = ${entryLeaf.slice(0, 20)}...`);

    // ── STEP 4: Build Merkle tree with entry leaf ─────────────────────────
    console.log('\nSTEP 4: Building Merkle tree...');
    let treeSize = 0, treeDepth = 1;
    let sideNodes = new Array(32).fill('0');
    const allLeaves = [entryLeaf];

    const tree1 = await simulateLeanIMTInsert(entryLeaf, treeSize, treeDepth, sideNodes);
    treeDepth = tree1.depth; sideNodes = tree1.sideNodes; treeSize = 1;
    console.log(`  Root after entry: ${tree1.root.slice(0, 20)}... (depth=${treeDepth}, size=${treeSize})`);

    // ── STEP 5: Run Deposit Circuit ───────────────────────────────────────
    console.log('\nSTEP 5: Running Deposit Circuit...');
    const depositAmount = '1000000'; // 1M shares

    const depositInput = {
        user_key,
        signer_pubkey_hash: dkg.signerPubkeyHash,
        token_address,
        amount: depositAmount,
        chain_id,
        previous_nonce: '0',
        previous_shares: '0',
        nullifier: '0',
        previous_unlocks_at: '0',
        previous_commitment_leaf: entryLeaf,
        commitment_index: '0',
        tree_depth: treeDepth.toString(),
        expected_root: tree1.root,
        merkle_proof: await generateMerkleProof(entryLeaf, 0, treeDepth, allLeaves, treeSize),
    };

    const depositWitness = await runCircuit('deposit', depositInput);
    const deposit_cx = depositWitness[1].toString();
    const deposit_cy = depositWitness[2].toString();
    console.log(`  deposit commitment = [${deposit_cx.slice(0, 20)}..., ${deposit_cy.slice(0, 20)}...]`);

    // ── STEP 6: Contract share addition simulation ────────────────────────
    console.log('\nSTEP 6: Simulating contract share addition...');
    const contractResult = await simulateContractShareAddition({ x: deposit_cx, y: deposit_cy }, depositAmount);
    const depositLeaf = contractResult.leaf;
    allLeaves.push(depositLeaf);
    console.log(`  deposit_leaf = ${depositLeaf.slice(0, 20)}...`);

    // Insert deposit leaf into tree
    const tree2 = await simulateLeanIMTInsert(depositLeaf, treeSize, treeDepth, sideNodes);
    treeDepth = tree2.depth; sideNodes = tree2.sideNodes; treeSize = 2;
    console.log(`  Root after deposit: ${tree2.root.slice(0, 20)}... (depth=${treeDepth}, size=${treeSize})`);

    // ── STEP 7: FROST 2-of-2 Signing for withdraw ────────────────────────
    console.log('\nSTEP 7: FROST 2-of-2 signing (Bob + BobDevice) for withdraw...');

    const withdrawAmount = '100';
    const relayerFee = '10';
    const previousNonce = '1'; // deposit was nonce 1
    const currentNonce = '2';  // withdraw is nonce 2 = previous + 1

    // Compute withdraw message hash: Poseidon2(Poseidon3(ta, ch, amt), Poseidon2(fee, nonce))
    const msgLeft = await poseidonHash([token_address, chain_id, withdrawAmount]);
    const msgRight = await poseidonHash([relayerFee, currentNonce]);
    const withdrawMessage = await poseidonHash([msgLeft, msgRight]);
    console.log(`  withdraw message = ${withdrawMessage.slice(0, 20)}...`);

    // FROST sign
    const { signature } = await frostSign(dkg.s1, dkg.s2, withdrawMessage, dkg.groupPublicKey);
    console.log(`  signature R  = [${signature[0].slice(0, 20)}..., ${signature[1].slice(0, 20)}...]`);
    console.log(`  signature S  = ${signature[2].slice(0, 20)}...`);
    console.log(`  S < suborder = ${BigInt(signature[2]) < BJJ_SUBGROUP_ORDER}`);
    console.log(`  S < 2^253    = ${BigInt(signature[2]) < (1n << 253n)}`);

    // ── STEP 8: Build withdraw circuit inputs ─────────────────────────────
    console.log('\nSTEP 8: Building withdraw circuit inputs...');

    const withdrawInput = {
        user_key,
        signer_pubkey_hash: dkg.signerPubkeyHash,
        signer_public_key: dkg.groupPublicKey,
        signature,
        token_address,
        amount: withdrawAmount,
        chain_id,
        previous_nonce: previousNonce,
        previous_shares: depositAmount,
        nullifier: '0',
        previous_unlocks_at: '0',
        declared_time_reference: '1000000',
        previous_commitment_leaf: depositLeaf,
        commitment_index: '1',
        tree_depth: treeDepth.toString(),
        expected_root: tree2.root,
        merkle_proof: await generateMerkleProof(depositLeaf, 1, treeDepth, allLeaves, treeSize),
        arbitrary_calldata_hash: '0',
        receiver_address: token_address,
        relayer_fee_amount: relayerFee,
    };

    // ── STEP 9: Run witness generation ────────────────────────────────────
    console.log('\nSTEP 9: Running withdraw witness generation...');
    try {
        const witness = await runCircuit('withdraw', withdrawInput);
        console.log('  ✓ Witness generated successfully!');
        console.log(`  commitment_x  = ${witness[1].toString().slice(0, 20)}...`);
        console.log(`  commitment_y  = ${witness[2].toString().slice(0, 20)}...`);
        console.log(`  nonce_commit  = ${witness[3].toString().slice(0, 20)}...`);
    } catch (err) {
        console.error('  ✗ Witness generation FAILED:', err.message);
        console.log('\n  Dumping circuit inputs for debugging:');
        console.log(JSON.stringify(withdrawInput, null, 2));
        process.exit(1);
    }

    // ── STEP 10: Generate and verify Groth16 proof ────────────────────────
    console.log('\nSTEP 10: Generating Groth16 proof (this may take a while)...');
    try {
        const { proof, publicSignals } = await generateProof('withdraw', withdrawInput);
        console.log('  ✓ Proof generated!');
        console.log(`  Public signals (${publicSignals.length}): [${publicSignals.slice(0, 3).map(s => s.slice(0, 12) + '...').join(', ')}, ...]`);

        console.log('\nSTEP 11: Verifying proof...');
        const valid = await verifyProof('withdraw', proof, publicSignals);
        console.log(valid ? '  ✓ PROOF VALID!' : '  ✗ PROOF INVALID!');
        if (!valid) process.exit(1);
    } catch (err) {
        console.error('  ✗ Proof generation FAILED:', err.message);
        process.exit(1);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ALL TESTS PASSED');
    console.log('═══════════════════════════════════════════════════════════════');
}

main().catch(err => {
    console.error('\nFATAL:', err);
    process.exit(1);
});
