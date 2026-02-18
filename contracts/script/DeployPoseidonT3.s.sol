// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";

/// @notice Deploys the PoseidonT3 library (from poseidon-solidity).
/// @dev Run this on chains where the deterministic address 0x3333333C0A88F9BE4fd23ed0536F9B6c427e3B93
///      is not yet deployed. Then rebuild and deploy Arkana with:
///      forge build --libraries "poseidon-solidity/PoseidonT3.sol:PoseidonT3:<ADDRESS>"
///      forge script script/Arkana.s.sol --broadcast ...
contract DeployPoseidonT3 is Script {
    function run() public returns (address libAddress) {
        console.log("Deploying PoseidonT3 library...");
        vm.startBroadcast();
        // Deploy library bytecode (no constructor)
        libAddress = address(vm.deployCode("poseidon-solidity/PoseidonT3.sol:PoseidonT3"));
        vm.stopBroadcast();
        console.log("PoseidonT3 library deployed at:", libAddress);
        console.log("Then: forge build --libraries poseidon-solidity/PoseidonT3.sol:PoseidonT3:<addr> with addr above");
        return libAddress;
    }
}
