// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "./ILiquidityPool.sol";
import "./TokenLiquidityPool.sol";
import "./NativeLiquidityPool.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Thrown when state of contract is equal to `state`
error DEX__StateIsNot(uint8 state);
/// @notice Thrown when state of contract is not equal to `state`
error DEX__StateIs(uint8 state);
/// @notice Thrown when transfer of tokens at ERC20 `tokenAddress` fails
error DEX__TokenTransferFailed(address tokenAddress);
/// @notice Thrown when approve function of ERC20 at `tokenAddress` fails
error DEX__TokenApprovalFailed(address tokenAddress);
/// @notice Thrown when `liquidityPoolAddress` is not an active liquidity pool
error DEX__LiquidityPoolNotActive(address liquidityPoolAddress);
/// @notice Thrown when liquidity pool at `liquidityPoolAddress` is already activated
error DEX__LiquidityPoolIsActive(address liquidityPoolAddress);
/// @notice Thrown when x and y addresses of new TokenLiquidityPool match
error DEX__TokenAddressesOfTokenLiquidityPoolMatching();

/**
 * @title DEX
 * @author Philipp Keinberger
 * @notice This contract provides a decentralized exchange, where users can use any of the
 * liquidity pools added to the exchange to swap between assets. Liquidity pools can be
 * added and removed through access-restricted functions, favourably
 * controlled by a governor cvontract (e.g. DAO) to allow for decentralized governance of
 * the DEX.
 * @dev This contract implements the IERC20 Openzeppelin interface for the ERC20 token
 * standard. It also implements the ILiquidityPool interface for liquidity pools stored on
 * the exchange.
 *
 * This contract inherits from Openzeppelins OwnableUpgradeable contract in order to
 * allow for owner features, while still keeping upgradeablity functionality.
 *
 * The DEX is designed to be deployed through a proxy to allow for future upgrades of the
 * contract.
 */
