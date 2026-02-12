#!/usr/bin/env node

/**
 * Code generation script for Poseidon2Permutation
 * Generates fully unrolled Circom code with all 64 rounds
 */

const fs = require('fs');
const path = require('path');

// Constants from contracts/lib/poseidon2-evm/constants.ts
const internal_matrix_diagonal = [
    "0x10dc6e9c006ea38b04b1e03b4bd9490c0d03f98929ca1d7fb56821fd19d3b6e7",
    "0x0c28145b6a44df3e0149b3d0a30b3bb599df9756d4dd9b84a86b38cfb45a740b",
    "0x00544b8338791518b2c7645a50392798b21f75bb60e3596170067d00141cac15",
    "0x222c01175718386f2e2e82eb122789e352e105a3b8fa852613bc534433ee428b"
];

// Read round constants from the constants file
const constantsPath = path.join(__dirname, '../../../contracts/lib/poseidon2-evm/constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');

// Extract round constants using regex (simple approach)
const roundConstantMatches = constantsContent.match(/round_constant = \[([\s\S]*?)\];/);
if (!roundConstantMatches) {
    console.error('Could not find round_constant in constants.ts');
    process.exit(1);
}

// Parse the round constants (this is a simplified parser)
// For a more robust solution, we'd use a proper TypeScript parser
const roundConstantsText = roundConstantMatches[1];
const roundConstants = [];

// Split by round brackets and parse
const roundMatches = roundConstantsText.match(/\[([^\]]+)\]/g);
if (!roundMatches || roundMatches.length !== 64) {
    console.error('Expected 64 rounds, found:', roundMatches?.length || 0);
    process.exit(1);
}

for (const match of roundMatches) {
    const values = match.match(/0x[0-9a-fA-F]+/g);
    if (!values || values.length !== 4) {
        console.error('Invalid round constant format');
        process.exit(1);
    }
    roundConstants.push(values);
}

// Flatten round constants: [round][element] -> [round * 4 + element]
const flattenedConstants = [];
for (let r = 0; r < 64; r++) {
    for (let i = 0; i < 4; i++) {
        flattenedConstants.push(roundConstants[r][i]);
    }
}

