use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::{poseidon_ctr_encrypt, poseidon_ctr_decrypt};
use dep::ec::tecurve::affine::{Point};
use dep::ec::consts::te::{baby_jubjub};
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use dep::std::embedded_curve_ops::{EmbeddedCurvePoint, EmbeddedCurveScalar, multi_scalar_mul};
use dep::lean_imt_verify::{
    simulate_entry_circuit,
    simulate_lean_imt_insert,
    generate_merkle_proof
};
use crate::main;

// === TEST CONSTANTS ===
global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;

/// Get test user key
fn test_user_key() -> Field { 0x1234567890abcdef as Field }

/// Get test token address (USDC)
fn test_token_address() -> Field { 0x02 as Field }

/// Get test send amount (50 USDC)
fn test_send_amount() -> Field { 0x32 as Field }

/// Get test nullifier
fn test_nullifier() -> Field { 0x1234567890abcdef as Field }

/// Get test relayer fee amount
fn test_relayer_fee_amount() -> Field { 0x01 as Field }

/// Get Alice's private key (for decryption testing)
fn alice_private_key() -> Field { 0xfedcba0987654321 as Field }

fn test_previous_nonce() -> Field { 0x00 as Field }

/// Helper function to convert Field to EmbeddedCurveScalar
/// Replicates the logic from pedersen_commitments library
fn from_field_scalar(scalar: Field) -> EmbeddedCurveScalar {
    // TWO_POW_128 = 2^128
    let TWO_POW_128 = 340282366920938463463374607431768211456 as Field; // 2^128
    
    // Decompose field into 128-bit limbs
    // Cast to u128 truncates to lower 128 bits
    let low = (scalar as u128) as Field;
    let high = (scalar - low) / TWO_POW_128;
    
    EmbeddedCurveScalar { lo: low, hi: high }
}

/// Derive Alice's public key from her private key
fn derive_alice_public_key() -> [Field; 2] {
    let bjj = baby_jubjub();
    let generator = bjj.base8;
    let alice_private_key = alice_private_key();
    let alice_public_key = bjj.curve.mul(alice_private_key, generator);
    [alice_public_key.x, alice_public_key.y]
}


/// Alice performs Diffie-Hellman key exchange
fn alice_perform_dh_key_exchange(alice_private_key: Field, sender_public_key: [Field; 2]) -> (Field, [Field; 2]) {
    let bjj = baby_jubjub();
    let generator = bjj.base8;
    
    let alice_public_key = bjj.curve.mul(alice_private_key, generator);
    let sender_pub_key = Point::new(sender_public_key[0], sender_public_key[1]);
    let shared_secret = bjj.curve.mul(alice_private_key, sender_pub_key);
    let shared_key = Poseidon2::hash([shared_secret.x, shared_secret.y], 2);
    
    (shared_key, [alice_public_key.x, alice_public_key.y])
}

/// Print Prover.toml format
fn print_prover_toml_format(
    user_key: Field,
    token_address: Field,
    amount: Field,
    chain_id: Field,
    previous_nonce: Field,
    previous_shares: Field,
    nullifier: Field,
    previous_unlocks_at: Field,
    previous_commitment_leaf: Field,
    commitment_index: Field,
    tree_depth: Field,
    expected_root: Field,
    merkle_proof: [Field; 32],
    receiver_public_key: [Field; 2],
    relayer_fee_amount: Field
) {
    std::println("========================================");
    std::println("COPY THIS TO send/Prover.toml");
    std::println("========================================");
    std::println("");
    
    std::print("user_key = \"");
    std::print(user_key);
    std::println("\"");
    std::println("");
    
    std::print("previous_nonce = \"");
    std::print(previous_nonce);
    std::println("\"");
    std::println("");
    
    std::print("previous_shares = \"");
    std::print(previous_shares);
    std::println("\"");
    std::println("");
    
    std::print("nullifier = \"");
    std::print(nullifier);
    std::println("\"");
    std::println("");
    
    std::print("previous_unlocks_at = \"");
    std::print(previous_unlocks_at);
    std::println("\"");
    std::println("");
    
    std::print("previous_commitment_leaf = \"");
    std::print(previous_commitment_leaf);
    std::println("\"");
    std::println("");
    
    std::print("commitment_index = \"");
    std::print(commitment_index);
    std::println("\"");
    std::println("");
    
    std::print("tree_depth = \"");
    std::print(tree_depth);
    std::println("\"");
    std::println("");
    
    std::print("expected_root = \"");
    std::print(expected_root);
    std::println("\"");
    std::println("");
    
    std::print("merkle_proof = [");
    let mut first = true;
    for i in 0..32 {
        if !first {
            std::print(", ");
        }
        first = false;
        std::print("\"");
        std::print(merkle_proof[i]);
        std::print("\"");
    }
    std::println("]");
    std::println("");
    
    std::print("token_address = \"");
    std::print(token_address);
    std::println("\"");
    std::println("");
    
    std::print("chain_id = \"");
    std::print(chain_id);
    std::println("\"");
    std::println("");
    
    std::print("amount = \"");
    std::print(amount);
    std::println("\"");
    std::println("");
    
    std::print("receiver_public_key = [\"");
    std::print(receiver_public_key[0]);
    std::print("\", \"");
    std::print(receiver_public_key[1]);
    std::println("\"]");
    std::println("");
    
    std::print("relayer_fee_amount = \"");
    std::print(relayer_fee_amount);
    std::println("\"");
    std::println("");
}

