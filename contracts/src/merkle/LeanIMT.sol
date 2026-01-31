// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {LeanIMTPoseidon2, LeanIMTData} from "./LeanIMTPoseidon2.sol";
import "./Poseidon2HuffWrapper.sol";

/// @title LeanIMT - Merkle Tree Operations
/// @notice Base contract that handles all merkle tree operations and historical state tracking
/// @dev This contract provides the merkle tree functionality that Arkana inherits
contract LeanIMT {
    /// @notice Historical state snapshot
    struct HistoricalState {
        uint256 root;
        uint256 depth;
        uint256 size; // Number of leaves
    }

    /// @notice The Poseidon2 hasher instance
    Poseidon2HuffWrapper public immutable poseidon2Hasher;

    /// @notice The merkle tree data structure
    LeanIMTData internal _tree;

    /// @notice Array storing all historical state snapshots
    HistoricalState[] internal _historicalStates;

    /// @notice Mapping from root to the index in historical states array
    mapping(uint256 => uint256) internal _rootToIndex;

    /// @notice Current number of leaves in the tree
    uint256 public leafCount;

    /// @notice Event emitted when a new leaf is added
    /// @param leaf The leaf value that was added
    /// @param index The index of the leaf in the tree
    /// @param root The new root after adding the leaf
    /// @param previousRoot The root before adding the leaf (0 if this is the first leaf)
    event LeafAdded(uint256 indexed leaf, uint256 index, uint256 root, uint256 previousRoot);

    /// @notice Event emitted when a new root is saved to history
    /// @param root The root that was saved
    /// @param depth The depth of the tree at this state
    /// @param size The number of leaves at this state
    /// @param index The index in the historical states array
    event RootSaved(uint256 indexed root, uint256 depth, uint256 size, uint256 index);

    /// @notice Constructor initializes the tree and Poseidon2 hasher
    /// @param _poseidon2Huff Address of the deployed Huff Poseidon2 contract (deploy separately using HuffDeployer in tests/scripts)
    constructor(address _poseidon2Huff) {
        require(_poseidon2Huff != address(0), "LeanIMT: invalid address");
        // Initialize Poseidon2 hasher with Huff contract address
        poseidon2Hasher = new Poseidon2HuffWrapper(_poseidon2Huff);

        // Initialize with empty state (root=0, depth=0, size=0)
        _historicalStates.push(HistoricalState({root: 0, depth: 0, size: 0}));
        _rootToIndex[0] = 0;
    }

    /// @notice Add a new leaf to the merkle tree
    /// @param leaf The leaf value to add (must be non-zero and less than SNARK_SCALAR_FIELD)
    /// @return The new root after adding the leaf
    function addLeaf(uint256 leaf) public returns (uint256) {
        uint256 previousRoot = LeanIMTPoseidon2.root(_tree);

        // Insert the leaf into the tree
        LeanIMTPoseidon2.insert(_tree, poseidon2Hasher, leaf);

        uint256 newRoot = LeanIMTPoseidon2.root(_tree);
        uint256 currentLeafCount = leafCount;

        // Save historical state
        _saveHistoricalRoot(newRoot);

        leafCount = currentLeafCount + 1;

        emit LeafAdded(leaf, currentLeafCount, newRoot, previousRoot);

        return newRoot;
    }

    /// @notice Add multiple leaves to the merkle tree
    /// @param leaves Array of leaf values to add
    /// @return The new root after adding all leaves
    function addLeaves(uint256[] calldata leaves) public returns (uint256) {
        uint256 previousRoot = LeanIMTPoseidon2.root(_tree);

        // Insert all leaves into the tree
        LeanIMTPoseidon2.insertMany(_tree, poseidon2Hasher, leaves);

        uint256 newRoot = LeanIMTPoseidon2.root(_tree);

        // Save historical state
        _saveHistoricalRoot(newRoot);

        leafCount += leaves.length;

        emit LeafAdded(0, leafCount - leaves.length, newRoot, previousRoot);

        return newRoot;
    }

    /// @notice Get the current root of the merkle tree
    /// @return The current root
    function getRoot() public view returns (uint256) {
        return LeanIMTPoseidon2.root(_tree);
    }

    /// @notice Get the current depth of the merkle tree
    /// @return The current depth
    function getDepth() public view returns (uint256) {
        return _tree.depth;
    }

    /// @notice Get the current size (number of leaves) of the merkle tree
    /// @return The current size
    function getSize() public view returns (uint256) {
        return _tree.size;
    }

    /// @notice Get the current tree state
    /// @return root The current root
    /// @return depth The current depth
    /// @return size The current size (number of leaves)
    function getCurrentState() public view returns (uint256 root, uint256 depth, uint256 size) {
        return (LeanIMTPoseidon2.root(_tree), _tree.depth, _tree.size);
    }

    /// @notice Check if a leaf exists in the tree
    /// @param leaf The leaf value to check
    /// @return True if the leaf exists, false otherwise
    function hasLeaf(uint256 leaf) public view returns (bool) {
        return LeanIMTPoseidon2.has(_tree, leaf);
    }

    /// @notice Get the index of a leaf in the tree
    /// @param leaf The leaf value
    /// @return The index of the leaf (reverts if leaf doesn't exist)
    function getLeafIndex(uint256 leaf) public view returns (uint256) {
        return LeanIMTPoseidon2.indexOf(_tree, leaf);
    }

    /// @notice Get the total number of historical states
    /// @return The number of historical states stored
    function getHistoricalStateCount() public view returns (uint256) {
        return _historicalStates.length;
    }

    /// @notice Get a historical state by index
    /// @param index The index in the historical states array
    /// @return The historical state at that index
    function getHistoricalState(uint256 index) public view returns (HistoricalState memory) {
        require(index < _historicalStates.length, "Index out of bounds");
        return _historicalStates[index];
    }

    /// @notice Get a historical root by index (for backwards compatibility)
    /// @param index The index in the historical states array
    /// @return The root at that index
    function getHistoricalRoot(uint256 index) public view returns (uint256) {
        require(index < _historicalStates.length, "Index out of bounds");
        return _historicalStates[index].root;
    }

    /// @notice Get all historical roots
    /// @return Array of all historical roots
    function getAllHistoricalRoots() public view returns (uint256[] memory) {
        uint256[] memory roots = new uint256[](_historicalStates.length);
        for (uint256 i = 0; i < _historicalStates.length; i++) {
            roots[i] = _historicalStates[i].root;
        }
        return roots;
    }

    /// @notice Check if a root exists in the historical states
    /// @param root The root to check
    /// @return True if the root exists in history, false otherwise
    function isHistoricalRoot(uint256 root) public view returns (bool) {
        return _rootToIndex[root] != 0 || root == _historicalStates[0].root;
    }

    /// @notice Get the historical state for a given root
    /// @param root The root to query
    /// @return The historical state (depth=0, size=0 if root doesn't exist)
    function getHistoricalStateByRoot(uint256 root) public view returns (HistoricalState memory) {
        uint256 index = _rootToIndex[root];
        if (index == 0 && root != _historicalStates[0].root) {
            // Root not found, return empty state
            return HistoricalState({root: 0, depth: 0, size: 0});
        }
        return _historicalStates[index];
    }

    /// @notice Get the depth of the tree for a given root
    /// @param root The root to query
    /// @return The depth (0 if root doesn't exist in history)
    function getRootDepth(uint256 root) public view returns (uint256) {
        uint256 index = _rootToIndex[root];
        if (index == 0 && root != _historicalStates[0].root) {
            return 0;
        }
        return _historicalStates[index].depth;
    }

    /// @notice Get the size (number of leaves) for a given root
    /// @param root The root to query
    /// @return The size (0 if root doesn't exist in history)
    function getRootSize(uint256 root) public view returns (uint256) {
        uint256 index = _rootToIndex[root];
        if (index == 0 && root != _historicalStates[0].root) {
            return 0;
        }
        return _historicalStates[index].size;
    }

    /// @notice Get the index of a root in the historical states array
    /// @param root The root to query
    /// @return The index (0 if root doesn't exist in history)
    function getRootIndex(uint256 root) public view returns (uint256) {
        return _rootToIndex[root];
    }

    /// @notice Generate Merkle proof for a leaf at a given index
    /// @param leaves Array of all leaves in the tree (must be in insertion order)
    /// @param leafIndex The index of the leaf to generate proof for (0-based)
    /// @return proof Array of sibling hashes for the proof
    /// @notice This function rebuilds the full tree level by level to generate accurate proofs
    ///         that match the Noir verification logic. The leaves array must contain all leaves
    ///         in the order they were inserted.
    function generateProof(uint256[] calldata leaves, uint256 leafIndex) public view returns (uint256[] memory proof) {
        return LeanIMTPoseidon2.generateProof(_tree, poseidon2Hasher, leaves, leafIndex);
    }

    /// @notice Internal function to save a root to historical state
    /// @param root The root to save
    function _saveHistoricalRoot(uint256 root) internal {
        // Only save if this root hasn't been saved before
        if (_rootToIndex[root] == 0 && root != _historicalStates[0].root) {
            uint256 index = _historicalStates.length;
            uint256 depth = _tree.depth;
            uint256 size = _tree.size;

            _historicalStates.push(HistoricalState({root: root, depth: depth, size: size}));
            _rootToIndex[root] = index;

            emit RootSaved(root, depth, size, index);
        }
    }
}
