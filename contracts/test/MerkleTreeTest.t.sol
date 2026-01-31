// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/merkle/LeanIMTPoseidon2.sol";
import "../src/merkle/Poseidon2HuffWrapper.sol";
import "../lib/poseidon2-evm/src/Field.sol";
import "foundry-huff/HuffDeployer.sol";

/**
 * @title MerkleTreeTest
 * @dev Test that creates a Merkle tree with 32 leaves, simulates contract insertion,
 *      generates proofs for each leaf, and writes results to JSON
 */
contract MerkleTreeTest is Test {
    Poseidon2HuffWrapper public poseidon2Hasher;
    LeanIMTData public tree;

    // Store leaves and their insertion order
    uint256[] public leaves;
    uint256[] public roots;

    // Store sideNodes at each insertion point for proof generation
    mapping(uint256 => mapping(uint256 => uint256)) public sideNodesAtInsertion; // [leafIndex][level] => sideNode

    function setUp() public {
        // Deploy the Huff Poseidon2 contract first
        address poseidon2Huff = HuffDeployer.deploy("huff/Poseidon2");
        // Then deploy the wrapper with the Huff contract address
        poseidon2Hasher = new Poseidon2HuffWrapper(poseidon2Huff);
    }

    /**
     * @dev Generate a leaf by hashing two values using poseidon_hash2
     * @param x First value
     * @param y Second value
     * @return The hash result
     */
    function poseidon_hash2(uint256 x, uint256 y) public view returns (uint256) {
        Field.Type xField = Field.toField(x);
        Field.Type yField = Field.toField(y);
        Field.Type result = poseidon2Hasher.hash_2(xField, yField);
        return Field.toUint256(result);
    }

    /**
     * @dev Simulate _addLeaf by inserting a leaf and tracking sideNodes
     * @param leaf The leaf to add
     * @return The new root after insertion
     */
    function _addLeaf(uint256 leaf) public returns (uint256) {
        uint256 leafIndex = tree.size;

        // Capture sideNodes BEFORE insertion (for proof generation)
        for (uint256 level = 0; level < 32; level++) {
            sideNodesAtInsertion[leafIndex][level] = tree.sideNodes[level];
        }

        // Insert the leaf (simulating contract behavior)
        LeanIMTPoseidon2.insert(tree, poseidon2Hasher, leaf);

        uint256 newRoot = LeanIMTPoseidon2.root(tree);
        leaves.push(leaf);
        roots.push(newRoot);

        return newRoot;
    }

    /**
     * @dev Generate Merkle proof for a leaf at a given index using incremental approach
     * @param leafIndex The index of the leaf (0-based)
     * @return proof An array of sibling hashes for the proof
     */
    function generateProof(uint256 leafIndex) public view returns (uint256[] memory proof) {
        require(leafIndex < leaves.length, "Leaf index out of bounds");

        // Use the tree's actual depth (should be >= 8 due to MIN_TREE_DEPTH)
        uint256 treeDepth = tree.depth;
        require(treeDepth >= 8, "Tree depth must be at least 8");

        proof = new uint256[](treeDepth);

        // For LeanIMT, we need to rebuild the FULL tree to get accurate proofs
        // Build tree level by level (bottom-up) to extract siblings correctly
        uint256[] memory levelNodes = new uint256[](leaves.length);
        for (uint256 i = 0; i < leaves.length; i++) {
            levelNodes[i] = leaves[i];
        }

        // Build tree level by level and extract siblings at each level
        for (uint256 level = 0; level < treeDepth; level++) {
            uint256 bit = (leafIndex >> level) & 1;
            uint256 nodeIndex = leafIndex >> level;

            if (bit == 1) {
                // Right child: sibling is on the left
                if (nodeIndex > 0 && nodeIndex - 1 < levelNodes.length) {
                    proof[level] = levelNodes[nodeIndex - 1];
                } else {
                    proof[level] = 0;
                }
            } else {
                // Left child: sibling is on the right (if exists)
                if (nodeIndex + 1 < levelNodes.length) {
                    proof[level] = levelNodes[nodeIndex + 1];
                } else {
                    proof[level] = 0;
                }
            }

            // Build next level for next iteration
            if (level < treeDepth - 1) {
                uint256 levelSize = levelNodes.length;
                uint256 nextSize = ((levelSize - 1) / 2) + 1;
                uint256[] memory nextLevel = new uint256[](nextSize);

                for (uint256 i = 0; i < nextSize; i++) {
                    uint256 leftIdx = i * 2;
                    uint256 rightIdx = i * 2 + 1;

                    uint256 leftNode = levelNodes[leftIdx];
                    uint256 rightNode = 0;

                    if (rightIdx < levelSize) {
                        rightNode = levelNodes[rightIdx];
                    }

                    if (rightNode != 0) {
                        nextLevel[i] = _hash2(leftNode, rightNode);
                    } else {
                        nextLevel[i] = leftNode;
                    }
                }

                levelNodes = nextLevel;
            }
        }

        return proof;
    }

    /**
     * @dev Compute the sibling node at a specific level by rebuilding tree incrementally
     * This matches the LeanIMT incremental insertion logic exactly
     * @param targetLevel The level we need the sibling for
     * @param siblingLeafIndex The leaf index of the sibling
     * @return The sibling node value
     */
    function _computeSiblingAtLevel(
        uint256,
        /* targetLeafIndex */
        uint256 targetLevel,
        uint256 siblingLeafIndex
    )
        internal
        view
        returns (uint256)
    {
        // Rebuild tree incrementally using memory to simulate LeanIMT structure
        // Track sideNodes in memory (can't use storage in view function)
        uint256[] memory tempSideNodes = new uint256[](32);

        // Rebuild tree by inserting leaves one by one up to siblingLeafIndex
        for (uint256 i = 0; i <= siblingLeafIndex; i++) {
            uint256 leaf = leaves[i];
            uint256 index = i;
            uint256 tempDepth = 8; // MIN_TREE_DEPTH

            // Calculate depth (same as insert logic)
            if (2 ** tempDepth < index + 1) {
                tempDepth++;
            }
            if (tempDepth < 8) {
                tempDepth = 8;
            }

            uint256 node = leaf;

            // Insert logic (same as LeanIMTPoseidon2.insert)
            for (uint256 level = 0; level < tempDepth; level++) {
                if ((index >> level) & 1 == 1) {
                    // Right child: hash with left sibling
                    node = _hash2(tempSideNodes[level], node);
                } else {
                    // Left child: save current node
                    tempSideNodes[level] = node;
                }
            }

            // Store root at depth
            tempSideNodes[tempDepth] = node;
        }

        // Now we need to get the node at targetLevel for siblingLeafIndex
        // The node index at targetLevel is: siblingLeafIndex >> targetLevel
        // We need to compute what node value is at that position

        // Rebuild level by level to get the node at targetLevel
        // Start from leaves and build up
        uint256[] memory levelNodes = new uint256[](siblingLeafIndex + 1);
        for (uint256 i = 0; i <= siblingLeafIndex; i++) {
            levelNodes[i] = leaves[i];
        }

        // Build up to targetLevel
        for (uint256 level = 0; level < targetLevel; level++) {
            uint256 levelSize = levelNodes.length;
            uint256 nextSize = ((levelSize - 1) / 2) + 1;
            uint256[] memory nextLevel = new uint256[](nextSize);

            for (uint256 i = 0; i < nextSize; i++) {
                uint256 leftIdx = i * 2;
                uint256 rightIdx = i * 2 + 1;

                uint256 leftNode = levelNodes[leftIdx];
                uint256 rightNode = 0;

                if (rightIdx < levelSize) {
                    rightNode = levelNodes[rightIdx];
                }

                if (rightNode != 0) {
                    nextLevel[i] = _hash2(leftNode, rightNode);
                } else {
                    nextLevel[i] = leftNode;
                }
            }

            levelNodes = nextLevel;
        }

        // Now levelNodes is at targetLevel
        // The node index for siblingLeafIndex at targetLevel is: siblingLeafIndex >> targetLevel
        uint256 nodeIdx = siblingLeafIndex >> targetLevel;

        if (nodeIdx < levelNodes.length) {
            return levelNodes[nodeIdx];
        }

        return 0;
    }

    /**
     * @dev Hash two values using Poseidon2
     */
    function _hash2(uint256 left, uint256 right) internal view returns (uint256) {
        return LeanIMTPoseidon2._hash2(poseidon2Hasher, left, right);
    }

    /**
     * @dev Main test function that creates tree, generates proofs, and writes to JSON
     */
    function testCreateMerkleTreeAndGenerateProofs() public {
        console.log("========================================================================");
        console.log("      Creating Merkle Tree with 32 Leaves");
        console.log("========================================================================");
        console.log("");

        // Create 32 leaves using poseidon_hash2(i, i) for i from 1 to 32
        console.log("Generating 32 leaves using poseidon_hash2(i, i)...");
        for (uint256 i = 1; i <= 32; i++) {
            uint256 leaf = poseidon_hash2(i, i);
            console.log("  Leaf %d: 0x%x", i, leaf);
        }
        console.log("");

        // Insert leaves one by one (simulating contract behavior)
        console.log("Inserting leaves into Merkle tree...");
        for (uint256 i = 1; i <= 32; i++) {
            uint256 leaf = poseidon_hash2(i, i);
            uint256 root = _addLeaf(leaf);
            console.log("  Inserted leaf %d, new root: 0x%x", i, root);
        }
        console.log("");

        // Get final tree state
        uint256 finalRoot = LeanIMTPoseidon2.root(tree);
        uint256 finalDepth = tree.depth;
        uint256 finalSize = tree.size;

        console.log("Final tree state:");
        console.log("  Root: 0x%x", finalRoot);
        console.log("  Depth: %d (should be >= 8 due to MIN_TREE_DEPTH)", finalDepth);
        console.log("  Size: %d", finalSize);

        // Verify depth is at least 8 (MIN_TREE_DEPTH)
        require(finalDepth >= 8, "Tree depth must be at least 8");

        // Generate proofs for each leaf
        console.log("Generating proofs for all leaves...");
        string memory json = "{\n";
        json = string.concat(json, '  "tree": {\n');
        json = string.concat(json, string(abi.encodePacked('    "root": "0x', _toHexString(finalRoot), '",\n')));
        json = string.concat(json, string(abi.encodePacked('    "depth": ', vm.toString(finalDepth), ",\n")));
        json = string.concat(json, string(abi.encodePacked('    "size": ', vm.toString(finalSize), "\n")));
        json = string.concat(json, "  },\n");
        json = string.concat(json, '  "leaves": [\n');

        for (uint256 i = 0; i < leaves.length; i++) {
            uint256[] memory proof = generateProof(i);

            json = string.concat(json, "    {\n");
            json = string.concat(json, string(abi.encodePacked('      "index": ', vm.toString(i), ",\n")));
            json = string.concat(json, string(abi.encodePacked('      "leaf": "0x', _toHexString(leaves[i]), '",\n')));
            json = string.concat(json, string(abi.encodePacked('      "root": "0x', _toHexString(roots[i]), '",\n')));
            json = string.concat(json, '      "proof": [\n');

            for (uint256 j = 0; j < proof.length; j++) {
                json = string.concat(json, string(abi.encodePacked('        "0x', _toHexString(proof[j]), '"')));
                if (j < proof.length - 1) {
                    json = string.concat(json, ",");
                }
                json = string.concat(json, "\n");
            }

            json = string.concat(json, "      ]\n");
            json = string.concat(json, "    }");
            if (i < leaves.length - 1) {
                json = string.concat(json, ",");
            }
            json = string.concat(json, "\n");

            console.log("  Generated proof for leaf %d (index %d)", i + 1, i);
        }

        json = string.concat(json, "  ]\n");
        json = string.concat(json, "}\n");

        // Write to JSON file
        string memory filePath = "./test/merkle_tree_data.json";
        vm.writeFile(filePath, json);

        console.log("");
        console.log("========================================================================");
        console.log("      Results written to: %s", filePath);
        console.log("========================================================================");
    }

    /**
     * @dev Test with real leaves from contract
     * Uses 3 real leaves from token 0x6d906e526a4e2ca02097ba9d0caa3c382f52278e
     */
    function testCreateMerkleTreeWithRealLeaves() public {
        // Reset tree state for this test
        delete leaves;
        delete roots;
        // Reset tree by clearing size and depth (can't reassign struct with mappings)
        tree.size = 0;
        tree.depth = 0;
        // Clear sideNodes array
        for (uint256 i = 0; i < 33; i++) {
            tree.sideNodes[i] = 0;
        }

        console.log("========================================================================");
        console.log("      Creating Merkle Tree with 3 Real Leaves from Contract");
        console.log("========================================================================");
        console.log("");

        // Real leaves from contract
        uint256[3] memory realLeaves = [
            uint256(0x2a84747c6a6f48a11870eadd6fd4dd7bfd90cd9ebe56a2cee7429ace6c755a72),
            uint256(0x03910f4a0eff2ce662d8483767047e40370e6c8d8c7e40144f7f36e44b35a54b),
            uint256(0x20ea17ba0676dcc21356a3c4dd6deca0dedfd7a39995f72dd958036f6d79e8e9)
        ];

        // Expected final root from contract
        uint256 expectedFinalRoot = uint256(0x1f42741137e6601b66588bbe5ea639497c80bec9599ae2f15a55a71a69fe0277);

        console.log("Inserting 3 real leaves...");
        for (uint256 i = 0; i < 3; i++) {
            uint256 root = _addLeaf(realLeaves[i]);
            console.log("  Inserted leaf %d: 0x%x, new root: 0x%x", i + 1, realLeaves[i], root);
        }
        console.log("");

        // Get final tree state
        uint256 finalRoot = LeanIMTPoseidon2.root(tree);
        uint256 finalDepth = tree.depth;
        uint256 finalSize = tree.size;

        console.log("Final tree state:");
        console.log("  Root: 0x%x", finalRoot);
        console.log("  Expected root: 0x%x", expectedFinalRoot);
        console.log("  Root match: %s", finalRoot == expectedFinalRoot ? "YES" : "NO");
        console.log("  Depth: %d (should be >= 8 due to MIN_TREE_DEPTH)", finalDepth);
        console.log("  Size: %d", finalSize);

        // Verify depth is at least 8 (MIN_TREE_DEPTH)
        require(finalDepth >= 8, "Tree depth must be at least 8");
        console.log("");

        // Verify root matches expected
        require(finalRoot == expectedFinalRoot, "Root does not match expected root from contract");
        console.log("  Root matches expected root from contract: YES");
        console.log("");

        // Generate proofs for each leaf
        console.log("Generating proofs for all leaves...");
        string memory json = "{\n";
        json = string.concat(json, '  "tree": {\n');
        json = string.concat(json, string(abi.encodePacked('    "root": "0x', _toHexString(finalRoot), '",\n')));
        json = string.concat(json, string(abi.encodePacked('    "depth": ', vm.toString(finalDepth), ",\n")));
        json = string.concat(json, string(abi.encodePacked('    "size": ', vm.toString(finalSize), "\n")));
        json = string.concat(json, "  },\n");
        json = string.concat(json, '  "leaves": [\n');

        for (uint256 i = 0; i < leaves.length; i++) {
            uint256[] memory proof = generateProof(i);

            json = string.concat(json, "    {\n");
            json = string.concat(json, string(abi.encodePacked('      "index": ', vm.toString(i), ",\n")));
            json = string.concat(json, string(abi.encodePacked('      "leaf": "0x', _toHexString(leaves[i]), '",\n')));
            json = string.concat(json, string(abi.encodePacked('      "root": "0x', _toHexString(roots[i]), '",\n')));
            json = string.concat(json, '      "proof": [\n');

            for (uint256 j = 0; j < proof.length; j++) {
                json = string.concat(json, string(abi.encodePacked('        "0x', _toHexString(proof[j]), '"')));
                if (j < proof.length - 1) {
                    json = string.concat(json, ",");
                }
                json = string.concat(json, "\n");
            }

            json = string.concat(json, "      ]\n");
            json = string.concat(json, "    }");
            if (i < leaves.length - 1) {
                json = string.concat(json, ",");
            }
            json = string.concat(json, "\n");

            console.log("  Generated proof for leaf %d (index %d)", i + 1, i);
        }

        json = string.concat(json, "  ]\n");
        json = string.concat(json, "}\n");

        // Write to JSON file
        string memory filePath = "./test/merkle_tree_data_real.json";
        vm.writeFile(filePath, json);

        console.log("");
        console.log("========================================================================");
        console.log("      Results written to: %s", filePath);
        console.log("========================================================================");
    }

    /**
     * @dev Convert uint256 to hex string
     */
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 16;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 16)));
            if (value % 16 > 9) {
                buffer[digits] = bytes1(uint8(87 + (value % 16)));
            }
            value /= 16;
        }
        return string(buffer);
    }
}

