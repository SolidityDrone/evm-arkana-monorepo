// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@oz/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@oz/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@oz/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@oz/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@oz/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@oz/contracts/utils/math/Math.sol";
import {IPool, DataTypes} from "@aave/core-v3/interfaces/IPool.sol";
import {ReserveConfiguration} from "@aave/core-v3/protocol/libraries/configuration/ReserveConfiguration.sol";
import {WadRayMath} from "@aave/core-v3/protocol/libraries/math/WadRayMath.sol";
import {IScaledBalanceToken} from "@aave/core-v3/interfaces/IScaledBalanceToken.sol";
import "./Arkana.sol";

/**
 * @title ArkanaVault
 * @notice ERC4626 vault wrapper for Arkana privacy-preserving payment system
 * @dev Compatible with IArkanaVault; Arkana uses the interface to avoid embedding full vault bytecode.
 */
contract ArkanaVault is ERC4626 {
    using SafeERC20 for IERC20;

    error AaveSupplyFailed();
    error AaveWithdrawFailed();
    error AlreadyInitialized();

    /// @notice The Arkana contract address
    Arkana public immutable arkana;

    /// @notice The token address this vault is for (underlying token, not aToken)
    address public immutable vaultToken;

    /// @notice The Aave v3 Pool contract (unused when aaveVault is false)
    IPool public immutable aavePool;

    /// @notice When true, vault supplies/withdraws via Aave; when false, acts as a normal vault (no Aave). Set in initialize().
    bool public aaveVault;

    /// @notice True after initialize() has been called (one-time)
    bool private _initialized;

    /**
     * @dev Modifier to ensure only the Arkana contract can call the function
     */
    modifier onlyArkana() {
        require(msg.sender == address(arkana), "Only Arkana can call this function");
        _;
    }

    /**
     * @param asset_ The ERC4626 asset: aToken when token is on Aave, underlying token otherwise (factory sets this)
     * @param arkana_ The Arkana contract address
     * @param vaultToken_ The underlying token address in Arkana
     * @param aavePool_ The Aave v3 Pool contract address
     * @param name_ The name of the vault token
     * @param symbol_ The symbol of the vault token
     * @dev aaveVault is set in initialize() by checking if the token is supported by AavePool
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
    }

    /**
     * @dev One-time init: sets aaveVault from Aave support (token supported on AavePool => use Aave, else skip Aave ops).
     * @notice Call once after deployment (e.g. by factory). If asset is aToken then aaveVault = true; else false.
     */
    function initialize() external {
        if (_initialized) revert AlreadyInitialized();
        _initialized = true;
        // asset() == vaultToken means we use underlying only (not on Aave); otherwise asset is aToken
        aaveVault = (address(asset()) != vaultToken);
    }

    /**
     * @dev Returns the total amount of assets managed by this vault (in underlying terms)
     * @return For aaveVault: aToken balance + underlying buffer; for non-Aave: underlying balance only
     */
    function totalAssets() public view override returns (uint256) {
        if (!aaveVault) {
            return IERC20(asset()).balanceOf(address(this));
        }
        uint256 aTokenBalance = IERC20(asset()).balanceOf(address(this));
        uint256 underlyingBalance = IERC20(vaultToken).balanceOf(address(this));
        return aTokenBalance + underlyingBalance;
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

    // ============================================
    // AAVE INTEGRATION FUNCTIONS
    // ============================================

    /**
     * @dev Supply underlying tokens to Aave, up to the reserve supply cap. No-op for non-Aave vaults (just receives tokens).
     * @param amount Amount of underlying tokens to supply (or to receive when !aaveVault)
     * @notice Only callable by the Arkana contract. When aaveVault is false, only pulls tokens to this vault (no Aave).
     */
    function supplyToAave(uint256 amount) external onlyArkana {
        IERC20(vaultToken).safeTransferFrom(msg.sender, address(this), amount);
        if (!aaveVault) {
            return;
        }

        uint256 supplyAmount = _getAaveSupplyHeadroom(amount);
        if (supplyAmount == 0) {
            return;
        }

        IERC20(vaultToken).approve(address(aavePool), supplyAmount);
        try aavePool.supply(vaultToken, supplyAmount, address(this), 0) {
        }
        catch {
            revert AaveSupplyFailed();
        }
    }

    /**
     * @dev Returns how much we can supply to Aave without exceeding the supply cap
     * @param amount Desired supply amount
     * @return supplyAmount min(amount, headroom); 0 if reserve has no cap or headroom is 0
     */
    function _getAaveSupplyHeadroom(uint256 amount) internal view returns (uint256 supplyAmount) {
        DataTypes.ReserveData memory reserve = aavePool.getReserveData(vaultToken);
        uint256 supplyCap = ReserveConfiguration.getSupplyCap(reserve.configuration);
        if (supplyCap == 0) {
            return amount; // No cap
        }
        uint256 decimals = ReserveConfiguration.getDecimals(reserve.configuration);
        uint256 maxSupplyWei = supplyCap * (10 ** decimals);
        uint256 scaledTotal =
            IScaledBalanceToken(reserve.aTokenAddress).scaledTotalSupply() + uint256(reserve.accruedToTreasury);
        uint256 currentSupplyWei = WadRayMath.rayMul(scaledTotal, uint256(reserve.liquidityIndex));
        if (currentSupplyWei >= maxSupplyWei) {
            return 0;
        }
        uint256 headroom = maxSupplyWei - currentSupplyWei;
        return amount < headroom ? amount : headroom;
    }

    /**
     * @dev Withdraw underlying tokens: for aaveVault use buffer first then Aave; for non-Aave just transfer from vault.
     * @param amount Amount of underlying tokens to send to recipient
     * @param to Address to receive the underlying tokens
     * @return amountWithdrawn The total amount sent to `to`
     */
    function withdrawFromAave(uint256 amount, address to) external onlyArkana returns (uint256 amountWithdrawn) {
        if (!aaveVault) {
            IERC20(vaultToken).safeTransfer(to, amount);
            return amount;
        }
        uint256 fromVault = IERC20(vaultToken).balanceOf(address(this));
        if (fromVault > amount) {
            fromVault = amount;
        }
        if (fromVault > 0) {
            IERC20(vaultToken).safeTransfer(to, fromVault);
        }
        uint256 needFromAave = amount - fromVault;
        if (needFromAave == 0) {
            return amount;
        }
        uint256 fromAave;
        try aavePool.withdraw(vaultToken, needFromAave, address(this)) returns (uint256 withdrawn) {
            fromAave = withdrawn;
        } catch {
            revert AaveWithdrawFailed();
        }
        IERC20(vaultToken).safeTransfer(to, fromAave);
        return fromVault + fromAave;
    }
}

