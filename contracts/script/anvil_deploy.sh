#!/bin/bash

set -e

echo "=========================================="
echo "Deploying Verifiers and Arkana"
echo "=========================================="
echo ""

RPC_URL="http://localhost:8545"
KEYSTORE="$HOME/.foundry/keystores/default_foundry"
SENDER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Load .env file if it exists
if [ -f ".env" ]; then
    echo "Loading .env file..."
    export $(grep -v '^#' .env | xargs)
fi

# Token addresses (Sepolia) - can be overridden by .env
export SEPOLIA_AAVE_POOL="${SEPOLIA_AAVE_POOL:-0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951}"
export SEPOLIA_POOL_MANAGER="${SEPOLIA_POOL_MANAGER:-0xE03A1074c86CFeDd5C142C4F04F1a1536e203543}"
export SEPOLIA_UNIVERSAL_ROUTER="${SEPOLIA_UNIVERSAL_ROUTER:-0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b}"
export SEPOLIA_POSITION_MANAGER="${SEPOLIA_POSITION_MANAGER:-0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4}"
export SEPOLIA_MULTICALL3="${SEPOLIA_MULTICALL3:-0xcA11bde05977b3631167028862bE2a173976CA11}"
export SEPOLIA_PERMIT2="${SEPOLIA_PERMIT2:-0x000000000022D473030F116dDEE9F6B43aC78BA3}"
export SEPOLIA_WBTC="${SEPOLIA_WBTC:-0x29f2D40B0605204364af54EC677bD022dA425d03}"
export SEPOLIA_WETH="${SEPOLIA_WETH:-0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c}"
export SEPOLIA_AAVE="${SEPOLIA_AAVE:-0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a}"

echo "Configuration:"
echo "  Aave Pool: $SEPOLIA_AAVE_POOL"
echo "  Pool Manager: $SEPOLIA_POOL_MANAGER"
echo "  Universal Router: $SEPOLIA_UNIVERSAL_ROUTER"
echo "  Position Manager: $SEPOLIA_POSITION_MANAGER"
echo "  Multicall3: $SEPOLIA_MULTICALL3"
echo "  Permit2: $SEPOLIA_PERMIT2"
echo "  WBTC: $SEPOLIA_WBTC"
echo "  WETH: $SEPOLIA_WETH"
echo "  AAVE: $SEPOLIA_AAVE"
echo ""

