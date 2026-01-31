#!/bin/bash

# Script to generate Noir test file from merkle_tree_data.json
# Can be run from circuits/lib/ or circuits/lib/lean-imt-verify/

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURRENT_DIR="$(pwd)"

# Determine paths based on current working directory
if [ -d "lean-imt-verify" ]; then
    # Running from circuits/lib/ directory
    JSON_FILE="../../contracts/test/merkle_tree_data.json"
    OUTPUT_FILE="lean-imt-verify/src/test_merkle_data.nr"
    JSON_PATH="../../contracts/test/merkle_tree_data.json"
    OUTPUT_PATH="lean-imt-verify/src/test_merkle_data.nr"
else
    # Running from lean-imt-verify directory or script's directory
    JSON_FILE="../../contracts/test/merkle_tree_data.json"
    OUTPUT_FILE="src/test_merkle_data.nr"
    JSON_PATH="../../contracts/test/merkle_tree_data.json"
    OUTPUT_PATH="src/test_merkle_data.nr"
fi

if [ ! -f "$JSON_FILE" ]; then
    echo "Error: $JSON_FILE not found"
    echo "Current directory: $CURRENT_DIR"
    echo "Looking for: $JSON_FILE"
    exit 1
fi

# Use Python to parse JSON and generate Noir test
python3 << PYTHON_SCRIPT
import json
import sys
import os

# Read JSON file
json_path = "$JSON_PATH"
output_path = "$OUTPUT_PATH"

with open(json_path, 'r') as f:
    data = json.load(f)

tree = data['tree']
leaves = data['leaves']

# Generate Noir test file
output = []
output.append("use dep::std;")
output.append("use crate::lean_imt_verify::verify_merkle_proof;")
output.append("")
output.append("// Test data from contracts/test/merkle_tree_data.json")
output.append(f"// Tree root: {tree['root']}")
output.append(f"// Depth: {tree['depth']}")
output.append(f"// Size: {tree['size']}")
output.append("")
output.append(f"global EXPECTED_ROOT: Field = {tree['root']} as Field;")
output.append(f"global TREE_DEPTH: Field = {tree['depth']};")
output.append("")
output.append("#[test]")
output.append("fn test_all_proofs_from_json() {")
output.append("    std::println(\"==============================================================\");")
output.append("    std::println(\"      Testing All Merkle Proofs from merkle_tree_data.json    \");")
output.append("    std::println(\"==============================================================\");")
output.append("    std::println(\"\");")
output.append("")

# Generate test for each proof
for i, leaf_data in enumerate(leaves):
    index = leaf_data['index']
    leaf = leaf_data['leaf']
    root = leaf_data['root']
    proof = leaf_data['proof']
    
    # Pad proof to 32 elements
    proof_padded = proof + ['0x0'] * (32 - len(proof))
    
    output.append(f"    // Test case {i}: index {index}")
    output.append(f"    let leaf_{i}: Field = {leaf} as Field;")
    output.append(f"    let index_{i}: Field = {index};")
    output.append(f"    let proof_{i}: [Field; 32] = [")
    
    # Format proof array
    proof_lines = []
    for j, p in enumerate(proof_padded):
        if j < len(proof_padded) - 1:
            proof_lines.append(f"        {p} as Field,")
        else:
            proof_lines.append(f"        {p} as Field")
    output.append("\n".join(proof_lines))
    
    output.append("    ];")
    output.append(f"    let expected_root_{i}: Field = {root} as Field;")
    output.append("")
    output.append(f"    std::println(\"Testing proof {i} (index {index})...\");")
    output.append(f"    verify_merkle_proof(leaf_{i}, index_{i}, TREE_DEPTH, expected_root_{i}, proof_{i});")
    output.append(f"    std::println(\"  Proof {i} verified\");")
    output.append("")

output.append("    std::println(\"\");")
output.append("    std::println(\"==============================================================\");")
output.append("    std::println(\"      All Proofs Verified Successfully!                       \");")
output.append("    std::println(\"==============================================================\");")
output.append("}")

# Write to file
with open(output_path, 'w') as f:
    f.write('\n'.join(output))

print(f"Generated {output_path} with {len(leaves)} test cases")
PYTHON_SCRIPT

echo "Test file generated: $OUTPUT_FILE"
echo "JSON file used: $JSON_FILE"



