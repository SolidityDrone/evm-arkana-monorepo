# Circom Circuit Testing

This directory contains test scripts for all Circom circuits.

## Structure

```
test/
├── scripts/              # Test scripts
│   ├── test_entry.js                    # Entry circuit test
│   ├── test_entry_deposit_flow.js       # Entry → Deposit flow
│   ├── test_entry_withdraw_flow.js      # Entry → Deposit → Withdraw flow
│   ├── test_entry_send_flow.js          # Entry → Send flow
│   ├── test_absorb_send.js              # Entry → Send → Absorb-Send flow
│   ├── test_absorb_withdraw.js          # Entry → Send → Absorb-Withdraw flow
│   ├── equivalence_test.js              # Poseidon2 equivalence test
│   ├── generate_and_verify_entry_proof.js  # Generate entry proof example
│   ├── generate_all_proofs.js           # Generate all proofs for Solidity
│   ├── poseidon2_hash_helper.js         # Poseidon2 hash helpers
│   ├── lean_imt_helpers.js              # Lean-IMT tree helpers
│   └── babyjub_operations.js            # Baby Jubjub operations
├── circuits/            # Test circuits (for equivalence_test.js)
│   └── poseidon2_test*.circom
└── README.md            # This file
```

## Quick Start

### 1. Build and Compile

```bash
npm run build:all      # Generate libraries (Poseidon2, Lean-IMT)
npm run compile:all    # Compile all circuits
```

### 2. Run Tests

#### Individual Circuit Tests

```bash
npm run test:entry     # Test entry circuit
npm run test:deposit   # Test deposit circuit (Entry → Deposit flow)
npm run test:withdraw  # Test withdraw circuit (Entry → Deposit → Withdraw flow)
npm run test:send      # Test send circuit (Entry → Send flow)
npm run test:poseidon2 # Test Poseidon2 library
```

#### Full Flow Tests

```bash
npm run test:entry-deposit-flow    # Entry → Deposit flow
npm run test:entry-withdraw-flow   # Entry → Deposit → Withdraw flow
npm run test:entry-send-flow       # Entry → Send flow
npm run test:absorb-send           # Entry → Send → Absorb-Send flow
npm run test:absorb-withdraw       # Entry → Send → Absorb-Withdraw flow
npm run test:all-flows             # Run all flow tests
```

#### Generate Proofs

```bash
npm run prove:entry    # Generate and verify entry proof
npm run prove:all       # Generate all proofs for Solidity testing
```

## Test Scripts

### Main Circuit Tests

- **`test_entry.js`** - Standalone entry circuit test
- **`test_entry_deposit_flow.js`** - Entry → Deposit flow (used by `test:deposit`)
- **`test_entry_withdraw_flow.js`** - Entry → Deposit → Withdraw flow (used by `test:withdraw`)
- **`test_entry_send_flow.js`** - Entry → Send flow (used by `test:send`)
- **`test_absorb_send.js`** - Entry → Send → Absorb-Send flow
- **`test_absorb_withdraw.js`** - Entry → Send → Absorb-Withdraw flow

### Helper Scripts

- **`poseidon2_hash_helper.js`** - Poseidon2 hash functions (Hash1, Hash2, Hash3)
- **`lean_imt_helpers.js`** - Lean-IMT Merkle tree operations
- **`babyjub_operations.js`** - Baby Jubjub curve operations

### Proof Generation

- **`generate_and_verify_entry_proof.js`** - Example of generating and verifying a proof
- **`generate_all_proofs.js`** - Generate proofs for all circuits and output JSON for Solidity testing

### Library Tests

- **`equivalence_test.js`** - Tests Poseidon2 hash equivalence

## Flow Tests vs Individual Tests

**Flow tests are recommended** because they:
- Chain circuits together to build valid Merkle trees
- Use consistent Baby Jubjub generators throughout
- Generate valid test data automatically
- Match real-world usage patterns

Individual circuit tests (`test:entry`) work standalone, but other circuits require valid Merkle proofs from previous operations, which flow tests provide.

## Output Format

Test scripts output:
- Input values (converted to decimal)
- Output values (all circuit outputs)
- Basic validation results

## Troubleshooting

### "WASM file not found"
Compile the circuit first:
```bash
npm run compile:entry  # or compile:deposit, compile:withdraw, etc.
```

### "Assert Failed" errors
- Use flow tests instead of individual tests
- Flow tests generate valid Merkle proofs automatically
- Individual tests may fail with synthetic data

### "Zkey not found" (for proof generation)
Build verifiers first:
```bash
./scripts/build_verifiers.sh
```

## See Also

- `test/scripts/README_PROOF_GENERATION.md` - Proof generation guide
- `test/scripts/README_PROOF_GENERATION_ALL.md` - Generate all proofs guide
