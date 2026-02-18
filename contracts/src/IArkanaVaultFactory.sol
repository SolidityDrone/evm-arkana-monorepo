// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IArkanaVaultFactory {
    function createVault(address arkana, address tokenAddress, string calldata name_, string calldata symbol_)
        external
        returns (address vaultAddress);
}