// Generate the permutation code
function generatePermutation() {
    let code = `// Poseidon2 Permutation (fully unrolled)
template Poseidon2Permutation() {
    signal input state[4];
    signal output out[4];

    // Note: Circom doesn't support arrays in var declarations
    // Constants are inlined directly in the code below

    // Working state - use intermediate arrays to chain rounds
    signal round_state[66][4];  // 66 states: initial (0) + first matrix (1) + 64 rounds (2-65)
    
    // Initialize first state
    round_state[0][0] <== state[0];
    round_state[0][1] <== state[1];
    round_state[0][2] <== state[2];
    round_state[0][3] <== state[3];

    // Apply 1st linear layer (matrix multiplication 4x4)
    component matrix_mul = MatrixMultiplication4x4();
    for (var i = 0; i < 4; i++) {
        matrix_mul.in[i] <== round_state[0][i];
    }
    for (var i = 0; i < 4; i++) {
        round_state[1][i] <== matrix_mul.out[i];
    }

    // Declare all components upfront (required by Circom)
    // First 4 external rounds (rounds 0-3)
    component ext_sbox_0 = SBox();
    component ext_matrix_0 = MatrixMultiplication4x4();
    component ext_sbox_1 = SBox();
    component ext_matrix_1 = MatrixMultiplication4x4();
    component ext_sbox_2 = SBox();
    component ext_matrix_2 = MatrixMultiplication4x4();
    component ext_sbox_3 = SBox();
    component ext_matrix_3 = MatrixMultiplication4x4();
    
    // 56 internal rounds (rounds 4-59)
`;

    // Generate component declarations for internal rounds
    for (let r = 0; r < 56; r++) {
        code += `    component int_sbox_${r} = SingleSBox();\n`;
        code += `    component int_matrix_${r} = InternalMatrixMultiplication();\n`;
    }

    code += `    
    // Last 4 external rounds (rounds 60-63)
    component ext_sbox_60 = SBox();
    component ext_matrix_60 = MatrixMultiplication4x4();
    component ext_sbox_61 = SBox();
    component ext_matrix_61 = MatrixMultiplication4x4();
    component ext_sbox_62 = SBox();
    component ext_matrix_62 = MatrixMultiplication4x4();
    component ext_sbox_63 = SBox();
    component ext_matrix_63 = MatrixMultiplication4x4();

    // Declare all intermediate signals upfront
    signal ext_round_after_const[4][4];  // For external rounds 0-3
    signal int_round_after_const[56];     // For internal rounds 4-59
    signal ext_round_after_const_last[4][4];  // For external rounds 60-63

    // First set of external rounds (rf_first = 4, rounds 0-3)
`;

    // Generate first 4 external rounds
    for (let r = 0; r < 4; r++) {
        const stateIdx = 1 + r;
        const nextStateIdx = 2 + r;
        const constBase = r * 4;

        code += `    // Round ${r}\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        ext_round_after_const[${r}][i] <== round_state[${stateIdx}][i] + (i == 0 ? ${roundConstants[r][0]} : (i == 1 ? ${roundConstants[r][1]} : (i == 2 ? ${roundConstants[r][2]} : ${roundConstants[r][3]})));\n`;
        code += `    }\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        ext_sbox_${r}.in[i] <== ext_round_after_const[${r}][i];\n`;
        code += `    }\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        ext_matrix_${r}.in[i] <== ext_sbox_${r}.out[i];\n`;
        code += `    }\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        round_state[${nextStateIdx}][i] <== ext_matrix_${r}.out[i];\n`;
        code += `    }\n\n`;
    }

    // Generate 56 internal rounds
    code += `    // Internal rounds (rounds_p = 56, rounds 4-59)\n`;
    for (let r = 0; r < 56; r++) {
        const roundIdx = 4 + r;
        const stateIdx = 5 + r;
        const nextStateIdx = 6 + r;
        const constBase = roundIdx * 4;

        code += `    // Round ${roundIdx}\n`;
        code += `    int_round_after_const[${r}] <== round_state[${stateIdx}][0] + ${roundConstants[roundIdx][0]};\n`;
        code += `    int_sbox_${r}.in <== int_round_after_const[${r}];\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        int_matrix_${r}.in[i] <== (i == 0 ? int_sbox_${r}.out : round_state[${stateIdx}][i]);\n`;
        code += `        int_matrix_${r}.diagonal[i] <== (i == 0 ? ${internal_matrix_diagonal[0]} : (i == 1 ? ${internal_matrix_diagonal[1]} : (i == 2 ? ${internal_matrix_diagonal[2]} : ${internal_matrix_diagonal[3]})));\n`;
        code += `    }\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        round_state[${nextStateIdx}][i] <== int_matrix_${r}.out[i];\n`;
        code += `    }\n\n`;
    }

    // Generate last 4 external rounds
    code += `    // Remaining external rounds (rounds 60-63)\n`;
    // Note: Last internal round (59) outputs to state[61], so round 60 starts from state[61]
    for (let r = 0; r < 4; r++) {
        const roundIdx = 60 + r;
        const stateIdx = 61 + r;  // Start from state[61] (output of round 59)
        const nextStateIdx = 62 + r;
        const constBase = roundIdx * 4;

        code += `    // Round ${roundIdx}\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        ext_round_after_const_last[${r}][i] <== round_state[${stateIdx}][i] + (i == 0 ? ${roundConstants[roundIdx][0]} : (i == 1 ? ${roundConstants[roundIdx][1]} : (i == 2 ? ${roundConstants[roundIdx][2]} : ${roundConstants[roundIdx][3]})));\n`;
        code += `    }\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        ext_sbox_${roundIdx}.in[i] <== ext_round_after_const_last[${r}][i];\n`;
        code += `    }\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        ext_matrix_${roundIdx}.in[i] <== ext_sbox_${roundIdx}.out[i];\n`;
        code += `    }\n`;
        code += `    for (var i = 0; i < 4; i++) {\n`;
        code += `        round_state[${nextStateIdx}][i] <== ext_matrix_${roundIdx}.out[i];\n`;
        code += `    }\n\n`;
    }

    code += `    // Output (final state)
    for (var i = 0; i < 4; i++) {
        out[i] <== round_state[65][i];
    }
}
`;

    return code;
}

