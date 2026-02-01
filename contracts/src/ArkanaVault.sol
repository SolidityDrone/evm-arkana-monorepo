// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@oz/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@oz/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@oz/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@oz/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@oz/contracts/utils/math/Math.sol";
import {IPool} from "@aave/core-v3/interfaces/IPool.sol";
import "./Arkana.sol";

/**
 * @title ArkanaVault
 * @notice ERC4626 vault wrapper for Arkana privacy-preserving payment system
 * @dev This vault implements the ERC4626 standard using oz's implementation
 *      and wraps the Arkana contract to provide a standard vault interface
 */
contract ArkanaVault is ERC4626 {
    using SafeERC20 for IERC20;

    /// @notice The Arkana contract address
    Arkana public immutable arkana;

    /// @notice The token address this vault is for (underlying token, not aToken)
    address public immutable vaultToken;

    /// @notice The Aave v3 Pool contract
    IPool public immutable aavePool;

    /**
     * @dev Modifier to ensure only the Arkana contract can call the function
     */
    modifier onlyArkana() {
        require(msg.sender == address(arkana), "Only Arkana can call this function");
        _;
    }

    /**
     * @param asset_ The ERC4626 asset (aToken from Aave, not the underlying token)
     * @param arkana_ The Arkana contract address
     * @param vaultToken_ The underlying token address in Arkana (used for tracking, not the asset)
     * @param aavePool_ The Aave v3 Pool contract address
     * @param name_ The name of the vault token
     * @param symbol_ The symbol of the vault token
     * @dev The asset is the aToken because deposits go to Aave and are converted to aTokens
     * @dev The vaultToken is the underlying token address for Arkana's internal tracking
     */
    constructor(
        IERC20 asset_,
        Arkana arkana_,
        address vaultToken_,
        IPool aavePool_,
        string memory name_,
        string memory symbol_
    ) ERC4626(asset_) ERC20(name_, symbol_) {
        arkana = arkana_;
        vaultToken = vaultToken_;
        aavePool = aavePool_;
        // Note: asset_ is the aToken, vaultToken_ is the underlying token
        // They are different by design - the vault tracks aToken balance (includes yield)
    }

    /**
     * @dev Returns the total amount of assets managed by this vault
     * @return Total assets (aTokens) held in this vault
     * @notice The vault now holds the aTokens directly, so we return the vault's balance
     */
    function totalAssets() public view override returns (uint256) {
        // Return the vault's own aToken balance (vault holds the assets per ERC4626)
        return IERC20(asset()).balanceOf(address(this));
    }

    /**
     * @dev Convert assets to shares using oz's ERC4626 logic
     * @param assets The amount of assets
     * @return shares The equivalent amount of shares
     */
    function convertToShares(uint256 assets) public view override returns (uint256) {
        return _convertToShares(assets, Math.Rounding.Floor);
    }

    /**
     * @dev Convert shares to assets using oz's ERC4626 logic
     * @param shares The amount of shares
     * @return assets The equivalent amount of assets
     */
    function convertToAssets(uint256 shares) public view override returns (uint256) {
        return _convertToAssets(shares, Math.Rounding.Floor);
    }

    /**
     * @dev Preview the amount of shares that would be minted for a deposit
     * @param assets The amount of assets to deposit
     * @return shares The amount of shares that would be minted
     */
    function previewDeposit(uint256 assets) public view override returns (uint256) {
        return convertToShares(assets);
    }

    /**
     * @dev Preview the amount of assets required to mint shares
     * @param shares The amount of shares to mint
     * @return assets The amount of assets required
     */
    function previewMint(uint256 shares) public view override returns (uint256) {
        uint256 totalShares_ = totalSupply();
        uint256 totalAssets_ = totalAssets();

        if (totalShares_ == 0 || totalAssets_ == 0) {
            return shares; // 1:1 ratio for first deposit
        }

        // assets = shares * totalAssets / totalShares (rounded up)
        return Math.mulDiv(shares, totalAssets_, totalShares_, Math.Rounding.Ceil);
    }

    /**
     * @dev Preview the amount of shares required to withdraw assets
     * @param assets The amount of assets to withdraw
     * @return shares The amount of shares required
     */
    function previewWithdraw(uint256 assets) public view override returns (uint256) {
        uint256 totalShares_ = totalSupply();
        uint256 totalAssets_ = totalAssets();

        if (totalShares_ == 0 || totalAssets_ == 0) {
            return assets; // 1:1 ratio if no shares exist
        }

        // shares = assets * totalShares / totalAssets (rounded up)
        return Math.mulDiv(assets, totalShares_, totalAssets_, Math.Rounding.Ceil);
    }

    /**
     * @dev Preview the amount of assets that would be received for redeeming shares
     * @param shares The amount of shares to redeem
     * @return assets The amount of assets that would be received
     */
    function previewRedeem(uint256 shares) public view override returns (uint256) {
        return convertToAssets(shares);
    }

    /**
     * @dev Deposit assets into the vault and mint shares
     * @param assets The amount of assets to deposit
     * @param receiver The address to receive the shares
     * @return shares The amount of shares minted
     */
    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        uint256 maxAssets = maxDeposit(receiver);
        if (assets > maxAssets) {
            revert ERC4626ExceededMaxDeposit(receiver, assets, maxAssets);
        }

        uint256 shares = previewDeposit(assets);
        _deposit(_msgSender(), receiver, assets, shares);

        return shares;
    }

    /**
     * @dev Mint shares by depositing assets
     * @param shares The amount of shares to mint
     * @param receiver The address to receive the shares
     * @return assets The amount of assets deposited
     */
    function mint(uint256 shares, address receiver) public override returns (uint256) {
        uint256 maxShares = maxMint(receiver);
        if (shares > maxShares) {
            revert ERC4626ExceededMaxMint(receiver, shares, maxShares);
        }

        uint256 assets = previewMint(shares);
        _deposit(_msgSender(), receiver, assets, shares);

        return assets;
    }

    /**
     * @dev Withdraw assets by burning shares
     * @param assets The amount of assets to withdraw
     * @param receiver The address to receive the assets
     * @param owner The address that owns the shares
     * @return shares The amount of shares burned
     */
    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
        uint256 maxAssets = maxWithdraw(owner);
        if (assets > maxAssets) {
            revert ERC4626ExceededMaxWithdraw(owner, assets, maxAssets);
        }

        uint256 shares = previewWithdraw(assets);
        _withdraw(_msgSender(), receiver, owner, assets, shares);

        return shares;
    }

    /**
     * @dev Redeem shares for assets
     * @param shares The amount of shares to redeem
     * @param receiver The address to receive the assets
     * @param owner The address that owns the shares
     * @return assets The amount of assets received
     */
    function redeem(uint256 shares, address receiver, address owner) public override returns (uint256) {
        uint256 maxShares = maxRedeem(owner);
        if (shares > maxShares) {
            revert ERC4626ExceededMaxRedeem(owner, shares, maxShares);
        }

        uint256 assets = previewRedeem(shares);
        _withdraw(_msgSender(), receiver, owner, assets, shares);

        return assets;
    }

    /**
     * @dev Internal deposit function that transfers assets and mints shares
     * @notice Assets are held in the vault. To deposit into Arkana's privacy system,
     *         users must call Arkana.deposit() separately with ZK proofs.
     *         This vault provides standard ERC4626 interface for tracking shares.
     */
    function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal override {
        // Transfer assets from caller to this vault
        SafeERC20.safeTransferFrom(IERC20(asset()), caller, address(this), assets);

        // Assets are now held in the vault
        // To actually deposit into Arkana's privacy-preserving system, users must:
        // 1. Call Arkana.deposit(proof, publicInputs, amountIn) with ZK proof
        // 2. Arkana will transfer assets from this vault (requires approval)
        // 3. The vault tracks shares separately from Arkana's internal share tracking

        // Mint shares to receiver
        _mint(receiver, shares);

        emit Deposit(caller, receiver, assets, shares);
    }

    /**
     * @dev Internal withdraw function that burns shares and transfers assets
     * @notice This withdraws from the vault's balance. To withdraw from Arkana's privacy system,
     *         users must call Arkana.withdraw() separately with ZK proofs, which will transfer
     *         assets to this vault, then users can withdraw from the vault.
     */
    function _withdraw(address caller, address receiver, address owner, uint256 assets, uint256 shares)
        internal
        override
    {
        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }

        // Burn shares from owner
        _burn(owner, shares);

        // Transfer assets from vault to receiver
        // Note: Assets must be in the vault. To withdraw from Arkana's privacy system:
        // 1. Call Arkana.withdraw(proof, publicInputs) with ZK proof
        // 2. Arkana will transfer assets to this vault
        // 3. Then call this vault's withdraw/redeem to get assets
        SafeERC20.safeTransfer(IERC20(asset()), receiver, assets);

        emit Withdraw(caller, receiver, owner, assets, shares);
    }

    // ============================================
    // ARKANA INTEGRATION FUNCTIONS
    // ============================================

    /**
     * @dev Mint shares directly (called by Arkana during deposit operations)
     * @param to Address to receive the shares
     * @param shares Amount of shares to mint
     * @notice Only callable by the Arkana contract
     * @dev Uses ERC20's _mint (inherited from ERC4626 which inherits from ERC20)
     */
    function mintShares(address to, uint256 shares) external onlyArkana {
        _mint(to, shares);
    }

    /**
     * @dev Burn shares directly (called by Arkana during withdraw operations)
     * @param from Address to burn shares from
     * @param shares Amount of shares to burn
     * @notice Only callable by the Arkana contract
     * @dev Uses ERC20's _burn (inherited from ERC4626 which inherits from ERC20)
     */
    function burnShares(address from, uint256 shares) external onlyArkana {
        _burn(from, shares);
    }

    /**
     * @dev Withdraw aTokens directly
     * @param to Address to receive the aTokens
     * @param aTokenAmount Amount of aTokens to withdraw
     * @notice Only callable by the Arkana contract
     * @dev Transfers aTokens from vault to Arkana contract for fee payments
     */
    function withdrawATokens(address to, uint256 aTokenAmount) external onlyArkana {
        IERC20(asset()).safeTransfer(to, aTokenAmount);
    }

    // ============================================
    // AAVE INTEGRATION FUNCTIONS
    // ============================================

    /**
     * @dev Supply underlying tokens to Aave
     * @param amount Amount of underlying tokens to supply
     * @notice Only callable by the Arkana contract
     * @dev Arkana transfers underlying tokens to vault, then vault supplies to Aave
     * @dev The vault receives aTokens from Aave which are held as the vault's assets
     */
    function supplyToAave(uint256 amount) external onlyArkana {
        // Transfer underlying tokens from Arkana to this vault
        IERC20(vaultToken).safeTransferFrom(msg.sender, address(this), amount);

        // Approve Aave Pool to spend underlying tokens
        IERC20(vaultToken).approve(address(aavePool), amount);
        //TODO: IMPORTANT this should be a try catch to avoid supplyCap error from Aave (might be a blocker to access)
        //      if we do so, we either make explicit that you can only deposit when aave is not full capacity or share the yield,
        //      thus making this less incentivizing than aave for some market in given periods

        // Supply to Aave - vault receives aTokens
        aavePool.supply(vaultToken, amount, address(this), 0);
    }

    /**
     * @dev Withdraw underlying tokens from Aave
     * @param amount Amount of underlying tokens to withdraw
     * @param to Address to receive the underlying tokens
     * @return amountWithdrawn The actual amount withdrawn from Aave
     * @notice Only callable by the Arkana contract
     * @dev Vault withdraws from Aave (burns aTokens) and transfers underlying tokens to recipient
     */
    function withdrawFromAave(uint256 amount, address to) external onlyArkana returns (uint256 amountWithdrawn) {
        // Withdraw from Aave - this burns aTokens and sends underlying tokens to this vault
        amountWithdrawn = aavePool.withdraw(vaultToken, amount, address(this));

        // Transfer underlying tokens to the recipient (Arkana or user)
        IERC20(vaultToken).safeTransfer(to, amountWithdrawn);

        return amountWithdrawn;
    }
}

