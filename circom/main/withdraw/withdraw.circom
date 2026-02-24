pragma circom 2.0.0;

// ARKANA-WITHDRAW CIRCUIT
// Matches circuits/main/withdraw/src/main.nr

include "../../lib/poseidon/poseidon.circom";
include "../../lib/poseidon-ctr-encryption/poseidon_ctr_encryption.circom";
include "../../lib/pedersen-commitments/pedersen_commitments.circom";
include "../../lib/lean-imt-verify/lean_imt_verify.circom";
include "../../lib/utils/field_utils.circom";
include "../../lib/utils/unpack_utils.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib/circuits/eddsaposeidon.circom";

// VIEW_STRING = 0x76696577696e675f6b6579 = 143150966920908953357084025

template Withdraw() {
    // Private inputs
    signal input user_key;
    signal input signer_pubkey_hash;
    signal input signer_public_key[2];  // [Ax, Ay] on Baby Jubjub
    signal input signature[3];  // EdDSA signature [R8x, R8y, S]
    signal input previous_nonce;
    signal input previous_shares;
    signal input nullifier;
    signal input previous_unlocks_at;  // Packed: lock_timer << 24 | unlocks_at
    signal input previous_commitment_leaf;
    signal input commitment_index;
    signal input tree_depth;
    signal input merkle_proof[32];  // Fixed size array (Circom requirement), but only proof[0..tree_depth-1] are used
    
    // Public inputs
    signal input token_address;
    signal input amount;
    signal input chain_id;
    signal input expected_root;
    signal input declared_time_reference;
    signal input arbitrary_calldata_hash;
    signal input receiver_address;
    signal input relayer_fee_amount;
    
    // Public outputs
    signal output commitment[2];  // [x, y] Pedersen commitment point
    signal output new_nonce_commitment;
    signal output encrypted_state_details[2];  // [encrypted_balance, encrypted_nullifier]
    signal output nonce_discovery_entry[2];  // [x, y]
    
    // === SETUP ===
    // spending_key = Poseidon(user_key, chain_id, token_address, signer_pubkey_hash)
    component spending_key_hash = Poseidon2Hash4();
    spending_key_hash.in[0] <== user_key;
    spending_key_hash.in[1] <== chain_id;
    spending_key_hash.in[2] <== token_address;
    spending_key_hash.in[3] <== signer_pubkey_hash;
    signal spending_key;
    spending_key <== spending_key_hash.out;
    
    component view_key_hash = Poseidon2Hash2();
    view_key_hash.in[0] <== 143150966920908953357084025;  // VIEW_STRING
    view_key_hash.in[1] <== user_key;
    signal view_key;
    view_key <== view_key_hash.out;
    
    // === VERIFY SIGNER IDENTITY ===
    // Hash(Ax, Ay) must equal signer_pubkey_hash
    component signer_hash_check = Poseidon2Hash2();
    signer_hash_check.in[0] <== signer_public_key[0];
    signer_hash_check.in[1] <== signer_public_key[1];
    component signer_eq = IsEqual();
    signer_eq.in[0] <== signer_hash_check.out;
    signer_eq.in[1] <== signer_pubkey_hash;
    signer_eq.out === 1;
    
    // === VERIFY EdDSA SIGNATURE OVER MESSAGE ===
    // nonce for signing = previous_nonce + 1 (current operation's nonce)
    signal current_nonce;
    current_nonce <== previous_nonce + 1;
    // message = Poseidon2(left, right) where:
    //   left  = Poseidon4(token_address, chain_id, amount, relayer_fee_amount)
    //   right = Poseidon3(current_nonce, arbitrary_calldata_hash, receiver_address)
    component msg_left = Poseidon2Hash4();
    msg_left.in[0] <== token_address;
    msg_left.in[1] <== chain_id;
    msg_left.in[2] <== amount;
    msg_left.in[3] <== relayer_fee_amount;
    component msg_right = Poseidon2Hash3();
    msg_right.in[0] <== current_nonce;
    msg_right.in[1] <== arbitrary_calldata_hash;
    msg_right.in[2] <== receiver_address;
    component msg_hash = Poseidon2Hash2();
    msg_hash.in[0] <== msg_left.out;
    msg_hash.in[1] <== msg_right.out;
    
    component eddsa_verify = EdDSAPoseidonVerifier();
    eddsa_verify.enabled <== 1;
    eddsa_verify.Ax <== signer_public_key[0];
    eddsa_verify.Ay <== signer_public_key[1];
    eddsa_verify.R8x <== signature[0];
    eddsa_verify.R8y <== signature[1];
    eddsa_verify.S <== signature[2];
    eddsa_verify.M <== msg_hash.out;
    
    // previous_nonce_commitment = hash(view_key, previous_nonce, token_address)
    component previous_nonce_commitment_hash = Poseidon2Hash3();
    previous_nonce_commitment_hash.in[0] <== view_key;
    previous_nonce_commitment_hash.in[1] <== previous_nonce;
    previous_nonce_commitment_hash.in[2] <== token_address;
    signal previous_nonce_commitment;
    previous_nonce_commitment <== previous_nonce_commitment_hash.out;
    
    // === VERIFY PREVIOUS COMMITMENT OPENING ===
    // OPTIMIZATION EXPLANATION:
    // We need to compute TWO PedersenCommitment5:
    //   1. previous_commit = m1*G + m2*H + m3*D + m4*K + previous_r*J
    //   2. new_commit = new_m1*G + m2*H + m3*D + m4*K + new_r*J
    // 
    // Both share m2, m3, m4, so we compute base3_commit = m2*H + m3*D + m4*K ONCE (3 scalar multiplications),
    // then add m1*G and r*J separately for each commitment.
    // This saves 3 scalar multiplications and 2 point additions!
    
    // Compute base3_commit = m2*H + m3*D + m4*K (common part)
    component base3_commit = PedersenCommitmentBase3();
    base3_commit.m2 <== nullifier;
    base3_commit.m3 <== spending_key;
    base3_commit.m4 <== previous_unlocks_at;
    
    // Compute previous_m1*G
    component previous_m1G = PedersenCommitmentM1();
    previous_m1G.m1 <== previous_shares;
    
    // Compute previous_r*J
    component previous_rJ = PedersenCommitmentR();
    previous_rJ.r <== previous_nonce_commitment;
    
    // previous_commit = base3_commit + previous_m1*G + previous_r*J
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
    
    // === MERKLE PROOF VERIFICATION ===
    component merkle_verify = LeanIMTVerify();
    merkle_verify.leaf <== previous_commitment_leaf;
    merkle_verify.index <== commitment_index;
    merkle_verify.tree_depth <== tree_depth;
    merkle_verify.expected_root <== expected_root;
    // Pass all proof elements (array is fixed size 32, but LeanIMTVerify only processes levels < tree_depth)
    // Unused levels (>= tree_depth) have dummy values (0) and are skipped by should_process_i logic
    for (var i = 0; i < 32; i++) {
        merkle_verify.proof[i] <== merkle_proof[i];
    }
    
    // === VERIFY WITHDRAWAL TIME CONSTRAINT ===
    // Extract unlocks_at from previous_unlocks_at
    component unpack = UnpackUnlocksAt();
    unpack.packed <== previous_unlocks_at;
    signal unlocks_at;
    unlocks_at <== unpack.unlocks_at;
    
    // Verify that declared_time_reference >= unlocks_at
    component time_check = GreaterThanOrEqualField();
    time_check.a <== declared_time_reference;
    time_check.b <== unlocks_at;
    time_check.out === 1;
    
    // === CALCULATE NEW NONCE COMMITMENT ===
    // new_nonce_commitment = hash(view_key, current_nonce, token_address)
    component new_nonce_commitment_hash = Poseidon2Hash3();
    new_nonce_commitment_hash.in[0] <== view_key;
    new_nonce_commitment_hash.in[1] <== current_nonce;
    new_nonce_commitment_hash.in[2] <== token_address;
    new_nonce_commitment <== new_nonce_commitment_hash.out;
    
    // === CREATE NEW PEDERSEN COMMITMENT ===
    // Ensure we have enough shares to withdraw
    // previous_shares is now the actual shares value (no encoding)
    signal total_to_withdraw;
    total_to_withdraw <== amount + relayer_fee_amount;
    
    // Check: previous_shares >= total_to_withdraw
    component shares_check = GreaterThanOrEqualField();
    shares_check.a <== previous_shares;
    shares_check.b <== total_to_withdraw;
    shares_check.out === 1;
    
    // new_shares_balance = previous_shares - total_to_withdraw (no encoding)
    signal new_shares_balance;
    new_shares_balance <== previous_shares - total_to_withdraw;
    
    // === CREATE NEW PEDERSEN COMMITMENT ===
    // OPTIMIZATION: Reuse base3_commit computed above, only add new_m1*G and new_r*J
    // Compute new_m1*G
    component new_m1G = PedersenCommitmentM1();
    new_m1G.m1 <== new_shares_balance;
    
    // Compute new_r*J
    component new_rJ = PedersenCommitmentR();
    new_rJ.r <== new_nonce_commitment;
    
    // new_commit = base3_commit + new_m1*G + new_r*J
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
    
    commitment[0] <== new_add2.xout;
    commitment[1] <== new_add2.yout;
    
    // Encrypt state details
    component encrypt_balance = PoseidonCTREncrypt();
    encrypt_balance.plaintext <== new_shares_balance;
    encrypt_balance.key <== view_key;
    encrypt_balance.counter <== 0;
    encrypted_state_details[0] <== encrypt_balance.ciphertext;
    
    component encrypt_nullifier = PoseidonCTREncrypt();
    encrypt_nullifier.plaintext <== nullifier;
    encrypt_nullifier.key <== view_key;
    encrypt_nullifier.counter <== 1;
    encrypted_state_details[1] <== encrypt_nullifier.ciphertext;
    
    // Calculate nonce discovery entry
    // OPTIMIZATION: Use PedersenCommitment2FixedM1 since m=1 always
    component nonce_discovery = PedersenCommitment2FixedM1();
    nonce_discovery.r <== new_nonce_commitment;
    nonce_discovery_entry[0] <== nonce_discovery.commitment[0];
    nonce_discovery_entry[1] <== nonce_discovery.commitment[1];
}

component main { public [ token_address, amount, chain_id, expected_root, declared_time_reference, arbitrary_calldata_hash, receiver_address, relayer_fee_amount ] } = Withdraw();

