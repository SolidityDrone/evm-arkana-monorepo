pragma circom 2.0.0;

// ARKANA-DEPOSIT CIRCUIT
// Matches circuits/main/deposit/src/main.nr

include "../../lib/poseidon/poseidon2.circom";
include "../../lib/poseidon-ctr-encryption/poseidon_ctr_encryption.circom";
include "../../lib/pedersen-commitments/pedersen_commitments.circom";
include "../../lib/lean-imt-verify/lean_imt_verify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// VIEW_STRING = 0x76696577696e675f6b6579 = 143150966920908953357084025

template Deposit() {
    // Private inputs
    signal input user_key;
    signal input previous_nonce;
    signal input previous_shares;
    signal input nullifier;
    signal input previous_unlocks_at;
    signal input previous_commitment_leaf;
    signal input commitment_index;
    signal input tree_depth;
    signal input merkle_proof[32];  // Fixed size array (Circom requirement), but only proof[0..tree_depth-1] are used
    
    // Public inputs
    signal input token_address;
    signal input amount;
    signal input chain_id;
    signal input expected_root;
    
    // Public outputs
    signal output commitment[2];  // [x, y] Pedersen commitment point
    signal output encrypted_state_details[2];  // [encrypted_balance, encrypted_nullifier]
    signal output nonce_discovery_entry[2];  // [x, y]
    signal output new_nonce_commitment;
    
    // === SETUP ===
    // Hash user_key with chain_id and token_address to prevent cross-chain/token overlap
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
    
    // Calculate previous_nonce_commitment
    component previous_nonce_commitment_hash = Poseidon2Hash3();
    previous_nonce_commitment_hash.in[0] <== spending_key;
    previous_nonce_commitment_hash.in[1] <== previous_nonce;
    previous_nonce_commitment_hash.in[2] <== token_address;
    signal previous_nonce_commitment;
    previous_nonce_commitment <== previous_nonce_commitment_hash.out;
    
    // === VERIFY PREVIOUS COMMITMENT OPENING ===
    // OPTIMIZATION EXPLANATION:
    // We need to compute TWO PedersenCommitment5:
    //   1. previous_commit = m1*G + m2*H + m3*D + m4*K + previous_r*J
    //   2. new_commit = m1*G + m2*H + m3*D + m4*K + new_r*J
    // 
    // Instead of computing PedersenCommitment5 twice (10 scalar multiplications total),
    // we compute base_commit = m1*G + m2*H + m3*D + m4*K ONCE (4 scalar multiplications),
    // then add previous_r*J and new_r*J separately (2 scalar multiplications).
    // Total: 4 + 1 + 1 = 6 scalar multiplications instead of 5 + 5 = 10
    // This saves 4 expensive scalar multiplications!
    
    component base_commit = PedersenCommitmentBase4();
    base_commit.m1 <== previous_shares;
    base_commit.m2 <== nullifier;
    base_commit.m3 <== spending_key;
    base_commit.m4 <== previous_unlocks_at;
    
    // Compute previous_nonce_commitment*J
    component previous_rJ = PedersenCommitmentR();
    previous_rJ.r <== previous_nonce_commitment;
    
    // previous_commit = base_commit + previous_nonce_commitment*J
    component previous_commit_add = BabyAdd();
    previous_commit_add.x1 <== base_commit.commitment[0];
    previous_commit_add.y1 <== base_commit.commitment[1];
    previous_commit_add.x2 <== previous_rJ.commitment[0];
    previous_commit_add.y2 <== previous_rJ.commitment[1];
    
    // Hash the Pedersen commitment point to get the leaf
    component previous_leaf_hash = Poseidon2Hash2();
    previous_leaf_hash.in[0] <== previous_commit_add.xout;
    previous_leaf_hash.in[1] <== previous_commit_add.yout;
    signal previous_commitment_leaf_computed;
    previous_commitment_leaf_computed <== previous_leaf_hash.out;
    
    // Verify computed leaf matches the provided leaf
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
    
    for (var i = 0; i < 32; i++) {
        merkle_verify.proof[i] <== merkle_proof[i];
    }
    
    // === CHECK UNLOCKS_AT ===
    // Deposit is disabled if previous_unlocks_at is not zero
    // In our encoding, 1 represents 0, so we check if previous_unlocks_at == 1
    component unlocks_is_one = IsEqual();
    unlocks_is_one.in[0] <== previous_unlocks_at;
    unlocks_is_one.in[1] <== 1;
    unlocks_is_one.out === 1;
    
    // === CALCULATE NEW NONCE ===
    signal nonce;
    nonce <== previous_nonce + 1;
    
    // new nonceCommitment includes token_address as a factor
    component new_nonce_commitment_hash = Poseidon2Hash3();
    new_nonce_commitment_hash.in[0] <== spending_key;
    new_nonce_commitment_hash.in[1] <== nonce;
    new_nonce_commitment_hash.in[2] <== token_address;
    new_nonce_commitment <== new_nonce_commitment_hash.out;
    
    // === CREATE NEW PEDERSEN COMMITMENT ===
    // OPTIMIZATION: Reuse base_commit computed above, only add new_nonce_commitment*J
    // Compute new_nonce_commitment*J
    component new_rJ = PedersenCommitmentR();
    new_rJ.r <== new_nonce_commitment;
    
    // new_commit = base_commit + new_nonce_commitment*J
    component new_commit_add = BabyAdd();
    new_commit_add.x1 <== base_commit.commitment[0];
    new_commit_add.y1 <== base_commit.commitment[1];
    new_commit_add.x2 <== new_rJ.commitment[0];
    new_commit_add.y2 <== new_rJ.commitment[1];
    
    commitment[0] <== new_commit_add.xout;
    commitment[1] <== new_commit_add.yout;
    
    // Encrypt state details for viewing
    component encrypt_balance = PoseidonCTREncrypt();
    encrypt_balance.plaintext <== previous_shares;
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
    // This saves Num2Bits(64) + EscalarMulAny(64) ≈ 5000-10000 constraints
    component nonce_discovery = PedersenCommitment2FixedM1();
    nonce_discovery.r <== new_nonce_commitment;
    nonce_discovery_entry[0] <== nonce_discovery.commitment[0];
    nonce_discovery_entry[1] <== nonce_discovery.commitment[1];
}

component main { public [ token_address, amount, chain_id, expected_root ] } = Deposit();

