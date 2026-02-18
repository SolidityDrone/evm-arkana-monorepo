// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Arkana} from "../src/Arkana.sol";
import {ArkanaVaultFactory} from "../src/ArkanaVaultFactory.sol";
import {PoseidonHasher} from "../src/merkle/PoseidonHasher.sol";
import {VerifiersConst} from "../src/VerifiersConst.sol";
import {IERC20Metadata} from "@oz/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract ArkanaDeployer is Script {
    function setUp() public {}

    function run() public {
        console.log("Deploying Arkana contract...");

        vm.startBroadcast();

        // Deploy PoseidonHasher (uses poseidon-solidity PoseidonT3) or use pre-deployed address
        address poseidonHasherAddress = vm.envOr("POSEIDON_HASHER_ADDRESS", address(0));
        if (poseidonHasherAddress == address(0)) {
            PoseidonHasher ph = new PoseidonHasher();
            poseidonHasherAddress = address(ph);
            console.log("Deployed new PoseidonHasher at:", poseidonHasherAddress);
        } else {
            console.log("Using existing PoseidonHasher at:", poseidonHasherAddress);
        }

        address aavePool = vm.envAddress("SEPOLIA_AAVE_POOL");
        address multicall3 = vm.envAddress("SEPOLIA_MULTICALL3");

        console.log("Using addresses:");
        console.log("  Aave Pool:", aavePool);
        console.log("  Multicall3:", multicall3);

        // Verifier addresses: from env (set by anvil_deploy.sh after Step 2) or fallback to VerifiersConst
        address[] memory verifiers = new address[](6);
        verifiers[0] = vm.parseAddress(vm.envOr("ENTRY_VERIFIER", vm.toString(VerifiersConst.ENTRY_VERIFIER)));
        verifiers[1] = vm.parseAddress(vm.envOr("DEPOSIT_VERIFIER", vm.toString(VerifiersConst.DEPOSIT_VERIFIER)));
        verifiers[2] = vm.parseAddress(vm.envOr("SEND_VERIFIER", vm.toString(VerifiersConst.SEND_VERIFIER)));
        verifiers[3] = vm.parseAddress(vm.envOr("WITHDRAW_VERIFIER", vm.toString(VerifiersConst.WITHDRAW_VERIFIER)));
        verifiers[4] = vm.parseAddress(vm.envOr("ABSORB_VERIFIER", vm.toString(VerifiersConst.ABSORB_VERIFIER)));
        verifiers[5] = vm.parseAddress(vm.envOr("ABSORB_WITHDRAW_VERIFIER", vm.toString(VerifiersConst.ABSORB_WITHDRAW_VERIFIER)));
        console.log("  ENTRY_VERIFIER:", verifiers[0]);
        console.log("  DEPOSIT_VERIFIER:", verifiers[1]);
        console.log("  SEND_VERIFIER:", verifiers[2]);
        console.log("  WITHDRAW_VERIFIER:", verifiers[3]);
        console.log("  ABSORB_VERIFIER:", verifiers[4]);
        console.log("  ABSORB_WITHDRAW_VERIFIER:", verifiers[5]);

        Arkana arkana = new Arkana(
            verifiers,
            10000,   // protocolFeeBps
            aavePool,
            100,     // protocol_fee (per-mille)
            30 days, // discount_window
            poseidonHasherAddress,
            multicall3
        );
        address arkanaAddress = address(arkana);
        console.log("Arkana deployed at:", arkanaAddress);

        ArkanaVaultFactory factory = new ArkanaVaultFactory();
        arkana.setVaultFactory(address(factory));
        console.log("ArkanaVaultFactory deployed at:", address(factory));

        try vm.envString("INITIALIZE_VAULTS_TOKENS") returns (string memory tokensEnv) {
            if (bytes(tokensEnv).length > 0) {
                console.log("Creating vaults via factory for tokens:", tokensEnv);
                string[] memory tokenStrings = vm.split(tokensEnv, ",");
                address[] memory tokenAddresses = new address[](tokenStrings.length);

                for (uint256 i = 0; i < tokenStrings.length; i++) {
                    string memory trimmed = vm.trim(tokenStrings[i]);
                    tokenAddresses[i] = vm.parseAddress(trimmed);
                    console.log("  Token", i, ":", tokenAddresses[i]);
                }

                for (uint256 i = 0; i < tokenAddresses.length; i++) {
                    address tokenAddress = tokenAddresses[i];
                    string memory symbol = IERC20Metadata(tokenAddress).symbol();
                    address vaultAddress = arkana.createVault(
                        tokenAddress,
                        string(abi.encodePacked("Arkana Vault ", symbol)),
                        "ARK"
                    );
                    console.log("  ArkanaVault for token", tokenAddress, ":", vaultAddress);
                }
            }
        } catch {}

        vm.stopBroadcast();

        console.log("");
        console.log("==========================================");
        console.log("Deployment completed successfully!");
        console.log("==========================================");
        console.log("PoseidonHasher:", poseidonHasherAddress);
        console.log("Arkana:", arkanaAddress);
        console.log("ArkanaVaultFactory:", address(factory));
        console.log("==========================================");
    }
}
