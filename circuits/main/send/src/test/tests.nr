use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use dep::poseidon_ctr_encryption::{poseidon_ctr_encrypt, poseidon_ctr_decrypt};
use dep::ec::tecurve::affine::{Point};
use dep::ec::consts::te::{baby_jubjub};
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};
use crate::main;

// === TEST CONSTANTS ===
global VIEW_STRING: Field = 0x76696577696e675f6b6579 as Field;
global MAX_TREE_DEPTH: u32 = 32;

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

/// Derive Alice's public key from her private key
fn derive_alice_public_key() -> [Field; 2] {
    let bjj = baby_jubjub();
    let generator = bjj.base8;
    let alice_private_key = alice_private_key();
    let alice_public_key = bjj.curve.mul(alice_private_key, generator);
    [alice_public_key.x, alice_public_key.y]
}

/// Simulate entry circuit to create a Pedersen commitment
fn simulate_entry_circuit(
    user_key: Field,
    token_address: Field,
    chain_id: Field
) -> ([Field; 2], Field, [Field; 2]) {
    let nonce = 0 as Field;
    let spending_key = Poseidon2::hash([user_key, chain_id, token_address], 3);
    let nonce_commitment = Poseidon2::hash([spending_key, nonce, token_address], 3);
    
    let unlocks_at = 0 as Field;
    let balance_commitment = pedersen_commitment_5(0, 0, spending_key, unlocks_at, nonce_commitment);
    
    let nonce_discovery_entry = pedersen_commitment(1, nonce_commitment);
    
    (
        [balance_commitment.x, balance_commitment.y],
        nonce_commitment,
        [nonce_discovery_entry.x, nonce_discovery_entry.y]
    )
}

/// Simulate lean IMT insertion
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
    
    let _ = leaf;
    proof
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

