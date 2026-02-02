// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title PairingPrecompileVerifier
 * @notice Utility library for verifying dRand timelock encryption proofs using BN254 pairing
 * @dev This library provides functions to verify that timelock encryption was done correctly
 *      with the evmnet dRand public key, even before the dRand round is available.
 */
library PairingPrecompileVerifier {
    // BN254 field modulus
    uint256 internal constant BN254_FIELD_MODULUS = 0x30644e72e131a029b85045b68181585d97816a916871ca8d3c208c16d87cfd47;

    // BN254 pairing precompile address (EIP-197)
    address internal constant BN254_PAIRING_PRECOMPILE = address(0x08);

    // BN254 G2 generator (standard values)
    // Format: x = x_c0 + x_c1*i, y = y_c0 + y_c1*i
    // Precompile expects: (x_c1, x_c0, y_c1, y_c0)
    uint256 internal constant G2_X_C1 = 0x198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c2; // imaginary
    uint256 internal constant G2_X_C0 = 0x1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed; // real
    uint256 internal constant G2_Y_C1 = 0x090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b; // imaginary
    uint256 internal constant G2_Y_C0 = 0x12c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa; // real

    // Evmnet drand public key (BN254 G2)
    // From drand JSON pubkey hex, format is: (x_c1, x_c0, y_c1, y_c0)
    // Precompile expects same order: (x_c1, x_c0, y_c1, y_c0)
    uint256 internal constant EVMNET_PK_X_C1 = 0x07e1d1d335df83fa98462005690372c643340060d205306a9aa8106b6bd0b382; // imaginary
    uint256 internal constant EVMNET_PK_X_C0 = 0x0557ec32c2ad488e4d4f6008f89a346f18492092ccc0d594610de2732c8b808f; // real
    uint256 internal constant EVMNET_PK_Y_C1 = 0x0095685ae3a85ba243747b1b2f426049010f6b73a0cf1d389351d5aaaa1047f6; // imaginary
    uint256 internal constant EVMNET_PK_Y_C0 = 0x297d3a4f9749b33eb2d904c9d9ebf17224150ddd7abd7567a9bec6c74480ee0b; // real

    /**
     * @notice Verify BEFORE round: e(V, G2_gen) * e(-H, C1) == 1
     * @dev This proves V = r*H and C1 = r*G2 for the same r
     *      This ensures the encryption was done with the correct drand pubkey
     *      Can be verified even before the dRand round is available (zero-trust verification)
     * @param H_x G1 x coordinate of H = hash_to_curve(round)
     * @param H_y G1 y coordinate of H
     * @param V_x G1 x coordinate of V = r * H
     * @param V_y G1 y coordinate of V
     * @param C1_x0 G2 x.c0 coordinate of C1 = r * G2_gen (real part)
     * @param C1_x1 G2 x.c1 coordinate of C1 (imaginary part)
     * @param C1_y0 G2 y.c0 coordinate of C1 (real part)
     * @param C1_y1 G2 y.c1 coordinate of C1 (imaginary part)
     * @return true if pairing verification passes, false otherwise
     */
    function verifyPairingBeforeRound(
        uint256 H_x,
        uint256 H_y,
        uint256 V_x,
        uint256 V_y,
        uint256 C1_x0,
        uint256 C1_x1,
        uint256 C1_y0,
        uint256 C1_y1
    ) internal view returns (bool) {
        // Negate H (negate y coordinate in Fp)
        uint256 neg_H_y = BN254_FIELD_MODULUS - (H_y % BN254_FIELD_MODULUS);

        // Build pairing input: e(V, G2_gen) * e(-H, C1)
        // Format per EIP-197: (G1_x, G1_y, G2_x_c1, G2_x_c0, G2_y_c1, G2_y_c0)
        bytes memory input = abi.encodePacked(
            // Pair 1: (V, G2_gen)
            V_x,
            V_y,
            G2_X_C1,
            G2_X_C0, // x_c1 (imag), x_c0 (real)
            G2_Y_C1,
            G2_Y_C0, // y_c1 (imag), y_c0 (real)
            // Pair 2: (-H, C1)
            H_x,
            neg_H_y,
            C1_x1,
            C1_x0, // C1_x1 is c1 (imag), C1_x0 is c0 (real)
            C1_y1,
            C1_y0 // C1_y1 is c1 (imag), C1_y0 is c0 (real)
        );

        (bool success, bytes memory result) = BN254_PAIRING_PRECOMPILE.staticcall(input);

        if (!success || result.length != 32) {
            return false;
        }

        return abi.decode(result, (uint256)) == 1;
    }
}

