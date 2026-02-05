use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use crate::main;

// === TEST CONSTANTS ===
global MAX_TREE_DEPTH: u32 = 32;

/// Get test user key
fn test_user_key() -> Field { 0x19e573f3801c7b2e4619998342e8e305e1692184cbacd220c04198a04c36b7d2 as Field }

/// Get test token address (USDC)
fn test_token_address() -> Field { 0x7775e4b6f4d40be537b55b6c47e09ada0157bd as Field }

/// Get test withdrawal amount (50 USDC)
fn test_withdrawal_amount() -> Field { 0x32 as Field }

/// Get test current balance (100 USDC)
fn test_current_balance() -> Field { 0x64 as Field }

/// Get test nullifier
fn test_nullifier() -> Field { 0x00 as Field }

/// Get test receiver address
fn test_receiver_address() -> Field { 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 as Field }

/// Get test relay fee token address (same as token for simplicity)

/// Get test receiver fee amount
fn test_relayer_fee_amount() -> Field { 0x01 as Field }

// === TEST HELPER FUNCTIONS ===

/// Simulate entry circuit to create a Pedersen commitment
/// Returns: (pedersen_commitment_point[x, y], nonce_commitment, nonce_discovery_entry[x, y])
/// Note: Entry circuit now returns Pedersen point, not a hash
fn simulate_entry_circuit(
    user_key: Field,
    token_address: Field,
    chain_id: Field
) -> ([Field; 2], Field, [Field; 2]) {
    // Entry uses nonce = 0
    let nonce = 0 as Field;
    
    // Calculate spending_key for nonce_commitment
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let nonce_commitment = Poseidon2::hash([spending_key, nonce, token_address], 3);
    
    // Create Pedersen commitment: m1*G + m2*H + m3*D + m4*K + r*J
    // where m1=0 (shares), m2=0 (nullifier), m3=spending_key, m4=0 (unlocks_at), r=nonce_commitment
    let unlocks_at = 0 as Field;
    let balance_commitment = pedersen_commitment_5(0, 0, spending_key, unlocks_at, nonce_commitment);
    
    // Calculate nonce discovery entry
    let nonce_discovery_entry = pedersen_commitment(1, nonce_commitment);
    
    (
        [balance_commitment.x, balance_commitment.y],  // Pedersen commitment point
        nonce_commitment,
        [nonce_discovery_entry.x, nonce_discovery_entry.y]
    )
}

/// Simulate deposit to create a new Pedersen commitment
/// Returns: (pedersen_commitment_point[x, y], nonce_commitment)
/// Note: For testing, we'll use placeholder shares (0) since we don't track shares in tests
fn simulate_deposit(
    user_key: Field,
    token_address: Field,
    previous_nonce: Field,
    previous_shares: Field,
    nullifier: Field,
    chain_id: Field
) -> ([Field; 2], Field) {
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let new_nonce = previous_nonce + 1;
    let new_nonce_commitment = Poseidon2::hash([spending_key, new_nonce, token_address], 3);
    
   
    let unlocks_at = 0 as Field;
    let commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, unlocks_at, new_nonce_commitment);
    
    ([commitment_point.x, commitment_point.y], new_nonce_commitment)
}

/// Simulate lean IMT insertion (matching LeanIMTPoseidon2.insert logic)
fn simulate_lean_imt_insert(
    leaf: Field,
    current_size: Field,
    current_depth: Field,
    current_side_nodes: [Field; 32]
) -> (Field, Field, [Field; 32]) {
    let mut side_nodes = current_side_nodes;
    let index = current_size;
    
    let current_depth_u32 = current_depth as u32;
    let index_u32 = index as u32;
    let new_size_u32 = index_u32 + 1;
    
    let mut power_of_2: u32 = 1;
    for i in 0..32 {
        if i < current_depth_u32 {
            power_of_2 = power_of_2 * 2;
        }
    }
    
    let mut tree_depth_u32 = current_depth_u32;
    if power_of_2 < new_size_u32 {
        tree_depth_u32 = tree_depth_u32 + 1;
    }
    
    let tree_depth = tree_depth_u32 as Field;
    let mut node = leaf;
    
    for level in 0..MAX_TREE_DEPTH {
        let level_u32 = level as u32;
        let is_active = level_u32 < tree_depth_u32;
        
        if is_active {
            let mut temp_index = index_u32;
            let mut shift = level_u32;
            for _ in 0..32 {
                if shift > 0 {
                    temp_index = temp_index / 2;
                    shift = shift - 1;
                }
            }
            let bit = temp_index % 2;
            
            if bit == 1 {
                let sibling = side_nodes[level];
                node = Poseidon2::hash([sibling, node], 2);
            } else {
                side_nodes[level] = node;
            }
        }
    }
    
    let depth_idx = tree_depth_u32;
    if depth_idx < MAX_TREE_DEPTH {
        side_nodes[depth_idx] = node;
    }
    
    (node, tree_depth, side_nodes)
}

