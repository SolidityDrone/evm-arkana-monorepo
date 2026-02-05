// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Arkana} from "../src/Arkana.sol";
import {TLswapRegister} from "../src/tl-limit/TLswapRegister.sol";
import {VerifiersConst} from "../src/VerifiersConst.sol";

contract ArkanaDeployer is Script {
    function setUp() public {}

    function run() public {
        console.log("Deploying Arkana contract...");
        console.log("Using verifiers from VerifiersConst:");
        console.log("  ENTRY_VERIFIER:", VerifiersConst.ENTRY_VERIFIER);
        console.log("  DEPOSIT_VERIFIER:", VerifiersConst.DEPOSIT_VERIFIER);
        console.log("  WITHDRAW_VERIFIER:", VerifiersConst.WITHDRAW_VERIFIER);
        console.log("  SEND_VERIFIER:", VerifiersConst.SEND_VERIFIER);
        console.log("  ABSORB_VERIFIER:", VerifiersConst.ABSORB_VERIFIER);

        vm.startBroadcast();

        // Step 1: Get Huff Poseidon2 contract address from environment
        address poseidon2Huff = vm.envAddress("POSEIDON2_HUFF_ADDRESS");
        console.log("Using Huff Poseidon2 contract address:", poseidon2Huff);

        // Step 2: Load addresses from environment
        address aavePool = vm.envAddress("SEPOLIA_AAVE_POOL");
        address multicall3 = vm.envAddress("SEPOLIA_MULTICALL3");
        address uniswapRouter = vm.envAddress("SEPOLIA_UNIVERSAL_ROUTER");

        // Step 3: Deploy TLswapRegister first (with address(0) for arkana, will be set later)
        console.log("Deploying TLswapRegister...");
        TLswapRegister tlswapRegister = new TLswapRegister(address(0), uniswapRouter, poseidon2Huff);
        address tlswapRegisterAddress = address(tlswapRegister);
        console.log("TLswapRegister deployed at:", tlswapRegisterAddress);

        // Step 4: Deploy Arkana with the Huff contract address and TLswapRegister address
        address[] memory verifiers = new address[](5);
        verifiers[0] = VerifiersConst.ENTRY_VERIFIER;
        verifiers[1] = VerifiersConst.DEPOSIT_VERIFIER;
        verifiers[2] = VerifiersConst.WITHDRAW_VERIFIER;
        verifiers[3] = VerifiersConst.SEND_VERIFIER;
        verifiers[4] = VerifiersConst.ABSORB_VERIFIER;

        // protocol_fee: 0 for testing, discount_window: 1000 seconds
        Arkana arkana = new Arkana(verifiers, 0, aavePool, 0, 1000, poseidon2Huff, multicall3, tlswapRegisterAddress);
        address arkanaAddress = address(arkana);
        console.log("Arkana deployed at:", arkanaAddress);

        // Step 5: Set Arkana address on TLswapRegister
        console.log("Setting Arkana address on TLswapRegister...");
        tlswapRegister.setArkana(arkanaAddress);
        console.log("TLswapRegister.arkana set to:", arkanaAddress);

        // Step 3: Initialize regular ArkanaVaults for tokens (if provided)
        try vm.envString("INITIALIZE_VAULTS_TOKENS") returns (string memory tokensEnv) {
            if (bytes(tokensEnv).length > 0) {
                console.log("Initializing ArkanaVaults for tokens:", tokensEnv);
                string[] memory tokenStrings = vm.split(tokensEnv, ",");
                address[] memory tokenAddresses = new address[](tokenStrings.length);

                for (uint256 i = 0; i < tokenStrings.length; i++) {
                    string memory trimmed = vm.trim(tokenStrings[i]);
                    tokenAddresses[i] = vm.parseAddress(trimmed);
                    console.log("  Token", i, ":", tokenAddresses[i]);
                }

                arkana.initializeVaults(tokenAddresses);

                for (uint256 i = 0; i < tokenAddresses.length; i++) {
                    address vaultAddress = arkana.tokenVaults(tokenAddresses[i]);
                    console.log("  ArkanaVault for token", tokenAddresses[i], ":", vaultAddress);
                }
            }
        } catch {}

        vm.stopBroadcast();

        // Log final addresses
        console.log("");
        console.log("==========================================");
        console.log("Deployment completed successfully!");
        console.log("==========================================");
        console.log("Huff Poseidon2:", poseidon2Huff);
        console.log("TLswapRegister:", tlswapRegisterAddress);
        console.log("Arkana:", arkanaAddress);
        console.log("==========================================");
    }
}
