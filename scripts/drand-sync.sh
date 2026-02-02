#!/bin/bash
# =============================================================================
# drand-sync.sh - Sync drand timelock encryption values across the stack
# =============================================================================
# This script:
# 1. Runs timelock-prep.js to generate fresh encryption values
# 2. Updates drand.nr (Noir circuit test) with the new values
# 3. Runs the Noir test to verify
# 4. Updates DrandTest.sol (Solidity test) with the values
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TS_UTILS_DIR="$ROOT_DIR/ts-utils"
CIRCUITS_DIR="$ROOT_DIR/circuits/main/withdraw"
NOIR_TEST_FILE="$CIRCUITS_DIR/src/test/drand.nr"
NOIR_TESTS_FILE="$CIRCUITS_DIR/src/test/tests.nr"
SOLIDITY_TEST_FILE="$ROOT_DIR/contracts/test/DrandTest.sol"
ARKANA_TEST_FILE="$ROOT_DIR/contracts/test/Arkana.t.sol"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           drand Timelock Encryption Sync Script             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# =============================================================================
# Step 1: Run TypeScript timelock-prep.js
# =============================================================================
echo -e "${BLUE}[1/7] Running timelock-prep.js...${NC}"

cd "$TS_UTILS_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    yarn install
fi

# Run the script and capture output
TS_OUTPUT=$(node timelock-prep.js 2>&1)

echo -e "${GREEN}✓ TypeScript script executed${NC}"
echo ""

# =============================================================================
# Step 2: Parse TypeScript output
# =============================================================================
echo -e "${BLUE}[2/7] Parsing TypeScript output...${NC}"

# Extract values using grep and awk
PLAINTEXT=$(echo "$TS_OUTPUT" | grep "^plaintext:" | awk '{print $2}')
TARGET_ROUND=$(echo "$TS_OUTPUT" | grep "^target_round:" | awk '{print $2}')
H_X=$(echo "$TS_OUTPUT" | grep "^H_x:" | awk '{print $2}')
H_Y=$(echo "$TS_OUTPUT" | grep "^H_y:" | awk '{print $2}')
V_X=$(echo "$TS_OUTPUT" | grep "^V_x:" | awk '{print $2}')
V_Y=$(echo "$TS_OUTPUT" | grep "^V_y:" | awk '{print $2}')
PAIRING_RESULT=$(echo "$TS_OUTPUT" | grep "^pairing_result:" | awk '{print $2}')
CIPHERTEXT=$(echo "$TS_OUTPUT" | grep "^ciphertext:" | awk '{print $2}')

# Extract C1 G2 coordinates (from "C1 (G2 point for pairing check):" section)
C1_X0=$(echo "$TS_OUTPUT" | grep -A1 "C1 (G2 point" | grep "x0:" | awk '{print $2}')
C1_X1=$(echo "$TS_OUTPUT" | grep -A2 "C1 (G2 point" | grep "x1:" | awk '{print $2}')
C1_Y0=$(echo "$TS_OUTPUT" | grep -A3 "C1 (G2 point" | grep "y0:" | awk '{print $2}')
C1_Y1=$(echo "$TS_OUTPUT" | grep -A4 "C1 (G2 point" | grep "y1:" | awk '{print $2}')

# Extract drand pubkey G2 coordinates (multi-line)
DRAND_X0=$(echo "$TS_OUTPUT" | grep -A1 "drand_pubkey (G2):" | grep "x0:" | awk '{print $2}')
DRAND_X1=$(echo "$TS_OUTPUT" | grep -A2 "drand_pubkey (G2):" | grep "x1:" | awk '{print $2}')
DRAND_Y0=$(echo "$TS_OUTPUT" | grep -A3 "drand_pubkey (G2):" | grep "y0:" | awk '{print $2}')
DRAND_Y1=$(echo "$TS_OUTPUT" | grep -A4 "drand_pubkey (G2):" | grep "y1:" | awk '{print $2}')

# Extract K from computed values
K_VALUE=$(echo "$TS_OUTPUT" | grep "^K:" | awk '{print $2}')

echo "  Plaintext: $PLAINTEXT"
echo "  Target Round: $TARGET_ROUND"
echo "  H_x: $H_X"
echo "  H_y: $H_Y"
echo "  V_x: $V_X"
echo "  V_y: $V_Y"
echo "  C1_x0: $C1_X0"
echo "  C1_x1: $C1_X1"
echo "  C1_y0: $C1_Y0"
echo "  C1_y1: $C1_Y1"
echo "  Pairing Result: $PAIRING_RESULT"
echo "  Ciphertext: $CIPHERTEXT"
echo "  K: $K_VALUE"
echo -e "${GREEN}✓ Values parsed${NC}"
echo ""

# =============================================================================
# Step 3: Update Noir test file
# =============================================================================
echo -e "${BLUE}[3/7] Updating Noir test file...${NC}"

# Create the updated Noir test content
cat > "$NOIR_TEST_FILE" << 'NOIR_HEADER'
use dep::poseidon::poseidon2::Poseidon2;
use dep::std;

