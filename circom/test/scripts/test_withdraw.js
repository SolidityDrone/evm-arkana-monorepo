#!/usr/bin/env node

/**
 * Withdraw Circuit Test
 * Equivalent to Noir's Prover.toml workflow
 * Usage: node test/scripts/test_withdraw.js [input.json]
 */

const fs = require('fs');
const path = require('path');

async function testWithdraw(inputFile) {
    const buildDir = path.join(__dirname, '../../build/withdraw/withdraw_js');
    const wasmPath = path.join(buildDir, 'withdraw.wasm');
    const witnessCalcPath = path.join(buildDir, 'witness_calculator.js');

    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found: ${wasmPath}\nPlease compile first: pnpm run compile:withdraw`);
    }

    if (!fs.existsSync(witnessCalcPath)) {
        throw new Error(`Witness calculator not found: ${witnessCalcPath}`);
    }

    // Load input JSON
    let input;
    if (inputFile) {
        if (!fs.existsSync(inputFile)) {
            throw new Error(`Input file not found: ${inputFile}`);
        }
        input = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    } else {
        // Default test input
        input = {
            user_key: "0x19e573f3801c7b2e4619998342e8e305e1692184cbacd220c04198a04c36b7d2",
            previous_nonce: "0x03",
            previous_shares: "0x64",
            nullifier: "0x00",
            previous_unlocks_at: "0x00",
            declared_time_reference: "0x0f4240",
            previous_commitment_leaf: "0x2c1b45cba36c96d9049a38f445fba21d58f14de2bfd88b818e0c35cb2dca9e33",
            commitment_index: "0x03",
            tree_depth: "0x02",
            expected_root: "0x176444929ca9e37f64ec3647eac6b28af6c38754f35cbb75249b6f19c3fba4e7",
            merkle_proof: ["0x2d9ef1023cef3c2d6c293641045639a3e5b22bbfff248297c2fec63c210aa1c2", "0x1929818f8c0678d133d3785d5d996bb759282170e0c64784cbd6d8252cadb153", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00"],
            token_address: "0x7775e4b6f4d40be537b55b6c47e09ada0157bd",
            chain_id: "0x01",
            amount: "0x32",
            arbitrary_calldata_hash: "0x1234567890abcdef",
            receiver_address: "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
            relayer_fee_amount: "0x01"
        };
    }

    // Convert hex strings to decimal strings
    const processedInput = {};
    for (const [key, value] of Object.entries(input)) {
        if (Array.isArray(value)) {
            processedInput[key] = value.map(v => {
                if (typeof v === 'string' && v.startsWith('0x')) {
                    return BigInt(v).toString();
                }
                return v.toString();
            });
        } else if (typeof value === 'string' && value.startsWith('0x')) {
            processedInput[key] = BigInt(value).toString();
        } else {
            processedInput[key] = value.toString();
        }
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('      TEST: Withdraw Circuit');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Input:');
    console.log(JSON.stringify(processedInput, null, 2));
    console.log('');

    // Load witness calculator
    const witnessCalculator = require(witnessCalcPath);
    const buffer = fs.readFileSync(wasmPath);
    const wtnsCalculator = await witnessCalculator(buffer);

    // Calculate witness
    const witness = await wtnsCalculator.calculateWitness(processedInput, 0);

    // Extract outputs: commitment[2], new_nonce_commitment, encrypted_state_details[2], nonce_discovery_entry[2]
    const commitment_x = witness[1].toString();
    const commitment_y = witness[2].toString();
    const new_nonce_commitment = witness[3].toString();
    const encrypted_balance = witness[4].toString();
    const encrypted_nullifier = witness[5].toString();
    const nonce_discovery_entry_x = witness[6].toString();
    const nonce_discovery_entry_y = witness[7].toString();

    console.log('Outputs:');
    console.log(`  commitment: [${commitment_x}, ${commitment_y}]`);
    console.log(`  new_nonce_commitment: ${new_nonce_commitment}`);
    console.log(`  encrypted_state_details: [${encrypted_balance}, ${encrypted_nullifier}]`);
    console.log(`  nonce_discovery_entry: [${nonce_discovery_entry_x}, ${nonce_discovery_entry_y}]`);
    console.log('');

    // Basic assertions
    if (commitment_x === '0' || commitment_y === '0') {
        throw new Error('❌ commitment should not be zero');
    }
    if (new_nonce_commitment === '0') {
        throw new Error('❌ new_nonce_commitment should not be zero');
    }

    console.log('✅ Withdraw circuit test passed!');
    console.log('');

    return {
        commitment: [commitment_x, commitment_y],
        new_nonce_commitment,
        encrypted_state_details: [encrypted_balance, encrypted_nullifier],
        nonce_discovery_entry: [nonce_discovery_entry_x, nonce_discovery_entry_y]
    };
}

const inputFile = process.argv[2];
testWithdraw(inputFile).catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});

