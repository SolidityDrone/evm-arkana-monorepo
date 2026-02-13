// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {LeanIMTPoseidon2, LeanIMTData} from "./merkle/LeanIMTPoseidon2.sol";
import "./merkle/Poseidon2HuffWrapper.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@oz/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@oz/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@oz/contracts/access/AccessControl.sol";
import {IPool, DataTypes} from "@aave/core-v3/interfaces/IPool.sol";
import "./ArkanaVault.sol";
import {Field} from "../lib/poseidon2-evm/src/Field.sol";
import {BJJ} from "./crypto-utils/BJJ.sol";
import {Generators} from "./crypto-utils/Generators.sol";
import {ReentrancyGuard} from "@oz/contracts/utils/ReentrancyGuard.sol";

// Circom Groth16 verifier interfaces (snarkjs-generated)
interface IVerifierEntry {
    function verifyProof(uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[7] calldata _pubSignals) external view returns (bool);
}
interface IVerifierDeposit {
    function verifyProof(uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[11] calldata _pubSignals) external view returns (bool);
}
interface IVerifierWithdraw {
    function verifyProof(uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[15] calldata _pubSignals) external view returns (bool);
}
interface IVerifierSend {
    function verifyProof(uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[17] calldata _pubSignals) external view returns (bool);
}
interface IVerifierAbsorbSend {
    function verifyProof(uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[20] calldata _pubSignals) external view returns (bool);
}
interface IVerifierAbsorbWithdraw {
    function verifyProof(uint256[2] calldata _pA, uint256[2][2] calldata _pB, uint256[2] calldata _pC, uint256[18] calldata _pubSignals) external view returns (bool);
}

