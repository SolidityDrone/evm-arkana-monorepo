#!/bin/bash

set -e

RPC_URL="http://localhost:8545"
KEYSTORE="$HOME/.foundry/keystores/default_foundry"
WBTC="0x29f2D40B0605204364af54EC677bD022dA425d03"
AAVE_POOL="0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951"

echo "=========================================="
echo "Sending aTokens to Vault"
echo "=========================================="
echo ""

# Load deployed addresses
if [ -f "deployed_addresses.txt" ]; then
    source deployed_addresses.txt
    echo "Loaded deployed addresses:"
    echo "  ARKANA_ADDRESS: $ARKANA_ADDRESS"
else
    echo "Error: deployed_addresses.txt not found"
    exit 1
fi

# Get user address (using default Foundry address from keystore)
USER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "User address: $USER_ADDRESS"
echo ""

# Get aToken address using Aave's interface
# The getReserveData returns a struct, we need to parse it properly
echo "Step 1: Getting aToken address for WBTC from Aave..."

# Call getReserveData and parse the result
# ReserveData struct has aTokenAddress as the 8th field
RESERVE_DATA=$(cast call $AAVE_POOL \
  "getReserveData(address)" \
  $WBTC \
  --rpc-url $RPC_URL)

# Extract aToken address (it's typically in the response, we need to find the right one)
# Let's use a different approach - call the view function that returns just addresses
echo "Raw reserve data:"
echo "$RESERVE_DATA"
echo ""

# Parse aToken address - it's the 8th field in the tuple
# Let's extract all addresses and take the first valid one
ATOKEN=$(echo "$RESERVE_DATA" | grep -oE '0x[a-fA-F0-9]{40}' | grep -v "^0x0000000000000000000000000000000000000000$" | head -1)

echo "aToken address: $ATOKEN"
echo ""

# Verify it's a valid contract
echo "Verifying aToken contract..."
ATOKEN_CODE=$(cast code $ATOKEN --rpc-url $RPC_URL)
if [ ${#ATOKEN_CODE} -lt 10 ]; then
    echo "Error: aToken address has no code. Let's try a different extraction method..."
    
    # Alternative: manually construct the call with proper ABI
    ATOKEN=$(cast call $AAVE_POOL \
      --rpc-url $RPC_URL \
      "function getReserveData(address) external view returns (uint256, uint128, uint128, uint128, uint128, uint128, uint40, uint16, address, address, address, address, uint128, uint128, uint128)" \
      $WBTC | grep -oE '0x[a-fA-F0-9]{40}' | head -1)
    
    echo "Retry - aToken address: $ATOKEN"
fi
echo ""

# Get vault address from Arkana
echo "Step 2: Getting vault address for WBTC..."
VAULT=$(cast call $ARKANA_ADDRESS \
  "tokenVaults(address)(address)" \
  $WBTC \
  --rpc-url $RPC_URL)

echo "Vault address: $VAULT"
echo ""

# Check if vault is valid
if [ "$VAULT" == "0x0000000000000000000000000000000000000000" ]; then
    echo "Error: No vault found for WBTC. Did you initialize vaults during deployment?"
    exit 1
fi

# Check aToken balance
echo "Step 3: Checking your aToken balance..."
BALANCE=$(cast call $ATOKEN \
  "balanceOf(address)(uint256)" \
  $USER_ADDRESS \
  --rpc-url $RPC_URL)

echo "Your aToken balance: $BALANCE"
echo ""

if [ "$BALANCE" == "0" ] || [ -z "$BALANCE" ]; then
    echo "Error: You have no aTokens. You need to supply WBTC to Aave first."
    echo ""
    echo "To get aTokens, you need to:"
    echo "1. Have WBTC in your wallet"
    echo "2. Approve Aave Pool: cast send $WBTC 'approve(address,uint256)' $AAVE_POOL <amount> --keystore $KEYSTORE --rpc-url $RPC_URL"
    echo "3. Supply to Aave: cast send $AAVE_POOL 'supply(address,uint256,address,uint16)' $WBTC <amount> $USER_ADDRESS 0 --keystore $KEYSTORE --rpc-url $RPC_URL"
    exit 1
fi

# Send aTokens to vault
AMOUNT="1000000"  # 0.01 WBTC (WBTC has 8 decimals)
echo "Step 4: Sending $AMOUNT aTokens to vault ($VAULT)..."
echo ""

cast send $ATOKEN \
  "transfer(address,uint256)" \
  $VAULT \
  $AMOUNT \
  --rpc-url $RPC_URL \
  --keystore $KEYSTORE

echo ""
echo "=========================================="
echo "aTokens sent successfully!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  aToken: $ATOKEN"
echo "  Vault: $VAULT"
echo "  Amount sent: $AMOUNT"
echo ""
echo "This simulates yield accumulation in the vault."
echo "The vault's totalAssets() will now be higher than before,"
echo "which will affect the share price for future deposits."