contract DEX is OwnableUpgradeable {
    /**
     * @dev Defines the state of the contract, allows for state restricted functionality
     * of the contract.
     */
    enum State {
        CLOSED,
        UPDATING,
        OPEN
    }

    State private s_dexState;
    /// @dev liquidity pool address => active bool
    mapping(address => bool) s_liquidityPools;

    /// @notice Event emitted when the state of the contract gets updated
    event StateUpdated(State newState);
    /// @notice Event emitted when a new liquidity pool is added to the pool
    event LiquidityPoolAdded(address liquidityPoolAddress, ILiquidityPool.Kind liquidityPoolKind);
    /// @notice Event emitted when a liquidity pool is removed from the DEX
    event LiquidityPoolRemoved(address liquidityPoolAddress);
    /// @notice Event emitted when an already existing liquidity pool is activated on the DEX
    event LiquidityPoolActivated(address liquidityPoolAddress);

    /// @notice Checks if state of DEX is equal to `state`
    modifier stateIs(State state) {
        if (state != s_dexState) revert DEX__StateIsNot(uint8(state));
        _;
    }

    /// @notice Checks if state of DEX is not equal to `state`
    modifier stateIsNot(State state) {
        if (state == s_dexState) revert DEX__StateIs(uint8(state));
        _;
    }

    /// @notice Checks if liquidity pool at `liquidityPoolAddress` is not deactivated
    modifier isActiveLiquidityPool(address liquidityPoolAddress) {
        if (!s_liquidityPools[liquidityPoolAddress])
            revert DEX__LiquidityPoolNotActive(liquidityPoolAddress);
        _;
    }

    /// @notice Ensures that initialize can only be called through proxy
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializer function which replaces constructor for upgradeability
     * functionality.
     * Sets `msg.sender` as owner of the contract
     */
    function initialize() public initializer {
        __Ownable_init();
    }

    /**
     * @notice Function for setting the state of the DEX
     * @param newState is the new state value of the contract
     * @dev This function can only be called by the owner.
     * This function emits the {StateUpdated} event
     */
    function setState(State newState) external onlyOwner {
        s_dexState = newState;
        emit StateUpdated(newState);
    }

    /**
     * @notice Function for adding a NativeLiquidityPool to the DEX
     * @param tokenAddress is the address of the ERC20 contract
     * @param swapFee is the swapFee to be used for swapping in the pool
     * @param tokenDeposit is the amount of tokens to be used for initialization of the
     * liquidity pool
     * @dev The function uses the parameters to deploy a new NativeLiquidityPool and
     * initializes it. The new liuqidity pool is then added to the DEX.
     *
     * Note that already existing liquidity pools with the same parameters as an existing one
     * may still be added to the DEX.
     *
     * This function reverts if the caller is not the owner, or the state of the contract
     * is CLOSED. It also reverts if the transfer of `tokenDeposit` from `msg.sender` fails,
     * or the approval of the new liquidity pool to transfer `tokenDeposit` to itself fails.
     *
     * This function emits the {LiquidityPoolAdded} event.
     */
    function addNativeLiquidityPool(
        address tokenAddress,
        uint16 swapFee,
        uint256 tokenDeposit
    ) external payable onlyOwner stateIsNot(State.CLOSED) {
        IERC20 token = IERC20(tokenAddress);

        if (!token.transferFrom(msg.sender, address(this), tokenDeposit))
            revert DEX__TokenTransferFailed(address(token));

        NativeLiquidityPool newLiquidityPool = new NativeLiquidityPool(tokenAddress, swapFee);

        if (!token.approve(address(newLiquidityPool), tokenDeposit))
            revert DEX__TokenApprovalFailed(address(token));

        newLiquidityPool.initialize{value: msg.value}(tokenDeposit);

        address liquidityPoolAddress = address(newLiquidityPool);
        s_liquidityPools[liquidityPoolAddress] = true;

        emit LiquidityPoolAdded(liquidityPoolAddress, ILiquidityPool.Kind.NativeLiquidityPool);
    }

    /**
     * @notice Function for adding a TokenLiquidityPool to the DEX
     * @param xAddress is the address of the x token in the new pool
     * @param yAddress is the address of the y token in the new pool
     * @param swapFee is the swapFee to be used for swapping in the new pool
     * @param xDeposit is the amount of x tokens to be used of the caller for initialization
     * of the pool
     * @param yDeposit is the amount of y tokens to be used of the caller for initialization
     * of the pool
     * @dev The function uses the parameters to deploy a new TokenLiquidityPool and initializes
     * it. The new liuqidity pool is then added to the DEX.
     *
     * Note that already existing liquidity pools with the same parameters as an existing one
     * may still be added to the DEX.
     *
     * The token addresses `xAddress` and `yAddress` may not match each other.
     * This function reverts if the caller is not the owner, or the state of the contract
     * is CLOSED. It also reverts if the transfer of `xDeposit` or `yDeposit` from `msg.sender`
     * fails, or the approval of the new liquidity pool to transfer `xDeposit` or `yDeposit`
     * to itself fails.
     *
     * This function emits the {LiquidityPoolAdded} event.
     */
    function addTokenLiquidityPool(
        address xAddress,
        address yAddress,
        uint16 swapFee,
        uint256 xDeposit,
        uint256 yDeposit
    ) external onlyOwner stateIsNot(State.CLOSED) {
        if (xAddress == yAddress) revert DEX__TokenAddressesOfTokenLiquidityPoolMatching();

        IERC20 xToken = IERC20(xAddress);
        IERC20 yToken = IERC20(yAddress);

        if (!xToken.transferFrom(msg.sender, address(this), xDeposit))
            revert DEX__TokenTransferFailed(address(xToken));
        if (!yToken.transferFrom(msg.sender, address(this), yDeposit))
            revert DEX__TokenTransferFailed(address(yToken));

        TokenLiquidityPool newLiquidityPool = new TokenLiquidityPool(xAddress, yAddress, swapFee);

        if (!xToken.approve(address(newLiquidityPool), xDeposit))
            revert DEX__TokenApprovalFailed(address(xToken));
        if (!yToken.approve(address(newLiquidityPool), yDeposit))
            revert DEX__TokenApprovalFailed(address(yToken));

        newLiquidityPool.initialize(xDeposit, yDeposit);

        address liquidityPoolAddress = address(newLiquidityPool);
        s_liquidityPools[liquidityPoolAddress] = true;

        emit LiquidityPoolAdded(liquidityPoolAddress, ILiquidityPool.Kind.TokenLiquidityPool);
    }

    /**
     * @notice Function for removing a liquidity pool
     * @param liquidityPoolAddress is the address of the liquidity pool
     * @dev The function can only be called by the owner, if the DEX is not
     * CLOSED and the liquidity pool exists on the DEX. The function will revert if any of
     * these prerequisites is not met.
     *
     * This function emits the {LiquidityPoolRemoved} event.
     */
    function removeLiquidityPool(address liquidityPoolAddress)
        external
        onlyOwner
        stateIsNot(State.CLOSED)
        isActiveLiquidityPool(liquidityPoolAddress)
    {
        delete s_liquidityPools[liquidityPoolAddress];
        emit LiquidityPoolRemoved(liquidityPoolAddress);
    }

    /**
     * @notice Function for activating an already existing liquidity pool on the DEX
     * @param liquidityPoolAddress is the address of the active liquidity pool
     * @dev This function can be used to allow previously used liquidity pools to be
     * (re) activated on the DEX. It also allows for external liquidity pools that
     * implement the ILiquidityPool interface to be activated on (added to) the exchange.
     *
     * The function can only be called by the owner and if the DEX is not CLOSED.
     * The function will revert if any of these prerequisites is not met.
     *
     * This function emits the {LiquidityPoolActivated} event.
     */
    function activateLiquidityPool(address liquidityPoolAddress)
        external
        onlyOwner
        stateIsNot(State.CLOSED)
    {
        if (s_liquidityPools[liquidityPoolAddress])
            revert DEX__LiquidityPoolIsActive(liquidityPoolAddress);

        s_liquidityPools[liquidityPoolAddress] = true;
        emit LiquidityPoolActivated(liquidityPoolAddress);
    }

    /**
     * @notice Function for swapping at liquidity pool at `liquidityPoolAddress`
     * @param liquidityPoolAddress is the address of the liquidity pool
     * @param tokenAmount is the amount of tokens to be swapped.
     * Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool)
     * @dev The function calls the swapFrom function of the liquidity pool at `liquidityPoolAddress`
     * (see ILiquidityPool for more documentation). In order for the DEX to be able to swap from
     * the caller (swap on behalf of `msg.sender`), the DEX needs to be approved with the
     * `tokenAmount` or `msg.value` (depending on the pool and swap direction) by the caller
     * at the liquidity pool prior to calling this function. See `approve` at ILiquidityPool
     * for more documentation.
     *
     * The function can only be called if the DEX is not CLOSED. This implemenation will
     * check for the liquidity pool at `liquidityPoolAddress` being active.
     * The function will revert if any of these prerequisites is not met.
     */
    function swapAt(address liquidityPoolAddress, uint256 tokenAmount)
        external
        payable
        stateIs(State.OPEN)
        isActiveLiquidityPool(liquidityPoolAddress)
    {
        ILiquidityPool liquidityPool = ILiquidityPool(liquidityPoolAddress);
        liquidityPool.swapFrom{value: msg.value}(msg.sender, tokenAmount);
    }

    /**
     * @notice Function for retrieving the current State of the DEX
     * @return State of the DEX
     */
    function getState() public view returns (State) {
        return s_dexState;
    }

    /**
     * @notice Function for retrieving activation status of liquidity pool
     * at `liquidityPoolAddress`
     * @param liquidityPoolAddress is the address of the liquidity pool
     * @return Activation value of liquidity pool at `liquidityPoolAddress`
     */
    function getStatus(address liquidityPoolAddress) public view returns (bool) {
        return s_liquidityPools[liquidityPoolAddress];
    }

    /**
     * @notice Function for retrieving version of the DEX
     * @return Version
     */
    function getVersion() public pure returns (uint256) {
        return 1;
    }
}