#[test]
fn test_send_with_merkle_tracking() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Send with Merkle Tree Tracking                  ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let send_amount = test_send_amount(); // 50
    let nullifier = test_nullifier();
    let alice_derived_pub_key = derive_alice_public_key();
    let relayer_fee_amount = test_relayer_fee_amount();
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: CREATE ENTRY COMMITMENT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Create entry commitment
    let (entry_pedersen_point, entry_nonce_commitment, _entry_nonce_discovery) = simulate_entry_circuit(
        user_key,
        token_address,
        chain_id
    );
    
    let entry_commitment_leaf = Poseidon2::hash([entry_pedersen_point[0], entry_pedersen_point[1]], 2);
    
    std::println("Entry commitment leaf: ");
    std::println(entry_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 2: BUILD MERKLE TREE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Build merkle tree with entry
    let mut tree_size = 0 as Field;
    let mut tree_depth = 1 as Field;
    let mut side_nodes: [Field; 32] = [0; 32];
    let mut all_leaves: [Field; 256] = [0; 256];
    
    let (root_after_entry, depth_after_entry, side_nodes_after_entry) = simulate_lean_imt_insert(
        entry_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[0] = entry_commitment_leaf;
    tree_size = 1;
    tree_depth = depth_after_entry;
    side_nodes = side_nodes_after_entry;
    
    std::println("Tree root: ");
    std::println(root_after_entry);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 3: GENERATE MERKLE PROOF");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Generate merkle proof for entry (index 0)
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    std::println("Merkle proof generated for index 0");
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 4: EXECUTE SEND CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Execute send circuit
    // For entry, previous_shares is 0, but we need some shares to send
    // So we'll use a deposit-like scenario where we have 100 shares
    let previous_nonce = 0 as Field;
    let previous_shares = 100 as Field; // Assume we have 100 shares from a deposit
    
    // Recalculate spending_key and previous_nonce_commitment to match entry
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    
    // Create previous commitment that matches entry but with shares
    let unlocks_at = 0 as Field;
    let previous_commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, unlocks_at, previous_nonce_commitment);
    let previous_commitment_leaf = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Update tree with this new commitment
    let (new_root, new_depth, new_side_nodes) = simulate_lean_imt_insert(
        previous_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[1] = previous_commitment_leaf;
    let new_tree_size = 2;
    let new_tree_depth = new_depth;
    
    // Generate proof for the new commitment (index 1)
    let new_merkle_proof = generate_merkle_proof(
        previous_commitment_leaf,
        1 as Field,
        new_tree_depth,
        all_leaves,
        new_tree_size
    );
    
    std::println("Calling send circuit...");
    std::print("  Previous shares: ");
    std::println(previous_shares);
    std::print("  Send amount: ");
    std::println(send_amount);
    std::print("  Previous commitment leaf: ");
    std::println(previous_commitment_leaf);
    std::println("");
    
    let send_result: (Field, Field, [Field; 3], [Field; 2], [Field; 2], [Field; 2]) = main(
        user_key,
        token_address,
        send_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        unlocks_at,
        previous_commitment_leaf,
        1 as Field, // commitment_index
        new_tree_depth,
        new_root,
        new_merkle_proof,
        alice_derived_pub_key,
        relayer_fee_amount
    );
    
    std::println("Send completed:");
    std::print("  New commitment leaf: ");
    std::println(send_result.0);
    std::print("  Encrypted note: [");
    std::print(send_result.2[0]);
    std::print(", ");
    std::print(send_result.2[1]);
    std::print(", ");
    std::print(send_result.2[2]);
    std::println("]");
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 5: ALICE TRIES TO DECRYPT THE NOTE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    let view_key = Poseidon2::hash([VIEW_STRING, user_key], 2);
    
    let (alice_shared_key, _alice_pub_key) = alice_perform_dh_key_exchange(
        alice_private_key(),
        send_result.3
    );
    
    let shared_key_hash = Poseidon2::hash([alice_shared_key], 1);
    
    let decrypted_amount = poseidon_ctr_decrypt(send_result.2[0], shared_key_hash, 0);
    
    std::println("Decrypted amount (receiver): ");
    std::println(decrypted_amount);
    std::println("");
    
    let decrypted_balance = poseidon_ctr_decrypt(send_result.2[1], view_key, 0);
    
    std::println("Decrypted balance (sender): ");
    std::println(decrypted_balance);
    std::println("");
    
    let expected_new_balance = previous_shares - send_amount - relayer_fee_amount;
    assert(decrypted_balance == expected_new_balance, "Decrypted balance should match expected new balance");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 6: PRINT PROVER.TOML");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    print_prover_toml_format(
        user_key,
        token_address,
        send_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        unlocks_at,
        previous_commitment_leaf,
        1 as Field, // commitment_index
        new_tree_depth,
        new_root,
        new_merkle_proof,
        alice_derived_pub_key,
        relayer_fee_amount
    );
    
    std::println("✅ Send test completed successfully!");
}


