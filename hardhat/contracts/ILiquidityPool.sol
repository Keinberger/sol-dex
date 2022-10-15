// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

/**
 * @dev This is an interface for the TokenLiquidityPool and NativeLiquidityPool contracts
 * to implement standardized functionality of both liquidity pools. Using this interface,
 * third party contracts can use liquidity pools of both types, while keeping core
 * features standardized.
 */
interface ILiquidityPool {
    /// @dev Defines the kind of the liquidity pool
    enum Kind {
        NativeLiquidityPool,
        TokenLiquidityPool
    }

    /**
     * @dev Defines the direction for a swap.
     * Note that in NativeLiquidityPools "x" always refers to the native chain currency, whereas
     * "y" refers to the ERC20 token. In TokenLiquidityPools, "x" and "y" each refer to one of
     * the ERC20 tokens in the pool.
     */
    enum SwapDirection {
        xToY,
        yToX
    }

    /// @dev Defines the structure for Allowance in a liquidity pool
    struct Allowance {
        /// @dev Specifies the amount of the asset that can be swapped
        uint256 amount;
        /// @dev Defines in which direction the swap can be executed
        SwapDirection direction;
    }

    /**
     * @notice Event emitted when `owner` approves `approvee` to swap `amount` in the direction
     * of `direction`
     */
    event Approval(address owner, address approvee, uint256 amount, SwapDirection direction);
    /**
     * @notice Event emitted when `swapee` swaps `amount` in the direction of `direction`.
     * Note that `amount` may be zero.
     */
    event Swap(address swapee, uint256 amount, uint256 output, SwapDirection direction);

    /**
     * @notice Function for approving other users to swap on ones own behalf
     * @param approvee is the address that should be approved
     * @param amount is the amount approved for `approvee` to swap
     * @param direction is the direction to allow swapping in
     * @dev This function approves `approvee` to swap `amount` from caller
     * in direction of `direction`.
     *
     * Calling this function with `amount` equal to zero in effect resets the
     * allowance.
     *
     * This function emits the {Approval} event.
     */
    function approve(
        address approvee,
        uint256 amount,
        SwapDirection direction
    ) external;

    /**
     * @notice Function for retrieving the allowance of `allowee` to swap
     on behalf of `owner`
     * @param owner is the owner the tokens to swap
     * @param allowee is the address allowed to swap according to allowance
     * @return Allowance of `allowee` to swap for `owner`
     */
    function getAllowanceOf(address owner, address allowee)
        external
        view
        returns (Allowance memory);

    /**
     * @notice Function for swapping tokens
     * @param tokenAmount is the amount of tokens to be swapped to native currency.
     * Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool)
     * @param direction defines the direction of the swap (xToY or yToX)
     * @dev This function has to be payable to allow for native currency to token swaps.
     * Note that tn that case, `tokenAmount` may be zero.
     */
    function swap(uint256 tokenAmount, SwapDirection direction) external payable;

    /**
     * @notice Function for swapping tokens on other users behalf
     * @param from is the address from which to swap
     * @param tokenAmount is the amount of tokens to be swapped to native currency.
     * Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool)
     * @dev This function swaps `tokenAmount` from `from` in the direction specified
     * by the allowance and removes `tokenAmount` from the allowance.
     *
     * This function reverts if `tokenAmount` is greater than the allowance set by `from`
     */
    function swapFrom(address from, uint256 tokenAmount) external payable;

    /**
     * @notice Function for retrieving the kind of the liquidity pool
     * @return Kind of the liquidity pool
     */
    function getKind() external returns (Kind);
}
