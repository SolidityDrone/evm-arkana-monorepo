use dep::poseidon::poseidon2::Poseidon2;

// Maximum depth for lean-IMT (supports up to 2^MAX_TREE_DEPTH leaves)
global MAX_TREE_DEPTH: u32 = 32;

/// Verify merkle proof for lean-IMT
/// @param leaf The leaf value to verify
/// @param index The index of the leaf in the tree
/// @param tree_depth The actual depth of the tree
/// @param expected_root The expected root of the tree
/// @param proof Array of sibling nodes (fixed size MAX_TREE_DEPTH, dummy values (0) for unused levels)
/// 
/// In lean-IMT insertion:
/// - If (index >> level) & 1 == 1: we're on the right, hash(sideNodes[level], node) where sideNodes[level] is left sibling
/// - Else: we're on the left, sideNodes[level] = node (save current), and if right sibling exists later, it will hash with this
/// 
/// For proof verification, we reconstruct the path:
/// - proof[i] contains the sibling node at level i
/// - If bit is 1 (right): hash(left_sibling, current) 
/// - If bit is 0 (left): if right_sibling exists (sibling != 0), hash(current, right_sibling), else current stays
pub fn verify_merkle_proof(
    leaf: Field,
    index: Field,
    tree_depth: Field,
    expected_root: Field,
    proof: [Field; 32]
) {
    // Start with the leaf
    let mut current = leaf;
    let mut index_copy = index;
    
    // Convert tree_depth to u32 once for comparison
    let depth_u32 = tree_depth as u32;
    
    // Process each level - use for loop with explicit bounds check
    // This matches Solidity's for (uint256 level = 0; level < treeDepth; level++)
    for i in 0..MAX_TREE_DEPTH {
        let level = i as u32;
        
        // Only process levels less than tree_depth
        let should_process = level < depth_u32;
        
        if should_process {
            // Convert index to u32 for bit operations (only when needed)
            let index_u32 = index_copy as u32;
            
            // Extract bit at current level (0 = left child, 1 = right child)
            // This matches Solidity: uint256 bit = indexCopy % 2;
            let bit = index_u32 % 2;
            let sibling = proof[i];
            
            // In lean-IMT (matching Solidity implementation exactly):
            // - If bit is 1 (right child): hash(left_sibling, current) where sibling is the left node
            // - If bit is 0 (left child): 
            //   * If right sibling exists (sibling != 0): hash(current, right_sibling) where sibling is the right node
            //   * Else: current stays the same (lean-IMT behavior)
            
            // Match Solidity logic exactly: direct if-else without intermediate booleans
            // Solidity: if (bit == 1) { current = _hash2(sibling, current); } else { if (sibling != 0) { current = _hash2(current, sibling); } }
            if bit == 1 {
                // Right child: hash(left_sibling (from proof), current)
                current = Poseidon2::hash([sibling, current], 2);
            } else {
                // Left child: check if right sibling exists
                // Solidity: if (sibling != 0) { current = _hash2(current, sibling); }
                if sibling != 0 {
                    // Right sibling exists: hash(current, right_sibling)
                    current = Poseidon2::hash([current, sibling], 2);
                }
                // If sibling == 0, current stays the same (lean-IMT behavior)
            }
            
            // Shift index bits for next level (integer divide by 2)
            // Solidity: indexCopy = indexCopy / 2;
            let new_index_u32 = index_u32 / 2;
            index_copy = new_index_u32 as Field;
        }
    }
    
    // Verify the computed root matches the expected root
    // Use assert instead of division by zero for clearer error
    assert(current == expected_root, "Merkle proof verification failed");
}

