// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {Arkana} from "../src/Arkana.sol";

contract TestRevert is Script {
    function run() external {
        // Read transaction hash from command line
        bytes32 txHash = vm.envBytes32("TX_HASH");
        
        // Get transaction data
        (bool success, bytes memory returnData) = vm.tryRevert(txHash);
        
        if (!success) {
            console.log("Transaction did not revert");
            return;
        }
        
        console.log("Revert data:");
        console.logBytes(returnData);
        
        // Try to decode as custom error
        // InvalidChainId() = 0x2d4ce3b9
        // InvalidPublicInputs() = 0x...
        // etc.
    }
}

