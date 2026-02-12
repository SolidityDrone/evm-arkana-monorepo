pragma circom 2.0.0;

// Lean-IMT (Incremental Merkle Tree) verification circuit
// Matches circuits/lib/lean-imt-verify/src/lean_imt_verify.nr
// Auto-generated with unrolled loop for 32 levels

include "../poseidon/poseidon2.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Maximum depth for lean-IMT (supports up to 2^MAX_TREE_DEPTH leaves)
// MAX_TREE_DEPTH = 32

/// Verify merkle proof for lean-IMT
/// @param leaf The leaf value to verify
/// @param index The index of the leaf in the tree
/// @param tree_depth The actual depth of the tree
/// @param expected_root The expected root of the tree
/// @param proof Array of sibling nodes (fixed size 32, dummy values (0) for unused levels)
template LeanIMTVerify() {
    signal input leaf;
    signal input index;
    signal input tree_depth;
    signal input expected_root;
    signal input proof[32];  // Fixed size array for MAX_TREE_DEPTH = 32
    
    // Convert index to bits ONCE at the beginning (optimization)
    // We'll use these bits directly instead of re-converting at each level
    // Need enough bits for max index (2^32 - 1), so 32 bits is sufficient
    // But we use 64 bits to be safe for very large trees
    component n2b = Num2Bits(64);
    n2b.in <== index;
    
    // Working state
    signal current[33];  // current[0] = leaf, current[i+1] = result after level i
    
    // Initialize
    current[0] <== leaf;
    
    // Level 0
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_0 = LessThan(32);
    lt_0.in[0] <== 0;
    lt_0.in[1] <== tree_depth;
    signal should_process_0;
    should_process_0 <== lt_0.out;

    // Extract bit at level 0 directly from pre-computed bits
    // Bit 0 is the 0-th bit of the original index (LSB = level 0)
    signal bit_0;
    bit_0 <== n2b.out[0];  // Use pre-computed bit

    // Get sibling from proof[0]
    signal sibling_0;
    sibling_0 <== proof[0];

    // Check if sibling != 0
    component sibling_zero_0 = IsZero();
    sibling_zero_0.in <== sibling_0;
    signal sibling_not_zero_0;
    sibling_not_zero_0 <== 1 - sibling_zero_0.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_0 = Poseidon2Hash2();
    hash_right_0.in[0] <== sibling_0;
    hash_right_0.in[1] <== current[0];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_0 = Poseidon2Hash2();
    hash_left_0.in[0] <== current[0];
    hash_left_0.in[1] <== sibling_0;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_0;
    not_bit_0 <== 1 - bit_0;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_0;
    diff_left_0 <== hash_left_0.out - current[0];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_0;
    left_case_0 <== current[0] + sibling_not_zero_0 * diff_left_0;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_0;
    diff_right_0 <== hash_right_0.out - left_case_0;
    
    signal sel_hash_0;
    sel_hash_0 <== left_case_0 + bit_0 * diff_right_0;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_0;
    diff_process_0 <== sel_hash_0 - current[0];
    
    current[1] <== current[0] + should_process_0 * diff_process_0;

    // Level 1
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_1 = LessThan(32);
    lt_1.in[0] <== 1;
    lt_1.in[1] <== tree_depth;
    signal should_process_1;
    should_process_1 <== lt_1.out;

    // Extract bit at level 1 directly from pre-computed bits
    // Bit 1 is the 1-th bit of the original index (LSB = level 0)
    signal bit_1;
    bit_1 <== n2b.out[1];  // Use pre-computed bit

    // Get sibling from proof[1]
    signal sibling_1;
    sibling_1 <== proof[1];

    // Check if sibling != 0
    component sibling_zero_1 = IsZero();
    sibling_zero_1.in <== sibling_1;
    signal sibling_not_zero_1;
    sibling_not_zero_1 <== 1 - sibling_zero_1.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_1 = Poseidon2Hash2();
    hash_right_1.in[0] <== sibling_1;
    hash_right_1.in[1] <== current[1];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_1 = Poseidon2Hash2();
    hash_left_1.in[0] <== current[1];
    hash_left_1.in[1] <== sibling_1;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_1;
    not_bit_1 <== 1 - bit_1;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_1;
    diff_left_1 <== hash_left_1.out - current[1];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_1;
    left_case_1 <== current[1] + sibling_not_zero_1 * diff_left_1;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_1;
    diff_right_1 <== hash_right_1.out - left_case_1;
    
    signal sel_hash_1;
    sel_hash_1 <== left_case_1 + bit_1 * diff_right_1;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_1;
    diff_process_1 <== sel_hash_1 - current[1];
    
    current[2] <== current[1] + should_process_1 * diff_process_1;

    // Level 2
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_2 = LessThan(32);
    lt_2.in[0] <== 2;
    lt_2.in[1] <== tree_depth;
    signal should_process_2;
    should_process_2 <== lt_2.out;

    // Extract bit at level 2 directly from pre-computed bits
    // Bit 2 is the 2-th bit of the original index (LSB = level 0)
    signal bit_2;
    bit_2 <== n2b.out[2];  // Use pre-computed bit

    // Get sibling from proof[2]
    signal sibling_2;
    sibling_2 <== proof[2];

    // Check if sibling != 0
    component sibling_zero_2 = IsZero();
    sibling_zero_2.in <== sibling_2;
    signal sibling_not_zero_2;
    sibling_not_zero_2 <== 1 - sibling_zero_2.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_2 = Poseidon2Hash2();
    hash_right_2.in[0] <== sibling_2;
    hash_right_2.in[1] <== current[2];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_2 = Poseidon2Hash2();
    hash_left_2.in[0] <== current[2];
    hash_left_2.in[1] <== sibling_2;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_2;
    not_bit_2 <== 1 - bit_2;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_2;
    diff_left_2 <== hash_left_2.out - current[2];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_2;
    left_case_2 <== current[2] + sibling_not_zero_2 * diff_left_2;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_2;
    diff_right_2 <== hash_right_2.out - left_case_2;
    
    signal sel_hash_2;
    sel_hash_2 <== left_case_2 + bit_2 * diff_right_2;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_2;
    diff_process_2 <== sel_hash_2 - current[2];
    
    current[3] <== current[2] + should_process_2 * diff_process_2;

    // Level 3
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_3 = LessThan(32);
    lt_3.in[0] <== 3;
    lt_3.in[1] <== tree_depth;
    signal should_process_3;
    should_process_3 <== lt_3.out;

    // Extract bit at level 3 directly from pre-computed bits
    // Bit 3 is the 3-th bit of the original index (LSB = level 0)
    signal bit_3;
    bit_3 <== n2b.out[3];  // Use pre-computed bit

    // Get sibling from proof[3]
    signal sibling_3;
    sibling_3 <== proof[3];

    // Check if sibling != 0
    component sibling_zero_3 = IsZero();
    sibling_zero_3.in <== sibling_3;
    signal sibling_not_zero_3;
    sibling_not_zero_3 <== 1 - sibling_zero_3.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_3 = Poseidon2Hash2();
    hash_right_3.in[0] <== sibling_3;
    hash_right_3.in[1] <== current[3];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_3 = Poseidon2Hash2();
    hash_left_3.in[0] <== current[3];
    hash_left_3.in[1] <== sibling_3;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_3;
    not_bit_3 <== 1 - bit_3;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_3;
    diff_left_3 <== hash_left_3.out - current[3];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_3;
    left_case_3 <== current[3] + sibling_not_zero_3 * diff_left_3;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_3;
    diff_right_3 <== hash_right_3.out - left_case_3;
    
    signal sel_hash_3;
    sel_hash_3 <== left_case_3 + bit_3 * diff_right_3;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_3;
    diff_process_3 <== sel_hash_3 - current[3];
    
    current[4] <== current[3] + should_process_3 * diff_process_3;

    // Level 4
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_4 = LessThan(32);
    lt_4.in[0] <== 4;
    lt_4.in[1] <== tree_depth;
    signal should_process_4;
    should_process_4 <== lt_4.out;

    // Extract bit at level 4 directly from pre-computed bits
    // Bit 4 is the 4-th bit of the original index (LSB = level 0)
    signal bit_4;
    bit_4 <== n2b.out[4];  // Use pre-computed bit

    // Get sibling from proof[4]
    signal sibling_4;
    sibling_4 <== proof[4];

    // Check if sibling != 0
    component sibling_zero_4 = IsZero();
    sibling_zero_4.in <== sibling_4;
    signal sibling_not_zero_4;
    sibling_not_zero_4 <== 1 - sibling_zero_4.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_4 = Poseidon2Hash2();
    hash_right_4.in[0] <== sibling_4;
    hash_right_4.in[1] <== current[4];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_4 = Poseidon2Hash2();
    hash_left_4.in[0] <== current[4];
    hash_left_4.in[1] <== sibling_4;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_4;
    not_bit_4 <== 1 - bit_4;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_4;
    diff_left_4 <== hash_left_4.out - current[4];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_4;
    left_case_4 <== current[4] + sibling_not_zero_4 * diff_left_4;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_4;
    diff_right_4 <== hash_right_4.out - left_case_4;
    
    signal sel_hash_4;
    sel_hash_4 <== left_case_4 + bit_4 * diff_right_4;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_4;
    diff_process_4 <== sel_hash_4 - current[4];
    
    current[5] <== current[4] + should_process_4 * diff_process_4;

    // Level 5
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_5 = LessThan(32);
    lt_5.in[0] <== 5;
    lt_5.in[1] <== tree_depth;
    signal should_process_5;
    should_process_5 <== lt_5.out;

    // Extract bit at level 5 directly from pre-computed bits
    // Bit 5 is the 5-th bit of the original index (LSB = level 0)
    signal bit_5;
    bit_5 <== n2b.out[5];  // Use pre-computed bit

    // Get sibling from proof[5]
    signal sibling_5;
    sibling_5 <== proof[5];

    // Check if sibling != 0
    component sibling_zero_5 = IsZero();
    sibling_zero_5.in <== sibling_5;
    signal sibling_not_zero_5;
    sibling_not_zero_5 <== 1 - sibling_zero_5.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_5 = Poseidon2Hash2();
    hash_right_5.in[0] <== sibling_5;
    hash_right_5.in[1] <== current[5];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_5 = Poseidon2Hash2();
    hash_left_5.in[0] <== current[5];
    hash_left_5.in[1] <== sibling_5;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_5;
    not_bit_5 <== 1 - bit_5;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_5;
    diff_left_5 <== hash_left_5.out - current[5];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_5;
    left_case_5 <== current[5] + sibling_not_zero_5 * diff_left_5;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_5;
    diff_right_5 <== hash_right_5.out - left_case_5;
    
    signal sel_hash_5;
    sel_hash_5 <== left_case_5 + bit_5 * diff_right_5;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_5;
    diff_process_5 <== sel_hash_5 - current[5];
    
    current[6] <== current[5] + should_process_5 * diff_process_5;

    // Level 6
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_6 = LessThan(32);
    lt_6.in[0] <== 6;
    lt_6.in[1] <== tree_depth;
    signal should_process_6;
    should_process_6 <== lt_6.out;

    // Extract bit at level 6 directly from pre-computed bits
    // Bit 6 is the 6-th bit of the original index (LSB = level 0)
    signal bit_6;
    bit_6 <== n2b.out[6];  // Use pre-computed bit

    // Get sibling from proof[6]
    signal sibling_6;
    sibling_6 <== proof[6];

    // Check if sibling != 0
    component sibling_zero_6 = IsZero();
    sibling_zero_6.in <== sibling_6;
    signal sibling_not_zero_6;
    sibling_not_zero_6 <== 1 - sibling_zero_6.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_6 = Poseidon2Hash2();
    hash_right_6.in[0] <== sibling_6;
    hash_right_6.in[1] <== current[6];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_6 = Poseidon2Hash2();
    hash_left_6.in[0] <== current[6];
    hash_left_6.in[1] <== sibling_6;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_6;
    not_bit_6 <== 1 - bit_6;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_6;
    diff_left_6 <== hash_left_6.out - current[6];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_6;
    left_case_6 <== current[6] + sibling_not_zero_6 * diff_left_6;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_6;
    diff_right_6 <== hash_right_6.out - left_case_6;
    
    signal sel_hash_6;
    sel_hash_6 <== left_case_6 + bit_6 * diff_right_6;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_6;
    diff_process_6 <== sel_hash_6 - current[6];
    
    current[7] <== current[6] + should_process_6 * diff_process_6;

    // Level 7
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_7 = LessThan(32);
    lt_7.in[0] <== 7;
    lt_7.in[1] <== tree_depth;
    signal should_process_7;
    should_process_7 <== lt_7.out;

    // Extract bit at level 7 directly from pre-computed bits
    // Bit 7 is the 7-th bit of the original index (LSB = level 0)
    signal bit_7;
    bit_7 <== n2b.out[7];  // Use pre-computed bit

    // Get sibling from proof[7]
    signal sibling_7;
    sibling_7 <== proof[7];

    // Check if sibling != 0
    component sibling_zero_7 = IsZero();
    sibling_zero_7.in <== sibling_7;
    signal sibling_not_zero_7;
    sibling_not_zero_7 <== 1 - sibling_zero_7.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_7 = Poseidon2Hash2();
    hash_right_7.in[0] <== sibling_7;
    hash_right_7.in[1] <== current[7];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_7 = Poseidon2Hash2();
    hash_left_7.in[0] <== current[7];
    hash_left_7.in[1] <== sibling_7;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_7;
    not_bit_7 <== 1 - bit_7;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_7;
    diff_left_7 <== hash_left_7.out - current[7];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_7;
    left_case_7 <== current[7] + sibling_not_zero_7 * diff_left_7;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_7;
    diff_right_7 <== hash_right_7.out - left_case_7;
    
    signal sel_hash_7;
    sel_hash_7 <== left_case_7 + bit_7 * diff_right_7;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_7;
    diff_process_7 <== sel_hash_7 - current[7];
    
    current[8] <== current[7] + should_process_7 * diff_process_7;

    // Level 8
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_8 = LessThan(32);
    lt_8.in[0] <== 8;
    lt_8.in[1] <== tree_depth;
    signal should_process_8;
    should_process_8 <== lt_8.out;

    // Extract bit at level 8 directly from pre-computed bits
    // Bit 8 is the 8-th bit of the original index (LSB = level 0)
    signal bit_8;
    bit_8 <== n2b.out[8];  // Use pre-computed bit

    // Get sibling from proof[8]
    signal sibling_8;
    sibling_8 <== proof[8];

    // Check if sibling != 0
    component sibling_zero_8 = IsZero();
    sibling_zero_8.in <== sibling_8;
    signal sibling_not_zero_8;
    sibling_not_zero_8 <== 1 - sibling_zero_8.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_8 = Poseidon2Hash2();
    hash_right_8.in[0] <== sibling_8;
    hash_right_8.in[1] <== current[8];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_8 = Poseidon2Hash2();
    hash_left_8.in[0] <== current[8];
    hash_left_8.in[1] <== sibling_8;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_8;
    not_bit_8 <== 1 - bit_8;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_8;
    diff_left_8 <== hash_left_8.out - current[8];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_8;
    left_case_8 <== current[8] + sibling_not_zero_8 * diff_left_8;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_8;
    diff_right_8 <== hash_right_8.out - left_case_8;
    
    signal sel_hash_8;
    sel_hash_8 <== left_case_8 + bit_8 * diff_right_8;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_8;
    diff_process_8 <== sel_hash_8 - current[8];
    
    current[9] <== current[8] + should_process_8 * diff_process_8;

    // Level 9
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_9 = LessThan(32);
    lt_9.in[0] <== 9;
    lt_9.in[1] <== tree_depth;
    signal should_process_9;
    should_process_9 <== lt_9.out;

    // Extract bit at level 9 directly from pre-computed bits
    // Bit 9 is the 9-th bit of the original index (LSB = level 0)
    signal bit_9;
    bit_9 <== n2b.out[9];  // Use pre-computed bit

    // Get sibling from proof[9]
    signal sibling_9;
    sibling_9 <== proof[9];

    // Check if sibling != 0
    component sibling_zero_9 = IsZero();
    sibling_zero_9.in <== sibling_9;
    signal sibling_not_zero_9;
    sibling_not_zero_9 <== 1 - sibling_zero_9.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_9 = Poseidon2Hash2();
    hash_right_9.in[0] <== sibling_9;
    hash_right_9.in[1] <== current[9];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_9 = Poseidon2Hash2();
    hash_left_9.in[0] <== current[9];
    hash_left_9.in[1] <== sibling_9;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_9;
    not_bit_9 <== 1 - bit_9;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_9;
    diff_left_9 <== hash_left_9.out - current[9];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_9;
    left_case_9 <== current[9] + sibling_not_zero_9 * diff_left_9;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_9;
    diff_right_9 <== hash_right_9.out - left_case_9;
    
    signal sel_hash_9;
    sel_hash_9 <== left_case_9 + bit_9 * diff_right_9;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_9;
    diff_process_9 <== sel_hash_9 - current[9];
    
    current[10] <== current[9] + should_process_9 * diff_process_9;

    // Level 10
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_10 = LessThan(32);
    lt_10.in[0] <== 10;
    lt_10.in[1] <== tree_depth;
    signal should_process_10;
    should_process_10 <== lt_10.out;

    // Extract bit at level 10 directly from pre-computed bits
    // Bit 10 is the 10-th bit of the original index (LSB = level 0)
    signal bit_10;
    bit_10 <== n2b.out[10];  // Use pre-computed bit

    // Get sibling from proof[10]
    signal sibling_10;
    sibling_10 <== proof[10];

    // Check if sibling != 0
    component sibling_zero_10 = IsZero();
    sibling_zero_10.in <== sibling_10;
    signal sibling_not_zero_10;
    sibling_not_zero_10 <== 1 - sibling_zero_10.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_10 = Poseidon2Hash2();
    hash_right_10.in[0] <== sibling_10;
    hash_right_10.in[1] <== current[10];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_10 = Poseidon2Hash2();
    hash_left_10.in[0] <== current[10];
    hash_left_10.in[1] <== sibling_10;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_10;
    not_bit_10 <== 1 - bit_10;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_10;
    diff_left_10 <== hash_left_10.out - current[10];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_10;
    left_case_10 <== current[10] + sibling_not_zero_10 * diff_left_10;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_10;
    diff_right_10 <== hash_right_10.out - left_case_10;
    
    signal sel_hash_10;
    sel_hash_10 <== left_case_10 + bit_10 * diff_right_10;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_10;
    diff_process_10 <== sel_hash_10 - current[10];
    
    current[11] <== current[10] + should_process_10 * diff_process_10;

    // Level 11
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_11 = LessThan(32);
    lt_11.in[0] <== 11;
    lt_11.in[1] <== tree_depth;
    signal should_process_11;
    should_process_11 <== lt_11.out;

    // Extract bit at level 11 directly from pre-computed bits
    // Bit 11 is the 11-th bit of the original index (LSB = level 0)
    signal bit_11;
    bit_11 <== n2b.out[11];  // Use pre-computed bit

    // Get sibling from proof[11]
    signal sibling_11;
    sibling_11 <== proof[11];

    // Check if sibling != 0
    component sibling_zero_11 = IsZero();
    sibling_zero_11.in <== sibling_11;
    signal sibling_not_zero_11;
    sibling_not_zero_11 <== 1 - sibling_zero_11.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_11 = Poseidon2Hash2();
    hash_right_11.in[0] <== sibling_11;
    hash_right_11.in[1] <== current[11];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_11 = Poseidon2Hash2();
    hash_left_11.in[0] <== current[11];
    hash_left_11.in[1] <== sibling_11;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_11;
    not_bit_11 <== 1 - bit_11;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_11;
    diff_left_11 <== hash_left_11.out - current[11];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_11;
    left_case_11 <== current[11] + sibling_not_zero_11 * diff_left_11;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_11;
    diff_right_11 <== hash_right_11.out - left_case_11;
    
    signal sel_hash_11;
    sel_hash_11 <== left_case_11 + bit_11 * diff_right_11;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_11;
    diff_process_11 <== sel_hash_11 - current[11];
    
    current[12] <== current[11] + should_process_11 * diff_process_11;

    // Level 12
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_12 = LessThan(32);
    lt_12.in[0] <== 12;
    lt_12.in[1] <== tree_depth;
    signal should_process_12;
    should_process_12 <== lt_12.out;

    // Extract bit at level 12 directly from pre-computed bits
    // Bit 12 is the 12-th bit of the original index (LSB = level 0)
    signal bit_12;
    bit_12 <== n2b.out[12];  // Use pre-computed bit

    // Get sibling from proof[12]
    signal sibling_12;
    sibling_12 <== proof[12];

    // Check if sibling != 0
    component sibling_zero_12 = IsZero();
    sibling_zero_12.in <== sibling_12;
    signal sibling_not_zero_12;
    sibling_not_zero_12 <== 1 - sibling_zero_12.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_12 = Poseidon2Hash2();
    hash_right_12.in[0] <== sibling_12;
    hash_right_12.in[1] <== current[12];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_12 = Poseidon2Hash2();
    hash_left_12.in[0] <== current[12];
    hash_left_12.in[1] <== sibling_12;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_12;
    not_bit_12 <== 1 - bit_12;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_12;
    diff_left_12 <== hash_left_12.out - current[12];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_12;
    left_case_12 <== current[12] + sibling_not_zero_12 * diff_left_12;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_12;
    diff_right_12 <== hash_right_12.out - left_case_12;
    
    signal sel_hash_12;
    sel_hash_12 <== left_case_12 + bit_12 * diff_right_12;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_12;
    diff_process_12 <== sel_hash_12 - current[12];
    
    current[13] <== current[12] + should_process_12 * diff_process_12;

    // Level 13
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_13 = LessThan(32);
    lt_13.in[0] <== 13;
    lt_13.in[1] <== tree_depth;
    signal should_process_13;
    should_process_13 <== lt_13.out;

    // Extract bit at level 13 directly from pre-computed bits
    // Bit 13 is the 13-th bit of the original index (LSB = level 0)
    signal bit_13;
    bit_13 <== n2b.out[13];  // Use pre-computed bit

    // Get sibling from proof[13]
    signal sibling_13;
    sibling_13 <== proof[13];

    // Check if sibling != 0
    component sibling_zero_13 = IsZero();
    sibling_zero_13.in <== sibling_13;
    signal sibling_not_zero_13;
    sibling_not_zero_13 <== 1 - sibling_zero_13.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_13 = Poseidon2Hash2();
    hash_right_13.in[0] <== sibling_13;
    hash_right_13.in[1] <== current[13];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_13 = Poseidon2Hash2();
    hash_left_13.in[0] <== current[13];
    hash_left_13.in[1] <== sibling_13;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_13;
    not_bit_13 <== 1 - bit_13;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_13;
    diff_left_13 <== hash_left_13.out - current[13];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_13;
    left_case_13 <== current[13] + sibling_not_zero_13 * diff_left_13;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_13;
    diff_right_13 <== hash_right_13.out - left_case_13;
    
    signal sel_hash_13;
    sel_hash_13 <== left_case_13 + bit_13 * diff_right_13;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_13;
    diff_process_13 <== sel_hash_13 - current[13];
    
    current[14] <== current[13] + should_process_13 * diff_process_13;

    // Level 14
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_14 = LessThan(32);
    lt_14.in[0] <== 14;
    lt_14.in[1] <== tree_depth;
    signal should_process_14;
    should_process_14 <== lt_14.out;

    // Extract bit at level 14 directly from pre-computed bits
    // Bit 14 is the 14-th bit of the original index (LSB = level 0)
    signal bit_14;
    bit_14 <== n2b.out[14];  // Use pre-computed bit

    // Get sibling from proof[14]
    signal sibling_14;
    sibling_14 <== proof[14];

    // Check if sibling != 0
    component sibling_zero_14 = IsZero();
    sibling_zero_14.in <== sibling_14;
    signal sibling_not_zero_14;
    sibling_not_zero_14 <== 1 - sibling_zero_14.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_14 = Poseidon2Hash2();
    hash_right_14.in[0] <== sibling_14;
    hash_right_14.in[1] <== current[14];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_14 = Poseidon2Hash2();
    hash_left_14.in[0] <== current[14];
    hash_left_14.in[1] <== sibling_14;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_14;
    not_bit_14 <== 1 - bit_14;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_14;
    diff_left_14 <== hash_left_14.out - current[14];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_14;
    left_case_14 <== current[14] + sibling_not_zero_14 * diff_left_14;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_14;
    diff_right_14 <== hash_right_14.out - left_case_14;
    
    signal sel_hash_14;
    sel_hash_14 <== left_case_14 + bit_14 * diff_right_14;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_14;
    diff_process_14 <== sel_hash_14 - current[14];
    
    current[15] <== current[14] + should_process_14 * diff_process_14;

    // Level 15
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_15 = LessThan(32);
    lt_15.in[0] <== 15;
    lt_15.in[1] <== tree_depth;
    signal should_process_15;
    should_process_15 <== lt_15.out;

    // Extract bit at level 15 directly from pre-computed bits
    // Bit 15 is the 15-th bit of the original index (LSB = level 0)
    signal bit_15;
    bit_15 <== n2b.out[15];  // Use pre-computed bit

    // Get sibling from proof[15]
    signal sibling_15;
    sibling_15 <== proof[15];

    // Check if sibling != 0
    component sibling_zero_15 = IsZero();
    sibling_zero_15.in <== sibling_15;
    signal sibling_not_zero_15;
    sibling_not_zero_15 <== 1 - sibling_zero_15.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_15 = Poseidon2Hash2();
    hash_right_15.in[0] <== sibling_15;
    hash_right_15.in[1] <== current[15];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_15 = Poseidon2Hash2();
    hash_left_15.in[0] <== current[15];
    hash_left_15.in[1] <== sibling_15;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_15;
    not_bit_15 <== 1 - bit_15;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_15;
    diff_left_15 <== hash_left_15.out - current[15];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_15;
    left_case_15 <== current[15] + sibling_not_zero_15 * diff_left_15;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_15;
    diff_right_15 <== hash_right_15.out - left_case_15;
    
    signal sel_hash_15;
    sel_hash_15 <== left_case_15 + bit_15 * diff_right_15;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_15;
    diff_process_15 <== sel_hash_15 - current[15];
    
    current[16] <== current[15] + should_process_15 * diff_process_15;

    // Level 16
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_16 = LessThan(32);
    lt_16.in[0] <== 16;
    lt_16.in[1] <== tree_depth;
    signal should_process_16;
    should_process_16 <== lt_16.out;

    // Extract bit at level 16 directly from pre-computed bits
    // Bit 16 is the 16-th bit of the original index (LSB = level 0)
    signal bit_16;
    bit_16 <== n2b.out[16];  // Use pre-computed bit

    // Get sibling from proof[16]
    signal sibling_16;
    sibling_16 <== proof[16];

    // Check if sibling != 0
    component sibling_zero_16 = IsZero();
    sibling_zero_16.in <== sibling_16;
    signal sibling_not_zero_16;
    sibling_not_zero_16 <== 1 - sibling_zero_16.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_16 = Poseidon2Hash2();
    hash_right_16.in[0] <== sibling_16;
    hash_right_16.in[1] <== current[16];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_16 = Poseidon2Hash2();
    hash_left_16.in[0] <== current[16];
    hash_left_16.in[1] <== sibling_16;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_16;
    not_bit_16 <== 1 - bit_16;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_16;
    diff_left_16 <== hash_left_16.out - current[16];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_16;
    left_case_16 <== current[16] + sibling_not_zero_16 * diff_left_16;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_16;
    diff_right_16 <== hash_right_16.out - left_case_16;
    
    signal sel_hash_16;
    sel_hash_16 <== left_case_16 + bit_16 * diff_right_16;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_16;
    diff_process_16 <== sel_hash_16 - current[16];
    
    current[17] <== current[16] + should_process_16 * diff_process_16;

    // Level 17
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_17 = LessThan(32);
    lt_17.in[0] <== 17;
    lt_17.in[1] <== tree_depth;
    signal should_process_17;
    should_process_17 <== lt_17.out;

    // Extract bit at level 17 directly from pre-computed bits
    // Bit 17 is the 17-th bit of the original index (LSB = level 0)
    signal bit_17;
    bit_17 <== n2b.out[17];  // Use pre-computed bit

    // Get sibling from proof[17]
    signal sibling_17;
    sibling_17 <== proof[17];

    // Check if sibling != 0
    component sibling_zero_17 = IsZero();
    sibling_zero_17.in <== sibling_17;
    signal sibling_not_zero_17;
    sibling_not_zero_17 <== 1 - sibling_zero_17.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_17 = Poseidon2Hash2();
    hash_right_17.in[0] <== sibling_17;
    hash_right_17.in[1] <== current[17];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_17 = Poseidon2Hash2();
    hash_left_17.in[0] <== current[17];
    hash_left_17.in[1] <== sibling_17;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_17;
    not_bit_17 <== 1 - bit_17;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_17;
    diff_left_17 <== hash_left_17.out - current[17];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_17;
    left_case_17 <== current[17] + sibling_not_zero_17 * diff_left_17;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_17;
    diff_right_17 <== hash_right_17.out - left_case_17;
    
    signal sel_hash_17;
    sel_hash_17 <== left_case_17 + bit_17 * diff_right_17;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_17;
    diff_process_17 <== sel_hash_17 - current[17];
    
    current[18] <== current[17] + should_process_17 * diff_process_17;

    // Level 18
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_18 = LessThan(32);
    lt_18.in[0] <== 18;
    lt_18.in[1] <== tree_depth;
    signal should_process_18;
    should_process_18 <== lt_18.out;

    // Extract bit at level 18 directly from pre-computed bits
    // Bit 18 is the 18-th bit of the original index (LSB = level 0)
    signal bit_18;
    bit_18 <== n2b.out[18];  // Use pre-computed bit

    // Get sibling from proof[18]
    signal sibling_18;
    sibling_18 <== proof[18];

    // Check if sibling != 0
    component sibling_zero_18 = IsZero();
    sibling_zero_18.in <== sibling_18;
    signal sibling_not_zero_18;
    sibling_not_zero_18 <== 1 - sibling_zero_18.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_18 = Poseidon2Hash2();
    hash_right_18.in[0] <== sibling_18;
    hash_right_18.in[1] <== current[18];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_18 = Poseidon2Hash2();
    hash_left_18.in[0] <== current[18];
    hash_left_18.in[1] <== sibling_18;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_18;
    not_bit_18 <== 1 - bit_18;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_18;
    diff_left_18 <== hash_left_18.out - current[18];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_18;
    left_case_18 <== current[18] + sibling_not_zero_18 * diff_left_18;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_18;
    diff_right_18 <== hash_right_18.out - left_case_18;
    
    signal sel_hash_18;
    sel_hash_18 <== left_case_18 + bit_18 * diff_right_18;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_18;
    diff_process_18 <== sel_hash_18 - current[18];
    
    current[19] <== current[18] + should_process_18 * diff_process_18;

    // Level 19
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_19 = LessThan(32);
    lt_19.in[0] <== 19;
    lt_19.in[1] <== tree_depth;
    signal should_process_19;
    should_process_19 <== lt_19.out;

    // Extract bit at level 19 directly from pre-computed bits
    // Bit 19 is the 19-th bit of the original index (LSB = level 0)
    signal bit_19;
    bit_19 <== n2b.out[19];  // Use pre-computed bit

    // Get sibling from proof[19]
    signal sibling_19;
    sibling_19 <== proof[19];

    // Check if sibling != 0
    component sibling_zero_19 = IsZero();
    sibling_zero_19.in <== sibling_19;
    signal sibling_not_zero_19;
    sibling_not_zero_19 <== 1 - sibling_zero_19.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_19 = Poseidon2Hash2();
    hash_right_19.in[0] <== sibling_19;
    hash_right_19.in[1] <== current[19];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_19 = Poseidon2Hash2();
    hash_left_19.in[0] <== current[19];
    hash_left_19.in[1] <== sibling_19;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_19;
    not_bit_19 <== 1 - bit_19;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_19;
    diff_left_19 <== hash_left_19.out - current[19];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_19;
    left_case_19 <== current[19] + sibling_not_zero_19 * diff_left_19;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_19;
    diff_right_19 <== hash_right_19.out - left_case_19;
    
    signal sel_hash_19;
    sel_hash_19 <== left_case_19 + bit_19 * diff_right_19;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_19;
    diff_process_19 <== sel_hash_19 - current[19];
    
    current[20] <== current[19] + should_process_19 * diff_process_19;

    // Level 20
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_20 = LessThan(32);
    lt_20.in[0] <== 20;
    lt_20.in[1] <== tree_depth;
    signal should_process_20;
    should_process_20 <== lt_20.out;

    // Extract bit at level 20 directly from pre-computed bits
    // Bit 20 is the 20-th bit of the original index (LSB = level 0)
    signal bit_20;
    bit_20 <== n2b.out[20];  // Use pre-computed bit

    // Get sibling from proof[20]
    signal sibling_20;
    sibling_20 <== proof[20];

    // Check if sibling != 0
    component sibling_zero_20 = IsZero();
    sibling_zero_20.in <== sibling_20;
    signal sibling_not_zero_20;
    sibling_not_zero_20 <== 1 - sibling_zero_20.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_20 = Poseidon2Hash2();
    hash_right_20.in[0] <== sibling_20;
    hash_right_20.in[1] <== current[20];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_20 = Poseidon2Hash2();
    hash_left_20.in[0] <== current[20];
    hash_left_20.in[1] <== sibling_20;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_20;
    not_bit_20 <== 1 - bit_20;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_20;
    diff_left_20 <== hash_left_20.out - current[20];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_20;
    left_case_20 <== current[20] + sibling_not_zero_20 * diff_left_20;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_20;
    diff_right_20 <== hash_right_20.out - left_case_20;
    
    signal sel_hash_20;
    sel_hash_20 <== left_case_20 + bit_20 * diff_right_20;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_20;
    diff_process_20 <== sel_hash_20 - current[20];
    
    current[21] <== current[20] + should_process_20 * diff_process_20;

    // Level 21
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_21 = LessThan(32);
    lt_21.in[0] <== 21;
    lt_21.in[1] <== tree_depth;
    signal should_process_21;
    should_process_21 <== lt_21.out;

    // Extract bit at level 21 directly from pre-computed bits
    // Bit 21 is the 21-th bit of the original index (LSB = level 0)
    signal bit_21;
    bit_21 <== n2b.out[21];  // Use pre-computed bit

    // Get sibling from proof[21]
    signal sibling_21;
    sibling_21 <== proof[21];

    // Check if sibling != 0
    component sibling_zero_21 = IsZero();
    sibling_zero_21.in <== sibling_21;
    signal sibling_not_zero_21;
    sibling_not_zero_21 <== 1 - sibling_zero_21.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_21 = Poseidon2Hash2();
    hash_right_21.in[0] <== sibling_21;
    hash_right_21.in[1] <== current[21];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_21 = Poseidon2Hash2();
    hash_left_21.in[0] <== current[21];
    hash_left_21.in[1] <== sibling_21;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_21;
    not_bit_21 <== 1 - bit_21;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_21;
    diff_left_21 <== hash_left_21.out - current[21];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_21;
    left_case_21 <== current[21] + sibling_not_zero_21 * diff_left_21;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_21;
    diff_right_21 <== hash_right_21.out - left_case_21;
    
    signal sel_hash_21;
    sel_hash_21 <== left_case_21 + bit_21 * diff_right_21;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_21;
    diff_process_21 <== sel_hash_21 - current[21];
    
    current[22] <== current[21] + should_process_21 * diff_process_21;

    // Level 22
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_22 = LessThan(32);
    lt_22.in[0] <== 22;
    lt_22.in[1] <== tree_depth;
    signal should_process_22;
    should_process_22 <== lt_22.out;

    // Extract bit at level 22 directly from pre-computed bits
    // Bit 22 is the 22-th bit of the original index (LSB = level 0)
    signal bit_22;
    bit_22 <== n2b.out[22];  // Use pre-computed bit

    // Get sibling from proof[22]
    signal sibling_22;
    sibling_22 <== proof[22];

    // Check if sibling != 0
    component sibling_zero_22 = IsZero();
    sibling_zero_22.in <== sibling_22;
    signal sibling_not_zero_22;
    sibling_not_zero_22 <== 1 - sibling_zero_22.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_22 = Poseidon2Hash2();
    hash_right_22.in[0] <== sibling_22;
    hash_right_22.in[1] <== current[22];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_22 = Poseidon2Hash2();
    hash_left_22.in[0] <== current[22];
    hash_left_22.in[1] <== sibling_22;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_22;
    not_bit_22 <== 1 - bit_22;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_22;
    diff_left_22 <== hash_left_22.out - current[22];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_22;
    left_case_22 <== current[22] + sibling_not_zero_22 * diff_left_22;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_22;
    diff_right_22 <== hash_right_22.out - left_case_22;
    
    signal sel_hash_22;
    sel_hash_22 <== left_case_22 + bit_22 * diff_right_22;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_22;
    diff_process_22 <== sel_hash_22 - current[22];
    
    current[23] <== current[22] + should_process_22 * diff_process_22;

    // Level 23
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_23 = LessThan(32);
    lt_23.in[0] <== 23;
    lt_23.in[1] <== tree_depth;
    signal should_process_23;
    should_process_23 <== lt_23.out;

    // Extract bit at level 23 directly from pre-computed bits
    // Bit 23 is the 23-th bit of the original index (LSB = level 0)
    signal bit_23;
    bit_23 <== n2b.out[23];  // Use pre-computed bit

    // Get sibling from proof[23]
    signal sibling_23;
    sibling_23 <== proof[23];

    // Check if sibling != 0
    component sibling_zero_23 = IsZero();
    sibling_zero_23.in <== sibling_23;
    signal sibling_not_zero_23;
    sibling_not_zero_23 <== 1 - sibling_zero_23.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_23 = Poseidon2Hash2();
    hash_right_23.in[0] <== sibling_23;
    hash_right_23.in[1] <== current[23];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_23 = Poseidon2Hash2();
    hash_left_23.in[0] <== current[23];
    hash_left_23.in[1] <== sibling_23;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_23;
    not_bit_23 <== 1 - bit_23;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_23;
    diff_left_23 <== hash_left_23.out - current[23];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_23;
    left_case_23 <== current[23] + sibling_not_zero_23 * diff_left_23;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_23;
    diff_right_23 <== hash_right_23.out - left_case_23;
    
    signal sel_hash_23;
    sel_hash_23 <== left_case_23 + bit_23 * diff_right_23;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_23;
    diff_process_23 <== sel_hash_23 - current[23];
    
    current[24] <== current[23] + should_process_23 * diff_process_23;

    // Level 24
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_24 = LessThan(32);
    lt_24.in[0] <== 24;
    lt_24.in[1] <== tree_depth;
    signal should_process_24;
    should_process_24 <== lt_24.out;

    // Extract bit at level 24 directly from pre-computed bits
    // Bit 24 is the 24-th bit of the original index (LSB = level 0)
    signal bit_24;
    bit_24 <== n2b.out[24];  // Use pre-computed bit

    // Get sibling from proof[24]
    signal sibling_24;
    sibling_24 <== proof[24];

    // Check if sibling != 0
    component sibling_zero_24 = IsZero();
    sibling_zero_24.in <== sibling_24;
    signal sibling_not_zero_24;
    sibling_not_zero_24 <== 1 - sibling_zero_24.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_24 = Poseidon2Hash2();
    hash_right_24.in[0] <== sibling_24;
    hash_right_24.in[1] <== current[24];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_24 = Poseidon2Hash2();
    hash_left_24.in[0] <== current[24];
    hash_left_24.in[1] <== sibling_24;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_24;
    not_bit_24 <== 1 - bit_24;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_24;
    diff_left_24 <== hash_left_24.out - current[24];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_24;
    left_case_24 <== current[24] + sibling_not_zero_24 * diff_left_24;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_24;
    diff_right_24 <== hash_right_24.out - left_case_24;
    
    signal sel_hash_24;
    sel_hash_24 <== left_case_24 + bit_24 * diff_right_24;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_24;
    diff_process_24 <== sel_hash_24 - current[24];
    
    current[25] <== current[24] + should_process_24 * diff_process_24;

    // Level 25
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_25 = LessThan(32);
    lt_25.in[0] <== 25;
    lt_25.in[1] <== tree_depth;
    signal should_process_25;
    should_process_25 <== lt_25.out;

    // Extract bit at level 25 directly from pre-computed bits
    // Bit 25 is the 25-th bit of the original index (LSB = level 0)
    signal bit_25;
    bit_25 <== n2b.out[25];  // Use pre-computed bit

    // Get sibling from proof[25]
    signal sibling_25;
    sibling_25 <== proof[25];

    // Check if sibling != 0
    component sibling_zero_25 = IsZero();
    sibling_zero_25.in <== sibling_25;
    signal sibling_not_zero_25;
    sibling_not_zero_25 <== 1 - sibling_zero_25.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_25 = Poseidon2Hash2();
    hash_right_25.in[0] <== sibling_25;
    hash_right_25.in[1] <== current[25];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_25 = Poseidon2Hash2();
    hash_left_25.in[0] <== current[25];
    hash_left_25.in[1] <== sibling_25;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_25;
    not_bit_25 <== 1 - bit_25;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_25;
    diff_left_25 <== hash_left_25.out - current[25];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_25;
    left_case_25 <== current[25] + sibling_not_zero_25 * diff_left_25;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_25;
    diff_right_25 <== hash_right_25.out - left_case_25;
    
    signal sel_hash_25;
    sel_hash_25 <== left_case_25 + bit_25 * diff_right_25;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_25;
    diff_process_25 <== sel_hash_25 - current[25];
    
    current[26] <== current[25] + should_process_25 * diff_process_25;

    // Level 26
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_26 = LessThan(32);
    lt_26.in[0] <== 26;
    lt_26.in[1] <== tree_depth;
    signal should_process_26;
    should_process_26 <== lt_26.out;

    // Extract bit at level 26 directly from pre-computed bits
    // Bit 26 is the 26-th bit of the original index (LSB = level 0)
    signal bit_26;
    bit_26 <== n2b.out[26];  // Use pre-computed bit

    // Get sibling from proof[26]
    signal sibling_26;
    sibling_26 <== proof[26];

    // Check if sibling != 0
    component sibling_zero_26 = IsZero();
    sibling_zero_26.in <== sibling_26;
    signal sibling_not_zero_26;
    sibling_not_zero_26 <== 1 - sibling_zero_26.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_26 = Poseidon2Hash2();
    hash_right_26.in[0] <== sibling_26;
    hash_right_26.in[1] <== current[26];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_26 = Poseidon2Hash2();
    hash_left_26.in[0] <== current[26];
    hash_left_26.in[1] <== sibling_26;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_26;
    not_bit_26 <== 1 - bit_26;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_26;
    diff_left_26 <== hash_left_26.out - current[26];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_26;
    left_case_26 <== current[26] + sibling_not_zero_26 * diff_left_26;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_26;
    diff_right_26 <== hash_right_26.out - left_case_26;
    
    signal sel_hash_26;
    sel_hash_26 <== left_case_26 + bit_26 * diff_right_26;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_26;
    diff_process_26 <== sel_hash_26 - current[26];
    
    current[27] <== current[26] + should_process_26 * diff_process_26;

    // Level 27
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_27 = LessThan(32);
    lt_27.in[0] <== 27;
    lt_27.in[1] <== tree_depth;
    signal should_process_27;
    should_process_27 <== lt_27.out;

    // Extract bit at level 27 directly from pre-computed bits
    // Bit 27 is the 27-th bit of the original index (LSB = level 0)
    signal bit_27;
    bit_27 <== n2b.out[27];  // Use pre-computed bit

    // Get sibling from proof[27]
    signal sibling_27;
    sibling_27 <== proof[27];

    // Check if sibling != 0
    component sibling_zero_27 = IsZero();
    sibling_zero_27.in <== sibling_27;
    signal sibling_not_zero_27;
    sibling_not_zero_27 <== 1 - sibling_zero_27.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_27 = Poseidon2Hash2();
    hash_right_27.in[0] <== sibling_27;
    hash_right_27.in[1] <== current[27];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_27 = Poseidon2Hash2();
    hash_left_27.in[0] <== current[27];
    hash_left_27.in[1] <== sibling_27;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_27;
    not_bit_27 <== 1 - bit_27;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_27;
    diff_left_27 <== hash_left_27.out - current[27];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_27;
    left_case_27 <== current[27] + sibling_not_zero_27 * diff_left_27;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_27;
    diff_right_27 <== hash_right_27.out - left_case_27;
    
    signal sel_hash_27;
    sel_hash_27 <== left_case_27 + bit_27 * diff_right_27;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_27;
    diff_process_27 <== sel_hash_27 - current[27];
    
    current[28] <== current[27] + should_process_27 * diff_process_27;

    // Level 28
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_28 = LessThan(32);
    lt_28.in[0] <== 28;
    lt_28.in[1] <== tree_depth;
    signal should_process_28;
    should_process_28 <== lt_28.out;

    // Extract bit at level 28 directly from pre-computed bits
    // Bit 28 is the 28-th bit of the original index (LSB = level 0)
    signal bit_28;
    bit_28 <== n2b.out[28];  // Use pre-computed bit

    // Get sibling from proof[28]
    signal sibling_28;
    sibling_28 <== proof[28];

    // Check if sibling != 0
    component sibling_zero_28 = IsZero();
    sibling_zero_28.in <== sibling_28;
    signal sibling_not_zero_28;
    sibling_not_zero_28 <== 1 - sibling_zero_28.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_28 = Poseidon2Hash2();
    hash_right_28.in[0] <== sibling_28;
    hash_right_28.in[1] <== current[28];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_28 = Poseidon2Hash2();
    hash_left_28.in[0] <== current[28];
    hash_left_28.in[1] <== sibling_28;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_28;
    not_bit_28 <== 1 - bit_28;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_28;
    diff_left_28 <== hash_left_28.out - current[28];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_28;
    left_case_28 <== current[28] + sibling_not_zero_28 * diff_left_28;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_28;
    diff_right_28 <== hash_right_28.out - left_case_28;
    
    signal sel_hash_28;
    sel_hash_28 <== left_case_28 + bit_28 * diff_right_28;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_28;
    diff_process_28 <== sel_hash_28 - current[28];
    
    current[29] <== current[28] + should_process_28 * diff_process_28;

    // Level 29
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_29 = LessThan(32);
    lt_29.in[0] <== 29;
    lt_29.in[1] <== tree_depth;
    signal should_process_29;
    should_process_29 <== lt_29.out;

    // Extract bit at level 29 directly from pre-computed bits
    // Bit 29 is the 29-th bit of the original index (LSB = level 0)
    signal bit_29;
    bit_29 <== n2b.out[29];  // Use pre-computed bit

    // Get sibling from proof[29]
    signal sibling_29;
    sibling_29 <== proof[29];

    // Check if sibling != 0
    component sibling_zero_29 = IsZero();
    sibling_zero_29.in <== sibling_29;
    signal sibling_not_zero_29;
    sibling_not_zero_29 <== 1 - sibling_zero_29.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_29 = Poseidon2Hash2();
    hash_right_29.in[0] <== sibling_29;
    hash_right_29.in[1] <== current[29];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_29 = Poseidon2Hash2();
    hash_left_29.in[0] <== current[29];
    hash_left_29.in[1] <== sibling_29;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_29;
    not_bit_29 <== 1 - bit_29;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_29;
    diff_left_29 <== hash_left_29.out - current[29];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_29;
    left_case_29 <== current[29] + sibling_not_zero_29 * diff_left_29;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_29;
    diff_right_29 <== hash_right_29.out - left_case_29;
    
    signal sel_hash_29;
    sel_hash_29 <== left_case_29 + bit_29 * diff_right_29;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_29;
    diff_process_29 <== sel_hash_29 - current[29];
    
    current[30] <== current[29] + should_process_29 * diff_process_29;

    // Level 30
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_30 = LessThan(32);
    lt_30.in[0] <== 30;
    lt_30.in[1] <== tree_depth;
    signal should_process_30;
    should_process_30 <== lt_30.out;

    // Extract bit at level 30 directly from pre-computed bits
    // Bit 30 is the 30-th bit of the original index (LSB = level 0)
    signal bit_30;
    bit_30 <== n2b.out[30];  // Use pre-computed bit

    // Get sibling from proof[30]
    signal sibling_30;
    sibling_30 <== proof[30];

    // Check if sibling != 0
    component sibling_zero_30 = IsZero();
    sibling_zero_30.in <== sibling_30;
    signal sibling_not_zero_30;
    sibling_not_zero_30 <== 1 - sibling_zero_30.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_30 = Poseidon2Hash2();
    hash_right_30.in[0] <== sibling_30;
    hash_right_30.in[1] <== current[30];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_30 = Poseidon2Hash2();
    hash_left_30.in[0] <== current[30];
    hash_left_30.in[1] <== sibling_30;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_30;
    not_bit_30 <== 1 - bit_30;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_30;
    diff_left_30 <== hash_left_30.out - current[30];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_30;
    left_case_30 <== current[30] + sibling_not_zero_30 * diff_left_30;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_30;
    diff_right_30 <== hash_right_30.out - left_case_30;
    
    signal sel_hash_30;
    sel_hash_30 <== left_case_30 + bit_30 * diff_right_30;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_30;
    diff_process_30 <== sel_hash_30 - current[30];
    
    current[31] <== current[30] + should_process_30 * diff_process_30;

    // Level 31
    // Check if level < tree_depth
    // Use 32 bits since tree_depth is at most 32
    component lt_31 = LessThan(32);
    lt_31.in[0] <== 31;
    lt_31.in[1] <== tree_depth;
    signal should_process_31;
    should_process_31 <== lt_31.out;

    // Extract bit at level 31 directly from pre-computed bits
    // Bit 31 is the 31-th bit of the original index (LSB = level 0)
    signal bit_31;
    bit_31 <== n2b.out[31];  // Use pre-computed bit

    // Get sibling from proof[31]
    signal sibling_31;
    sibling_31 <== proof[31];

    // Check if sibling != 0
    component sibling_zero_31 = IsZero();
    sibling_zero_31.in <== sibling_31;
    signal sibling_not_zero_31;
    sibling_not_zero_31 <== 1 - sibling_zero_31.out;

    // Lean-IMT logic:
    // - If bit is 1 (right child): hash(left_sibling, current)
    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays
    
    // Compute hash for right child case: hash(sibling, current)
    component hash_right_31 = Poseidon2Hash2();
    hash_right_31.in[0] <== sibling_31;
    hash_right_31.in[1] <== current[31];
    
    // Compute hash for left child case (if sibling != 0): hash(current, sibling)
    component hash_left_31 = Poseidon2Hash2();
    hash_left_31.in[0] <== current[31];
    hash_left_31.in[1] <== sibling_31;
    
    // Select result based on bit and sibling:
    // - If bit == 1: use hash_right
    // - If bit == 0 and sibling != 0: use hash_left
    // - If bit == 0 and sibling == 0: use current (no change)
    
    signal not_bit_31;
    not_bit_31 <== 1 - bit_31;
    
    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)
    // Break down to avoid cubic constraints:
    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current
    // 2. Then: bit * hash_right + (1 - bit) * left_case
    
    signal diff_left_31;
    diff_left_31 <== hash_left_31.out - current[31];
    
    // Left case: current + sibling_not_zero * diff_left
    signal left_case_31;
    left_case_31 <== current[31] + sibling_not_zero_31 * diff_left_31;
    
    // Final selection: bit * hash_right + (1 - bit) * left_case
    signal diff_right_31;
    diff_right_31 <== hash_right_31.out - left_case_31;
    
    signal sel_hash_31;
    sel_hash_31 <== left_case_31 + bit_31 * diff_right_31;
    
    // If should_process: use sel_hash, else keep current
    // This optimization skips expensive operations when level >= tree_depth
    signal diff_process_31;
    diff_process_31 <== sel_hash_31 - current[31];
    
    current[32] <== current[31] + should_process_31 * diff_process_31;

    // Final verification: current[32] should equal expected_root
    component root_eq = IsEqual();
    root_eq.in[0] <== current[32];
    root_eq.in[1] <== expected_root;
    
    // Constraint: root must match
    root_eq.out === 1;
}