// === DRAND TIMELOCK ENCRYPTION TEST ===
// [AUTO-GENERATED] by scripts/drand-sync.sh - DO NOT EDIT MANUALLY
//
// IMPORTANT: Noir's embedded curve is Grumpkin, NOT BN254.
// Therefore, we CANNOT do V = r * H in-circuit for BN254 points.
// V is computed offchain and passed as a public input.
//
// Circuit verifies:
//   1. ciphertext = plaintext + K where K = KDF(pairing_result)
//      Note: pairing_result is a private input (witness) in the circuit
//
// Contract verifies:
//   1. e(V, G2_gen) * e(-H, C1) == 1 (proves V = r*H, C1 = r*G2)
//   2. drand_pubkey matches hardcoded evmnet value
//
// Security: If someone provides a fake V, the pairing check will fail on-chain.

// Helper: KDF - derives encryption key from pairing result
// Uses Poseidon2 hash for ZK-friendly key derivation
fn kdf(pairing_result: Field) -> Field {
    Poseidon2::hash([pairing_result], 1)
}

// Main timelock encryption verification (circuit logic)
// V is computed offchain (V = r * H on BN254), passed as public input
fn timelock_verify_encryption(
    plaintext: Field,           // Private: message to encrypt
    pairing_result: Field,      // Public: hash(e(V, drand_pubkey))
    expected_ciphertext: Field, // Public: ciphertext from offchain
) -> (Field, Field) {
    // 1. Derive K from pairing result using Poseidon2 (same as TypeScript)
    let K = kdf(pairing_result);
    
    // 2. Compute ciphertext = plaintext + K
    let computed_ciphertext = plaintext + K;
    
    // 3. Verify computed matches expected (both use Poseidon2 now)
    assert(computed_ciphertext == expected_ciphertext, "Ciphertext mismatch");
    
    // Return K and computed_ciphertext for logging
    (K, computed_ciphertext)
}

