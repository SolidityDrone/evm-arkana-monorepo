#!/bin/bash

# Uniswap V4 Pool Checker for Sepolia
# Usage: ./check_v4_pool.sh

# Addresses
POOL_MANAGER="0xE03A1074c86CFeDd5C142C4F04F1a1536e203543"
SEPOLIA_WBTC="0x29f2D40B0605204364af54EC677bD022dA425d03"
SEPOLIA_WETH="0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c"

# currency0 must be < currency1 (numerically sorted)
# WBTC (0x29f2...) < WETH (0xc558...) so:
CURRENCY0=$SEPOLIA_WBTC
CURRENCY1=$SEPOLIA_WETH

# Common fee tiers to check
FEE_TIERS=(100 500 3000 10000)
TICK_SPACINGS=(1 10 60 200)

echo "============================================"
echo "Uniswap V4 Pool Checker - Sepolia"
echo "============================================"
echo "Pool Manager: $POOL_MANAGER"
echo "Token0 (WBTC): $CURRENCY0"
echo "Token1 (WETH): $CURRENCY1"
echo ""
echo "Checking common fee tiers..."
echo ""

# StateView or StateLibrary slot computations are complex
# Instead, we can use the Quoter to try quoting a swap - if it reverts with no liquidity, the pool doesn't exist

# Or we can compute the PoolId and check the slot0 directly
# PoolId = keccak256(abi.encode(PoolKey))

# The simplest way is to use forge to query

for i in "${!FEE_TIERS[@]}"; do
    FEE=${FEE_TIERS[$i]}
    TICK_SPACING=${TICK_SPACINGS[$i]}
    
    echo "Checking fee=$FEE, tickSpacing=$TICK_SPACING..."
    
    # Compute poolId = keccak256(abi.encode(currency0, currency1, fee, tickSpacing, hooks))
    # hooks = address(0) = 0x0000000000000000000000000000000000000000
    
    # PoolKey encoding
    POOL_KEY_ENCODED=$(cast abi-encode "f(address,address,uint24,int24,address)" $CURRENCY0 $CURRENCY1 $FEE $TICK_SPACING "0x0000000000000000000000000000000000000000")
    POOL_ID=$(cast keccak256 $POOL_KEY_ENCODED)
    
    echo "  PoolId: $POOL_ID"
    
    # In V4, the pool state is stored at:
    # mapping(PoolId id => Pool.State) internal pools;
    # We can try to read slot0 which contains sqrtPriceX96, tick, etc.
    
    # The slot for pools mapping at slot 6 (typical) with PoolId as key:
    # slot = keccak256(poolId . 6)
    # But the exact slot depends on the contract layout
    
    # Easier: Use a view function if available, or try via quoter
    
    # For now, let's just compute and output the PoolKey for you to use
    echo "  PoolKey for this configuration:"
    echo "    currency0: $CURRENCY0"
    echo "    currency1: $CURRENCY1"
    echo "    fee: $FEE"
    echo "    tickSpacing: $TICK_SPACING"
    echo "    hooks: 0x0000000000000000000000000000000000000000"
    echo ""
done

echo "============================================"
echo "To check liquidity, use the Foundry test below"
echo "============================================"

