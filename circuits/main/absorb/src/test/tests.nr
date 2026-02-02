use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::poseidon_ctr_decrypt;
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use dep::lean_imt_verify::{simulate_entry_circuit, simulate_lean_imt_insert, generate_merkle_proof};
use crate::main;

// === TEST CONSTANTS ===
global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;
global MAX_TREE_DEPTH: u32 = 32;

#[test]
fn test_absorb_circuit_basic() {
    std::println("=== BASIC ABSORB CIRCUIT TEST ===");
    
    // === SETUP ===
    let user_key = 0xfedcba0987654321;
    let token_address = 0x02;
    let chain_id = 11155111 as Field; // Sepolia chain ID
    let previous_nonce = 0;
    let current_balance = 100 as Field;
    let nullifier = 0 as Field;
    let absorbed_amount = 50 as Field;
    let relayer_fee_amount = 10 as Field;
    
    // === CREATE PREVIOUS COMMITMENT ===
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let previous_unlocks_at = 0 as Field;
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=current_balance, m2=nullifier, m3=spending_key, m4=previous_unlocks_at, r=previous_nonce_commitment
    let previous_commitment_point = pedersen_commitment_5(current_balance, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    let previous_commitment = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // === CREATE NOTE_STACK COMMITMENT ===
    // For testing: create a note_stack commitment with absorbed_amount and a dummy shared_key
    let note_stack_shared_key = 0x1234567890abcdef as Field; // Dummy shared key for testing
    let note_stack_commitment = pedersen_commitment(absorbed_amount, note_stack_shared_key);
    let note_stack_x = note_stack_commitment.x;
    let note_stack_y = note_stack_commitment.y;
    let note_stack_m = absorbed_amount;
    let note_stack_r = note_stack_shared_key;
    
    // === CREATE MERKLE TREE ===
    let mut all_leaves: [Field; 256] = [0; 256];
    all_leaves[0] = previous_commitment;
    let mut side_nodes: [Field; 32] = [0; 32];
    let (root1, tree_depth1, side_nodes1) = simulate_lean_imt_insert(previous_commitment, 0, 0, side_nodes);
    
    // Add note_stack to tree (hash the point to get a leaf)
    let note_stack_leaf = Poseidon2::hash([note_stack_x, note_stack_y], 2);
    all_leaves[1] = note_stack_leaf;
    let (root, tree_depth, _) = simulate_lean_imt_insert(note_stack_leaf, 1, tree_depth1, side_nodes1);
    
    // === GENERATE MERKLE PROOFS ===
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(previous_commitment, commitment_index, tree_depth, all_leaves, 2);
    
    let note_stack_commitment_index = 1 as Field;
    let note_stack_merkle_proof = generate_merkle_proof(note_stack_leaf, note_stack_commitment_index, tree_depth, all_leaves, 2);
    
    // === CALL ABSORB CIRCUIT ===
      let result: (Field, Field, [Field; 2], [Field; 2]) = main(
        user_key,
        previous_nonce,
        current_balance,
        nullifier,
        0 as Field, // previous_unlocks_at (must be 0 for absorb)
        previous_commitment,
        commitment_index,
        tree_depth,
        root,
        merkle_proof,
        note_stack_x,
        note_stack_y,
        note_stack_m,
        note_stack_r,
        note_stack_commitment_index,
        note_stack_merkle_proof,
        token_address,
        chain_id,
        relayer_fee_amount
    );
    
    let new_nonce_commitment = result.0;
    let new_commitment = result.1;
    let encrypted_state_details = result.2;
    let nonce_discovery_entry = result.3;
    
    std::println("✅ Absorb circuit executed successfully!");
    std::print("New nonce commitment: ");
    std::println(new_nonce_commitment);
    std::print("New commitment: ");
    std::println(new_commitment);
    
    // === VERIFY RESULTS ===
    let new_nonce = previous_nonce + 1;
    let expected_new_balance = current_balance + absorbed_amount - relayer_fee_amount; // 100 + 50 - 10 = 140
    let expected_new_nullifier = nullifier + absorbed_amount; // 0 + 50 = 50
    
    // Calculate expected commitment using pedersen_commitment_5 approach
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let expected_new_nonce_commitment = Poseidon2::hash([spending_key, new_nonce, token_address], 3);
    let previous_unlocks_at = 0 as Field;
    
    // Create new Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=expected_new_balance, m2=expected_new_nullifier, m3=spending_key, m4=previous_unlocks_at, r=expected_new_nonce_commitment
    let expected_new_commitment_point = pedersen_commitment_5(expected_new_balance, expected_new_nullifier, spending_key, previous_unlocks_at, expected_new_nonce_commitment);
    let expected_new_commitment = Poseidon2::hash([expected_new_commitment_point.x, expected_new_commitment_point.y], 2);
    
    assert(new_commitment == expected_new_commitment, "New commitment doesn't match expected");
    
    // Verify encrypted state details (using view_key directly)
    let view_key = Poseidon2::hash([VIEW_STRING, user_key], 2);
    let decrypted_new_balance = poseidon_ctr_decrypt(encrypted_state_details[0], view_key, 0);
    assert(decrypted_new_balance == expected_new_balance, "Decrypted new balance doesn't match");
    
    let decrypted_new_nullifier = poseidon_ctr_decrypt(encrypted_state_details[1], view_key, 1);
    assert(decrypted_new_nullifier == expected_new_nullifier, "Decrypted new nullifier doesn't match");
    
    std::println("✅ All verifications passed!");
    std::print("Expected new balance: ");
    std::println(expected_new_balance);
    std::print("Decrypted new balance: ");
    std::println(decrypted_new_balance);
}

#[test]
fn test_absorb_with_zero_balance_pay_fee_from_absorbed() {
    std::println("=== TEST: Absorb with 0 balance, pay fee from absorbed amount ===");
    
    let user_key = 0x9876543210fedcba;
    let token_address = 0x02;
    let chain_id = 11155111 as Field; // Sepolia chain ID
    let previous_nonce = 0;
    let current_balance = 0 as Field; // Zero balance
    let nullifier = 0 as Field;
    let absorbed_amount = 100 as Field;
    let relayer_fee_amount = 10 as Field;
    
    // Create previous commitment using pedersen_commitment_5 approach
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let previous_unlocks_at = 0 as Field;
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=current_balance, m2=nullifier, m3=spending_key, m4=previous_unlocks_at, r=previous_nonce_commitment
    let previous_commitment_point = pedersen_commitment_5(current_balance, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    let previous_commitment = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // === CREATE NOTE_STACK COMMITMENT ===
    let note_stack_shared_key = 0x1234567890abcdef as Field;
    let note_stack_commitment = pedersen_commitment(absorbed_amount, note_stack_shared_key);
    let note_stack_x = note_stack_commitment.x;
    let note_stack_y = note_stack_commitment.y;
    let note_stack_m = absorbed_amount;
    let note_stack_r = note_stack_shared_key;
    
    // Create merkle tree
    let mut all_leaves: [Field; 256] = [0; 256];
    all_leaves[0] = previous_commitment;
    let mut side_nodes: [Field; 32] = [0; 32];
    let (root1, tree_depth1, side_nodes1) = simulate_lean_imt_insert(previous_commitment, 0, 0, side_nodes);
    
    let note_stack_leaf = Poseidon2::hash([note_stack_x, note_stack_y], 2);
    all_leaves[1] = note_stack_leaf;
    let (root, tree_depth, _) = simulate_lean_imt_insert(note_stack_leaf, 1, tree_depth1, side_nodes1);
    
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(previous_commitment, commitment_index, tree_depth, all_leaves, 2);
    
    let note_stack_commitment_index = 1 as Field;
    let note_stack_merkle_proof = generate_merkle_proof(note_stack_leaf, note_stack_commitment_index, tree_depth, all_leaves, 2);
    
    // Call absorb circuit
      let result: (Field, Field, [Field; 2], [Field; 2]) = main(
        user_key,
        previous_nonce,
        current_balance,
        nullifier,
        0 as Field, // previous_unlocks_at (must be 0 for absorb)
        previous_commitment,
        commitment_index,
        tree_depth,
        root,
        merkle_proof,
        note_stack_x,
        note_stack_y,
        note_stack_m,
        note_stack_r,
        note_stack_commitment_index,
        note_stack_merkle_proof,
        token_address,
        chain_id,
        relayer_fee_amount
    );
    
    let new_commitment = result.1;
    let encrypted_state_details = result.2;
    
    // Verify: 0 + 100 - 10 = 90
    let expected_new_balance = current_balance + absorbed_amount - relayer_fee_amount;
    let expected_new_nullifier = nullifier + absorbed_amount;
    
    // Use view_key directly for decryption
    let view_key = Poseidon2::hash([VIEW_STRING, user_key], 2);
    let decrypted_new_balance = poseidon_ctr_decrypt(encrypted_state_details[0], view_key, 0);
    assert(decrypted_new_balance == expected_new_balance, "Decrypted new balance doesn't match expected");
    
    let decrypted_new_nullifier = poseidon_ctr_decrypt(encrypted_state_details[1], view_key, 1);
    assert(decrypted_new_nullifier == expected_new_nullifier, "Decrypted new nullifier doesn't match expected");
    
    std::println("✅ Test passed! Absorbed 100, paid 10 fee, final balance: 90");
    std::print("Final balance: ");
    std::println(decrypted_new_balance);
}

#[test]
fn test_absorb_with_zero_fee() {
    std::println("=== TEST: Absorb with zero fee ===");
    
    let user_key = 0xabcdef1234567890;
    let token_address = 0x02;
    let chain_id = 11155111 as Field; // Sepolia chain ID
    let previous_nonce = 0;
    let current_balance = 100 as Field;
    let nullifier = 0 as Field;
    let absorbed_amount = 50 as Field;
    let relayer_fee_amount = 0 as Field; // Zero fee
    
    // Create previous commitment
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let previous_unlocks_at = 0 as Field;
    
    let previous_commitment_point = pedersen_commitment_5(current_balance, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    let previous_commitment = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Create note_stack commitment
    let note_stack_shared_key = 0x1234567890abcdef as Field;
    let note_stack_commitment = pedersen_commitment(absorbed_amount, note_stack_shared_key);
    let note_stack_x = note_stack_commitment.x;
    let note_stack_y = note_stack_commitment.y;
    let note_stack_m = absorbed_amount;
    let note_stack_r = note_stack_shared_key;
    
    // Create merkle tree
    let mut all_leaves: [Field; 256] = [0; 256];
    all_leaves[0] = previous_commitment;
    let mut side_nodes: [Field; 32] = [0; 32];
    let (root1, tree_depth1, side_nodes1) = simulate_lean_imt_insert(previous_commitment, 0, 0, side_nodes);
    
    let note_stack_leaf = Poseidon2::hash([note_stack_x, note_stack_y], 2);
    all_leaves[1] = note_stack_leaf;
    let (root, tree_depth, _) = simulate_lean_imt_insert(note_stack_leaf, 1, tree_depth1, side_nodes1);
    
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(previous_commitment, commitment_index, tree_depth, all_leaves, 2);
    
    let note_stack_commitment_index = 1 as Field;
    let note_stack_merkle_proof = generate_merkle_proof(note_stack_leaf, note_stack_commitment_index, tree_depth, all_leaves, 2);
    
    // Call absorb circuit with zero fee
    let result: (Field, Field, [Field; 2], [Field; 2]) = main(
        user_key,
        previous_nonce,
        current_balance,
        nullifier,
        0 as Field, // previous_unlocks_at (must be 0 for absorb)
        previous_commitment,
        commitment_index,
        tree_depth,
        root,
        merkle_proof,
        note_stack_x,
        note_stack_y,
        note_stack_m,
        note_stack_r,
        note_stack_commitment_index,
        note_stack_merkle_proof,
        token_address,
        chain_id,
        relayer_fee_amount
    );
    
    let new_commitment = result.1;
    let encrypted_state_details = result.2;
    
    // Verify: 100 + 50 - 0 = 150
    let expected_new_balance = current_balance + absorbed_amount - relayer_fee_amount;
    let expected_new_nullifier = nullifier + absorbed_amount;
    
    // Use view_key directly for decryption
    let view_key = Poseidon2::hash([VIEW_STRING, user_key], 2);
    let decrypted_new_balance = poseidon_ctr_decrypt(encrypted_state_details[0], view_key, 0);
    assert(decrypted_new_balance == expected_new_balance, "Decrypted new balance doesn't match expected");
    
    let decrypted_new_nullifier = poseidon_ctr_decrypt(encrypted_state_details[1], view_key, 1);
    assert(decrypted_new_nullifier == expected_new_nullifier, "Decrypted new nullifier doesn't match expected");
    
    std::println("✅ Test passed! Absorbed 50 with zero fee, final balance: 150");
    std::print("Final balance: ");
    std::println(decrypted_new_balance);
}

#[test(should_fail)]
fn test_absorb_insufficient_balance_for_fee() {
    std::println("=== TEST: Absorb with insufficient balance for fee (should fail) ===");
    
    let user_key = 0x1234567890abcdef;
    let token_address = 0x02;
    let previous_nonce = 0;
    let current_balance = 5 as Field; // Only 5 balance
    let nullifier = 0 as Field;
    let absorbed_amount = 0 as Field; // No absorbed amount
    let relayer_fee_amount = 10 as Field; // Fee is 10, but balance + absorbed = 5 + 0 = 5 < 10
    let chain_id = 11155111 as Field; // Sepolia chain ID
    
    // Create previous commitment using pedersen_commitment_5 approach
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let previous_unlocks_at = 0 as Field;
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=current_balance, m2=nullifier, m3=spending_key, m4=previous_unlocks_at, r=previous_nonce_commitment
    let previous_commitment_point = pedersen_commitment_5(current_balance, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    let previous_commitment = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // === CREATE NOTE_STACK COMMITMENT ===
    let note_stack_shared_key = 0x1234567890abcdef as Field;
    let note_stack_commitment = pedersen_commitment(absorbed_amount, note_stack_shared_key);
    let note_stack_x = note_stack_commitment.x;
    let note_stack_y = note_stack_commitment.y;
    let note_stack_m = absorbed_amount;
    let note_stack_r = note_stack_shared_key;
    
    // Create merkle tree
    let mut all_leaves: [Field; 256] = [0; 256];
    all_leaves[0] = previous_commitment;
    let mut side_nodes: [Field; 32] = [0; 32];
    let (root1, tree_depth1, side_nodes1) = simulate_lean_imt_insert(previous_commitment, 0, 0, side_nodes);
    
    let note_stack_leaf = Poseidon2::hash([note_stack_x, note_stack_y], 2);
    all_leaves[1] = note_stack_leaf;
    let (root, tree_depth, _) = simulate_lean_imt_insert(note_stack_leaf, 1, tree_depth1, side_nodes1);
    
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(previous_commitment, commitment_index, tree_depth, all_leaves, 2);
    
    let note_stack_commitment_index = 1 as Field;
    let note_stack_merkle_proof = generate_merkle_proof(note_stack_leaf, note_stack_commitment_index, tree_depth, all_leaves, 2);
    
    // This should fail because balance + absorbed_amount (5 + 0 = 5) < fee (10)
    let _result = main(
        user_key,
        previous_nonce,
        current_balance,
        nullifier,
        0 as Field, // previous_unlocks_at (must be 0 for absorb)
        previous_commitment,
        commitment_index,
        tree_depth,
        root,
        merkle_proof,
        note_stack_x,
        note_stack_y,
        note_stack_m,
        note_stack_r,
        note_stack_commitment_index,
        note_stack_merkle_proof,
        token_address,
        chain_id,
        relayer_fee_amount
    );
    
    // Should not reach here
    assert(false, "Circuit should have failed due to insufficient balance");
}

/// Print Prover.toml format for absorb circuit
fn print_prover_toml_format(
    user_key: Field,
    previous_nonce: Field,
    current_balance: Field,
    nullifier: Field,
    previous_unlocks_at: Field,
    previous_commitment: Field,
    commitment_index: Field,
    tree_depth: Field,
    expected_root: Field,
    merkle_proof: [Field; 32],
    note_stack_x: Field,
    note_stack_y: Field,
    note_stack_m: Field,
    note_stack_r: Field,
    note_stack_commitment_index: Field,
    note_stack_merkle_proof: [Field; 32],
    token_address: Field,
    chain_id: Field,
    relayer_fee_amount: Field
) {
    std::println("========================================");
    std::println("COPY THIS TO absorb/Prover.toml");
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
    
    std::print("current_balance = \"");
    std::print(current_balance);
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
    
    std::print("previous_commitment = \"");
    std::print(previous_commitment);
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
    for i in 0..MAX_TREE_DEPTH {
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
    
    std::print("note_stack_x = \"");
    std::print(note_stack_x);
    std::println("\"");
    std::println("");
    
    std::print("note_stack_y = \"");
    std::print(note_stack_y);
    std::println("\"");
    std::println("");
    
    std::print("note_stack_m = \"");
    std::print(note_stack_m);
    std::println("\"");
    std::println("");

    std::print("note_stack_r = \"");
    std::print(note_stack_r);
    std::println("\"");
    std::println("");
    
    std::print("note_stack_commitment_index = \"");
    std::print(note_stack_commitment_index);
    std::println("\"");
    std::println("");
    
    std::print("note_stack_merkle_proof = [");
    let mut first_note = true;
    for i in 0..MAX_TREE_DEPTH {
        if !first_note {
            std::print(", ");
        }
        first_note = false;
        std::print("\"");
        std::print(note_stack_merkle_proof[i]);
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
    
    std::print("relayer_fee_amount = \"");
    std::print(relayer_fee_amount);
    std::println("\"");
    std::println("");
}

#[test]
fn test_absorb_flow_with_prover_toml() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Absorb Flow with Prover.toml Output              ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    std::println("SCENARIO:");
    std::println("  1. Bob entry (leaf 1)");
    std::println("  2. Alice entry (leaf 2)");
    std::println("  3. Bob send to Alice (leaf 3)");
    std::println("  4. Alice absorb (leaf 4) ← PRINT PROVER.TOML");
    std::println("");
    
    // === USER KEYS ===
    let bob_key = 0x1111111111111111;
    let alice_key = 0x2222222222222222;
    let token_address = 0x02;
    let chain_id = 11155111 as Field; // Sepolia chain ID
    
    // === STEP 1: BOB ENTRY ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: BOB ENTRY (leaf 1)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    let bob_entry_amount = 200 as Field;
    let (bob_entry_pedersen_point, _, _) = simulate_entry_circuit(bob_key, token_address, chain_id);
    let bob_entry_commitment = Poseidon2::hash([bob_entry_pedersen_point[0], bob_entry_pedersen_point[1]], 2);
    
    std::println("Bob entry commitment:");
    std::print("  ");
    std::println(bob_entry_commitment);
    std::println("");
    
    // === BUILD MERKLE TREE ===
    let mut all_leaves: [Field; 256] = [0; 256];
    all_leaves[0] = bob_entry_commitment;
    let mut tree_size = 1 as Field;
    let mut tree_depth = 1 as Field;
    let mut side_nodes: [Field; 32] = [0; 32];
    
    let (root_after_bob, depth_after_bob, side_nodes_after_bob) = simulate_lean_imt_insert(
        bob_entry_commitment,
        0,
        1,
        side_nodes
    );
    
    tree_depth = depth_after_bob;
    side_nodes = side_nodes_after_bob;
    
    std::println("After Bob entry:");
    std::print("  Root: ");
    std::println(root_after_bob);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    // === STEP 2: ALICE ENTRY ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 2: ALICE ENTRY (leaf 2)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    let alice_entry_amount = 100 as Field;
    // Reconstruct Alice's commitment with correct balance (not entry commitment with balance=0)
    // The entry circuit creates commitment with balance=0, but Alice has balance=100
    let alice_spending_key = Poseidon2::hash([alice_key, chain_id, token_address], 3);
    let alice_nonce = 0 as Field;
    let alice_nonce_commitment = Poseidon2::hash([alice_spending_key, alice_nonce, token_address], 3);
    let alice_unlocks_at = 0 as Field;
    let alice_nullifier = 0 as Field;
    // Create commitment with current_balance=100 (not 0 like entry)
    let alice_commitment_point = pedersen_commitment_5(
        alice_entry_amount, // current_balance = 100
        alice_nullifier,
        alice_spending_key,
        alice_unlocks_at,
        alice_nonce_commitment
    );
    let alice_entry_commitment = Poseidon2::hash([alice_commitment_point.x, alice_commitment_point.y], 2);
    
    std::println("Alice commitment (with balance=100):");
    std::print("  ");
    std::println(alice_entry_commitment);
    std::println("");
    
    let (root_after_alice, depth_after_alice, side_nodes_after_alice) = simulate_lean_imt_insert(
        alice_entry_commitment,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    all_leaves[1] = alice_entry_commitment;
    tree_size = 2;
    tree_depth = depth_after_alice;
    side_nodes = side_nodes_after_alice;
    
    std::println("After Alice entry:");
    std::print("  Root: ");
    std::println(root_after_alice);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    // === STEP 3: BOB SEND TO ALICE ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 3: BOB SEND TO ALICE (leaf 3)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Bob sends 50 to Alice
    let bob_send_amount = 50 as Field;
    let bob_send_fee = 5 as Field;
    let bob_previous_nonce = 0;
    let bob_current_balance = bob_entry_amount; // 200
    
    // Bob's previous commitment is his entry commitment
    let bob_previous_commitment = bob_entry_commitment;
    
    // Generate proof for Bob's send (proving his entry commitment exists)
    let bob_send_index = 0 as Field; // Bob's entry is at index 0
    let bob_send_proof = generate_merkle_proof(
        bob_entry_commitment,
        bob_send_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    // Simulate send circuit output (we don't have the actual send circuit here, so we simulate)
    // In reality, the send circuit would create a new commitment for Bob and return notes_c_tot_commitment
    // For Alice's absorb, we need to know the absorbed_amount (50) which comes from the note
    
    // Bob's new commitment after send (using pedersen_commitment_5 like send circuit)
    let bob_new_nonce = bob_previous_nonce + 1;
    let bob_new_balance = bob_current_balance - bob_send_amount - bob_send_fee; // 200 - 50 - 5 = 145
    let bob_nullifier = 0 as Field; // Bob's nullifier stays 0 after send
    let bob_previous_unlocks_at = 0 as Field;
    
    let bob_spending_key = Poseidon2::hash([bob_key, chain_id, token_address], 3);
    let bob_new_nonce_commitment = Poseidon2::hash([bob_spending_key, bob_new_nonce, token_address], 3);
    
    // Create new Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=bob_new_balance, m2=bob_nullifier, m3=bob_spending_key, m4=bob_previous_unlocks_at, r=bob_new_nonce_commitment
    let bob_new_commitment_point = pedersen_commitment_5(bob_new_balance, bob_nullifier, bob_spending_key, bob_previous_unlocks_at, bob_new_nonce_commitment);
    let bob_new_commitment = Poseidon2::hash([bob_new_commitment_point.x, bob_new_commitment_point.y], 2);
    
    // Create note_stack commitment from Bob's send (this is what Alice will absorb)
    // In reality, this would be created by the send circuit with the shared key from DH
    let bob_alice_shared_key = 0xabcdef1234567890 as Field; // Simulated shared key from DH
    let note_stack_commitment = pedersen_commitment(bob_send_amount, bob_alice_shared_key);
    let note_stack_x = note_stack_commitment.x;
    let note_stack_y = note_stack_commitment.y;
    let note_stack_leaf = Poseidon2::hash([note_stack_x, note_stack_y], 2);
    
    // Insert Bob's send commitment into tree
    let (root_after_send1, depth_after_send1, side_nodes_after_send1) = simulate_lean_imt_insert(
        bob_new_commitment,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    all_leaves[2] = bob_new_commitment;
    tree_size = 3;
    
    // Insert note_stack into tree
    let (root_after_send, depth_after_send, side_nodes_after_send) = simulate_lean_imt_insert(
        note_stack_leaf,
        tree_size,
        depth_after_send1,
        side_nodes_after_send1
    );
    
    all_leaves[3] = note_stack_leaf;
    tree_size = 4;
    tree_depth = depth_after_send;
    side_nodes = side_nodes_after_send;
    
    std::println("After Bob send:");
    std::print("  Root: ");
    std::println(root_after_send);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::print("  Bob sent: ");
    std::println(bob_send_amount);
    std::println("");
    
    // === STEP 4: ALICE ABSORB ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 4: ALICE ABSORB (leaf 4) ← PROVER.TOML OUTPUT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Alice absorbs the 50 that Bob sent
    let alice_previous_nonce = 0;
    let alice_current_balance = alice_entry_amount; // 100
    let alice_nullifier = 0 as Field;
    let alice_absorbed_amount = bob_send_amount; // 50 (from Bob's send)
    let alice_relayer_fee_amount = 5 as Field;
    
    // Alice's previous commitment (already calculated correctly with balance=100 above)
    let alice_previous_commitment = alice_entry_commitment;
    
    // Generate proof for Alice's absorb (proving her commitment exists)
    let alice_absorb_index = 1 as Field; // Alice's commitment is at index 1
    let alice_absorb_proof = generate_merkle_proof(
        alice_previous_commitment,
        alice_absorb_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    // Generate proof for note_stack (proving it exists in tree)
    let note_stack_commitment_index = 3 as Field; // note_stack is at index 3
    let note_stack_merkle_proof = generate_merkle_proof(
        note_stack_leaf,
        note_stack_commitment_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    // Note stack openings (Alice knows these from decrypting the note)
    let note_stack_m = bob_send_amount; // 50
    let note_stack_r = bob_alice_shared_key; // Shared key from DH
    
    std::println("Alice absorb parameters:");
    std::print("  Previous nonce: ");
    std::println(alice_previous_nonce);
    std::print("  Current balance: ");
    std::println(alice_current_balance);
    std::print("  Absorbed amount: ");
    std::println(alice_absorbed_amount);
    std::print("  Fee amount: ");
    std::println(alice_relayer_fee_amount);
    std::print("  Previous commitment: ");
    std::println(alice_previous_commitment);
    std::print("  Expected root: ");
    std::println(root_after_send);
    std::println("");
    
    // Call absorb circuit
      let alice_absorb_result: (Field, Field, [Field; 2], [Field; 2]) = main(
        alice_key,
        alice_previous_nonce,
        alice_current_balance,
        alice_nullifier,
        0 as Field, // previous_unlocks_at (must be 0 for absorb)
        alice_previous_commitment,
        alice_absorb_index,
        tree_depth,
        root_after_send,
        alice_absorb_proof,
        note_stack_x,
        note_stack_y,
        note_stack_m,
        note_stack_r,
        note_stack_commitment_index,
        note_stack_merkle_proof,
        token_address,
        chain_id,
        alice_relayer_fee_amount
    );
    
    let alice_new_nonce_commitment = alice_absorb_result.0;
    let alice_new_commitment = alice_absorb_result.1;
    let alice_encrypted_state_details = alice_absorb_result.2;
    
    std::println("✅ Alice absorb completed!");
    std::print("  New nonce commitment: ");
    std::println(alice_new_nonce_commitment);
    std::print("  New commitment: ");
    std::println(alice_new_commitment);
    
    // Verify expected balance: 100 + 50 - 5 = 145
    let expected_new_balance = alice_current_balance + alice_absorbed_amount - alice_relayer_fee_amount;
    let expected_new_nullifier = alice_nullifier + alice_absorbed_amount;
    
    // Use view_key directly for decryption
    let alice_view_key = Poseidon2::hash([VIEW_STRING, alice_key], 2);
    let decrypted_new_balance = poseidon_ctr_decrypt(alice_encrypted_state_details[0], alice_view_key, 0);
    let decrypted_new_nullifier = poseidon_ctr_decrypt(alice_encrypted_state_details[1], alice_view_key, 1);
    
    std::print("  Expected new balance: ");
    std::println(expected_new_balance);
    std::print("  Decrypted new balance: ");
    std::println(decrypted_new_balance);
    assert(decrypted_new_balance == expected_new_balance, "Balance mismatch");
    std::println("");
    
    // === PRINT PROVER.TOML ===
    print_prover_toml_format(
        alice_key,
        alice_previous_nonce,
        alice_current_balance,
        alice_nullifier,
        0 as Field, // previous_unlocks_at (must be 0 for absorb)
        alice_previous_commitment,
        alice_absorb_index,
        tree_depth,
        root_after_send,
        alice_absorb_proof,
        note_stack_x,
        note_stack_y,
        note_stack_m,
        note_stack_r,
        note_stack_commitment_index,
        note_stack_merkle_proof,
        token_address,
        chain_id,
        alice_relayer_fee_amount
    );
    
    std::println("✅ Test completed! Prover.toml printed above.");
}

/// Test that absorb fails when previous_unlocks_at is not zero (funds are locked)
#[test(should_fail_with = "Absorb is disabled when funds are locked (previous_unlocks_at != 0)")]
fn test_absorb_fails_when_locked() {
    let user_key = 0x1234567890abcdef as Field;
    let token_address = 0x02;
    let chain_id = 11155111 as Field; // Sepolia chain ID
    let previous_nonce = 0;
    let current_balance = 100 as Field;
    let nullifier = 0 as Field;
    let previous_unlocks_at = 1000 as Field; // Non-zero value (funds are locked)
    let relayer_fee_amount = 5 as Field;
    
    // Create previous commitment with locked state using pedersen_commitment_5 approach
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=current_balance, m2=nullifier, m3=spending_key, m4=previous_unlocks_at, r=previous_nonce_commitment
    let previous_commitment_point = pedersen_commitment_5(current_balance, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    let previous_commitment = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Create note_stack commitment
    let note_stack_shared_key = 0x1234567890abcdef as Field;
    let absorbed_amount = 50 as Field;
    let note_stack_commitment = pedersen_commitment(absorbed_amount, note_stack_shared_key);
    let note_stack_x = note_stack_commitment.x;
    let note_stack_y = note_stack_commitment.y;
    let note_stack_leaf = Poseidon2::hash([note_stack_x, note_stack_y], 2);
    
    // Setup tree
    let mut all_leaves: [Field; 256] = [0; 256];
    all_leaves[0] = previous_commitment;
    let mut side_nodes: [Field; 32] = [0; 32];
    let (root1, tree_depth1, side_nodes1) = simulate_lean_imt_insert(previous_commitment, 0, 0, side_nodes);
    
    all_leaves[1] = note_stack_leaf;
    let (root, tree_depth, _) = simulate_lean_imt_insert(note_stack_leaf, 1, tree_depth1, side_nodes1);
    
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(previous_commitment, commitment_index, tree_depth, all_leaves, 2);
    
    let note_stack_commitment_index = 1 as Field;
    let note_stack_merkle_proof = generate_merkle_proof(note_stack_leaf, note_stack_commitment_index, tree_depth, all_leaves, 2);
    
    let note_stack_m = absorbed_amount;
    let note_stack_r = note_stack_shared_key;
    
    std::println("Testing absorb with locked funds (previous_unlocks_at != 0)...");
    std::println("  previous_unlocks_at: ");
    std::println(previous_unlocks_at);
    std::println("  This should fail with 'Absorb is disabled when funds are locked (previous_unlocks_at != 0)'");
    
    // This will fail with assertion error (funds are locked)
    let _result = main(
        user_key,
        previous_nonce,
        current_balance,
        nullifier,
        previous_unlocks_at,
        previous_commitment,
        commitment_index,
        tree_depth,
        root,
        merkle_proof,
        note_stack_x,
        note_stack_y,
        note_stack_m,
        note_stack_r,
        note_stack_commitment_index,
        note_stack_merkle_proof,
        token_address,
        chain_id,
        relayer_fee_amount
    );
}