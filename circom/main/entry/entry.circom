pragma circom 2.0.0;

include "../../lib/poseidon/poseidon2.circom";
include "../../lib/pedersen-commitments/pedersen_commitments.circom";

/// Entry circuit for initializing a new note in the Arkana system
/// Matches circuits/main/entry/src/main.nr
template Entry() {
    // Private inputs
    signal input user_key;
    
    // Public inputs
    signal input token_address;
    signal input chain_id;
    
    // Public outputs
    signal output balance_commitment[2];  // Pedersen commitment point [x, y]
    signal output nonce_commitment;
    signal output nonce_discovery_entry[2];  // Pedersen commitment point [x, y]
    
    // Nonce is always 0 for entry circuit
    signal nonce;
    nonce <== 0;
    
    // Hash the user key with chain_id and token_address to prevent cross-chain/token overlap
    component spending_key_hash = Poseidon2Hash3();
    spending_key_hash.in[0] <== user_key;
    spending_key_hash.in[1] <== chain_id;
    spending_key_hash.in[2] <== token_address;
    signal spending_key;
    spending_key <== spending_key_hash.out;
    
    // Calculate nonceCommitment = hash(spending_key, nonce, token_address)
    // token_address is used as a factor here
    component nonce_commitment_hash = Poseidon2Hash3();
    nonce_commitment_hash.in[0] <== spending_key;
    nonce_commitment_hash.in[1] <== nonce;
    nonce_commitment_hash.in[2] <== token_address;
    nonce_commitment <== nonce_commitment_hash.out;
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=1 (represents 0 shares), m2=1 (represents 0 nullifier), m3=spending_key, m4=1 (represents 0 unlocks_at), r=nonce_commitment
    // We use 1 instead of 0 to avoid computing 0*G (point at infinity)
    component balance_commit = PedersenCommitment5();
    balance_commit.m1 <== 1;  // shares: 1 represents 0 (to be written by contract)
    balance_commit.m2 <== 1;  // nullifier: 1 represents 0
    balance_commit.m3 <== spending_key;
    balance_commit.m4 <== 1;  // unlocks_at: 1 represents 0 (to be written by contract)
    balance_commit.r <== nonce_commitment;
    balance_commitment[0] <== balance_commit.commitment[0];
    balance_commitment[1] <== balance_commit.commitment[1];
    
    // Will be used to discover tx info with oblivious transfer like approach
    // OPTIMIZATION: Use PedersenCommitment2FixedM1 since m=1 always
    component nonce_discovery = PedersenCommitment2FixedM1();
    nonce_discovery.r <== nonce_commitment;
    nonce_discovery_entry[0] <== nonce_discovery.commitment[0];
    nonce_discovery_entry[1] <== nonce_discovery.commitment[1];
}

component main = Entry();

