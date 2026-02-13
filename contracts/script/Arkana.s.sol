// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Arkana} from "../src/Arkana.sol";
import {VerifiersConst} from "../src/VerifiersConst.sol";

contract ArkanaDeployer is Script {
    function setUp() public {}

    function run() public {
        console.log("Deploying Arkana contract...");
        console.log("Using verifiers from VerifiersConst:");
        console.log("  ENTRY_VERIFIER:", VerifiersConst.ENTRY_VERIFIER);
        console.log("  DEPOSIT_VERIFIER:", VerifiersConst.DEPOSIT_VERIFIER);
        console.log("  SEND_VERIFIER:", VerifiersConst.SEND_VERIFIER);
        console.log("  WITHDRAW_VERIFIER:", VerifiersConst.WITHDRAW_VERIFIER);
        console.log("  ABSORB_VERIFIER:", VerifiersConst.ABSORB_VERIFIER);

        vm.startBroadcast();

        address poseidon2Huff = vm.envAddress("POSEIDON2_HUFF_ADDRESS");
        console.log("Using Huff Poseidon2 contract address:", poseidon2Huff);

        address aavePool = vm.envAddress("SEPOLIA_AAVE_POOL");
        address multicall3 = vm.envAddress("SEPOLIA_MULTICALL3");

        console.log("Using addresses:");
        console.log("  Aave Pool:", aavePool);
        console.log("  Multicall3:", multicall3);

        // Verifier order: 0=Entry, 1=Deposit, 2=Send, 3=Withdraw, 4=AbsorbSend (per Arkana.sol)
        address[] memory verifiers = new address[](5);
        verifiers[0] = VerifiersConst.ENTRY_VERIFIER;
        verifiers[1] = VerifiersConst.DEPOSIT_VERIFIER;
        verifiers[2] = VerifiersConst.SEND_VERIFIER;
        verifiers[3] = VerifiersConst.WITHDRAW_VERIFIER;
        verifiers[4] = VerifiersConst.ABSORB_VERIFIER;

        Arkana arkana = new Arkana(
            verifiers,
            10000,   // protocolFeeBps
            aavePool,
            100,     // protocol_fee (per-mille)
            30 days, // discount_window
            poseidon2Huff,
            multicall3
        );
        address arkanaAddress = address(arkana);
        console.log("Arkana deployed at:", arkanaAddress);

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

        console.log("");
        console.log("==========================================");
        console.log("Deployment completed successfully!");
        console.log("==========================================");
        console.log("Huff Poseidon2:", poseidon2Huff);
        console.log("Arkana:", arkanaAddress);
        console.log("==========================================");
    }
}
