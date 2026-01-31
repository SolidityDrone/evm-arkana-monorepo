// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../../lib/poseidon2-evm/src/Field.sol";

/**
 * @title Poseidon2HuffWrapper
 * @dev Wrapper for Poseidon2 that provides the standard interface
 * @notice This uses the gas-optimized Huff implementation
 * @notice The Huff contract must be deployed separately (e.g., in a test or script) and its address passed to the constructor
 */
contract Poseidon2HuffWrapper {
    using Field for *;

    /// @notice The Poseidon2 Huff contract address
    address public immutable poseidon2Huff;

    /**
     * @param _poseidon2Huff The address of the deployed Huff Poseidon2 contract
     * @dev The Huff contract should be deployed using HuffDeployer in a test or deployment script
     * @dev Example in test: address huffAddr = HuffDeployer.deploy("huff/Poseidon2");
     */
    constructor(address _poseidon2Huff) {
        require(_poseidon2Huff != address(0), "Poseidon2HuffWrapper: invalid address");
        poseidon2Huff = _poseidon2Huff;
    }

    /**
     * @dev Hash a single field element using Poseidon2 (Huff implementation)
     * @param x Field element
     * @return The hash result
     */
    function hash_1(Field.Type x) public view returns (Field.Type) {
        uint256 xVal = Field.toUint256(x);
        address huffAddr = poseidon2Huff;

        uint256 result;
        assembly {
            // Store input in memory at offset 0x0
            mstore(0, xVal)

            // Staticcall the Huff contract with 0x20 bytes of calldata
            // No function selector needed - Huff contract processes raw calldata
            let success := staticcall(gas(), huffAddr, 0, 0x20, 0, 0x20)

            // Revert if call failed
            if iszero(success) {
                revert(0, 0)
            }

            // Load result from memory offset 0x0
            result := mload(0)
        }

        return Field.toFieldUnchecked(result);
    }

    /**
     * @dev Hash two field elements using Poseidon2 (Huff implementation)
     * @param x First field element
     * @param y Second field element
     * @return The hash result
     */
    function hash_2(Field.Type x, Field.Type y) public view returns (Field.Type) {
        uint256 xVal = Field.toUint256(x);
        uint256 yVal = Field.toUint256(y);
        address huffAddr = poseidon2Huff;

        uint256 result;
        assembly {
            // Store inputs in memory at offsets 0x0 and 0x20
            mstore(0, xVal)
            mstore(0x20, yVal)

            // Staticcall the Huff contract with 0x40 bytes of calldata
            // No function selector needed - Huff contract processes raw calldata
            let success := staticcall(gas(), huffAddr, 0, 0x40, 0, 0x20)

            // Revert if call failed
            if iszero(success) {
                revert(0, 0)
            }

            // Load result from memory offset 0x0
            result := mload(0)
        }

        return Field.toFieldUnchecked(result);
    }

    /**
     * @dev Hash three field elements using Poseidon2 (Huff implementation)
     * @param x First field element
     * @param y Second field element
     * @param z Third field element
     * @return The hash result
     */
    function hash_3(Field.Type x, Field.Type y, Field.Type z) public view returns (Field.Type) {
        uint256 xVal = Field.toUint256(x);
        uint256 yVal = Field.toUint256(y);
        uint256 zVal = Field.toUint256(z);
        address huffAddr = poseidon2Huff;

        uint256 result;
        assembly {
            // Store inputs in memory at offsets 0x0, 0x20, and 0x40
            mstore(0, xVal)
            mstore(0x20, yVal)
            mstore(0x40, zVal)

            // Staticcall the Huff contract with 0x60 bytes of calldata
            // No function selector needed - Huff contract processes raw calldata
            let success := staticcall(gas(), huffAddr, 0, 0x60, 0, 0x20)

            // Revert if call failed
            if iszero(success) {
                revert(0, 0)
            }

            // Load result from memory offset 0x0
            result := mload(0)
        }

        return Field.toFieldUnchecked(result);
    }
}

