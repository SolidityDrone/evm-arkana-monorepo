#!/bin/bash

# Fund tokens to a target address on Anvil fork
# Usage: ./scripts/fund_anvil.sh [target_address] [rpc_url]

set -e

# Configuration
TARGET=${1:-"0x8BF7F10029E8e0452D6F544a57A151E93502e8C5"}
RPC_URL=${2:-"http://localhost:8545"}

# Token addresses (Sepolia)
WBTC="0x29f2D40B0605204364af54EC677bD022dA425d03"
WETH="0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c"
AAVE="0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a"
USDC="0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8"
DAI="0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357"
USDT="0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0"
EURS="0x6d906e526a4e2Ca02097BA9d0caA3c382F52278E"
LINK="0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5"

echo "============================================"
echo "Funding tokens to: $TARGET"
echo "RPC URL: $RPC_URL"
echo "============================================"

# Function to set ERC20 balance using storage manipulation
# This is the most reliable method for Anvil
set_erc20_balance() {
    local token=$1
    local name=$2
    local amount=$3
    local slot=${4:-0}  # Default to slot 0, some tokens use slot 1

    echo ""
    echo "--- Funding $name ---"
    echo "Token: $token"
    echo "Amount: $amount"

    # Compute storage slot for balance mapping
    # balanceOf[address] is at keccak256(abi.encode(address, slot))
    local padded_address=$(printf '%064s' "${TARGET:2}" | tr ' ' '0')
    local padded_slot=$(printf '%064x' $slot)
    local key="0x${padded_address}${padded_slot}"
    local storage_slot=$(cast keccak256 $key)

    echo "Storage slot: $storage_slot"

    # Convert amount to hex (padded to 32 bytes)
    local hex_amount=$(printf '0x%064x' $amount)

    # Set storage
    cast rpc anvil_setStorageAt $token $storage_slot $hex_amount --rpc-url $RPC_URL

    # Verify balance
    local balance=$(cast call $token "balanceOf(address)(uint256)" $TARGET --rpc-url $RPC_URL 2>/dev/null || echo "0")
    echo "New balance: $balance"
}

# Function to fund using mint (for tokens with mint function)
fund_with_mint() {
    local token=$1
    local name=$2
    local minter=$3
    local amount=$4

    echo ""
    echo "--- Funding $name via mint ---"
    echo "Token: $token"
    echo "Minter: $minter"
    echo "Amount: $amount"

    # Impersonate minter
    cast rpc anvil_impersonateAccount $minter --rpc-url $RPC_URL

    # Set minter balance for gas
    cast rpc anvil_setBalance $minter 0x1000000000000000000 --rpc-url $RPC_URL

    # Call mint
    cast send $token "mint(address,uint256)" $TARGET $amount \
        --rpc-url $RPC_URL \
        --unlocked \
        --from $minter \
        --gas-limit 1000000 2>/dev/null || echo "Mint failed, trying storage method..."

    # Stop impersonating
    cast rpc anvil_stopImpersonatingAccount $minter --rpc-url $RPC_URL 2>/dev/null || true

    # Verify balance
    local balance=$(cast call $token "balanceOf(address)(uint256)" $TARGET --rpc-url $RPC_URL 2>/dev/null || echo "0")
    echo "New balance: $balance"
}

# Fund ETH first (for gas)
echo ""
echo "--- Funding ETH ---"
cast rpc anvil_setBalance $TARGET 0x56BC75E2D63100000 --rpc-url $RPC_URL  # 100 ETH
echo "ETH funded: 100 ETH"

# Fund WETH (deposit ETH to WETH contract)
echo ""
echo "--- Funding WETH ---"
# First impersonate target to deposit ETH
cast rpc anvil_impersonateAccount $TARGET --rpc-url $RPC_URL
cast send $WETH --value 10000000000000000000 --rpc-url $RPC_URL --unlocked --from $TARGET --gas-limit 100000 2>/dev/null || true
cast rpc anvil_stopImpersonatingAccount $TARGET --rpc-url $RPC_URL 2>/dev/null || true
# Also try storage method
set_erc20_balance $WETH "WETH" 10000000000000000000 0  # 10 WETH (18 decimals)

# Fund WBTC (8 decimals)
# Try storage slots 0, 1, 2 since different tokens use different slots
set_erc20_balance $WBTC "WBTC" 1000000000 0  # 10 WBTC (8 decimals)
set_erc20_balance $WBTC "WBTC" 1000000000 1  # Try slot 1 if slot 0 didn't work

# Fund AAVE (18 decimals)
set_erc20_balance $AAVE "AAVE" 10000000000000000000 0  # 10 AAVE
set_erc20_balance $AAVE "AAVE" 10000000000000000000 1  # Try slot 1

# Fund USDC (6 decimals)
set_erc20_balance $USDC "USDC" 10000000000 0  # 10,000 USDC
set_erc20_balance $USDC "USDC" 10000000000 1  # Try slot 1

# Fund DAI (18 decimals)
set_erc20_balance $DAI "DAI" 10000000000000000000000 0  # 10,000 DAI
set_erc20_balance $DAI "DAI" 10000000000000000000000 1  # Try slot 1
set_erc20_balance $DAI "DAI" 10000000000000000000000 2  # DAI uses slot 2

# Fund USDT (6 decimals)
set_erc20_balance $USDT "USDT" 10000000000 0  # 10,000 USDT
set_erc20_balance $USDT "USDT" 10000000000 1  # Try slot 1

# Fund EURS (try mint method first as shown in user's example)
# Minter address from user's example
EURS_MINTER="0xC959483DBa39aa9E78757139af0e9a2EDEb3f42D"
fund_with_mint $EURS "EURS" $EURS_MINTER 10000000000  # 10,000 EURS (assuming 6 decimals)
# Fallback to storage
set_erc20_balance $EURS "EURS" 10000000000 0
set_erc20_balance $EURS "EURS" 10000000000 1

# Fund LINK (18 decimals)
set_erc20_balance $LINK "LINK" 10000000000000000000 0  # 10 LINK
set_erc20_balance $LINK "LINK" 10000000000000000000 1  # Try slot 1

echo ""
echo "============================================"
echo "Funding complete!"
echo "============================================"

# Print final balances
echo ""
echo "Final balances for $TARGET:"
echo "ETH:  $(cast balance $TARGET --rpc-url $RPC_URL)"
echo "WETH: $(cast call $WETH 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"
echo "WBTC: $(cast call $WBTC 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"
echo "AAVE: $(cast call $AAVE 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"
echo "USDC: $(cast call $USDC 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"
echo "DAI:  $(cast call $DAI 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"
echo "USDT: $(cast call $USDT 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"
echo "EURS: $(cast call $EURS 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"
echo "LINK: $(cast call $LINK 'balanceOf(address)(uint256)' $TARGET --rpc-url $RPC_URL 2>/dev/null || echo 'N/A')"

