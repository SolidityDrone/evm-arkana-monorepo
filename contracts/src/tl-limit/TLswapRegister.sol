// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@oz/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@oz/contracts/utils/ReentrancyGuard.sol";
import {Arkana} from "../Arkana.sol";

/**
 * @title TLswapRegister
 * @notice Registry for executing timelocked encrypted swap intents
 * @dev Parameters (sharesAmount, amountOutMin, slippage, deadline, recipient, tokenOut) are encrypted in timelock ciphertext
 *      Executor decrypts off-chain and calls executeSwapIntent with decrypted parameters
 *      Uses amountOutMin as target - swaps all available tokens (from shares) to achieve best output
 */
contract TLswapRegister is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Arkana contract address
    Arkana public immutable arkana;

    /// @notice Owner address (for fee collection)
    address public owner;

    /// @notice Protocol fee in basis points (default 0, can be set by owner)
    uint256 public protocolFeeBps;

    /// @notice Maximum slippage allowed (in basis points, default 1000 = 10%)
    uint256 public constant MAX_SLIPPAGE_BPS = 1000;

    /// @notice dRand evmnet configuration (hardcoded)
    struct DrandInfo {
        bytes publicKey;      // Public key hex string
        uint256 period;       // Period in seconds
        uint256 genesisTime;  // Genesis timestamp
        bytes genesisSeed;    // Genesis seed hex string
        bytes chainHash;      // Chain hash hex string
        string scheme;        // Scheme name
        string beaconId;      // Beacon ID
    }

    /// @notice Mapping from orderId to encrypted ciphertext
    /// @dev orderId is keccak256(ciphertext) for uniqueness
    mapping(bytes32 => bytes) public encryptedOrders;

    /// @notice Events
    event EncryptedOrderRegistered(
        bytes32 indexed orderId,
        address indexed registrant,
        bytes ciphertext
    );

    event SwapIntentExecuted(
        bytes32 indexed intentId,
        address indexed executor,
        address indexed intentor,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    /// @notice Errors
    error InvalidSlippage();
    error InvalidAmounts();
    error InvalidCiphertext();
    error SwapFailed();
    error OnlyOwner();
    error InvalidDeadline();
    error IntentExpired();
    error InvalidRound();
    error OnlyArkana();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyArkana() {
        if (msg.sender != address(arkana)) revert OnlyArkana();
        _;
    }

    constructor(address _arkana) {
        arkana = Arkana(_arkana);
        owner = msg.sender;
    }

    /**
     * @notice Get dRand evmnet configuration
     * @return DrandInfo struct with hardcoded evmnet configuration
     */
    function getDrandInfos() external pure returns (DrandInfo memory) {
        return DrandInfo({
            publicKey: hex"07e1d1d335df83fa98462005690372c643340060d205306a9aa8106b6bd0b3820557ec32c2ad488e4d4f6008f89a346f18492092ccc0d594610de2732c8b808f0095685ae3a85ba243747b1b2f426049010f6b73a0cf1d389351d5aaaa1047f6297d3a4f9749b33eb2d904c9d9ebf17224150ddd7abd7567a9bec6c74480ee0b",
            period: 3,
            genesisTime: 1727521075,
            genesisSeed: hex"cd7ad2f0e0cce5d8c288f2dd016ffe7bc8dc88dbb229b3da2b6ad736490dfed6",
            chainHash: hex"04f1e9062b8a81f848fded9c12306733282b2727ecced50032187751166ec8c3",
            scheme: "bls-bn254-unchained-on-g1",
            beaconId: "evmnet"
        });
    }

    /**
     * @notice Register an encrypted order
     * @dev Called by users to register encrypted swap orders
     *      The ciphertext contains encrypted order parameters (sharesAmount, amountOutMin, slippage, deadline, recipient, tokenOut)
     *      and optionally the next order's ciphertext in a nested encryption chain
     * @param ciphertext The encrypted order data (AES-128 encrypted JSON)
     * @return orderId Unique identifier for the registered order
     */
    function registerEncryptedOrder(bytes calldata ciphertext) external returns (bytes32 orderId) {
        if (ciphertext.length == 0) {
            revert InvalidCiphertext();
        }

        // Generate unique orderId from ciphertext
        orderId = keccak256(ciphertext);

        // Store encrypted order
        encryptedOrders[orderId] = ciphertext;

        emit EncryptedOrderRegistered(orderId, msg.sender, ciphertext);

        return orderId;
    }

    /**
     * @notice Get encrypted order by ID
     * @param orderId The order identifier
     * @return ciphertext The encrypted order data
     */
    function getEncryptedOrder(bytes32 orderId) external view returns (bytes memory) {
        return encryptedOrders[orderId];
    }

    /**
     * @notice Execute a swap intent
     * @dev Called by off-chain executor after decrypting the intent from timelock ciphertext
     * @dev Uses amountOutMin as target - swaps all available tokens to achieve best output
     * @param intentId Unique identifier for the intent (hash of encrypted data)
     * @param intentor Address that created the intent (from Arkana withdraw)
     * @param tokenAddress Token address (for Arkana vault operations)
     * @param sharesAmount Amount of shares to withdraw from Arkana (encrypted in ciphertext)
     * @param tokenIn Token to swap from
     * @param tokenOut Token to swap to
     * @param amountOutMin Minimum amount out (target for swap)
     * @param slippageBps Slippage in basis points (0-255, representing 0-2.55%)
     * @param deadline Deadline timestamp (uint24, max ~194 days)
     * @param executionFeeBps Execution fee in basis points (paid to executor)
     * @param recipient Address to receive swapped tokens
     * @param drandRound dRand round when intent becomes decryptable
     * @param swapCalldata The calldata to execute the swap (e.g., Uniswap Universal Router)
     * @param swapTarget The target contract for the swap (e.g., Universal Router address)
     * @return amountOut The amount of tokens received by the recipient (after fees)
     */
    function executeSwapIntent(
        bytes32 intentId,
        address intentor,
        address tokenAddress,
        uint256 sharesAmount,
        address tokenIn,
        address tokenOut,
        uint256 amountOutMin,
        uint8 slippageBps,
        uint24 deadline,
        uint256 executionFeeBps,
        address recipient,
        uint256 drandRound,
        bytes calldata swapCalldata,
        address swapTarget
    ) external nonReentrant returns (uint256 amountOut) {
        // Validate deadline
        if (deadline <= block.timestamp) {
            revert IntentExpired();
        }

        // Validate amountOutMin is set
        if (amountOutMin == 0) {
            revert InvalidAmounts();
        }

        // Validate slippage (max 2.55% = 255 bps)
        if (slippageBps > MAX_SLIPPAGE_BPS) {
            revert InvalidSlippage();
        }

        // Validate round is available (intent is decryptable)
        if (!_isRoundAvailable(drandRound)) {
            revert InvalidRound();
        }

        // Validate tokens
        if (tokenIn == address(0) || tokenOut == address(0) || tokenIn == tokenOut) {
            revert InvalidAmounts();
        }

        // Withdraw tokens from Arkana vault using sharesAmount
        // This calls Arkana's function that withdraws from Aave and sends tokens to this contract
        arkana.withdrawForSwap(tokenAddress, sharesAmount, address(this));

        // Get the actual amount received (use all available tokens for swap)
        uint256 availableAmount = IERC20(tokenIn).balanceOf(address(this));
        
        if (availableAmount == 0) {
            revert InvalidAmounts();
        }

        // Approve swap target to spend all available tokens
        IERC20(tokenIn).approve(swapTarget, 0);
        IERC20(tokenIn).approve(swapTarget, availableAmount);

        // Get balance before swap (swap should send tokens to this contract)
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));

        // Execute swap - use all available tokens to get best output
        // NOTE: The swapCalldata must be configured to send output tokens to address(this),
        // NOT to the recipient directly. The contract will distribute fees and remaining tokens.
        (bool success,) = swapTarget.call(swapCalldata);
        if (!success) {
            revert SwapFailed();
        }

        // Get balance after swap
        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        amountOut = balanceAfter - balanceBefore;

        // Validate we got at least amountOutMin (with slippage tolerance)
        // Calculate minimum acceptable output considering slippage
        uint256 minAcceptableOut = (amountOutMin * (10000 - slippageBps)) / 10000;
        if (amountOut < minAcceptableOut) {
            revert InvalidSlippage();
        }

        // Calculate and deduct fees from amountOut
        uint256 totalFees = 0;
        
        // Calculate execution fee (if any)
        if (executionFeeBps > 0) {
            uint256 executionFeeAmount = (amountOut * executionFeeBps) / 10000;
            if (executionFeeAmount > 0) {
                IERC20(tokenOut).safeTransfer(msg.sender, executionFeeAmount);
                totalFees += executionFeeAmount;
            }
        }

        // Calculate protocol fee (if any)
        if (protocolFeeBps > 0) {
            uint256 protocolFeeAmount = (amountOut * protocolFeeBps) / 10000;
            if (protocolFeeAmount > 0) {
                IERC20(tokenOut).safeTransfer(owner, protocolFeeAmount);
                totalFees += protocolFeeAmount;
            }
        }

        // Transfer remaining tokens to recipient
        uint256 recipientAmount = amountOut - totalFees;
        if (recipientAmount > 0) {
            IERC20(tokenOut).safeTransfer(recipient, recipientAmount);
        }

        emit SwapIntentExecuted(
            intentId,
            msg.sender,
            intentor,
            tokenIn,
            tokenOut,
            availableAmount,
            recipientAmount
        );

        return recipientAmount;
    }

    /**
     * @notice Set protocol fee (only owner)
     * @param _protocolFeeBps Protocol fee in basis points
     */
    function setProtocolFee(uint256 _protocolFeeBps) external onlyOwner {
        if (_protocolFeeBps > 1000) revert InvalidSlippage(); // Max 10%
        protocolFeeBps = _protocolFeeBps;
    }

    /**
     * @notice Transfer ownership (only owner)
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAmounts();
        owner = newOwner;
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    /**
     * @notice Get current dRand round (evmnet)
     * @return Current round number
     */
    function _getCurrentDrandRound() internal view returns (uint256) {
        uint256 genesisTime = 1727521075; // evmnet genesis
        uint256 period = 3; // 3 seconds
        if (block.timestamp < genesisTime) return 0;
        return (block.timestamp - genesisTime) / period;
    }

    /**
     * @notice Check if a dRand round is available
     * @param targetRound The target round
     * @return True if round is available
     */
    function _isRoundAvailable(uint256 targetRound) internal view returns (bool) {
        return targetRound <= _getCurrentDrandRound();
    }
}
