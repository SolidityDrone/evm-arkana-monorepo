/**
 * Lean-IMT Helper Functions
 * Implements the same logic as Noir's test_helpers.nr
 * Uses Poseidon2Hash2 for hashing (via witness calculator)
 */

// Simulate Lean-IMT insertion
async function simulateLeanIMTInsert(leaf, currentSize, currentDepth, currentSideNodes, poseidon2Hash2) {
    const index = Number(currentSize);
    const depth = Number(currentDepth);
    
    // Calculate new depth: depth increases when 2^depth < index + 1
    const powerOf2 = Math.pow(2, depth);
    const newSize = index + 1;
    let treeDepth = depth;
    if (powerOf2 < newSize) {
        treeDepth = depth + 1;
    }
    
    let node = BigInt(leaf);
    const sideNodes = [...currentSideNodes];
    
    // Process each level (up to 32)
    for (let level = 0; level < 32; level++) {
        if (level < treeDepth) {
            // Extract bit at this level: (index >> level) & 1
            const bit = (index >> level) & 1;
            
            if (bit === 1) {
                // Right child: hash(sideNodes[level], node)
                const sibling = BigInt(sideNodes[level] || '0');
                // Hash using Poseidon2Hash2
                const hashResult = await poseidon2Hash2(sideNodes[level] || '0', node.toString());
                node = BigInt(hashResult);
            } else {
                // Left child: save node to sideNodes[level]
                sideNodes[level] = node.toString();
            }
        }
    }
    
    // Store root at sideNodes[depth]
    if (treeDepth < 32) {
        sideNodes[treeDepth] = node.toString();
    }
    
    return {
        root: node.toString(),
        depth: treeDepth,
        sideNodes: sideNodes
    };
}

// Generate merkle proof by rebuilding the tree
async function generateMerkleProof(leaf, index, treeDepth, allLeaves, treeSize, poseidon2Hash2) {
    const proof = new Array(32).fill('0');
    const depth = Number(treeDepth);
    const indexNum = Number(index);
    const sizeNum = Number(treeSize);
    
    // Build tree level by level to find sibling nodes
    let currentLevel = [...allLeaves.slice(0, sizeNum)];
    let currentLevelSize = sizeNum;
    
    for (let level = 0; level < 32; level++) {
        if (level < depth) {
            // Calculate node_index at this level = index >> level
            const nodeIndex = indexNum >> level;
            
            // Check if we're a left or right child
            const bit = nodeIndex % 2;
            
            if (bit === 1) {
                // Right child: sibling is at node_index - 1
                const siblingIndex = nodeIndex - 1;
                if (siblingIndex < currentLevelSize) {
                    proof[level] = currentLevel[siblingIndex];
                } else {
                    proof[level] = '0';
                }
            } else {
                // Left child: sibling is at node_index + 1 (if it exists)
                const siblingIndex = nodeIndex + 1;
                if (siblingIndex < currentLevelSize) {
                    proof[level] = currentLevel[siblingIndex];
                } else {
                    // No right sibling in lean-IMT
                    proof[level] = '0';
                }
            }
            
            // Build next level for next iteration
            const nextLevelSize = Math.floor((currentLevelSize - 1) / 2) + 1;
            const nextLevel = [];
            
            for (let i = 0; i < 128; i++) {
                if (i < nextLevelSize) {
                    const leftIdx = i * 2;
                    const rightIdx = leftIdx + 1;
                    
                    if (rightIdx < currentLevelSize) {
                        // Both children exist: hash them
                        const hashResult = await poseidon2Hash2(currentLevel[leftIdx], currentLevel[rightIdx]);
                        nextLevel[i] = hashResult;
                    } else if (leftIdx < currentLevelSize) {
                        // Only left child: copy it (lean-IMT property)
                        nextLevel[i] = currentLevel[leftIdx];
                    }
                }
            }
            
            currentLevel = nextLevel;
            currentLevelSize = nextLevelSize;
        }
    }
    
    return proof;
}

module.exports = {
    simulateLeanIMTInsert,
    generateMerkleProof
};