/// Test that send succeeds when shares are exactly enough (boundary case)
#[test]
fn test_send_exact_shares() {
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let send_amount = 40 as Field; // In shares
    let relayer_fee_amount = 10 as Field; // In shares
    let total_needed = send_amount + relayer_fee_amount; // 50
    let previous_shares = total_needed; // Exactly 50, should pass since gt(50, 50-1) = gt(50, 49) = true
    
    let previous_nonce = test_previous_nonce();
    let nullifier = test_nullifier();
    
    // Create previous commitment using Pedersen commitment
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let unlocks_at = 0 as Field;
    let previous_commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, unlocks_at, previous_nonce_commitment);
    let previous_commitment_leaf = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Setup tree
    let mut side_nodes = [0 as Field; 32];
    let tree_size = 1 as Field;
    let tree_depth = 0 as Field;
    let commitment_index = 0 as Field;
    let expected_root = previous_commitment_leaf;
    let merkle_proof = [0 as Field; 32];
    
    // Get receiver public key
    let receiver_public_key = derive_alice_public_key();
    
    std::println("Testing send with exact shares (boundary case)...");
    std::println("  Previous shares: 50");
    std::println("  Send amount (in shares): 40");
    std::println("  Relayer fee (in shares): 10");
    std::println("  Total needed: 50");
    std::println("  This should pass since gt(50, 50-1) = gt(50, 49) = true");
    
    // This should pass - boundary case where shares exactly equal total needed
    let previous_unlocks_at = 0 as Field;
    let result = main(
        user_key,
        token_address,
        send_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        previous_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof,
        receiver_public_key,
        relayer_fee_amount
    );
    
    // Verify new commitment leaf is returned
    let new_commitment_leaf = result.0;
    assert(new_commitment_leaf != 0, "New commitment leaf should not be zero");
    
    std::println("✅ Send with exact balance test passed!");
}

/// Test removed: is_anonymity_provider functionality removed
#[test]
fn test_send_placeholder() {
    // Placeholder test - is_anonymity_provider functionality has been removed
    std::println("✅ Placeholder test passed - is_anonymity_provider removed");
}

