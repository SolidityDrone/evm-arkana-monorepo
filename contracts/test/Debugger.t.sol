// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";
import {Arkana} from "../src/Arkana.sol";
import {TLswapRegister} from "../src/tl-limit/TLswapRegister.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {PoolKey} from "../lib/v4-core/src/types/PoolKey.sol";
import {Currency} from "../lib/v4-core/src/types/Currency.sol";
import {IHooks} from "../lib/v4-core/src/interfaces/IHooks.sol";
import {SwapDirective} from "../src/tl-limit/TLswapRegister.sol";

// Interfaces needed for swap and LP
interface IUniversalRouter {
    function execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline) external payable;
}

interface IPermit2 {
    function approve(address token, address spender, uint160 amount, uint48 expiration) external;
}

interface IPositionManager {
    struct MintParams {
        PoolKey poolKey;
        int24 tickLower;
        int24 tickUpper;
        uint256 liquidity;
        uint256 amount0Max;
        uint256 amount1Max;
        address owner;
        bytes hookData;
    }

    function mint(MintParams calldata params, uint256 deadline, address recipient)
        external
        payable
        returns (uint256 tokenId, uint128 liquidityMinted, uint256 amount0, uint256 amount1);
}

// Struct for V4 swap params - ExactInput
struct V4ExactInputSingleParams {
    PoolKey poolKey;
    bool zeroForOne;
    uint128 amountIn;
    uint128 amountOutMinimum;
    bytes hookData;
}

// Struct for V4 swap params - ExactOutput
struct V4ExactOutputSingleParams {
    PoolKey poolKey;
    bool zeroForOne;
    uint128 amountOut;
    uint128 amountInMaximum;
    bytes hookData;
}

