#!/usr/bin/env node

/**
 * Generate Lean-IMT verify circuit with unrolled loop
 * Processes 32 levels, but only processes levels < tree_depth
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'lean_imt_verify.circom');
// MAX_TREE_DEPTH = 32 (maximum supported depth)
// The circuit processes only levels < tree_depth dynamically using should_process_i
// This means even though we have 32 levels, we only compute hashes for levels that are actually used
const MAX_TREE_DEPTH = 32;

function generateLeanIMTVerify() {
    let code = `pragma circom 2.0.0;

// Lean-IMT (Incremental Merkle Tree) verification circuit
// Matches circuits/lib/lean-imt-verify/src/lean_imt_verify.nr
// Auto-generated with unrolled loop for ${MAX_TREE_DEPTH} levels

include "../poseidon/poseidon2.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Maximum depth for lean-IMT (supports up to 2^MAX_TREE_DEPTH leaves)
// MAX_TREE_DEPTH = ${MAX_TREE_DEPTH}

/// Verify merkle proof for lean-IMT
/// @param leaf The leaf value to verify
/// @param index The index of the leaf in the tree
/// @param tree_depth The actual depth of the tree
/// @param expected_root The expected root of the tree
/// @param proof Array of sibling nodes (fixed size ${MAX_TREE_DEPTH}, dummy values (0) for unused levels)
template LeanIMTVerify() {
    signal input leaf;
    signal input index;
    signal input tree_depth;
    signal input expected_root;
    signal input proof[${MAX_TREE_DEPTH}];  // Fixed size array for MAX_TREE_DEPTH = ${MAX_TREE_DEPTH}
    
    // Convert index to bits ONCE at the beginning (optimization)
    // We'll use these bits directly instead of re-converting at each level
    // Need enough bits for max index (2^32 - 1), so 32 bits is sufficient
    // But we use 64 bits to be safe for very large trees
    component n2b = Num2Bits(64);
    n2b.in <== index;
    
    // Working state
    signal current[${MAX_TREE_DEPTH + 1}];  // current[0] = leaf, current[i+1] = result after level i
    
    // Initialize
    current[0] <== leaf;
    
`;

    // Generate code for each level
    for (let i = 0; i < MAX_TREE_DEPTH; i++) {
        code += `    // Level ${i}\n`;
        code += `    // Check if level < tree_depth\n`;
        code += `    // Use 32 bits since tree_depth is at most 32\n`;
        code += `    component lt_${i} = LessThan(32);\n`;
        code += `    lt_${i}.in[0] <== ${i};\n`;
        code += `    lt_${i}.in[1] <== tree_depth;\n`;
        code += `    signal should_process_${i};\n`;
        code += `    should_process_${i} <== lt_${i}.out;\n`;
        code += `\n`;
        
        code += `    // Extract bit at level ${i} directly from pre-computed bits\n`;
        code += `    // Bit ${i} is the ${i}-th bit of the original index (LSB = level 0)\n`;
        code += `    signal bit_${i};\n`;
        if (i < 64) {
            code += `    bit_${i} <== n2b.out[${i}];  // Use pre-computed bit\n`;
        } else {
            code += `    // Level ${i} is beyond 64 bits, use 0 (tree depth is typically < 32)\n`;
            code += `    bit_${i} <== 0;\n`;
        }
        code += `\n`;
        
        code += `    // Get sibling from proof[${i}]\n`;
        code += `    signal sibling_${i};\n`;
        code += `    sibling_${i} <== proof[${i}];\n`;
        code += `\n`;
        
        code += `    // Check if sibling != 0\n`;
        code += `    component sibling_zero_${i} = IsZero();\n`;
        code += `    sibling_zero_${i}.in <== sibling_${i};\n`;
        code += `    signal sibling_not_zero_${i};\n`;
        code += `    sibling_not_zero_${i} <== 1 - sibling_zero_${i}.out;\n`;
        code += `\n`;
        
        code += `    // Lean-IMT logic:\n`;
        code += `    // - If bit is 1 (right child): hash(left_sibling, current)\n`;
        code += `    // - If bit is 0 (left child): if sibling != 0, hash(current, right_sibling), else current stays\n`;
        code += `    \n`;
        code += `    // Compute hash for right child case: hash(sibling, current)\n`;
        code += `    component hash_right_${i} = Poseidon2Hash2();\n`;
        code += `    hash_right_${i}.in[0] <== sibling_${i};\n`;
        code += `    hash_right_${i}.in[1] <== current[${i}];\n`;
        code += `    \n`;
        code += `    // Compute hash for left child case (if sibling != 0): hash(current, sibling)\n`;
        code += `    component hash_left_${i} = Poseidon2Hash2();\n`;
        code += `    hash_left_${i}.in[0] <== current[${i}];\n`;
        code += `    hash_left_${i}.in[1] <== sibling_${i};\n`;
        code += `    \n`;
        code += `    // Select result based on bit and sibling:\n`;
        code += `    // - If bit == 1: use hash_right\n`;
        code += `    // - If bit == 0 and sibling != 0: use hash_left\n`;
        code += `    // - If bit == 0 and sibling == 0: use current (no change)\n`;
        code += `    \n`;
        code += `    signal not_bit_${i};\n`;
        code += `    not_bit_${i} <== 1 - bit_${i};\n`;
        code += `    \n`;
        code += `    // Compute: bit * hash_right + (1 - bit) * (sibling_not_zero * hash_left + (1 - sibling_not_zero) * current)\n`;
        code += `    // Break down to avoid cubic constraints:\n`;
        code += `    // 1. Compute left case: sibling_not_zero * hash_left + (1 - sibling_not_zero) * current\n`;
        code += `    // 2. Then: bit * hash_right + (1 - bit) * left_case\n`;
        code += `    \n`;
        code += `    signal diff_left_${i};\n`;
        code += `    diff_left_${i} <== hash_left_${i}.out - current[${i}];\n`;
        code += `    \n`;
        code += `    // Left case: current + sibling_not_zero * diff_left\n`;
        code += `    signal left_case_${i};\n`;
        code += `    left_case_${i} <== current[${i}] + sibling_not_zero_${i} * diff_left_${i};\n`;
        code += `    \n`;
        code += `    // Final selection: bit * hash_right + (1 - bit) * left_case\n`;
        code += `    signal diff_right_${i};\n`;
        code += `    diff_right_${i} <== hash_right_${i}.out - left_case_${i};\n`;
        code += `    \n`;
        code += `    signal sel_hash_${i};\n`;
        code += `    sel_hash_${i} <== left_case_${i} + bit_${i} * diff_right_${i};\n`;
        code += `    \n`;
        code += `    // If should_process: use sel_hash, else keep current\n`;
        code += `    // This optimization skips expensive operations when level >= tree_depth\n`;
        code += `    signal diff_process_${i};\n`;
        code += `    diff_process_${i} <== sel_hash_${i} - current[${i}];\n`;
        code += `    \n`;
        code += `    current[${i + 1}] <== current[${i}] + should_process_${i} * diff_process_${i};\n`;
        code += `\n`;
    }
    
    code += `    // Final verification: current[${MAX_TREE_DEPTH}] should equal expected_root\n`;
    code += `    component root_eq = IsEqual();\n`;
    code += `    root_eq.in[0] <== current[${MAX_TREE_DEPTH}];\n`;
    code += `    root_eq.in[1] <== expected_root;\n`;
    code += `    \n`;
    code += `    // Constraint: root must match\n`;
    code += `    root_eq.out === 1;\n`;
    code += `}\n`;
    
    // Note: This is a library template, no main component
    return code;
}

function main() {
    console.log(`Generating Lean-IMT verify circuit (${MAX_TREE_DEPTH} levels)...`);
    
    const code = generateLeanIMTVerify();
    
    fs.writeFileSync(OUTPUT_FILE, code);
    
    console.log(`✅ Generated: ${OUTPUT_FILE}`);
    console.log(`   Template: LeanIMTVerify`);
    console.log(`   Max depth: ${MAX_TREE_DEPTH}`);
    console.log(`   Components per level: ~10 (hash, comparisons, etc.)`);
    console.log(`   Total components: ~${MAX_TREE_DEPTH * 10}`);
}

if (require.main === module) {
    main();
}

module.exports = { generateLeanIMTVerify };

