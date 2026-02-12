# Circom Circuit Testing

This directory contains test scripts and input files for all Circom circuits, equivalent to Noir's `Prover.toml` workflow.

## Quick Start

### 1. Build and Compile

First, build the libraries and compile the circuits:

```bash
pnpm run build:all      # Generate libraries (Poseidon2, Lean-IMT)
pnpm run compile:all    # Compile all circuits
```

### 2. Run Tests

#### Individual Circuit Tests

Test individual circuits with synthetic data:

```bash
pnpm run test:entry     # Test entry circuit
pnpm run test:deposit   # Test deposit circuit (may fail with synthetic data)
pnpm run test:withdraw  # Test withdraw circuit (may fail with synthetic data)
pnpm run test:send      # Test send circuit (may fail with synthetic data)
pnpm run test:poseidon2 # Test Poseidon2 library
```

#### Full Flow Tests (Recommended)

Test complete flows that chain circuits together and build valid Merkle trees:

```bash
pnpm run test:entry-deposit-flow    # Entry → Deposit flow
pnpm run test:entry-withdraw-flow   # Entry → Deposit → Withdraw flow
pnpm run test:entry-send-flow       # Entry → Send flow
pnpm run test:all-flows             # Run all flow tests
```

**Note:** The flow tests use Baby Jubjub generators (circomlib standard) throughout, so they generate valid test data that works with the circuits. The individual circuit tests use synthetic data that may not represent valid states.

#### Run All Tests

```bash
pnpm run test:all        # Run all individual circuit tests
pnpm run test:all-flows  # Run all flow tests
```

## Using Custom Input Files

