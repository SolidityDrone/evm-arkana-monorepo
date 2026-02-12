# Entry Circuit

Entry circuit for initializing a new note in the Arkana system.

## Status

✅ **Circuit complete and working**

✅ **Pedersen commitments implemented** - Using Baby Jubjub curve (circomlib)

## Circuit Description

Matches `circuits/main/entry/src/main.nr`:

1. **Inputs:**
   - `user_key` (private) - User's private key
   - `token_address` (public) - Token address
   - `chain_id` (public) - Chain ID

2. **Outputs:**
   - `balance_commitment[2]` - Pedersen commitment point [x, y] for balance
   - `nonce_commitment` - Hash commitment for nonce
   - `nonce_discovery_entry[2]` - Pedersen commitment point [x, y] for nonce discovery

3. **Operations:**
   - Computes `spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3)`
   - Computes `nonce_commitment = Poseidon2::hash([spending_key, 0, token_address], 3)`
   - Creates 5-generator Pedersen commitment: `0*G + 0*H + spending_key*D + 0*K + nonce_commitment*J`
   - Creates 2-generator Pedersen commitment: `1*G + nonce_commitment*H` (for nonce discovery)

## Compilation

```bash
circom main/entry/entry.circom --r1cs --wasm --sym --c -o main/entry/
```

## Implementation Details

- **Pedersen Commitments:** Uses Baby Jubjub curve (embedded in Fr, BN254 scalar field)
- **Generators:** Uses circomlib's standard Pedersen generators
- **Operations:** Uses `EscalarMulAny` and `BabyAdd` from circomlib for efficient curve operations

## Testing

The circuit is fully tested and working:
- ✅ Entry circuit test passes
- ✅ Entry → Deposit flow test passes
- ✅ Entry → Deposit → Withdraw flow test passes
- ✅ Entry → Deposit → Send flow test passes