#[test]
fn test_drand_timelock_encryption() {
    std::println("╔══════════════════════════════════════════════════════════════╗");
    std::println("║      TEST: Drand Timelock Encryption (Real Values)          ║");
    std::println("╚══════════════════════════════════════════════════════════════╝");
    std::println("");
    
    // === INPUTS (from TypeScript timelock-prep.js output with Poseidon2) ===
    // [AUTO-GENERATED VALUES] - DO NOT EDIT MANUALLY
NOIR_HEADER

# Append the dynamic values
cat >> "$NOIR_TEST_FILE" << NOIR_VALUES
    // Private inputs (witness)
    let plaintext = $PLAINTEXT as Field;
    let pairing_result = $PAIRING_RESULT as Field;  // Private: hash(e(V, drand_pubkey))
    
    // Public inputs (from offchain computation)
    let target_round = $TARGET_ROUND as Field;
    let expected_ciphertext = $CIPHERTEXT as Field;
    
    // H = hash_to_curve(round) on G1 - needed for on-chain pairing verification
    let H_x = $H_X as Field;
    let H_y = $H_Y as Field;
    
    // V = r * H on G1 - computed offchain, passed as public input
    let expected_V_x = $V_X as Field;
    let expected_V_y = $V_Y as Field;
    
    // C1 = r * G2_gen on G2 - needed for on-chain pairing verification
    // Format: Fp2 coordinates (c0=real, c1=imaginary)
    let C1_x0 = $C1_X0 as Field;
    let C1_x1 = $C1_X1 as Field;
    let C1_y0 = $C1_Y0 as Field;
    let C1_y1 = $C1_Y1 as Field;
    
    // Drand public key (evmnet) - G2 point (hardcoded in contract, NOT in circuit)
    let drand_pubkey_x0 = $DRAND_X0 as Field;
    let drand_pubkey_x1 = $DRAND_X1 as Field;
    let drand_pubkey_y0 = $DRAND_Y0 as Field;
    let drand_pubkey_y1 = $DRAND_Y1 as Field;
NOIR_VALUES

# Append the rest of the test
cat >> "$NOIR_TEST_FILE" << 'NOIR_FOOTER'
    
    // Evmnet drand constants (for logging)
    let genesis_time = 1727521075 as Field;
    let period = 3 as Field;
    
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("INPUTS (from TypeScript timelock-prep.js)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Evmnet Drand Configuration:");
    std::print("  Beacon ID: evmnet");
    std::println("");
    std::print("  Scheme: bls-bn254-unchained-on-g1");
    std::println("");
    std::print("  Genesis Time: ");
    std::println(genesis_time);
    std::print("  Period: ");
    std::println(period);
    std::print("  seconds");
    std::println("");
    std::println("");
    std::print("Plaintext (message, private): ");
    std::println(plaintext);
    std::print("Target Round (public): ");
    std::println(target_round);
    std::println("");
    std::println("Drand Public Key (evmnet, BN254 G2) - hardcoded in contract:");
    std::print("  x0: ");
    std::println(drand_pubkey_x0);
    std::print("  x1: ");
    std::println(drand_pubkey_x1);
    std::print("  y0: ");
    std::println(drand_pubkey_y0);
    std::print("  y1: ");
    std::println(drand_pubkey_y1);
    std::println("");
    std::print("Pairing Result (hash(e(V, drandPubkey))) - computed offchain: ");
    std::println(pairing_result);
    std::println("");
    
    // === PROCESSING ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("PROCESSING (Circuit Verification)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("NOTE: V = r * H is computed OFFCHAIN (BN254, not in-circuit)");
    std::println("V is passed as public input to the circuit.");
    std::println("");
    
    // V is computed offchain, we just use the expected value
    std::println("V (computed offchain, passed as public input):");
    std::print("  V_x: ");
    std::println(expected_V_x);
    std::print("  V_y: ");
    std::println(expected_V_y);
    std::println("");
    
    // Circuit verifies: ciphertext = plaintext + K where K = KDF(pairing_result)
    let (K, computed_ciphertext) = timelock_verify_encryption(
        plaintext,
        pairing_result,
        expected_ciphertext
    );
    
    std::println("Circuit verification:");
    std::print("  K = KDF(pairing_result) [Poseidon2]: ");
    std::println(K);
    std::print("  Computed ciphertext = plaintext + K: ");
    std::println(computed_ciphertext);
    std::print("  Expected ciphertext (from TypeScript with Poseidon2): ");
    std::println(expected_ciphertext);
    assert(computed_ciphertext == expected_ciphertext, "Ciphertext should match TypeScript output");
    std::println("  ✅ ciphertext matches TypeScript output!");
    std::println("  ✅ Contract will verify pairing ensures correct K derivation");
    std::println("");
    
    // === OUTPUTS ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("OUTPUTS (Public Inputs for Circuit + On-chain Verification)");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Public inputs for circuit and on-chain pairing verification:");
    std::println("");
    std::print("target_round (pub): ");
    std::println(target_round);
    std::println("");
    std::println("H (pub) - G1 point - hash_to_curve(round):");
    std::print("  H_x (pub): ");
    std::println(H_x);
    std::print("  H_y (pub): ");
    std::println(H_y);
    std::println("");
    std::println("V (pub) - G1 point - r * H:");
    std::print("  V_x (pub): ");
    std::println(expected_V_x);
    std::print("  V_y (pub): ");
    std::println(expected_V_y);
    std::println("");
    std::println("C1 (pub) - G2 point - r * G2_gen (for on-chain pairing check):");
    std::print("  C1_x0 (pub): ");
    std::println(C1_x0);
    std::print("  C1_x1 (pub): ");
    std::println(C1_x1);
    std::print("  C1_y0 (pub): ");
    std::println(C1_y0);
    std::print("  C1_y1 (pub): ");
    std::println(C1_y1);
    std::println("");
    std::print("ciphertext (pub): ");
    std::println(computed_ciphertext);
    std::println("");
    std::println("drand_pubkey (G2) - hardcoded in contract:");
    std::print("  x0: ");
    std::println(drand_pubkey_x0);
    std::print("  x1: ");
    std::println(drand_pubkey_x1);
    std::print("  y0: ");
    std::println(drand_pubkey_y0);
    std::print("  y1: ");
    std::println(drand_pubkey_y1);
    std::println("");
    
    // === VERIFICATION ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("VERIFICATION");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    
    std::println("Circuit verification passed:");
    std::println("   ciphertext = plaintext + K (where K = KDF(pairing_result))");
    std::println("");
    
    std::println("Contract verifies BEFORE round (zero-trust on pubkey):");
    std::println("   e(V, G2_gen) * e(-H, C1) == 1");
    std::println("   This proves: V = r*H AND C1 = r*G2 for same r");
    std::println("   Using BN254 pairing precompile 0x08");
    std::println("");
    std::println("Contract verifies AFTER round (with drand signature):");
    std::println("   e(sigma, C1) * e(-V, drand_pubkey) == 1");
    std::println("   This proves: encryption used correct drand_pubkey");
    std::println("");
    std::println("Security guarantee:");
    std::println("   - Contract verifies V, C1 use same r (before round)");
    std::println("   - Contract verifies encryption with drand_pubkey (after round)");
    std::println("   - Circuit ensures: ciphertext = plaintext + K");
    std::println("   - Therefore: plaintext <-> ciphertext is GUARANTEED correct");
    std::println("");
    
    // Verify we can decrypt (simulate decryption)
    let decrypted = computed_ciphertext - K;
    assert(decrypted == plaintext, "Decryption should recover plaintext");
    std::println("✅ Decryption test passed (ciphertext - K == plaintext)");
    std::println("");
    
    // === SUMMARY ===
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("SUMMARY");
    std::println("═══════════════════════════════════════════════════════════════");
    std::println("");
    std::println("Evmnet Drand Info:");
    std::println("  - Beacon ID: evmnet");
    std::println("  - Scheme: bls-bn254-unchained-on-g1");
    std::println("  - Period: 3 seconds");
    std::println("  - Genesis Time: 1727521075");
    std::println("  - Public Key: G2 point (signatures on G1)");
    std::println("");
    std::println("OFFCHAIN Flow:");
    std::println("  1. H = hash_to_curve(round) on BN254 G1");
    std::println("  2. V = r * H on BN254 G1");
    std::println("  3. C1 = r * G2_gen on BN254 G2");
    std::println("  4. pairing = e(V, drand_pubkey) on BN254");
    std::println("  5. pairing_result = hash(pairing)");
    std::println("  6. K = KDF(pairing_result)");
    std::println("  7. ciphertext = plaintext + K");
    std::println("");
    std::println("Circuit verifies (in-circuit):");
    std::println("   ciphertext = plaintext + K");
    std::println("   where K = KDF(pairing_result)");
    std::println("");
    std::println("Contract verifies (on-chain) BEFORE round:");
    std::println("   e(V, G2_gen) * e(-H, C1) == 1");
    std::println("   This proves V = r*H, C1 = r*G2 (same r)");
    std::println("");
    std::println("Contract verifies (on-chain) AFTER round:");
    std::println("   e(sigma, C1) * e(-V, drand_pubkey) == 1");
    std::println("   This proves encryption used correct pubkey");
    std::println("");
    std::println("Security (ZERO TRUST on pubkey):");
    std::println("  - Before round: Contract verifies H, V, C1 consistency");
    std::println("  - After round: Contract verifies drand_pubkey correctness");
    std::println("  - Circuit ensures: ciphertext = plaintext + K");
    std::println("  - Therefore: plaintext <-> ciphertext is GUARANTEED");
    std::println("");
    std::println("Public Inputs:");
    std::println("  - target_round: Field");
    std::println("  - H_x, H_y: Field (G1 point)");
    std::println("  - V_x, V_y: Field (G1 point)");
    std::println("  - C1_x0, C1_x1, C1_y0, C1_y1: Field (G2 point)");
    std::println("  - ciphertext: Field (public output)");
    std::println("");
    std::println("Private Inputs:");
    std::println("  - plaintext: Field");
    std::println("  - pairing_result: Field (hash(e(V, drand_pubkey)))");
    std::println("");
    std::println("All tests passed!");
}
NOIR_FOOTER

