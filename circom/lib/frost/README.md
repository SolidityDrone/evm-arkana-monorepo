# FROST (RFC 9591) helper for Arkana

Uses **@substrate-system/frost** for Ed25519 threshold key generation (e.g. **3-of-5**). The circuits (entry, deposit, withdraw, send) verify **Baby Jubjub EdDSA**, so this helper:

1. Runs FROST key generation → group public key + key packages.
2. **Derives** a Baby Jubjub signer from the group public key (SHA256 of group key → 32-byte seed → Baby Jubjub key). That gives:
   - `signer_pubkey_hash` = Poseidon2Hash2(Ax, Ay) for use in entry/deposit/withdraw/send.
   - `signer_public_key` = [Ax, Ay] and the same key can sign withdraw/send messages so the circuit’s `EdDSAPoseidonVerifier` passes.

So the **identity** committed in the note is tied to the FROST group key; the **signature** for spend is still a single Baby Jubjub EdDSA signature from that derived key.

To get **threshold signing inside the circuit** (3-of-5 Ed25519 signature verified on-chain), you’d need an Ed25519 verifier in Circom and to commit `signer_pubkey_hash = hash(Ed25519_group_pubkey)` instead of the Baby Jubjub hash.

## API

- **`getFrostSignerIdentity()`**  
  Returns: `{ config, groupPublicKey, keyPackages, signer_pubkey_hash, signer_public_key, derivedPrivKeyHex }` for 3-of-5.

- **`signWithdrawMessageFrost(..., current_nonce)`**  
  Same semantics as `eddsa_helper.signWithdrawMessage`: Poseidon(5)(..., current_nonce). Pass previous_nonce + 1 as current_nonce for the circuit input.

- **`frostThresholdSign(keyPackages, messageBytes, groupPublicKey, config)`**  
  Produces Ed25519 threshold signature over raw bytes (for use outside the circuit).

## Test

From repo root:

```bash
npm run test:frost-withdraw
```

Or:

```bash
node test/scripts/test_frost_entry_withdraw_flow.js
```

Requires circuits built (e.g. `npm run compile:all`) and `@substrate-system/frost` installed.
