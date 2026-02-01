use dep::std::field::bn254::gt;
use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::{poseidon_ctr_encrypt};
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use dep::lean_imt_verify::lean_imt_verify::verify_merkle_proof;
mod test;

// === ARKANA-ABSORB CIRCUIT ===

global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;

/// Absorb circuit: Absorb incoming notes into personal balance
/// Returns: (new_nonce_commitment, new_commitment, encrypted_state_details, nonce_discovery_entry)
fn main(
    // Private inputs
    user_key: Field,
    previous_nonce: Field, 
    current_balance: Field,
    nullifier: Field,
    previous_unlocks_at: Field,  // Must be 0 (absorb disabled for locked funds)
    
    // Merkle proof inputs for previous commitment
    previous_commitment: Field,
    commitment_index: Field,
    tree_depth: Field,
    expected_root: pub Field,
    merkle_proof: [Field; 32],
    
    // Note stack Pedersen commitment and openings, these are to be checked on contract 
    note_stack_x: pub Field,  // Public: x coordinate of note_stack commitment point
    note_stack_y: pub Field,  // Public: y coordinate of note_stack commitment point
    note_stack_m: Field,      // Private: opening value m (aggregated amount)
    note_stack_r: Field,      // Private: opening value r (sum of all shared keys)
    
    // Merkle proof inputs for note_stack (same tree, different leaf)
    note_stack_commitment_index: Field,
    note_stack_merkle_proof: [Field; 32],
    
    // Public absorb parameters
    token_address: pub Field,
    chain_id: pub Field,
    relayer_fee_amount: pub Field
) -> pub (Field, Field, [Field; 2], [Field; 2]) {
    
    // === STEP 1: Derive keys ===
    // Hash user_key with chain_id and token_address to prevent cross-chain/token overlap
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let view_key = Poseidon2::hash([VIEW_STRING, user_key], 2);
    
    // === CHECK UNLOCKS_AT ===
    // Absorb is disabled if previous_unlocks_at is not zero (funds are locked)
    // This prevents AnonymityProviders (who have locked funds) from absorbing
    assert(previous_unlocks_at == 0, "Absorb is disabled when funds are locked (previous_unlocks_at != 0)");
    
    // === STEP 2: Reconstruct and verify previous commitment ===
    // Calculate previous_nonce_commitment from available parameters
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    
    // Reconstruct previous Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=current_balance, m2=nullifier, m3=spending_key, m4=previous_unlocks_at, r=previous_nonce_commitment
    let previous_commitment_point = pedersen_commitment_5(current_balance, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    
    // Hash the Pedersen commitment point to get the leaf
    let previous_commitment_leaf_computed = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Verify computed leaf matches the provided leaf
    assert(previous_commitment_leaf_computed == previous_commitment, "Previous commitment leaf mismatch");
    
    // === STEP 3: Verify previous commitment exists in tree ===
    verify_merkle_proof(
        previous_commitment,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof
    );
    
    // === STEP 4: Verify note_stack Pedersen commitment ===
    // Reconstruct the Pedersen commitment from openings (2 factors: m and r)
    let reconstructed_note_stack = pedersen_commitment(note_stack_m, note_stack_r);
    
    // Verify the reconstructed point matches the provided note_stack point
    assert(reconstructed_note_stack.x == note_stack_x, "Note stack x coordinate mismatch");
    assert(reconstructed_note_stack.y == note_stack_y, "Note stack y coordinate mismatch");
    
    // === STEP 5: Verify note_stack is in Merkle tree ===
    // Hash the note_stack point to get a leaf value for the Merkle tree
    let note_stack_leaf = Poseidon2::hash([note_stack_x, note_stack_y], 2);
    
    // Verify note_stack is in the same tree (same depth and root)
    verify_merkle_proof(
        note_stack_leaf,
        note_stack_commitment_index,
        tree_depth,
        expected_root,
        note_stack_merkle_proof
    );
    
    // === STEP 6: Check balance and calculate new balance ===
    // Use note_stack_m as the absorbed amount (verified via Pedersen commitment)
    let absorbed_amount = note_stack_m;
    
    // Fee is always paid in the same token as the absorbed amount
    // Verify sufficient balance (current + absorbed) to cover the fee
    // Use gt(a + 1, b) instead of gt(a, b - 1) to avoid underflow when b = 0
    // This is equivalent to checking: current_balance + absorbed_amount >= relayer_fee_amount
    assert(gt(current_balance + absorbed_amount + 1, relayer_fee_amount), "Insufficient balance for fee (including absorbed amount)");
    
    // Calculate new balance: current + absorbed - fee
    let new_balance = current_balance + absorbed_amount - relayer_fee_amount;
    
    // === STEP 7: Update nullifier ===
    // Increase nullifier by absorbed amount (tracks balance spent from notes)
    let new_nullifier = nullifier + absorbed_amount;
    
    // === STEP 8: Create new commitment ===
    let nonce = previous_nonce + 1;
    let new_nonce_commitment = Poseidon2::hash([spending_key, nonce, token_address], 3);
    
    // Create new Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=new_balance, m2=new_nullifier, m3=spending_key, m4=previous_unlocks_at (0 for absorb), r=new_nonce_commitment
    let new_commitment_point = pedersen_commitment_5(new_balance, new_nullifier, spending_key, previous_unlocks_at, new_nonce_commitment);
    
    // Hash the Pedersen commitment point to get the leaf
    let new_commitment = Poseidon2::hash([new_commitment_point.x, new_commitment_point.y], 2);
    
    // === STEP 9: Encrypt operation details ===
    let encrypted_state_details = [
        poseidon_ctr_encrypt(new_balance, view_key, 0),
        poseidon_ctr_encrypt(new_nullifier, view_key, 1),
    ];
    
    // === STEP 10: Generate nonce discovery entry ===
    let nonce_discovery_entry = pedersen_commitment(1, new_nonce_commitment);
    
    (    
        new_nonce_commitment,
        new_commitment,
        encrypted_state_details,
        [nonce_discovery_entry.x, nonce_discovery_entry.y]
    )

}