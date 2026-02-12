# Poseidon2 Equivalence Tests

This directory contains tests to verify that the Circom2 Poseidon2 implementation produces identical outputs to the Solidity/Huff implementation.

## Test Cases

The tests match the test cases in `contracts/test/Poseidon2Test.t.sol`:

1. **Test 1**: Hash single value `0x10`
2. **Test 2**: 2-hash chain (hash the result of test 1)
3. **Test 3**: 100-hash chain (hash 100 times in sequence, showing iterations 1-3 and every 10th)

## Quick Start

### Run the Equivalence Test

```bash
cd circom
npm run test:equivalence
# or
node test/equivalence_test.js
```

This will output all test results in the same format as the Solidity test, allowing you to compare outputs manually.

### Manual Testing

1. Compile a test circuit:
   ```bash
   circom test/poseidon2_test1.circom --r1cs --wasm --sym --c -o test/
   ```

2. Generate witness:
   ```bash
   echo '{"in": "0x10"}' > test/input.json
   node test/poseidon2_test1_js/generate_witness.js \
     test/poseidon2_test1_js/poseidon2_test1.wasm \
     test/input.json \
     test/witness.wtns
   ```

3. Export and view output:
   ```bash
   snarkjs wtns export test/witness.wtns | jq '.[1]'
   ```

## Test Circuits

- `poseidon2_test1.circom` - Single hash test
- `poseidon2_test2.circom` - 2-hash chain test
- `poseidon2_test100.circom` - 100-hash chain test (⚠️ very large, not used by default)

Note: The equivalence test uses `poseidon2_test1.circom` iteratively for the 100-hash chain to avoid compiling a massive circuit.

## NPM Scripts

```bash
# Run equivalence test (matches Solidity test format)
npm run test:equivalence

# Compile test 1
npm run compile:poseidon2-1

# Compile test 2
npm run compile:poseidon2-2

# Compile test 100 (warning: very large)
npm run compile:poseidon2-100
```

## Notes

- All tests use the same input: `0x10`
- The equivalence test shows iterations 1-3 and every 10th iteration (matching Solidity test format)
- Compare the outputs manually with the Solidity test results