echo -e "${GREEN}✓ Noir test file updated${NC}"
echo ""

# =============================================================================
# Step 4: Run Noir test
# =============================================================================
echo -e "${BLUE}[4/7] Running Noir test...${NC}"

cd "$CIRCUITS_DIR"
NOIR_OUTPUT=$(nargo test --show-output 2>&1) || true

# Check if tests passed (look for "N test(s) passed" pattern)
if echo "$NOIR_OUTPUT" | grep -qE "[0-9]+ tests? passed"; then
    TESTS_PASSED=$(echo "$NOIR_OUTPUT" | grep -oE "[0-9]+ tests? passed")
    echo -e "${GREEN}✓ Noir tests passed ($TESTS_PASSED)${NC}"
else
    echo -e "${RED}✗ Noir test failed${NC}"
    echo "$NOIR_OUTPUT"
    exit 1
fi
echo ""

# =============================================================================
# Step 5: Update Noir tests.nr with real timelock values
# =============================================================================
echo -e "${BLUE}[5/7] Updating Noir tests.nr with real timelock values...${NC}"

# Update the test helper functions with real values
# Note: Using regex pattern to match existing values (not just 0)
sed -i "s/fn test_timelock_target_round() -> Field { [0-9]* as Field }/fn test_timelock_target_round() -> Field { $TARGET_ROUND as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_H_x() -> Field { [0-9]* as Field }/fn test_timelock_H_x() -> Field { $H_X as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_H_y() -> Field { [0-9]* as Field }/fn test_timelock_H_y() -> Field { $H_Y as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_V_x() -> Field { [0-9]* as Field }/fn test_timelock_V_x() -> Field { $V_X as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_V_y() -> Field { [0-9]* as Field }/fn test_timelock_V_y() -> Field { $V_Y as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_C1_x0() -> Field { [0-9]* as Field }/fn test_timelock_C1_x0() -> Field { $C1_X0 as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_C1_x1() -> Field { [0-9]* as Field }/fn test_timelock_C1_x1() -> Field { $C1_X1 as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_C1_y0() -> Field { [0-9]* as Field }/fn test_timelock_C1_y0() -> Field { $C1_Y0 as Field }/" "$NOIR_TESTS_FILE"
sed -i "s/fn test_timelock_C1_y1() -> Field { [0-9]* as Field }/fn test_timelock_C1_y1() -> Field { $C1_Y1 as Field }/" "$NOIR_TESTS_FILE"
# Note: pairing_result is now a private input, but still needed as a parameter in main() calls
sed -i "s/fn test_timelock_pairing_result() -> Field { [0-9]* as Field }/fn test_timelock_pairing_result() -> Field { $PAIRING_RESULT as Field }/" "$NOIR_TESTS_FILE"

echo -e "${GREEN}✓ Noir tests.nr updated with real timelock values${NC}"
echo ""

# =============================================================================
# Step 6: Update Solidity test file
# =============================================================================
echo -e "${BLUE}[6/7] Updating Solidity test file...${NC}"

# Convert decimal values to hex for Solidity (using node for big numbers)
H_X_HEX=$(node -e "console.log('0x' + BigInt('$H_X').toString(16))")
H_Y_HEX=$(node -e "console.log('0x' + BigInt('$H_Y').toString(16))")
V_X_HEX=$(node -e "console.log('0x' + BigInt('$V_X').toString(16))")
V_Y_HEX=$(node -e "console.log('0x' + BigInt('$V_Y').toString(16))")
C1_X0_HEX=$(node -e "console.log('0x' + BigInt('$C1_X0').toString(16))")
C1_X1_HEX=$(node -e "console.log('0x' + BigInt('$C1_X1').toString(16))")
C1_Y0_HEX=$(node -e "console.log('0x' + BigInt('$C1_Y0').toString(16))")
C1_Y1_HEX=$(node -e "console.log('0x' + BigInt('$C1_Y1').toString(16))")
PAIRING_HEX=$(node -e "console.log('0x' + BigInt('$PAIRING_RESULT').toString(16))")
CIPHERTEXT_HEX=$(node -e "console.log('0x' + BigInt('$CIPHERTEXT').toString(16))")
TARGET_ROUND_HEX=$(node -e "console.log('0x' + BigInt('$TARGET_ROUND').toString(16))")

