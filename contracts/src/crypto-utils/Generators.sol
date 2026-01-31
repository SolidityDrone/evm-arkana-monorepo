// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title Generators
 * @dev Pedersen commitment generators for Grumpkin curve
 * @notice These generators match the output of Noir's derive_generators("PEDERSEN_COMMITMENT_5", 0) at /circuits/lib/pedersen-commitments tests
 */
library Generators {
    // Generator G (for shares)
    uint256 public constant G_X = 0x0949873ea2ea8f16b075c794aecf36efd5da1c9c8679737e7ec1aff775cc3b5c;
    uint256 public constant G_Y = 0x1336d7f5bf34c2fe63e44461e86dd0a86b852c30d9c7213dd6c5d434ea3f9d38;

    // Generator H (for nullifier)
    uint256 public constant H_X = 0x229d4910f0d7e6fd2bed571a885241049eee73d5f9adc0d9ef2ce724aa1df3fa;
    uint256 public constant H_Y = 0x20f8c9b24f986b93052ab51f5068bc690e35e9508d5b0951b0d4cad1ea04b28e;

    // Generator D (for spending_key)
    uint256 public constant D_X = 0x2bcc449b1a2840cf9327f846fe78db60aad3ddecff43c3c3facd13aba3cb1479;
    uint256 public constant D_Y = 0x25e9a7bcc28000fc69f14bbe8a2ec561fd854ea6489f38e63ba4a40d34113717;

    // Generator K (for unlocks_at)
    uint256 public constant K_X = 0x19355291a8bf98b3533c01d677b184a4f6a4c5dd2d40f8b51c4ba0af75b89ed3;
    uint256 public constant K_Y = 0x060541537d013b7d1a38b19db2a6be1f49e0002f84b0cc237a87c288154329a7;

    // Generator J (for nonce_commitment)
    uint256 public constant J_X = 0x10ed9cb73e6d8d98631a692fbc5761871595a39b9e7ab703d177c9ba9a44837f;
    uint256 public constant J_Y = 0x1f76373da7dd8eef4dfada6743746d262ead94c38dd4192a9308aee33ea11594;

    /**
     * @dev Get generator G as a struct
     * @return x X coordinate of generator G
     * @return y Y coordinate of generator G
     */
    function getG() internal pure returns (uint256 x, uint256 y) {
        return (G_X, G_Y);
    }

    /**
     * @dev Get generator H as a struct
     * @return x X coordinate of generator H
     * @return y Y coordinate of generator H
     */
    function getH() internal pure returns (uint256 x, uint256 y) {
        return (H_X, H_Y);
    }

    /**
     * @dev Get generator D as a struct
     * @return x X coordinate of generator D
     * @return y Y coordinate of generator D
     */
    function getD() internal pure returns (uint256 x, uint256 y) {
        return (D_X, D_Y);
    }

    /**
     * @dev Get generator K as a struct
     * @return x X coordinate of generator K
     * @return y Y coordinate of generator K
     */
    function getK() internal pure returns (uint256 x, uint256 y) {
        return (K_X, K_Y);
    }

    /**
     * @dev Get generator J as a struct
     * @return x X coordinate of generator J
     * @return y Y coordinate of generator J
     */
    function getJ() internal pure returns (uint256 x, uint256 y) {
        return (J_X, J_Y);
    }
}
