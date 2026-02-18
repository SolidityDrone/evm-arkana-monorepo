// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/**
 * @title Generators
 * @dev Only G and K (used by Arkana). GeneratorsFull in same file for tests.
 */
library Generators {
    uint256 public constant G_X = 10457101036533406547632367118273992217979173478358440826365724437999023779287;
    uint256 public constant G_Y = 19824078218392094440610104313265183977899662750282163392862422243483260492317;
    uint256 public constant K_X = 7107336197374528537877327281242680114152313102022415488494307685842428166594;
    uint256 public constant K_Y = 2857869773864086953506483169737724679646433914307247183624878062391496185654;

    function getG() internal pure returns (uint256 x, uint256 y) {
        return (G_X, G_Y);
    }

    function getK() internal pure returns (uint256 x, uint256 y) {
        return (K_X, K_Y);
    }
}
