use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::{poseidon_ctr_encrypt};
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use dep::lean_imt_verify::{
    simulate_entry_circuit,
    simulate_lean_imt_insert,
    generate_merkle_proof
};
use crate::main;

// === TEST CONSTANTS ===
global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;

/// Get test user key
fn test_user_key() -> Field { 0x19e573f3801c7b2e4619998342e8e305e1692184cbacd220c04198a04c36b7d2 as Field }

/// Get test token address (USDC)65th
fn test_token_address() -> Field { 0x7775e4b6f4d40be537b55b6c47e09ada0157bd as Field }

/// Get test previous nonce
fn test_previous_nonce() -> Field { 0x00 as Field }

/// Get test deposit amount (50 USDC)
fn test_deposit_amount() -> Field { 0x32 as Field }

/// Get test current balance (100 USDC)
fn test_current_balance() -> Field { 0x64 as Field }

/// Get test nullifier
fn test_nullifier() -> Field { 0x1234567890abcdef as Field }

// === TEST HELPER FUNCTIONS ===


/// Create a previous commitment from balance and nullifier (for deposit)
fn create_previous_commitment(
    balance: Field,
    nullifier: Field,
    user_key: Field,
    previous_nonce: Field,
    chain_id: Field,
    token_address: Field
) -> Field {
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let state_digest = Poseidon2::hash([balance, nullifier, spending_key], 3);
    
    Poseidon2::hash([previous_nonce_commitment, state_digest], 2)
}

/// Print Prover.toml format for easy copy-paste
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
    merkle_proof: [Field; 32]
) {
    std::println("========================================");
    std::println("COPY THIS TO deposit/Prover.toml");
    std::println("========================================");
    std::println("");
    
    // Basic parameters
    std::print("user_key = \"");
    std::print(user_key);
    std::println("\"");
    std::println("");
    
    std::print("token_address = \"");
    std::print(token_address);
    std::println("\"");
    std::println("");
    
    std::print("amount = \"");
    std::print(amount);
    std::println("\"");
    std::println("");
    
    std::print("chain_id = \"");
    std::print(chain_id);
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
    
    // Merkle proof parameters
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
    
    // Merkle proof array
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
}

// === MAIN TEST FUNCTION ===

