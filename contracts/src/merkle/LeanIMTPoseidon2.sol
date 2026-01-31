// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Poseidon2HuffWrapper.sol";
import "../../lib/poseidon2-evm/src/Field.sol";

// BN254 scalar field
uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

// MINIMUM TREE DEPTH = 8
// This ensures all proofs are at least 8 levels deep (supports 2^8 = 256 leaves minimum).
// Benefits:
// - Fixed minimum proof size (better for circuits with fixed arrays)
// - Consistent verification cost
// - Easier to implement in Noir (fixed array size)
//
// IMPORTANT: When the tree grows beyond depth 8, proofs created at depth 8 are still valid
// because:
// 1. The leaf's position (index) in the tree never changes
// 2. The proof path from leaf to root is still the same number of levels (8)
// 3. The root at depth 15 incorporates all previous leaves, including yours
// 4. The circuit verifies: "Given this root (depth 15), this leaf, and this 8-level proof,
//    is the leaf in the tree?" - The answer is YES, because your 8-level proof reconstructs
//    to an intermediate node that is part of the depth-15 root.
uint256 constant MIN_TREE_DEPTH = 8;

// Reuse the same data structure from lean-imt
struct LeanIMTData {
    // Tracks the current number of leaves in the tree.
    uint256 size;
    // Represents the current depth of the tree, which can increase as new leaves are inserted.
    uint256 depth;
    // A mapping from each level of the tree to the node value of the last even position at that level.
    // Used for efficient inserts, updates and root calculations.
    mapping(uint256 => uint256) sideNodes;
    // A mapping from leaf values to their respective indices in the tree.
    // This facilitates checks for leaf existence and retrieval of leaf positions.
    mapping(uint256 => uint256) leaves;
}

error WrongSiblingNodes();
error LeafGreaterThanSnarkScalarField();
error LeafCannotBeZero();
error LeafAlreadyExists();
error LeafDoesNotExist();

