// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title IArkanaVault
 * @notice Minimal interface for Arkana to interact with vaults without importing ArkanaVault.
 * @dev Vaults are deployed externally and registered via Arkana.registerVault(token, vault).
 */
interface IArkanaVault {
    function asset() external view returns (address);

    function convertToShares(uint256 assets) external view returns (uint256);

    function convertToAssets(uint256 shares) external view returns (uint256);

    function supplyToAave(uint256 amount) external;

    function balanceOf(address account) external view returns (uint256);

    function mintShares(address to, uint256 shares) external;

    function burnShares(address from, uint256 shares) external;

    function withdrawFromAave(uint256 amount, address to) external returns (uint256);
}