cat > "$SOLIDITY_TEST_FILE" << SOLIDITY_CONTENT
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";

/**
 * @title DrandTest
 * @notice Test to verify drand timelock encryption with on-chain pairing verification
 * @dev AUTO-GENERATED by scripts/drand-sync.sh - DO NOT EDIT MANUALLY
 *
 * ZERO TRUST verification:
 * BEFORE round: e(V, G2_gen) * e(-H, C1) == 1 (proves V = r*H, C1 = r*G2)
 * AFTER round:  e(sigma, C1) * e(-V, drand_pubkey) == 1 (proves correct pubkey)
 */
contract DrandTest is Test {
    // BN254 field modulus
    uint256 public constant BN254_FIELD_MODULUS = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;
    
    // BN254 pairing precompile address
    address public constant BN254_PAIRING_PRECOMPILE = address(0x08);
    
    // BN254 G2 generator (standard values)
    // Format: x = x_c0 + x_c1*i, y = y_c0 + y_c1*i
    // Precompile expects: (x_c1, x_c0, y_c1, y_c0)
    uint256 public constant G2_X_C1 = 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2; // imaginary
    uint256 public constant G2_X_C0 = 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed; // real
    uint256 public constant G2_Y_C1 = 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b; // imaginary
    uint256 public constant G2_Y_C0 = 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa; // real
    
    // Evmnet drand public key (BN254 G2)
    // From drand JSON pubkey hex, format is: (x_c1, x_c0, y_c1, y_c0)
    // Precompile expects same order: (x_c1, x_c0, y_c1, y_c0)
    uint256 public constant EVMNET_PK_X_C1 = 0x07e1d1d335df83fa98462005690372c643340060d205306a9aa8106b6bd0b382; // imaginary
    uint256 public constant EVMNET_PK_X_C0 = 0x0557ec32c2ad488e4d4f6008f89a346f18492092ccc0d594610de2732c8b808f; // real
    uint256 public constant EVMNET_PK_Y_C1 = 0x0095685ae3a85ba243747b1b2f426049010f6b73a0cf1d389351d5aaaa1047f6; // imaginary
    uint256 public constant EVMNET_PK_Y_C0 = 0x297d3a4f9749b33eb2d904c9d9ebf17224150ddd7abd7567a9bec6c74480ee0b; // real

    struct TimelockProof {
        uint256 targetRound;
        uint256 H_x;       // G1 point: hash_to_curve(round)
        uint256 H_y;
        uint256 V_x;       // G1 point: r * H
        uint256 V_y;
        uint256 C1_x0;     // G2 point: r * G2_gen (real part)
        uint256 C1_x1;     // (imaginary part)
        uint256 C1_y0;     // (real part)
        uint256 C1_y1;     // (imaginary part)
        uint256 pairingResult;
        uint256 ciphertext;
    }

    /**
     * @notice Verify BEFORE round: e(V, G2_gen) * e(-H, C1) == 1
     * @dev This proves V = r*H and C1 = r*G2 for the same r
     */
    function verifyPairingBeforeRound(TimelockProof memory proof) public view returns (bool) {
        // Negate H (negate y coordinate in Fp)
        uint256 neg_H_y = BN254_FIELD_MODULUS - (proof.H_y % BN254_FIELD_MODULUS);
        
        // Build pairing input: e(V, G2_gen) * e(-H, C1)
        // Format per EIP-197: (G1_x, G1_y, G2_x_c1, G2_x_c0, G2_y_c1, G2_y_c0)
        bytes memory input = abi.encodePacked(
            // Pair 1: (V, G2_gen)
            proof.V_x,
            proof.V_y,
            G2_X_C1, G2_X_C0,  // x_c1 (imag), x_c0 (real)
            G2_Y_C1, G2_Y_C0,  // y_c1 (imag), y_c0 (real)
            // Pair 2: (-H, C1)
            proof.H_x,
            neg_H_y,
            proof.C1_x1, proof.C1_x0,  // C1_x1 is c1 (imag), C1_x0 is c0 (real)
            proof.C1_y1, proof.C1_y0   // C1_y1 is c1 (imag), C1_y0 is c0 (real)
        );
        
        (bool success, bytes memory result) = BN254_PAIRING_PRECOMPILE.staticcall(input);
        
        if (!success || result.length != 32) {
            return false;
        }
        
        return abi.decode(result, (uint256)) == 1;
    }
    
    /**
     * @notice Verify AFTER round: e(sigma, C1) * e(-V, drand_pubkey) == 1
     * @dev This proves the encryption used the correct drand pubkey
     */
    function verifyPairingAfterRound(
        TimelockProof memory proof,
        uint256 sigma_x,
        uint256 sigma_y
    ) public view returns (bool) {
        // Negate V (negate y coordinate in Fp)
        uint256 neg_V_y = BN254_FIELD_MODULUS - (proof.V_y % BN254_FIELD_MODULUS);
        
        // Build pairing input: e(sigma, C1) * e(-V, drand_pubkey)
        // Format per EIP-197: (G1_x, G1_y, G2_x_c1, G2_x_c0, G2_y_c1, G2_y_c0)
        bytes memory input = abi.encodePacked(
            // Pair 1: (sigma, C1)
            sigma_x,
            sigma_y,
            proof.C1_x1, proof.C1_x0,  // C1_x1 is c1 (imag), C1_x0 is c0 (real)
            proof.C1_y1, proof.C1_y0,  // C1_y1 is c1 (imag), C1_y0 is c0 (real)
            // Pair 2: (-V, drand_pubkey)
            proof.V_x,
            neg_V_y,
            EVMNET_PK_X_C1, EVMNET_PK_X_C0,  // x_c1 (imag), x_c0 (real)
            EVMNET_PK_Y_C1, EVMNET_PK_Y_C0   // y_c1 (imag), y_c0 (real)
        );
        
        (bool success, bytes memory result) = BN254_PAIRING_PRECOMPILE.staticcall(input);
        
        if (!success || result.length != 32) {
            return false;
        }
        
        return abi.decode(result, (uint256)) == 1;
    }

    /**
     * @notice Test BEFORE round pairing verification
     * @dev Uses values from TypeScript timelock-prep.js via drand-sync.sh
     */
    function test_VerifyPairingBeforeRound() public {
        // AUTO-GENERATED VALUES - DO NOT EDIT MANUALLY
        TimelockProof memory proof = TimelockProof({
            targetRound: $TARGET_ROUND_HEX,
            H_x: $H_X_HEX,
            H_y: $H_Y_HEX,
            V_x: $V_X_HEX,
            V_y: $V_Y_HEX,
            C1_x0: $C1_X0_HEX,
            C1_x1: $C1_X1_HEX,
            C1_y0: $C1_Y0_HEX,
            C1_y1: $C1_Y1_HEX,
            pairingResult: $PAIRING_HEX,
            ciphertext: $CIPHERTEXT_HEX
        });
        
        // Verify before round: proves V = r*H and C1 = r*G2
        bool valid = verifyPairingBeforeRound(proof);
        assertTrue(valid, "BEFORE round pairing check failed: e(V, G2_gen) * e(-H, C1) != 1");
        
        console.log("BEFORE round verification PASSED!");
        console.log("Proven: V = r*H and C1 = r*G2 for same r");
    }
}
SOLIDITY_CONTENT

