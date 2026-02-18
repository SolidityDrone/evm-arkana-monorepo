// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @notice Interface for Poseidon hasher used by LeanIMT and leaf commitment (hash of two field elements).
interface IPoseidonHasher {
    /// @notice Hash two field elements (e.g. Merkle children or commitment (x,y) for leaf).
    /// @param x First field element
    /// @param y Second field element
    /// @return Hash result in the SNARK scalar field
    function hash_2(uint256 x, uint256 y) external pure returns (uint256);
}