echo "Step 1: Deploying Huff Poseidon2 Contract..."
echo "----------------------------------------"
# Deploy Huff contract and capture the address from the return value
# Using the exact flags that are required for Huff deployment
# Use a temp file to capture output while still showing it
TEMP_OUTPUT=$(mktemp)
forge script script/DeployPoseidon2Huff.s.sol \
    -vv \
    --skip test/ArkanaOps.t.sol src/Verifiers/**.sol src/merkle/LeanIMTPoseidon2.sol \
    --ffi \
    --via-ir \
    --broadcast \
    --keystore "$KEYSTORE" \
    --rpc-url "$RPC_URL" 2>&1 | tee "$TEMP_OUTPUT"

HUFF_OUTPUT=$(cat "$TEMP_OUTPUT")
rm "$TEMP_OUTPUT"

# Extract the address from multiple possible formats:
# 1. "Huff Poseidon2 deployed at: 0x..." (from console.log)
# 2. "poseidon2Huff: address 0x..." (from return value)
# 3. "Contract Address: 0x..." (from broadcast output, but only from Huff deployment section)
POSEIDON2_HUFF_ADDRESS=$(echo "$HUFF_OUTPUT" | grep -i "Huff Poseidon2 deployed at" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)

if [ -z "$POSEIDON2_HUFF_ADDRESS" ]; then
    # Try return value format
    POSEIDON2_HUFF_ADDRESS=$(echo "$HUFF_OUTPUT" | grep -oE 'poseidon2Huff: address 0x[a-fA-F0-9]{40}' | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
fi

if [ -z "$POSEIDON2_HUFF_ADDRESS" ]; then
    # Try broadcast output format (but only from this step's output)
    POSEIDON2_HUFF_ADDRESS=$(echo "$HUFF_OUTPUT" | grep -i "Contract Address:" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
fi

if [ -z "$POSEIDON2_HUFF_ADDRESS" ]; then
    echo "Error: Could not find Huff Poseidon2 address in deployment output"
    echo "Please check the deployment output above"
    exit 1
fi

# Verify the contract actually exists on-chain by checking its code size
echo "Verifying Huff Poseidon2 contract exists on-chain..."
CODE_SIZE=$(cast code "$POSEIDON2_HUFF_ADDRESS" --rpc-url "$RPC_URL" 2>/dev/null | wc -c)
if [ "$CODE_SIZE" -lt 10 ]; then
    echo "ERROR: Huff Poseidon2 contract at $POSEIDON2_HUFF_ADDRESS has no code!"
    echo "The contract was not actually deployed on-chain."
    echo "Please check the deployment output above and redeploy."
    exit 1
fi

echo "✓ Huff Poseidon2 deployed at: $POSEIDON2_HUFF_ADDRESS (code size: $CODE_SIZE bytes)"
export POSEIDON2_HUFF_ADDRESS

echo ""
echo "Step 2: Deploying Verifiers..."
echo "----------------------------------------"
# NOTE: Verifiers must NOT use --via-ir (stack depth issues with ZK verifier contracts)
# LeanIMTPoseidon2.sol requires --via-ir but Verifiers cannot use it
# Workaround: Temporarily rename merkle files that cause stack too deep to avoid compilation
# This is necessary because --skip doesn't prevent Forge from compiling all project files
MERKLE_DIR="src/merkle"
LEAN_IMT_POSEIDON2_FILE="$MERKLE_DIR/LeanIMTPoseidon2.sol"
LEAN_IMT_POSEIDON2_BACKUP="$MERKLE_DIR/LeanIMTPoseidon2.sol.backup"
LEAN_IMT_FILE="$MERKLE_DIR/LeanIMT.sol"
LEAN_IMT_BACKUP="$MERKLE_DIR/LeanIMT.sol.backup"

# Function to restore files
restore_merkle_files() {
    if [ -f "$LEAN_IMT_POSEIDON2_BACKUP" ]; then
        mv "$LEAN_IMT_POSEIDON2_BACKUP" "$LEAN_IMT_POSEIDON2_FILE"
    fi
    if [ -f "$LEAN_IMT_BACKUP" ]; then
        mv "$LEAN_IMT_BACKUP" "$LEAN_IMT_FILE"
    fi
}

# Rename files to avoid compilation
if [ -f "$LEAN_IMT_POSEIDON2_FILE" ]; then
    echo "Temporarily renaming LeanIMTPoseidon2.sol to avoid compilation..."
    mv "$LEAN_IMT_POSEIDON2_FILE" "$LEAN_IMT_POSEIDON2_BACKUP"
fi

if [ -f "$LEAN_IMT_FILE" ]; then
    echo "Temporarily renaming LeanIMT.sol to avoid compilation..."
    mv "$LEAN_IMT_FILE" "$LEAN_IMT_BACKUP"
fi

# Set trap to restore files on exit (success or failure)
trap restore_merkle_files EXIT

forge script script/VerifierDeployer.s.sol \
    --skip "test/**" "src/Arkana.sol" "src/ArkanaVault.sol"  "src/tl-limit/**" \
    --broadcast \
    --rpc-url "$RPC_URL" \
    --keystore "$KEYSTORE" \
    --sender "$SENDER"

# Restore files (trap will also handle this, but doing it explicitly for clarity)
restore_merkle_files
trap - EXIT


echo ""
echo "Step 3: Deploying Arkana Contract..."
echo "----------------------------------------"
# Build INITIALIZE_VAULTS_TOKENS from individual Sepolia token env vars
# This will initialize vaults for all available Sepolia tokens
if [ -z "$INITIALIZE_VAULTS_TOKENS" ]; then
    TOKENS_ARRAY=()
    
    # Add each token if it exists in environment
    [ -n "$SEPOLIA_EURS" ] && TOKENS_ARRAY+=("$SEPOLIA_EURS")
    [ -n "$SEPOLIA_USDC" ] && TOKENS_ARRAY+=("$SEPOLIA_USDC")
    [ -n "$SEPOLIA_DAI" ] && TOKENS_ARRAY+=("$SEPOLIA_DAI")
    [ -n "$SEPOLIA_USDT" ] && TOKENS_ARRAY+=("$SEPOLIA_USDT")
    [ -n "$SEPOLIA_WBTC" ] && TOKENS_ARRAY+=("$SEPOLIA_WBTC")
    [ -n "$SEPOLIA_WETH" ] && TOKENS_ARRAY+=("$SEPOLIA_WETH")
    [ -n "$SEPOLIA_LINK" ] && TOKENS_ARRAY+=("$SEPOLIA_LINK")
    [ -n "$SEPOLIA_AAVE" ] && TOKENS_ARRAY+=("$SEPOLIA_AAVE")
    [ -n "$SEPOLIA_GHO" ] && TOKENS_ARRAY+=("$SEPOLIA_GHO")
    
    # Join array into comma-separated string
    INITIALIZE_VAULTS_TOKENS=$(IFS=,; echo "${TOKENS_ARRAY[*]}")
fi

# Capture Arkana deployment output to extract the address
ARKANA_TEMP_OUTPUT=$(mktemp)
if [ -n "$INITIALIZE_VAULTS_TOKENS" ]; then
    echo "Will initialize vaults for the following tokens:"
    [ -n "$SEPOLIA_EURS" ] && echo "  - EURS: $SEPOLIA_EURS"
    [ -n "$SEPOLIA_USDC" ] && echo "  - USDC: $SEPOLIA_USDC"
    [ -n "$SEPOLIA_DAI" ] && echo "  - DAI: $SEPOLIA_DAI"
    [ -n "$SEPOLIA_USDT" ] && echo "  - USDT: $SEPOLIA_USDT"
    [ -n "$SEPOLIA_WBTC" ] && echo "  - WBTC: $SEPOLIA_WBTC"
    [ -n "$SEPOLIA_WETH" ] && echo "  - WETH: $SEPOLIA_WETH"
    [ -n "$SEPOLIA_LINK" ] && echo "  - LINK: $SEPOLIA_LINK"
    [ -n "$SEPOLIA_AAVE" ] && echo "  - AAVE: $SEPOLIA_AAVE"
    [ -n "$SEPOLIA_GHO" ] && echo "  - GHO: $SEPOLIA_GHO"
    echo ""
    # Export the environment variable so forge script can read it via vm.envString()
    export INITIALIZE_VAULTS_TOKENS
    forge script script/Arkana.s.sol \
        --skip test/ArkanaOps.t.sol src/Verifiers/** src/merkle/LeanIMTPoseidon2.sol \
        --broadcast \
        --rpc-url "$RPC_URL" \
        --keystore "$KEYSTORE" \
        --sender "$SENDER" \
        --via-ir 2>&1 | tee "$ARKANA_TEMP_OUTPUT"
else
    echo "No tokens found for vault initialization"
    echo "Make sure Sepolia token addresses are set in .env (SEPOLIA_EURS, SEPOLIA_USDC, etc.)"
    forge script script/Arkana.s.sol \
        --skip test/ArkanaOps.t.sol src/Verifiers/** src/merkle/LeanIMTPoseidon2.sol \
        --broadcast \
        --rpc-url "$RPC_URL" \
        --keystore "$KEYSTORE" \
        --sender "$SENDER" \
        --via-ir 2>&1 | tee "$ARKANA_TEMP_OUTPUT"
fi

ARKANA_OUTPUT=$(cat "$ARKANA_TEMP_OUTPUT")
rm "$ARKANA_TEMP_OUTPUT"

# Check if deployment failed
if echo "$ARKANA_OUTPUT" | grep -q "Error\|error\|Failed\|failed"; then
    echo "Warning: Deployment may have failed. Check output above."
fi

# Extract TLswapRegister address
TLSWAP_REGISTER_ADDRESS=$(echo "$ARKANA_OUTPUT" | grep -i "TLswapRegister deployed at:" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)

# Extract Arkana contract address
# Try multiple patterns to match different console.log formats
# Priority: specific console.log messages first, then broadcast output
# IMPORTANT: Exclude the Huff address that might be logged in Arkana script output
# First try "Arkana deployed at:" format (this is what the Solidity script actually outputs)
ARKANA_ADDRESS=$(echo "$ARKANA_OUTPUT" | grep -i "Arkana deployed at" | grep -v -i "poseidon\|huff" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)

if [ -z "$ARKANA_ADDRESS" ]; then
    # Try "Arkana contract address:" format (fallback for other script versions)
    ARKANA_ADDRESS=$(echo "$ARKANA_OUTPUT" | grep -i "Arkana contract address:" | grep -v -i "poseidon\|huff" | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
fi

if [ -z "$ARKANA_ADDRESS" ]; then
    # Try broadcast output "Contract Address:" (should be the last one in Arkana deployment)
    # But exclude any that match the Huff address we already extracted
    ARKANA_ADDRESS=$(echo "$ARKANA_OUTPUT" | grep -i "Contract Address:" | grep -oE '0x[a-fA-F0-9]{40}' | grep -v "^$POSEIDON2_HUFF_ADDRESS$" | tail -1)
fi

if [ -z "$ARKANA_ADDRESS" ]; then
    # Look for "Deployed to:" in broadcast transactions (excluding Huff address)
    ARKANA_ADDRESS=$(echo "$ARKANA_OUTPUT" | grep -A 2 "Deployed to:" | grep -oE '0x[a-fA-F0-9]{40}' | grep -v "^$POSEIDON2_HUFF_ADDRESS$" | tail -1)
fi

if [ -z "$ARKANA_ADDRESS" ]; then
    echo "Warning: Could not extract Arkana contract address from deployment output"
    echo "This might indicate a deployment failure"
fi

echo ""
echo "=========================================="
echo "Extracting deployed addresses..."
echo "=========================================="

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo "Huff Poseidon2: $POSEIDON2_HUFF_ADDRESS"
if [ -n "$TLSWAP_REGISTER_ADDRESS" ]; then
    echo "TLswapRegister: $TLSWAP_REGISTER_ADDRESS"
fi
if [ -n "$ARKANA_ADDRESS" ]; then
    # Validate that addresses are different
    if [ "$ARKANA_ADDRESS" = "$POSEIDON2_HUFF_ADDRESS" ]; then
        echo "ERROR: Arkana Contract address matches Huff Poseidon2 address!"
        echo "This indicates an extraction error. Please check the deployment output above."
        echo ""
        echo "Debug: Searching for Arkana address in output..."
        echo "$ARKANA_OUTPUT" | grep -i "arkana" | head -10
        echo ""
        echo "Debug: All addresses in Arkana deployment output:"
        echo "$ARKANA_OUTPUT" | grep -oE '0x[a-fA-F0-9]{40}' | tail -5
    else
        echo "Arkana Contract: $ARKANA_ADDRESS"
    fi
else
    echo "Arkana Contract: (address not extracted, check output above)"
    echo ""
    echo "Debug: Last 20 lines of deployment output:"
    echo "$ARKANA_OUTPUT" | tail -20
fi
echo ""

# Export addresses for potential downstream scripts
export ARKANA_ADDRESS
export TLSWAP_REGISTER_ADDRESS

# Optionally save to a file for later use
if [ -n "$ARKANA_ADDRESS" ] && [ "$ARKANA_ADDRESS" != "$POSEIDON2_HUFF_ADDRESS" ]; then
    echo "Saving deployment addresses to deployed_addresses.txt..."
    cat > deployed_addresses.txt << EOF
POSEIDON2_HUFF_ADDRESS=$POSEIDON2_HUFF_ADDRESS
TLSWAP_REGISTER_ADDRESS=${TLSWAP_REGISTER_ADDRESS:-}
ARKANA_ADDRESS=$ARKANA_ADDRESS
EOF
    echo "Addresses saved to deployed_addresses.txt"
fi