echo -e "${GREEN}✓ Solidity test file updated${NC}"
echo ""

# =============================================================================
# Step 7: Update decrypt script with hardcoded values
# =============================================================================
echo -e "${BLUE}[7/7] Updating decrypt script...${NC}"

DECRYPT_FILE="$TS_UTILS_DIR/timelock-decrypt.js"

# Read the decrypt file template parts and inject values
cat > "$DECRYPT_FILE" << 'DECRYPT_HEADER'
/**
 * timelock-decrypt.js
 * [AUTO-GENERATED] by scripts/drand-sync.sh - DO NOT EDIT MANUALLY
 * 
 * Decrypts a timelock-encrypted message using drand signature
 * 
 * Flow:
 * 1. Fetch drand signature for the target round
 * 2. Compute C1 = r * G2_gen (using saved randomness)
 * 3. Compute shared secret: e(signature, C1) = e(s*H, r*G2) = e(r*H, s*G2) = e(V, P)
 * 4. Derive K using Poseidon2 KDF
 * 5. Decrypt: plaintext = ciphertext - K
 */

import { bn254 } from '@noble/curves/bn254.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { poseidon2Hash } from '@aztec/foundation/crypto';

// ============================================================================
// HARDCODED VALUES FROM ENCRYPTION (auto-generated by drand-sync.sh)
// ============================================================================
DECRYPT_HEADER

# Extract randomness from TS output
RANDOMNESS=$(echo "$TS_OUTPUT" | grep "^randomness:" | awk '{print $2}')

cat >> "$DECRYPT_FILE" << DECRYPT_VALUES
const ENCRYPTED_DATA = {
    plaintext: ${PLAINTEXT}n,  // Original (for verification)
    randomness: "$RANDOMNESS",
    target_round: $TARGET_ROUND,
    ciphertext: "$CIPHERTEXT",
    pairing_result: "$PAIRING_RESULT",
    K: "$K_VALUE"
};
DECRYPT_VALUES

cat >> "$DECRYPT_FILE" << 'DECRYPT_FOOTER'

// BN254 Field modulus
const FIELD_MODULUS = bn254.fields.Fr.ORDER;

// ============================================================================
// FETCH DRAND SIGNATURE
// ============================================================================
async function fetchDrandSignature(round) {
    const url = `https://api.drand.sh/v2/beacons/evmnet/rounds/${round}`;
    console.log(`Fetching drand signature from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch drand round ${round}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Drand response:`, data);
    
    return data.signature;
}

// ============================================================================
// PARSE G1 SIGNATURE
// ============================================================================
function parseG1Signature(signatureHex) {
    const sigBytes = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;
    
    if (sigBytes.length !== 128) {
        throw new Error(`Invalid signature length: expected 128 hex chars, got ${sigBytes.length}`);
    }
    
    const pointHex = '04' + sigBytes;
    const G1 = bn254.G1;
    const point = G1.Point.fromHex(pointHex);
    
    return point;
}

