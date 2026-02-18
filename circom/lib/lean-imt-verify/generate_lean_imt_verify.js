#!/usr/bin/env node

/**
 * Generate Lean-IMT verify circuit with unrolled loop (no for-loop; Circom 2 disallows components in loops).
 * Runtime tree_depth: only proof[0..tree_depth-1] are used; proof has fixed size 32.
 * Matches contract getDepth() so e.g. depth 8 is correct when the tree has 8 levels.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = path.join(__dirname, 'lean_imt_verify.circom');
const N = 32;

function generateLeanIMTVerify() {
    let code = `pragma circom 2.0.0;

// Lean-IMT (Incremental Merkle Tree) verification circuit
// Runtime tree_depth: only proof[0..tree_depth-1] are used; proof has fixed size ${N} (max depth).
// Auto-generated unrolled circuit (Circom 2 requires components in initial scope).

include "../poseidon/poseidon.circom";
include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

/// Verify merkle proof for lean-IMT with runtime depth
template LeanIMTVerify() {
    signal input leaf;
    signal input index;
    signal input tree_depth;
    signal input expected_root;
    signal input proof[${N}];

    component n2b = Num2Bits(64);
    n2b.in <== index;

    signal current[${N + 1}];
    current[0] <== leaf;

`;

    for (let i = 0; i < N; i++) {
        code += `    // Level ${i}: process only if level < tree_depth\n`;
        code += `    component lt_${i} = LessThan(32);\n`;
        code += `    lt_${i}.in[0] <== ${i};\n`;
        code += `    lt_${i}.in[1] <== tree_depth;\n`;
        code += `    signal should_process_${i};\n`;
        code += `    should_process_${i} <== lt_${i}.out;\n`;
        code += `    component hash_right_${i} = Poseidon2Hash2();\n`;
        code += `    hash_right_${i}.in[0] <== proof[${i}];\n`;
        code += `    hash_right_${i}.in[1] <== current[${i}];\n`;
        code += `    component hash_left_${i} = Poseidon2Hash2();\n`;
        code += `    hash_left_${i}.in[0] <== current[${i}];\n`;
        code += `    hash_left_${i}.in[1] <== proof[${i}];\n`;
        code += `    component sibling_zero_${i} = IsZero();\n`;
        code += `    sibling_zero_${i}.in <== proof[${i}];\n`;
        code += `    signal sibling_not_zero_${i};\n`;
        code += `    sibling_not_zero_${i} <== 1 - sibling_zero_${i}.out;\n`;
        code += `    signal diff_left_${i};\n`;
        code += `    diff_left_${i} <== hash_left_${i}.out - current[${i}];\n`;
        code += `    signal left_case_${i};\n`;
        code += `    left_case_${i} <== current[${i}] + sibling_not_zero_${i} * diff_left_${i};\n`;
        code += `    signal diff_right_${i};\n`;
        code += `    diff_right_${i} <== hash_right_${i}.out - left_case_${i};\n`;
        code += `    signal sel_hash_${i};\n`;
        code += `    sel_hash_${i} <== left_case_${i} + n2b.out[${i}] * diff_right_${i};\n`;
        code += `    signal diff_process_${i};\n`;
        code += `    diff_process_${i} <== sel_hash_${i} - current[${i}];\n`;
        code += `    current[${i + 1}] <== current[${i}] + should_process_${i} * diff_process_${i};\n\n`;
    }

    code += `    component root_eq = IsEqual();\n`;
    code += `    root_eq.in[0] <== current[${N}];\n`;
    code += `    root_eq.in[1] <== expected_root;\n`;
    code += `    root_eq.out === 1;\n`;
    code += `}\n`;
    return code;
}

function main() {
    console.log(`Generating Lean-IMT verify circuit (${N} levels, tree_depth input, unrolled)...`);
    const code = generateLeanIMTVerify();
    fs.writeFileSync(OUTPUT_FILE, code);
    console.log(`✅ Generated: ${OUTPUT_FILE}`);
}

if (require.main === module) {
    main();
}

module.exports = { generateLeanIMTVerify };
