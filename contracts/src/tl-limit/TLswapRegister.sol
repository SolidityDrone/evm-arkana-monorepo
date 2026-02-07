// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@oz/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@oz/contracts/utils/ReentrancyGuard.sol";
import {IERC721} from "@oz/contracts/token/ERC721/IERC721.sol";
import {Arkana} from "../Arkana.sol";
import "../merkle/Poseidon2HuffWrapper.sol";
import {Field} from "../../lib/poseidon2-evm/src/Field.sol";
import {Currency} from "../../lib/v4-core/src/types/Currency.sol";
import {IHooks} from "../../lib/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "../../lib/v4-core/src/types/PoolKey.sol";

/// @notice Minimal interface for Universal Router
interface IUniversalRouter {
    function execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline) external payable;
}

/// @notice Minimal interface for Permit2
interface IPermit2 {
    function approve(address token, address spender, uint160 amount, uint48 expiration) external;
}

/// @notice V4 Router Actions (from v4-periphery)
library Actions {
    uint256 internal constant SWAP_EXACT_IN_SINGLE = 0x06;
    uint256 internal constant SWAP_EXACT_OUT_SINGLE = 0x08;
    uint256 internal constant SETTLE_ALL = 0x0c;
    uint256 internal constant TAKE_ALL = 0x0f;
}

/// @notice Universal Router Commands
library Commands {
    uint8 internal constant V4_SWAP = 0x10;
}

/// @notice V4Router ExactOutputSingleParams
struct V4ExactOutputSingleParams {
    PoolKey poolKey;
    bool zeroForOne;
    uint128 amountOut;
    uint128 amountInMaximum;
    bytes hookData;
}

/// @notice V4Router ExactInputSingleParams
struct V4ExactInputSingleParams {
    PoolKey poolKey;
    bool zeroForOne;
    uint128 amountIn;
    uint128 amountOutMinimum;
    bytes hookData;
}

/// @notice Minimal interface for Uniswap V4 PositionManager
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

    function nextTokenId() external view returns (uint256);
}

/**
 * @title TLswapRegister
 * @notice Registry for executing timelocked encrypted operations (swaps and liquidity provision)
 * @dev Parameters are encrypted in timelock ciphertext and validated via keccak256 hash
 *      Supports two operation types:
 *      1. Swap: Exchange tokens via DEX (executeSwapIntent)
 *      2. Liquidity Provision: Add liquidity to Uniswap V4 pools (executeLiquidityProvision)
 *      Hash chain ensures sum of chunk shares = total shares withdrawn in circuit
 */
