pragma circom 2.0.0;

// ARKANA-ABSORB-SEND CIRCUIT
// Combines absorb and send operations: absorbs notes then sends to receiver
// Matches circuits/main/absorb/src/main.nr + circuits/main/send/src/main.nr

include "../../lib/poseidon/poseidon2.circom";
include "../../lib/poseidon-ctr-encryption/poseidon_ctr_encryption.circom";
include "../../lib/pedersen-commitments/pedersen_commitments.circom";
include "../../lib/lean-imt-verify/lean_imt_verify.circom";
include "../../lib/dh-key-exchange/dh_key_exchange.circom";
include "../../lib/utils/field_utils.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// VIEW_STRING = 0x76696577696e675f6b6579 = 143150966920908953357084025

template AbsorbSend() {
    // Private inputs
    signal input user_key;
    signal input amount;  // Amount to send (in shares)
    signal input previous_nonce;
    signal input current_balance;  // Raw balance (not encoded)
    signal input nullifier;
    signal input previous_unlocks_at;  // Must be 0 (absorb disabled for locked funds)
    signal input previous_commitment_leaf;
    signal input commitment_index;
    signal input tree_depth;
    signal input merkle_proof[32];  // Fixed size array (Circom requirement), but only proof[0..tree_depth-1] are used
    
    // Note stack Pedersen commitment and openings
    signal input note_stack_m;      // Private: opening value m (aggregated amount)
    signal input note_stack_r;      // Private: opening value r (sum of all shared keys)
    signal input note_stack_commitment_index;
    signal input note_stack_merkle_proof[32];
    signal input note_stack_x;  // Private: x coordinate of note_stack commitment point (prover proves knowledge)
    signal input note_stack_y;  // Private: y coordinate of note_stack commitment point (prover proves knowledge)

    // Public inputs (declared in main { public [ ... ] } for verifier)
    signal input token_address;
    signal input chain_id;
    signal input expected_root;

    signal input receiver_public_key[2];  // [x, y] on Baby Jubjub
    signal input relayer_fee_amount;  // Single fee for the whole absorb+send operation

    // Public outputs
    signal output new_commitment_leaf;  // Leaf hash (hashed in circuit)
    signal output new_nonce_commitment;
    signal output encrypted_note[3];  // [receiver_note_amount, sender_balance, sender_nullifier]
    signal output sender_pub_key[2];  // [x, y] on Baby Jubjub
    signal output nonce_discovery_entry[2];  // [x, y]
    signal output note_commitment[2];  // [x, y] Pedersen commitment for receiver's note
    
    // === SETUP ===
    // Hash user_key with chain_id and token_address
    component spending_key_hash = Poseidon2Hash3();
    spending_key_hash.in[0] <== user_key;
    spending_key_hash.in[1] <== chain_id;
    spending_key_hash.in[2] <== token_address;
    signal spending_key;
    spending_key <== spending_key_hash.out;
    
    component view_key_hash = Poseidon2Hash2();
    view_key_hash.in[0] <== 143150966920908953357084025;  // VIEW_STRING
    view_key_hash.in[1] <== user_key;
    signal view_key;
    view_key <== view_key_hash.out;
    
    // === CHECK UNLOCKS_AT ===
    // Absorb is disabled if previous_unlocks_at is not zero (encoded as 1)
    // We use encoding where 1 represents 0, so check that previous_unlocks_at == 1
    component unlocks_is_one = IsEqual();
    unlocks_is_one.in[0] <== previous_unlocks_at;
    unlocks_is_one.in[1] <== 1;
    unlocks_is_one.out === 1;
    
    // Calculate previous_nonce_commitment
    component previous_nonce_commitment_hash = Poseidon2Hash3();
    previous_nonce_commitment_hash.in[0] <== spending_key;
    previous_nonce_commitment_hash.in[1] <== previous_nonce;
    previous_nonce_commitment_hash.in[2] <== token_address;
    signal previous_nonce_commitment;
    previous_nonce_commitment <== previous_nonce_commitment_hash.out;
    
    // === VERIFY PREVIOUS COMMITMENT OPENING ===
    // Reconstruct previous Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=current_balance, m2=nullifier, m3=spending_key, m4=previous_unlocks_at, r=previous_nonce_commitment
    component base3_commit = PedersenCommitmentBase3();
    base3_commit.m2 <== nullifier;
    base3_commit.m3 <== spending_key;
    base3_commit.m4 <== previous_unlocks_at;
    
    // Compute current_balance*G
    component previous_m1G = PedersenCommitmentM1();
    previous_m1G.m1 <== current_balance;
    
    // Compute previous_r*J
    component previous_rJ = PedersenCommitmentR();
    previous_rJ.r <== previous_nonce_commitment;
    
    // previous_commit = base3_commit + current_balance*G + previous_r*J
    component previous_add1 = BabyAdd();
    previous_add1.x1 <== base3_commit.commitment[0];
    previous_add1.y1 <== base3_commit.commitment[1];
    previous_add1.x2 <== previous_m1G.commitment[0];
    previous_add1.y2 <== previous_m1G.commitment[1];
    
    component previous_add2 = BabyAdd();
    previous_add2.x1 <== previous_add1.xout;
    previous_add2.y1 <== previous_add1.yout;
    previous_add2.x2 <== previous_rJ.commitment[0];
    previous_add2.y2 <== previous_rJ.commitment[1];
    
    component previous_leaf_hash = Poseidon2Hash2();
    previous_leaf_hash.in[0] <== previous_add2.xout;
    previous_leaf_hash.in[1] <== previous_add2.yout;
    signal previous_commitment_leaf_computed;
    previous_commitment_leaf_computed <== previous_leaf_hash.out;
    
    component leaf_eq = IsEqual();
    leaf_eq.in[0] <== previous_commitment_leaf_computed;
    leaf_eq.in[1] <== previous_commitment_leaf;
    leaf_eq.out === 1;
    
    // === MERKLE PROOF VERIFICATION FOR PREVIOUS COMMITMENT ===
    component merkle_verify = LeanIMTVerify();
    merkle_verify.leaf <== previous_commitment_leaf;
    merkle_verify.index <== commitment_index;
    merkle_verify.tree_depth <== tree_depth;
    merkle_verify.expected_root <== expected_root;
    for (var i = 0; i < 32; i++) {
        merkle_verify.proof[i] <== merkle_proof[i];
    }
    
    // === VERIFY NOTE_STACK PEDERSEN COMMITMENT ===
    // Reconstruct the Pedersen commitment from openings (2 factors: m and r)
    component note_stack_commit = PedersenCommitment2();
    note_stack_commit.m <== note_stack_m;
    note_stack_commit.r <== note_stack_r;
    
    // Verify the reconstructed point matches the provided note_stack point
    component note_stack_x_eq = IsEqual();
    note_stack_x_eq.in[0] <== note_stack_commit.commitment[0];
    note_stack_x_eq.in[1] <== note_stack_x;
    note_stack_x_eq.out === 1;
    
    component note_stack_y_eq = IsEqual();
    note_stack_y_eq.in[0] <== note_stack_commit.commitment[1];
    note_stack_y_eq.in[1] <== note_stack_y;
    note_stack_y_eq.out === 1;
    
    // === VERIFY NOTE_STACK IS IN MERKLE TREE ===
    // Hash the note_stack point to get a leaf value for the Merkle tree
    component note_stack_leaf_hash = Poseidon2Hash2();
    note_stack_leaf_hash.in[0] <== note_stack_x;
    note_stack_leaf_hash.in[1] <== note_stack_y;
    signal note_stack_leaf;
    note_stack_leaf <== note_stack_leaf_hash.out;
    
    // Verify note_stack is in the same tree (same depth and root)
    component note_stack_merkle_verify = LeanIMTVerify();
    note_stack_merkle_verify.leaf <== note_stack_leaf;
    note_stack_merkle_verify.index <== note_stack_commitment_index;
    note_stack_merkle_verify.tree_depth <== tree_depth;
    note_stack_merkle_verify.expected_root <== expected_root;
    for (var i = 0; i < 32; i++) {
        note_stack_merkle_verify.proof[i] <== note_stack_merkle_proof[i];
    }
    
    // === ABSORB + SEND STEP: Optimized combined balance calculations ===
    // Use note_stack_m as the absorbed amount (verified via Pedersen commitment)
    signal absorbed_amount;
    absorbed_amount <== note_stack_m;
    
    signal final_shares;
    final_shares <== current_balance + absorbed_amount - relayer_fee_amount - amount;
    
    // Combined balance check: current_balance + absorbed_amount >= relayer_fee_amount + amount + 1
    signal total_required;
    total_required <== relayer_fee_amount + amount + 1;
    signal total_available;
    total_available <== current_balance + absorbed_amount;
    component combined_balance_check = GreaterThanOrEqualField();
    combined_balance_check.a <== total_available;
    combined_balance_check.b <== total_required;
    combined_balance_check.out === 1;
    
    // Update nullifier: increase by absorbed amount
    signal new_nullifier_after_absorb;
    new_nullifier_after_absorb <== nullifier + absorbed_amount;
    
    // === CALCULATE NEW NONCE ===
    signal nonce;
    nonce <== previous_nonce + 1;
    
    component new_nonce_commitment_hash = Poseidon2Hash3();
    new_nonce_commitment_hash.in[0] <== spending_key;
    new_nonce_commitment_hash.in[1] <== nonce;
    new_nonce_commitment_hash.in[2] <== token_address;
    new_nonce_commitment <== new_nonce_commitment_hash.out;
    
    // === CREATE NEW PEDERSEN COMMITMENT ===
    // OPTIMIZATION: Reuse base3_commit computed above, only add final_shares*G and new_r*J
    // Compute final_shares*G
    component new_m1G = PedersenCommitmentM1();
    new_m1G.m1 <== final_shares;
    
    // Compute new_r*J
    component new_rJ = PedersenCommitmentR();
    new_rJ.r <== new_nonce_commitment;
    
    // new_commit = base3_commit + final_shares*G + new_r*J
    component new_add1 = BabyAdd();
    new_add1.x1 <== base3_commit.commitment[0];
    new_add1.y1 <== base3_commit.commitment[1];
    new_add1.x2 <== new_m1G.commitment[0];
    new_add1.y2 <== new_m1G.commitment[1];
    
    component new_add2 = BabyAdd();
    new_add2.x1 <== new_add1.xout;
    new_add2.y1 <== new_add1.yout;
    new_add2.x2 <== new_rJ.commitment[0];
    new_add2.y2 <== new_rJ.commitment[1];
    
    // Hash the new Pedersen commitment point to create the leaf
    component new_leaf_hash = Poseidon2Hash2();
    new_leaf_hash.in[0] <== new_add2.xout;
    new_leaf_hash.in[1] <== new_add2.yout;
    new_commitment_leaf <== new_leaf_hash.out;
    
    // === PERFORM DIFFIE-HELLMAN KEY EXCHANGE ===
    signal sender_private_key;
    sender_private_key <== user_key + nonce;
    
    component dh = PerformDHKeyExchange();
    dh.sender_private_key <== sender_private_key;
    dh.receiver_public_key[0] <== receiver_public_key[0];
    dh.receiver_public_key[1] <== receiver_public_key[1];
    
    sender_pub_key[0] <== dh.sender_public_key[0];
    sender_pub_key[1] <== dh.sender_public_key[1];
    
    signal shared_key;
    shared_key <== dh.shared_key;
    
    // Hash shared key
    component shared_key_hash_comp = Poseidon2Hash1();
    shared_key_hash_comp.in <== shared_key;
    signal shared_key_hash;
    shared_key_hash <== shared_key_hash_comp.out;
    
    // === ENCRYPT OPERATION DETAILS ===
    // Encrypt for receiver's note (using shared_key_hash)
    component encrypt_amount_receiver = PoseidonCTREncrypt();
    encrypt_amount_receiver.plaintext <== amount;
    encrypt_amount_receiver.key <== shared_key_hash;
    encrypt_amount_receiver.counter <== 0;
    encrypted_note[0] <== encrypt_amount_receiver.ciphertext;
    
    // Encrypt for sender's balance tracking (using view_key)
    component encrypt_balance_sender = PoseidonCTREncrypt();
    encrypt_balance_sender.plaintext <== final_shares;
    encrypt_balance_sender.key <== view_key;
    encrypt_balance_sender.counter <== 0;
    encrypted_note[1] <== encrypt_balance_sender.ciphertext;
    
    component encrypt_nullifier_sender = PoseidonCTREncrypt();
    encrypt_nullifier_sender.plaintext <== new_nullifier_after_absorb;
    encrypt_nullifier_sender.key <== view_key;
    encrypt_nullifier_sender.counter <== 1;
    encrypted_note[2] <== encrypt_nullifier_sender.ciphertext;
    
    // === CREATE PEDERSEN COMMITMENT FOR RECEIVER'S NOTE ===
    // Note commitment: amount*G + shared_key*D (2 generators only)
    component note_commit = PedersenCommitment2();
    note_commit.m <== amount;
    note_commit.r <== shared_key_hash;
    note_commitment[0] <== note_commit.commitment[0];
    note_commitment[1] <== note_commit.commitment[1];
    
    // === GENERATE NONCE DISCOVERY ENTRY ===
    // OPTIMIZATION: Use PedersenCommitment2FixedM1 since m=1 always
    component nonce_discovery = PedersenCommitment2FixedM1();
    nonce_discovery.r <== new_nonce_commitment;
    nonce_discovery_entry[0] <== nonce_discovery.commitment[0];
    nonce_discovery_entry[1] <== nonce_discovery.commitment[1];
}

component main { public [ token_address, chain_id, expected_root, receiver_public_key, relayer_fee_amount ] } = AbsorbSend();

