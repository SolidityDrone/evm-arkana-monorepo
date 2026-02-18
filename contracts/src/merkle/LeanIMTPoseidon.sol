// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IPoseidonHasher.sol";

// BN254 scalar field
uint256 constant SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

// MINIMUM TREE DEPTH = 8
// This ensures all proofs are at least 8 levels deep (supports 2^8 = 256 leaves minimum).
uint256 constant MIN_TREE_DEPTH = 8;

// Reuse the same data structure from lean-imt
struct LeanIMTData {
    uint256 size;
    uint256 depth;
    mapping(uint256 => uint256) sideNodes;
    mapping(uint256 => uint256) leaves;
}

error WrongSiblingNodes();
error LeafGreaterThanSnarkScalarField();
error LeafCannotBeZero();
error LeafAlreadyExists();
error LeafDoesNotExist();

/// @title Lean Incremental Merkle Tree with Poseidon (poseidon-solidity)
/// @dev Uses IPoseidonHasher (PoseidonT3) for hashing two field elements.
library LeanIMTPoseidon {
    function _hash2(IPoseidonHasher hasher, uint256 left, uint256 right) internal view returns (uint256) {
        return hasher.hash_2(left, right);
    }

    function insert(LeanIMTData storage self, IPoseidonHasher hasher, uint256 leaf) public returns (uint256) {
        if (leaf >= SNARK_SCALAR_FIELD) {
            revert LeafGreaterThanSnarkScalarField();
        } else if (leaf == 0) {
            revert LeafCannotBeZero();
        } else if (has(self, leaf)) {
            revert LeafAlreadyExists();
        }

        uint256 index = self.size;
        uint256 treeDepth = self.depth;

        if (2 ** treeDepth < index + 1) {
            ++treeDepth;
        }
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

    function has(LeanIMTData storage self, uint256 leaf) public view returns (bool) {
        return self.leaves[leaf] != 0;
    }

    function indexOf(LeanIMTData storage self, uint256 leaf) public view returns (uint256) {
        if (self.leaves[leaf] == 0) {
            revert LeafDoesNotExist();
        }
        return self.leaves[leaf] - 1;
    }

    function root(LeanIMTData storage self) public view returns (uint256) {
        if (self.size == 0) {
            return 0;
        }
        uint256 effectiveDepth = self.depth < MIN_TREE_DEPTH ? MIN_TREE_DEPTH : self.depth;
        return self.sideNodes[effectiveDepth];
    }

    function _buildNextLevel(IPoseidonHasher hasher, uint256[] memory currentLevel)
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

    function generateProof(
        LeanIMTData storage self,
        IPoseidonHasher hasher,
        uint256[] calldata leaves,
        uint256 leafIndex
    ) public view returns (uint256[] memory proof) {
        require(leafIndex < self.size, "Leaf index out of bounds");
        require(leaves.length == self.size, "Leaves array length must match tree size");
        require(self.depth >= MIN_TREE_DEPTH, "Tree depth must be at least 8");

        uint256 treeDepth = self.depth;
        proof = new uint256[](treeDepth);

        uint256[] memory levelNodes = new uint256[](leaves.length);
        for (uint256 i = 0; i < leaves.length; i++) {
            levelNodes[i] = leaves[i];
        }

        for (uint256 level = 0; level < treeDepth; level++) {
            uint256 nodeIndex = leafIndex >> level;

            if ((nodeIndex & 1) == 1) {
                proof[level] = (nodeIndex > 0 && nodeIndex - 1 < levelNodes.length) ? levelNodes[nodeIndex - 1] : 0;
            } else {
                proof[level] = (nodeIndex + 1 < levelNodes.length) ? levelNodes[nodeIndex + 1] : 0;
            }

            if (level + 1 < treeDepth) {
                levelNodes = _buildNextLevel(hasher, levelNodes);
            }
        }

        return proof;
    }
}
