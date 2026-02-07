// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";
import {Arkana} from "../src/Arkana.sol";
import {TLswapRegister} from "../src/tl-limit/TLswapRegister.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {PoolKey} from "../lib/v4-core/src/types/PoolKey.sol";
import {Currency} from "../lib/v4-core/src/types/Currency.sol";
import {IHooks} from "../lib/v4-core/src/interfaces/IHooks.sol";

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

    function test_ExecuteSwapIntent() public {
        // ============= VALUES FROM FRONTEND CONSOLE LOG =============
        bytes32 orderId = 0x2c2e320d2e17e949ff704244b5b3dc8d93dc095bae14b342c6b81ae7e2e1600f;
        uint256 chunkIndex = 0;
        address intentor = 0x1b756A927EF0D4849025887f520be10a5A9137c1;
        address tokenAddress = 0x29f2D40B0605204364af54EC677bD022dA425d03;
        uint256 sharesAmount = 100000000;
        address tokenIn = 0x29f2D40B0605204364af54EC677bD022dA425d03;
        address tokenOut = 0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c;
        uint256 amountOutMin = 100000;
        uint16 slippageBps = 50;
        uint256 deadline = 1773033540;
        uint256 executionFeeBps = 10;
        address recipient = 0x1b756A927EF0D4849025887f520be10a5A9137c1;
        uint256 drandRound = 14304442;
        bytes memory swapCalldata = "";
        address swapTarget = 0x3A9D48AB9751398BbFa63ad67599Bb04e4BdF98b;
        uint256 prevHash = 19993463783780640396212792579661695366922507527881475622508770417227445270927;
        uint256 nextHash = 3287037616482411681311412834349852813926118796454729779522855064065344126255;
        // ================================================================

        console.log("\n========== TLswapRegister Debug ==========");

        // Check TLswapRegister state
        address uniswapRouter = tlswapRegister.uniswapRouter();
        console.log("Configured uniswapRouter:", uniswapRouter);

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
            console.log("  Hash", i, ":", vm.toString(orderHashes[i]));
        }

        // Check hash nodes used
        bool hashNodeUsed = tlswapRegister.usedHashChainNodes(prevHash);
        console.log("Prev hash node used:", hashNodeUsed);

        console.log("\n========== Attempting executeSwapIntent ==========");

        vm.prank(intentor);
        try tlswapRegister.executeSwapIntent(
            orderId,
            chunkIndex,
            intentor,
            tokenAddress,
            sharesAmount,
            tokenIn,
            tokenOut,
            amountOutMin,
            slippageBps,
            deadline,
            executionFeeBps,
            recipient,
            drandRound,
            swapCalldata,
            swapTarget,
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
                // SwapFailed() = 0x81ceff30
                // InvalidOrderHash() = ...
                if (selector == bytes4(keccak256("SwapFailed()"))) {
                    console.log("Error: SwapFailed - either router is 0x0 or swap call failed");
                } else if (selector == bytes4(keccak256("InvalidOrderHash()"))) {
                    console.log("Error: InvalidOrderHash - hash mismatch");
                } else if (selector == bytes4(keccak256("OrderChunkNotFound()"))) {
                    console.log("Error: OrderChunkNotFound - no hashes registered");
                } else if (selector == bytes4(keccak256("HashChainNodeAlreadyUsed()"))) {
                    console.log("Error: HashChainNodeAlreadyUsed - already executed");
                }
            }

            // Re-throw
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

        // Create PoolKey (using common fee tier 3000 = 0.3%, tick spacing 60)
        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: 3000, // 0.3% fee
            tickSpacing: 60, // Common tick spacing for 0.3% pools
            hooks: IHooks(address(0)) // No hooks
        });

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
}
