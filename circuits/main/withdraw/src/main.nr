use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::{poseidon_ctr_encrypt};
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use dep::lean_imt_verify::lean_imt_verify::verify_merkle_proof;
mod test;
use dep::std::field::bn254::{lt,gt};

// === ARKANA-WITHDRAW CIRCUIT ===

global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;

// === UNLOCKS_AT PACKING/UNPACKING ===
// unlocks_at encodes 2 values in a Field (254 bits):
// - Last 24 bits: unlocks_at (timestamp when it can be used)
// - Next 24 bits: lock_timer (duration in seconds)
// Format: 0xlock_timer000unlocks_at

global UNLOCKS_AT_MASK: Field = 0xffffff; // 24 bits mask for unlocks_at (16777215)
global LOCK_TIMER_SHIFT_POWER: Field = 0x1000000; // 2^24 = 16777216




/// Withdraw circuit: Proves user can withdraw from their balance
fn main(
    user_key: Field,
    token_address: pub Field,
    amount: pub Field,
    chain_id: pub Field,
    previous_nonce: Field,
    previous_shares: Field,
    nullifier: Field,
    previous_unlocks_at: Field,  // Packed: lock_timer << 24 | unlocks_at
    declared_time_reference: pub Field,  // Private: time reference for withdrawal validation
    
    // Merkle proof for previous commitment leaf
    previous_commitment_leaf: Field,
    commitment_index: Field,
    tree_depth: Field,
    expected_root: pub Field,
    merkle_proof: [Field; 32],
    
    // Public withdrawal parameters
    arbitrary_calldata_hash: pub Field, // this will serve to attach extra calldata to proof 
    receiver_address: pub Field,
    relayer_fee_amount: pub Field,
) -> pub ([Field; 2], Field, [Field; 2], [Field; 2],  Field, Field) {
    
    // === TL SWAP HASH CHAIN VERIFICATION ===
    // When is_tl_swap = true, we build a hash chain to ensure:
    // 1. The sum of chunks equals the total amount
    // 2. The order of chunks is fixed (prevents reordering)
    // 3. Each chunk can only be used once
    // Hash chain: h0 = hash(0, totalShares), h1 = hash(h0, s1), h2 = hash(h1, s2), ..., h10 = hash(h9, s10)

    
    // === SETUP ===
    // Hash user_key with chain_id and token_address to prevent cross-chain/token overlap
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let view_key = Poseidon2::hash([VIEW_STRING, user_key], 2);
    
    // Calculate previous_nonce_commitment from available parameters
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    
    // === VERIFY PREVIOUS COMMITMENT OPENING ===
    // Reconstruct previous Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=previous_shares, m2=nullifier, m3=spending_key, m4=previous_unlocks_at, r=previous_nonce_commitment
    let previous_commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    
    // Hash the Pedersen commitment point to get the leaf
    let previous_commitment_leaf_computed = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Verify computed leaf matches the provided leaf
    assert(previous_commitment_leaf_computed == previous_commitment_leaf, "Previous commitment leaf mismatch");
    
    // === MERKLE PROOF VERIFICATION ===
    // Verify that previous_commitment_leaf exists in the merkle tree at the given index
    // Note: The verification function handles tree_depth internally and will fail if depth is invalid
    verify_merkle_proof(
        previous_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof
    );
    
    // === VERIFY WITHDRAWAL TIME CONSTRAINT ===
    // Extract unlocks_at from previous_unlocks_at (packed format)
    let (_, unlocks_at) = unpack_unlocks_at(previous_unlocks_at);
    
    // Verify that declared_time_reference >= unlocks_at (withdrawal is allowed)
    // This ensures the user can only withdraw after the unlock time

    assert(gt(declared_time_reference, unlocks_at), "Withdrawal not yet allowed: time < unlocks_at");
    
    // === CALCULATE NEW NONCE ===
    let nonce = previous_nonce + 1 as Field;
    // new nonceCommitment includes token_address as a factor (matching entry circuit)
    let new_nonce_commitment = Poseidon2::hash([spending_key, nonce as Field, token_address], 3);
    
    // === CREATE NEW PEDERSEN COMMITMENT ===
    // New commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=new_shares_balance (calculated in circuit: previous_shares - amount - relayer_fee_amount), 
    //       m2=nullifier (unchanged),
    //       m3=spending_key (unchanged),
    //       m4=previous_unlocks_at (unchanged - withdraw doesn't change lock),
    //       r=new_nonce_commitment (updated)
    // Circuit calculates new_shares_balance directly, contract uses commitment as-is
    // Ensure we have enough shares to withdraw (prevent underflow)
    // Check: previous_shares >= amount + relayer_fee_amount
    let total_to_withdraw = amount + relayer_fee_amount;
    assert(!lt(previous_shares, total_to_withdraw), "Insufficient shares for withdrawal");
    let new_shares_balance = previous_shares - total_to_withdraw;
    let new_commitment_point = pedersen_commitment_5(new_shares_balance, nullifier, spending_key, previous_unlocks_at, new_nonce_commitment);
    
    // Encrypt state details for viewing (separate from commitment)
    // Encrypt new_shares_balance (already calculated above) - contract uses this directly
    let encrypted_state_details = [
        poseidon_ctr_encrypt(new_shares_balance, view_key, 0),
        poseidon_ctr_encrypt(nullifier, view_key, 1),
    ];

    // Calculate nonce discovery entry using Pedersen commitment
    let nonce_discovery_entry = pedersen_commitment(1, new_nonce_commitment);


    (
        [new_commitment_point.x, new_commitment_point.y], 
        new_nonce_commitment,
        encrypted_state_details,
        [nonce_discovery_entry.x, nonce_discovery_entry.y]
    )
}


// === DRAND TIMELOCK KDF ===
// Derives encryption key from pairing result using Poseidon2
// Must match the KDF in timelock-prep.js
fn timelock_kdf(pairing_result: Field) -> Field {
    Poseidon2::hash([pairing_result], 1)
}

/// Unpack unlocks_at Field into lock_timer and unlocks_at
/// @param packed: Packed Field containing lock_timer and unlocks_at
/// @return (lock_timer, unlocks_at): Both as 24-bit values
fn unpack_unlocks_at(packed: Field) -> (Field, Field) {
    // Extract unlocks_at (last 24 bits) by casting to u128, doing modulo, then casting back
    let mask_plus_one = UNLOCKS_AT_MASK + 1;
    let packed_u128 = packed as u128;
    let mask_plus_one_u128 = mask_plus_one as u128;
    
    let unlocks_at = (packed_u128 % mask_plus_one_u128) as Field;
    
    // Extract lock_timer (next 24 bits) by dividing and taking modulo
    let packed_shifted = packed / LOCK_TIMER_SHIFT_POWER;
    let packed_shifted_u128 = packed_shifted as u128;
    let lock_timer = (packed_shifted_u128 % mask_plus_one_u128) as Field;
    
    (lock_timer, unlocks_at)
}
