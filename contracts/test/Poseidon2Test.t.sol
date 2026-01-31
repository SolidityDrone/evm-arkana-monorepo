// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/merkle/Poseidon2HuffWrapper.sol";
import "../lib/poseidon2-evm/src/Field.sol";
import "foundry-huff/HuffDeployer.sol";

contract Poseidon2Test is Test {
    Poseidon2HuffWrapper public poseidon;

    function setUp() public {
        // Deploy the Huff Poseidon2 contract first
        address poseidon2Huff = HuffDeployer.deploy("huff/Poseidon2");
        // Then deploy the wrapper with the Huff contract address
        poseidon = new Poseidon2HuffWrapper(poseidon2Huff);
    }

    function testPoseidon2HardcodedValues() public view {
        console.log("========================================================================");
        console.log("      TEST: Poseidon2 Hardcoded Values (Huff Wrapper)");
        console.log("========================================================================");
        console.log("");

        // Test 1: Hash single value (0x10)
        Field.Type input1 = Field.toField(uint256(0x0000000000000000000000000000000000000000000000000000000000000010));
        Field.Type output1 = poseidon.hash_1(input1);

        console.log("Test 1: Poseidon2::hash_1([input])");
        console.log("  Input:  %x", Field.toUint256(input1));
        console.log("  Output: %x", Field.toUint256(output1));
        console.log("");

        // Test 2: Hash the result again (2-hash chain)
        Field.Type output2 = poseidon.hash_1(output1);

        console.log("Test 2: Poseidon2::hash_1([hash1]) - 2-hash chain");
        console.log("  Input:  %x", Field.toUint256(output1));
        console.log("  Output: %x", Field.toUint256(output2));
        console.log("");

        // Test 3: 100-hash chain
        console.log("Test 3: 100-hash chain");
        Field.Type currentHash = input1;

        for (uint256 i = 0; i < 100; i++) {
            currentHash = poseidon.hash_1(currentHash);

            // Print first few iterations and every 10th
            if (i < 3 || (i + 1) % 10 == 0) {
                console.log("  Iteration %d: %x", i + 1, Field.toUint256(currentHash));
            }
        }

        console.log("");
        console.log("Final result after 100 hashes:");
        console.log("  Output: %x", Field.toUint256(currentHash));
        console.log("");
    }
}

