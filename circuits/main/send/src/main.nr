use dep::std::field::bn254::gt;
use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::{poseidon_ctr_encrypt};
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use dep::lean_imt_verify::lean_imt_verify::verify_merkle_proof;
use dep::dh_key_exchange::perform_dh_key_exchange;
mod test;

// === ARKANA-SEND CIRCUIT ===

global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;


pub fn main(
    user_key: Field,
    token_address: pub Field,
    amount: Field, 
    chain_id: pub Field,
    previous_nonce: Field,
    previous_shares: Field,
    nullifier: Field,
    previous_unlocks_at: Field,  // Must be 0 (send disabled for locked funds)
    
    // Merkle proof for previous commitment leaf
    previous_commitment_leaf: Field,
    commitment_index: Field,
    tree_depth: Field,
    expected_root: pub Field,
    merkle_proof: [Field; 32],
    
    // Public send parameters
    receiver_public_key: pub [Field; 2]
) -> pub (Field, Field, [Field; 3], [Field; 2], [Field; 2], [Field; 2]) {
    
    // === SETUP ===
    // Hash user_key with chain_id and token_address to prevent cross-chain/token overlap
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let view_key = Poseidon2::hash([VIEW_STRING, user_key], 2);
    
    // === CHECK UNLOCKS_AT ===
    // Send is disabled if previous_unlocks_at is not zero (funds are locked)
    // This prevents AnonymityProviders (who have locked funds) from sending
    assert(previous_unlocks_at == 0, "Send is disabled when funds are locked (previous_unlocks_at != 0)");
    
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
    
    // === CALCULATE NEW SHARES ===
    // For send, amount is already in shares
    // Verify sufficient shares
    assert(gt(previous_shares, amount - 1), "Insufficient shares for send");
    
    // Calculate new shares
    let new_shares = previous_shares - amount;
    
    // === CALCULATE NEW NONCE ===
    let nonce = previous_nonce + 1 as Field;
    // new nonceCommitment includes token_address as a factor (matching entry circuit)
    let new_nonce_commitment = Poseidon2::hash([spending_key, nonce as Field, token_address], 3);
    
    // === CREATE NEW PEDERSEN COMMITMENT ===
    // New commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=new_shares, m2=nullifier, m3=spending_key, m4=previous_unlocks_at (unchanged), r=new_nonce_commitment
    let new_commitment_point = pedersen_commitment_5(new_shares, nullifier, spending_key, previous_unlocks_at, new_nonce_commitment);
    
    // Hash the new Pedersen commitment point to create the leaf (done in circuit, not contract)
    let new_commitment_leaf = Poseidon2::hash([new_commitment_point.x, new_commitment_point.y], 2);
    
    // === PERFORM DIFFIE-HELLMAN KEY EXCHANGE ===
    let sender_private_key = user_key + nonce;
    let (sender_pub_key, shared_key) = perform_dh_key_exchange(sender_private_key, receiver_public_key);
    let shared_key_hash = Poseidon2::hash([shared_key], 1);
    
    // === ENCRYPT OPERATION DETAILS ===
    // For encryption, we use new_shares directly (since we're tracking shares now)
    // The amount is also in shares
    let encrypted_note = encrypt_operation_details(
        new_shares,  // Use shares instead of balance
        nullifier,
        spending_key,  
        shared_key_hash,
        amount  // amount is in shares
    );
    
    // === CREATE PEDERSEN COMMITMENT FOR RECEIVER'S NOTE ===
    // Note commitment: amount*G + shared_key*D (2 generators only)
    let note_commitment = pedersen_commitment(amount, shared_key_hash);
    
    // === GENERATE NONCE DISCOVERY ENTRY ===
    let nonce_discovery_entry = pedersen_commitment(1, new_nonce_commitment);
    
    (
        new_commitment_leaf,  // Leaf hash (hashed in circuit)
        new_nonce_commitment,
        encrypted_note,
        sender_pub_key,
        [nonce_discovery_entry.x, nonce_discovery_entry.y],
        [note_commitment.x, note_commitment.y]
    )
}

/// Encrypt operation details for both receiver and sender
fn encrypt_operation_details(
    new_balance: Field,
    nullifier: Field,
    view_key: Field,
    shared_key_hash: Field,
    amount: Field
) -> [Field; 3] {
    // Encrypt for receiver's note (using shared_key_hash)
    let encrypted_amount_for_receiver = poseidon_ctr_encrypt(amount, shared_key_hash, 0);
    // Encrypt for sender's balance tracking (using view_key directly)
    let encrypted_balance_for_sender = poseidon_ctr_encrypt(new_balance, view_key, 1);
    let encrypted_nullifier_for_sender = poseidon_ctr_encrypt(nullifier, view_key, 2);

    // Return: [receiver_note_amount, sender_balance, sender_nullifier]
    [
        encrypted_amount_for_receiver,
        encrypted_balance_for_sender,
        encrypted_nullifier_for_sender
    ]
}
