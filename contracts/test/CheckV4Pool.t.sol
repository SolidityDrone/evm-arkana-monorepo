// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {PoolKey} from "../lib/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "../lib/v4-core/src/types/PoolId.sol";
import {Currency} from "../lib/v4-core/src/types/Currency.sol";
import {IPoolManager} from "../lib/v4-core/src/interfaces/IPoolManager.sol";
import {StateLibrary} from "../lib/v4-core/src/libraries/StateLibrary.sol";
import {IHooks} from "../lib/v4-core/src/interfaces/IHooks.sol";

/**
 * @title CheckV4Pool
 * @notice Test to check if Uniswap V4 pools exist for WETH/WBTC on Sepolia
 * @dev Run with: forge test --match-test testCheckPool -vvvv --fork-url $SEPOLIA_RPC_URL
 */
contract CheckV4PoolTest is Test {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    // Sepolia addresses
    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;
    address constant SEPOLIA_WBTC = 0x29f2D40B0605204364af54EC677bD022dA425d03;
    address constant SEPOLIA_WETH = 0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c;
    address constant SEPOLIA_USDC = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8;

    IPoolManager poolManager;

    function setUp() public {
        // Fork Sepolia
        poolManager = IPoolManager(POOL_MANAGER);
    }

    function testCheckPoolFee100() public view {
        _checkPool(100, 1);
    }

    function testCheckPoolFee500() public view {
        _checkPool(500, 10);
    }

    function testCheckPoolFee3000() public view {
        _checkPool(3000, 60);
    }

    function testCheckPoolFee10000() public view {
        _checkPool(10000, 200);
    }

    function testCheckAllFeeTiers() public view {
        console.log("=============================================");
        console.log("Checking WBTC/WETH pools on Uniswap V4 Sepolia");
        console.log("=============================================");
        console.log("");
        console.log("WBTC:", SEPOLIA_WBTC);
        console.log("WETH:", SEPOLIA_WETH);
        console.log("Pool Manager:", POOL_MANAGER);
        console.log("");

        // Ensure tokens are sorted (currency0 < currency1)
        address currency0 = SEPOLIA_WBTC < SEPOLIA_WETH ? SEPOLIA_WBTC : SEPOLIA_WETH;
        address currency1 = SEPOLIA_WBTC < SEPOLIA_WETH ? SEPOLIA_WETH : SEPOLIA_WBTC;

        console.log("Sorted tokens:");
        console.log("  currency0:", currency0);
        console.log("  currency1:", currency1);
        console.log("");

        // Check common fee tiers
        uint24[4] memory fees = [uint24(100), uint24(500), uint24(3000), uint24(10000)];
        int24[4] memory tickSpacings = [int24(1), int24(10), int24(60), int24(200)];

        for (uint256 i = 0; i < fees.length; i++) {
            console.log("-------------------------------------------");
            console.log("Checking fee:", fees[i], "tickSpacing:", uint24(tickSpacings[i]));

            PoolKey memory key = PoolKey({
                currency0: Currency.wrap(currency0),
                currency1: Currency.wrap(currency1),
                fee: fees[i],
                tickSpacing: tickSpacings[i],
                hooks: IHooks(address(0))
            });

            PoolId poolId = key.toId();
            console.log("PoolId:", vm.toString(PoolId.unwrap(poolId)));

            // Try to get the slot0 (sqrtPriceX96, tick, protocolFee, lpFee)
            try this.getPoolSlot0(key) returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee) {
                if (sqrtPriceX96 > 0) {
                    console.log("  POOL EXISTS!");
                    console.log("  sqrtPriceX96:", sqrtPriceX96);
                    console.log("  tick:", tick);
                    console.log("  protocolFee:", protocolFee);
                    console.log("  lpFee:", lpFee);

                    // Get liquidity
                    uint128 liquidity = poolManager.getLiquidity(poolId);
                    console.log("  liquidity:", liquidity);

                    if (liquidity > 0) {
                        console.log("  >>> HAS LIQUIDITY! <<<");
                    } else {
                        console.log("  >>> Pool initialized but NO LIQUIDITY <<<");
                    }
                } else {
                    console.log("  Pool not initialized (sqrtPriceX96 = 0)");
                }
            } catch {
                console.log("  Pool does not exist or query failed");
            }
            console.log("");
        }

        console.log("=============================================");
        console.log("Done checking pools");
        console.log("=============================================");
    }

    function _checkPool(uint24 fee, int24 tickSpacing) internal view {
        // Ensure tokens are sorted (currency0 < currency1)
        address currency0 = SEPOLIA_WBTC < SEPOLIA_WETH ? SEPOLIA_WBTC : SEPOLIA_WETH;
        address currency1 = SEPOLIA_WBTC < SEPOLIA_WETH ? SEPOLIA_WETH : SEPOLIA_WBTC;

        PoolKey memory key = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(address(0))
        });

        PoolId poolId = key.toId();
        console.log("Fee:", fee, "TickSpacing:", uint24(tickSpacing));
        console.log("PoolId:", vm.toString(PoolId.unwrap(poolId)));

        // Get slot0
        (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee) = poolManager.getSlot0(poolId);

        if (sqrtPriceX96 > 0) {
            console.log("POOL EXISTS!");
            console.log("  sqrtPriceX96:", sqrtPriceX96);
            console.log("  tick:", tick);

            // Get liquidity
            uint128 liquidity = poolManager.getLiquidity(poolId);
            console.log("  liquidity:", liquidity);

            if (liquidity > 0) {
                console.log("  >>> HAS LIQUIDITY! <<<");
            } else {
                console.log("  >>> Pool initialized but NO LIQUIDITY <<<");
            }
        } else {
            console.log("Pool not initialized");
        }
        console.log("");
    }

    // External wrapper to allow try/catch
    function getPoolSlot0(PoolKey memory key) external view returns (uint160, int24, uint24, uint24) {
        PoolId poolId = key.toId();
        return poolManager.getSlot0(poolId);
    }

    /**
     * @notice Check WBTC/USDC pools on Sepolia
     */
    function testCheckWBTCUSDCPools() public view {
        console.log("=============================================");
        console.log("Checking WBTC/USDC pools on Uniswap V4 Sepolia");
        console.log("=============================================");
        console.log("");
        console.log("WBTC:", SEPOLIA_WBTC);
        console.log("USDC:", SEPOLIA_USDC);
        console.log("Pool Manager:", POOL_MANAGER);
        console.log("");

        // Ensure tokens are sorted (currency0 < currency1)
        address currency0 = SEPOLIA_WBTC < SEPOLIA_USDC ? SEPOLIA_WBTC : SEPOLIA_USDC;
        address currency1 = SEPOLIA_WBTC < SEPOLIA_USDC ? SEPOLIA_USDC : SEPOLIA_WBTC;

        console.log("Sorted tokens:");
        console.log("  currency0:", currency0);
        console.log("  currency1:", currency1);
        console.log("");

        // Check common fee tiers
        uint24[4] memory fees = [uint24(100), uint24(500), uint24(3000), uint24(10000)];
        int24[4] memory tickSpacings = [int24(1), int24(10), int24(60), int24(200)];

        for (uint256 i = 0; i < fees.length; i++) {
            console.log("-------------------------------------------");
            console.log("Checking fee:", fees[i], "tickSpacing:", uint24(tickSpacings[i]));

            PoolKey memory key = PoolKey({
                currency0: Currency.wrap(currency0),
                currency1: Currency.wrap(currency1),
                fee: fees[i],
                tickSpacing: tickSpacings[i],
                hooks: IHooks(address(0))
            });

            PoolId poolId = key.toId();
            console.log("PoolId:", vm.toString(PoolId.unwrap(poolId)));

            // Try to get the slot0
            try this.getPoolSlot0(key) returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee) {
                if (sqrtPriceX96 > 0) {
                    console.log("  POOL EXISTS!");
                    console.log("  sqrtPriceX96:", sqrtPriceX96);
                    console.log("  tick:", tick);
                    console.log("  protocolFee:", protocolFee);
                    console.log("  lpFee:", lpFee);

                    // Get liquidity
                    uint128 liquidity = poolManager.getLiquidity(poolId);
                    console.log("  liquidity:", liquidity);

                    if (liquidity > 0) {
                        console.log("  >>> HAS LIQUIDITY! <<<");
                    } else {
                        console.log("  >>> Pool initialized but NO LIQUIDITY <<<");
                    }
                } else {
                    console.log("  Pool not initialized (sqrtPriceX96 = 0)");
                }
            } catch {
                console.log("  Pool does not exist or query failed");
            }
            console.log("");
        }

        console.log("=============================================");
        console.log("Done checking pools");
        console.log("=============================================");
    }
}