contract Arkana is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Role for initializing vaults
    bytes32 public constant VAULT_INITIALIZER_ROLE = keccak256("ARKANA");

    /// @notice Mapping from verifier index to verifier address
    /// @dev Index 0 = Entry, 1 = Deposit, 2 = Send, 3 = Withdraw, 4 = Absorb+Send, 5 = Asborb+Withdraw?
    mapping(uint256 => address) public verifiersByIndex;

    /// @notice Mapping from token address to its Merkle tree data
    mapping(address => LeanIMTData) internal _tokenTrees;

    /// @notice Mapping from token address to historical states
    mapping(address => HistoricalState[]) internal _tokenHistoricalStates;

    /// @notice Mapping from token address to root index mapping
    mapping(address => mapping(uint256 => uint256)) internal _tokenRootToIndex;

    /// @notice Mapping from token address to leaf count
    mapping(address => uint256) public tokenLeafCount;

    /// @notice Mapping from token address to array of leaves
    /// @dev TODO: this has to be moved into indexing (off-chain indexer should track LeafAdded events)
    mapping(address => uint256[]) public tokenLeaves;

    /// @notice The Poseidon2 hasher instance (shared across all tokens)
    Poseidon2HuffWrapper public immutable poseidon2Hasher;

    /// @notice Aave v3 Pool contract address
    IPool public immutable aavePool;

    /// @notice Protocol fee in basis points (100 = 1%, 500 = 5%)
    uint256 public protocolFeeBps;

    /// @notice Protocol fee in basis points (10000 = 100%, 100 = 1%, 5 = 0.05%)
    uint256 public protocol_fee;

    /// @notice Discount window in seconds (e.g., 2592000 = 30 days)
    uint256 public discount_window;
    /// @notice Time tolerance for self reported timestamp, 30 min just naively for now
    uint256 public TIME_TOLERANCE = 30 minutes;

    /// @notice Minimum tree depth constant (must match LeanIMTPoseidon2.sol)
    /// @dev Ensures all proofs are at least 8 levels deep for consistent verification
    uint256 public constant MIN_TREE_DEPTH = 8;

    /// @notice Multicall3 contract address
    address public multicall3Address;
    /// @notice Mapping from token address to its ERC4626 vault address
    /// @dev Each token can have one vault for standard ERC4626 interface
    /// @dev The vault tracks all shares and handles ERC4626 conversions
    mapping(address token => address vault) public tokenVaults;

    /// @notice Mapping from underlying token address to its Aave aToken address
    /// @dev Used to track which aToken corresponds to each underlying token
    /// @dev The vault's asset is the aToken, not the underlying token
    mapping(address token => address aToken) public tokenToAToken;

    /// @notice Mapping from token address to nonce discovery point
    mapping(address => CurvePoint) public tokenNonceDiscoveryPoint;

    /// @notice Mapping from token address to nonce discovery M
    mapping(address => uint256) public tokenNonceDiscoveryM;

    /// @notice Mapping from token address to nonce discovery R
    mapping(address => uint256) public tokenNonceDiscoveryR;

    /// @notice Global mappings (domain-separated by nonce commitment which includes token address)
    mapping(bytes32 => bool) public usedCommitments;
    mapping(bytes32 nonceCommitment => EncryptedStateDetails) public encryptedStateDetails;
    mapping(bytes32 nonceCommitment => OperationInfo) public operationInfo;
    /// @notice Mapping from nonce commitment to receiver public key (for send operations)
    /// @dev Only set for send operations, allows frontend to reconstruct receiver address
    mapping(bytes32 nonceCommitment => CurvePoint) public nonceCommitmentToReceiver;

    /// @notice Per-token mappings
    mapping(address => mapping(bytes32 => bool)) public tokenHistoricalNoteCommitments;
    mapping(address => mapping(bytes32 publicKeyHash => EncryptedNote[])) public tokenUserEncryptedNotes;
    /// @notice Cumulative note_stack point for each user (tokenAddress => pubkeyHash => CurvePoint)
    /// @dev This stores the cumulative sum of all note commitments for a user, updated on each send
    mapping(address => mapping(bytes32 => CurvePoint)) public tokenUserNoteStack;

    /// @notice Historical state snapshot
    struct HistoricalState {
        uint256 root;
        uint256 depth;
        uint256 size; // Number of leaves
    }

    /// @notice Commitment point structure
    struct CurvePoint {
        uint256 x;
        uint256 y;
    }

    /// @notice Encrypted state details struct
    struct EncryptedStateDetails {
        bytes32 encryptedBalance;
        bytes32 encryptedNullifier;
    }

    /// @notice Operation type enum
    enum OperationType {
        Initialize,
        Deposit,
        Send,
        Withdraw,
        AbsorbSend,
        AbsorbWithdraw
    }

    /// @notice Operation metadata stored for each nonceCommitment
    struct OperationInfo {
        OperationType operationType;
        uint256 sharesMinted; // Shares minted for this operation (only for Initialize/Deposit, 0 otherwise)
        address tokenAddress; // Token address for this operation
    }

    struct EncryptedNote {
        uint256 encryptedAmountForReceiver;
        CurvePoint senderPublicKey;
    }

    /// @notice Withdrawal output parameters
    struct WithdrawOutputs {
        uint256 pedersenCommitmentX;
        uint256 pedersenCommitmentY;
        uint256 newNonceCommitment;
        bytes32 encryptedBalance;
        bytes32 encryptedNullifier;
        uint256 nonceDiscoveryEntryX;
        uint256 nonceDiscoveryEntryY;
    }

    /// @notice Nonce discovery entry struct
    struct NonceDiscoveryEntry {
        uint256 x;
        uint256 y;
        uint256 nonceCommitment;
    }

    /// @notice Event emitted when a new leaf is added
    /// @param token The token address
    /// @param leaf The leaf value that was added
    /// @param index The index of the leaf in the tree
    /// @param root The new root after adding the leaf
    /// @param previousRoot The root before adding the leaf (0 if this is the first leaf)
    event LeafAdded(address indexed token, uint256 indexed leaf, uint256 index, uint256 root, uint256 previousRoot);

    /// @notice Event emitted when a new root is saved to history
    /// @param token The token address
    /// @param root The root that was saved
    /// @param depth The depth of the tree at this state
    /// @param size The number of leaves at this state
    /// @param index The index in the historical states array
    event RootSaved(address indexed token, uint256 indexed root, uint256 depth, uint256 size, uint256 index);

    error InvalidChainId();
    error InvalidRoot();
    error CommitmentAlreadyUsed();
    error InvalidPublicInputs();
    error InvalidTimeReference();
    error VaultNotInitialized(address token);
    error InsufficientShares(uint256 available, uint256 required);
    error NoteAlreadyUsed();
    error InvalidCalldataHash();
    error Multicall3Failed();
    error InvalidAddress();

    /// @notice Constructor initializes verifiers, protocol fee, and Aave Pool
    /// @param _verifiers Array of verifier addresses: [Entry, Deposit, Send, Withdraw, Absorb+Withdraw, Absorb+Send]
    /// @param _protocolFeeBps Protocol fee in basis points (100 = 1%, 500 = 5%)
    /// @param _aavePool Address of the Aave v3 Pool contract
    /// @param _protocolFee Protocol fee in basis points (10000 = 100%, 100 = 1%, 5 = 0.05%)
    /// @param _discountWindow Discount window in seconds (e.g., 2592000 = 30 days)
    /// @param _poseidon2Huff Address of the deployed Huff Poseidon2 contract (deploy separately using HuffDeployer in tests/scripts)
    constructor(
        address[] memory _verifiers,
        uint256 _protocolFeeBps,
        address _aavePool,
        uint256 _protocolFee,
        uint256 _discountWindow,
        address _poseidon2Huff,
        address _multicall3
    ) {
        // Initialize AccessControl - grant DEFAULT_ADMIN_ROLE to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VAULT_INITIALIZER_ROLE, msg.sender);

        // Map verifiers by index
        for (uint256 i = 0; i < _verifiers.length; i++) {
            verifiersByIndex[i] = _verifiers[i];
        }

        // Initialize protocol fee
        protocolFeeBps = _protocolFeeBps;

        // Initialize protocol fee (per-mille)
        protocol_fee = _protocolFee;

        // Initialize discount window
        discount_window = _discountWindow;

        // Initialize Aave Pool
        aavePool = IPool(_aavePool);

        // Initialize Poseidon2 hasher with Huff contract address
        poseidon2Hasher = new Poseidon2HuffWrapper(_poseidon2Huff);

        // Initialize Multicall3 address
        multicall3Address = _multicall3;

        // Grant deployer (msg.sender) the DEFAULT_ADMIN_ROLE
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        // Grant deployer the VAULT_INITIALIZER_ROLE as well
        _grantRole(VAULT_INITIALIZER_ROLE, msg.sender);
    }


    // ============================================
    // VAULT INITIALIZATION
    // ============================================

    /// @notice Initialize ERC4626 vaults for multiple tokens
    /// @param tokenAddresses Array of ERC20 token addresses to create vaults for
    /// @dev Creates an ArkanaVault for each token if one doesn't already exist
    /// @dev Queries Aave to get the aToken address for each token
    /// @dev Vault's asset is the aToken (not the underlying token), since deposits go to Aave
    /// @dev Vault name and symbol are derived from the underlying token's metadata
    /// @dev Only callable by accounts with VAULT_INITIALIZER_ROLE or DEFAULT_ADMIN_ROLE
    function initializeVaults(address[] calldata tokenAddresses) external onlyRole(VAULT_INITIALIZER_ROLE) {
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            address tokenAddress = tokenAddresses[i];

            // Skip if vault already exists
            if (tokenVaults[tokenAddress] != address(0)) {
                continue;
            }

            // Query Aave to get the aToken address for this token
            address aTokenAddress;
            try aavePool.getReserveData(tokenAddress) returns (DataTypes.ReserveData memory reserveData) {
                aTokenAddress = reserveData.aTokenAddress;

                // For mock pools: aTokenAddress might be the same as tokenAddress
                // In that case, we still use it but note that it's a mock
                if (aTokenAddress == address(0)) {
                    // If Aave doesn't have this token, we can't create a vault
                    // Skip this token and continue
                    continue;
                }
            } catch {
                // If getReserveData fails, we can't create a vault for this token
                // Skip this token and continue
                continue;
            }

            // Store the token -> aToken mapping
            tokenToAToken[tokenAddress] = aTokenAddress;

            // Get underlying token metadata for vault name and symbol
            string memory tokenSymbol;
            tokenSymbol = IERC20Metadata(tokenAddress).symbol();

            // Create vault name and symbol (based on underlying token, not aToken)
            string memory vaultName = string(abi.encodePacked("Arkana Vault ", tokenSymbol));
            string memory vaultSymbol = "ARK";

            // Deploy new vault with aToken as the asset (not the underlying token)
            // The vault will track aToken balance, which includes yield from Aave
            ArkanaVault vault =
                new ArkanaVault(IERC20(aTokenAddress), this, tokenAddress, aavePool, vaultName, vaultSymbol);

            // Store vault address
            tokenVaults[tokenAddress] = address(vault);
        }
    }

    /// @notice Register an external vault for a token (e.g., IndexDollarVault for iUSD)
    /// @param tokenAddress The token address (e.g., iUSD token address)
    /// @param vaultAddress The external vault address
    /// @dev External vaults must implement the same interface as ArkanaVault:
    ///      - convertToShares(uint256)
    ///      - supplyToAave(uint256)
    ///      - mintShares(address, uint256)
    ///      - burnShares(address, uint256)
    ///      - withdrawFromAave(uint256, address)
    /// @dev Only callable by accounts with VAULT_INITIALIZER_ROLE
    function registerExternalVault(address tokenAddress, address vaultAddress)
        external
        onlyRole(VAULT_INITIALIZER_ROLE)
    {
        require(tokenVaults[tokenAddress] == address(0), "Arkana: Vault already exists for this token");
        require(vaultAddress != address(0), "Arkana: Invalid vault address");
        tokenVaults[tokenAddress] = vaultAddress;
    }

    // ============================================
    // TOKEN-SPECIFIC MERKLE TREE OPERATIONS
    // ============================================

    /// @notice Get the current root for a token's Merkle tree
    /// @param tokenAddress The token address
    /// @return The current root
    function getRoot(address tokenAddress) public view returns (uint256) {
        return LeanIMTPoseidon2.root(_tokenTrees[tokenAddress]);
    }

    /// @notice Get the current depth for a token's Merkle tree
    /// @param tokenAddress The token address
    /// @return The current depth (minimum 8 if tree has leaves)
    function getDepth(address tokenAddress) public view returns (uint256) {
        uint256 size = _tokenTrees[tokenAddress].size;
        if (size == 0) return 0;
        uint256 depth = _tokenTrees[tokenAddress].depth;
        return depth < MIN_TREE_DEPTH ? MIN_TREE_DEPTH : depth;
    }

    /// @notice Get the current size for a token's Merkle tree
    /// @param tokenAddress The token address
    /// @return The current size
    function getSize(address tokenAddress) public view returns (uint256) {
        return _tokenTrees[tokenAddress].size;
    }

    /// @notice Check if a leaf exists in a token's tree
    /// @param tokenAddress The token address
    /// @param leaf The leaf value to check
    /// @return True if the leaf exists, false otherwise
    function hasLeaf(address tokenAddress, uint256 leaf) public view returns (bool) {
        return LeanIMTPoseidon2.has(_tokenTrees[tokenAddress], leaf);
    }

    /// @notice Get the index of a leaf in a token's tree
    /// @param tokenAddress The token address
    /// @param leaf The leaf value
    /// @return The index of the leaf (reverts if leaf doesn't exist)
    function getLeafIndex(address tokenAddress, uint256 leaf) public view returns (uint256) {
        return LeanIMTPoseidon2.indexOf(_tokenTrees[tokenAddress], leaf);
    }

    /// @notice Get all leaves for a token
    /// @param tokenAddress The token address
    /// @return Array of all leaves
    /// @dev TODO: this has to be moved into indexing (off-chain indexer should track LeafAdded events)
    function getLeaves(address tokenAddress) public view returns (uint256[] memory) {
        return tokenLeaves[tokenAddress];
    }

    /// @notice Generate Merkle proof for a leaf at a given index
    /// @param tokenAddress The token address
    /// @param leafIndex The index of the leaf to generate proof for (0-based)
    /// @return proof Array of sibling hashes for the proof (length = tree depth)
    /// @notice This function rebuilds the full tree level by level to generate accurate proofs
    ///         that match the Noir verification logic
    function generateProof(address tokenAddress, uint256 leafIndex) public view returns (uint256[] memory proof) {
        uint256[] memory leaves = tokenLeaves[tokenAddress];
        return LeanIMTPoseidon2.generateProof(_tokenTrees[tokenAddress], poseidon2Hasher, leaves, leafIndex);
    }

    /// @notice Check if a root exists in a token's historical states
    /// @param tokenAddress The token address
    /// @param root The root to check
    /// @return True if the root exists in history, false otherwise
    function isHistoricalRoot(address tokenAddress, uint256 root) public view returns (bool) {
        HistoricalState[] storage states = _tokenHistoricalStates[tokenAddress];
        if (states.length == 0) {
            return root == 0; // Empty tree has root 0
        }
        // Safe access: we've already checked length > 0, so states[0] is safe
        if (states.length > 0) {
            return _tokenRootToIndex[tokenAddress][root] != 0 || root == states[0].root;
        }
        return false; // Should never reach here, but defensive
    }

    /// @notice Internal function to add a leaf to a token's tree
    /// @param tokenAddress The token address
    /// @param leaf The leaf value to add
    /// @return The new root after adding the leaf
    function _addLeaf(address tokenAddress, uint256 leaf) internal returns (uint256) {
        LeanIMTData storage tree = _tokenTrees[tokenAddress];
        uint256 previousRoot = LeanIMTPoseidon2.root(tree);

        // Initialize tree if needed (first leaf for this token)
        if (tree.size == 0 && _tokenHistoricalStates[tokenAddress].length == 0) {
            _tokenHistoricalStates[tokenAddress].push(HistoricalState({root: 0, depth: 0, size: 0}));
            _tokenRootToIndex[tokenAddress][0] = 0;
        }

        // Insert the leaf into the tree
        LeanIMTPoseidon2.insert(tree, poseidon2Hasher, leaf);

        uint256 newRoot = LeanIMTPoseidon2.root(tree);
        uint256 currentLeafCount = tokenLeafCount[tokenAddress];

        // Save historical state
        _saveHistoricalRoot(tokenAddress, newRoot);

        tokenLeafCount[tokenAddress] = currentLeafCount + 1;

        // TODO: this has to be moved into indexing (off-chain indexer should track LeafAdded events)
        tokenLeaves[tokenAddress].push(leaf);

        emit LeafAdded(tokenAddress, leaf, currentLeafCount, newRoot, previousRoot);

        return newRoot;
    }

    /// @notice Internal function to save a root to a token's historical state
    /// @param tokenAddress The token address
    /// @param root The root to save
    function _saveHistoricalRoot(address tokenAddress, uint256 root) internal {
        // Only save if this root hasn't been saved before
        if (_tokenRootToIndex[tokenAddress][root] == 0) {
            HistoricalState[] storage states = _tokenHistoricalStates[tokenAddress];
            if (states.length > 0 && root == states[0].root) {
                return; // Already saved as initial state
            }

            uint256 index = states.length;
            uint256 depth = _tokenTrees[tokenAddress].depth;
            uint256 size = _tokenTrees[tokenAddress].size;

            states.push(HistoricalState({root: root, depth: depth, size: size}));
            _tokenRootToIndex[tokenAddress][root] = index;

            emit RootSaved(tokenAddress, root, depth, size, index);
        }
    }

    // ============================================
    // OPERATIONS
    // ============================================

    /// @notice Initialize a new entry in the Arkana system
    /// @param pA,pB,pC Groth16 proof points (Circom/snarkjs format)
    /// @param publicSignals Public signals [token_address, chain_id, balance_commitment_x, balance_commitment_y, new_nonce_commitment, nonce_discovery_entry_x, nonce_discovery_entry_y]
    /// @return The new root after adding the commitment
    function initialize(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[7] calldata publicSignals,
        uint256 amountIn,
        uint256 lockDuration
    ) public returns (uint256) {
        require(IVerifierEntry(verifiersByIndex[0]).verifyProof(pA, pB, pC, publicSignals), "Invalid proof");

        address tokenAddress = address(uint160(publicSignals[0]));
        uint256 chainId = publicSignals[1];
        uint256 balanceCommitmentX = publicSignals[2];
        uint256 balanceCommitmentY = publicSignals[3];
        uint256 newNonceCommitment = publicSignals[4];
        uint256 nonceDiscoveryEntryX = publicSignals[5];
        uint256 nonceDiscoveryEntryY = publicSignals[6];

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (usedCommitments[bytes32(newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }

        usedCommitments[bytes32(newNonceCommitment)] = true;

        // Calculate upfront protocol fee based on lock duration
        // If lockDuration = 0: full fee applies
        // If lockDuration = discount_window: 0 fee (100% discount)
        uint256 effective_fee_bps = calculateDiscountedProtocolFee(lockDuration);

        // Calculate fee amount: amountIn * effective_fee_bps / 10000
        uint256 feeAmount = (amountIn * effective_fee_bps) / 10000;

        // Calculate amount after fee (this is what goes into shares and Aave)
        uint256 amountAfterFee = amountIn - feeAmount;

        // Get vault address
        address vaultAddress = tokenVaults[tokenAddress];
        if (vaultAddress == address(0)) {
            revert VaultNotInitialized(tokenAddress);
        }

        ArkanaVault vault = ArkanaVault(vaultAddress);

        // Calculate shares using the vault (ERC4626 standard)
        // IMPORTANT: Calculate shares BEFORE supplying to vault
        // This ensures totalAssets() == 0 when totalSupply() == 0, so convertToShares returns 1:1 ratio
        // We calculate shares based on amountAfterFee (matching the commitment)
        uint256 shares = vault.convertToShares(amountAfterFee);

        // Transfer tokens from user to this contract
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amountIn);

        // Approve vault to take tokens
        IERC20(tokenAddress).approve(vaultAddress, amountIn);

        // Vault supplies tokens to Aave (full amountIn, fee will be handled via share calculation)
        // Fee stays in vault as assets without shares
        vault.supplyToAave(amountIn);

        // Calculate unlocks_at: pack lock_timer and unlocks_at timestamp
        // Format: lock_timer * 2^24 + unlocks_at
        // If lockDuration > 0: unlocks_at = current_time + lockDuration, otherwise unlocks_at = 0
        uint256 unlocks_at_timestamp = 0;
        if (lockDuration > 0) {
            unlocks_at_timestamp = block.timestamp + lockDuration;
        }

        // Pack: lock_timer (24 bits) << 24 | unlocks_at (24 bits)
        uint256 unlocks_at = (lockDuration & 0xffffff) * (2 ** 24) + (unlocks_at_timestamp & 0xffffff);

        // Get generators G and K
        (uint256 gX, uint256 gY) = Generators.getG();
        (uint256 kX, uint256 kY) = Generators.getK();
        BJJ.Point memory G = BJJ.Point(gX, gY);
        BJJ.Point memory K = BJJ.Point(kX, kY);

        // Get balance commitment point from circuit
        BJJ.Point memory balanceCommitment = BJJ.Point(balanceCommitmentX, balanceCommitmentY);

        // Add shares*G to balance commitment
        BJJ.Point memory sharesCommitment = BJJ.getTerm(G, shares);
        BJJ.Point memory commitmentWithShares = BJJ.add(balanceCommitment, sharesCommitment);

        // Add unlocks_at*K to commitment
        BJJ.Point memory unlocksAtCommitment = BJJ.getTerm(K, unlocks_at);
        BJJ.Point memory finalCommitment = BJJ.add(commitmentWithShares, unlocksAtCommitment);

        // Hash the final Pedersen commitment point to create the leaf
        uint256 leaf =
            Field.toUint256(poseidon2Hasher.hash_2(Field.toField(finalCommitment.x), Field.toField(finalCommitment.y)));

        // Add the leaf to the token's merkle tree
        uint256 newRoot = _addLeaf(tokenAddress, leaf);

        // Add the nonce discovery entry to the token's stack
        _addNonceDiscoveryEntry(tokenAddress, nonceDiscoveryEntryX, nonceDiscoveryEntryY, newNonceCommitment);

        // For nonce 0, save plaintext balance in encryptedStateDetails
        // Balance is stored in shares (not underlying token amount) because the ZK system tracks balances in shares
        // For the first deposit, shares are calculated from amountAfterFee using the vault's convertToShares
        // Nullifier is 0 for nonce 0
        encryptedStateDetails[bytes32(newNonceCommitment)] = EncryptedStateDetails(bytes32(shares), bytes32(uint256(0)));

        // Mint shares to Arkana contract (Arkana holds all shares for users)
        // This allows Arkana to redeem/burn shares when fees are paid
        vault.mintShares(address(this), shares);

        return newRoot;
    }

    /// @notice Deposit function - adds funds to existing balance
    /// @param pA,pB,pC Groth16 proof points (Circom/snarkjs format)
    /// @param publicSignals [token_address, amount, chain_id, expected_root, pedersen_commitment[2], encrypted_state[2], nonce_discovery_entry[2], new_nonce_commitment] (11 elements)
    /// @return The new root after adding the commitment
    function deposit(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[11] calldata publicSignals
    ) public nonReentrant returns (uint256) {
        require(IVerifierDeposit(verifiersByIndex[1]).verifyProof(pA, pB, pC, publicSignals), "Invalid proof");

        address tokenAddress = address(uint160(publicSignals[0]));
        uint256 amountIn = publicSignals[1];
        uint256 chainId = publicSignals[2];
        uint256 expectedRoot = publicSignals[3];
        uint256 pedersenCommitmentX = publicSignals[4];
        uint256 pedersenCommitmentY = publicSignals[5];
        bytes32 encryptedBalance = bytes32(publicSignals[6]);
        bytes32 encryptedNullifier = bytes32(publicSignals[7]);
        uint256 nonceDiscoveryEntryX = publicSignals[8];
        uint256 nonceDiscoveryEntryY = publicSignals[9];
        uint256 newNonceCommitment = publicSignals[10];

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (!isHistoricalRoot(tokenAddress, expectedRoot)) {
            revert InvalidRoot();
        }

        if (usedCommitments[bytes32(newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }

        usedCommitments[bytes32(newNonceCommitment)] = true;

        encryptedStateDetails[bytes32(newNonceCommitment)] = EncryptedStateDetails(encryptedBalance, encryptedNullifier);

        // Calculate protocol fee (deposit has no lock duration, so full fee applies)
        uint256 feeAmount = (amountIn * protocol_fee) / 10000;
        uint256 amountAfterFee = amountIn - feeAmount;

        // Get Pedersen commitment point from circuit
        // This includes: previous_shares*G + nullifier*H + spending_key*D + previous_unlocks_at*K + new_nonce_commitment*J
        BJJ.Point memory circuitCommitment = BJJ.Point(pedersenCommitmentX, pedersenCommitmentY);

        // Calculate shares using the vault (ERC4626 standard)
        address vaultAddress = tokenVaults[tokenAddress];
        if (vaultAddress == address(0)) {
            revert VaultNotInitialized(tokenAddress);
        }

        ArkanaVault vault = ArkanaVault(vaultAddress);

        uint256 shares = vault.convertToShares(amountAfterFee);

        // Store operation info for nonceCommitment
        operationInfo[bytes32(newNonceCommitment)] =
            OperationInfo({operationType: OperationType.Deposit, sharesMinted: shares, tokenAddress: tokenAddress});

        // Get generator G
        (uint256 gX, uint256 gY) = Generators.getG();
        BJJ.Point memory G = BJJ.Point(gX, gY);

        // Add shares*G to circuit commitment
        BJJ.Point memory sharesCommitment = BJJ.getTerm(G, shares);
        BJJ.Point memory finalCommitment = BJJ.add(circuitCommitment, sharesCommitment);

        // Circuit keeps previous_unlocks_at unchanged (deposit doesn't change lock time)
        // No need to modify it - circuit commitment is complete

        // Hash the final Pedersen commitment point to create the leaf
        uint256 leaf =
            Field.toUint256(poseidon2Hasher.hash_2(Field.toField(finalCommitment.x), Field.toField(finalCommitment.y)));

        // Add the leaf to the token's merkle tree
        uint256 newRoot = _addLeaf(tokenAddress, leaf);

        // Add the nonce discovery entry to the token's stack
        _addNonceDiscoveryEntry(tokenAddress, nonceDiscoveryEntryX, nonceDiscoveryEntryY, newNonceCommitment);

        // Transfer tokens from user to this contract
        IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amountIn);

        // Approve vault to take tokens
        IERC20(tokenAddress).approve(vaultAddress, amountIn);

        // Vault supplies tokens to Aave (full amountIn)
        // Fee stays in vault as assets without shares
        vault.supplyToAave(amountIn);

        // Mint shares to Arkana contract (Arkana holds all shares for users)
        // This allows Arkana to redeem/burn shares when fees are paid
        vault.mintShares(address(this), shares);

        return newRoot;
    }

    /// @notice Withdraw function - withdraws funds from balance
    /// @param pA,pB,pC Groth16 proof points (Circom/snarkjs format)
    /// @param publicSignals [token_address, chain_id, declared_time_reference, expected_root, arbitrary_calldata_hash, receiver_address, relayer_fee_amount, pedersen_commitment[2], new_nonce_commitment, encrypted_state[2], nonce_discovery_entry[2], final_amount] (15 elements)
    /// @param call For normal withdrawals: Multicall3 calldata.
    /// @return newRoot The new root after adding the commitment
    function withdraw(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[15] calldata publicSignals,
        bytes calldata call
    ) public nonReentrant returns (uint256 newRoot) {
        require(IVerifierWithdraw(verifiersByIndex[3]).verifyProof(pA, pB, pC, publicSignals), "Invalid proof");

        address tokenAddress = address(uint160(publicSignals[0]));
        uint256 declaredTimeReference = publicSignals[2];
        uint256 expectedRoot = publicSignals[3];
        bytes32 arbitraryCalldataHash = bytes32(publicSignals[4]);
        address receiverAddress = address(uint160(publicSignals[5]));
        uint256 relayerFeeShares = publicSignals[6];

        WithdrawOutputs memory outputs = WithdrawOutputs({
            pedersenCommitmentX: publicSignals[7],
            pedersenCommitmentY: publicSignals[8],
            newNonceCommitment: publicSignals[9],
            encryptedBalance: bytes32(publicSignals[10]),
            encryptedNullifier: bytes32(publicSignals[11]),
            nonceDiscoveryEntryX: publicSignals[12],
            nonceDiscoveryEntryY: publicSignals[13]
        });

        uint256 finalAmount = publicSignals[14];

        uint256 chainId = publicSignals[1];
        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (!isHistoricalRoot(tokenAddress, expectedRoot)) {
            revert InvalidRoot();
        }

        uint256 timeDifference = declaredTimeReference > block.timestamp
            ? declaredTimeReference - block.timestamp
            : block.timestamp - declaredTimeReference;
        if (timeDifference > TIME_TOLERANCE) {
            revert InvalidTimeReference();
        }

        // Get Pedersen commitment point from circuit
        // Circuit already calculates: new_shares_balance = previous_shares - (amount + relayer_fee_amount)
        // and creates commitment with new_shares_balance directly
        // So we use the commitment point as-is, no need to subtract shares
        BJJ.Point memory finalCommitment =
            BJJ.Point(outputs.pedersenCommitmentX, outputs.pedersenCommitmentY);

        // Mark the new nonce commitment as used (required for nonce discovery)
        if (usedCommitments[bytes32(outputs.newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }

        usedCommitments[bytes32(outputs.newNonceCommitment)] = true;

        encryptedStateDetails[bytes32(outputs.newNonceCommitment)] =
            EncryptedStateDetails(outputs.encryptedBalance, outputs.encryptedNullifier);

        // Add the nonce discovery entry to the token's stack
        _addNonceDiscoveryEntry(
            tokenAddress, outputs.nonceDiscoveryEntryX, outputs.nonceDiscoveryEntryY, outputs.newNonceCommitment
        );

        _handleWithdrawal(
                tokenAddress, finalAmount, relayerFeeShares, receiverAddress, call, arbitraryCalldataHash
        );

        // Store operation info for nonceCommitment (withdraw burns shares, doesn't mint)
        operationInfo[bytes32(outputs.newNonceCommitment)] =
            OperationInfo({operationType: OperationType.Withdraw, sharesMinted: 0, tokenAddress: tokenAddress});

        return _addLeaf(
            tokenAddress,
            Field.toUint256(poseidon2Hasher.hash_2(Field.toField(finalCommitment.x), Field.toField(finalCommitment.y)))
        );
    }

    /// @notice Absorb+Withdraw: absorb notes then withdraw to receiver (same as withdraw with two relayer fees)
    /// @param pA,pB,pC Groth16 proof points (Circom/snarkjs format)
    /// @param publicSignals [token_address, amount, chain_id, expected_root, declared_time_reference, arbitrary_calldata_hash, receiver_address, relayer_fee_amount, withdraw_relayer_fee_amount, commitment[2], new_nonce_commitment, encrypted_state[2], nonce_discovery_entry[2]] (18 elements, last 2 may be padding)
    /// @param call Multicall3 calldata (if any)
    function absorbWithdraw(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[18] calldata publicSignals,
        bytes calldata call
    ) public nonReentrant returns (uint256 newRoot) {
        require(IVerifierAbsorbWithdraw(verifiersByIndex[5]).verifyProof(pA, pB, pC, publicSignals), "Invalid proof");

        address tokenAddress = address(uint160(publicSignals[0]));
        uint256 amount = publicSignals[1];
        uint256 chainId = publicSignals[2];
        uint256 expectedRoot = publicSignals[3];
        uint256 declaredTimeReference = publicSignals[4];
        bytes32 arbitraryCalldataHash = bytes32(publicSignals[5]);
        address receiverAddress = address(uint160(publicSignals[6]));
        uint256 relayerFeeAmount = publicSignals[7];
        uint256 withdrawRelayerFeeAmount = publicSignals[8];

        WithdrawOutputs memory outputs = WithdrawOutputs({
            pedersenCommitmentX: publicSignals[9],
            pedersenCommitmentY: publicSignals[10],
            newNonceCommitment: publicSignals[11],
            encryptedBalance: bytes32(publicSignals[12]),
            encryptedNullifier: bytes32(publicSignals[13]),
            nonceDiscoveryEntryX: publicSignals[14],
            nonceDiscoveryEntryY: publicSignals[15]
        });

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (!isHistoricalRoot(tokenAddress, expectedRoot)) {
            revert InvalidRoot();
        }

        uint256 timeDifference = declaredTimeReference > block.timestamp
            ? declaredTimeReference - block.timestamp
            : block.timestamp - declaredTimeReference;
        if (timeDifference > TIME_TOLERANCE) {
            revert InvalidTimeReference();
        }

        BJJ.Point memory finalCommitment =
            BJJ.Point(outputs.pedersenCommitmentX, outputs.pedersenCommitmentY);

        if (usedCommitments[bytes32(outputs.newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }
        usedCommitments[bytes32(outputs.newNonceCommitment)] = true;

        encryptedStateDetails[bytes32(outputs.newNonceCommitment)] =
            EncryptedStateDetails(outputs.encryptedBalance, outputs.encryptedNullifier);

        _addNonceDiscoveryEntry(
            tokenAddress, outputs.nonceDiscoveryEntryX, outputs.nonceDiscoveryEntryY, outputs.newNonceCommitment
        );

        uint256 totalRelayerFeeShares = relayerFeeAmount + withdrawRelayerFeeAmount;
        _handleWithdrawal(
            tokenAddress, amount, totalRelayerFeeShares, receiverAddress, call, arbitraryCalldataHash
        );

        operationInfo[bytes32(outputs.newNonceCommitment)] =
            OperationInfo({operationType: OperationType.AbsorbWithdraw, sharesMinted: 0, tokenAddress: tokenAddress});

        return _addLeaf(
            tokenAddress,
            Field.toUint256(poseidon2Hasher.hash_2(Field.toField(finalCommitment.x), Field.toField(finalCommitment.y)))
        );
    }

    /// @notice Process vault operations for withdrawal (internal function to reduce stack depth)
    /// @param tokenAddress The token address
    /// @param sharesAmount Amount of shares to withdraw
    /// @param relayerFeeShares Relayer fee in shares
    /// @param receiverAddress Address to receive withdrawal assets
    function _processWithdrawVaultOperations(
        address tokenAddress,
        uint256 sharesAmount,
        uint256 relayerFeeShares,
        address receiverAddress
    ) internal {
        // Total shares to burn = withdrawal shares + relayer fee shares (for accounting purposes)
        uint256 totalSharesToBurn = sharesAmount + relayerFeeShares;

        // Convert shares to underlying assets using the vault (ERC4626 standard)
        // Vault uses ERC4626's convertToAssets which uses totalSupply() and totalAssets()
        // IMPORTANT: Calculate assets BEFORE burning shares (burning changes vault state)
        address vaultAddress = tokenVaults[tokenAddress];
        if (vaultAddress == address(0)) {
            revert VaultNotInitialized(tokenAddress);
        }

        ArkanaVault vault = ArkanaVault(vaultAddress);

        // Calculate assets BEFORE redeeming (redeeming changes vault state)
        uint256 withdrawalAssets = vault.convertToAssets(sharesAmount);
        uint256 relayerFeeAssets = vault.convertToAssets(relayerFeeShares);

        // Calculate protocol fee on withdrawal assets (before relayer fee)
        uint256 protocolFee = (withdrawalAssets * protocolFeeBps) / 10000;
        uint256 withdrawalAssetsAfterFee = withdrawalAssets - protocolFee;

        // Check if Arkana has enough shares before burning
        uint256 arkanaShares = vault.balanceOf(address(this));
        if (arkanaShares < totalSharesToBurn) {
            revert InsufficientShares(arkanaShares, totalSharesToBurn);
        }

        // Burn shares from Arkana
        vault.burnShares(address(this), totalSharesToBurn);

        // Vault withdraws from Aave and sends underlying tokens to this contract
        vault.withdrawFromAave(withdrawalAssets + relayerFeeAssets, address(this));

        // Pay relayer fee in underlying tokens
        if (relayerFeeAssets > 0) {
            IERC20(tokenAddress).safeTransfer(msg.sender, relayerFeeAssets);
        }

        // Transfer withdrawal assets to receiver
        IERC20(tokenAddress).safeTransfer(receiverAddress, withdrawalAssetsAfterFee);
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    /// @notice Add a nonce discovery entry to a token's stack
    /// @param tokenAddress The token address
    /// @param x The x coordinate of the nonce discovery entry point
    /// @param y The y coordinate of the nonce discovery entry point
    /// @param nonceCommitment The nonce commitment scalar (r value) for this entry
    /// @dev This aggregates the nonce discovery entry into the token's nonceDiscoveryPoint using BJJ curve addition
    /// @dev Also tracks aggregated scalars: m += 1, r += nonceCommitment
    function _addNonceDiscoveryEntry(address tokenAddress, uint256 x, uint256 y, uint256 nonceCommitment) internal {
        CurvePoint storage tokenPoint = tokenNonceDiscoveryPoint[tokenAddress];
        BJJ.Point memory entry = BJJ.Point(x, y);

        // Initialize if needed (first entry for this token)
        if (tokenNonceDiscoveryM[tokenAddress] == 0 && tokenPoint.x == 0 && tokenPoint.y == 0) {
            // Point at infinity, just set the entry
            tokenPoint.x = x;
            tokenPoint.y = y;
            tokenNonceDiscoveryM[tokenAddress] = 1;
            tokenNonceDiscoveryR[tokenAddress] = nonceCommitment;
        } else {
            // Add the entry to the current nonce discovery point
            BJJ.Point memory newPoint = BJJ.add(BJJ.Point(tokenPoint.x, tokenPoint.y), entry);
            tokenPoint.x = newPoint.x;
            tokenPoint.y = newPoint.y;

            // Aggregate scalars: each entry has m=1, r=nonceCommitment
            // Use field reduction to ensure values stay within BN254 field modulus
            uint256 fieldModulus = Field.PRIME;
            tokenNonceDiscoveryM[tokenAddress] = (tokenNonceDiscoveryM[tokenAddress] + 1) % fieldModulus;
            tokenNonceDiscoveryR[tokenAddress] = (tokenNonceDiscoveryR[tokenAddress] + nonceCommitment) % fieldModulus;
        }
    }

  
    function send(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[17] calldata publicSignals
    ) public nonReentrant returns (uint256) {
        require(IVerifierSend(verifiersByIndex[2]).verifyProof(pA, pB, pC, publicSignals), "Invalid proof");

        address tokenAddress = address(uint160(publicSignals[0]));
        uint256 chainId = publicSignals[1];
        uint256 expectedRoot = publicSignals[2];
        uint256 receiverPublicKeyX = publicSignals[3];
        uint256 receiverPublicKeyY = publicSignals[4];
        uint256 relayerFeeAmount = publicSignals[5];
        uint256 newCommitmentLeaf = publicSignals[6];
        uint256 newNonceCommitment = publicSignals[7];
        uint256 encryptedAmount = publicSignals[8];
        bytes32 encryptedBalance = bytes32(publicSignals[9]);
        bytes32 encryptedNullifier = bytes32(publicSignals[10]);
        uint256 senderPubKeyX = publicSignals[11];
        uint256 senderPubKeyY = publicSignals[12];
        uint256 nonceDiscoveryEntryX = publicSignals[13];
        uint256 nonceDiscoveryEntryY = publicSignals[14];
        uint256 note_p_commitment_x = publicSignals[15];
        uint256 note_p_commitment_y = publicSignals[16];

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (!isHistoricalRoot(tokenAddress, expectedRoot)) {
            revert InvalidRoot();
        }

        if (usedCommitments[bytes32(newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }
        usedCommitments[bytes32(newNonceCommitment)] = true;
        usedCommitments[bytes32(newCommitmentLeaf)] = true;
        encryptedStateDetails[bytes32(newNonceCommitment)] = EncryptedStateDetails(encryptedBalance, encryptedNullifier);

        // Add the new commitment leaf to the token's merkle tree (circuit already hashed it)
        _addLeaf(tokenAddress, newCommitmentLeaf);

        // Add the nonce discovery entry to the token's stack
        _addNonceDiscoveryEntry(tokenAddress, nonceDiscoveryEntryX, nonceDiscoveryEntryY, newNonceCommitment);

        bytes32 pubkey_reference_hash = keccak256(abi.encodePacked(receiverPublicKeyX, receiverPublicKeyY));
        bytes32 note_digest = keccak256(abi.encodePacked(note_p_commitment_x, note_p_commitment_y));
        if (tokenHistoricalNoteCommitments[tokenAddress][note_digest]) {
            revert NoteAlreadyUsed();
        }

        // Store operation info for nonceCommitment (send doesn't mint shares)
        operationInfo[bytes32(newNonceCommitment)] =
            OperationInfo({operationType: OperationType.Send, sharesMinted: 0, tokenAddress: tokenAddress});

        nonceCommitmentToReceiver[bytes32(newNonceCommitment)] = CurvePoint(receiverPublicKeyX, receiverPublicKeyY);

        tokenHistoricalNoteCommitments[tokenAddress][note_digest] = true;

        tokenUserEncryptedNotes[tokenAddress][pubkey_reference_hash].push(
            EncryptedNote(encryptedAmount, CurvePoint(senderPubKeyX, senderPubKeyY))
        );

        // Get or initialize the cumulative note_stack point for this user
        CurvePoint storage currentNoteStack = tokenUserNoteStack[tokenAddress][pubkey_reference_hash];
        BJJ.Point memory newNoteCommitment = BJJ.Point(note_p_commitment_x, note_p_commitment_y);

        BJJ.Point memory updatedNoteStack;
        if (currentNoteStack.x == 0 && currentNoteStack.y == 0) {
            // First note for this user: use the note commitment as the starting point, cause 0,0 is an invalid point on curve
            updatedNoteStack = newNoteCommitment;
        } else {
            // Add the new note commitment to the existing cumulative note_stack
            updatedNoteStack = BJJ.add(BJJ.Point(currentNoteStack.x, currentNoteStack.y), newNoteCommitment);
        }

        // Update the stored cumulative note_stack point for next send
        currentNoteStack.x = updatedNoteStack.x;
        currentNoteStack.y = updatedNoteStack.y;

        // Hash the updated cumulative note_stack point to get the leaf
        Field.Type noteStackLeaf =
            poseidon2Hasher.hash_2(Field.toField(updatedNoteStack.x), Field.toField(updatedNoteStack.y));
        uint256 rootAfterNoteLeaf = _addLeaf(tokenAddress, Field.toUint256(noteStackLeaf));

        return rootAfterNoteLeaf;
    }

    /// @notice Absorb+Send: absorb notes into balance then send to receiver (same state updates as send; circuit proves absorb + send)
    /// @param pA,pB,pC Groth16 proof points (Circom/snarkjs format)
    /// @param publicSignals [token_address, chain_id, expected_root, receiver_public_key[2], relayer_fee_amount, send_relayer_fee_amount, new_commitment_leaf, new_nonce_commitment, encrypted_note[3], sender_pub_key[2], nonce_discovery_entry[2], note_commitment[2]] (20 elements, last 2 may be padding)
    function absorbSend(
        uint256[2] calldata pA,
        uint256[2][2] calldata pB,
        uint256[2] calldata pC,
        uint256[20] calldata publicSignals
    ) public nonReentrant returns (uint256) {
        require(IVerifierAbsorbSend(verifiersByIndex[4]).verifyProof(pA, pB, pC, publicSignals), "Invalid proof");

        address tokenAddress = address(uint160(publicSignals[0]));
        uint256 chainId = publicSignals[1];
        uint256 expectedRoot = publicSignals[2];
        uint256 receiverPublicKeyX = publicSignals[3];
        uint256 receiverPublicKeyY = publicSignals[4];
        uint256 relayerFeeAmount = publicSignals[5];
        uint256 sendRelayerFeeAmount = publicSignals[6];
        uint256 newCommitmentLeaf = publicSignals[7];
        uint256 newNonceCommitment = publicSignals[8];
        uint256 encryptedAmount = publicSignals[9];
        bytes32 encryptedBalance = bytes32(publicSignals[10]);
        bytes32 encryptedNullifier = bytes32(publicSignals[11]);
        uint256 senderPubKeyX = publicSignals[12];
        uint256 senderPubKeyY = publicSignals[13];
        uint256 nonceDiscoveryEntryX = publicSignals[14];
        uint256 nonceDiscoveryEntryY = publicSignals[15];
        uint256 note_p_commitment_x = publicSignals[16];
        uint256 note_p_commitment_y = publicSignals[17];

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (!isHistoricalRoot(tokenAddress, expectedRoot)) {
            revert InvalidRoot();
        }

        if (usedCommitments[bytes32(newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }
        usedCommitments[bytes32(newNonceCommitment)] = true;
        usedCommitments[bytes32(newCommitmentLeaf)] = true;
        encryptedStateDetails[bytes32(newNonceCommitment)] = EncryptedStateDetails(encryptedBalance, encryptedNullifier);

        _addLeaf(tokenAddress, newCommitmentLeaf);
        _addNonceDiscoveryEntry(tokenAddress, nonceDiscoveryEntryX, nonceDiscoveryEntryY, newNonceCommitment);

        bytes32 pubkey_reference_hash = keccak256(abi.encodePacked(receiverPublicKeyX, receiverPublicKeyY));
        bytes32 note_digest = keccak256(abi.encodePacked(note_p_commitment_x, note_p_commitment_y));
        if (tokenHistoricalNoteCommitments[tokenAddress][note_digest]) {
            revert NoteAlreadyUsed();
        }

        operationInfo[bytes32(newNonceCommitment)] =
            OperationInfo({operationType: OperationType.AbsorbSend, sharesMinted: 0, tokenAddress: tokenAddress});

        nonceCommitmentToReceiver[bytes32(newNonceCommitment)] = CurvePoint(receiverPublicKeyX, receiverPublicKeyY);

        tokenHistoricalNoteCommitments[tokenAddress][note_digest] = true;

        tokenUserEncryptedNotes[tokenAddress][pubkey_reference_hash].push(
            EncryptedNote(encryptedAmount, CurvePoint(senderPubKeyX, senderPubKeyY))
        );

        CurvePoint storage currentNoteStack = tokenUserNoteStack[tokenAddress][pubkey_reference_hash];
        BJJ.Point memory newNoteCommitment = BJJ.Point(note_p_commitment_x, note_p_commitment_y);

        BJJ.Point memory updatedNoteStack;
        if (currentNoteStack.x == 0 && currentNoteStack.y == 0) {
            updatedNoteStack = newNoteCommitment;
        } else {
            updatedNoteStack = BJJ.add(BJJ.Point(currentNoteStack.x, currentNoteStack.y), newNoteCommitment);
        }

        currentNoteStack.x = updatedNoteStack.x;
        currentNoteStack.y = updatedNoteStack.y;

        Field.Type noteStackLeaf =
            poseidon2Hasher.hash_2(Field.toField(updatedNoteStack.x), Field.toField(updatedNoteStack.y));
        uint256 rootAfterNoteLeaf = _addLeaf(tokenAddress, Field.toUint256(noteStackLeaf));

        return rootAfterNoteLeaf;
    }

    /// @notice Handle normal withdrawal (with actual vault withdrawal)
    /// @param tokenAddress The token address
    /// @param finalAmount Amount of shares to withdraw
    /// @param relayerFeeShares Relayer fee in shares
    /// @param receiverAddress Address to receive withdrawal assets
    /// @param callData Multicall3 call data (if any)
    /// @param arbitraryCalldataHash Hash of the call data for verification
    function _handleWithdrawal(
        address tokenAddress,
        uint256 finalAmount,
        uint256 relayerFeeShares,
        address receiverAddress,
        bytes calldata callData,
        bytes32 arbitraryCalldataHash
    ) internal {
        // Normal withdrawal: Process vault operations with actual withdrawal amount
        _processWithdrawVaultOperations(tokenAddress, finalAmount, relayerFeeShares, receiverAddress);

        // Execute Multicall3 call if calldata is provided
        if (callData.length > 0) {
            if (keccak256(callData) != arbitraryCalldataHash) {
                revert InvalidCalldataHash();
            }
            // Execute the Multicall3 call
            (bool success,) = multicall3Address.call(callData);
            if (!success) {
                revert Multicall3Failed();
            }
        }
    }

    /// @notice Default initial nonce discovery point
    /// @dev This is the initial point used when a token has no nonce discovery entries yet
    uint256 private constant DEFAULT_NONCE_DISCOVERY_X =
        0x098b60b4fb636ed774329d8bb20eb1f9bd2f1b53445e991de219b50739e95c16;
    uint256 private constant DEFAULT_NONCE_DISCOVERY_Y =
        0x1b82bb29393d7897d102bc412ca1b3353e78ecc738baf483fed847ef9e212997;
    uint256 private constant DEFAULT_NONCE_DISCOVERY_M = 1;
    uint256 private constant DEFAULT_NONCE_DISCOVERY_R = 1;

    /// @notice Get all information for a nonceCommitment
    /// @param nonceCommitment The nonce commitment bytes32
    /// @return operationType The type of operation (Initialize, Deposit, Send, Withdraw, Absorb)
    /// @return sharesMinted The shares minted for this operation (only for Initialize/Deposit, 0 otherwise)
    /// @return tokenAddress The token address for this operation
    /// @return encryptedBalance The encrypted balance (bytes32)
    /// @return encryptedNullifier The encrypted nullifier (bytes32)
    function getNonceCommitmentInfo(bytes32 nonceCommitment)
        public
        view
        returns (
            OperationType operationType,
            uint256 sharesMinted,
            address tokenAddress,
            bytes32 encryptedBalance,
            bytes32 encryptedNullifier
        )
    {
        OperationInfo memory info = operationInfo[nonceCommitment];
        EncryptedStateDetails memory state = encryptedStateDetails[nonceCommitment];

        return
            (info.operationType, info.sharesMinted, info.tokenAddress, state.encryptedBalance, state.encryptedNullifier);
    }

    /// @notice Get nonce discovery info for a token (consolidated getter)
    /// @param tokenAddress The token address
    /// @return x The x coordinate of the nonce discovery point (or default if empty)
    /// @return y The y coordinate of the nonce discovery point (or default if empty)
    /// @return m The aggregated M value (or default 1 if empty)
    /// @return r The aggregated R value (or default 1 if empty)
    function getNonceDiscoveryInfo(address tokenAddress)
        public
        view
        returns (uint256 x, uint256 y, uint256 m, uint256 r)
    {
        CurvePoint memory point = tokenNonceDiscoveryPoint[tokenAddress];
        uint256 storedM = tokenNonceDiscoveryM[tokenAddress];
        uint256 storedR = tokenNonceDiscoveryR[tokenAddress];

        // Check if empty (point is (0,0) and M is 0)
        bool isEmpty = point.x == 0 && point.y == 0 && storedM == 0;

        if (isEmpty) {
            return (
                DEFAULT_NONCE_DISCOVERY_X,
                DEFAULT_NONCE_DISCOVERY_Y,
                DEFAULT_NONCE_DISCOVERY_M,
                DEFAULT_NONCE_DISCOVERY_R
            );
        }

        return (point.x, point.y, storedM, storedR);
    }

    // @dev this is used just as utility, ideally this fucntion isnt needed on contract
    function computeCommitmentLeaf(uint256 x, uint256 y) public view returns (uint256) {
        Field.Type xField = Field.toField(x);
        Field.Type yField = Field.toField(y);
        Field.Type leafField = poseidon2Hasher.hash_2(xField, yField);
        return Field.toUint256(leafField);
    }

    /// @notice Calculate discounted protocol fee based on lock duration
    /// @param lockDuration The lock duration in seconds
    /// @return effective_fee_bps The effective fee in basis points
    /// @dev If lockDuration = 0: full fee applies (protocol_fee)
    /// @dev If lockDuration = discount_window: 0 fee (100% discount)
    /// @dev Linear interpolation between these two points
    function calculateDiscountedProtocolFee(uint256 lockDuration) public view returns (uint256 effective_fee_bps) {
        if (lockDuration == 0) {
            return protocol_fee; // Full fee
        }
        if (lockDuration >= discount_window) {
            return 0; // 100% discount
        }
        // Linear interpolation: fee = protocol_fee * (1 - lockDuration / discount_window)
        // effective_fee_bps = protocol_fee * (discount_window - lockDuration) / discount_window
        effective_fee_bps = (protocol_fee * (discount_window - lockDuration)) / discount_window;
    }

}