// ============================================================================
// KDF - Same as encryption (Poseidon2)
// ============================================================================
async function kdf(pairingResult) {
    const pairingStr = JSON.stringify({
        c0: pairingResult.c0.toString(),
        c1: pairingResult.c1.toString()
    });
    
    const pairingHash = sha256(new TextEncoder().encode(pairingStr));
    const pairingFieldRaw = BigInt('0x' + Buffer.from(pairingHash).toString('hex'));
    
    const FR_MODULUS = BigInt('0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001');
    const pairingField = pairingFieldRaw % FR_MODULUS;
    
    const kdfResult = await poseidon2Hash([pairingField]);
    return kdfResult.toBigInt();
}

// ============================================================================
// MAIN DECRYPT FUNCTION
// ============================================================================
async function decrypt() {
    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║         DRAND TIMELOCK DECRYPTION                            ║");
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("");
    
    const { randomness, target_round, ciphertext, K: expected_K, plaintext: expected_plaintext } = ENCRYPTED_DATA;
    
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("ENCRYPTED DATA");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`Target Round: ${target_round}`);
    console.log(`Ciphertext: ${ciphertext}`);
    console.log(`Randomness (r): ${randomness.substring(0, 20)}...`);
    console.log("");
    
    // Step 1: Fetch drand signature
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("STEP 1: Fetch drand signature");
    console.log("═══════════════════════════════════════════════════════════════");
    
    let signature;
    try {
        signature = await fetchDrandSignature(target_round);
        console.log(`Signature fetched: ${signature.substring(0, 40)}...`);
    } catch (error) {
        console.log(`Failed to fetch signature: ${error.message}`);
        console.log("");
        console.log("Note: The round may not have been reached yet.");
        const genesis = 1727521075;
        const roundTime = genesis + target_round * 3;
        console.log(`Round ${target_round} will be available at: ${new Date(roundTime * 1000).toISOString()}`);
        return;
    }
    console.log("");
    
    // Step 2: Parse signature as G1 point
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("STEP 2: Parse signature as G1 point");
    console.log("═══════════════════════════════════════════════════════════════");
    
    const sigmaPoint = parseG1Signature(signature);
    const sigmaAffine = sigmaPoint.toAffine();
    console.log(`sigma (signature) on G1:`);
    console.log(`  x: ${sigmaAffine.x.toString().substring(0, 40)}...`);
    console.log(`  y: ${sigmaAffine.y.toString().substring(0, 40)}...`);
    console.log("");
    
    // Step 3: Compute C1 = r * G2_gen
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("STEP 3: Compute C1 = r * G2_gen");
    console.log("═══════════════════════════════════════════════════════════════");
    
    const G2 = bn254.G2;
    const r = bn254.fields.Fr.create(BigInt(randomness));
    const C1 = G2.Point.BASE.multiply(r);
    
    console.log(`C1 = r * G2_gen (point on G2)`);
    console.log("");
    
    // Step 4: Compute pairing e(sigma, C1)
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("STEP 4: Compute pairing e(sigma, C1)");
    console.log("═══════════════════════════════════════════════════════════════");
    
    const pairingResult = bn254.pairing(sigmaPoint, C1);
    console.log(`Pairing computed: e(sigma, C1) in GT`);
    console.log("");
    
    // Step 5: Derive K using KDF
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("STEP 5: Derive K using Poseidon2 KDF");
    console.log("═══════════════════════════════════════════════════════════════");
    
    const K = await kdf(pairingResult);
    console.log(`K (decryption key): ${K.toString().substring(0, 40)}...`);
    console.log(`Expected K:         ${expected_K.substring(0, 40)}...`);
    
    if (K.toString() === expected_K) {
        console.log("K matches expected value!");
    } else {
        console.log("K does NOT match! Decryption will fail.");
    }
    console.log("");
    
    // Step 6: Decrypt
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("STEP 6: Decrypt (plaintext = ciphertext - K)");
    console.log("═══════════════════════════════════════════════════════════════");
    
    const ciphertextBigInt = BigInt(ciphertext);
    let plaintext = (ciphertextBigInt - K) % FIELD_MODULUS;
    if (plaintext < 0n) {
        plaintext += FIELD_MODULUS;
    }
    
    console.log(`Ciphertext: ${ciphertext}`);
    console.log(`K:          ${K}`);
    console.log(`Plaintext:  ${plaintext}`);
    console.log(`Expected:   ${expected_plaintext}`);
    console.log("");
    
    if (plaintext === expected_plaintext) {
        console.log("╔══════════════════════════════════════════════════════════════╗");
        console.log("║  DECRYPTION SUCCESSFUL!                                      ║");
        console.log("╚══════════════════════════════════════════════════════════════╝");
        console.log("");
        console.log(`Decrypted message: ${plaintext}`);
    } else {
        console.log("╔══════════════════════════════════════════════════════════════╗");
        console.log("║  DECRYPTION FAILED                                           ║");
        console.log("╚══════════════════════════════════════════════════════════════╝");
    }
    
    return plaintext;
}

// ============================================================================
// RUN
// ============================================================================
decrypt().catch(console.error);
DECRYPT_FOOTER

echo -e "${GREEN}✓ Decrypt script updated${NC}"
echo ""

# =============================================================================
# Step 8: Update Arkana.t.sol with timelock values
# =============================================================================
echo -e "${BLUE}[8/8] Updating Arkana.t.sol with timelock values...${NC}"

