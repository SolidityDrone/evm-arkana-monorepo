use dep::poseidon::poseidon2::Poseidon2;
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
mod test;

/// Entry circuit for initializing a new note in the Arkana system
pub fn main(
    user_key: Field,
    token_address: pub Field,
    chain_id: pub Field
) -> pub ([Field; 2], Field, [Field; 2]) {
    // Nonce is always 0 for entry circuit
    let nonce = 0 as Field;
    
    // Hash the user key with chain_id and token_address to prevent cross-chain/token overlap
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    
    // Calculate nonceCommitment = hash(spending_key, nonce, token_address)
    // token_address is used as a factor here
    let nonce_commitment = Poseidon2::hash([spending_key, nonce, token_address], 3);
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=0 (shares), m2=0 (nullifier), m3=spending_key, m4=0 (unlocks_at), r=nonce_commitment
    let balance_commitment = pedersen_commitment_5(
        0, // shares to be written by contract
        0, // nullifier
        spending_key,
        0, // unlocks_at to be written by contract
        nonce_commitment 
    );
    
    // will be used to discover tx info with oblivious transfer like approach
    let nonce_discovery_entry = pedersen_commitment(1, nonce_commitment);
    
    (
        [balance_commitment.x, balance_commitment.y],  // Pedersen commitment point
        nonce_commitment,
        [nonce_discovery_entry.x, nonce_discovery_entry.y]
    )
}
