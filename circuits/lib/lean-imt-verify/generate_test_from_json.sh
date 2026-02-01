#!/bin/bash

# Script to generate Noir test files from both merkle_tree_data.json and merkle_tree_data_real.json
# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Process both JSON files
for JSON_FILE_NAME in "merkle_tree_data.json" "merkle_tree_data_real.json"; do
    JSON_FILE="$SCRIPT_DIR/../../../contracts/test/$JSON_FILE_NAME"
    
    # Determine output file based on input file
    if [ "$JSON_FILE_NAME" = "merkle_tree_data_real.json" ]; then
        OUTPUT_FILE="$SCRIPT_DIR/src/test_merkle_data_real.nr"
    else
        OUTPUT_FILE="$SCRIPT_DIR/src/test_merkle_data.nr"
    fi
    
    if [ ! -f "$JSON_FILE" ]; then
        echo "Warning: $JSON_FILE not found, skipping..."
        continue
    fi
    
    echo "Processing $JSON_FILE_NAME..."
    
    # Use Python to parse JSON and generate Noir test
    OUTPUT_FILE="$OUTPUT_FILE" JSON_FILE="$JSON_FILE" python3 << 'PYTHON_SCRIPT'
import json
import sys
import os

# Get paths from environment
output_file = os.environ.get('OUTPUT_FILE')
json_file = os.environ.get('JSON_FILE')

# Read JSON file
with open(json_file, 'r') as f:
    data = json.load(f)

tree = data['tree']
leaves = data['leaves']

# Generate Noir test file
output = []
output.append("use dep::std;")
output.append("use crate::lean_imt_verify::verify_merkle_proof;")
output.append("")
# Get the JSON file name for the comment
json_file_name = os.path.basename(json_file)
output.append(f"// Test data from contracts/test/{json_file_name}")
output.append(f"// Tree root: {tree['root']}")
output.append(f"// Depth: {tree['depth']}")
output.append(f"// Size: {tree['size']}")
output.append("")
output.append(f"global EXPECTED_ROOT: Field = {tree['root']} as Field;")
output.append("")
output.append("#[test]")
output.append("fn test_all_proofs_from_json() {")
output.append("    std::println(\"==============================================================\");")
output.append(f"    std::println(\"      Testing All Merkle Proofs from {json_file_name}    \");")
output.append("    std::println(\"==============================================================\");")
output.append("    std::println(\"\");")
output.append("")

# Generate test for each proof
for i, leaf_data in enumerate(leaves):
    index = leaf_data['index']
    leaf = leaf_data['leaf']
    root = leaf_data['root']
    proof = leaf_data['proof']
    
    # Calculate the tree size at the time this proof was generated
    # For index i, the tree size at that point is i + 1
    tree_size_at_proof = index + 1
    
    # Calculate the depth at the time this proof was generated
    # With MIN_TREE_DEPTH = 8, the depth is always at least 8
    # But we need to calculate the actual depth needed for the tree size
    # Depth is the minimum depth needed to hold tree_size_at_proof leaves
    # Formula: depth = max(ceil(log2(tree_size_at_proof)), MIN_TREE_DEPTH)
    # Since MIN_TREE_DEPTH = 8, and we're using proof length as indicator:
    # The proof length tells us the depth used during generation
    proof_length = len(proof)
    depth_at_proof = proof_length  # The proof length equals the tree depth at generation time
    
    # Pad proof to 32 elements
    proof_padded = proof + ['0x0'] * (32 - len(proof))
    
    output.append(f"    // Test case {i}: index {index} (tree size at proof: {tree_size_at_proof}, depth: {depth_at_proof})")
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
    # Use the final tree root for verification (proofs are generated from full tree)
    # The individual leaf 'root' is just for reference (root at insertion time)
    output.append(f"    let expected_root_{i}: Field = EXPECTED_ROOT;")
    output.append(f"    let tree_depth_{i}: Field = {depth_at_proof};")
    output.append("")
    output.append(f"    std::println(\"Testing proof {i} (index {index}, depth {depth_at_proof})...\");")
    output.append(f"    verify_merkle_proof(leaf_{i}, index_{i}, tree_depth_{i}, expected_root_{i}, proof_{i});")
    output.append(f"    std::println(\"  Proof {i} verified\");")
    output.append("")

output.append("    std::println(\"\");")
output.append("    std::println(\"==============================================================\");")
output.append("    std::println(\"      All Proofs Verified Successfully!                       \");")
output.append("    std::println(\"==============================================================\");")
output.append("}")

# Write to file
with open(output_file, 'w') as f:
    f.write('\n'.join(output))

print(f"Generated {output_file} with {len(leaves)} test cases")
PYTHON_SCRIPT
    
    echo "Test file generated: $OUTPUT_FILE"
    echo ""
done

echo "All test files generated successfully!"



