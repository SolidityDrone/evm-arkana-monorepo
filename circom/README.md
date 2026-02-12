# Arkana Circom2 Circuits

This directory contains the Circom2 implementation of the Arkana protocol circuits, ported from Noir.

## Structure

```
circom/
├── lib/                    # Library circuits
│   ├── poseidon/          # Poseidon2 hash function
│   ├── poseidon-ctr-encryption/  # CTR mode encryption
│   ├── pedersen-commitments/     # Pedersen commitments (Baby Jubjub)
│   ├── dh-key-exchange/          # Diffie-Hellman over Baby Jubjub
│   ├── lean-imt-verify/          # Lean-IMT merkle proof verification
│   └── utils/                    # Utility templates
├── main/                   # Main circuits
│   ├── entry/             # Entry circuit (initialize note)
│   ├── deposit/           # Deposit circuit
│   ├── withdraw/          # Withdraw circuit
│   └── send/              # Send circuit
├── test/                   # Tests
│   ├── circuits/          # Test circuit files
│   └── scripts/           # Test scripts
├── build/                  # Compiled artifacts (gitignored)
└── node_modules/          # Dependencies
```

## Setup

```bash
# Install dependencies
pnpm install

# Generate required circuit files
pnpm run build:all
```

## Building Circuits

### Generate Library Circuits

Some libraries require code generation:

```bash
# Generate Poseidon2 circuit
pnpm run build:poseidon2

# Generate Lean-IMT verify circuit
pnpm run build:lean-imt

# Generate all
pnpm run build:all
```

### Compile Main Circuits

```bash
# Compile individual circuits
pnpm run compile:entry
pnpm run compile:deposit
pnpm run compile:withdraw
pnpm run compile:send

# Compile all
pnpm run compile:all
```

Compiled artifacts will be in `build/` directory.

## Testing

```bash
# Run Poseidon2 equivalence tests
pnpm run test:poseidon2

# Run all tests
pnpm run test:all
```

## Libraries

### Poseidon2
- Location: `lib/poseidon/poseidon2.circom`
- Generator: `lib/poseidon/generate_poseidon2.js`
- Implements Poseidon2 hash with rate=3, capacity=1, 64 rounds

### Pedersen Commitments
- Location: `lib/pedersen-commitments/pedersen_commitments.circom`
- Supports 2 and 5-generator commitments
- Uses Baby Jubjub curve (embedded in Fr, BN254 scalar field)
- Uses circomlib's standard Pedersen generators

### Lean-IMT Verify
- Location: `lib/lean-imt-verify/lean_imt_verify.circom`
- Generator: `lib/lean-imt-verify/generate_lean_imt_verify.js`
- Verifies merkle proofs for lean incremental merkle trees

### Diffie-Hellman Key Exchange
- Location: `lib/dh-key-exchange/dh_key_exchange.circom`
- Performs DH key exchange over Baby Jubjub curve

## Main Circuits

### Entry
- Initializes a new note in the Arkana system
- Creates spending key, nonce commitment, and balance commitment

### Deposit
- Deposits funds into the system
- Verifies previous commitment and merkle proof
- Creates new commitment with updated nonce

### Withdraw
- Withdraws funds from the system
- Verifies time constraints (unlocks_at)
- Checks sufficient balance
- Creates new commitment with reduced shares

### Send
- Sends funds to another user
- Performs Diffie-Hellman key exchange
- Encrypts operation details
- Creates note commitment for receiver

## Cleanup

```bash
# Remove compiled artifacts
pnpm run clean

# Remove all artifacts including pnpm cache
pnpm run clean:all
```

## Notes

- All circuits use Baby Jubjub for Pedersen commitments (embedded in Fr, BN254 scalar field)
- Uses circomlib's standard Pedersen generators for compatibility
- Poseidon2 implementation matches Noir exactly (verified with equivalence tests)
- Generated circuits are committed to git for reproducibility
- Compiled artifacts are gitignored (use `build/` directory)