contract TLswapRegister is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Arkana contract address
    Arkana public arkana;

    /// @notice Poseidon2 hasher for hash chain verification
    Poseidon2HuffWrapper public immutable poseidon2Hasher;

    /// @notice Owner address (for fee collection)
    address public owner;

    /// @notice Protocol fee in basis points (default 0, can be set by owner)
    uint256 public protocolFeeBps;

    /// @notice Maximum slippage allowed (in basis points, default 1000 = 10%)
    uint256 public constant MAX_SLIPPAGE_BPS = 1000;

    address public uniswapRouter;

    /// @notice Uniswap V4 Position Manager address
    address public positionManager;

    /// @notice Permit2 address for token transfers
    address public permit2;

    /// @notice Pool Manager address for V4
    address public poolManager;

    /// @notice Operation type enum
    enum OperationType {
        SWAP,
        LIQUIDITY
    }

    /// @notice Mapping to track used hash chain nodes (prevHash) to prevent chunk reuse
    /// @dev When a chunk is executed, we mark its prevHash as used
    mapping(uint256 => bool) public usedHashChainNodes;

    /// @notice Mapping from newNonceCommitment to encrypted order ciphertext
    /// @dev orderId is now the newNonceCommitment from the withdraw circuit
    mapping(bytes32 => bytes) public encryptedOrdersByNonce;

    /// @notice Mapping from orderId to array of order chunk hashes for integrity validation
    /// @dev Each chunk hash = keccak256(abi.encode(sharesAmount, amountOutMin, slippageBps, deadline, executionFeeBps, recipient, tokenOut, drandRound))
    mapping(bytes32 => bytes32[]) public orderChunkHashes;

    /// @notice Mapping from orderId to tokenIn address (the token being swapped from)
    /// @dev Stored at registration time since tokenIn is not in encrypted payload
    mapping(bytes32 => address) public orderTokenIn;

    /// @notice Mapping from orderId to operation type (SWAP or LIQUIDITY)
    mapping(bytes32 => OperationType) public orderOperationType;

    /// @notice dRand evmnet configuration (hardcoded)
    struct DrandInfo {
        bytes publicKey; // Public key hex string
        uint256 period; // Period in seconds
        uint256 genesisTime; // Genesis timestamp
        bytes genesisSeed; // Genesis seed hex string
        bytes chainHash; // Chain hash hex string
        string scheme; // Scheme name
        string beaconId; // Beacon ID
    }

    /// @notice Events
    event EncryptedOrderRegistered(bytes32 indexed orderId, bytes ciphertextIpfs);

    event SwapIntentExecuted(
        bytes32 indexed intentId,
        address indexed executor,
        address indexed intentor,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    event LiquidityProvisionExecuted(
        bytes32 indexed intentId,
        address indexed executor,
        address indexed recipient,
        uint256 tokenId,
        uint128 liquidityMinted,
        uint256 amount0,
        uint256 amount1
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
    error InvalidHashChain();
    error HashChainNodeAlreadyUsed();
    error InvalidOrderHash();
    error OrderChunkNotFound();
    error LiquidityProvisionFailed();
    error InvalidPoolKey();
    error InvalidOperationType();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier onlyArkana() {
        if (msg.sender != address(arkana)) revert OnlyArkana();
        _;
    }

    constructor(address _arkana, address _uniswapRouter, address _poseidon2Huff) {
        owner = msg.sender;
        uniswapRouter = _uniswapRouter;
        // Initialize Poseidon2 hasher with Huff contract address
        poseidon2Hasher = new Poseidon2HuffWrapper(_poseidon2Huff);
    }

    function setArkana(address _arkana) external onlyOwner {
        arkana = Arkana(_arkana);
    }

    function setPositionManager(address _positionManager) external onlyOwner {
        positionManager = _positionManager;
    }

    function setPermit2(address _permit2) external onlyOwner {
        permit2 = _permit2;
    }

    function setPoolManager(address _poolManager) external onlyOwner {
        poolManager = _poolManager;
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
     * @notice Register an encrypted order (swap or liquidity provision)
     * @dev Called by Arkana contract when is_tl_swap = true in withdraw()
     *      The orderId is the newNonceCommitment from the withdraw circuit
     *      The ciphertext contains encrypted order parameters
     *      For SWAP: (sharesAmount, amountOutMin, slippage, deadline, recipient, tokenOut, executionFeeBps, drandRound)
     *      For LIQUIDITY: (sharesAmount, poolKey, tickLower, tickUpper, deadline, recipient, executionFeeBps, drandRound)
     * @param newNonceCommitment The newNonceCommitment from withdraw circuit (used as orderId)
     * @param ciphertextIpfs The encrypted order data (AES-128 encrypted JSON)
     * @param _orderHashes Array of keccak256 hashes for each order chunk for integrity validation
     * @param _tokenIn The token address being used (stored for executor reference)
     * @param _operationType 0 = SWAP, 1 = LIQUIDITY
     * @return orderId The orderId (same as newNonceCommitment)
     */
    function registerEncryptedOrder(
        bytes32 newNonceCommitment,
        bytes calldata ciphertextIpfs,
        bytes32[] calldata _orderHashes,
        address _tokenIn,
        uint8 _operationType
    ) external returns (bytes32 orderId) {
        if (msg.sender != address(arkana)) {
            revert OnlyArkana();
        }

        if (ciphertextIpfs.length == 0) {
            revert InvalidCiphertext();
        }

        // Use newNonceCommitment as orderId (from withdraw circuit)
        orderId = newNonceCommitment;

        // Store encrypted order by nonce commitment
        encryptedOrdersByNonce[orderId] = ciphertextIpfs;

        // Store order chunk hashes for integrity validation during execution
        if (_orderHashes.length > 0) {
            orderChunkHashes[orderId] = _orderHashes;
        }

        // Store tokenIn for executor reference (not in encrypted payload)
        if (_tokenIn != address(0)) {
            orderTokenIn[orderId] = _tokenIn;
        }

        // Store operation type
        orderOperationType[orderId] = OperationType(_operationType);

        emit EncryptedOrderRegistered(orderId, ciphertextIpfs);

        return orderId;
    }

    /**
     * @notice Get order chunk hashes for an order
     * @param orderId The order identifier (newNonceCommitment)
     * @return Array of chunk hashes
     */
    function getOrderChunkHashes(bytes32 orderId) external view returns (bytes32[] memory) {
        return orderChunkHashes[orderId];
    }

    /**
     * @notice Get encrypted order by nonce commitment (orderId)
     * @param orderId The order identifier (newNonceCommitment from withdraw circuit)
     * @return ciphertext The encrypted order data
     */
    function getEncryptedOrder(bytes32 orderId) external view returns (bytes memory) {
        return encryptedOrdersByNonce[orderId];
    }

    /**
     * @notice Execute a swap intent
     * @dev Called by off-chain executor after decrypting the intent from timelock ciphertext
     * @dev Uses amountOutMin as target - swaps all available tokens to achieve best output
     * @dev Verifies hash chain: hash(prevHash, sharesAmount) == nextHash
     * @dev Verifies order integrity: keccak256(abi.encode(params)) == stored orderChunkHash
     * @param orderId The order identifier (newNonceCommitment from withdraw circuit)
     * @param chunkIndex Index of this chunk in the order (0-indexed)
     * @param intentor Address that created the intent (from Arkana withdraw)
     * @param tokenAddress Token address (for Arkana vault operations)
     * @param sharesAmount Amount of shares to withdraw from Arkana (encrypted in ciphertext)
     * @param tokenIn Token to swap from
     * @param tokenOut Token to swap to
     * @param amountOutMin Minimum amount out (target for swap)
     * @param slippageBps Slippage in basis points (0-1000, representing 0-10%)
     * @param deadline Deadline timestamp
     * @param executionFeeBps Execution fee in basis points (paid to executor)
     * @param recipient Address to receive swapped tokens
     * @param drandRound dRand round when intent becomes decryptable
     * @param swapCalldata The calldata to execute the swap (e.g., Uniswap Universal Router)
     * @param swapTarget The target contract for the swap (e.g., Universal Router address)
     * @param prevHash Previous hash in the hash chain (h_{i-1})
     * @param nextHash Next hash in the hash chain (h_i) - should equal hash(prevHash, sharesAmount)
     * @return amountOut The amount of tokens received by the recipient (after fees)
     */
    function executeSwapIntent(
        bytes32 orderId,
        uint256 chunkIndex,
        address intentor,
        address tokenAddress,
        uint256 sharesAmount,
        address tokenIn,
        address tokenOut,
        uint256 amountOutMin,
        uint16 slippageBps,
        uint256 deadline,
        uint256 executionFeeBps,
        address recipient,
        uint256 drandRound,
        bytes calldata swapCalldata,
        address swapTarget,
        uint256 prevHash,
        uint256 nextHash
    ) external nonReentrant returns (uint256 amountOut) {
        // === ORDER INTEGRITY VALIDATION ===
        // Validate that provided parameters match the stored hash (prevents executor tampering)
        bytes32[] storage storedHashes = orderChunkHashes[orderId];
        if (storedHashes.length == 0) {
            revert OrderChunkNotFound();
        }
        if (chunkIndex >= storedHashes.length) {
            revert OrderChunkNotFound();
        }

        // Compute hash of the provided order parameters
        bytes32 computedHash = keccak256(
            abi.encode(
                sharesAmount, amountOutMin, slippageBps, deadline, executionFeeBps, recipient, tokenOut, drandRound
            )
        );

        // Verify hash matches stored hash
        if (computedHash != storedHashes[chunkIndex]) {
            revert InvalidOrderHash();
        }

        // Validate deadline
        if (deadline <= block.timestamp) {
            revert IntentExpired();
        }

        // Validate amountOutMin is set
        if (amountOutMin == 0) {
            revert InvalidAmounts();
        }

        // Validate slippage (max 10% = 1000 bps)
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

        // Use contract's uniswapRouter if swapTarget is zero address
        address actualSwapTarget = swapTarget;
        if (actualSwapTarget == address(0)) {
            actualSwapTarget = uniswapRouter;
            if (actualSwapTarget == address(0)) {
                revert SwapFailed(); // Neither provided nor configured
            }
        }

        // === HASH CHAIN VERIFICATION ===
        // Verify that prevHash hasn't been used before (nullifier check)
        if (usedHashChainNodes[prevHash]) {
            revert HashChainNodeAlreadyUsed();
        }

        // Verify hash chain: hash(prevHash, sharesAmount) == nextHash
        // This ensures the chunk is part of the correct hash chain
        Field.Type prevHashField = Field.toField(prevHash);
        Field.Type sharesAmountField = Field.toField(sharesAmount);
        Field.Type computedNextHash = poseidon2Hasher.hash_2(prevHashField, sharesAmountField);
        uint256 computedNextHashUint = Field.toUint256(computedNextHash);

        if (computedNextHashUint != nextHash) {
            revert InvalidHashChain();
        }

        // Mark prevHash as used (nullifier) to prevent chunk reuse
        usedHashChainNodes[prevHash] = true;

        // Withdraw tokens from Arkana vault using sharesAmount
        // This calls Arkana's function that withdraws from Aave and sends tokens to this contract
        arkana.withdrawForSwap(tokenAddress, sharesAmount, address(this));

        // Get the actual amount received (use all available tokens for swap)
        uint256 availableAmount = IERC20(tokenIn).balanceOf(address(this));

        if (availableAmount == 0) {
            revert InvalidAmounts();
        }

        // Approve swap target to spend all available tokens
        IERC20(tokenIn).approve(actualSwapTarget, 0);
        IERC20(tokenIn).approve(actualSwapTarget, availableAmount);

        // Get balance before swap (swap should send tokens to this contract)
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));

        // Execute swap - use all available tokens to get best output
        // NOTE: The swapCalldata must be configured to send output tokens to address(this),
        // NOT to the recipient directly. The contract will distribute fees and remaining tokens.
        (bool success,) = actualSwapTarget.call(swapCalldata);
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

        emit SwapIntentExecuted(orderId, msg.sender, intentor, tokenIn, tokenOut, availableAmount, recipientAmount);

        return recipientAmount;
    }

    /**
     * @notice Execute a V4 swap intent using Universal Router with proper calldata encoding
     * @dev This version builds the V4 swap calldata internally using pool parameters
     * @param orderId The order ID (nonce commitment)
     * @param chunkIndex Index of this chunk in the order chain
     * @param intentor The original intent creator
     * @param tokenAddress The Arkana vault token address
     * @param sharesAmount Amount of shares to withdraw
     * @param poolKey V4 pool key for the swap
     * @param amountOutMin Minimum output amount expected
     * @param slippageBps Slippage tolerance in basis points (max 1000 = 10%)
     * @param deadline Unix timestamp for order expiry
     * @param executionFeeBps Fee for executor in basis points
     * @param recipient Address to receive output tokens
     * @param drandRound The dRand round for timelock verification
     * @param prevHash Previous hash in the hash chain
     * @param nextHash Expected next hash in the chain
     */
    function executeV4SwapIntent(
        bytes32 orderId,
        uint256 chunkIndex,
        address intentor,
        address tokenAddress,
        uint256 sharesAmount,
        PoolKey calldata poolKey,
        uint256 amountOutMin,
        uint16 slippageBps,
        uint256 deadline,
        uint256 executionFeeBps,
        address recipient,
        uint256 drandRound,
        uint256 prevHash,
        uint256 nextHash
    ) external nonReentrant returns (uint256 amountOut) {
        // Validate deadline
        if (deadline < block.timestamp) {
            revert IntentExpired();
        }

        // Validate slippage
        if (slippageBps > 1000) {
            revert InvalidSlippage();
        }

        // === ORDER HASH VALIDATION ===
        bytes32[] memory storedHashes = orderChunkHashes[orderId];
        if (storedHashes.length == 0) {
            revert OrderChunkNotFound();
        }
        if (chunkIndex >= storedHashes.length) {
            revert OrderChunkNotFound();
        }

        // Determine tokenIn and tokenOut from pool key and orderTokenIn
        address tokenIn = orderTokenIn[orderId];
        if (tokenIn == address(0)) {
            revert InvalidAmounts();
        }

        address tokenOut;
        bool zeroForOne;
        if (tokenIn == Currency.unwrap(poolKey.currency0)) {
            tokenOut = Currency.unwrap(poolKey.currency1);
            zeroForOne = true;
        } else if (tokenIn == Currency.unwrap(poolKey.currency1)) {
            tokenOut = Currency.unwrap(poolKey.currency0);
            zeroForOne = false;
        } else {
            revert InvalidAmounts(); // tokenIn not in pool
        }

        // Compute hash using SAME structure as executeSwapIntent (with tokenOut, not poolKey)
        // This allows orders created for regular swaps to be executed via V4
        bytes32 computedHash = keccak256(
            abi.encode(
                sharesAmount, amountOutMin, slippageBps, deadline, executionFeeBps, recipient, tokenOut, drandRound
            )
        );

        if (storedHashes[chunkIndex] != computedHash) {
            revert InvalidOrderHash();
        }

        // === HASH CHAIN VERIFICATION ===
        if (usedHashChainNodes[prevHash]) {
            revert HashChainNodeAlreadyUsed();
        }

        Field.Type prevHashField = Field.toField(prevHash);
        Field.Type sharesAmountField = Field.toField(sharesAmount);
        Field.Type computedNextHash = poseidon2Hasher.hash_2(prevHashField, sharesAmountField);
        uint256 computedNextHashUint = Field.toUint256(computedNextHash);

        if (computedNextHashUint != nextHash) {
            revert InvalidHashChain();
        }

        usedHashChainNodes[prevHash] = true;

        // Withdraw tokens from Arkana vault
        arkana.withdrawForSwap(tokenAddress, sharesAmount, address(this));

        uint256 availableAmount = IERC20(tokenIn).balanceOf(address(this));
        if (availableAmount == 0) {
            revert InvalidAmounts();
        }

        // Build and execute V4 swap via Universal Router
        uint256 balanceBefore = IERC20(tokenOut).balanceOf(address(this));

        _executeV4Swap(
            poolKey, zeroForOne, uint128(availableAmount), uint128(amountOutMin), tokenIn, tokenOut, deadline
        );

        uint256 balanceAfter = IERC20(tokenOut).balanceOf(address(this));
        amountOut = balanceAfter - balanceBefore;

        // Validate slippage
        uint256 minAcceptableOut = (amountOutMin * (10000 - slippageBps)) / 10000;
        if (amountOut < minAcceptableOut) {
            revert InvalidSlippage();
        }

        // Distribute fees and transfer to recipient
        uint256 totalFees = 0;
        if (executionFeeBps > 0) {
            uint256 executionFeeAmount = (amountOut * executionFeeBps) / 10000;
            if (executionFeeAmount > 0) {
                IERC20(tokenOut).safeTransfer(msg.sender, executionFeeAmount);
                totalFees += executionFeeAmount;
            }
        }
        if (protocolFeeBps > 0) {
            uint256 protocolFeeAmount = (amountOut * protocolFeeBps) / 10000;
            if (protocolFeeAmount > 0) {
                IERC20(tokenOut).safeTransfer(owner, protocolFeeAmount);
                totalFees += protocolFeeAmount;
            }
        }

        uint256 recipientAmount = amountOut - totalFees;
        if (recipientAmount > 0) {
            IERC20(tokenOut).safeTransfer(recipient, recipientAmount);
        }

        emit SwapIntentExecuted(orderId, msg.sender, intentor, tokenIn, tokenOut, availableAmount, recipientAmount);
        return recipientAmount;
    }

    /**
     * @notice Internal function to execute V4 swap via Universal Router
     * @dev Encodes proper V4_SWAP command with SWAP_EXACT_IN_SINGLE action
     */
    function _executeV4Swap(
        PoolKey calldata poolKey,
        bool zeroForOne,
        uint128 amountIn,
        uint128 amountOutMinimum,
        address tokenIn,
        address tokenOut,
        uint256 swapDeadline
    ) internal {
        require(uniswapRouter != address(0), "Router not set");
        require(permit2 != address(0), "Permit2 not set");

        // Step 1: Approve Permit2 to spend our tokens
        IERC20(tokenIn).approve(permit2, type(uint256).max);

        // Step 2: Approve Universal Router via Permit2
        IPermit2(permit2)
            .approve(
                tokenIn,
                uniswapRouter,
                uint160(amountIn),
                uint48(block.timestamp + 3600) // 1 hour expiration
            );

        // Step 3: Build V4 swap command
        bytes memory commands = abi.encodePacked(uint8(Commands.V4_SWAP));
        bytes[] memory inputs = new bytes[](1);

        // Encode actions: SWAP_EXACT_IN_SINGLE + SETTLE_ALL + TAKE_ALL
        bytes memory actions =
            abi.encodePacked(uint8(Actions.SWAP_EXACT_IN_SINGLE), uint8(Actions.SETTLE_ALL), uint8(Actions.TAKE_ALL));

        // Prepare params for each action
        bytes[] memory params = new bytes[](3);

        // Param 0: ExactInputSingleParams
        params[0] = abi.encode(
            V4ExactInputSingleParams({
                poolKey: poolKey,
                zeroForOne: zeroForOne,
                amountIn: amountIn,
                amountOutMinimum: amountOutMinimum,
                hookData: bytes("")
            })
        );

        // Param 1: SETTLE_ALL (currency, maxAmount)
        Currency settleCurrency = zeroForOne ? poolKey.currency0 : poolKey.currency1;
        params[1] = abi.encode(settleCurrency, amountIn);

        // Param 2: TAKE_ALL (currency, minAmount) - output goes to this contract
        Currency takeCurrency = zeroForOne ? poolKey.currency1 : poolKey.currency0;
        params[2] = abi.encode(takeCurrency, amountOutMinimum);

        // Combine actions and params
        inputs[0] = abi.encode(actions, params);

        // Execute swap
        IUniversalRouter(uniswapRouter).execute(commands, inputs, swapDeadline);
    }

    /**
     * @notice Execute a liquidity provision intent
     * @dev Called by off-chain executor after decrypting the intent from timelock ciphertext
     * @dev Adds liquidity to Uniswap V4 pool and transfers position NFT to recipient
     * @param orderId The order identifier (newNonceCommitment from withdraw circuit)
     * @param chunkIndex Index of this chunk in the order (0-indexed)
     * @param tokenAddress Token address (for Arkana vault operations)
     * @param sharesAmount Amount of shares to withdraw from Arkana
     * @param poolKey Uniswap V4 pool key (currency0, currency1, fee, tickSpacing, hooks)
     * @param tickLower Lower tick of the position
     * @param tickUpper Upper tick of the position
     * @param amount0Max Maximum amount of token0 to use
     * @param amount1Max Maximum amount of token1 to use
     * @param deadline Deadline timestamp
     * @param executionFeeBps Execution fee in basis points (paid to executor)
     * @param recipient Address to receive the LP position NFT
     * @param drandRound dRand round when intent becomes decryptable
     * @param hookData Additional data for pool hooks
     * @param prevHash Previous hash in the hash chain
     * @param nextHash Next hash in the hash chain
     * @return tokenId The minted position NFT token ID
     */
    function executeLiquidityProvision(
        bytes32 orderId,
        uint256 chunkIndex,
        address tokenAddress,
        uint256 sharesAmount,
        PoolKey calldata poolKey,
        int24 tickLower,
        int24 tickUpper,
        uint256 amount0Max,
        uint256 amount1Max,
        uint256 deadline,
        uint256 executionFeeBps,
        address recipient,
        uint256 drandRound,
        bytes calldata hookData,
        uint256 prevHash,
        uint256 nextHash
    ) external nonReentrant returns (uint256 tokenId) {
        // === ORDER INTEGRITY VALIDATION ===
        bytes32[] storage storedHashes = orderChunkHashes[orderId];
        if (storedHashes.length == 0) {
            revert OrderChunkNotFound();
        }
        if (chunkIndex >= storedHashes.length) {
            revert OrderChunkNotFound();
        }

        // Compute hash of the provided liquidity parameters
        // Hash includes: sharesAmount, poolKey hash, tickLower, tickUpper, deadline, executionFeeBps, recipient, drandRound
        bytes32 poolKeyHash = keccak256(
            abi.encode(
                Currency.unwrap(poolKey.currency0),
                Currency.unwrap(poolKey.currency1),
                poolKey.fee,
                poolKey.tickSpacing,
                address(poolKey.hooks)
            )
        );
        bytes32 computedHash = keccak256(
            abi.encode(
                sharesAmount,
                poolKeyHash,
                tickLower,
                tickUpper,
                amount0Max,
                amount1Max,
                deadline,
                executionFeeBps,
                recipient,
                drandRound
            )
        );

        // Verify hash matches stored hash
        if (computedHash != storedHashes[chunkIndex]) {
            revert InvalidOrderHash();
        }

        // Validate deadline
        if (deadline <= block.timestamp) {
            revert IntentExpired();
        }

        // Validate round is available
        if (!_isRoundAvailable(drandRound)) {
            revert InvalidRound();
        }

        // Validate pool key
        if (Currency.unwrap(poolKey.currency0) == address(0) || Currency.unwrap(poolKey.currency1) == address(0)) {
            revert InvalidPoolKey();
        }

        // === HASH CHAIN VERIFICATION ===
        if (usedHashChainNodes[prevHash]) {
            revert HashChainNodeAlreadyUsed();
        }

        Field.Type prevHashField = Field.toField(prevHash);
        Field.Type sharesAmountField = Field.toField(sharesAmount);
        Field.Type computedNextHash = poseidon2Hasher.hash_2(prevHashField, sharesAmountField);
        uint256 computedNextHashUint = Field.toUint256(computedNextHash);

        if (computedNextHashUint != nextHash) {
            revert InvalidHashChain();
        }

        // Mark prevHash as used
        usedHashChainNodes[prevHash] = true;

        // Withdraw tokens from Arkana vault
        arkana.withdrawForSwap(tokenAddress, sharesAmount, address(this));

        // Get available amounts of both tokens
        address token0 = Currency.unwrap(poolKey.currency0);
        address token1 = Currency.unwrap(poolKey.currency1);
        uint256 available0 = IERC20(token0).balanceOf(address(this));
        uint256 available1 = IERC20(token1).balanceOf(address(this));

        // Approve position manager
        IERC20(token0).approve(positionManager, available0);
        IERC20(token1).approve(positionManager, available1);

        // Calculate liquidity based on available amounts
        // Note: Actual liquidity calculation depends on current pool price
        // For simplicity, we pass the amounts and let PositionManager handle it
        uint256 liquidityAmount = available0 < available1 ? available0 : available1; // Simplified

        // Mint liquidity position
        IPositionManager.MintParams memory params = IPositionManager.MintParams({
            poolKey: poolKey,
            tickLower: tickLower,
            tickUpper: tickUpper,
            liquidity: liquidityAmount,
            amount0Max: amount0Max,
            amount1Max: amount1Max,
            owner: address(this), // Mint to this contract first
            hookData: hookData
        });

        uint128 liquidityMinted;
        uint256 amount0Used;
        uint256 amount1Used;

        try IPositionManager(positionManager).mint(params, deadline, address(this)) returns (
            uint256 _tokenId, uint128 _liquidityMinted, uint256 _amount0, uint256 _amount1
        ) {
            tokenId = _tokenId;
            liquidityMinted = _liquidityMinted;
            amount0Used = _amount0;
            amount1Used = _amount1;
        } catch {
            revert LiquidityProvisionFailed();
        }

        // Transfer position NFT to recipient
        IERC721(positionManager).transferFrom(address(this), recipient, tokenId);

        // Return unused tokens to recipient
        uint256 remaining0 = IERC20(token0).balanceOf(address(this));
        uint256 remaining1 = IERC20(token1).balanceOf(address(this));

        if (remaining0 > 0) {
            IERC20(token0).safeTransfer(recipient, remaining0);
        }
        if (remaining1 > 0) {
            IERC20(token1).safeTransfer(recipient, remaining1);
        }

        // Pay execution fee (from remaining tokens if any, or handled separately)
        // Note: For LP operations, execution fee could be handled differently

        emit LiquidityProvisionExecuted(
            orderId, msg.sender, recipient, tokenId, liquidityMinted, amount0Used, amount1Used
        );

        return tokenId;
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

    //TODO: Important, to atcually have a method to withdraw from arkana the virtually-locked funds no one filled these ops
    function withdrawVirtuallyLockedFunds(address tokenAddress, uint256 sharesAmount) external onlyOwner {
        //
    }
}
