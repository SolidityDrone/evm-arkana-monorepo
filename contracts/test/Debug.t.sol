// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";
import {Arkana} from "../src/Arkana.sol";

/**
 * Debug test: call initialize() with exact calldata from a failing frontend simulation
 * to get a full Foundry stack trace and see where the revert happens.
 *
 * Run with fork pointing to the chain where Arkana is deployed, e.g.:
 *   FORK_URL=http://127.0.0.1:8545 forge test --match-contract Debug -vvv
 * (Replace with your Anvil/chain RPC that has Arkana at 0xc0B29f47a3F86D780CebD1FF8Ddc70CCC41c72CA)
 */
contract DebugTest is Test {
    address constant ARKANA = 0xc0B29f47a3F86D780CebD1FF8Ddc70CCC41c72CA;
    address constant SENDER = 0x1b756A927EF0D4849025887f520be10a5A9137c1;
    address constant TOKEN = 0x29f2D40B0605204364af54EC677bD022dA425d03;

    function setUp() public {
        string memory rpc = vm.envOr("FORK_URL", string("http://127.0.0.1:8545"));
        uint256 fork = vm.createFork(rpc);
        vm.selectFork(fork);
    }

    function test_Initialize_ExactFrontendCall() public {
        uint256[2] memory pA = [
            uint256(0x1c75fdeb2a54cccf70e15fb92453d2ca48fbf149488c2d5a562d3c34c2fee9c6),
            uint256(0x24f1b22eca76da8203f7ede6a2db495ee9312fa75324347886671f0dada42716)
        ];
        uint256[2][2] memory pB = [
            [uint256(0x03b88420c1b8a498116ad5e41ec8f6af30ab31cfc2de8f04f6f70e23fdcdb5c7), uint256(0x040b4e987c2c41b8a501af263667cce90dcbf52fad2076d0359dd064356374ed)],
            [uint256(0x2b9954134cd661d410ca7995733ba8fed17676587b2f0a25d27ce07f5f743f87), uint256(0x19013924e2fec9dcbef2884f54abcf8995f17544ad761d82c6d3667d579465f1)]
        ];
        uint256[2] memory pC = [
            uint256(0x1e527f4a42a656a1e3a65aa1b7cf27ceb8c02b8677a2464b221403601798d27b),
            uint256(0x19f11cc156501ecec1b32c07d648920d3c54bf042a9dc6cc3fcd962488b8c36e)
        ];
        uint256[7] memory publicSignals = [
            uint256(0x197da25aab76fa9369d6afad340ff87d623a6e35131714349180e55fb95463f1),
            uint256(0x16e27cb54058f9c6a75a9b51e21dad47cdfccc091f9b2ef31d125b0060e731ef),
            uint256(0x2348757706ab06025eeed8d1772cc65c8438f39d0a279da7f08d85d9aa5241e8),
            uint256(0x26fd179f479c18f7e445bbf9e6aab4e2641da3e68c79d87b3a636b3cc9f45ff7),
            uint256(0x05ea1cba7e3e3f61719a2edb08a85baa8175e3dcaad252e6c5ed9da1d95767e2),
            uint256(0x00000000000000000000000029f2d40b0605204364af54ec677bd022da425d03),
            uint256(0x0000000000000000000000000000000000000000000000000000000000007a69)
        ];
        uint256 amountIn = 100_000_000;
        uint256 lockDuration = 0;

        vm.prank(SENDER);
        Arkana(ARKANA).initialize(pA, pB, pC, publicSignals, amountIn, lockDuration);
    }
}
