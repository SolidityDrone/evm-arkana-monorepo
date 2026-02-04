#!/bin/bash

# Script to extract Prover.toml output from test runs and save to respective Prover.toml files

# Usage: ./update_prover_toml.sh

set -e

CIRCUITS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../circuits" && pwd)"

cd "$CIRCUITS_DIR"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Updating Prover.toml files from test outputs                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Function to extract Prover.toml content from test output
extract_prover_toml() {
    local test_output="$1"
    local start_marker="$2"
    local output_file="$3"
    
    # Use awk to extract content between marker and next test marker
    # This is more reliable than sed for complex patterns
    echo "$test_output" | awk -v marker="$start_marker" '
        BEGIN { found=0 }
        {
            if (index($0, marker) > 0) {
                found=1
                next
            }
            if (found) {
                # Stop at test markers
                if (/^\[.*\] Testing/ || /^\[.*\] Running/ || /^\[.*\] [0-9]+ test/ || /^\[.*\] Failures:/) {
                    exit
                }
                # Stop at test completion messages
                if (/^=== .* ===$/ || /^\[.*\] .* test passed/ || /^\[.*\] .* test failed/ || /Circuit structure verified/ || /STANDALONE.*TEST COMPLETED/) {
                    exit
                }
                # Stop at another PROVER.TOML or COPY THIS (different test)
                if ((/PROVER.TOML/ || /COPY THIS TO/) && index($0, marker) == 0) {
                    exit
                }
                # Only include lines that look like Prover.toml assignments (contain "=")
                # Skip separator lines (lines with only = or - characters) and other non-assignment lines
                if (/=/) {
                    # Skip lines that are only separators (= or - characters)
                    if (!/^=+$/ && !/^-+$/) {
                        print
                    }
                }
            }
        }
    ' | sed '/^$/d' > "$output_file"
}

# 0. ENTRY
echo "📦 Updating entry/Prover.toml..."
ENTRY_OUTPUT=$(nargo test --package entry test_entry_circuit_with_prover_toml --show-output 2>&1 || true)
ENTRY_MARKER="COPY THIS TO entry/Prover.toml"
extract_prover_toml "$ENTRY_OUTPUT" "$ENTRY_MARKER" "main/entry/Prover.toml"
if [ -s "main/entry/Prover.toml" ]; then
    echo "  ✅ entry/Prover.toml updated"
else
    echo "  ⚠️  Warning: entry/Prover.toml is empty or not found"
fi
echo ""

# 1. ABSORB
echo "📦 Updating absorb/Prover.toml..."
ABSORB_OUTPUT=$(nargo test --package absorb test_absorb_flow_with_prover_toml --show-output 2>&1 || true)
ABSORB_MARKER="COPY THIS TO absorb/Prover.toml"
extract_prover_toml "$ABSORB_OUTPUT" "$ABSORB_MARKER" "main/absorb/Prover.toml"
if [ -s "main/absorb/Prover.toml" ]; then
    echo "  ✅ absorb/Prover.toml updated"
else
    echo "  ⚠️  Warning: absorb/Prover.toml is empty or not found"
fi
echo ""

# 2. SEND
echo "📦 Updating send/Prover.toml..."
SEND_OUTPUT=$(nargo test --package send test_send_with_merkle_tracking --show-output 2>&1 || true)
SEND_MARKER="COPY THIS TO send/Prover.toml"
extract_prover_toml "$SEND_OUTPUT" "$SEND_MARKER" "main/send/Prover.toml"
if [ -s "main/send/Prover.toml" ]; then
    echo "  ✅ send/Prover.toml updated"
else
    echo "  ⚠️  Warning: send/Prover.toml is empty or not found"
fi
echo ""

# 3. DEPOSIT
echo "📦 Updating deposit/Prover.toml..."
DEPOSIT_OUTPUT=$(nargo test --package deposit test_deposit_flow --show-output 2>&1 || true)
DEPOSIT_MARKER="COPY THIS TO deposit/Prover.toml"
extract_prover_toml "$DEPOSIT_OUTPUT" "$DEPOSIT_MARKER" "main/deposit/Prover.toml"
if [ -s "main/deposit/Prover.toml" ]; then
    echo "  ✅ deposit/Prover.toml updated"
else
    echo "  ⚠️  Warning: deposit/Prover.toml is empty or not found"
fi
echo ""

# 4. WITHDRAW
echo "📦 Updating withdraw/Prover.toml..."
WITHDRAW_OUTPUT=$(nargo test --package withdraw test_withdraw_flow --show-output 2>&1 || true)
WITHDRAW_MARKER="COPY THIS TO withdraw/Prover.toml"
extract_prover_toml "$WITHDRAW_OUTPUT" "$WITHDRAW_MARKER" "main/withdraw/Prover.toml"
if [ -s "main/withdraw/Prover.toml" ]; then
    echo "  ✅ withdraw/Prover.toml updated"
else
    echo "  ⚠️  Warning: withdraw/Prover.toml is empty or not found"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ All Prover.toml files updated!                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"

