// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IPoseidonHasher.sol";
import "poseidon-solidity/PoseidonT3.sol";

/// @title PoseidonHasher
/// @notice Poseidon hash over two field elements using poseidon-solidity (PoseidonT3).
/// @dev Use this to hash Merkle tree nodes and commitment (x,y) for leaves. Deploy once and pass to Arkana/LeanIMT.
contract PoseidonHasher is IPoseidonHasher {
    /// @inheritdoc IPoseidonHasher
    function hash_2(uint256 x, uint256 y) external pure override returns (uint256) {
        uint256[2] memory input;
        input[0] = x;
        input[1] = y;
        return PoseidonT3.hash(input);
    }
}
