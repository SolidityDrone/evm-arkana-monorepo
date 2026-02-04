// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";
import {Arkana} from "../src/Arkana.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";

contract Debugger is Test {
    Arkana public arkana;

    // Hardcoded values from initialize-transaction-args.json
    address constant ARKANA_ADDRESS = 0x71cEE012bA3B9642277f189c2C26488cAA28CF13;
    address constant SENDER = 0x1EC8CC0Ba36450965392A35dF50BeC69b14Fdd59;
    address constant TOKEN_ADDRESS = 0x29f2D40B0605204364af54EC677bD022dA425d03;
    uint256 constant AMOUNT_IN = 100; // 1 WBTC
    uint256 constant LOCK_DURATION = 0;

    function setUp() public {
        arkana = Arkana(ARKANA_ADDRESS);
        console.log("Arkana contract address:", ARKANA_ADDRESS);
    }

    function test_InitializeFromJSON() public {
        // Hardcoded public inputs from JSON
        bytes32[] memory publicInputs = new bytes32[](7);
        publicInputs[0] = 0x00000000000000000000000029f2D40B0605204364af54EC677bD022dA425d03; // tokenAddress
        publicInputs[1] = 0x0000000000000000000000000000000000000000000000000000000000aa36a7; // chainId (11155111)
        publicInputs[2] = 0x22330c0705754a5c3b3ba28b3e18603ae8bb168d923801e12e86ea06bcb4cd74; // balanceCommitmentX
        publicInputs[3] = 0x11de7f20af7eda00fd71b8c8fbb630b82a14d50de4989ec3b523e89322967415; // balanceCommitmentY
        publicInputs[4] = 0x02b981915136531135416d9c9586966a931f7cccf3fe81201259e05f6af158c9; // newNonceCommitment
        publicInputs[5] = 0x11f778e39baa13c1b1dfb322d3325dc158f7bc1e8440f10430c129b81f683ec8; // nonceDiscoveryEntryX
        publicInputs[6] = 0x0808aa015a30c810d14b74c536683315c2fda4a81113208888475712db0d78d7; // nonceDiscoveryEntryY

        console.log("Token address:", TOKEN_ADDRESS);
        console.log("Amount in:", AMOUNT_IN);
        console.log("Lock duration:", LOCK_DURATION);
        console.log("Chain ID from publicInputs:", uint256(publicInputs[1]));
        console.log("Block chainid:", block.chainid);

        // Check conditions before calling
        address vaultAddress = arkana.tokenVaults(TOKEN_ADDRESS);
        console.log("Vault address:", vaultAddress);
        console.log("Vault initialized:", vaultAddress != address(0));

        bool commitmentUsed = arkana.usedCommitments(publicInputs[4]);
        console.log("Commitment used:", commitmentUsed);

        // Give tokens to this contract (the test contract) using deal
        deal(TOKEN_ADDRESS, SENDER, AMOUNT_IN * 2); // Give 2x to be safe

        uint256 balance = IERC20(TOKEN_ADDRESS).balanceOf(SENDER);
        uint256 allowance = IERC20(TOKEN_ADDRESS).allowance(SENDER, address(arkana));
        console.log("Token balance (after deal):", balance);
        console.log("Token allowance:", allowance);
        console.log("Amount required:", AMOUNT_IN);

        // Grant approval if needed
        if (allowance < AMOUNT_IN) {
            console.log("\nApproving tokens...");
            IERC20(TOKEN_ADDRESS).approve(address(arkana), AMOUNT_IN);
            console.log("Approval granted");

            // Verify approval
            uint256 newAllowance = IERC20(TOKEN_ADDRESS).allowance(SENDER, address(arkana));
            console.log("New allowance:", newAllowance);
        } else {
            console.log("\nSufficient allowance already set");
        }

        // Use empty proof for now (proof verification is commented out anyway)
        bytes memory proof = "";

        console.log("\nCalling initialize...");
        console.log("Public inputs count:", publicInputs.length);
        vm.prank(SENDER);
        // Call initialize - this will show the revert reason with -vvv
        try arkana.initialize(proof, publicInputs, AMOUNT_IN, LOCK_DURATION) returns (uint256 root) {
            console.log("SUCCESS! Root:", root);
        } catch (bytes memory reason) {
            console.log("REVERTED with reason:");
            console.logBytes(reason);

            // Try to decode common errors
            if (reason.length == 0) {
                console.log("Revert without reason (custom error or require(false))");
            } else if (reason.length == 4) {
                bytes4 selector = bytes4(reason);
                console.log("Error selector:", vm.toString(selector));
            }

            // Re-throw to see full trace
            assembly {
                revert(add(reason, 0x20), mload(reason))
            }
        }
    }
}
