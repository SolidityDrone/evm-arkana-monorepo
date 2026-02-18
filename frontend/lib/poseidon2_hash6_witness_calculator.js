/**
 * Placeholder for Poseidon2Hash6 witness calculator.
 * To enable send/absorb_send proof verification:
 * 1. In circom: run a test that builds poseidon2_hash6_test (e.g. test_entry_send_flow or poseidon2_hash_helper).
 * 2. Copy circom/test/circuits/poseidon2_hash6_test_js/witness_calculator.js over this file (or replace this with its contents).
 * 3. Copy circom/test/circuits/poseidon2_hash6_test_js/poseidon2_hash6_test.wasm to frontend/public/circuits/poseidon2_hash6_test_js/poseidon2_hash6_test.wasm.
 */
module.exports = async function builder() {
  throw new Error(
    'Poseidon2Hash6 witness calculator not installed. Build circom poseidon2_hash6_test and copy witness_calculator.js to frontend/lib/poseidon2_hash6_witness_calculator.js, and copy poseidon2_hash6_test.wasm to public/circuits/poseidon2_hash6_test_js/.'
  );
};
