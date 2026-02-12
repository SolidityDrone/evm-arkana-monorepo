// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title Generators
 * @dev Pedersen commitment generators for Baby Jubjub curve
 * @notice These generators match circomlib's standard Pedersen generators used in Circom circuits
 */
library Generators {
    // Generator G (for shares)
    uint256 public constant G_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    uint256 public constant G_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;

    // Generator H (for nullifier)
    uint256 public constant H_X = 2671756056509184035029146175565761955751135805354291559563293617232983272177;
    uint256 public constant H_Y = 2663205510731142763556352975002641716101654201788071096152948830924149045094;

    // Generator D (for spending_key)
    uint256 public constant D_X = 5802099305472655231388284418920769829666717045250560929368476121199858275951;
    uint256 public constant D_Y = 5980429700218124965372158798884772646841287887664001482443826541541529227896;

    // Generator K (for unlocks_at)
    uint256 public constant K_X = 7107336197374528537877327281242680114152313102022415488494307685842428166594;
    uint256 public constant K_Y = 2857869773864086953506483169737724679646433914307247183624878062391496185654;

    // Generator J (for nonce_commitment)
    uint256 public constant J_X = 20265828622013100949498132415626198973119240347465898028410217039057588424236;
    uint256 public constant J_Y = 1160461593266035632937973507065134938065359936056410650153315956301179689506;

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
