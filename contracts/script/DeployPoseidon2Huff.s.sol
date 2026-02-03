// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import "foundry-huff/HuffDeployer.sol";
import "foundry-huff/HuffConfig.sol";

/// @notice Deployment script for Huff Poseidon2 contract
/// @dev Deploy this first, then use the address in other contract deployments
contract DeployPoseidon2Huff is Script {
    function setUp() public {}

    function run() public returns (address poseidon2Huff) {
        console.log("Deploying Huff Poseidon2 contract...");

        // Workaround for prank/broadcast conflict:
        // HuffConfig.creation_code() calls vm.prank() which conflicts with vm.broadcast()
        // Solution: Get bytecode first (consumes the prank), then deploy manually with broadcast
        HuffConfig config = HuffDeployer.config();
        config.set_broadcast(false); // Don't use library's broadcast
        
        // Get the bytecode (this will trigger and consume the prank from creation_code)
        bytes memory bytecode = config.creation_code_with_args("huff/Poseidon2");
        
        // Now deploy manually with broadcast enabled
        vm.startBroadcast();
        address deployedAddress;
        assembly {
            deployedAddress := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        vm.stopBroadcast();
        
        require(deployedAddress != address(0), "Failed to deploy Huff Poseidon2");

        // Verify the contract actually exists on-chain (has code)
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(deployedAddress)
        }
        require(codeSize > 0, "Huff Poseidon2 contract has no code - deployment failed");

        // Verify the contract works by testing a simple hash_2 call
        // Test with inputs (1, 2) - this should not revert
        bool testSuccess;
        uint256 testResult;
        assembly {
            // Store test inputs: 1 and 2
            mstore(0, 1)
            mstore(0x20, 2)

            // Call the contract with 0x40 bytes of calldata (2 uint256s)
            let success := staticcall(gas(), deployedAddress, 0, 0x40, 0, 0x20)
            testSuccess := success

            if success {
                testResult := mload(0)
            }
        }

        if (!testSuccess) {
            revert("Huff Poseidon2 contract verification failed: hash_2(1, 2) call reverted");
        }

        console.log("[OK] Huff Poseidon2 contract verified (test hash_2(1, 2) succeeded)");

        console.log("Huff Poseidon2 deployed at:", deployedAddress);
        console.log("");
        console.log("Use this address when deploying contracts that need Poseidon2:");
        console.log("  - Arkana constructor");
        console.log("  - LeanIMT constructor");
        console.log("  - Poseidon2HuffWrapper constructor");

        return deployedAddress;
    }
}

