use dep::std;
use dep::poseidon::poseidon2::Poseidon2;
use crate::lean_imt_verify::verify_merkle_proof;

// Test leaves: 0x0000..., 0x1111..., 0x2222..., etc. (as Field)
global LEAF_0: Field = 0x00000000000000000000000000000000000000000000000000000000000000 as Field;
global LEAF_1: Field = 0x11111111111111111111111111111111111111111111111111111111111111 as Field;
global LEAF_2: Field = 0x22222222222222222222222222222222222222222222222222222222222222 as Field;
global LEAF_3: Field = 0x33333333333333333333333333333333333333333333333333333333333333 as Field;
global LEAF_4: Field = 0x44444444444444444444444444444444444444444444444444444444444444 as Field;
global LEAF_5: Field = 0x55555555555555555555555555555555555555555555555555555555555555 as Field;
global LEAF_6: Field = 0x66666666666666666666666666666666666666666666666666666666666666 as Field;
global LEAF_7: Field = 0x77777777777777777777777777777777777777777777777777777777777777 as Field;
global LEAF_8: Field = 0x88888888888888888888888888888888888888888888888888888888888888 as Field;
global LEAF_9: Field = 0x99999999999999999999999999999999999999999999999999999999999999 as Field;

/// Build a lean-IMT tree incrementally (matching Solidity contract algorithm)
/// Returns: (root, depth, proofs for each leaf)
fn build_lean_imt_tree(leaves: [Field; 10]) -> (Field, Field, [[Field; 32]; 10]) {
    let mut side_nodes: [Field; 33] = [0; 33];
    let mut size = 0;
    let mut depth = 0;
    let mut roots: [Field; 10] = [0; 10];
    let mut proofs: [[Field; 32]; 10] = [[0; 32]; 10];
    
    // Insert each leaf
    for i in 0..10 {
        let leaf = leaves[i];
        let index = size;
        
        // Calculate tree depth (matching contract: MIN_TREE_DEPTH = 8)
        // Check if 2^depth < index + 1
        let mut power_of_2 = 1 as u32;
        for _ in 0..depth {
            power_of_2 = power_of_2 * 2;
        }
        
        if power_of_2 < index + 1 {
            depth = depth + 1;
        }
        if depth < 8 {
            depth = 8; // MIN_TREE_DEPTH
        }
        
        let mut node = leaf;
        
        // Insert algorithm (matching contract)
        for level in 0..depth {
            let bit = (index >> level) % 2;
            if bit == 1 {
                // Right child: hash(sideNodes[level], node)
                node = Poseidon2::hash([side_nodes[level], node], 2);
            } else {
                // Left child: save current node to sideNodes
                side_nodes[level] = node;
            }
        }
        
        size = size + 1;
        side_nodes[depth] = node; // Store root
        roots[i] = node;
    }
    
    let final_root = roots[9];
    let final_depth = depth as Field;
    
    // Generate proofs for each leaf (simplified - just return zeros for now)
    // Full proof generation would require rebuilding tree for each leaf
    for leaf_index in 0..10 {
        let mut proof: [Field; 32] = [0; 32];
        // TODO: Implement full proof generation
        proofs[leaf_index] = proof;
    }
    
    (final_root, final_depth, proofs)
}

#[test]
fn test_lean_imt_multi_context() {
    std::println("================================================================");
    std::println("      NOIR: Lean IMT Multi-Context Test                       ");
    std::println("================================================================");
    std::println("");
    
    let leaves: [Field; 10] = [LEAF_0, LEAF_1, LEAF_2, LEAF_3, LEAF_4, LEAF_5, LEAF_6, LEAF_7, LEAF_8, LEAF_9];
    
    std::println("Building tree with 10 leaves...");
    std::println("");
    
    let (root, depth, proofs) = build_lean_imt_tree(leaves);
    
    std::println("Tree built:");
    std::print("  Root: ");
    std::println(root);
    std::print("  Depth: ");
    std::println(depth);
    std::println("");
    
    std::println("================================================================");
    std::println("NOIR TEST RESULTS:");
    std::print("  Root: ");
    std::println(root);
    std::print("  Depth: ");
    std::println(depth);
    std::println("================================================================");
    std::println("");
    std::println("=== OUTPUT FOR COMPARISON ===");
    std::print("ROOT:");
    std::println(root);
    std::print("DEPTH:");
    std::println(depth);
    std::println("=== END OUTPUT ===");
}