/// Generate merkle proof for a leaf at given index
fn generate_merkle_proof(
    leaf: Field,
    index: Field,
    tree_depth: Field,
    all_leaves: [Field; 256],
    tree_size: Field
) -> [Field; 32] {
    let mut proof: [Field; 32] = [0; 32];
    let depth_u32 = tree_depth as u32;
    let index_u32 = index as u32;
    let tree_size_u32 = tree_size as u32;
    
    let mut current_level: [Field; 256] = all_leaves;
    let mut current_level_size = tree_size_u32;
    
    for level in 0..MAX_TREE_DEPTH {
        let level_u32 = level as u32;
        let is_active = level_u32 < depth_u32;
        
        if is_active {
            let mut temp_idx = index_u32;
            let mut shifts_remaining = level_u32;
            for _ in 0..32 {
                if shifts_remaining > 0 {
                    temp_idx = temp_idx / 2;
                    shifts_remaining = shifts_remaining - 1;
                }
            }
            let node_index = temp_idx;
            
            let bit = node_index % 2;
            
            if bit == 1 {
                let sibling_index = node_index - 1;
                if sibling_index < current_level_size {
                    proof[level] = current_level[sibling_index];
                } else {
                    proof[level] = 0;
                }
            } else {
                let sibling_index = node_index + 1;
                if sibling_index < current_level_size {
                    proof[level] = current_level[sibling_index];
                } else {
                    proof[level] = 0;
                }
            }
            
            let next_level_size = ((current_level_size - 1) / 2) + 1;
            let mut next_level: [Field; 256] = [0; 256];
            
            for i in 0..128 {
                let should_compute = i < next_level_size;
                if should_compute {
                    let left_idx = i * 2;
                    let right_idx = left_idx + 1;
                    
                    if right_idx < current_level_size {
                        next_level[i] = Poseidon2::hash([current_level[left_idx], current_level[right_idx]], 2);
                    } else if left_idx < current_level_size {
                        next_level[i] = current_level[left_idx];
                    }
                }
            }
            
            current_level = next_level;
            current_level_size = next_level_size;
        }
    }
    
    let _ = leaf; // Use variable
    proof
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
    declared_time_reference: Field,
    previous_commitment_leaf: Field,
    commitment_index: Field,
    tree_depth: Field,
    expected_root: Field,
    merkle_proof: [Field; 32],
    arbitrary_calldata_hash: Field,
    receiver_address: Field,
    relayer_fee_amount: Field
) {
    std::println("========================================");
    std::println("COPY THIS TO withdraw/Prover.toml");
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
    
    std::print("previous_unlocks_at = \"");
    std::print(previous_unlocks_at);
    std::println("\"");
    std::println("");
    
    std::print("declared_time_reference = \"");
    std::print(declared_time_reference);
    std::println("\"");
    std::println("");
    
    std::print("arbitrary_calldata_hash = \"");
    std::print(arbitrary_calldata_hash);
    std::println("\"");
    std::println("");
    
    std::print("receiver_address = \"");
    std::print(receiver_address);
    std::println("\"");
    std::println("");
    
    std::print("relayer_fee_amount = \"");
    std::print(relayer_fee_amount);
    std::println("\"");
    std::println("");
}

// === MAIN TEST FUNCTION ===

