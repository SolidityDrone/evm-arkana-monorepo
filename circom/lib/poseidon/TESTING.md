# Testing Poseidon2 Circom Circuit

## ✅ Compilation Status

The Poseidon2 circuit **compiles successfully**! 

```
template instances: 7
non-linear constraints: 264
linear constraints: 494
public inputs: 0
private inputs: 1
public outputs: 1
wires: 760
labels: 1712
```

## How to Test

### 1. Install Dependencies

```bash
cd circom
npm install
npm install -g circom snarkjs
```

### 2. Compile the Circuit

```bash
cd circom
circom test/poseidon2_hash1_test.circom --r1cs --wasm --sym --c -o test/
```

This should complete without errors.

### 3. Generate Witness

```bash
# Create input file
echo '{"in": "0x10"}' > test/input.json

# Generate witness
node test/poseidon2_hash1_test_js/generate_witness.js \
  test/poseidon2_hash1_test_js/poseidon2_hash1_test.wasm \
  test/input.json \
  test/witness.wtns
```

### 4. Verify Witness

```bash
snarkjs wtns check test/poseidon2_hash1_test.r1cs test/witness.wtns
```

### 5. Extract Output

```bash
snarkjs wtns export test/witness.wtns | jq '.[1]'
```

The output at index 1 should be the hash result.

## Compare with Noir

To verify correctness, compare the output with Noir:

```bash
# Terminal 1: Run Noir test
cd circuits
nargo test --package poseidon --show-output

# Terminal 2: Run Circom test (after generating witness)
cd circom
snarkjs wtns export test/witness.wtns | jq '.[1]'
```

The outputs should match exactly.

## Regenerating the Circuit

If you need to regenerate the circuit (e.g., after updating constants):

```bash
cd circom/lib/poseidon
node generate_poseidon2.js
```

This will regenerate `poseidon2.circom` with all 64 rounds fully unrolled.

## Circuit Statistics

- **Total Rounds**: 64 (4 external + 56 internal + 4 external)
- **State Size**: 4 elements
- **Rate**: 3
- **Capacity**: 1
- **Constraints**: 264 non-linear, 494 linear
- **Wires**: 760

## Notes

- The circuit is fully unrolled (no loops with component declarations)
- All constants are inlined using ternary operators
- All components are declared upfront
- The circuit matches the Noir implementation 1:1

