pragma circom 2.0.0;

include "../../lib/poseidon/poseidon.circom";
include "../../lib/pedersen-commitments/pedersen_commitments.circom";

/// Entry circuit for initializing a new note in the Arkana system
template Entry() {
    // Private inputs
    signal input user_key;
    signal input signer_pubkey_hash;
    
    // Public inputs (declared public in main component below so they appear in verifier's public signals)
    signal input token_address;
    signal input chain_id;
    
    // Public outputs
    signal output balance_commitment[2];  // Pedersen commitment point [x, y]
    signal output nonce_commitment;
    signal output nonce_discovery_entry[2];  // Pedersen commitment point [x, y]
    
    // Nonce is always 0 for entry circuit
    signal nonce;
    nonce <== 0;
    
    // spending_key = Poseidon(user_key, chain_id, token_address, signer_pubkey_hash)
    component spending_key_hash = Poseidon2Hash4();
    spending_key_hash.in[0] <== user_key;
    spending_key_hash.in[1] <== chain_id;
    spending_key_hash.in[2] <== token_address;
    spending_key_hash.in[3] <== signer_pubkey_hash;
    signal spending_key;
    spending_key <== spending_key_hash.out;
    
    // view_key = Poseidon(VIEW_STRING, user_key) — used for nonce discovery (auditor can reconstruct positions)
    component view_key_hash = Poseidon2Hash2();
    view_key_hash.in[0] <== 143150966920908953357084025;  // VIEW_STRING
    view_key_hash.in[1] <== user_key;
    signal view_key;
    view_key <== view_key_hash.out;
    
    // nonceCommitment = hash(view_key, nonce, token_address) — derivable from view_key for discovery
    component nonce_commitment_hash = Poseidon2Hash3();
    nonce_commitment_hash.in[0] <== view_key;
    nonce_commitment_hash.in[1] <== nonce;
    nonce_commitment_hash.in[2] <== token_address;
    nonce_commitment <== nonce_commitment_hash.out;
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=0 (shares), m2=0 (nullifier), m3=spending_key, m4=0 (unlocks_at), r=nonce_commitment
    component balance_commit = PedersenCommitment5();
    balance_commit.m1 <== 0;  // shares: 0 (to be written by contract)
    balance_commit.m2 <== 0;  // nullifier: 0
    balance_commit.m3 <== spending_key;
    balance_commit.m4 <== 0;  // unlocks_at: 0 (to be written by contract)
    balance_commit.r <== nonce_commitment;
    balance_commitment[0] <== balance_commit.commitment[0];
    balance_commitment[1] <== balance_commit.commitment[1];
    
    // Nonce discovery entry
    component nonce_discovery = PedersenCommitment2FixedM1();
    nonce_discovery.r <== nonce_commitment;
    nonce_discovery_entry[0] <== nonce_discovery.commitment[0];
    nonce_discovery_entry[1] <== nonce_discovery.commitment[1];
}

component main { public [ token_address, chain_id ] } = Entry();