#[test]
fn test_deposit_flow() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Deposit Flow                                      ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    std::println("SCENARIO:");
    std::println("  1. Entry: User creates initial commitment (balance=100)");
    std::println("  2. Deposit 50: commitment #2 (balance=150)");
    std::println("  3. Deposit 50: commitment #3 (balance=200)");
    std::println("  4. Deposit 50: commitment #4 (balance=250)");
    std::println("  5. Deposit 50: commitment #5 (balance=300) ← PRINT PROVER.TOML");
    std::println("");
    
    // === SETUP ===
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field; // Mainnet chain ID
    let deposit_amount = test_deposit_amount(); // 50 USDC
    let initial_balance = test_current_balance(); // 100 USDC
    let nullifier = 0 as Field; // Entry uses nullifier=0
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: SIMULATE ENTRY CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 1: Simulate entry circuit ===
    let (entry_pedersen_point, entry_nonce_commitment, _entry_nonce_discovery) = simulate_entry_circuit(
        user_key,
        token_address,
        chain_id
    );
    
    // Hash the Pedersen commitment point to create the leaf (as contract does)
    let entry_commitment_leaf = Poseidon2::hash([entry_pedersen_point[0], entry_pedersen_point[1]], 2);
    
    std::println("Entry circuit output:");
    std::print("  Entry Pedersen point x: ");
    std::println(entry_pedersen_point[0]);
    std::print("  Entry Pedersen point y: ");
    std::println(entry_pedersen_point[1]);
    std::print("  Entry nonce commitment: ");
    std::println(entry_nonce_commitment);
    std::print("  Entry commitment leaf (hash of point): ");
    std::println(entry_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 2: SIMULATE LEAN IMT - INSERT ENTRY");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 2: Insert entry into tree ===
    // Start with depth=1 instead of depth=0 to avoid edge cases
    let mut tree_size = 0 as Field;
    let mut tree_depth = 1 as Field; // Start at depth=1
    let mut side_nodes: [Field; 32] = [0; 32];
    let mut all_leaves: [Field; 256] = [0; 256]; // Track all leaves for proof generation
    
    let (root_after_entry, depth_after_entry, side_nodes_after_entry) = simulate_lean_imt_insert(
        entry_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    // Save the entry commitment leaf as first leaf
    all_leaves[0] = entry_commitment_leaf;
    
    tree_size = 1;
    tree_depth = depth_after_entry;
    side_nodes = side_nodes_after_entry;
    
    std::println("After entry insertion:");
    std::print("  Root: ");
    std::println(root_after_entry);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 3: FIRST DEPOSIT (50 USDC)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 3: First deposit ===
    let first_deposit_nonce = 0 as Field;
    let first_deposit_previous_shares = 0 as Field; // Entry starts with 0 shares
    
    // Generate proof for first deposit (proving entry commitment leaf exists)
    let first_deposit_index = 0 as Field;
    let first_deposit_proof = generate_merkle_proof(
        entry_commitment_leaf,
        first_deposit_index,
        tree_depth,
        all_leaves,  // Pass all leaves for proper proof generation
        tree_size
    );
    
    std::println("Calling main() for first deposit with:");
    std::print("  previous_nonce: ");
    std::println(first_deposit_nonce);
    std::print("  previous_shares: ");
    std::println(first_deposit_previous_shares);
    std::print("  previous_nonce_commitment: ");
    std::println(entry_nonce_commitment);
    std::print("  previous_commitment_leaf: ");
    std::println(entry_commitment_leaf);
    std::print("  expected_root: ");
    std::println(root_after_entry);
    std::println("");
    
    // Execute first deposit circuit
    // Entry circuit initializes unlocks_at to 0 (no lock)
    let previous_unlocks_at = 0 as Field;
    let first_deposit_result: ([Field; 2], [Field; 2], [Field; 2], Field) = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        first_deposit_nonce,
        first_deposit_previous_shares,
        nullifier,
        previous_unlocks_at,
        entry_commitment_leaf,  // Previous commitment leaf (hash of Pedersen point)
        first_deposit_index,
        tree_depth,
        root_after_entry,
        first_deposit_proof
    );
    
    let first_deposit_pedersen_point: [Field; 2] = first_deposit_result.0;
    let first_deposit_nonce_commitment = first_deposit_result.3;
    
    // Hash the Pedersen commitment point to create the leaf (as contract does)
    let first_deposit_commitment_leaf = Poseidon2::hash([first_deposit_pedersen_point[0], first_deposit_pedersen_point[1]], 2);
    
    std::println("First deposit completed:");
    std::print("  Previous shares: ");
    std::println(first_deposit_previous_shares);
    std::print("  Deposit amount: ");
    std::println(deposit_amount);
    std::print("  New Pedersen point x: ");
    std::println(first_deposit_pedersen_point[0]);
    std::print("  New Pedersen point y: ");
    std::println(first_deposit_pedersen_point[1]);
    std::print("  New commitment leaf: ");
    std::println(first_deposit_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 4: INSERT FIRST DEPOSIT INTO TREE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 4: Insert first deposit into tree ===
    // Note: In real contract, it would add shares*G to the Pedersen point first, then hash
    // For test, we just use the circuit output directly
    let (root_after_first_deposit, depth_after_first_deposit, side_nodes_after_first_deposit) = simulate_lean_imt_insert(
        first_deposit_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    // Save first deposit commitment leaf as second leaf
    all_leaves[1] = first_deposit_commitment_leaf;
    
    tree_size = 2;
    tree_depth = depth_after_first_deposit;
    side_nodes = side_nodes_after_first_deposit;
    
    std::println("After first deposit insertion:");
    std::print("  Root: ");
    std::println(root_after_first_deposit);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 5: SECOND DEPOSIT (50 USDC) - WITH REAL PROOF");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 5: Second deposit ===
    let second_deposit_nonce = 1 as Field;
    // For test, we'll use a placeholder for previous_shares
    // In reality, this would be the shares from first deposit (after contract added shares*G)
    // For testing, we'll use 0 as placeholder (circuit just verifies the commitment structure)
    let second_deposit_previous_shares = 0 as Field; // Placeholder - in real flow this would be shares from first deposit
    
    // Generate proof for second deposit (proving first deposit commitment leaf exists)
    // First deposit is at index 1
    let second_deposit_index = 1 as Field;
    let second_deposit_proof = generate_merkle_proof(
        first_deposit_commitment_leaf,
        second_deposit_index,
        tree_depth,  // depth after first deposit
        all_leaves,  // Pass all leaves for proper proof generation
        tree_size    // size after first deposit = 2
    );
    
    std::println("Calling main() for second deposit with:");
    std::print("  previous_nonce: ");
    std::println(second_deposit_nonce);
    std::print("  previous_shares: ");
    std::println(second_deposit_previous_shares);
    std::print("  previous_nonce_commitment: ");
    std::println(first_deposit_nonce_commitment);
    std::print("  previous_commitment_leaf: ");
    std::println(first_deposit_commitment_leaf);
    std::print("  expected_root: ");
    std::println(root_after_first_deposit);
    std::println("");
    
    // Execute second deposit circuit
    // Use same unlocks_at from first deposit (unchanged)
    let second_deposit_result: ([Field; 2], [Field; 2], [Field; 2], Field) = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        second_deposit_nonce,
        second_deposit_previous_shares,
        nullifier,
        previous_unlocks_at,
        first_deposit_commitment_leaf,  // Previous commitment leaf
        second_deposit_index,
        tree_depth,
        root_after_first_deposit,
        second_deposit_proof
    );
    
    let second_deposit_pedersen_point: [Field; 2] = second_deposit_result.0;
    let second_deposit_nonce_commitment = second_deposit_result.3;
    
    // Hash the Pedersen commitment point to create the leaf
    let second_deposit_commitment_leaf = Poseidon2::hash([second_deposit_pedersen_point[0], second_deposit_pedersen_point[1]], 2);
    
    std::println("Second deposit completed:");
    std::print("  Previous shares: ");
    std::println(second_deposit_previous_shares);
    std::print("  Deposit amount: ");
    std::println(deposit_amount);
    std::print("  New Pedersen point x: ");
    std::println(second_deposit_pedersen_point[0]);
    std::print("  New Pedersen point y: ");
    std::println(second_deposit_pedersen_point[1]);
    std::print("  New commitment leaf: ");
    std::println(second_deposit_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 6: INSERT SECOND DEPOSIT INTO TREE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 6: Insert second deposit into tree ===
    let (root_after_second_deposit, depth_after_second_deposit, side_nodes_after_second_deposit) = simulate_lean_imt_insert(
        second_deposit_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    // Save second deposit commitment leaf as third leaf
    all_leaves[2] = second_deposit_commitment_leaf;
    
    tree_size = 3;
    tree_depth = depth_after_second_deposit;
    side_nodes = side_nodes_after_second_deposit;
    
    std::println("After second deposit insertion:");
    std::print("  Root: ");
    std::println(root_after_second_deposit);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 7: THIRD DEPOSIT (50 USDC)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 7: Third deposit ===
    let third_deposit_nonce = 2 as Field;
    let third_deposit_previous_shares = 0 as Field; // Placeholder - in real flow this would be shares from second deposit
    
    // Generate proof for third deposit
    let third_deposit_index = 2 as Field;
    let third_deposit_proof = generate_merkle_proof(
        second_deposit_commitment_leaf,
        third_deposit_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    std::println("Calling main() for third deposit with:");
    std::print("  previous_nonce: ");
    std::println(third_deposit_nonce);
    std::print("  previous_shares: ");
    std::println(third_deposit_previous_shares);
    std::print("  previous_nonce_commitment: ");
    std::println(second_deposit_nonce_commitment);
    std::print("  previous_commitment_leaf: ");
    std::println(second_deposit_commitment_leaf);
    std::print("  expected_root: ");
    std::println(root_after_second_deposit);
    std::println("");
    
    // Execute third deposit circuit
    // Use same unlocks_at (unchanged)
    let third_deposit_result: ([Field; 2], [Field; 2], [Field; 2], Field) = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        third_deposit_nonce,
        third_deposit_previous_shares,
        nullifier,
        previous_unlocks_at,
        second_deposit_commitment_leaf,  // Previous commitment leaf
        third_deposit_index,
        tree_depth,
        root_after_second_deposit,
        third_deposit_proof
    );
    
    let third_deposit_pedersen_point: [Field; 2] = third_deposit_result.0;
    let third_deposit_nonce_commitment = third_deposit_result.3;
    
    // Hash the Pedersen commitment point to create the leaf
    let third_deposit_commitment_leaf = Poseidon2::hash([third_deposit_pedersen_point[0], third_deposit_pedersen_point[1]], 2);
    
    std::println("Third deposit completed:");
    std::print("  Previous shares: ");
    std::println(third_deposit_previous_shares);
    std::print("  Deposit amount: ");
    std::println(deposit_amount);
    std::print("  New Pedersen point x: ");
    std::println(third_deposit_pedersen_point[0]);
    std::print("  New Pedersen point y: ");
    std::println(third_deposit_pedersen_point[1]);
    std::print("  New commitment leaf: ");
    std::println(third_deposit_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 8: INSERT THIRD DEPOSIT INTO TREE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 8: Insert third deposit into tree ===
    let (root_after_third_deposit, depth_after_third_deposit, side_nodes_after_third_deposit) = simulate_lean_imt_insert(
        third_deposit_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    // Save third deposit commitment leaf as fourth leaf
    all_leaves[3] = third_deposit_commitment_leaf;
    
    tree_size = 4;
    tree_depth = depth_after_third_deposit;
    side_nodes = side_nodes_after_third_deposit;
    
    std::println("After third deposit insertion:");
    std::print("  Root: ");
    std::println(root_after_third_deposit);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 9: FOURTH DEPOSIT (50 USDC)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 9: Fourth deposit ===
    let fourth_deposit_nonce = 3 as Field;
    let fourth_deposit_previous_shares = 0 as Field; // Placeholder - in real flow this would be shares from third deposit
    
    // Generate proof for fourth deposit
    let fourth_deposit_index = 3 as Field;
    let fourth_deposit_proof = generate_merkle_proof(
        third_deposit_commitment_leaf,
        fourth_deposit_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    std::println("Calling main() for fourth deposit with:");
    std::print("  previous_nonce: ");
    std::println(fourth_deposit_nonce);
    std::print("  previous_shares: ");
    std::println(fourth_deposit_previous_shares);
    std::print("  previous_nonce_commitment: ");
    std::println(third_deposit_nonce_commitment);
    std::print("  previous_commitment_leaf: ");
    std::println(third_deposit_commitment_leaf);
    std::print("  expected_root: ");
    std::println(root_after_third_deposit);
    std::println("");
    
    // Execute fourth deposit circuit
    // Use same unlocks_at (unchanged)
    let fourth_deposit_result: ([Field; 2], [Field; 2], [Field; 2], Field) = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        fourth_deposit_nonce,
        fourth_deposit_previous_shares,
        nullifier,
        previous_unlocks_at,
        third_deposit_commitment_leaf,  // Previous commitment leaf
        fourth_deposit_index,
        tree_depth,
        root_after_third_deposit,
        fourth_deposit_proof
    );
    
    let fourth_deposit_pedersen_point: [Field; 2] = fourth_deposit_result.0;
    let fourth_deposit_nonce_commitment = fourth_deposit_result.3;
    
    // Hash the Pedersen commitment point to create the leaf
    let fourth_deposit_commitment_leaf = Poseidon2::hash([fourth_deposit_pedersen_point[0], fourth_deposit_pedersen_point[1]], 2);
    
    std::println("Fourth deposit completed:");
    std::print("  Previous shares: ");
    std::println(fourth_deposit_previous_shares);
    std::print("  Deposit amount: ");
    std::println(deposit_amount);
    std::print("  New Pedersen point x: ");
    std::println(fourth_deposit_pedersen_point[0]);
    std::print("  New Pedersen point y: ");
    std::println(fourth_deposit_pedersen_point[1]);
    std::print("  New commitment leaf: ");
    std::println(fourth_deposit_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 10: INSERT FOURTH DEPOSIT INTO TREE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 10: Insert fourth deposit into tree ===
    let (root_after_fourth_deposit, depth_after_fourth_deposit, side_nodes_after_fourth_deposit) = simulate_lean_imt_insert(
        fourth_deposit_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    // Save fourth deposit commitment leaf as fifth leaf
    all_leaves[4] = fourth_deposit_commitment_leaf;
    
    tree_size = 5;
    tree_depth = depth_after_fourth_deposit;
    side_nodes = side_nodes_after_fourth_deposit;
    
    std::println("After fourth deposit insertion:");
    std::print("  Root: ");
    std::println(root_after_fourth_deposit);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("✅ All 4 deposits completed successfully!");
    std::println("");
    
    // === GENERATE PROVER.TOML FOR FIFTH COMMITMENT (4TH DEPOSIT) ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("PROVER.TOML FOR 5TH COMMITMENT (4TH DEPOSIT)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("This Prover.toml is for the 4TH deposit (5th commitment total).");
    std::println("Tree now has 5 leaves with a proper merkle proof structure.");
    std::println("");
    
    print_prover_toml_format(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        fourth_deposit_nonce,
        fourth_deposit_previous_shares,
        nullifier,
        0 as Field, // previous_unlocks_at (must be 0 for deposit)
        third_deposit_commitment_leaf,
        fourth_deposit_index,
        depth_after_third_deposit,
        root_after_third_deposit,
        fourth_deposit_proof
    );
    let _ = tree_depth; // Use variable
    let _ = root_after_third_deposit; // Use variable
    let _ = depth_after_third_deposit; // Use variable
}




// === TEST: Verify nonce discovery entry ===
#[test]
fn test_nonce_discovery_entry() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Nonce Discovery Entry                            ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field; // Mainnet chain ID
    let previous_nonce = test_previous_nonce();
    let new_nonce = previous_nonce + 1;
    
    // Calculate new nonce commitment
    // Hash user_key with chain_id and token_address to prevent cross-chain/token overlap
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let new_nonce_commitment = Poseidon2::hash([spending_key, new_nonce as Field, token_address], 3);
    let _ = new_nonce; // Use variable
    
    // Calculate nonce discovery entry
    let nonce_discovery_entry = pedersen_commitment(new_nonce as Field, new_nonce_commitment);
    let _ = new_nonce_commitment; // Use variable
    let _ = pedersen_commitment; // Use variable
    
    assert(nonce_discovery_entry.x != 0);
    assert(nonce_discovery_entry.y != 0);
    
    std::println("✅ Nonce discovery entry verified!");
    std::println("  - New nonce: ");
    std::println(new_nonce);
    std::println("  - New nonce commitment: ");
    std::println(new_nonce_commitment);
    std::println("  - Nonce discovery entry x: ");
    std::println(nonce_discovery_entry.x);
    std::println("  - Nonce discovery entry y: ");
    std::println(nonce_discovery_entry.y);
    std::println("");
}

/// Test deposit with previous_unlocks_at == 0 (normal deposit, should succeed)
#[test]
fn test_deposit_normal() {
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let deposit_amount = 50 as Field;
    
    // Simulate entry circuit
    let (entry_commitment_point, entry_nonce_commitment, _) = simulate_entry_circuit(user_key, token_address, chain_id);
    let entry_commitment_leaf = Poseidon2::hash([entry_commitment_point[0], entry_commitment_point[1]], 2);
    
    // Setup for deposit - use parameters that match the entry circuit
    let previous_nonce = 0 as Field; // Entry uses nonce = 0
    let previous_shares = 0 as Field; // Entry uses shares = 0
    let nullifier = 0 as Field; // Entry uses nullifier = 0
    let previous_unlocks_at = 0 as Field; // Entry initializes to 0
    
    // Create dummy merkle proof (for testing)
    let mut merkle_proof = [0 as Field; 32];
    let commitment_index = 0 as Field;
    let tree_depth = 1 as Field;
    let expected_root = entry_commitment_leaf; // For single leaf tree
    
    // Execute deposit with previous_unlocks_at == 0 (should succeed)
    let result: ([Field; 2], [Field; 2], [Field; 2], Field) = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof
    );
    
    std::println("✅ Normal deposit test passed (previous_unlocks_at == 0)");
    std::println("  - deposit_amount: ");
    std::println(deposit_amount);
    std::println("  - New commitment point x: ");
    std::println(result.0[0]);
    std::println("  - New commitment point y: ");
    std::println(result.0[1]);
}

/// Test that deposit fails when previous_unlocks_at is not zero (funds are locked)
#[test(should_fail_with = "Deposit is disabled when funds are locked (previous_unlocks_at != 0)")]
fn test_deposit_fails_when_locked() {
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let deposit_amount = 50 as Field;
    
    // Simulate entry circuit
    let (entry_commitment_point, entry_nonce_commitment, _) = simulate_entry_circuit(user_key, token_address, chain_id);
    let entry_commitment_leaf = Poseidon2::hash([entry_commitment_point[0], entry_commitment_point[1]], 2);
    
    // Setup for deposit - use parameters that match the entry circuit
    let previous_nonce = 0 as Field;
    let previous_shares = 0 as Field;
    let nullifier = 0 as Field;
    let previous_unlocks_at = 1000 as Field; // Non-zero value (funds are locked)
    
    std::println("Testing deposit with locked funds (previous_unlocks_at != 0)...");
    std::println("  previous_unlocks_at: ");
    std::println(previous_unlocks_at);
    std::println("  This should fail with 'Deposit is disabled when funds are locked (previous_unlocks_at != 0)'");
    
    // Create a commitment that matches the locked state
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment_locked = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let previous_commitment_point_locked = pedersen_commitment_5(previous_shares, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment_locked);
    let previous_commitment_leaf_locked = Poseidon2::hash([previous_commitment_point_locked.x, previous_commitment_point_locked.y], 2);
    
    // Build a merkle tree with the locked commitment so the proof verification passes
    // This allows us to test the previous_unlocks_at check
    let mut tree_size = 0 as Field;
    let mut tree_depth = 1 as Field;
    let mut side_nodes: [Field; 32] = [0; 32];
    
    let (expected_root_locked, depth_locked, _side_nodes_locked) = simulate_lean_imt_insert(
        previous_commitment_leaf_locked,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    // Create dummy merkle proof (for single leaf tree, proof is all zeros)
    let mut merkle_proof = [0 as Field; 32];
    let commitment_index = 0 as Field;
    
    // This will fail with assertion error at the previous_unlocks_at check (line 66 in main.nr)
    let _result = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        previous_commitment_leaf_locked,
        commitment_index,
        depth_locked,
        expected_root_locked,
        merkle_proof
    );
}

/// Test to verify deposit circuit output structure and values
#[test]
fn test_output() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Deposit Circuit Output Verification              ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let deposit_amount = 50 as Field;
    
    // Simulate entry circuit to get previous commitment
    let (entry_commitment_point, entry_nonce_commitment, _) = simulate_entry_circuit(user_key, token_address, chain_id);
    let entry_commitment_leaf = Poseidon2::hash([entry_commitment_point[0], entry_commitment_point[1]], 2);
    
    // Setup for deposit
    let previous_nonce = 0 as Field;
    let previous_shares = 0 as Field;
    let nullifier = 0 as Field;
    let previous_unlocks_at = 0 as Field;
    
    // Create dummy merkle proof
    let mut merkle_proof = [0 as Field; 32];
    let commitment_index = 0 as Field;
    let tree_depth = 1 as Field;
    let expected_root = entry_commitment_leaf;
    
    std::println("Calling deposit circuit main()...");
    std::println("");
    
    // Execute deposit circuit
    let result: ([Field; 2], [Field; 2], [Field; 2], Field) = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof
    );
    
    // Extract return values
    // New order: ([Field; 2], [Field; 2], [Field; 2], Field)
    // result.0 = commitment_point
    // result.1 = encrypted_state_details
    // result.2 = nonce_discovery_entry
    // result.3 = new_nonce_commitment
    let commitment_point: [Field; 2] = result.0;
    let encrypted_state_details: [Field; 2] = result.1;
    let nonce_discovery_entry: [Field; 2] = result.2;
    let new_nonce_commitment: Field = result.3;
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("DEPOSIT CIRCUIT OUTPUT:");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Return structure: ([Field; 2], [Field; 2], [Field; 2], Field)");
    std::println("");
    
    std::println("1. Commitment Point (result.0):");
    std::print("   commitment_point[0] (x): ");
    std::println(commitment_point[0]);
    std::print("   commitment_point[1] (y): ");
    std::println(commitment_point[1]);
    std::println("");
    
    std::println("2. Encrypted State Details (result.1):");
    std::print("   encrypted_state_details[0] (encryptedBalance): ");
    std::println(encrypted_state_details[0]);
    std::print("   encrypted_state_details[1] (encryptedNullifier): ");
    std::println(encrypted_state_details[1]);
    std::println("");
    
    std::println("3. Nonce Discovery Entry (result.2):");
    std::print("   nonce_discovery_entry[0] (x): ");
    std::println(nonce_discovery_entry[0]);
    std::print("   nonce_discovery_entry[1] (y): ");
    std::println(nonce_discovery_entry[1]);
    std::println("");
    
    std::println("4. New Nonce Commitment (result.3):");
    std::print("   new_nonce_commitment: ");
    std::println(new_nonce_commitment);
    std::print("   Is zero? ");
    if new_nonce_commitment == 0 {
        std::println("❌ YES - THIS IS THE BUG!");
    } else {
        std::println("✅ NO - Correct!");
    }
    std::println("");
    
    // Verify new_nonce_commitment is computed correctly
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let expected_nonce = previous_nonce + 1;
    let expected_new_nonce_commitment = Poseidon2::hash([spending_key, expected_nonce as Field, token_address], 3);
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("VERIFICATION:");
    std::println("═══════════════════════════════════════════════════════════════");
    std::print("Expected new_nonce_commitment: ");
    std::println(expected_new_nonce_commitment);
    std::print("Actual new_nonce_commitment:   ");
    std::println(new_nonce_commitment);
    std::print("Match: ");
    if new_nonce_commitment == expected_new_nonce_commitment {
        std::println("✅ YES");
    } else {
        std::println("❌ NO - MISMATCH!");
    }
    std::println("");
    
    // Verify nonce_discovery_entry uses new_nonce_commitment
    let expected_nonce_discovery_entry = pedersen_commitment(1, new_nonce_commitment);
    std::print("Expected nonce_discovery_entry.x: ");
    std::println(expected_nonce_discovery_entry.x);
    std::print("Actual nonce_discovery_entry.x:   ");
    std::println(nonce_discovery_entry[0]);
    std::print("Match: ");
    if nonce_discovery_entry[0] == expected_nonce_discovery_entry.x {
        std::println("✅ YES");
    } else {
        std::println("❌ NO - MISMATCH!");
    }
    std::println("");
    
    // Assertions
    assert(new_nonce_commitment != 0, "new_nonce_commitment must not be zero");
    assert(new_nonce_commitment == expected_new_nonce_commitment, "new_nonce_commitment must match expected value");
    assert(nonce_discovery_entry[0] == expected_nonce_discovery_entry.x, "nonce_discovery_entry.x must match expected value");
    assert(nonce_discovery_entry[1] == expected_nonce_discovery_entry.y, "nonce_discovery_entry.y must match expected value");
    
    std::println("✅ All assertions passed!");
    std::println("");
}

/// Full integration test: Entry + Deposit
/// This test simulates a complete flow: 1 entry followed by 1 deposit
/// All outputs are printed in a format suitable for testing the Solidity contract
#[test]
fn test_entry_then_deposit_integration() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      INTEGRATION TEST: Entry + Deposit                      ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    // === SETUP ===
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 11155111 as Field; // Sepolia chain ID
    let nullifier = 0 as Field; // Entry uses nullifier = 0
    
    // Entry parameters
    let entry_amount = 1000000 as Field; // 1,000,000 (will be added by contract) - larger amount to avoid Aave conversion underflow
    
    // Deposit parameters
    let deposit_amount = 500000 as Field; // Deposit 500,000 - large enough to avoid Aave conversion issues
    let previous_shares = 0 as Field; // After entry, we start with 0 shares (entry has balance=0)
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: EXECUTE ENTRY CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Simulate entry circuit
    let (entry_pedersen_point, entry_nonce_commitment, entry_nonce_discovery) = simulate_entry_circuit(
        user_key,
        token_address,
        chain_id
    );
    
    std::println("Entry circuit outputs:");
    std::print("  Entry Pedersen point x: ");
    std::println(entry_pedersen_point[0]);
    std::print("  Entry Pedersen point y: ");
    std::println(entry_pedersen_point[1]);
    std::print("  Entry nonce commitment: ");
    std::println(entry_nonce_commitment);
    std::print("  Entry nonce discovery entry: [");
    std::print(entry_nonce_discovery[0]);
    std::print(", ");
    std::print(entry_nonce_discovery[1]);
    std::println("]");
    std::println("");
    
    // Hash the Pedersen commitment point to create the leaf (as contract does)
    // Note: Contract will add shares*G and unlocks_at*K before hashing
    // For entry, shares=entry_amount and unlocks_at=0
    let entry_commitment_leaf = Poseidon2::hash([entry_pedersen_point[0], entry_pedersen_point[1]], 2);
    
    std::print("  Entry commitment leaf (hash of point): ");
    std::println(entry_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 2: BUILD MERKLE TREE WITH ENTRY");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 2: Build tree with entry ===
    let mut tree_size = 0 as Field;
    let mut tree_depth = 1 as Field;
    let mut side_nodes: [Field; 32] = [0; 32];
    let mut all_leaves: [Field; 256] = [0; 256]; // Track all leaves for proof generation
    
    // Insert entry
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
    
    std::println("After entry insertion:");
    std::print("  Root: ");
    std::println(root_after_entry);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 3: EXECUTE DEPOSIT CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 3: Execute deposit circuit ===
    let previous_nonce = 0 as Field;
    let previous_unlocks_at = 0 as Field; // Must be 0 for deposit
    let commitment_index = 0 as Field; // Entry is at index 0
    
    // Generate merkle proof for entry commitment
    let merkle_proof = generate_merkle_proof(
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    std::println("Deposit circuit inputs:");
    std::print("  user_key: ");
    std::println(user_key);
    std::print("  token_address: ");
    std::println(token_address);
    std::print("  amount: ");
    std::println(deposit_amount);
    std::print("  chain_id: ");
    std::println(chain_id);
    std::print("  previous_nonce: ");
    std::println(previous_nonce);
    std::print("  previous_shares: ");
    std::println(previous_shares);
    std::print("  nullifier: ");
    std::println(nullifier);
    std::print("  previous_unlocks_at: ");
    std::println(previous_unlocks_at);
    std::print("  previous_commitment_leaf: ");
    std::println(entry_commitment_leaf);
    std::print("  commitment_index: ");
    std::println(commitment_index);
    std::print("  tree_depth: ");
    std::println(tree_depth);
    std::print("  expected_root: ");
    std::println(root_after_entry);
    std::println("");
    
    // Call deposit circuit
    let deposit_result: ([Field; 2], [Field; 2], [Field; 2], Field) = main(
        user_key,
        token_address,
        deposit_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        root_after_entry,
        merkle_proof
    );
    
    std::println("Deposit circuit outputs:");
    std::print("  New Pedersen commitment point x: ");
    std::println(deposit_result.0[0]);
    std::print("  New Pedersen commitment point y: ");
    std::println(deposit_result.0[1]);
    std::print("  Encrypted state details[0]: ");
    std::println(deposit_result.1[0]);
    std::print("  Encrypted state details[1]: ");
    std::println(deposit_result.1[1]);
    std::print("  Nonce discovery entry x: ");
    std::println(deposit_result.2[0]);
    std::print("  Nonce discovery entry y: ");
    std::println(deposit_result.2[1]);
    std::print("  New nonce commitment: ");
    std::println(deposit_result.3);
    std::println("");
    
    // Hash the new commitment point to get the leaf (as contract does)
    // Contract will add shares*G before hashing
    let new_commitment_leaf = Poseidon2::hash([deposit_result.0[0], deposit_result.0[1]], 2);
    
    std::print("  New commitment leaf (hash of point): ");
    std::println(new_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 4: INSERT DEPOSIT INTO TREE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Insert deposit commitment into tree
    let (root_after_deposit, depth_after_deposit, side_nodes_after_deposit) = simulate_lean_imt_insert(
        new_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[1] = new_commitment_leaf;
    tree_size = 2;
    tree_depth = depth_after_deposit;
    
    std::println("After deposit insertion:");
    std::print("  Root: ");
    std::println(root_after_deposit);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("PUBLIC INPUTS FOR deposit() FUNCTION");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("publicInputs array (11 elements):");
    std::println("");
    std::println("// Public inputs (4 elements):");
    std::print("publicInputs[0] = bytes32(uint256(uint160(tokenAddress))); // token_address = ");
    std::println(token_address);
    std::print("publicInputs[1] = bytes32(amount); // amount = ");
    std::println(deposit_amount);
    std::print("publicInputs[2] = bytes32(chainId); // chain_id = ");
    std::println(chain_id);
    std::print("publicInputs[3] = bytes32(expectedRoot); // expected_root = ");
    std::println(root_after_entry);
    std::println("");
    std::println("// Public outputs (7 elements):");
    std::print("publicInputs[4] = bytes32(pedersenCommitmentX); // pedersen_commitment.x = ");
    std::println(deposit_result.0[0]);
    std::print("publicInputs[5] = bytes32(pedersenCommitmentY); // pedersen_commitment.y = ");
    std::println(deposit_result.0[1]);
    std::print("publicInputs[6] = bytes32(encryptedBalance); // encrypted_state_details[0] = ");
    std::println(deposit_result.1[0]);
    std::print("publicInputs[7] = bytes32(encryptedNullifier); // encrypted_state_details[1] = ");
    std::println(deposit_result.1[1]);
    std::print("publicInputs[8] = bytes32(nonceDiscoveryEntryX); // nonce_discovery_entry.x = ");
    std::println(deposit_result.2[0]);
    std::print("publicInputs[9] = bytes32(nonceDiscoveryEntryY); // nonce_discovery_entry.y = ");
    std::println(deposit_result.2[1]);
    std::print("publicInputs[10] = bytes32(newNonceCommitment); // new_nonce_commitment = ");
    std::println(deposit_result.3);
    std::println("");
    std::println("// Additional parameters for deposit():");
    std::println("// amountIn: uint256 (actual token amount, not in shares)");
    std::println("// lockDuration: uint256 (0 for this test)");
    std::println("");
    
    std::println("✅ Integration test completed successfully!");
    std::println("   Use the publicInputs values above to test the Solidity deposit() function");
}


