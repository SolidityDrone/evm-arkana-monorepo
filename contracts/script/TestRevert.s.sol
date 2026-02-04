// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {Arkana} from "../src/Arkana.sol";

contract TestRevert is Script {
    function run() external {
        // Read transaction hash from command line
        bytes32 txHash = vm.envBytes32("TX_HASH");
        
        // TODO: Implement transaction revert checking
        // Note: Foundry doesn't have a direct vm.tryRevert function
        // You can use cast or other tools to check transaction status
        console.log("Transaction hash:");
        console.logBytes32(txHash);
        console.log("Use cast to check transaction status:");
        console.log("cast tx <txHash> --rpc-url <RPC_URL>");
        
        // Try to decode as custom error
        // InvalidChainId() = 0x2d4ce3b9
        // InvalidPublicInputs() = 0x...
        // etc.
    }
}