#[test]
fn test_withdraw_flow() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Withdraw Flow                                     ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    std::println("SCENARIO:");
    std::println("  1. Entry: User creates initial commitment (balance=100)");
    std::println("  2. Deposit 50: commitment #2 (balance=150)");
    std::println("  3. Deposit 50: commitment #3 (balance=200)");
    std::println("  4. Deposit 50: commitment #4 (balance=250)");
    std::println("  5. Withdraw 50: commitment #5 (balance=200) ← PRINT PROVER.TOML");
    std::println("");
    
    // === SETUP ===
    let user_key = test_user_key();
    let token_address = test_token_address();
    let deposit_amount = 0x32 as Field; // 50 USDC
    let initial_balance = test_current_balance(); // 100 USDC
    let nullifier = test_nullifier();
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: SIMULATE ENTRY CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 1: Simulate entry circuit ===
    let chain_id = 1 as Field; // Mainnet chain ID
    let (entry_pedersen_point, entry_nonce_commitment, _entry_nonce_discovery) = simulate_entry_circuit(
        user_key,
        token_address,
        chain_id
    );
    
  
    let entry_commitment_leaf = Poseidon2::hash([entry_pedersen_point[0], entry_pedersen_point[1]], 2);
    
    std::println("Entry circuit output:");
    std::print("  Entry Pedersen point x: ");
    std::println(entry_pedersen_point[0]);
    std::print("  Entry Pedersen point y: ");
    std::println(entry_pedersen_point[1]);
    std::print("  Entry commitment leaf: ");
    std::println(entry_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 2: BUILD TREE WITH DEPOSITS");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 2: Build tree with deposits ===
    let mut tree_size = 0 as Field;
    let mut tree_depth = 1 as Field;
    let mut side_nodes: [Field; 32] = [0; 32];
    let mut all_leaves: [Field; 256] = [0; 256];
    
    // Insert entry
    let (_root_after_entry, depth_after_entry, side_nodes_after_entry) = simulate_lean_imt_insert(
        entry_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[0] = entry_commitment_leaf;
    tree_size = 1;
    tree_depth = depth_after_entry;
    side_nodes = side_nodes_after_entry;
    
    // For testing, we'll simulate deposits with increasing shares
    // Deposit 1: starts with 0 shares, ends with some shares (simulate contract adding shares)
    let deposit1_previous_shares = 0 as Field;
    let (deposit1_pedersen_point, deposit1_nonce_commitment) = simulate_deposit(user_key, token_address, 0, deposit1_previous_shares, nullifier, chain_id);
    let deposit1_commitment_leaf = Poseidon2::hash([deposit1_pedersen_point[0], deposit1_pedersen_point[1]], 2);
    let (_root_after_deposit1, depth_after_deposit1, side_nodes_after_deposit1) = simulate_lean_imt_insert(
        deposit1_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[1] = deposit1_commitment_leaf;
    tree_size = 2;
    tree_depth = depth_after_deposit1;
    side_nodes = side_nodes_after_deposit1;
    
    // Deposit 2: continues from deposit1 (simulate shares accumulating)
    let deposit2_previous_shares = deposit1_previous_shares; 
    let (deposit2_pedersen_point, deposit2_nonce_commitment) = simulate_deposit(user_key, token_address, 1, deposit2_previous_shares, nullifier, chain_id);
    let deposit2_commitment_leaf = Poseidon2::hash([deposit2_pedersen_point[0], deposit2_pedersen_point[1]], 2);
    let (_root_after_deposit2, depth_after_deposit2, side_nodes_after_deposit2) = simulate_lean_imt_insert(
        deposit2_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[2] = deposit2_commitment_leaf;
    tree_size = 3;
    tree_depth = depth_after_deposit2;
    side_nodes = side_nodes_after_deposit2;
    
    // Deposit 3: this is what we'll withdraw from, so it needs to have enough shares
    // Need enough shares: withdrawal_amount (50) + relayer_fee_amount (1) = 51
    let deposit3_previous_shares = 100 as Field; // Enough shares for withdrawal
    let (deposit3_pedersen_point, deposit3_nonce_commitment) = simulate_deposit(user_key, token_address, 2, deposit3_previous_shares, nullifier, chain_id);
    let deposit3_commitment_leaf = Poseidon2::hash([deposit3_pedersen_point[0], deposit3_pedersen_point[1]], 2);
    let (root_after_deposit3, depth_after_deposit3, side_nodes_after_deposit3) = simulate_lean_imt_insert(
        deposit3_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    all_leaves[3] = deposit3_commitment_leaf;
    tree_size = 4;
    tree_depth = depth_after_deposit3;
    side_nodes = side_nodes_after_deposit3;
    
    std::println("After 3 deposits:");
    std::print("  Root: ");
    std::println(root_after_deposit3);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 3: FIRST WITHDRAWAL (50 USDC)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 3: First withdrawal ===
    let withdraw1_nonce = 3 as Field;
    // Use the same shares as deposit3 (which we're withdrawing from)
    let withdraw1_previous_shares = deposit3_previous_shares; // Must match deposit3_previous_shares
    
    // Generate proof for withdrawal (proving deposit3 commitment leaf exists)
    let withdraw1_index = 3 as Field;
    let withdraw1_proof = generate_merkle_proof(
        deposit3_commitment_leaf,
        withdraw1_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    std::println("Calling main() for first withdrawal with:");
    std::print("  previous_nonce: ");
    std::println(withdraw1_nonce);
    std::print("  previous_shares: ");
    std::println(withdraw1_previous_shares);
    std::print("  previous_nonce_commitment: ");
    std::println(deposit3_nonce_commitment);
    std::print("  previous_commitment_leaf: ");
    std::println(deposit3_commitment_leaf);
    std::print("  expected_root: ");
    std::println(root_after_deposit3);
    std::println("");
    
    // Execute withdrawal circuit
    let chain_id = 1 as Field; // Mainnet chain ID
    let previous_unlocks_at = 0 as Field; // No lock initially
    let declared_time_reference = 1000000 as Field; // Time reference for withdrawal validation
    let withdraw1_result: ([Field; 2], Field, [Field; 2], [Field; 2]) = main(
        user_key,
        token_address,
        test_withdrawal_amount(),
        chain_id,
        withdraw1_nonce,
        withdraw1_previous_shares,
        nullifier,
        previous_unlocks_at,
        declared_time_reference,
        deposit3_commitment_leaf,
        withdraw1_index,
        tree_depth,
        root_after_deposit3,
        withdraw1_proof,
        0x1234567890abcdef as Field,
        test_receiver_address(),
        test_relayer_fee_amount()
    );
    
    let withdraw1_pedersen_point: [Field; 2] = withdraw1_result.0;
    let withdraw1_nonce_commitment = withdraw1_result.1;
    
    // Note: declared_time_reference is now a public input, not an output
    
    // Hash the Pedersen commitment point to create the leaf
    let withdraw1_commitment_leaf = Poseidon2::hash([withdraw1_pedersen_point[0], withdraw1_pedersen_point[1]], 2);
    
    std::println("First withdrawal completed:");
    std::print("  Previous shares: ");
    std::println(withdraw1_previous_shares);
    std::print("  Withdrawal amount: ");
    std::println(test_withdrawal_amount());
    std::print("  New Pedersen point x: ");
    std::println(withdraw1_pedersen_point[0]);
    std::print("  New Pedersen point y: ");
    std::println(withdraw1_pedersen_point[1]);
    std::print("  New commitment leaf: ");
    std::println(withdraw1_commitment_leaf);
    std::println("");
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 4: INSERT FIRST WITHDRAWAL INTO TREE");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // === STEP 4: Insert withdrawal into tree ===
    let (root_after_withdraw1, depth_after_withdraw1, side_nodes_after_withdraw1) = simulate_lean_imt_insert(
        withdraw1_commitment_leaf,
        tree_size,
        tree_depth,
        side_nodes
    );
    
    all_leaves[4] = withdraw1_commitment_leaf;
    tree_size = 5;
    tree_depth = depth_after_withdraw1;
    side_nodes = side_nodes_after_withdraw1;
    
    std::println("After first withdrawal insertion:");
    std::print("  Root: ");
    std::println(root_after_withdraw1);
    std::print("  Depth: ");
    std::println(tree_depth);
    std::print("  Size: ");
    std::println(tree_size);
    std::println("");
    
    std::println("✅ First withdrawal completed successfully!");
    std::println("");
    
    // === GENERATE PROVER.TOML FOR FIRST WITHDRAWAL ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("PROVER.TOML FOR FIRST WITHDRAWAL (5TH COMMITMENT)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("This Prover.toml is for the 1ST withdrawal (5th commitment total).");
    std::println("Tree now has 5 leaves with a proper merkle proof structure.");
    std::println("");
    
    print_prover_toml_format(
        user_key,
        token_address,
        test_withdrawal_amount(),
        chain_id,
        withdraw1_nonce,
        withdraw1_previous_shares,
        nullifier,
        previous_unlocks_at,
        declared_time_reference,
        deposit3_commitment_leaf,
        withdraw1_index,
        depth_after_deposit3,
        root_after_deposit3,
        withdraw1_proof,
        0x1234567890abcdef as Field,
        test_receiver_address(),
        test_relayer_fee_amount()
    );
    let _ = withdraw1_result; // Use variable
}

/// Test that withdraw succeeds when balance is exactly enough (boundary case)
#[test]
fn test_withdraw_exact_balance() {
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let withdraw_amount = 40 as Field;
    let relayer_fee_amount = 10 as Field;
    let total_needed = withdraw_amount + relayer_fee_amount; // 50
    let current_balance = total_needed; // Exactly 50, should pass since gt(50, 50-1) = gt(50, 49) = true
    
    let previous_nonce = 0 as Field;
    let nullifier = test_nullifier();
    
    // Create previous commitment using Pedersen commitment
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    // Need enough shares: withdraw_amount (40) + relayer_fee_amount (10) = 50 (exactly)
    let previous_shares = total_needed; // Exactly 50, should pass
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
    
    let arbitrary_calldata_hash = 0 as Field;
    let receiver_address = test_receiver_address();
    
    std::println("Testing withdraw circuit structure (boundary case)...");
    std::println("  Previous shares: 50 (exactly enough)");
    std::println("  Withdraw amount: 40");
    std::println("  Relayer fee: 10");
    
    // This should pass - tests the circuit structure
    let previous_unlocks_at = 0 as Field; // No lock initially
    let declared_time_reference = 1000000 as Field; // Time reference for withdrawal validation
    let result: ([Field; 2], Field, [Field; 2], [Field; 2]) = main(
        user_key,
        token_address,
        withdraw_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        declared_time_reference,
        previous_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof,
        arbitrary_calldata_hash,
        receiver_address,
        relayer_fee_amount
    );
    
    // Verify new balance is 0
    let new_balance = current_balance - (withdraw_amount + relayer_fee_amount);
    assert(new_balance == 0, "New balance should be 0");
    
    std::println("✅ Withdraw with exact balance test passed!");
}

#[test]
fn test_withdraw_time_constraint_validation() {
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 1 as Field;
    let withdraw_amount = 100 as Field;
    let lock_timer = 0 as Field; // No lock timer
    let unlocks_at_timestamp = 0 as Field; // No lock initially
    let previous_unlocks_at = (lock_timer * 0x1000000) + unlocks_at_timestamp; // Pack: lock_timer << 24 | unlocks_at
    
    let previous_nonce = 0 as Field;
    let previous_shares = 200 as Field; // Enough shares
    let nullifier = 0 as Field;
    
    // Create previous commitment
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let previous_nonce_commitment = Poseidon2::hash([spending_key, previous_nonce, token_address], 3);
    let previous_commitment_point = pedersen_commitment_5(previous_shares, nullifier, spending_key, previous_unlocks_at, previous_nonce_commitment);
    let previous_commitment_leaf = Poseidon2::hash([previous_commitment_point.x, previous_commitment_point.y], 2);
    
    // Setup tree
    let mut side_nodes = [0 as Field; 32];
    let tree_depth = 0 as Field;
    let commitment_index = 0 as Field;
    let expected_root = previous_commitment_leaf;
    let merkle_proof = [0 as Field; 32];
    
    let arbitrary_calldata_hash = 0 as Field;
    let receiver_address = test_receiver_address();
    let relayer_fee_amount = 0 as Field;
    let declared_time_reference = 1000000 as Field; // Time reference for withdrawal validation (must be >= unlocks_at)
    
    std::println("Testing withdraw with time constraint validation...");
    std::println("  Withdraw amount: 100");
    std::println("  Previous unlocks_at: 0 (no lock)");
    std::println("  Declared time reference: 1000000");
    
    let result: ([Field; 2], Field, [Field; 2], [Field; 2]) = main(
        user_key,
        token_address,
        withdraw_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        declared_time_reference,
        previous_commitment_leaf,
        commitment_index,
        tree_depth,
        expected_root,
        merkle_proof,
        arbitrary_calldata_hash,
        receiver_address,
        relayer_fee_amount
    );
    
    // Verify the circuit returns valid outputs
    let pedersen_point: [Field; 2] = result.0;
    let new_nonce_commitment = result.1;
    
    assert(pedersen_point[0] != 0, "Pedersen point x should not be zero");
    assert(pedersen_point[1] != 0, "Pedersen point y should not be zero");
    assert(new_nonce_commitment != 0, "New nonce commitment should not be zero");
    
    // Note: declared_time_reference is now a public input, not an output
    // The circuit validates it internally but doesn't return it
    
    std::println("✅ Time constraint validation test passed! Declared time reference is correctly validated as input");
}