contract Debugger is Test {
    Arkana public arkana;
    TLswapRegister public tlswapRegister;

    // Hardcoded values - UPDATE THESE AFTER REDEPLOYMENT
    address constant ARKANA_ADDRESS = 0x8d56f39e73B0e17671A0eCDce277A9cdeEb665cc;
    address constant TLSWAP_REGISTER_ADDRESS = 0x9841806AC68865af1FDE1033e04cC4241D4f911b;
    address constant SENDER = 0x1EC8CC0Ba36450965392A35dF50BeC69b14Fdd59;
    address constant TOKEN_ADDRESS = 0x29f2D40B0605204364af54EC677bD022dA425d03;
    uint256 constant AMOUNT_IN = 100; // 1 WBTC
    uint256 constant LOCK_DURATION = 0;

    // Sepolia V4 addresses
    address constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
    address constant POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;

    function setUp() public {
        arkana = Arkana(ARKANA_ADDRESS);
        tlswapRegister = TLswapRegister(TLSWAP_REGISTER_ADDRESS);
        console.log("Arkana contract address:", ARKANA_ADDRESS);
        console.log("TLswapRegister address:", TLSWAP_REGISTER_ADDRESS);
    }

    function test_InitializeFromJSON() public {
        // Hardcoded public inputs from JSON
        bytes32[] memory publicInputs = new bytes32[](7);
        publicInputs[0] = 0x00000000000000000000000029f2D40B0605204364af54EC677bD022dA425d03; // tokenAddress
        publicInputs[1] = 0x0000000000000000000000000000000000000000000000000000000000aa36a7; // chainId (11155111)
        publicInputs[2] = 0x22330c0705754a5c3b3ba28b3e18603ae8bb168d923801e12e86ea06bcb4cd74; // balanceCommitmentX
        publicInputs[3] = 0x11de7f20af7eda00fd71b8c8fbb630b82a14d50de4989ec3b523e89322967415; // balanceCommitmentY
        publicInputs[4] = 0x02b981915136531135416d9c9586966a931f7cccf3fe81201259e05f6af158c9; // newNonceCommitment
        publicInputs[5] = 0x11f778e39baa13c1b1dfb322d3325dc158f7bc1e8440f10430c129b81f683ec8; // nonceDiscoveryEntryX
        publicInputs[6] = 0x0808aa015a30c810d14b74c536683315c2fda4a81113208888475712db0d78d7; // nonceDiscoveryEntryY

        console.log("Token address:", TOKEN_ADDRESS);
        console.log("Amount in:", AMOUNT_IN);
        console.log("Lock duration:", LOCK_DURATION);
        console.log("Chain ID from publicInputs:", uint256(publicInputs[1]));
        console.log("Block chainid:", block.chainid);

        // Check conditions before calling
        address vaultAddress = arkana.tokenVaults(TOKEN_ADDRESS);
        console.log("Vault address:", vaultAddress);
        console.log("Vault initialized:", vaultAddress != address(0));

        bool commitmentUsed = arkana.usedCommitments(publicInputs[4]);
        console.log("Commitment used:", commitmentUsed);

        // Give tokens to this contract (the test contract) using deal
        deal(TOKEN_ADDRESS, SENDER, AMOUNT_IN * 2); // Give 2x to be safe

        uint256 balance = IERC20(TOKEN_ADDRESS).balanceOf(SENDER);
        uint256 allowance = IERC20(TOKEN_ADDRESS).allowance(SENDER, address(arkana));
        console.log("Token balance (after deal):", balance);
        console.log("Token allowance:", allowance);
        console.log("Amount required:", AMOUNT_IN);

        // Grant approval if needed
        if (allowance < AMOUNT_IN) {
            console.log("\nApproving tokens...");
            IERC20(TOKEN_ADDRESS).approve(address(arkana), AMOUNT_IN);
            console.log("Approval granted");

            // Verify approval
            uint256 newAllowance = IERC20(TOKEN_ADDRESS).allowance(SENDER, address(arkana));
            console.log("New allowance:", newAllowance);
        } else {
            console.log("\nSufficient allowance already set");
        }

        // Use empty proof for now (proof verification is commented out anyway)
        bytes memory proof = "";

        console.log("\nCalling initialize...");
        console.log("Public inputs count:", publicInputs.length);
        vm.prank(SENDER);
        // Call initialize - this will show the revert reason with -vvv
        try arkana.initialize(proof, publicInputs, AMOUNT_IN, LOCK_DURATION) returns (uint256 root) {
            console.log("SUCCESS! Root:", root);
        } catch (bytes memory reason) {
            console.log("REVERTED with reason:");
            console.logBytes(reason);

            // Try to decode common errors
            if (reason.length == 0) {
                console.log("Revert without reason (custom error or require(false))");
            } else if (reason.length == 4) {
                bytes4 selector = bytes4(reason);
                console.log("Error selector:", vm.toString(selector));
            }

            // Re-throw to see full trace
            assembly {
                revert(add(reason, 0x20), mload(reason))
            }
        }
    }

    /**
     * @notice Test executeV4SwapIntent with proper V4 PoolKey
     * @dev This uses the new function that builds Universal Router calldata internally
     */
    function test_ExecuteV4SwapIntent() public {
        // ============= VALUES FROM FRONTEND CONSOLE LOG (LATEST) =============
        bytes32 orderId = 0x2c2e320d2e17e949ff704244b5b3dc8d93dc095bae14b342c6b81ae7e2e1600f;
        uint256 chunkIndex = 0;
        address intentor = 0x1b756A927EF0D4849025887f520be10a5A9137c1;
        address tokenAddress = 0x29f2D40B0605204364af54EC677bD022dA425d03; // Arkana vault token (WBTC)
        uint256 sharesAmount = 100000000;
        address tokenIn = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC
        address tokenOut = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC
        uint256 amountOutMin = 1;
        uint16 slippageBps = 49;
        uint256 deadline = 1777088700;
        uint256 executionFeeBps = 10;
        address recipient = 0x1b756A927EF0D4849025887f520be10a5A9137c1;
        uint256 drandRound = 14301342;
        uint256 prevHash = 19993463783780640396212792579661695366922507527881475622508770417227445270927;
        uint256 nextHash = 3287037616482411681311412834349852813926118796454729779522855064065344126255;
        // ================================================================

        console.log("\n========== TLswapRegister V4 Debug ==========");

        // Check TLswapRegister state
        address uniswapRouter = tlswapRegister.uniswapRouter();
        address permit2Addr = tlswapRegister.permit2();
        address poolManagerAddr = tlswapRegister.poolManager();

        console.log("Configured uniswapRouter:", uniswapRouter);
        console.log("Configured permit2:", permit2Addr);
        console.log("Configured poolManager:", poolManagerAddr);

        // If not set, set them (owner only)
        if (permit2Addr == address(0)) {
            console.log("Setting permit2...");
            vm.prank(tlswapRegister.owner());
            tlswapRegister.setPermit2(PERMIT2);
            console.log("permit2 set to:", PERMIT2);
        }
        if (poolManagerAddr == address(0)) {
            console.log("Setting poolManager...");
            vm.prank(tlswapRegister.owner());
            tlswapRegister.setPoolManager(POOL_MANAGER);
            console.log("poolManager set to:", POOL_MANAGER);
        }

        address arkanaAddr = address(tlswapRegister.arkana());
        console.log("Arkana address in TLswap:", arkanaAddr);

        // Check if order is registered
        bytes memory ciphertext = tlswapRegister.encryptedOrdersByNonce(orderId);
        console.log("Ciphertext length:", ciphertext.length);

        address storedTokenIn = tlswapRegister.orderTokenIn(orderId);
        console.log("Stored tokenIn:", storedTokenIn);

        // Check order hashes
        bytes32[] memory orderHashes = tlswapRegister.getOrderChunkHashes(orderId);
        console.log("Number of stored hashes:", orderHashes.length);
        for (uint256 i = 0; i < orderHashes.length; i++) {
            console.log("  Stored Hash", i, ":", vm.toString(orderHashes[i]));
        }

        // Compute expected hash using same structure as contract
        bytes32 expectedHash = keccak256(
            abi.encode(
                sharesAmount, amountOutMin, slippageBps, deadline, executionFeeBps, recipient, tokenOut, drandRound
            )
        );
        console.log("Computed hash:", vm.toString(expectedHash));
        console.log("Hash match:", orderHashes.length > 0 && orderHashes[0] == expectedHash);

        // Check hash nodes used
        bool hashNodeUsed = tlswapRegister.usedHashChainNodes(prevHash);
        console.log("Prev hash node used:", hashNodeUsed);

        // Build PoolKey for V4 swap
        // Note: currency0 must be < currency1 (sorted by address)
        address currency0;
        address currency1;
        bool zeroForOne;

        if (uint160(tokenIn) < uint160(tokenOut)) {
            currency0 = tokenIn;
            currency1 = tokenOut;
            zeroForOne = true; // swapping currency0 -> currency1
        } else {
            currency0 = tokenOut;
            currency1 = tokenIn;
            zeroForOne = false; // swapping currency1 -> currency0
        }

        console.log("\nV4 Pool Key:");
        console.log("  currency0:", currency0);
        console.log("  currency1:", currency1);
        console.log("  zeroForOne:", zeroForOne);

        // Create PoolKey for WBTC/USDC
        // Common fee tiers: 500 (0.05%) with tickSpacing 10, or 3000 (0.3%) with tickSpacing 60
        // Using 3000/60 as default - adjust if pool uses different fee tier
        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: 3000, // 0.3% fee (common for WBTC/USDC)
            tickSpacing: 60, // Tick spacing for 0.3% pools
            hooks: IHooks(address(0)) // No hooks
        });

        console.log("  fee:", poolKey.fee);
        console.log("  tickSpacing:", poolKey.tickSpacing);

        console.log("\n========== Attempting executeV4SwapIntent ==========");

        vm.prank(intentor);
        try tlswapRegister.executeV4SwapIntent(
            orderId,
            chunkIndex,
            intentor,
            tokenAddress,
            sharesAmount,
            poolKey,
            amountOutMin,
            slippageBps,
            deadline,
            executionFeeBps,
            recipient,
            drandRound,
            prevHash,
            nextHash
        ) returns (
            uint256 amountOut
        ) {
            console.log("SUCCESS! Amount out:", amountOut);
        } catch (bytes memory reason) {
            console.log("REVERTED!");
            console.logBytes(reason);

            // Decode error selector
            if (reason.length >= 4) {
                bytes4 selector;
                assembly {
                    selector := mload(add(reason, 32))
                }
                console.log("Error selector:", vm.toString(selector));

                // Known selectors
                if (selector == bytes4(keccak256("SwapFailed()"))) {
                    console.log("Error: SwapFailed - router call failed (maybe no V4 pool exists for these tokens)");
                } else if (selector == bytes4(keccak256("InvalidOrderHash()"))) {
                    console.log("Error: InvalidOrderHash - V4 hash params don't match stored hash");
                } else if (selector == bytes4(keccak256("OrderChunkNotFound()"))) {
                    console.log("Error: OrderChunkNotFound - no hashes registered");
                } else if (selector == bytes4(keccak256("HashChainNodeAlreadyUsed()"))) {
                    console.log("Error: HashChainNodeAlreadyUsed - already executed");
                } else if (selector == bytes4(keccak256("InvalidAmounts()"))) {
                    console.log("Error: InvalidAmounts - tokenIn not in pool or zero tokens");
                }
            }

            // Re-throw
            assembly {
                revert(add(reason, 0x20), mload(reason))
            }
        }
    }

    /**
     * @notice Test executeLiquidityProvision with provided parameters
     * @dev This tests the liquidity provision flow including swap to get second token
     */
    function test_ExecuteLiquidityProvision() public {
        // ============= VALUES FROM FRONTEND CONSOLE LOG =============
        bytes32 orderId = 0x2c2e320d2e17e949ff704244b5b3dc8d93dc095bae14b342c6b81ae7e2e1600f;
        uint256 chunkIndex = 0;
        address tokenAddress = 0x29f2D40B0605204364af54EC677bD022dA425d03;
        uint256 sharesAmount = 100000000;

        // PoolKey - Using WBTC/USDC pool that exists on Sepolia
        // Found pools: fee=100/tickSpacing=1 OR fee=3000/tickSpacing=60 (both have liquidity)
        // Using fee=3000/tickSpacing=60 to match swap directive
        address currency0 = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC
        address currency1 = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC
        uint24 fee = 3000; // 0.3% fee - matches existing pool
        int24 tickSpacing = 60; // Tick spacing for 0.3% pools
        address hooks = 0x0000000000000000000000000000000000000000;

        // Tick bounds must be divisible by tickSpacing (60)
        // Full range: -887220 to 887220 (both divisible by 60)
        int24 tickLower = -887220; // Full range lower bound
        int24 tickUpper = 887220; // Full range upper bound
        uint256 amount0Max = 100000000; // 1 WBTC (8 decimals)
        uint256 amount1Max = 0; // Single-sided from vault

        // Swap directive (to get second token for LP) - uses underlying amounts
        // Swap 50% of withdrawn WBTC to get USDC
        uint256 swapAmountIn = 50000000; // 0.5 WBTC (8 decimals) = 50% of 1 WBTC
        uint256 swapAmountOutMin = 1; // Minimum USDC output (6 decimals) - very low, just for testing
        uint16 swapSlippageBps = 100; // 1% slippage
        address swapTokenOut = currency1; // Swap WBTC -> USDC
        uint24 swapPoolFee = 3000; // Use same pool fee as LP pool

        uint256 deadline = 1773078660;
        uint256 executionFeeBps = 10;
        address recipient = 0x1b756A927EF0D4849025887f520be10a5A9137c1;
        uint256 drandRound = 14309902;
        bytes memory hookData = "";
        uint256 prevHash = 19993463783780640396212792579661695366922507527881475622508770417227445270927;
        uint256 nextHash = 3287037616482411681311412834349852813926118796454729779522855064065344126255;
        // ================================================================

        console.log("\n========== TLswapRegister Liquidity Provision Debug ==========");

        // Check TLswapRegister state
        address uniswapRouter = tlswapRegister.uniswapRouter();
        address permit2Addr = tlswapRegister.permit2();
        address poolManagerAddr = tlswapRegister.poolManager();
        address positionManagerAddr = tlswapRegister.positionManager();

        console.log("Configured uniswapRouter:", uniswapRouter);
        console.log("Configured permit2:", permit2Addr);
        console.log("Configured poolManager:", poolManagerAddr);
        console.log("Configured positionManager:", positionManagerAddr);

        // If not set, set them (owner only)
        if (permit2Addr == address(0)) {
            console.log("Setting permit2...");
            vm.prank(tlswapRegister.owner());
            tlswapRegister.setPermit2(PERMIT2);
            console.log("permit2 set to:", PERMIT2);
        }
        if (poolManagerAddr == address(0)) {
            console.log("Setting poolManager...");
            vm.prank(tlswapRegister.owner());
            tlswapRegister.setPoolManager(POOL_MANAGER);
            console.log("poolManager set to:", POOL_MANAGER);
        }
        if (positionManagerAddr == address(0)) {
            console.log("Setting positionManager...");
            vm.prank(tlswapRegister.owner());
            // Using Sepolia PositionManager address
            tlswapRegister.setPositionManager(0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4);
            console.log("positionManager set");
        }

        address arkanaAddr = address(tlswapRegister.arkana());
        console.log("Arkana address in TLswap:", arkanaAddr);

        // Check if order is registered
        bytes memory ciphertext = tlswapRegister.encryptedOrdersByNonce(orderId);
        console.log("Ciphertext length:", ciphertext.length);

        address storedTokenIn = tlswapRegister.orderTokenIn(orderId);
        console.log("Stored tokenIn:", storedTokenIn);

        TLswapRegister.OperationType opType = tlswapRegister.orderOperationType(orderId);
        console.log("Operation type:", uint8(opType));

        // Check order hashes
        bytes32[] memory orderHashes = tlswapRegister.getOrderChunkHashes(orderId);
        console.log("Number of stored hashes:", orderHashes.length);
        for (uint256 i = 0; i < orderHashes.length; i++) {
            console.log("  Stored Hash", i, ":", vm.toString(orderHashes[i]));
        }

        // Compute expected hash for liquidity order (including swap directive)
        bytes32 poolKeyHash = keccak256(abi.encode(currency0, currency1, fee, tickSpacing, hooks));
        bytes32 expectedHash = keccak256(
            abi.encode(
                sharesAmount,
                poolKeyHash,
                tickLower,
                tickUpper,
                amount0Max,
                amount1Max,
                swapAmountIn,
                swapAmountOutMin,
                swapSlippageBps,
                swapTokenOut,
                deadline,
                executionFeeBps,
                recipient,
                drandRound
            )
        );
        console.log("Computed hash:", vm.toString(expectedHash));
        console.log("Hash match:", orderHashes.length > 0 && orderHashes[0] == expectedHash);

        // Check hash nodes used
        bool hashNodeUsed = tlswapRegister.usedHashChainNodes(prevHash);
        console.log("Prev hash node used:", hashNodeUsed);

        // Build PoolKey
        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: fee,
            tickSpacing: tickSpacing,
            hooks: IHooks(hooks)
        });

        console.log("\nPool Key:");
        console.log("  currency0:", currency0);
        console.log("  currency1:", currency1);
        console.log("  fee:", fee);
        console.log("  tickSpacing:", tickSpacing);
        console.log("  hooks:", hooks);

        console.log("\nLiquidity Parameters:");
        console.log("  tickLower:", tickLower);
        console.log("  tickUpper:", tickUpper);
        console.log("  amount0Max:", amount0Max);
        console.log("  amount1Max:", amount1Max);

        console.log("\nSwap Directive (Pre-LP):");
        console.log("  swapAmountIn:", swapAmountIn);
        console.log("  swapAmountOutMin:", swapAmountOutMin);
        console.log("  swapSlippageBps:", swapSlippageBps);
        console.log("  swapTokenOut:", swapTokenOut);

        // Build SwapDirective struct (EXACT_OUT swap)
        SwapDirective memory swapDirective = SwapDirective({
            amountOut: swapAmountIn, // Use as amountOut for EXACT_OUT
            amountInMax: swapAmountOutMin, // Use as amountInMax
            slippageBps: swapSlippageBps,
            tokenOut: swapTokenOut,
            poolFee: swapPoolFee
        });

        console.log("\n========== Attempting executeLiquidityProvision ==========");
        console.log("This will:");
        console.log("  1. Withdraw shares from Arkana");
        console.log("  2. Execute swap directive to get second token");
        console.log("  3. Mint liquidity position");
        console.log("  4. Transfer NFT to recipient");

        vm.prank(recipient);
        try tlswapRegister.executeLiquidityProvision(
            orderId,
            chunkIndex,
            tokenAddress,
            sharesAmount,
            poolKey,
            tickLower,
            tickUpper,
            amount0Max,
            amount1Max,
            swapDirective,
            deadline,
            executionFeeBps,
            recipient,
            drandRound,
            hookData,
            prevHash,
            nextHash
        ) returns (
            uint256 tokenId
        ) {
            console.log("SUCCESS! Position NFT tokenId:", tokenId);
        } catch (bytes memory reason) {
            console.log("REVERTED!");
            console.logBytes(reason);

            // Decode error selector
            if (reason.length >= 4) {
                bytes4 selector;
                assembly {
                    selector := mload(add(reason, 32))
                }
                console.log("Error selector:", vm.toString(selector));

                // Known selectors for liquidity provision
                if (selector == bytes4(keccak256("LiquidityProvisionFailed()"))) {
                    console.log("Error: LiquidityProvisionFailed - PositionManager.mint() failed");
                    console.log("  Possible reasons:");
                    console.log("    - Pool not initialized (PoolNotInitialized)");
                    console.log("    - Insufficient tokens after swap");
                    console.log("    - Invalid tick range");
                    console.log("    - Amount exceeds max");
                } else if (selector == bytes4(keccak256("InvalidOrderHash()"))) {
                    console.log("Error: InvalidOrderHash - hash mismatch");
                } else if (selector == bytes4(keccak256("OrderChunkNotFound()"))) {
                    console.log("Error: OrderChunkNotFound - no hashes registered");
                } else if (selector == bytes4(keccak256("HashChainNodeAlreadyUsed()"))) {
                    console.log("Error: HashChainNodeAlreadyUsed - already executed");
                } else if (selector == bytes4(keccak256("InvalidPoolKey()"))) {
                    console.log("Error: InvalidPoolKey - zero address in pool key");
                } else if (selector == bytes4(keccak256("InvalidRound()"))) {
                    console.log("Error: InvalidRound - drand round not available yet");
                } else if (selector == bytes4(keccak256("IntentExpired()"))) {
                    console.log("Error: IntentExpired - deadline passed");
                }
            }

            // Re-throw to see full trace
            assembly {
                revert(add(reason, 0x20), mload(reason))
            }
        }
    }

    /**
     * @notice Simple test: Swap directive -> Add liquidity (no order validation)
     * @dev This tests just the swap + LP flow without TLswap order stuff
     * @dev Uses VERY small amounts to work with low-liquidity testnet pools
     */
    function test_SimpleSwapAndAddLiquidity() public {
        // ============= PARAMETERS =============
        address tokenIn = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC
        address tokenOut = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC

        // PoolKey for WBTC/USDC - use fee=3000, tickSpacing=60 (the pool that exists)
        address currency0 = tokenIn < tokenOut ? tokenIn : tokenOut;
        address currency1 = tokenIn < tokenOut ? tokenOut : tokenIn;
        bool zeroForOne = (tokenIn == currency0);

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: 3000, // 0.3% fee - matches existing WBTC/USDC pool
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });

        // Swap directive - USE VERY SMALL AMOUNTS for testnet pool with low liquidity
        // Pool liquidity is ~7.6e9, so use tiny amounts
        uint256 swapAmountIn = 1000; // 0.00001 WBTC (8 decimals) - very small!
        uint256 swapAmountOutMin = 1; // Minimum USDC (6 decimals)
        uint16 swapSlippageBps = 500; // 5% slippage for low-liquidity pool

        // Liquidity parameters - must be divisible by tickSpacing (60)
        int24 tickLower = -887220; // Full range, divisible by 60
        int24 tickUpper = 887220; // Full range, divisible by 60

        uint256 deadline = block.timestamp + 3600;
        address recipient = address(this);

        // Sepolia addresses - hardcoded since we're testing on fork
        address positionManager = 0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4;
        address uniswapRouter = 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b; // Sepolia Universal Router
        address permit2Addr = 0x000000000022D473030F116dDEE9F6B43aC78BA3; // Permit2 (same on all chains)
        // ======================================

        console.log("\n========== Simple Swap + Add Liquidity Test ==========");
        console.log("TokenIn (WBTC):", tokenIn);
        console.log("TokenOut (USDC):", tokenOut);
        console.log("Currency0:", currency0);
        console.log("Currency1:", currency1);
        console.log("zeroForOne:", zeroForOne);
        console.log("Swap Amount In:", swapAmountIn);
        console.log("Pool Fee:", poolKey.fee);
        console.log("Tick Spacing:", poolKey.tickSpacing);
        console.log("Universal Router:", uniswapRouter);
        console.log("Permit2:", permit2Addr);
        console.log("");

        // Step 1: Deal tokens to this contract
        // Deal 0.0001 WBTC to this contract (small amount for testnet)
        deal(tokenIn, address(this), 10000); // 0.0001 WBTC (8 decimals)
        uint256 wbtcBalance = IERC20(tokenIn).balanceOf(address(this));
        console.log("WBTC balance after deal:", wbtcBalance);

        // Step 2: Execute swap (WBTC -> USDC)
        console.log("\n--- Executing Swap ---");
        IERC20(tokenIn).approve(permit2Addr, type(uint256).max);

        IPermit2(permit2Addr).approve(tokenIn, uniswapRouter, uint160(swapAmountIn), uint48(block.timestamp + 3600));

        // Calculate minimum acceptable output with slippage
        // For minAcceptableOut = 0 when swapAmountOutMin is very small
        uint256 minAcceptableOut = (swapAmountOutMin * (10000 - swapSlippageBps)) / 10000;
        if (minAcceptableOut == 0) minAcceptableOut = 0; // Allow 0 for testing
        console.log("Min acceptable out:", minAcceptableOut);

        // Build V4 swap command
        bytes memory commands = abi.encodePacked(uint8(0x10)); // V4_SWAP
        bytes[] memory inputs = new bytes[](1);

        // Encode actions: SWAP_EXACT_IN_SINGLE + SETTLE_ALL + TAKE_ALL
        bytes memory actions = abi.encodePacked(uint8(0x06), uint8(0x0c), uint8(0x0f));

        // Prepare params
        bytes[] memory params = new bytes[](3);

        // Param 0: ExactInputSingleParams
        params[0] = abi.encode(
            V4ExactInputSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                amountIn: uint128(swapAmountIn),
                amountOutMinimum: uint128(minAcceptableOut),
                hookData: bytes("")
            })
        );

        // Param 1: SETTLE_ALL (currency, maxAmount)
        Currency settleCurrency = zeroForOne ? poolKey.currency0 : poolKey.currency1;
        params[1] = abi.encode(settleCurrency, swapAmountIn);

        // Param 2: TAKE_ALL (currency, minAmount) - NOT (token, recipient, amount)!
        // The recipient is implicitly msg.sender, and we just specify minimum
        Currency takeCurrency = zeroForOne ? poolKey.currency1 : poolKey.currency0;
        params[2] = abi.encode(takeCurrency, minAcceptableOut);

        inputs[0] = abi.encode(actions, params);

        console.log("Executing swap via Universal Router...");

        // Execute swap
        uint256 usdcBalanceBefore = IERC20(tokenOut).balanceOf(address(this));
        IUniversalRouter(uniswapRouter).execute(commands, inputs, deadline);
        uint256 usdcBalanceAfter = IERC20(tokenOut).balanceOf(address(this));
        uint256 usdcReceived = usdcBalanceAfter - usdcBalanceBefore;

        console.log("Swap successful!");
        console.log("USDC received from swap:", usdcReceived);

        // Step 3: Get final balances
        uint256 wbtcRemaining = IERC20(tokenIn).balanceOf(address(this));
        uint256 usdcAvailable = IERC20(tokenOut).balanceOf(address(this));

        console.log("\n--- Balances before LP ---");
        console.log("WBTC remaining:", wbtcRemaining);
        console.log("USDC available:", usdcAvailable);

        // Step 4: Add liquidity
        console.log("\n--- Adding Liquidity ---");

        // Determine which token is token0 and token1
        address token0 = currency0;
        address token1 = currency1;
        uint256 available0 = (tokenIn == token0) ? wbtcRemaining : usdcAvailable;
        uint256 available1 = (tokenIn == token0) ? usdcAvailable : wbtcRemaining;

        console.log("Token0 address:", token0);
        console.log("Token1 address:", token1);

        console.log("Available token0:", available0);
        console.log("Available token1:", available1);

        // Approve PositionManager
        IERC20(token0).approve(positionManager, available0);
        IERC20(token1).approve(positionManager, available1);

        // Calculate liquidity (simplified - use minimum, PositionManager will handle actual calculation)
        uint256 liquidityAmount = available0 < available1 ? available0 : available1;

        // Mint liquidity position
        IPositionManager.MintParams memory mintParams = IPositionManager.MintParams({
            poolKey: poolKey,
            tickLower: tickLower,
            tickUpper: tickUpper,
            liquidity: liquidityAmount,
            amount0Max: available0,
            amount1Max: available1,
            owner: address(this),
            hookData: bytes("")
        });

        (uint256 tokenId, uint128 liquidityMinted, uint256 amount0, uint256 amount1) =
            IPositionManager(positionManager).mint(mintParams, deadline, recipient);

        console.log(" Liquidity Position Created!");
        console.log("  TokenId:", tokenId);
        console.log("  Liquidity Minted:", liquidityMinted);
        console.log("  Amount0 (WBTC) used:", amount0);
        console.log("  Amount1 (USDC) used:", amount1);

        // Final balances
        console.log("\n--- Final Balances ---");
        console.log("WBTC remaining:", IERC20(tokenIn).balanceOf(address(this)));
        console.log("USDC remaining:", IERC20(tokenOut).balanceOf(address(this)));
        console.log("Token0 remaining:", IERC20(token0).balanceOf(address(this)));
        console.log("Token1 remaining:", IERC20(token1).balanceOf(address(this)));
    }

    /**
     * @notice Test SWAP_EXACT_OUT: Specify how much output you want, pay variable input
     * @dev This is useful when you need a specific amount of the output token
     */
    function test_SwapExactOut() public {
        // ============= PARAMETERS =============
        address tokenIn = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC (8 decimals)
        address tokenOut = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC (6 decimals)

        // PoolKey for WBTC/USDC - fee=3000, tickSpacing=60
        address currency0 = tokenIn < tokenOut ? tokenIn : tokenOut;
        address currency1 = tokenIn < tokenOut ? tokenOut : tokenIn;
        bool zeroForOne = (tokenIn == currency0);

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });

        // EXACT_OUT: We want exactly 100000 USDC units (0.1 USDC)
        uint256 amountOut = 100000; // 0.1 USDC (6 decimals)
        uint256 amountInMaximum = 10000; // Max 0.0001 WBTC we're willing to pay (8 decimals)

        uint256 deadline = block.timestamp + 3600;

        // Sepolia addresses
        address uniswapRouter = 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b;
        address permit2Addr = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
        // ======================================

        console.log("\n========== SWAP_EXACT_OUT Test ==========");
        console.log("TokenIn (WBTC):", tokenIn);
        console.log("TokenOut (USDC):", tokenOut);
        console.log("Desired amount OUT:", amountOut);
        console.log("Max amount IN:", amountInMaximum);
        console.log("zeroForOne:", zeroForOne);
        console.log("");

        // Deal tokens
        deal(tokenIn, address(this), amountInMaximum * 2); // Extra buffer
        console.log("WBTC balance:", IERC20(tokenIn).balanceOf(address(this)));

        // Approve
        IERC20(tokenIn).approve(permit2Addr, type(uint256).max);
        IPermit2(permit2Addr).approve(tokenIn, uniswapRouter, uint160(amountInMaximum), uint48(block.timestamp + 3600));

        // Build V4 swap command with SWAP_EXACT_OUT_SINGLE
        bytes memory commands = abi.encodePacked(uint8(0x10)); // V4_SWAP
        bytes[] memory inputs = new bytes[](1);

        // Actions: SWAP_EXACT_OUT_SINGLE (0x08) + SETTLE_ALL (0x0c) + TAKE_ALL (0x0f)
        bytes memory actions = abi.encodePacked(uint8(0x08), uint8(0x0c), uint8(0x0f));

        bytes[] memory params = new bytes[](3);

        // Param 0: ExactOutputSingleParams
        params[0] = abi.encode(
            V4ExactOutputSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                amountOut: uint128(amountOut),
                amountInMaximum: uint128(amountInMaximum),
                hookData: bytes("")
            })
        );

        // Param 1: SETTLE_ALL (currency we're paying with, max amount)
        Currency settleCurrency = zeroForOne ? poolKey.currency0 : poolKey.currency1;
        params[1] = abi.encode(settleCurrency, amountInMaximum);

        // Param 2: TAKE_ALL (currency we're receiving, amount we want)
        Currency takeCurrency = zeroForOne ? poolKey.currency1 : poolKey.currency0;
        params[2] = abi.encode(takeCurrency, amountOut);

        inputs[0] = abi.encode(actions, params);

        console.log("Executing SWAP_EXACT_OUT...");

        uint256 wbtcBefore = IERC20(tokenIn).balanceOf(address(this));
        uint256 usdcBefore = IERC20(tokenOut).balanceOf(address(this));

        IUniversalRouter(uniswapRouter).execute(commands, inputs, deadline);

        uint256 wbtcAfter = IERC20(tokenIn).balanceOf(address(this));
        uint256 usdcAfter = IERC20(tokenOut).balanceOf(address(this));

        console.log("Swap successful!");
        console.log("WBTC spent:", wbtcBefore - wbtcAfter);
        console.log("USDC received:", usdcAfter - usdcBefore);
        console.log("Expected USDC:", amountOut);

        // Verify we got exactly what we asked for
        assertEq(usdcAfter - usdcBefore, amountOut, "Should receive exact amount requested");
    }

    /**
     * @notice Test SWAP_EXACT_OUT + Add Liquidity to same pool
     * @dev Full flow: swap to get second token, then add LP
     */
    function test_SwapExactOutAndAddLiquidity() public {
        // ============= PARAMETERS =============
        address tokenIn = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC (8 decimals)
        address tokenOut = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC (6 decimals)

        address currency0 = tokenIn < tokenOut ? tokenIn : tokenOut;
        address currency1 = tokenIn < tokenOut ? tokenOut : tokenIn;
        bool zeroForOne = (tokenIn == currency0);

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });

        // We have WBTC, want to get some USDC for LP
        // EXACT_OUT: Get enough USDC for balanced LP
        // At price ~27,490 USDC/WBTC, for 1000 WBTC units we need ~274,000 USDC units
        uint256 amountOutDesired = 300000; // 0.3 USDC (enough for LP)
        uint256 amountInMaximum = 15000; // Max WBTC to spend for swap

        uint256 deadline = block.timestamp + 3600;

        address uniswapRouter = 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b;
        address permit2Addr = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
        // ======================================

        console.log("\n========== SWAP_EXACT_OUT + Add Liquidity ==========");

        // Deal WBTC - need enough for swap + LP
        deal(tokenIn, address(this), 100000); // 0.001 WBTC (100k units with 8 decimals)
        console.log("Initial WBTC:", IERC20(tokenIn).balanceOf(address(this)));

        // Approve
        IERC20(tokenIn).approve(permit2Addr, type(uint256).max);
        IPermit2(permit2Addr).approve(tokenIn, uniswapRouter, uint160(amountInMaximum), uint48(block.timestamp + 3600));

        // === STEP 1: SWAP_EXACT_OUT ===
        console.log("\n--- Step 1: SWAP_EXACT_OUT ---");
        {
            bytes memory commands = abi.encodePacked(uint8(0x10));
            bytes[] memory inputs = new bytes[](1);
            bytes memory actions = abi.encodePacked(uint8(0x08), uint8(0x0c), uint8(0x0f));
            bytes[] memory params = new bytes[](3);

            params[0] = abi.encode(
                V4ExactOutputSingleParams({
                    poolKey: poolKey,
                    zeroForOne: zeroForOne,
                    amountOut: uint128(amountOutDesired),
                    amountInMaximum: uint128(amountInMaximum),
                    hookData: bytes("")
                })
            );

            Currency settleCurrency = zeroForOne ? poolKey.currency0 : poolKey.currency1;
            params[1] = abi.encode(settleCurrency, amountInMaximum);

            Currency takeCurrency = zeroForOne ? poolKey.currency1 : poolKey.currency0;
            params[2] = abi.encode(takeCurrency, amountOutDesired);

            inputs[0] = abi.encode(actions, params);

            IUniversalRouter(uniswapRouter).execute(commands, inputs, deadline);
        }

        uint256 wbtcRemaining = IERC20(tokenIn).balanceOf(address(this));
        uint256 usdcReceived = IERC20(tokenOut).balanceOf(address(this));
        console.log("WBTC remaining after swap:", wbtcRemaining);
        console.log("USDC received:", usdcReceived);

        // === STEP 2: Add Liquidity via V4 PositionManager ===
        console.log("\n--- Step 2: Add Liquidity ---");

        address token0 = currency0;
        address token1 = currency1;
        uint256 available0 = (tokenIn == token0) ? wbtcRemaining : usdcReceived;
        uint256 available1 = (tokenIn == token0) ? usdcReceived : wbtcRemaining;

        console.log("Available token0 for LP:", available0);
        console.log("Available token1 for LP:", available1);

        address positionManager = 0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4;

        // Approve PositionManager via Permit2 for both tokens
        IERC20(token0).approve(permit2Addr, type(uint256).max);
        IERC20(token1).approve(permit2Addr, type(uint256).max);
        IPermit2(permit2Addr).approve(token0, positionManager, uint160(available0), uint48(block.timestamp + 3600));
        IPermit2(permit2Addr).approve(token1, positionManager, uint160(available1), uint48(block.timestamp + 3600));

        // Tick bounds - use narrow range around current tick (56167)
        // Must be divisible by tickSpacing (60)
        // Current tick is 56167, so use 56160 ± some range
        int24 tickLower = 56160 - 600; // 55560
        int24 tickUpper = 56160 + 600; // 56760

        // Calculate liquidity from amounts (simplified)
        uint256 liquidity = available0 < available1 ? available0 : available1;

        // Build modifyLiquidities call with MINT_POSITION action
        // Actions: MINT_POSITION (0x02) + SETTLE_PAIR (0x0d)
        bytes memory actions = abi.encodePacked(uint8(0x02), uint8(0x0d));
        bytes[] memory params = new bytes[](2);

        // Param 0: MintParams - (poolKey, tickLower, tickUpper, liquidity, amount0Max, amount1Max, owner, hookData)
        params[0] = abi.encode(
            poolKey,
            tickLower,
            tickUpper,
            liquidity,
            uint128(available0),
            uint128(available1),
            address(this), // owner
            bytes("") // hookData
        );

        // Param 1: SETTLE_PAIR (currency0, currency1)
        params[1] = abi.encode(poolKey.currency0, poolKey.currency1);

        // Encode the full unlockData
        bytes memory unlockData = abi.encode(actions, params);

        console.log("Calling modifyLiquidities...");
        console.log("  Liquidity:", liquidity);
        console.log("  tickLower:", tickLower);
        console.log("  tickUpper:", tickUpper);

        try IPositionManagerV4(positionManager).modifyLiquidities(unlockData, deadline) {
            console.log("Liquidity added successfully!");
        } catch Error(string memory reason) {
            console.log("Failed with reason:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("Failed with low-level error");
            console.logBytes(lowLevelData);
        }

        console.log("\n--- Final Balances ---");
        console.log("WBTC remaining:", IERC20(tokenIn).balanceOf(address(this)));
        console.log("USDC remaining:", IERC20(tokenOut).balanceOf(address(this)));
    }

    /**
     * @notice Debug test with exact frontend parameters
     */
    function test_DebugFrontendParams() public {
        // ===== EXACT FRONTEND PARAMETERS =====
        bytes32 orderId = 0x2c2e320d2e17e949ff704244b5b3dc8d93dc095bae14b342c6b81ae7e2e1600f;
        uint256 chunkIndex = 0;
        address tokenAddress = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC
        uint256 sharesAmount = 100000000;

        address currency0 = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC
        address currency1 = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });

        int24 tickLower = 55560;
        int24 tickUpper = 56760;
        uint256 amount0Max = 100000000;
        uint256 amount1Max = 0;

        // Swap directive - EXACT_OUT
        uint256 swapAmountOut = 300000; // 0.3 USDC (6 decimals)
        uint256 swapAmountInMax = 15000; // Max 0.00015 WBTC (8 decimals)
        uint16 swapSlippageBps = 500;
        address swapTokenOut = currency1; // USDC
        uint24 swapPoolFee = 3000;

        uint256 deadline = 1768006800;
        uint256 executionFeeBps = 10;
        address recipient = 0x1b756A927EF0D4849025887f520be10a5A9137c1;

        address uniswapRouter = 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b;
        address permit2Addr = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

        console.log("\n========== DEBUG FRONTEND PARAMS ==========");
        console.log("TokenAddress (WBTC):", tokenAddress);
        console.log("SharesAmount:", sharesAmount);
        console.log("Pool fee:", poolKey.fee);
        console.log("TickLower:", tickLower);
        console.log("TickUpper:", tickUpper);
        console.log("SwapAmountOut:", swapAmountOut);
        console.log("SwapAmountInMax:", swapAmountInMax);
        console.log("SwapSlippageBps:", swapSlippageBps);
        console.log("SwapTokenOut:", swapTokenOut);
        console.log("");

        // Check pool exists and has liquidity
        address poolManager = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;
        bytes32 poolId = keccak256(abi.encode(poolKey));
        console.log("PoolId:", vm.toString(poolId));

        // Get pool state
        bytes32 slot0Data = vm.load(poolManager, keccak256(abi.encode(poolId, uint256(6))));
        console.log("Slot0 raw data:", vm.toString(slot0Data));

        // Simulate having WBTC (what we'd get after withdrawFromArkana)
        // SharesAmount = 100000000 (1 WBTC in 8 decimals)
        deal(tokenAddress, address(this), sharesAmount);
        uint256 wbtcBalance = IERC20(tokenAddress).balanceOf(address(this));
        console.log("WBTC balance after deal:", wbtcBalance);

        // Now try the EXACT_OUT swap
        console.log("\n--- Testing SWAP_EXACT_OUT ---");

        // Approve
        IERC20(tokenAddress).approve(permit2Addr, type(uint256).max);
        IPermit2(permit2Addr)
            .approve(tokenAddress, uniswapRouter, uint160(swapAmountInMax), uint48(block.timestamp + 3600));

        // Build swap command
        bytes memory commands = abi.encodePacked(uint8(0x10)); // V4_SWAP
        bytes[] memory inputs = new bytes[](1);

        // SWAP_EXACT_OUT_SINGLE (0x08) + SETTLE_ALL (0x0c) + TAKE_ALL (0x0f)
        bytes memory actions = abi.encodePacked(uint8(0x08), uint8(0x0c), uint8(0x0f));
        bytes[] memory params = new bytes[](3);

        bool zeroForOne = true; // WBTC (currency0) -> USDC (currency1)

        // Param 0: ExactOutputSingleParams
        params[0] = abi.encode(
            V4ExactOutputSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                amountOut: uint128(swapAmountOut),
                amountInMaximum: uint128(swapAmountInMax),
                hookData: bytes("")
            })
        );

        // Param 1: SETTLE_ALL (input currency, max amount)
        Currency settleCurrency = poolKey.currency0; // WBTC
        params[1] = abi.encode(settleCurrency, swapAmountInMax);

        // Param 2: TAKE_ALL (output currency, amount)
        Currency takeCurrency = poolKey.currency1; // USDC
        params[2] = abi.encode(takeCurrency, swapAmountOut);

        inputs[0] = abi.encode(actions, params);

        console.log("Executing swap...");

        uint256 usdcBefore = IERC20(swapTokenOut).balanceOf(address(this));

        try IUniversalRouter(uniswapRouter).execute(commands, inputs, block.timestamp + 3600) {
            uint256 usdcAfter = IERC20(swapTokenOut).balanceOf(address(this));
            uint256 wbtcRemaining = IERC20(tokenAddress).balanceOf(address(this));
            console.log("Swap SUCCESS!");
            console.log("USDC received:", usdcAfter - usdcBefore);
            console.log("WBTC remaining:", wbtcRemaining);
        } catch Error(string memory reason) {
            console.log("Swap FAILED with reason:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("Swap FAILED with low-level error");
            console.logBytes(lowLevelData);

            // Decode common errors
            if (lowLevelData.length >= 4) {
                bytes4 selector = bytes4(lowLevelData);
                console.log("Error selector:", vm.toString(bytes32(selector)));

                if (selector == bytes4(0x8b063d73)) {
                    console.log("ERROR: V4TooLittleReceived - amountInMax too low for the requested amountOut");
                }
            }
        }

        console.log("\n--- Check Pool Price ---");
        // Calculate expected input for 300000 USDC output
        // At current tick 56167, price is roughly 1 WBTC = 27490 USDC
        // So for 0.3 USDC, we need ~0.3/27490 WBTC = ~0.0000109 WBTC = ~1090 units
        console.log("Expected: For 300000 USDC units (0.3 USDC), need ~1100 WBTC units");
        console.log("Provided: swapAmountInMax = 15000 WBTC units");
        console.log("This should be enough headroom (15000 > 1100)");
    }

    /**
     * @notice Test TLswapRegister.executeLiquidityProvision with exact frontend params
     */
    function test_TLswapRegister_ExecuteLiquidityProvision_Frontend() public {
        // ===== EXACT FRONTEND PARAMETERS (LATEST) =====
        bytes32 orderId = 0x2c2e320d2e17e949ff704244b5b3dc8d93dc095bae14b342c6b81ae7e2e1600f;
        uint256 chunkIndex = 0;
        address tokenAddress = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC
        uint256 sharesAmount = 100000000;

        address currency0 = 0x29f2D40B0605204364af54EC677bD022dA425d03; // WBTC
        address currency1 = 0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8; // USDC

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: 3000,
            tickSpacing: 60,
            hooks: IHooks(address(0))
        });

        int24 tickLower = 55560;
        int24 tickUpper = 56760;
        uint256 amount0Max = 100000000;
        uint256 amount1Max = 300000000; // 300 USDC (6 decimals)

        // Swap directive - EXACT_OUT
        SwapDirective memory swapDirective = SwapDirective({
            amountOut: 300000, // 0.3 USDC (6 decimals)
            amountInMax: 50000000, // Max 0.5 WBTC (8 decimals)
            slippageBps: 500,
            tokenOut: currency1, // USDC
            poolFee: 3000
        });

        uint256 deadline = 1773125760;
        uint256 executionFeeBps = 10;
        address recipient = 0x1b756A927EF0D4849025887f520be10a5A9137c1;
        uint256 drandRound = 13581662;
        bytes memory hookData = "";
        uint256 prevHash = 19993463783780640396212792579661695366922507527881475622508770417227445270927;
        uint256 nextHash = 3287037616482411681311412834349852813926118796454729779522855064065344126255;

        console.log("\n========== TLswapRegister executeLiquidityProvision Debug ==========");
        console.log("OrderId:", vm.toString(orderId));
        console.log("TokenAddress:", tokenAddress);
        console.log("SharesAmount:", sharesAmount);
        console.log("SwapAmountOut:", swapDirective.amountOut);
        console.log("SwapAmountInMax:", swapDirective.amountInMax);
        console.log("");

        // Get TLswapRegister from environment
        address tlswapRegisterAddr = vm.envAddress("TLSWAP_REGISTER");
        TLswapRegister register = TLswapRegister(tlswapRegisterAddr);

        console.log("TLswapRegister address:", tlswapRegisterAddr);
        console.log("Arkana address:", address(register.arkana()));
        console.log("UniswapRouter:", register.uniswapRouter());
        console.log("PositionManager:", register.positionManager());
        console.log("");

        // Check if order exists
        console.log("--- Checking Order State ---");
        bytes32[] memory storedHashes = register.getOrderChunkHashes(orderId);
        console.log("Number of chunks:", storedHashes.length);

        if (storedHashes.length == 0) {
            console.log("ERROR: No order registered for this orderId!");
            console.log("The order needs to be created first via withdraw circuit.");
            revert("Order not found");
        }

        if (chunkIndex >= storedHashes.length) {
            console.log("ERROR: chunkIndex out of range!");
            revert("Chunk index out of range");
        }

        console.log("Stored hash for chunk:", vm.toString(storedHashes[chunkIndex]));

        // Verify hash chain would work
        console.log("\n--- Hash Chain Verification ---");
        console.log("prevHash:", prevHash);
        console.log("nextHash:", nextHash);

        // Check if prevHash is already used
        bool prevHashUsed = register.usedHashChainNodes(prevHash);
        console.log("prevHash already used:", prevHashUsed);
        if (prevHashUsed) {
            console.log("ERROR: This hash chain node was already used!");
            revert("Hash already used");
        }

        // Check drand round
        console.log("\n--- Drand Round Check ---");
        console.log("drandRound:", drandRound);
        // Note: Can't easily check _isRoundAvailable without knowing implementation

        // Now try to execute
        console.log("\n--- Attempting executeLiquidityProvision ---");

        try register.executeLiquidityProvision(
            orderId,
            chunkIndex,
            tokenAddress,
            sharesAmount,
            poolKey,
            tickLower,
            tickUpper,
            amount0Max,
            amount1Max,
            swapDirective,
            deadline,
            executionFeeBps,
            recipient,
            drandRound,
            hookData,
            prevHash,
            nextHash
        ) returns (
            uint256 tokenId
        ) {
            console.log("SUCCESS! LP Position TokenId:", tokenId);
        } catch Error(string memory reason) {
            console.log("FAILED with reason:", reason);
        } catch (bytes memory lowLevelData) {
            console.log("FAILED with low-level error");
            console.logBytes(lowLevelData);

            // Decode common errors
            if (lowLevelData.length >= 4) {
                bytes4 selector = bytes4(lowLevelData);
                console.log("Error selector:", vm.toString(bytes32(selector)));

                // Known error selectors
                if (selector == bytes4(keccak256("InvalidOrderHash()"))) {
                    console.log("ERROR: InvalidOrderHash - hash params don't match stored hash");
                } else if (selector == bytes4(keccak256("OrderChunkNotFound()"))) {
                    console.log("ERROR: OrderChunkNotFound - no order registered");
                } else if (selector == bytes4(keccak256("HashChainNodeAlreadyUsed()"))) {
                    console.log("ERROR: HashChainNodeAlreadyUsed - already executed");
                } else if (selector == bytes4(keccak256("InvalidHashChain()"))) {
                    console.log("ERROR: InvalidHashChain - poseidon hash mismatch");
                } else if (selector == bytes4(keccak256("InvalidRound()"))) {
                    console.log("ERROR: InvalidRound - drand round not available yet");
                } else if (selector == bytes4(keccak256("LiquidityProvisionFailed()"))) {
                    console.log("ERROR: LiquidityProvisionFailed - LP add failed");
                } else if (selector == bytes4(0x8b063d73)) {
                    console.log("ERROR: V4TooLittleReceived - swap slippage exceeded");
                }
            }
        }
    }
}

// Interface for V4 PositionManager modifyLiquidities
interface IPositionManagerV4 {
    function modifyLiquidities(bytes calldata unlockData, uint256 deadline) external payable;
    function nextTokenId() external view returns (uint256);
}