Each test script accepts an optional input JSON file (equivalent to Noir's `Prover.toml`):

```bash
# Use default test input
node test/scripts/test_entry.js

# Use custom input file
node test/scripts/test_entry.js test/inputs/entry_input.json
```

## Input File Format

Input files are JSON files located in `test/inputs/`. They use the same field names as the circuit inputs, with hex strings (starting with `0x`) that are automatically converted to decimal for Circom.

### Example: `test/inputs/entry_input.json`

```json
{
  "user_key": "0x1234567890abcdef",
  "token_address": "0x02",
  "chain_id": "0x01"
}
```

### Example: `test/inputs/deposit_input.json`

```json
{
  "user_key": "0x19e573f3801c7b2e4619998342e8e305e1692184cbacd220c04198a04c36b7d2",
  "token_address": "0x7775e4b6f4d40be537b55b6c47e09ada0157bd",
  "amount": "0x32",
  "chain_id": "0x01",
  "previous_nonce": "0x03",
  "previous_shares": "0x00",
  "nullifier": "0x00",
  "previous_unlocks_at": "0x00",
  "previous_commitment_leaf": "0x09f59efd111368198f55c7ad63e48d65fe4389f089f6f11b472166794765e82d",
  "commitment_index": "0x03",
  "tree_depth": "0x02",
  "expected_root": "0x05b95e559549e14dbe0ae410a0d2382e184ec672a10206a554a44297a4f4010e",
  "merkle_proof": ["0x2d9ef1023cef3c2d6c293641045639a3e5b22bbfff248297c2fec63c210aa1c2", ...]
}
```

## Converting from Noir's Prover.toml

To convert a Noir `Prover.toml` to a Circom input JSON:

1. Copy the field names and values from `Prover.toml`
2. Create a JSON file with the same structure
3. Keep hex strings as-is (they'll be converted automatically)
4. Arrays in `Prover.toml` become JSON arrays

**Noir Prover.toml:**
```toml
user_key = "0x1234567890abcdef"
token_address = "0x02"
chain_id = "0x01"
```

**Circom input.json:**
```json
{
  "user_key": "0x1234567890abcdef",
  "token_address": "0x02",
  "chain_id": "0x01"
}
```

## Test Scripts

All test scripts follow the same pattern:

1. Load the compiled WASM and witness calculator
2. Read input JSON (or use defaults)
3. Convert hex strings to decimal
4. Calculate witness
5. Extract and display outputs
6. Perform basic assertions

### Available Test Scripts

#### Individual Circuit Tests
- `test/scripts/test_entry.js` - Entry circuit test
- `test/scripts/test_deposit.js` - Deposit circuit test (uses synthetic data)
- `test/scripts/test_withdraw.js` - Withdraw circuit test (uses synthetic data)
- `test/scripts/test_send.js` - Send circuit test (uses synthetic data)
- `test/scripts/equivalence_test.js` - Poseidon2 equivalence test

#### Full Flow Tests (Recommended)
- `test/scripts/test_entry_deposit_flow.js` - Entry → Deposit flow
  - Runs entry circuit → builds tree → runs deposit circuit
  - Uses Baby Jubjub generators (circomlib standard) throughout
  - Generates valid test data
  
- `test/scripts/test_entry_withdraw_flow.js` - Entry → Deposit → Withdraw flow
  - Runs entry → deposit → withdraw in sequence
  - Builds Merkle tree incrementally
  - All using Baby Jubjub generators (circomlib standard)
  
- `test/scripts/test_entry_send_flow.js` - Entry → Send flow
  - Runs entry → send in sequence
  - Builds Merkle tree
  - All using Baby Jubjub generators (circomlib standard)

#### Helper Scripts
- `test/scripts/poseidon2_hash_helper.js` - Poseidon2Hash2 helper
- `test/scripts/lean_imt_helpers.js` - Lean-IMT tree operations

## Output Format

Test scripts output:
- Input values (converted to decimal)
- Output values (all circuit outputs)
- Basic validation results

Example output:

```
═══════════════════════════════════════════════════════════════
      TEST: Entry Circuit
═══════════════════════════════════════════════════════════════

Input:
{
  "user_key": "1311768467463790320",
  "token_address": "2",
  "chain_id": "1"
}

Outputs:
  balance_commitment: [1234567890..., 9876543210...]
  nonce_commitment: 5555555555...
  nonce_discovery_entry: [1111111111..., 2222222222...]

✅ Entry circuit test passed!
```

## Troubleshooting

### "WASM file not found"
Make sure you've compiled the circuit first:
```bash
pnpm run compile:entry  # or compile:deposit, compile:withdraw, compile:send
```

### "Witness calculator not found"
The witness calculator is generated during compilation. Recompile the circuit.

### "Assert Failed" errors in deposit/withdraw/send

These circuits verify that the reconstructed previous commitment matches the provided `previous_commitment_leaf`. If you get assertion failures:

1. **Invalid test data**: The test inputs don't represent a valid previous state. The `previous_commitment_leaf` must match the hash of the reconstructed Pedersen commitment.

2. **Solution - Use Flow Tests**:
   - **Use the flow tests instead**: `pnpm run test:entry-deposit-flow`, `test:entry-withdraw-flow`, `test:entry-send-flow`
   - These tests chain circuits together and build valid Merkle trees using Baby Jubjub generators (circomlib standard)
   - They generate valid test data automatically

3. **Why individual tests fail**:
   - The test data in `test/inputs/` is synthetic and may not represent valid states
   - Noir uses Grumpkin generators, Circom uses Baby Jubjub generators - outputs don't match
   - You need data generated with the same generators as the circuit

4. **Manual fix** (if needed):
   - Run `entry` circuit → get `balance_commitment`
   - Hash `balance_commitment` with `Poseidon2Hash2` → this is the `previous_commitment_leaf`
   - Use that leaf in a Merkle tree → get `expected_root` and `merkle_proof`
   - Use all these values as inputs to `deposit`/`withdraw`/`send`

### Output values don't match expected
- Check that input values match the Noir `Prover.toml` exactly
- Verify the circuit was compiled with the latest code
- Ensure all libraries are built (`pnpm run build:all`)
- For deposit/withdraw/send: ensure `previous_commitment_leaf` matches the reconstructed commitment
