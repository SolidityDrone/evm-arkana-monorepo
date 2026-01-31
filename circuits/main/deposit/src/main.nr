use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::{poseidon_ctr_encrypt};
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use dep::lean_imt_verify::lean_imt_verify::verify_merkle_proof;

// === ARKANA-DEPOSIT CIRCUIT ===

global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;

/// Deposit circuit for adding funds to an existing note in the Arkana 
fn main(
    user_key: Field,
    token_address: pub Field,
    amount: pub Field,
    chain_id: pub Field,
    previous_nonce: Field,
    previous_shares: Field,
    nullifier: Field,
    previous_unlocks_at: Field,  // Must be 0 (deposit disabled for locked funds)
    
    // Merkle proof for previous commitment leaf
    previous_commitment_leaf: Field,
    commitment_index: Field,
    tree_depth: Field,
    expected_root: pub Field,
    merkle_proof: [Field; 32],
) -> pub ([Field; 2], [Field; 2], [Field; 2], Field) {
    
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
    verify_merkle_proof(
        previous_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof
    );
    
    // === CHECK UNLOCKS_AT ===
    // Deposit is disabled if previous_unlocks_at is not zero (funds are locked)
    // This prevents AnonymityProviders (who have locked funds) from depositing
    assert(previous_unlocks_at == 0, "Deposit is disabled when funds are locked (previous_unlocks_at != 0)");
    
    // === CALCULATE NEW NONCE ===
    let nonce = previous_nonce + 1 as Field;
    // new nonceCommitment includes token_address as a factor (matching entry circuit)
    let new_nonce_commitment = Poseidon2::hash([spending_key, nonce as Field, token_address], 3);
    
    // === CREATE NEW PEDERSEN COMMITMENT ===
    // New commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=previous_shares (unchanged - contract will add shares_from_deposit*G), 
    //       m2=nullifier (unchanged),
    //       m3=spending_key (unchanged),
    //       m4=previous_unlocks_at (unchanged - deposit doesn't change lock time),
    //       r=new_nonce_commitment (updated)
    // Contract will: add shares_from_deposit*G, then hash the result
    let new_commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, previous_unlocks_at, new_nonce_commitment);
    
    // Encrypt state details for viewing (separate from commitment)
    // Note: We encrypt previous_shares (current shares before deposit)
    // Contract will update this with new_shares after adding shares_from_deposit
    let encrypted_state_details = [
        poseidon_ctr_encrypt(previous_shares, view_key, 0),
        poseidon_ctr_encrypt(nullifier, view_key, 1),
    ];

    // Calculate nonce discovery entry using Pedersen commitment
    let nonce_discovery_entry = pedersen_commitment(1, new_nonce_commitment);
    
    (
        [new_commitment_point.x, new_commitment_point.y],  // Pedersen commitment point (contract will add shares*G)
        encrypted_state_details,
        [nonce_discovery_entry.x, nonce_discovery_entry.y],
        new_nonce_commitment
    )
}



