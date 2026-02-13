// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";
import {Groth16Verifier} from "../src/Verifiers/VerifierEntry.sol";

/// @notice Tests the Entry circuit Groth16 verifier with a hardcoded proof that verifies against the current build.
contract EntryVerifierProofTest is Test {
    Groth16Verifier public verifier;

    // Proof + public signals from snarkjs zkey export soliditycalldata (generatecall) for Entry circuit
    uint256[2] internal pA;
    uint256[2][2] internal pB;
    uint256[2] internal pC;
    uint256[7] internal pubSignals;

    function setUp() public {
        verifier = new Groth16Verifier();

        // pA (from generatecall)
        pA[0] = 0x0e90c37623f2321a0f4fa2b564ae24b3da133ad0c83c0e8393399b30718b594a;
        pA[1] = 0x2488e2fca4b7a8ba92073074806b3ec30bd013df8b5e9497ac7cb4b571e83b62;

        // pB (generatecall order: Fp2 as im, re per EIP-197)
        pB[0][0] = 0x26cde1d6a41417ad966686649655823b5aab0d04421872b4e7cef22d492f697e;
        pB[0][1] = 0x2648f154c1c0f355670d479eaf1f4b5e0e1aecc11e7fdcc3d1853da80ee13333;
        pB[1][0] = 0x2fb056ce57885e67243440f5984d534f0defe169585395b9759be7930465fdb5;
        pB[1][1] = 0x064a0832e8b6c650dc34963ff32ab0a558dadb7976d02f503e5195f62b4b0a83;

        // pC
        pC[0] = 0x2ab8f79d6b52db62af4ab15e667f53c2a65537d7ed5d8d7afc108f9f06cd81d4;
        pC[1] = 0x190bc07f88ee936863c3b899b8d43ad4114ba9bd64139cda1be5069b85b3abe8;

        // publicSignals (from generatecall)
        pubSignals[0] = 0x1ce91513333943f99954b387f3a81c4a90f2ec6d21cc32611dec9e361de26018;
        pubSignals[1] = 0x1d36412138779faacbf3bb919b91ce8051767292e89d35ed0d3062c1c538fa62;
        pubSignals[2] = 0x2a3a6bf91180c39eb2f4bb6cccf5fc89a30c885404fada4752eff9c66b0c3932;
        pubSignals[3] = 0x221efec6daba1fce0dcd0acb05983ff5239f6e1d95ef8dd75297bcf8e690e775;
        pubSignals[4] = 0x0714347f87c93717763dfe95eedb8e4025258e2d0bcc50dedc94d6d3a63745c0;
        pubSignals[5] = 0x0000000000000000000000000000000000000000000000000000000000000002;
        pubSignals[6] = 0x0000000000000000000000000000000000000000000000000000000000000001;
    }

    function test_EntryVerifier_AcceptsProof() public view {
        bool valid = verifier.verifyProof(pA, pB, pC, pubSignals);
        assertTrue(valid, "Entry circuit verifier should accept the proof");
    }
}
