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

// MIN_TREE_DEPTH constant (must match LeanIMTPoseidon2.sol)
uint256 constant MIN_TREE_DEPTH = 8;

contract Arkana is AccessControl {
    using SafeERC20 for IERC20;
    /// @notice Role for initializing vaults
    bytes32 public constant VAULT_INITIALIZER_ROLE = keccak256("ARKANA");
    /// @notice Mapping from verifier index to verifier address
    /// @dev Index 0 = Entry, 1 = Deposit, 2 = Send, 3 = Withdraw, 4 = Absorb
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

    uint256 public TIME_TOLERANCE = 30 minutes;
    /// @notice Mapping from token address to its ERC4626 vault address
    /// @dev Each token can have one vault for standard ERC4626 interface
    /// @dev The vault tracks all shares and handles ERC4626 conversions
    mapping(address token => address vault) public tokenVaults;

    /// @notice Mapping from underlying token address to its Aave aToken address
    /// @dev Used to track which aToken corresponds to each underlying token
    /// @dev The vault's asset is the aToken, not the underlying token
    mapping(address token => address aToken) public tokenToAToken;

    /// @notice Global mappings (domain-separated by nonce commitment which includes token address)
    mapping(bytes32 => bool) public usedCommitments;

    /// @notice Historical state snapshot
    struct HistoricalState {
        uint256 root;
        uint256 depth;
        uint256 size; // Number of leaves
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

    /// @notice Constructor initializes verifiers, protocol fee, and Aave Pool
    /// @param _verifiers Array of verifier addresses: [Entry, Deposit, Send, Withdraw, Absorb]
    /// @param _protocolFeeBps Protocol fee in basis points (100 = 1%, 500 = 5%)
    /// @param _aavePool Address of the Aave v3 Pool contract
    /// @param _protocol_fee Protocol fee in basis points (10000 = 100%, 100 = 1%, 5 = 0.05%)
    /// @param _discount_window Discount window in seconds (e.g., 2592000 = 30 days)
    /// @param _poseidon2Huff Address of the deployed Huff Poseidon2 contract (deploy separately using HuffDeployer in tests/scripts)
    constructor(
        address[] memory _verifiers,
        uint256 _protocolFeeBps,
        address _aavePool,
        uint256 _protocol_fee,
        uint256 _discount_window,
        address _poseidon2Huff
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
        protocol_fee = _protocol_fee;

        // Initialize discount window
        discount_window = _discount_window;

        // Initialize Aave Pool
        aavePool = IPool(_aavePool);

        // Initialize Poseidon2 hasher with Huff contract address
        poseidon2Hasher = new Poseidon2HuffWrapper(_poseidon2Huff);
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

    /// @notice Compute commitment leaf hash from commitment point coordinates
    /// @param x The x coordinate of the commitment point
    /// @param y The y coordinate of the commitment point
    /// @return The leaf hash computed using the contract's Poseidon2 implementation
    /// @dev This ensures the frontend uses the same hash function as the contract
    /// @dev Matches: poseidon2Hasher.hash_2(Field.toField(x), Field.toField(y))
    function computeCommitmentLeaf(uint256 x, uint256 y) public view returns (uint256) {
        Field.Type xField = Field.toField(x);
        Field.Type yField = Field.toField(y);
        Field.Type leafField = poseidon2Hasher.hash_2(xField, yField);
        return Field.toUint256(leafField);
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
    /// @param publicInputs The public inputs for verification (contains pub params + pub outputs)
    /// @dev publicInputs structure: [token_address, amount, chain_id, balance_commitment_x, balance_commitment_y, new_nonce_commitment, nonce_discovery_entry_x, nonce_discovery_entry_y]
    /// @return The new root after adding the commitment
    function initialize(bytes calldata proof, bytes32[] calldata publicInputs, uint256 amountIn, uint256 lockDuration)
        public
        returns (uint256)
    {
        // Verify proof using Entry verifier (index 0)
        //require(IVerifier(verifiersByIndex[0]).verify(proof, publicInputs), "Invalid proof");

        // Validate publicInputs array length (requires 7 elements)
        if (publicInputs.length < 7) {
            revert InvalidPublicInputs();
        }

        address tokenAddress = address(uint160(uint256(publicInputs[0])));
        uint256 chainId = uint256(publicInputs[1]);
        uint256 balanceCommitmentX = uint256(publicInputs[2]);
        uint256 balanceCommitmentY = uint256(publicInputs[3]);
        uint256 newNonceCommitment = uint256(publicInputs[4]);
        uint256 nonceDiscoveryEntryX = uint256(publicInputs[5]);
        uint256 nonceDiscoveryEntryY = uint256(publicInputs[6]);

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (usedCommitments[bytes32(newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }

        usedCommitments[bytes32(newNonceCommitment)] = true;

        // TODO: post-proof commitment to be implemented with a vault and aave
        return 0;
    }

    /// @notice Deposit function - adds funds to existing balance
    /// @param proof The zero-knowledge proof
    /// @param publicInputs The public inputs for verification (contains pub params + pub outputs)
    /// @dev publicInputs structure:
    ///      Public inputs (4): [token_address, amount, chain_id, expected_root]
    ///      Public outputs (7): [pedersen_commitment[2], new_nonce_commitment, encrypted_state_details[2], nonce_discovery_entry[2]]
    ///      Total: 11 elements
    /// @return The new root after adding the commitment
    function deposit(bytes calldata proof, bytes32[] calldata publicInputs) public returns (uint256) {
        // Verify proof using Deposit verifier (index 1)
        //require(IVerifier(verifiersByIndex[1]).verify(proof, publicInputs), "Invalid proof");

        // Validate publicInputs array length (requires 11 elements: 4 public inputs + 7 public outputs)
        if (publicInputs.length < 11) {
            revert InvalidPublicInputs();
        }

        // Parse public inputs (first 4 elements)
        address tokenAddress = address(uint160(uint256(publicInputs[0]))); // token_address
        uint256 amountIn = uint256(publicInputs[1]); // amount (from circuit, for verification)
        uint256 chainId = uint256(publicInputs[2]); // chain_id
        uint256 expectedRoot = uint256(publicInputs[3]); // expected_root

        // Parse public outputs (next 7 elements)
        uint256 pedersenCommitmentX = uint256(publicInputs[4]); // commitment.x
        uint256 pedersenCommitmentY = uint256(publicInputs[5]); // commitment.y
        bytes32 encryptedBalance = bytes32(publicInputs[6]); // encrypted_state_details[0]
        bytes32 encryptedNullifier = bytes32(publicInputs[7]); // encrypted_state_details[1]
        uint256 nonceDiscoveryEntryX = uint256(publicInputs[8]); // nonce_discovery_entry.x
        uint256 nonceDiscoveryEntryY = uint256(publicInputs[9]); // nonce_discovery_entry.y
        uint256 newNonceCommitment = uint256(publicInputs[10]); // new_nonce_commitment

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

        // TODO: post-proof commitment to be implemented with a vault and aave
        return 0;
    }

    /// @notice Withdraw function - withdraws funds from balance
    /// @param publicInputs The public inputs for verification (contains pub params + pub outputs)
    /// @return newRoot The new root after adding the commitment
    /// @dev publicInputs structure: [token_address, amount (in shares), chain_id, declared_time_reference, expected_root, arbitrary_calldata_hash, receiver_address, relayer_fee_amount (in shares), pedersen_commitment[2], new_nonce_commitment, encrypted_state_details[2], nonce_discovery_entry[2]]
    function withdraw(
        bytes calldata,
        /* proof */
        bytes32[] calldata publicInputs,
        bytes calldata /* call */
    )
        public
        returns (uint256 newRoot)
    {
        // Verify proof using Withdraw verifier (index 3)
        //require(IVerifier(verifiersByIndex[3]).verify(proof, publicInputs), "Invalid proof");

        // Validate publicInputs array length (requires 15 elements: 8 public inputs + 7 public outputs)
        if (publicInputs.length < 15) {
            revert InvalidPublicInputs();
        }

        // Parse public inputs in correct order
        address tokenAddress = address(uint160(uint256(publicInputs[0]))); // token_address
        uint256 sharesAmount = uint256(publicInputs[1]); // amount (in shares)
        uint256 chainId = uint256(publicInputs[2]); // chain_id
        uint256 declaredTimeReference = uint256(publicInputs[3]); // declared_time_reference
        uint256 expectedRoot = uint256(publicInputs[4]); // expected_root
        bytes32 arbitraryCalldataHash = publicInputs[5]; // arbitrary_calldata_hash
        address receiverAddress = address(uint160(uint256(publicInputs[6]))); // receiver_address
        uint256 relayerFeeShares = uint256(publicInputs[7]); // relayer_fee_amount (in shares)

        // Parse public outputs
        uint256 pedersenCommitmentX = uint256(publicInputs[8]); // pedersen_commitment.x
        uint256 pedersenCommitmentY = uint256(publicInputs[9]); // pedersen_commitment.y
        uint256 newNonceCommitment = uint256(publicInputs[10]); // new_nonce_commitment
        bytes32 encryptedBalance = bytes32(publicInputs[11]); // encrypted_state_details[0]
        bytes32 encryptedNullifier = bytes32(publicInputs[12]); // encrypted_state_details[1]
        uint256 nonceDiscoveryEntryX = uint256(publicInputs[13]); // nonce_discovery_entry.x
        uint256 nonceDiscoveryEntryY = uint256(publicInputs[14]); // nonce_discovery_entry.y

        if (chainId != block.chainid) {
            revert InvalidChainId();
        }

        if (!isHistoricalRoot(tokenAddress, expectedRoot)) {
            revert InvalidRoot();
        }

        uint256 timeDifference = declaredTimeReference > block.timestamp
            ? declaredTimeReference - block.timestamp
            : block.timestamp - declaredTimeReference;
        if (timeDifference > 30 minutes) {
            revert InvalidTimeReference();
        }

        if (usedCommitments[bytes32(newNonceCommitment)]) {
            revert CommitmentAlreadyUsed();
        }

        usedCommitments[bytes32(newNonceCommitment)] = true;

        // TODO: post-proof commitment to be implemented with a vault and aave
        return 0;
    }
}
