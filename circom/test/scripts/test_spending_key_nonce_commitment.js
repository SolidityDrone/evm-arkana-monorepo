#!/usr/bin/env node

/**
 * Spending key and nonce_commitment from circuit (same logic as entry.circom).
 * Console logs values so you can compare with frontend/contract.
 *
 * Usage:
 *   node test/scripts/test_spending_key_nonce_commitment.js
 *   node test/scripts/test_spending_key_nonce_commitment.js [input.json]
 *
 * Input JSON keys: user_key, chain_id, token_address, signer_pubkey_hash (decimal strings or 0x hex).
 * Default: values from discovery log for comparison.
 */

const fs = require('fs');
const path = require('path');
const { poseidon2Hash1, poseidon2Hash2, poseidon2Hash3, getSpendingKeyFromHashes, getViewKeyFromUserKey, getNonceCommitmentFromViewKey } = require('./poseidon_hash_helper');

// Default inputs (same as frontend discovery log)
const DEFAULT_INPUT = {
  user_key: '8905999376169980916306969262839757913371715244263613333045968347152681192757',
  chain_id: '31337',
  token_address: '239483873497547384431979563900483016327709220099',
  signer_pubkey_hash: '20235839683863855220326314182455051362322089431140570313509852678720147554524',
};

function toDecimalString(v) {
  if (typeof v === 'string' && v.startsWith('0x')) return BigInt(v).toString();
  return String(v);
}

function toHex(v) {
  const n = typeof v === 'string' ? BigInt(v) : v;
  return '0x' + n.toString(16);
}

async function runCircuitOnly(input) {
  const uk = toDecimalString(input.user_key);
  const ch = toDecimalString(input.chain_id);
  const ta = toDecimalString(input.token_address);
  const sph = toDecimalString(input.signer_pubkey_hash);

  const spending_key = await getSpendingKeyFromHashes(uk, ch, ta, sph);
  const view_key = await getViewKeyFromUserKey(uk);
  const nonce = '0';
  const nonce_commitment = await getNonceCommitmentFromViewKey(view_key, nonce, ta);
  return { spending_key, view_key, nonce_commitment };
}

async function runFullCircuitIfBuilt(input) {
  const testDir = path.join(__dirname, '../circuits');
  const buildDir = path.join(testDir, 'spending_key_nonce_commitment_js');
  const wasmPath = path.join(buildDir, 'spending_key_nonce_commitment.wasm');
  const witnessCalcPath = path.join(buildDir, 'witness_calculator.js');

  if (!fs.existsSync(wasmPath) || !fs.existsSync(witnessCalcPath)) return null;

  const witnessCalculator = require(witnessCalcPath);
  const buffer = fs.readFileSync(wasmPath);
  const wtnsCalculator = await witnessCalculator(buffer);

  const processed = {
    user_key: toDecimalString(input.user_key),
    chain_id: toDecimalString(input.chain_id),
    token_address: toDecimalString(input.token_address),
    signer_pubkey_hash: toDecimalString(input.signer_pubkey_hash),
  };

  const witness = await wtnsCalculator.calculateWitness(processed, 0);
  return {
    spending_key: witness[1].toString(),
    nonce_commitment: witness[2].toString(),
  };
}

async function main() {
  let input = { ...DEFAULT_INPUT };
  const inputFile = process.argv[2];
  if (inputFile && fs.existsSync(inputFile)) {
    const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    input = {
      user_key: raw.user_key ?? input.user_key,
      chain_id: raw.chain_id ?? input.chain_id,
      token_address: raw.token_address ?? input.token_address,
      signer_pubkey_hash: raw.signer_pubkey_hash ?? input.signer_pubkey_hash,
    };
  }

  const uk = toDecimalString(input.user_key);
  const ch = toDecimalString(input.chain_id);
  const ta = toDecimalString(input.token_address);
  const sph = toDecimalString(input.signer_pubkey_hash);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CIRCUIT: Hash1, Hash2, Hash3, spending_key (compare with frontend)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Inputs:');
  console.log(JSON.stringify({
    userKey: uk,
    chainId: ch,
    tokenAddress: ta + ' (0x' + BigInt(ta).toString(16) + ')',
    signerPubkeyHash: sph,
  }, null, 2));
  console.log('');

  const h1 = await poseidon2Hash1(uk);
  const h2 = await poseidon2Hash2(uk, ch);
  const h3 = await poseidon2Hash3(uk, ch, ta);
  const spending_key = await getSpendingKeyFromHashes(uk, ch, ta, sph);

  console.log('───────────────────────────────────────────────────────────────');
  console.log('  Poseidon2Hash1(userKey)');
  console.log('  (decimal):', h1);
  console.log('  (hex):    ', toHex(h1));
  console.log('');
  console.log('  Poseidon2Hash2(userKey, chainId)');
  console.log('  (decimal):', h2);
  console.log('  (hex):    ', toHex(h2));
  console.log('');
  console.log('  Poseidon2Hash3(userKey, chainId, tokenAddress)');
  console.log('  (decimal):', h3);
  console.log('  (hex):    ', toHex(h3));
  console.log('');
  console.log('  spending_key = Hash3(Hash2(userKey, chainId), tokenAddress, signerPubkeyHash)');
  console.log('  (decimal):', spending_key);
  console.log('  (hex):    ', toHex(spending_key));
  console.log('───────────────────────────────────────────────────────────────');
  console.log('');

  const { spending_key: sk, nonce_commitment } = await runCircuitOnly(input);

  console.log('───────────────────────────────────────────────────────────────');
  console.log('  Circuit computeSpendingKey (Hash3(Hash2(user_key, chain_id), token_address, signer_pubkey_hash))');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  spending_key (decimal):', sk);
  console.log('  spending_key (hex):    ', toHex(sk));
  console.log('');
  console.log('  Circuit computeNonceCommitment (Poseidon2Hash3(view_key, 0, token_address))');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  nonce_commitment (decimal):', nonce_commitment);
  console.log('  nonce_commitment (hex):    ', toHex(nonce_commitment));
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Compare with frontend logs:');
  console.log('  - Contract computeSpendingKey(...) returns: <decimal> | <hex>');
  console.log('  - Frontend getSpendingKey(...) returns:     <decimal> | <hex>');
  console.log('  - Contract computeNonceCommitment(...) returns: <decimal> | <hex>');
  console.log('  Circuit values above should match the CONTRACT (Huff Poseidon2), not Aztec.');
  console.log('═══════════════════════════════════════════════════════════════');

  const fullResult = await runFullCircuitIfBuilt(input);
  if (fullResult) {
    const okSk = fullResult.spending_key === sk;
    const okNc = fullResult.nonce_commitment === nonce_commitment;
    console.log('');
    console.log('  SpendingKeyNonceCommitment circuit check:', okSk && okNc ? '✅' : '❌');
    console.log('  (Note: nonce_commitment now uses view_key; test circuit may need rebuild)');
    if (!okSk) console.log('    spending_key mismatch');
    if (!okNc) console.log('    nonce_commitment mismatch');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