// Generate the full file
function generateFullFile() {
    const header = `pragma circom 2.0.0;

// Poseidon2 hash function implementation matching Noir's poseidon2.nr
// Sponge construction with rate=3, capacity=1 (state size=4)
// This file is auto-generated by generate_poseidon2.js

// Single S-box: x^5 = x^2 * x^2 * x
template SingleSBox() {
    signal input in;
    signal output out;
    
    signal t1;
    signal t2;
    
    t1 <== in * in;      // x^2
    t2 <== t1 * t1;      // x^4
    out <== t2 * in;     // x^5
}

// Full S-box (applied to all 4 elements)
template SBox() {
    signal input in[4];
    signal output out[4];
    
    component sbox[4];
    for (var i = 0; i < 4; i++) {
        sbox[i] = SingleSBox();
        sbox[i].in <== in[i];
        out[i] <== sbox[i].out;
    }
}

// Matrix multiplication 4x4 (optimized)
// Matrix: [[5,7,1,3], [4,6,1,1], [1,3,5,7], [1,1,4,6]]
template MatrixMultiplication4x4() {
    signal input in[4];
    signal output out[4];
    
    signal t0;
    signal t1;
    signal t2;
    signal t2_plus_t1;
    signal t3;
    signal t3_plus_t0;
    signal t4_temp1;
    signal t4_temp2;
    signal t4;
    signal t5_temp1;
    signal t5_temp2;
    signal t5;
    signal t6;
    signal t7;
    
    t0 <== in[0] + in[1];        // A + B
    t1 <== in[2] + in[3];         // C + D
    t2 <== in[1] + in[1];         // 2B
    t2_plus_t1 <== t2 + t1;      // 2B + C + D
    t3 <== in[3] + in[3];         // 2D
    t3_plus_t0 <== t3 + t0;      // 2D + A + B
    t4_temp1 <== t1 + t1;        // 2(C + D)
    t4_temp2 <== t4_temp1 + t4_temp1;  // 4(C + D)
    t4 <== t4_temp2 + t3_plus_t0;      // A + B + 4C + 6D
    t5_temp1 <== t0 + t0;        // 2(A + B)
    t5_temp2 <== t5_temp1 + t5_temp1;  // 4(A + B)
    t5 <== t5_temp2 + t2_plus_t1;      // 4A + 6B + C + D
    t6 <== t3_plus_t0 + t5;      // 5A + 7B + C + 3D
    t7 <== t2_plus_t1 + t4;      // A + 3B + 5C + 7D
    
    out[0] <== t6;
    out[1] <== t5;
    out[2] <== t7;
    out[3] <== t4;
}

// Internal matrix multiplication (diagonal matrix)
template InternalMatrixMultiplication() {
    signal input in[4];
    signal input diagonal[4];
    signal output out[4];
    
    signal sum;
    sum <== in[0] + in[1] + in[2] + in[3];
    
    for (var i = 0; i < 4; i++) {
        out[i] <== in[i] * diagonal[i] + sum;
    }
}

`;

    const permutation = generatePermutation();

    const hashTemplates = `
// Poseidon2 hash for 1 input (most common case)
template Poseidon2Hash1() {
    signal input in;
    signal output out;
    
    var RATE = 3;
    var two_pow_64 = 18446744073709551616;
    
    // IV = 1 * 2^64
    signal iv;
    iv <== 1 * two_pow_64;
    
    // Initialize state: [in, 0, 0, iv]
    signal state[4];
    state[0] <== in;
    state[1] <== 0;
    state[2] <== 0;
    state[3] <== iv;
    
    // Permutation
    component perm = Poseidon2Permutation();
    for (var i = 0; i < 4; i++) {
        perm.state[i] <== state[i];
    }
    
    // Output first element
    out <== perm.out[0];
}

// Poseidon2 hash for 2 inputs
template Poseidon2Hash2() {
    signal input in[2];
    signal output out;
    
    var RATE = 3;
    var two_pow_64 = 18446744073709551616;
    
    // IV = 2 * 2^64
    signal iv;
    iv <== 2 * two_pow_64;
    
    // Initialize state: [in[0], in[1], 0, iv]
    signal state[4];
    state[0] <== in[0];
    state[1] <== in[1];
    state[2] <== 0;
    state[3] <== iv;
    
    // Permutation
    component perm = Poseidon2Permutation();
    for (var i = 0; i < 4; i++) {
        perm.state[i] <== state[i];
    }
    
    // Output first element
    out <== perm.out[0];
}

// Poseidon2 hash for 3 inputs
template Poseidon2Hash3() {
    signal input in[3];
    signal output out;
    
    var RATE = 3;
    var two_pow_64 = 18446744073709551616;
    
    // IV = 3 * 2^64
    signal iv;
    iv <== 3 * two_pow_64;
    
    // Initialize state: [in[0], in[1], in[2], iv]
    signal state[4];
    state[0] <== in[0];
    state[1] <== in[1];
    state[2] <== in[2];
    state[3] <== iv;
    
    // Permutation
    component perm = Poseidon2Permutation();
    for (var i = 0; i < 4; i++) {
        perm.state[i] <== state[i];
    }
    
    // Output first element
    out <== perm.out[0];
}
`;

    return header + permutation + hashTemplates;
}

// Main execution
try {
    const output = generateFullFile();
    const outputPath = path.join(__dirname, 'poseidon2.circom');
    fs.writeFileSync(outputPath, output);
    console.log('✅ Generated poseidon2.circom successfully!');
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${output.length} bytes`);
} catch (error) {
    console.error('❌ Error generating file:', error);
    process.exit(1);
}