/// Full integration test: Entry + Send
/// This test simulates a complete flow: 1 entry followed by 1 send
/// All outputs are printed in a format suitable for testing the Solidity contract
#[test]
fn test_entry_then_send_integration() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      INTEGRATION TEST: Entry + Send                         ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    // === SETUP ===
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 11155111 as Field;
    let nullifier = 0 as Field; // Entry uses nullifier = 0
    let alice_derived_pub_key = derive_alice_public_key();
    let relayer_fee_amount = test_relayer_fee_amount();
    
    // Entry parameters
    let entry_amount = 100 as Field; // 100 shares (will be added by contract)
    
    // Send parameters
    let send_amount = 50 as Field; // Send 50 shares
    let previous_shares = entry_amount; // After entry, we have entry_amount shares
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: EXECUTE ENTRY CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Simulate entry circuit (same as calling the actual entry circuit)
    let (entry_commitment_point, entry_nonce_commitment, entry_nonce_discovery) = simulate_entry_circuit(
        user_key,
        token_address,
        chain_id
    );
    
    std::println("Entry circuit outputs:");
    std::print("  Commitment point: [");
    std::print(entry_commitment_point[0] as Field);
    std::print(", ");
    std::print(entry_commitment_point[1] as Field);
    std::println("]");
    std::print("  Nonce commitment: ");
    std::println(entry_nonce_commitment as Field);
    std::print("  Nonce discovery entry: [");
    std::print(entry_nonce_discovery[0] as Field);
    std::print(", ");
    std::print(entry_nonce_discovery[1] as Field);
    std::println("]");
    std::println("");
    
    // Contract will add shares*G and unlocks_at*K to the commitment
    // For testing, we simulate what the contract does:
    // 1. Contract adds shares*G (entry_amount shares)
    // 2. Contract adds unlocks_at*K (0 in this case)
    // 3. Contract hashes the final commitment to get the leaf
    
    // Derive generators using the same method as pedersen_commitment_5
    let generators: [EmbeddedCurvePoint; 5] =
        std::hash::derive_generators("PEDERSEN_COMMITMENT_5".as_bytes(), 0);
    let G = generators[0];  // Generator for shares
    let K = generators[3];   // Generator for unlocks_at
    
    // Convert entry commitment point to EmbeddedCurvePoint
    let entry_commitment_embedded = EmbeddedCurvePoint {
        x: entry_commitment_point[0],
        y: entry_commitment_point[1],
        is_infinite: false
    };
    
    // Calculate shares*G
    let shares_scalar = from_field_scalar(entry_amount);
    let shares_commitment = multi_scalar_mul([G], [shares_scalar]);
    
    // Calculate unlocks_at*K (0 in this case)
    let unlocks_at = 0 as Field;
    let unlocks_at_scalar = from_field_scalar(unlocks_at);
    let unlocks_at_commitment = multi_scalar_mul([K], [unlocks_at_scalar]);
    
    // Add: entry_commitment + shares*G + unlocks_at*K
    let final_entry_commitment = entry_commitment_embedded + shares_commitment + unlocks_at_commitment;
    
    // Hash to get the leaf (as contract does)
    let entry_commitment_leaf = Poseidon2::hash([final_entry_commitment.x, final_entry_commitment.y], 2);
    
    std::println("After contract adds shares and unlocks_at:");
    std::print("  Final commitment point: [");
    std::print(final_entry_commitment.x);
    std::print(", ");
    std::print(final_entry_commitment.y);
    std::println("]");
    std::print("  Entry commitment leaf: ");
    std::println(entry_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 2: BUILD MERKLE TREE WITH ENTRY");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Build merkle tree with entry
    let mut tree_size = 0 as Field;
    let mut tree_depth = 1 as Field;
    let mut side_nodes: [Field; 32] = [0; 32];
    let mut all_leaves: [Field; 256] = [0; 256];
    
    let (root_after_entry, depth_after_entry, side_nodes_after_entry) = simulate_lean_imt_insert(
        entry_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[0] = entry_commitment_leaf;
    tree_size = 1;
    tree_depth = depth_after_entry;
    side_nodes = side_nodes_after_entry;
    
    std::println("Tree after entry:");
    std::print("  Root: ");
    std::println(root_after_entry);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 3: GENERATE MERKLE PROOF FOR ENTRY");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Generate merkle proof for entry (index 0)
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    std::println("Merkle proof generated for entry (index 0)");
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 4: EXECUTE SEND CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // For send, we need to reconstruct the previous commitment
    // The previous commitment should match what was in the tree (entry with shares)
    // But the circuit expects: previous_shares, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment
    let previous_nonce = 0 as Field; // Entry uses nonce 0
    let previous_unlocks_at = 0 as Field; // Entry has no lock
    
    // Recalculate spending_key and previous_nonce_commitment
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    
    // Verify this matches entry_nonce_commitment
    assert(previous_nonce_commitment == entry_nonce_commitment, "Nonce commitment mismatch");
    
    // Reconstruct previous commitment (should match entry_commitment_leaf)
    // The circuit uses pedersen_commitment_5 with previous_shares=0, then contract adds shares*G
    // So we need to: pedersen_commitment_5(0, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment) + shares*G + unlocks_at*K
    let base_commitment = pedersen_commitment_5(
        0, // Circuit uses 0 for shares, contract adds shares*G separately
        nullifier,
        spending_key,
        previous_unlocks_at,
        previous_nonce_commitment
    );
    
    // Add shares*G (contract does this)
    let previous_shares_scalar = from_field_scalar(previous_shares);
    let previous_shares_commitment = multi_scalar_mul([G], [previous_shares_scalar]);
    
    // Add unlocks_at*K (0 in this case)
    let previous_unlocks_at_scalar = from_field_scalar(previous_unlocks_at);
    let previous_unlocks_at_commitment = multi_scalar_mul([K], [previous_unlocks_at_scalar]);
    
    // Combine: base + shares*G + unlocks_at*K
    let previous_final_commitment = base_commitment + previous_shares_commitment + previous_unlocks_at_commitment;
    
    // Hash to get leaf
    let previous_commitment_leaf = Poseidon2::hash([previous_final_commitment.x, previous_final_commitment.y], 2);
    
    // Verify it matches entry_commitment_leaf
    assert(previous_commitment_leaf == entry_commitment_leaf, "Previous commitment leaf mismatch");
    
    std::println("Send parameters:");
    std::print("  Previous shares: ");
    std::println(previous_shares);
    std::print("  Send amount: ");
    std::println(send_amount);
    std::print("  Relayer fee: ");
    std::println(relayer_fee_amount);
    std::print("  Previous commitment leaf: ");
    std::println(previous_commitment_leaf);
    std::println("");
    
    // Execute send circuit
    let send_result: (Field, Field, [Field; 3], [Field; 2], [Field; 2], [Field; 2]) = main(
        user_key,
        token_address,
        send_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        previous_commitment_leaf,
        commitment_index,
        tree_depth,
        root_after_entry,
        merkle_proof,
        alice_derived_pub_key,
        relayer_fee_amount
    );
    
    std::println("Send circuit outputs:");
    std::print("  New commitment leaf: ");
    std::println(send_result.0);
    std::print("  New nonce commitment: ");
    std::println(send_result.1);
    std::print("  Encrypted note: [");
    std::print(send_result.2[0]);
    std::print(", ");
    std::print(send_result.2[1]);
    std::print(", ");
    std::print(send_result.2[2]);
    std::println("]");
    std::print("  Sender public key: [");
    std::print(send_result.3[0]);
    std::print(", ");
    std::print(send_result.3[1]);
    std::println("]");
    std::print("  Nonce discovery entry: [");
    std::print(send_result.4[0]);
    std::print(", ");
    std::print(send_result.4[1]);
    std::println("]");
    std::print("  Note commitment: [");
    std::print(send_result.5[0]);
    std::print(", ");
    std::print(send_result.5[1]);
    std::println("]");
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 5: FORMAT OUTPUT FOR SOLIDITY TEST");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    std::println("=== PUBLIC INPUTS FOR initialize() FUNCTION (ENTRY) ===");
    std::println("publicInputs array (7 elements):");
    std::println("");
    std::println("// Public inputs (2 elements):");
    std::print("publicInputs[0] = bytes32(uint256(uint160(tokenAddress))); // token_address = ");
    std::println(token_address);
    std::print("publicInputs[1] = bytes32(chainId); // chain_id = ");
    std::println(chain_id);
    std::println("");
    std::println("// Public outputs (5 elements):");
    std::print("publicInputs[2] = bytes32(balanceCommitmentX); // balance_commitment.x = ");
    std::println(entry_commitment_point[0]);
    std::print("publicInputs[3] = bytes32(balanceCommitmentY); // balance_commitment.y = ");
    std::println(entry_commitment_point[1]);
    std::print("publicInputs[4] = bytes32(newNonceCommitment); // new_nonce_commitment = ");
    std::println(entry_nonce_commitment);
    std::print("publicInputs[5] = bytes32(nonceDiscoveryEntryX); // nonce_discovery_entry.x = ");
    std::println(entry_nonce_discovery[0]);
    std::print("publicInputs[6] = bytes32(nonceDiscoveryEntryY); // nonce_discovery_entry.y = ");
    std::println(entry_nonce_discovery[1]);
    std::println("");
    std::println("// Additional parameters for initialize():");
    std::print("amountIn = ");
    std::println(entry_amount);
    std::print("lockDuration = ");
    std::println(0 as Field);
    std::println("");
    std::println("// Note: Contract will add shares*G and unlocks_at*K to balanceCommitment");
    std::println("//       The final leaf will be: hash(balanceCommitment + shares*G + unlocks_at*K)");
    std::print("//       Final entry commitment leaf (after contract adds shares) = ");
    std::println(entry_commitment_leaf);
    std::println("");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    std::println("=== PUBLIC INPUTS FOR send() FUNCTION ===");
    std::println("publicInputs array (17 elements):");
    std::println("");
    std::println("// Public inputs (6 elements):");
    std::print("publicInputs[0] = bytes32(uint256(uint160(tokenAddress))); // token_address = ");
    std::println(token_address);
    std::print("publicInputs[1] = bytes32(chainId); // chain_id = ");
    std::println(chain_id);
    std::print("publicInputs[2] = bytes32(expectedRoot); // expected_root = ");
    std::println(root_after_entry);
    std::print("publicInputs[3] = bytes32(receiverPublicKeyX); // receiver_public_key[0] = ");
    std::println(alice_derived_pub_key[0]);
    std::print("publicInputs[4] = bytes32(receiverPublicKeyY); // receiver_public_key[1] = ");
    std::println(alice_derived_pub_key[1]);
    std::print("publicInputs[5] = bytes32(relayerFeeAmount); // relayer_fee_amount = ");
    std::println(relayer_fee_amount);
    std::println("");
    std::println("// Public outputs (11 elements):");
    std::print("publicInputs[6] = bytes32(newCommitmentLeaf); // new_commitment_leaf = ");
    std::println(send_result.0);
    std::print("publicInputs[7] = bytes32(newNonceCommitment); // new_nonce_commitment = ");
    std::println(send_result.1);
    std::print("publicInputs[8] = bytes32(encryptedAmount); // encrypted_note[0] = ");
    std::println(send_result.2[0]);
    std::print("publicInputs[9] = bytes32(encryptedBalance); // encrypted_note[1] = ");
    std::println(send_result.2[1]);
    std::print("publicInputs[10] = bytes32(encryptedNullifier); // encrypted_note[2] = ");
    std::println(send_result.2[2]);
    std::print("publicInputs[11] = bytes32(senderPubKeyX); // sender_pub_key[0] = ");
    std::println(send_result.3[0]);
    std::print("publicInputs[12] = bytes32(senderPubKeyY); // sender_pub_key[1] = ");
    std::println(send_result.3[1]);
    std::print("publicInputs[13] = bytes32(nonceDiscoveryEntryX); // nonce_discovery_entry[0] = ");
    std::println(send_result.4[0]);
    std::print("publicInputs[14] = bytes32(nonceDiscoveryEntryY); // nonce_discovery_entry[1] = ");
    std::println(send_result.4[1]);
    std::print("publicInputs[15] = bytes32(noteCommitmentX); // note_commitment[0] = ");
    std::println(send_result.5[0]);
    std::print("publicInputs[16] = bytes32(noteCommitmentY); // note_commitment[1] = ");
    std::println(send_result.5[1]);
    std::println("");
    
    std::println("✅ Integration test completed successfully!");
    std::println("   Use the publicInputs values above to test the Solidity send() function");
}

/// Test that send fails when previous_unlocks_at is not zero (funds are locked)
#[test(should_fail)]
fn test_send_fails_when_locked() {
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let send_amount = 10 as Field;
    let relayer_fee_amount = 1 as Field;
    
    let previous_nonce = test_previous_nonce();
    let previous_shares = 100 as Field;
    let nullifier = test_nullifier();
    let previous_unlocks_at = 1000 as Field; // Non-zero value (funds are locked)
    
    // Create previous commitment using Pedersen commitment
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let previous_commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    let previous_commitment_leaf = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Setup tree
    let mut side_nodes = [0 as Field; 32];
    let tree_size = 1 as Field;
    let tree_depth = 0 as Field;
    let commitment_index = 0 as Field;
    let expected_root = previous_commitment_leaf;
    let merkle_proof = [0 as Field; 32];
    
    // Get receiver public key
    let receiver_public_key = derive_alice_public_key();
    
    std::println("Testing send with locked funds (previous_unlocks_at != 0)...");
    std::println("  previous_unlocks_at: ");
    std::println(previous_unlocks_at);
    std::println("  This should fail");
    
    // This will fail with assertion error (funds are locked)
    let _result = main(
        user_key,
        token_address,
        send_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        previous_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof,
        receiver_public_key,
        relayer_fee_amount
    );
}

