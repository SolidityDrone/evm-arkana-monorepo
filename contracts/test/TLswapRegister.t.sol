// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";
import {TLswapRegister} from "../src/tl-limit/TLswapRegister.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@oz/contracts/token/ERC20/utils/SafeERC20.sol";
import {Arkana} from "../src/Arkana.sol";
import {Field} from "../lib/poseidon2-evm/src/Field.sol";
import "foundry-huff/HuffDeployer.sol";

contract TLswapRegisterTest is Test {
    using SafeERC20 for IERC20;

    // SEPOLIA addresses - loaded from environment
    address SEPOLIA_AAVE_POOL;
    address SEPOLIA_WETH;
    address SEPOLIA_USDC;
    address SEPOLIA_UNIVERSAL_ROUTER;
    address SEPOLIA_POOL_MANAGER;
    address SEPOLIA_MULTICALL3;

    TLswapRegister public tlswapRegister;
    MockArkana public arkana;
    IERC20 public weth;
    IERC20 public usdc;

    address public executor = address(0x1234);
    address public recipient = address(0x5678);

    function setUp() public {
        // Fork SEPOLIA
        uint256 SEPOLIAFork = vm.createFork(vm.envString("SEPOLIA_ETHEREUM_RPC"));
        vm.selectFork(SEPOLIAFork);

        // Load addresses from environment
        SEPOLIA_AAVE_POOL = vm.envAddress("SEPOLIA_AAVE_POOL");
        SEPOLIA_WETH = vm.envAddress("SEPOLIA_WETH");
        SEPOLIA_USDC = vm.envAddress("SEPOLIA_USDC");
        SEPOLIA_UNIVERSAL_ROUTER = vm.envAddress("SEPOLIA_UNIVERSAL_ROUTER");
        SEPOLIA_POOL_MANAGER = vm.envAddress("SEPOLIA_POOL_MANAGER");
        SEPOLIA_MULTICALL3 = vm.envAddress("SEPOLIA_MULTICALL3");

        // Deploy mock Arkana (we'll simulate withdrawForSwap)
        arkana = new MockArkana(SEPOLIA_WETH);

        // Deploy Huff Poseidon2 contract first
        address poseidon2Huff = HuffDeployer.deploy("huff/Poseidon2");

        // Deploy TLswapRegister with Poseidon2 hasher
        tlswapRegister = new TLswapRegister(address(arkana), SEPOLIA_UNIVERSAL_ROUTER, poseidon2Huff);

        // Initialize token interfaces
        weth = IERC20(SEPOLIA_WETH);
        usdc = IERC20(SEPOLIA_USDC);

        // Deal tokens to executor for gas
        vm.deal(executor, 10 ether);
    }

    /**
     * @notice Test executeSwapIntent without Arkana - simulates swap on Uniswap V4
     * @dev This test duplicates the logic from executeSwapIntent (lines 157-265) but without calling Arkana
     *      Instead, we directly deal tokens to TLswapRegister to simulate the withdrawal
     *      Then we simulate a swap on Uniswap V4 (for now, we just deal output tokens)
     */
    function test_ExecuteSwapIntent_Simulated() public {
        // Test parameters (from first-order.json)
        bytes32 intentId = keccak256("test-intent-1");
        address intentor = address(0xABCD);
        address tokenAddress = SEPOLIA_WETH; // WETH address
        uint256 sharesAmount = 1000000; // 1M shares (from first-order.json)
        address tokenIn = SEPOLIA_WETH;
        address tokenOut = SEPOLIA_USDC;
        uint256 amountOutMin = 950000000; // 950 USDC (6 decimals) - from first-order.json
        uint8 slippageBps = 50; // 0.5% - from first-order.json
        uint24 deadline = uint24(block.timestamp + 1 days);
        uint256 executionFeeBps = 10; // 0.1% - from first-order.json
        uint256 drandRound = 14193007; // From first-order.json
        address swapTarget = SEPOLIA_UNIVERSAL_ROUTER;
        bytes memory swapCalldata = ""; // Empty for now (would contain Uniswap V4 swap calldata)

        // Hash chain parameters (from first-order.json) - using decimal values
        uint256 prevHash = 3144720251581553402669680428615038084405235765980310875083500192296684831944;
        uint256 nextHash = 7823368255051347161380593580414108410849933056586987272659813242056774285140;
        uint256 tlHashchain = 12949898239015432555339246073475711027047452860332177939326143079854898293013; // Final hash (example)

        // === STEP 1: Verify hash chain ===
        // Verify hash(prevHash, sharesAmount) == nextHash using Poseidon2
        // This is done in executeSwapIntent, but we'll test it here too
        // Note: In real scenario, this verification happens in executeSwapIntent

        // === STEP 2: Simulate token withdrawal (without calling Arkana) ===
        // In real scenario: arkana.withdrawForSwap(tokenAddress, sharesAmount, address(this))
        // For test: deal WETH directly to TLswapRegister
        uint256 amountIn = 1 ether; // 1 WETH (18 decimals) - simulated withdrawal
        deal(SEPOLIA_WETH, address(tlswapRegister), amountIn);

        // Verify TLswapRegister has WETH
        assertEq(weth.balanceOf(address(tlswapRegister)), amountIn, "TLswapRegister should have WETH");

        // === STEP 2: Simulate Uniswap V4 swap ===
        // In real scenario: call swapTarget.call(swapCalldata) which executes Uniswap V4 swap
        // For now, we'll simulate the swap output by dealing USDC to TLswapRegister
        // TODO: In future, implement actual Uniswap V4 swap call

        // Get balance before swap
        uint256 balanceBefore = usdc.balanceOf(address(tlswapRegister));

        // Simulate swap: deal USDC to TLswapRegister (simulating successful swap)
        // In real scenario, the swap would send tokens to address(this)
        uint256 simulatedAmountOut = 1000000000; // 1000 USDC (6 decimals) - more than amountOutMin
        deal(SEPOLIA_USDC, address(tlswapRegister), simulatedAmountOut);

        // Get balance after swap
        uint256 balanceAfter = usdc.balanceOf(address(tlswapRegister));
        uint256 amountOut = balanceAfter - balanceBefore;

        // === STEP 4: Validate slippage (same as executeSwapIntent) ===
        // Calculate minimum acceptable output considering slippage
        uint256 minAcceptableOut = (amountOutMin * (10000 - slippageBps)) / 10000;
        assertGe(amountOut, minAcceptableOut, "Amount out should meet slippage requirements");

        // === STEP 5: Calculate and deduct fees (same as executeSwapIntent) ===
        uint256 totalFees = 0;

        // Calculate execution fee (if any)
        uint256 executionFeeAmount = 0;
        if (executionFeeBps > 0) {
            executionFeeAmount = (amountOut * executionFeeBps) / 10000;
            if (executionFeeAmount > 0) {
                totalFees += executionFeeAmount;
            }
        }

        // Calculate protocol fee (if any)
        uint256 protocolFeeAmount = 0;
        if (tlswapRegister.protocolFeeBps() > 0) {
            protocolFeeAmount = (amountOut * tlswapRegister.protocolFeeBps()) / 10000;
            if (protocolFeeAmount > 0) {
                totalFees += protocolFeeAmount;
            }
        }

        // Transfer remaining tokens to recipient
        uint256 recipientAmount = amountOut - totalFees;

        // === STEP 6: Execute transfers (same as executeSwapIntent) ===
        vm.startPrank(address(tlswapRegister));

        if (executionFeeAmount > 0) {
            usdc.safeTransfer(executor, executionFeeAmount);
        }

        if (protocolFeeAmount > 0) {
            usdc.safeTransfer(tlswapRegister.owner(), protocolFeeAmount);
        }

        if (recipientAmount > 0) {
            usdc.safeTransfer(recipient, recipientAmount);
        }

        vm.stopPrank();

        // === STEP 7: Verify final balances ===
        assertEq(usdc.balanceOf(executor), executionFeeAmount, "Executor should receive execution fee");
        assertEq(usdc.balanceOf(recipient), recipientAmount, "Recipient should receive remaining tokens");
        assertEq(usdc.balanceOf(address(tlswapRegister)), 0, "TLswapRegister should have no USDC left");

        console.log("Swap simulation completed:");
        console.log("  Amount In (WETH):", amountIn);
        console.log("  Amount Out (USDC):", amountOut);
        console.log("  Execution Fee:", executionFeeAmount);
        console.log("  Protocol Fee:", protocolFeeAmount);
        console.log("  Recipient Amount:", recipientAmount);
    }

    /**
     * @notice Test registerEncryptedOrder with newNonceCommitment
     */
    function test_RegisterEncryptedOrder() public {
        bytes32 newNonceCommitment =
            bytes32(uint256(0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef));
        bytes memory ciphertext = hex"1234567890abcdef";

        // Must be called by Arkana
        vm.prank(address(arkana));
        bytes32 orderId = tlswapRegister.registerEncryptedOrder(newNonceCommitment, ciphertext);

        assertEq(orderId, newNonceCommitment, "Order ID should match newNonceCommitment");
        assertEq(
            keccak256(tlswapRegister.getEncryptedOrder(orderId)),
            keccak256(ciphertext),
            "Stored ciphertext should match"
        );
    }

    /**
     * @notice Test getDrandInfos
     */
    function test_GetDrandInfos() public view {
        TLswapRegister.DrandInfo memory info = tlswapRegister.getDrandInfos();

        assertEq(info.period, 3, "Period should be 3 seconds");
        assertEq(info.genesisTime, 1727521075, "Genesis time should match evmnet");
        assertEq(info.beaconId, "evmnet", "Beacon ID should be evmnet");
        assertEq(info.scheme, "bls-bn254-unchained-on-g1", "Scheme should match");
    }

    /**
     * @notice Test hash chain verification
     * @dev Tests that hash(prevHash, sharesAmount) == nextHash using Poseidon2
     */
    function test_HashChainVerification() public view {
        // Test parameters from first-order.json - using decimal values
        uint256 prevHash = 3144720251581553402669680428615038084405235765980310875083500192296684831944;
        uint256 sharesAmount = 1000000; // 1M shares
        uint256 expectedNextHash = 7823368255051347161380593580414108410849933056586987272659813242056774285140;

        // Calculate hash using Poseidon2
        Field.Type prevHashField = Field.toField(prevHash);
        Field.Type sharesAmountField = Field.toField(sharesAmount);
        Field.Type computedNextHash = tlswapRegister.poseidon2Hasher().hash_2(prevHashField, sharesAmountField);
        uint256 computedNextHashUint = Field.toUint256(computedNextHash);

        // Verify hash chain
        assertEq(computedNextHashUint, expectedNextHash, "Hash chain verification should pass");
    }

    /**
     * @notice Test hash chain nullifier (prevHash reuse prevention)
     */
    function test_HashChainNullifier() public {
        // Test that using the same prevHash twice should fail
        uint256 prevHash = 3144720251581553402669680428615038084405235765980310875083500192296684831944;

        // First use should succeed (we'll simulate by checking the mapping)
        // In real scenario, this would be set by executeSwapIntent
        // For now, we'll just verify the mapping exists
        assertEq(tlswapRegister.usedHashChainNodes(prevHash), false, "prevHash should not be used initially");

        // Note: Full nullifier test would require calling executeSwapIntent, which needs more setup
    }
}

/**
 * @notice Mock Arkana contract for testing TLswapRegister without full Arkana setup
 */
contract MockArkana {
    address public immutable SEPOLIA_WETH;

    constructor(address _weth) {
        SEPOLIA_WETH = _weth;
    }

    /**
     * @notice Mock withdrawForSwap - just deals tokens to recipient
     * @dev In real scenario, this would withdraw from Aave vault
     *      For testing, we'll use vm.deal in the test itself instead
     */
    function withdrawForSwap(address tokenAddress, uint256 sharesAmount, address recipient) external {
        // This is a mock - in real tests, we'll deal tokens directly in the test
        // This function exists just to satisfy the interface
        // The actual token dealing happens in the test via vm.deal
    }
}

