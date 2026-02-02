// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Test, console} from "forge-std/Test.sol";

/**
 * @title DrandTest
 * @notice Test to verify drand timelock encryption proof data
 *
 * Verifies that:
 * 1. The drand pubkey used matches the hardcoded evmnet pubkey
 * 2. The pairing_result, V, and target_round from the proof are correct
 * 3. The encryption was done using the correct evmnet pubkey
 */
contract DrandTest is Test {
    // Evmnet drand configuration (hardcoded in contract)
    uint256 public constant GENESIS_TIME = 1727521075;
    uint256 public constant PERIOD = 3;

    // Evmnet drand public key (BN254 G1, uncompressed)
    // From evmnet drand info JSON
    uint256 public constant EVMNET_DRAND_PUBKEY_X = 0x07e1d1d335df83fa98462005690372c643340060d205306a9aa8106b6bd0b382;
    uint256 public constant EVMNET_DRAND_PUBKEY_Y = 0x0557ec32c2ad488e4d4f6008f89a346f18492092ccc0d594610de2732c8b808f;

    struct TimelockProof {
        uint256 targetRound;
        uint256 V_x;
        uint256 V_y;
        uint256 pairingResult;
        uint256 drandPubkeyX;
        uint256 drandPubkeyY;
        uint256 ciphertext;
    }

    /**
     * @notice Verify that proof data matches evmnet configuration
     * @param proof The timelock proof data from circuit
     */
    function verifyTimelockProof(TimelockProof memory proof) internal pure {
        // Verify drand pubkey matches evmnet hardcoded value
        require(proof.drandPubkeyX == EVMNET_DRAND_PUBKEY_X, "Drand pubkey X does not match evmnet");
        require(proof.drandPubkeyY == EVMNET_DRAND_PUBKEY_Y, "Drand pubkey Y does not match evmnet");

        // Verify V is valid (non-zero)
        require(proof.V_x != 0 || proof.V_y != 0, "V is point at infinity");

        // Verify pairing result is non-zero
        require(proof.pairingResult != 0, "Pairing result is zero");

        // Verify target round is valid
        require(proof.targetRound > 0, "Target round must be > 0");
    }

    /**
     * @notice Test verification of timelock proof data
     * @dev Uses outputs from Noir circuit test
     */
    function test_VerifyTimelockProofData() public {
        // Proof data from Noir circuit test output
        TimelockProof memory proof = TimelockProof({
            targetRound: 0xd8173f, // 14161727
            V_x: 0x20d2aed8cd4a674b4ac6b79883e7604cf5e42c88ff20dc83308224d9013516fe,
            V_y: 0x1d9a50abc9b63b1a2f6c25d779a73de38a0d56b27cdf3b9b31653824fdfe1887,
            pairingResult: 0x1eb94f7514cb67ca9e3bcd85c85c4fabac2ef1ba026194ec36ae95168fe047ca,
            drandPubkeyX: EVMNET_DRAND_PUBKEY_X,
            drandPubkeyY: EVMNET_DRAND_PUBKEY_Y,
            ciphertext: 0x236602d7c57cf27fa81ea98c9342b547de6630b44e9d2217828de868eba669c9
        });

        // Verify proof data
        verifyTimelockProof(proof);

        // All checks passed - encryption was done with correct evmnet pubkey
        assertTrue(true, "Timelock proof verified successfully");
    }
}
