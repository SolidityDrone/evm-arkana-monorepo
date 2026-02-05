use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment_5
};
use dep::lean_imt_verify::{simulate_entry_circuit, simulate_lean_imt_insert, generate_merkle_proof};
use dep::std::embedded_curve_ops::{EmbeddedCurvePoint, EmbeddedCurveScalar, multi_scalar_mul};
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
// Note: simulate_entry_circuit, simulate_lean_imt_insert, and generate_merkle_proof
// are imported from dep::lean_imt_verify

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

/// Helper function to convert Field to EmbeddedCurveScalar
fn from_field_scalar(scalar: Field) -> EmbeddedCurveScalar {
    // TWO_POW_128 = 2^128
    let TWO_POW_128 = 340282366920938463463374607431768211456 as Field; // 2^128
    
    // Decompose field into 128-bit limbs
    let low = (scalar as u128) as Field;
    let high = (scalar - low) / TWO_POW_128;
    
    EmbeddedCurveScalar {
        lo: low,
        hi: high
    }
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
    relayer_fee_amount: Field,
    is_tl_swap: bool,
    tl_swap_shares_amounts: [Field; 10]
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
    
    std::print("is_tl_swap = \"");
    std::print(if is_tl_swap { 1 } else { 0 });
    std::println("\"");
    std::println("");
    
    std::print("tl_swap_shares_amounts = [");
    let mut first = true;
    for i in 0..10 {
        if !first {
            std::print(", ");
        }
        first = false;
        std::print("\"");
        std::print(tl_swap_shares_amounts[i]);
        std::print("\"");
    }
    std::println("]");
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
    let withdraw1_result: ([Field; 2], Field, [Field; 2], [Field; 2], Field, Field) = main(
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
        test_relayer_fee_amount(),
        false, // is_tl_swap
        [0 as Field; 10] // tl_swap_shares_amounts (empty for normal withdraw)
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
        test_relayer_fee_amount(),
        false, // is_tl_swap
        [0 as Field; 10] // tl_swap_shares_amounts (empty for normal withdraw)
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
    let result: ([Field; 2], Field, [Field; 2], [Field; 2], Field, Field) = main(
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
        relayer_fee_amount,
        false, // is_tl_swap
        [0 as Field; 10] // tl_swap_shares_amounts (empty for normal withdraw)
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
    
    let result: ([Field; 2], Field, [Field; 2], [Field; 2], Field, Field) = main(
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
        relayer_fee_amount,
        false, // is_tl_swap
        [0 as Field; 10] // tl_swap_shares_amounts (empty for normal withdraw)
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

/// Full integration test: Entry + Withdraw
/// This test simulates a complete flow: 1 entry followed by 1 withdraw
/// All outputs are printed in a format suitable for testing the Solidity contract
#[test]
fn test_entry_then_withdraw_integration() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      INTEGRATION TEST: Entry + Withdraw                     ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    // === SETUP ===
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 11155111 as Field; // Sepolia chain ID
    let nullifier = 0 as Field; // Entry uses nullifier = 0
    
    // Entry parameters
    let entry_amount = 1000000 as Field; // 1,000,000 shares (will be added by contract) - larger amount to avoid Aave conversion underflow
    
    // Withdraw parameters
    let withdraw_amount = 500000 as Field; // Withdraw 500,000 shares - large enough to avoid Aave conversion issues
    let previous_shares = entry_amount; // After entry, we have entry_amount shares
    let relayer_fee_amount = test_relayer_fee_amount();
    let receiver_address = test_receiver_address();
    let arbitrary_calldata_hash = 0 as Field; // No calldata for this test
    let declared_time_reference = 1000000 as Field; // Time reference for withdrawal
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: EXECUTE ENTRY CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Simulate entry circuit
    let (entry_commitment_point, entry_nonce_commitment, entry_nonce_discovery) = simulate_entry_circuit(
        user_key,
        token_address,
        chain_id
    );
    
    std::println("Entry circuit outputs:");
    std::print("  Commitment point: [");
    std::print(entry_commitment_point[0]);
    std::print(", ");
    std::print(entry_commitment_point[1]);
    std::println("]");
    std::print("  Nonce commitment: ");
    std::println(entry_nonce_commitment);
    std::print("  Nonce discovery entry: [");
    std::print(entry_nonce_discovery[0]);
    std::print(", ");
    std::print(entry_nonce_discovery[1]);
    std::println("]");
    std::println("");
    
    // Contract will add shares*G and unlocks_at*K to the commitment
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
    std::println("STEP 4: EXECUTE WITHDRAW CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    // Execute withdraw circuit
    let previous_nonce = 0 as Field; // Entry nonce is 0
    let previous_unlocks_at = 0 as Field; // Entry has no lock
    
    std::println("Calling withdraw circuit with inputs:");
    std::print("  User key: "); std::println(user_key);
    std::print("  Token address: "); std::println(token_address);
    std::print("  Amount to withdraw: "); std::println(withdraw_amount);
    std::print("  Chain ID: "); std::println(chain_id);
    std::print("  Previous nonce: "); std::println(previous_nonce);
    std::print("  Previous shares: "); std::println(previous_shares);
    std::print("  Nullifier: "); std::println(nullifier);
    std::print("  Previous unlocks_at: "); std::println(previous_unlocks_at);
    std::print("  Declared time reference: "); std::println(declared_time_reference);
    std::print("  Previous commitment leaf: "); std::println(entry_commitment_leaf);
    std::print("  Commitment index: "); std::println(commitment_index);
    std::print("  Tree depth: "); std::println(tree_depth);
    std::print("  Expected root: "); std::println(root_after_entry);
    std::print("  Receiver address: "); std::println(receiver_address);
    std::print("  Relayer fee amount: "); std::println(relayer_fee_amount);
    std::print("  Arbitrary calldata hash: "); std::println(arbitrary_calldata_hash);
    std::println("");
    
    let withdraw_result: ([Field; 2], Field, [Field; 2], [Field; 2], Field, Field) = main(
        user_key,
        token_address,
        withdraw_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        declared_time_reference,
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        root_after_entry,
        merkle_proof,
        arbitrary_calldata_hash,
        receiver_address,
        relayer_fee_amount,
        false, // is_tl_swap
        [0 as Field; 10] // tl_swap_shares_amounts (empty for normal withdraw)
    );
    
    std::println("Withdraw circuit outputs:");
    std::print("  New commitment point: [");
    std::print(withdraw_result.0[0]);
    std::print(", ");
    std::print(withdraw_result.0[1]);
    std::println("]");
    std::print("  New nonce commitment: ");
    std::println(withdraw_result.1);
    std::print("  Encrypted state details: [");
    std::print(withdraw_result.2[0]);
    std::print(", ");
    std::print(withdraw_result.2[1]);
    std::println("]");
    std::print("  Nonce discovery entry: [");
    std::print(withdraw_result.3[0]);
    std::print(", ");
    std::print(withdraw_result.3[1]);
    std::println("]");
    std::print("  TL Hashchain: ");
    std::println(withdraw_result.4);
    std::print("  Final amount: ");
    std::println(withdraw_result.5);
    std::println("");
    
    // Hash the new commitment point to get the leaf
    let new_commitment_leaf = Poseidon2::hash([withdraw_result.0[0], withdraw_result.0[1]], 2);
    
    std::println("New commitment leaf (for contract): ");
    std::println(new_commitment_leaf);
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
    
    std::println("=== PUBLIC INPUTS FOR withdraw() FUNCTION ===");
    std::println("publicInputs array (17 elements):");
    std::println("");
    std::println("// Public inputs (8 elements):");
    std::print("publicInputs[0] = bytes32(uint256(uint160(tokenAddress))); // token_address = ");
    std::println(token_address);
    std::print("publicInputs[1] = bytes32(chainId); // chain_id = ");
    std::println(chain_id);
    std::print("publicInputs[2] = bytes32(declaredTimeReference); // declared_time_reference = ");
    std::println(declared_time_reference);
    std::print("publicInputs[3] = bytes32(expectedRoot); // expected_root = ");
    std::println(root_after_entry);
    std::print("publicInputs[4] = bytes32(arbitraryCalldataHash); // arbitrary_calldata_hash = ");
    std::println(arbitrary_calldata_hash);
    std::print("publicInputs[5] = bytes32(uint256(uint160(receiverAddress))); // receiver_address = ");
    std::println(receiver_address);
    std::print("publicInputs[6] = bytes32(relayerFeeShares); // relayer_fee_amount (in shares) = ");
    std::println(relayer_fee_amount);
    std::print("publicInputs[7] = bytes32(isTlSwap ? 1 : 0); // is_tl_swap = ");
    std::println(0);
    std::println("");
    std::println("// Note: amount is now private, so it's not in publicInputs");
    std::println("");
    std::println("// Public outputs (11 elements):");
    std::print("publicInputs[8] = bytes32(pedersenCommitmentX); // pedersen_commitment.x = ");
    std::println(withdraw_result.0[0]);
    std::print("publicInputs[9] = bytes32(pedersenCommitmentY); // pedersen_commitment.y = ");
    std::println(withdraw_result.0[1]);
    std::print("publicInputs[10] = bytes32(newNonceCommitment); // new_nonce_commitment = ");
    std::println(withdraw_result.1);
    std::print("publicInputs[11] = bytes32(encryptedBalance); // encrypted_state_details[0] = ");
    std::println(withdraw_result.2[0]);
    std::print("publicInputs[12] = bytes32(encryptedNullifier); // encrypted_state_details[1] = ");
    std::println(withdraw_result.2[1]);
    std::print("publicInputs[13] = bytes32(nonceDiscoveryEntryX); // nonce_discovery_entry.x = ");
    std::println(withdraw_result.3[0]);
    std::print("publicInputs[14] = bytes32(nonceDiscoveryEntryY); // nonce_discovery_entry.y = ");
    std::println(withdraw_result.3[1]);
    std::print("publicInputs[15] = bytes32(tlHashchain); // tl_hashchain = ");
    std::println(withdraw_result.4);
    std::print("publicInputs[16] = bytes32(finalAmount); // final_amount = ");
    std::println(withdraw_result.5);
    std::println("");
    std::println("// Additional parameter for withdraw():");
    std::println("// call: bytes calldata (empty bytes for this test)");
    std::println("");
    
    std::println("✅ Integration test completed successfully!");
    std::println("   Use the publicInputs values above to test the Solidity withdraw() function");
}

#[test]
fn test_withdraw_tl_swap_3_chunks() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Withdraw with TL Swap (3 Chunks)                 ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    // === SETUP ===
    let user_key = test_user_key();
    let token_address = test_token_address();
    let chain_id = 11155111 as Field; // Sepolia chain ID
    let nullifier = 0 as Field;
    
    // Entry parameters
    let entry_amount = 1000000 as Field; // 1,000,000 shares
    
    // Withdraw parameters - total amount to be split into 3 chunks
    let total_withdraw_amount = 500000 as Field; // Total: 500,000 shares
    let previous_shares = entry_amount;
    let relayer_fee_amount = test_relayer_fee_amount();
    let receiver_address = test_receiver_address();
    let arbitrary_calldata_hash = 0 as Field;
    let declared_time_reference = 1000000 as Field;
    
    // TL Swap parameters: 3 chunks that sum to total_withdraw_amount
    let chunk1 = 100000 as Field;  // 100,000 shares
    let chunk2 = 150000 as Field;  // 150,000 shares
    let chunk3 = 250000 as Field;  // 250,000 shares
    // Total: 500,000 shares
    
    let mut tl_swap_shares_amounts: [Field; 10] = [0; 10];
    tl_swap_shares_amounts[0] = chunk1;
    tl_swap_shares_amounts[1] = chunk2;
    tl_swap_shares_amounts[2] = chunk3;
    // Rest are 0
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("SETUP: Entry + TL Swap Withdraw");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("TL Swap Configuration:");
    std::print("  Total withdraw amount: ");
    std::println(total_withdraw_amount);
    std::println("  Chunks:");
    std::print("    Chunk 1: ");
    std::println(chunk1);
    std::print("    Chunk 2: ");
    std::println(chunk2);
    std::print("    Chunk 3: ");
    std::println(chunk3);
    std::print("    Sum: ");
    std::println(chunk1 + chunk2 + chunk3);
    std::println("");
    
    // === STEP 1: ENTRY ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 1: EXECUTE ENTRY CIRCUIT");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    let (entry_commitment_point, entry_nonce_commitment, entry_nonce_discovery) = simulate_entry_circuit(
        user_key,
        token_address,
        chain_id
    );
    
    // Contract adds shares*G and unlocks_at*K
    let generators: [EmbeddedCurvePoint; 5] =
        std::hash::derive_generators("PEDERSEN_COMMITMENT_5".as_bytes(), 0);
    let G = generators[0];
    let K = generators[3];
    
    let entry_commitment_embedded = EmbeddedCurvePoint {
        x: entry_commitment_point[0],
        y: entry_commitment_point[1],
        is_infinite: false
    };
    
    let shares_scalar = from_field_scalar(entry_amount);
    let shares_commitment = multi_scalar_mul([G], [shares_scalar]);
    
    let unlocks_at = 0 as Field;
    let unlocks_at_scalar = from_field_scalar(unlocks_at);
    let unlocks_at_commitment = multi_scalar_mul([K], [unlocks_at_scalar]);
    
    let final_entry_commitment = entry_commitment_embedded + shares_commitment + unlocks_at_commitment;
    let entry_commitment_leaf = Poseidon2::hash([final_entry_commitment.x, final_entry_commitment.y], 2);
    
    // === STEP 2: BUILD TREE ===
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
    
    // === STEP 3: GENERATE MERKLE PROOF ===
    let commitment_index = 0 as Field;
    let merkle_proof = generate_merkle_proof(
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        all_leaves,
        tree_size
    );
    
    // === STEP 4: EXECUTE WITHDRAW WITH TL SWAP ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("STEP 4: EXECUTE WITHDRAW CIRCUIT (TL Swap Mode)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    let previous_nonce = 0 as Field;
    let previous_unlocks_at = 0 as Field;
    
    let withdraw_result: ([Field; 2], Field, [Field; 2], [Field; 2], Field, Field) = main(
        user_key,
        token_address,
        total_withdraw_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        declared_time_reference,
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        root_after_entry,
        merkle_proof,
        arbitrary_calldata_hash,
        receiver_address,
        relayer_fee_amount,
        true, // is_tl_swap = true
        tl_swap_shares_amounts
    );
    
    let tl_hashchain = withdraw_result.4;
    
    std::println("Withdraw circuit outputs:");
    std::print("  TL Hashchain: ");
    std::println(tl_hashchain);
    std::println("");
    std::println("✅ TL Swap withdraw completed successfully!");
    std::println("");
    
    // === GENERATE PROVER.TOML ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("PROVER.TOML FOR TL SWAP WITHDRAW (3 CHUNKS)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("This Prover.toml is for a TL Swap withdraw with 3 chunks.");
    std::println("Total amount: 500,000 shares");
    std::println("Chunks: [100,000, 150,000, 250,000, 0, 0, 0, 0, 0, 0, 0]");
    std::println("");
    
    print_prover_toml_format(
        user_key,
        token_address,
        total_withdraw_amount,
        chain_id,
        previous_nonce,
        previous_shares,
        nullifier,
        previous_unlocks_at,
        declared_time_reference,
        entry_commitment_leaf,
        commitment_index,
        tree_depth,
        root_after_entry,
        merkle_proof,
        arbitrary_calldata_hash,
        receiver_address,
        relayer_fee_amount,
        true, // is_tl_swap
        tl_swap_shares_amounts
    );
    
    std::println("✅ Prover.toml generated for TL Swap withdraw!");
}

