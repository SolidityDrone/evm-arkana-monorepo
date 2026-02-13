// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {Arkana} from "../src/Arkana.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";

contract SimulateInitialize is Script {
    function run() external {
        // Read args from JSON file
        string memory json = vm.readFile("../ArkanaSpellsSdk/initialize-transaction-args.json");
        
        address contractAddress = vm.parseJsonAddress(json, ".contractAddress");
        address sender = vm.parseJsonAddress(json, ".sender");
        address tokenAddress = vm.parseJsonAddress(json, ".parsedPublicInputs.tokenAddress");
        
        // Parse public inputs
        bytes32[] memory publicInputs = new bytes32[](7);
        publicInputs[0] = vm.parseJsonBytes32(json, ".args.publicInputs[0].value");
        publicInputs[1] = vm.parseJsonBytes32(json, ".args.publicInputs[1].value");
        publicInputs[2] = vm.parseJsonBytes32(json, ".args.publicInputs[2].value");
        publicInputs[3] = vm.parseJsonBytes32(json, ".args.publicInputs[3].value");
        publicInputs[4] = vm.parseJsonBytes32(json, ".args.publicInputs[4].value");
        publicInputs[5] = vm.parseJsonBytes32(json, ".args.publicInputs[5].value");
        publicInputs[6] = vm.parseJsonBytes32(json, ".args.publicInputs[6].value");
        
        uint256 amountIn = vm.parseJsonUint(json, ".args.amountIn");
        uint256 lockDuration = vm.parseJsonUint(json, ".args.lockDuration");
        
        Arkana arkana = Arkana(contractAddress);
        
        // Check conditions
        console.log("Checking conditions...");
        console.log("Chain ID from publicInputs:", uint256(publicInputs[1]));
        console.log("Block chainid:", block.chainid);
        console.log("Match:", uint256(publicInputs[1]) == block.chainid);
        
        address vaultAddress = arkana.tokenVaults(tokenAddress);
        console.log("Vault address:", vaultAddress);
        console.log("Vault initialized:", vaultAddress != address(0));
        
        bool commitmentUsed = arkana.usedCommitments(publicInputs[4]);
        console.log("Commitment used:", commitmentUsed);
        
        uint256 balance = IERC20(tokenAddress).balanceOf(sender);
        console.log("Token balance:", balance);
        console.log("Amount required:", amountIn);
        console.log("Sufficient balance:", balance >= amountIn);
        
        uint256 allowance = IERC20(tokenAddress).allowance(sender, contractAddress);
        console.log("Allowance:", allowance);
        console.log("Sufficient allowance:", allowance >= amountIn);
        
        // Try to call initialize
        console.log("\nAttempting initialize...");
        vm.startBroadcast(sender);
        
        try arkana.initialize("", publicInputs, amountIn, lockDuration) returns (uint256 root) {
            console.log("Success! Root:", root);
        } catch (bytes memory reason) {
            console.log("Reverted with reason:");
            console.logBytes(reason);
            
            // Try to decode as custom error
            if (reason.length == 0) {
                console.log("Revert without reason (custom error or require(false))");
            }
        }
        
        vm.stopBroadcast();
    }
}












