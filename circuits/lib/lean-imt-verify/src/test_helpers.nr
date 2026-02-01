use dep::poseidon::poseidon2::Poseidon2;
use dep::pedersen_commitments::pedersen_commitments::{
    pedersen_commitment,
    pedersen_commitment_5
};

// Maximum depth for lean-IMT (supports up to 2^MAX_TREE_DEPTH leaves)
global MAX_TREE_DEPTH: u32 = 32;

/// Simulate entry circuit to create a Pedersen commitment
/// Returns: (pedersen_commitment_point[x, y], nonce_commitment, nonce_discovery_entry[x, y])
/// Note: Entry circuit now returns Pedersen point, not a hash
pub fn simulate_entry_circuit(
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

/// Simulate lean IMT insertion (matching LeanIMTPoseidon2.insert logic)
/// Returns: (root, depth, sideNodes array for proof generation)
pub fn simulate_lean_imt_insert(
    leaf: Field,
    current_size: Field,
    current_depth: Field,
    current_side_nodes: [Field; 32]
) -> (Field, Field, [Field; 32]) {
    let mut side_nodes = current_side_nodes;
    let index = current_size;
    
    // Calculate new depth: depth increases when 2^depth < index + 1
    // Convert to u32 for comparison
    let current_depth_u32 = current_depth as u32;
    let index_u32 = index as u32;
    let new_size_u32 = index_u32 + 1;
    
    // Calculate 2^current_depth using fixed loop (max depth is 32)
    let mut power_of_2: u32 = 1;
    for i in 0..32 {
        if i < current_depth_u32 {
            power_of_2 = power_of_2 * 2;
        }
    }
    
    // If 2^depth < new_size, we need to increment depth
    let mut tree_depth_u32 = current_depth_u32;
    if power_of_2 < new_size_u32 {
        tree_depth_u32 = tree_depth_u32 + 1;
    }
    
    let tree_depth = tree_depth_u32 as Field;
    let mut node = leaf;
    
    // Process each level (use fixed MAX_TREE_DEPTH, check if level < depth)
    for level in 0..MAX_TREE_DEPTH {
        let level_u32 = level as u32;
        let is_active = level_u32 < tree_depth_u32;
        
        if is_active {
            // Extract bit at this level: (index >> level) & 1
            let mut temp_index = index_u32;
            let mut shift = level_u32;
            // Shift right by level
            for _ in 0..32 {
                if shift > 0 {
                    temp_index = temp_index / 2;
                    shift = shift - 1;
                }
            }
            let bit = temp_index % 2;
            
            if bit == 1 {
                // Right child: hash(sideNodes[level], node)
                let sibling = side_nodes[level];
                node = Poseidon2::hash([sibling, node], 2);
            } else {
                // Left child: save node to sideNodes[level]
                side_nodes[level] = node;
            }
        }
    }
    
    // Store root at sideNodes[depth]
    let depth_idx = tree_depth_u32;
    if depth_idx < MAX_TREE_DEPTH {
        side_nodes[depth_idx] = node;
    }
    
    (node, tree_depth, side_nodes)
}

/// Generate merkle proof for a leaf at given index by reconstructing from all leaves
/// This matches the @zk-kit/lean-imt.sol logic exactly
pub fn generate_merkle_proof(
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
    
    // Build tree level by level to find sibling nodes
    let mut current_level: [Field; 256] = all_leaves;
    let mut current_level_size = tree_size_u32;
    
    for level in 0..MAX_TREE_DEPTH {
        let level_u32 = level as u32;
        let is_active = level_u32 < depth_u32;
        
        if is_active {
            // Calculate node_index at this level = index >> level
            let mut temp_idx = index_u32;
            let mut shifts_remaining = level_u32;
            for _ in 0..32 {
                if shifts_remaining > 0 {
                    temp_idx = temp_idx / 2;
                    shifts_remaining = shifts_remaining - 1;
                }
            }
            let node_index = temp_idx;
            
            // Check if we're a left or right child
            let bit = node_index % 2;
            
            if bit == 1 {
                // Right child: sibling is at node_index - 1
                let sibling_index = node_index - 1;
                if sibling_index < current_level_size {
                    proof[level] = current_level[sibling_index];
                } else {
                    proof[level] = 0;
                }
            } else {
                // Left child: sibling is at node_index + 1 (if it exists)
                let sibling_index = node_index + 1;
                if sibling_index < current_level_size {
                    proof[level] = current_level[sibling_index];
                } else {
                    // No right sibling in lean-IMT
                    proof[level] = 0;
                }
            }
            
            // Build next level for next iteration
            let next_level_size = ((current_level_size - 1) / 2) + 1;
            let mut next_level: [Field; 256] = [0; 256];
            
            for i in 0..128 {
                let should_compute = i < next_level_size;
                if should_compute {
                    let left_idx = i * 2;
                    let right_idx = left_idx + 1;
                    
                    if right_idx < current_level_size {
                        // Both children exist: hash them
                        next_level[i] = Poseidon2::hash([current_level[left_idx], current_level[right_idx]], 2);
                    } else if left_idx < current_level_size {
                        // Only left child: copy it (lean-IMT property)
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

