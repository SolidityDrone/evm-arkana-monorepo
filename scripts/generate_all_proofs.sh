#!/bin/bash

# Generate Proofs for All Circuits
# 
# This script orchestrates the generation of proofs for all circuits
# and outputs a JSON file that can be used to test Solidity verifiers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CIRCOM_DIR="$PROJECT_ROOT/circom"
CONTRACTS_DIR="$PROJECT_ROOT/contracts"
TEST_PROOFS_DIR="$CONTRACTS_DIR/test/test-proofs"
OUTPUT_FILE="${1:-$TEST_PROOFS_DIR/proofs_for_solidity.json}"

echo "═══════════════════════════════════════════════════════════════"
echo "      GENERATE PROOFS FOR ALL CIRCUITS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Output file: $OUTPUT_FILE"
echo ""

cd "$CIRCOM_DIR"

# Create test-proofs directory if it doesn't exist
mkdir -p "$TEST_PROOFS_DIR"

# Check if Node.js script exists
GENERATE_SCRIPT="$CIRCOM_DIR/test/scripts/generate_all_proofs.js"
if [ ! -f "$GENERATE_SCRIPT" ]; then
    echo "Error: Generate script not found: $GENERATE_SCRIPT"
    exit 1
fi

# Check if circuits are compiled
echo "Checking if circuits are compiled..."
for circuit in entry deposit withdraw send absorb_send absorb_withdraw; do
    wasm_file="build/$circuit/${circuit}_js/${circuit}.wasm"
    if [ ! -f "$wasm_file" ]; then
        echo "  ⚠️  $circuit not compiled. Compiling..."
        npm run "compile:$circuit" || {
            echo "  ❌ Failed to compile $circuit"
            exit 1
        }
    else
        echo "  ✅ $circuit compiled"
    fi
done

echo ""

# Check if verifiers are built
echo "Checking if verifiers are built..."
for circuit in entry deposit withdraw send absorb_send absorb_withdraw; do
    zkey_file="build/$circuit/${circuit}_final.zkey"
    vkey_file="build/$circuit/${circuit}_vkey.json"
    
    if [ ! -f "$zkey_file" ] || [ ! -f "$vkey_file" ]; then
        echo "  ⚠️  $circuit verifier not built. Building..."
        echo "  Run: ./scripts/build_verifiers.sh"
        echo "  Then select: $circuit"
        exit 1
    else
        echo "  ✅ $circuit verifier built"
    fi
done

echo ""

# Run the Node.js script to generate all proofs
echo "Generating proofs for all circuits..."
echo ""

node "$GENERATE_SCRIPT" "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "✅ Success! All proofs generated and saved to:"
    echo "   $OUTPUT_FILE"
    echo ""
    echo "You can now use this file to test Solidity verifiers."
    echo "═══════════════════════════════════════════════════════════════"
else
    echo ""
    echo "❌ Failed to generate proofs"
    exit 1
fi

