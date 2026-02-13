//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

import {Groth16Verifier as VerifierEntry} from "../src/Verifiers/VerifierEntry.sol";
import {Groth16Verifier as VerifierDeposit} from "../src/Verifiers/VerifierDeposit.sol";
import {Groth16Verifier as VerifierWithdraw} from "../src/Verifiers/VerifierWithdraw.sol";
import {Groth16Verifier as VerifierSend} from "../src/Verifiers/VerifierSend.sol";
import {Groth16Verifier as VerifierAbsorbSend} from "../src/Verifiers/VerifierAbsorbSend.sol";
import {Groth16Verifier as VerifierAbsorbWithdraw} from "../src/Verifiers/VerifierAbsorbWithdraw.sol";

/**
 * @title VerifierDeployer
 * @notice Deploy all 6 Circom2 Groth16 verifiers at once
 */
contract VerifierDeployer is Script {
    function setUp() public {}

    function run() public {
        console.log("Deploying all 6 Circom2 Groth16 verifiers...");

        vm.startBroadcast();

        console.log("Deploying Entry Verifier...");
        VerifierEntry entryVerifier = new VerifierEntry();
        address entryAddress = address(entryVerifier);
        console.log("Entry Verifier deployed at:", entryAddress);

        console.log("Deploying Deposit Verifier...");
        VerifierDeposit depositVerifier = new VerifierDeposit();
        address depositAddress = address(depositVerifier);
        console.log("Deposit Verifier deployed at:", depositAddress);

        console.log("Deploying Withdraw Verifier...");
        VerifierWithdraw withdrawVerifier = new VerifierWithdraw();
        address withdrawAddress = address(withdrawVerifier);
        console.log("Withdraw Verifier deployed at:", withdrawAddress);

        console.log("Deploying Send Verifier...");
        VerifierSend sendVerifier = new VerifierSend();
        address sendAddress = address(sendVerifier);
        console.log("Send Verifier deployed at:", sendAddress);

        console.log("Deploying AbsorbSend Verifier...");
        VerifierAbsorbSend absorbSendVerifier = new VerifierAbsorbSend();
        address absorbSendAddress = address(absorbSendVerifier);
        console.log("AbsorbSend Verifier deployed at:", absorbSendAddress);

        console.log("Deploying AbsorbWithdraw Verifier...");
        VerifierAbsorbWithdraw absorbWithdrawVerifier = new VerifierAbsorbWithdraw();
        address absorbWithdrawAddress = address(absorbWithdrawVerifier);
        console.log("AbsorbWithdraw Verifier deployed at:", absorbWithdrawAddress);

        vm.stopBroadcast();

        address[6] memory addresses =
            [entryAddress, depositAddress, withdrawAddress, sendAddress, absorbSendAddress, absorbWithdrawAddress];
        writeVerifiersConst(addresses);
    }

    function writeVerifiersConst(address[6] memory addresses) internal {
        string memory header =
            "//SPDX-License-Identifier: UNLICENSED\npragma solidity ^0.8.13;\n\nlibrary VerifiersConst {\n";

        string memory entry =
            string(abi.encodePacked("    address public constant ENTRY_VERIFIER = ", vm.toString(addresses[0]), ";\n"));
        string memory deposit = string(
            abi.encodePacked("    address public constant DEPOSIT_VERIFIER = ", vm.toString(addresses[1]), ";\n")
        );
        string memory withdraw = string(
            abi.encodePacked("    address public constant WITHDRAW_VERIFIER = ", vm.toString(addresses[2]), ";\n")
        );
        string memory send =
            string(abi.encodePacked("    address public constant SEND_VERIFIER = ", vm.toString(addresses[3]), ";\n"));
        string memory absorbSend = string(
            abi.encodePacked("    address public constant ABSORB_VERIFIER = ", vm.toString(addresses[4]), ";\n")
        );
        string memory absorbWithdraw = string(
            abi.encodePacked("    address public constant ABSORB_WITHDRAW_VERIFIER = ", vm.toString(addresses[5]), ";\n")
        );

        string memory footer = "}\n";

        string memory content = string(
            abi.encodePacked(header, entry, deposit, withdraw, send, absorbSend, absorbWithdraw, footer)
        );

        vm.writeFile("src/VerifiersConst.sol", content);
    }
}