# Convert decimal values to hex for Solidity (using node for big numbers)
TARGET_ROUND_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$TARGET_ROUND').toString(16))")
H_X_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$H_X').toString(16))")
H_Y_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$H_Y').toString(16))")
V_X_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$V_X').toString(16))")
V_Y_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$V_Y').toString(16))")
C1_X0_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$C1_X0').toString(16))")
C1_X1_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$C1_X1').toString(16))")
C1_Y0_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$C1_Y0').toString(16))")
C1_Y1_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$C1_Y1').toString(16))")
CIPHERTEXT_HEX_ARKANA=$(node -e "console.log('0x' + BigInt('$CIPHERTEXT').toString(16))")

# Update timelock values in Arkana.t.sol using sed
# Note: We match the line with the index and comment to ensure we update the right value
sed -i "s|withdrawPublicInputs\[8\] = bytes32(uint256(0x[0-9a-fA-F]*)); // target_round|withdrawPublicInputs[8] = bytes32(uint256($TARGET_ROUND_HEX_ARKANA)); // target_round|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[9\] = bytes32(uint256(0x[0-9a-fA-F]*)); // H_x.*|withdrawPublicInputs[9] = bytes32(uint256($H_X_HEX_ARKANA)); // H_x (G1 point) - hash_to_curve(round)|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[10\] = bytes32(uint256(0x[0-9a-fA-F]*)); // H_y.*|withdrawPublicInputs[10] = bytes32(uint256($H_Y_HEX_ARKANA)); // H_y (G1 point)|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[11\] = bytes32(uint256(0x[0-9a-fA-F]*)); // V_x.*|withdrawPublicInputs[11] = bytes32(uint256($V_X_HEX_ARKANA)); // V_x (G1 point) - r * H|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[12\] = bytes32(uint256(0x[0-9a-fA-F]*)); // V_y.*|withdrawPublicInputs[12] = bytes32(uint256($V_Y_HEX_ARKANA)); // V_y (G1 point)|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[13\] = bytes32(uint256(0x[0-9a-fA-F]*)); // C1_x0.*|withdrawPublicInputs[13] = bytes32(uint256($C1_X0_HEX_ARKANA)); // C1_x0 (G2 point) - r * G2_gen (real) - AUTO-GENERATED|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[14\] = bytes32(uint256(0x[0-9a-fA-F]*)); // C1_x1.*|withdrawPublicInputs[14] = bytes32(uint256($C1_X1_HEX_ARKANA)); // C1_x1 (G2 point) - r * G2_gen (imag) - AUTO-GENERATED|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[15\] = bytes32(uint256(0x[0-9a-fA-F]*)); // C1_y0.*|withdrawPublicInputs[15] = bytes32(uint256($C1_Y0_HEX_ARKANA)); // C1_y0 (G2 point) - r * G2_gen (real) - AUTO-GENERATED|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[16\] = bytes32(uint256(0x[0-9a-fA-F]*)); // C1_y1.*|withdrawPublicInputs[16] = bytes32(uint256($C1_Y1_HEX_ARKANA)); // C1_y1 (G2 point) - r * G2_gen (imag) - AUTO-GENERATED|" "$ARKANA_TEST_FILE"
sed -i "s|withdrawPublicInputs\[24\] = bytes32(uint256(0x[0-9a-fA-F]*)); // timelock_ciphertext.*|withdrawPublicInputs[24] = bytes32(uint256($CIPHERTEXT_HEX_ARKANA)); // timelock_ciphertext (public output)|" "$ARKANA_TEST_FILE"

echo -e "${GREEN}✓ Arkana.t.sol updated with timelock values${NC}"
echo ""

# =============================================================================
# Summary
# =============================================================================
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    Sync Complete ✅                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Updated files:"
echo -e "  ${GREEN}✓${NC} $NOIR_TEST_FILE"
echo -e "  ${GREEN}✓${NC} $NOIR_TESTS_FILE"
echo -e "  ${GREEN}✓${NC} $SOLIDITY_TEST_FILE"
echo -e "  ${GREEN}✓${NC} $ARKANA_TEST_FILE"
echo -e "  ${GREEN}✓${NC} $DECRYPT_FILE"
echo ""
echo -e "Values synced:"
echo -e "  Target Round: ${YELLOW}$TARGET_ROUND${NC}"
echo -e "  V_x: ${YELLOW}${V_X:0:20}...${NC}"
echo -e "  V_y: ${YELLOW}${V_Y:0:20}...${NC}"
echo -e "  Pairing Result: ${YELLOW}${PAIRING_RESULT:0:20}...${NC}"
echo -e "  Ciphertext: ${YELLOW}${CIPHERTEXT:0:20}...${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Run Solidity test: ${BLUE}cd contracts && forge test --match-contract DrandTest -vv --via-ir --ffi${NC}"
echo -e "  2. Run integration test: ${BLUE}cd contracts && forge test --match-test test_EntryThenWithdraw_Integration -vv --via-ir --ffi${NC}"
echo -e "  3. Test decryption: ${BLUE}cd ts-utils && node timelock-decrypt.js${NC}"
echo -e "  4. Commit changes: ${BLUE}git add . && git commit -m 'chore: sync drand values'${NC}"
echo ""