/// @title Lean Incremental Merkle Tree with Poseidon2
/// @dev Custom implementation of lean-IMT using Poseidon2HuffWrapper instead of PoseidonT3
library LeanIMTPoseidon2 {
    /// @dev Hash two uint256 values using Poseidon2HuffWrapper
    /// @param hasher The Poseidon2HuffWrapper instance
    /// @param left The left value
    /// @param right The right value
    /// @return The hash result
    function _hash2(Poseidon2HuffWrapper hasher, uint256 left, uint256 right) internal view returns (uint256) {
        Field.Type leftField = Field.toField(left);
        Field.Type rightField = Field.toField(right);
        Field.Type result = hasher.hash_2(leftField, rightField);
        return Field.toUint256(result);
    }

    /// @dev Inserts a new leaf into the incremental merkle tree.
    /// @param self: A storage reference to the 'LeanIMTData' struct.
    /// @param hasher: The Poseidon2HuffWrapper instance to use for hashing.
    /// @param leaf: The value of the new leaf to be inserted into the tree.
    /// @return The new hash of the node after the leaf has been inserted.
    function insert(LeanIMTData storage self, Poseidon2HuffWrapper hasher, uint256 leaf) public returns (uint256) {
        if (leaf >= SNARK_SCALAR_FIELD) {
            revert LeafGreaterThanSnarkScalarField();
        } else if (leaf == 0) {
            revert LeafCannotBeZero();
        } else if (has(self, leaf)) {
            revert LeafAlreadyExists();
        }

        uint256 index = self.size;

        // Cache tree depth to optimize gas
        uint256 treeDepth = self.depth;

        // Use the constant MIN_TREE_DEPTH

        // A new insertion can increase a tree's depth by at most 1,
        // and only if the number of leaves supported by the current
        // depth is less than the number of leaves to be supported after insertion.
        if (2 ** treeDepth < index + 1) {
            ++treeDepth;
        }

        // Ensure minimum depth of 8
        if (treeDepth < MIN_TREE_DEPTH) {
            treeDepth = MIN_TREE_DEPTH;
        }

        self.depth = treeDepth;

        uint256 node = leaf;

        for (uint256 level = 0; level < treeDepth;) {
            if ((index >> level) & 1 == 1) {
                node = _hash2(hasher, self.sideNodes[level], node);
            } else {
                self.sideNodes[level] = node;
            }

            unchecked {
                ++level;
            }
        }

        self.size = ++index;

        self.sideNodes[treeDepth] = node;
        self.leaves[leaf] = index;

        return node;
    }

    /// @dev Inserts many leaves into the incremental merkle tree.
    /// @param self: A storage reference to the 'LeanIMTData' struct.
    /// @param hasher: The Poseidon2HuffWrapper instance to use for hashing.
    /// @param leaves: The values of the new leaves to be inserted into the tree.
    /// @return The root after the leaves have been inserted.
    function insertMany(LeanIMTData storage self, Poseidon2HuffWrapper hasher, uint256[] calldata leaves)
        public
        returns (uint256)
    {
        // Early return for empty array
        if (leaves.length == 0) {
            return root(self);
        }

        // Cache tree size to optimize gas
        uint256 treeSize = self.size;

        // Check that all the new values are correct to be added.
        for (uint256 i = 0; i < leaves.length;) {
            if (leaves[i] >= SNARK_SCALAR_FIELD) {
                revert LeafGreaterThanSnarkScalarField();
            } else if (leaves[i] == 0) {
                revert LeafCannotBeZero();
            } else if (has(self, leaves[i])) {
                revert LeafAlreadyExists();
            }

            self.leaves[leaves[i]] = treeSize + 1 + i;

            unchecked {
                ++i;
            }
        }

        // Array to save the nodes that will be used to create the next level of the tree.
        uint256[] memory currentLevelNewNodes;

        currentLevelNewNodes = leaves;

        // Cache tree depth to optimize gas
        uint256 treeDepth = self.depth;

        // Calculate the depth of the tree after adding the new values.
        // Unlike the 'insert' function, we need a while here as
        // N insertions can increase the tree's depth more than once.
        while (2 ** treeDepth < treeSize + leaves.length) {
            ++treeDepth;
        }

        // Ensure minimum depth of 8
        if (treeDepth < MIN_TREE_DEPTH) {
            treeDepth = MIN_TREE_DEPTH;
        }

        self.depth = treeDepth;

        // First index to change in every level.
        uint256 currentLevelStartIndex = treeSize;

        // Size of the level used to create the next level.
        uint256 currentLevelSize = treeSize + leaves.length;

        // The index where changes begin at the next level.
        uint256 nextLevelStartIndex = currentLevelStartIndex >> 1;

        // The size of the next level.
        uint256 nextLevelSize = ((currentLevelSize - 1) >> 1) + 1;

        for (uint256 level = 0; level < treeDepth;) {
            // The number of nodes for the new level that will be created,
            // only the new values, not the entire level.
            uint256 numberOfNewNodes = nextLevelSize - nextLevelStartIndex;
            uint256[] memory nextLevelNewNodes = new uint256[](numberOfNewNodes);
            for (uint256 i = 0; i < numberOfNewNodes;) {
                uint256 leftNode;

                // Assign the left node using the saved path or the position in the array.
                if ((i + nextLevelStartIndex) * 2 < currentLevelStartIndex) {
                    leftNode = self.sideNodes[level];
                } else {
                    leftNode = currentLevelNewNodes[(i + nextLevelStartIndex) * 2 - currentLevelStartIndex];
                }

                uint256 rightNode;

                // Assign the right node if the value exists.
                if ((i + nextLevelStartIndex) * 2 + 1 < currentLevelSize) {
                    rightNode = currentLevelNewNodes[(i + nextLevelStartIndex) * 2 + 1 - currentLevelStartIndex];
                }

                uint256 parentNode;

                // Assign the parent node.
                // If it has a right child the result will be the hash(leftNode, rightNode) if not,
                // it will be the leftNode.
                if (rightNode != 0) {
                    parentNode = _hash2(hasher, leftNode, rightNode);
                } else {
                    parentNode = leftNode;
                }

                nextLevelNewNodes[i] = parentNode;

                unchecked {
                    ++i;
                }
            }

            // Update the `sideNodes` variable.
            // If `currentLevelSize` is odd, the saved value will be the last value of the array
            // if it is even and there are more than 1 element in `currentLevelNewNodes`, the saved value
            // will be the value before the last one.
            // If it is even and there is only one element, there is no need to save anything because
            // the correct value for this level was already saved before.
            if (currentLevelSize & 1 == 1) {
                self.sideNodes[level] = currentLevelNewNodes[currentLevelNewNodes.length - 1];
            } else if (currentLevelNewNodes.length > 1) {
                self.sideNodes[level] = currentLevelNewNodes[currentLevelNewNodes.length - 2];
            }

            currentLevelStartIndex = nextLevelStartIndex;

            // Calculate the next level startIndex value.
            // It is the position of the parent node which is pos/2.
            nextLevelStartIndex >>= 1;

            // Update the next array that will be used to calculate the next level.
            currentLevelNewNodes = nextLevelNewNodes;

            currentLevelSize = nextLevelSize;

            // Calculate the size of the next level.
            // The size of the next level is (currentLevelSize - 1) / 2 + 1.
            nextLevelSize = ((nextLevelSize - 1) >> 1) + 1;

            unchecked {
                ++level;
            }
        }

        // Update tree size
        self.size = treeSize + leaves.length;

        // Update tree root
        self.sideNodes[treeDepth] = currentLevelNewNodes[0];

        return currentLevelNewNodes[0];
    }

    /// @dev Checks if a leaf exists in the tree.
    /// @param self: A storage reference to the 'LeanIMTData' struct.
    /// @param leaf: The value of the leaf to check for existence.
    /// @return A boolean value indicating whether the leaf exists in the tree.
    function has(LeanIMTData storage self, uint256 leaf) public view returns (bool) {
        return self.leaves[leaf] != 0;
    }

    /// @dev Retrieves the index of a given leaf in the tree.
    /// @param self: A storage reference to the 'LeanIMTData' struct.
    /// @param leaf: The value of the leaf whose index is to be found.
    /// @return The index of the specified leaf within the tree. If the leaf is not present, the function
    /// reverts with a custom error.
    function indexOf(LeanIMTData storage self, uint256 leaf) public view returns (uint256) {
        if (self.leaves[leaf] == 0) {
            revert LeafDoesNotExist();
        }

        return self.leaves[leaf] - 1;
    }

    /// @dev Retrieves the root of the tree from the 'sideNodes' mapping using the
    /// current tree depth.
    /// @param self: A storage reference to the 'LeanIMTData' struct.
    /// @return The root hash of the tree.
    function root(LeanIMTData storage self) public view returns (uint256) {
        // If tree is empty, return 0
        if (self.size == 0) {
            return 0;
        }
        // Use effective depth (minimum 8)
        uint256 effectiveDepth = self.depth < MIN_TREE_DEPTH ? MIN_TREE_DEPTH : self.depth;
        return self.sideNodes[effectiveDepth];
    }

    /// @dev Helper function to build next level of tree
    function _buildNextLevel(Poseidon2HuffWrapper hasher, uint256[] memory currentLevel)
        private
        view
        returns (uint256[] memory)
    {
        uint256 levelSize = currentLevel.length;
        uint256 nextSize = ((levelSize - 1) >> 1) + 1;
        uint256[] memory nextLevel = new uint256[](nextSize);

        for (uint256 i = 0; i < nextSize; i++) {
            uint256 leftIdx = i << 1;
            uint256 rightIdx = leftIdx + 1;

            if (rightIdx < levelSize && currentLevel[rightIdx] != 0) {
                nextLevel[i] = _hash2(hasher, currentLevel[leftIdx], currentLevel[rightIdx]);
            } else {
                nextLevel[i] = currentLevel[leftIdx];
            }
        }

        return nextLevel;
    }

    /// @dev Generate Merkle proof for a leaf at a given index
    /// @param self: A storage reference to the 'LeanIMTData' struct.
    /// @param hasher: The Poseidon2HuffWrapper instance to use for hashing.
    /// @param leaves: Array of all leaves in the tree (must be in insertion order)
    /// @param leafIndex: The index of the leaf to generate proof for (0-based)
    /// @return proof Array of sibling hashes for the proof (length = tree depth)
    /// @notice This function rebuilds the full tree level by level to generate accurate proofs
    ///         that match the Noir verification logic
    function generateProof(
        LeanIMTData storage self,
        Poseidon2HuffWrapper hasher,
        uint256[] calldata leaves,
        uint256 leafIndex
    ) public view returns (uint256[] memory proof) {
        require(leafIndex < self.size, "Leaf index out of bounds");
        require(leaves.length == self.size, "Leaves array length must match tree size");
        require(self.depth >= MIN_TREE_DEPTH, "Tree depth must be at least 8");

        uint256 treeDepth = self.depth;
        proof = new uint256[](treeDepth);

        // Rebuild the full tree level by level (bottom-up) to extract siblings correctly
        uint256[] memory levelNodes = new uint256[](leaves.length);
        for (uint256 i = 0; i < leaves.length; i++) {
            levelNodes[i] = leaves[i];
        }

        // Build tree level by level and extract siblings at each level
        for (uint256 level = 0; level < treeDepth; level++) {
            uint256 nodeIndex = leafIndex >> level;

            // Extract sibling based on whether we're left or right child
            if ((nodeIndex & 1) == 1) {
                // Right child: sibling is on the left
                proof[level] = (nodeIndex > 0 && nodeIndex - 1 < levelNodes.length) ? levelNodes[nodeIndex - 1] : 0;
            } else {
                // Left child: sibling is on the right (if exists)
                proof[level] = (nodeIndex + 1 < levelNodes.length) ? levelNodes[nodeIndex + 1] : 0;
            }

            // Build next level for next iteration
            if (level + 1 < treeDepth) {
                levelNodes = _buildNextLevel(hasher, levelNodes);
            }
        }

        return proof;
    }
}

