// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {IPool} from "@aave/core-v3/interfaces/IPool.sol";
import "./Arkana.sol";
import "./ArkanaVault.sol";

/**
 * @title ArkanaVaultFactory
 * @notice Deploys one ArkanaVault per token via CREATE2 (deterministic address). Only Arkana can create vaults.
 * @dev On deploy, asset is set from Aave reserve (aToken if supported, else underlying). initialize() on vault sets aaveVault.
 */
contract ArkanaVaultFactory {
    error OnlyArkana();
    error VaultAlreadyExists();

    /// @notice Deploy a vault for a token (one per token). Callable only by Arkana.
    /// @param arkanaAddress The Arkana contract (must be msg.sender)
    /// @param tokenAddress Underlying token address
    /// @param name_ Vault share token name
    /// @param symbol_ Vault share token symbol
    /// @return vaultAddress The deployed vault address (deterministic via CREATE2 for same token)
    function createVault(address arkanaAddress, address tokenAddress, string calldata name_, string calldata symbol_)
        external
        returns (address vaultAddress)
    {
        if (msg.sender != arkanaAddress) revert OnlyArkana();
        if (tokenAddress == address(0)) revert VaultAlreadyExists(); // use as zero check

        Arkana arkana = Arkana(arkanaAddress);
        IPool pool = arkana.aavePool();
        address asset;
        {
            address aTokenAddress = pool.getReserveData(tokenAddress).aTokenAddress;
            asset = aTokenAddress != address(0) ? aTokenAddress : tokenAddress;
        }

        bytes32 salt = keccak256(abi.encodePacked(tokenAddress));
        ArkanaVault vault = new ArkanaVault{salt: salt}(
            IERC20(asset),
            arkana,
            tokenAddress,
            pool,
            name_,
            symbol_
        );
        vaultAddress = address(vault);
        vault.initialize();
        return vaultAddress;
    }

    /// @notice Predict vault address for a token (CREATE2). One deterministic address per token.
    /// @param tokenAddress Underlying token address
    function predictVaultAddress(address tokenAddress) external view returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(tokenAddress));
        bytes memory creationCode = type(ArkanaVault).creationCode;
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(creationCode)));
        return address(uint160(uint256(hash)));
    }
}
