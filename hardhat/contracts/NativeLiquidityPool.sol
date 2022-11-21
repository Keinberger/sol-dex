// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "./ILiquidityPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @notice Thrown when `value` is not above zero
error NativeLiquidityPool__NotAboveZero(uint256 value);
/// @notice Thrown when transfer of erc20 token fails
error NativeLiquidityPool__TokenTransferFailed();
/// @notice Thrown when transfer of native currency fails
error NativeLiquidityPool__NativeTransferFailed();
/// @notice Thrown when requested liquidity amount for withdrawal exceeds actual liquidity
error NativeLiquidityPool__NotEnoughLiquidity();
/// @notice Thrown when requested amount to swap is smaller than allowance
error NativeLiquidityPool__NotEnoughAllowance();

/**
 * @title NativeLiquidityPool
 * @author Philipp Keinberger
 * @notice This contract is a liquidity pool, where users can swap between an ERC20
 * token and native blockchain currency (e.g. ETH, MATIC). Users can also provide
 * liquidity to the pool, while accumulating rewards over time from the swapping fee.
 * Liquidity can be withdrawn at all times. Users can swap tokens on behalf of other
 * users by using the Allowance feature. In order to use that feature, one has to approve
 * another user for future swaps on ones own behalf.
 * @dev This contract implements the ILiquidityPool interface to allow for standardized
 * liquidity pool functionality for exchanges.
 *
 * This contract also implements the IERC20 Openzeppelin inteface for the ERC20 token
 * standard.
 *
 * The TokenLiquidityPool inherits from Openzeppelins Ownable contract to allow for
 * owner features. It also inherits from Openzeppelins Initializable contract to allow
 * for a safe initialize function, favourably used by exchanges to initialize the
 * liquidity pool.
 *
 * "X" refers to the native currency, while "Y" refers to the ERC20 token in the contract.
 */
contract NativeLiquidityPool is Ownable, Initializable, ILiquidityPool {
    Kind private constant LP_KIND = Kind.NativeLiquidityPool;
    IERC20 private immutable i_token;
    /// @dev fee in 1/10 percent (i_swapFee = 1, => 0.1 percent)
    uint16 private immutable i_swapFee;

    uint256 private s_poolLiquidity;
    /// @dev userAddress => liquidity
    mapping(address => uint256) private s_liquidityOf;
    /// @dev userAddress => allowedUser => Allowance
    mapping(address => mapping(address => Allowance)) private s_allowanceOf;

    /// @notice Event emitted when new liquidity is provided (added) to the pool
    event LiquidityAdded(
        address liquidityProvider,
        uint256 liquidityAmount,
        uint256 nativeDeposit,
        uint256 tokenDeposit
    );
    /// @notice Event emitted when liquidity is withdrawn (removed) from the pool
    event LiquidityRemoved(
        address liquidityProvider,
        uint256 liquidityAmount,
        uint256 nativeWithdrawn,
        uint256 tokensWithdrawn
    );

    constructor(address tokenAddress, uint16 swapFee) {
        i_token = IERC20(tokenAddress);
        i_swapFee = swapFee;
    }

    /**
     * @notice Function for initializing (setting up) the liquidity pool
     * @param tokenDeposit is the token amount deposited
     * @dev This function initializes the liquidity pool with `msg.value` for x
     * and `tokenDeposit` for y.
     * This function reverts if the caller is not the owner of the contract.
     * The function also reverts if `tokenDeposit` is not greater than zero.
     * If the ERC20 transfer of `tokenDeposit` from caller to the contract fails,
     * the function will revert.
     *
     * Note that this function can only be called once.
     *
     * This function emits the {LiquidityAdded} event.
     */
    function initialize(uint256 tokenDeposit) external payable onlyOwner initializer {
        if (msg.value <= 0) revert NativeLiquidityPool__NotAboveZero(msg.value);
        if (tokenDeposit <= 0) revert NativeLiquidityPool__NotAboveZero(tokenDeposit);

        if (!i_token.transferFrom(msg.sender, address(this), tokenDeposit))
            revert NativeLiquidityPool__TokenTransferFailed();

        s_liquidityOf[msg.sender] = msg.value;
        s_poolLiquidity = msg.value;

        emit LiquidityAdded(msg.sender, msg.value, msg.value, tokenDeposit);
    }

    /**
     * @notice Function for providing liquidity to the pool
     * @dev The function uses `msg.value` to calculate the amount of tokens required
     * for deposit. The amount of tokens has to be calculated, because it and
     * `msg.value` have to be in ratio with the reserves of X and Y in the pool.
     * Otherwise, a random amount of tokens would change the price of the assets in the
     * pool. The amount of tokens required for a deposit of `msg.value` can be retrieved
     * by the getTokenAmountForNativeDeposit function.
     *
     * Before calling the function, the caller has to approve the liquidity pool
     * to transfer the amount of tokens required (getTokenAmountForNativeDeposit).
     * It is advised to set allowance at the ERC20 higher than the output of
     * getTokenAmountForNativeDeposit because of price fluctuations.
     *
     * This function reverts if the transfer of the required (calculated)
     * deposit of tokens fails.
     *
     * This function emits the {LiquidityAdded} event.
     */
    function provideLiquidity() external payable {
        uint256 xReservesMinusMsgValue = address(this).balance - msg.value;
        uint256 yReserves = i_token.balanceOf(address(this));

        uint256 tokenAmountRequired = (msg.value * yReserves) / xReservesMinusMsgValue;
        if (!i_token.transferFrom(msg.sender, address(this), tokenAmountRequired))
            revert NativeLiquidityPool__TokenTransferFailed();

        uint256 userLiquidity = (msg.value * s_poolLiquidity) / xReservesMinusMsgValue;

        s_liquidityOf[msg.sender] += userLiquidity;
        s_poolLiquidity += userLiquidity;

        emit LiquidityAdded(msg.sender, userLiquidity, msg.value, tokenAmountRequired);
    }

    /**
     * @notice Function for withdrawing liquidity from the pool
     * @param liquidityAmount is the amount of liquidity to be withdrawn
     * @dev The function calculates the amount of native and tokens eligible
     * for withdrawal and automatically transfers that amount to the caller.
     * The amount of native and tokens eligible is dependent on the pool reserves of both assets,
     * `liquidityAmount` and the total liquidity in the pool. The eligible amount of
     * the assets for withdrawal can be lower than the liquidity provided (Impermantent Loss),
     * but usually is greater than the amount provided, because of accumulating swap fees in
     * the liquidity pool.
     *
     * The function reverts if `liquidityAmount` exceeds the liquidity of the caller.
     * This function also reverts if the native transfer or ERC20 transfer fails.
     *
     * The function emits the {LiquidityRemoved} event.
     */
    function withdrawLiquidity(uint256 liquidityAmount) external {
        if (liquidityAmount > s_liquidityOf[msg.sender])
            revert NativeLiquidityPool__NotEnoughLiquidity();

        uint256 xReserves = address(this).balance;
        uint256 yReserves = i_token.balanceOf(address(this));
        uint256 l_poolLiquidity = s_poolLiquidity;

        uint256 xEligible = (liquidityAmount * xReserves) / l_poolLiquidity;
        uint256 yEligible = (liquidityAmount * yReserves) / l_poolLiquidity;

        s_liquidityOf[msg.sender] -= liquidityAmount;
        s_poolLiquidity -= liquidityAmount;

        if (!i_token.transfer(msg.sender, yEligible))
            revert NativeLiquidityPool__TokenTransferFailed();

        (bool successfulTransfer, ) = payable(msg.sender).call{value: xEligible}("");
        if (!successfulTransfer) revert NativeLiquidityPool__NativeTransferFailed();

        emit LiquidityRemoved(msg.sender, liquidityAmount, xEligible, yEligible);
    }

    /**
     * @inheritdoc ILiquidityPool
     * @dev This function calls _swapXtoY or _swapYtoX depending on `direction`.
     * See _swapXtoY and _swapYtoX for more documentation
     */
    function swap(uint256 tokenAmount, SwapDirection direction) external payable override {
        if (direction == SwapDirection.xToY) _swapXtoY(msg.sender, msg.value);
        else if (direction == SwapDirection.yToX) _swapYtoX(msg.sender, tokenAmount);
    }

    /// @inheritdoc ILiquidityPool
    function approve(
        address approvee,
        uint256 amount,
        SwapDirection direction
    ) external override {
        s_allowanceOf[msg.sender][approvee] = Allowance(amount, direction);
        emit Approval(msg.sender, approvee, amount, direction);
    }

    /**
     * @inheritdoc ILiquidityPool
     * @dev This function calls _swapXtoY or _swapYtoX depending on `direction`.
     * See _swapXtoY and _swapYtoX for more documentation
     */
    function swapFrom(address from, uint256 tokenAmount) external payable override {
        Allowance memory l_allowance = s_allowanceOf[from][msg.sender];

        uint256 swapAmount;
        if (l_allowance.direction == SwapDirection.xToY) swapAmount = msg.value;
        else swapAmount = tokenAmount;

        if (swapAmount > l_allowance.amount) revert NativeLiquidityPool__NotEnoughAllowance();
        s_allowanceOf[from][msg.sender].amount -= swapAmount;

        if (l_allowance.direction == SwapDirection.xToY) _swapXtoY(from, swapAmount);
        else _swapYtoX(from, swapAmount);
    }

    /**
     * @notice Function for calculating token or native output for swap
     * @param amount is the amount to be swapped
     * @param fromReserves are the reserves of the asset swapped from
     * @param outputReserves are the reserves of the output asset
     * @param fee is the fee (in 1/10 of percent) to be substracted
     * from the output
     * @return Output for swap of amount
     * @dev This function calculates the amount that one recieves
     * for swapping `amount`. The fee `fee` will be substracted from the
     * output
     */
    function calculateOutput(
        uint256 amount,
        uint256 fromReserves,
        uint256 outputReserves,
        uint256 fee
    ) internal pure returns (uint256) {
        uint256 amountMinusFee = amount * (1000 - fee);

        uint256 numerator = amountMinusFee * outputReserves;
        uint256 denominator = fromReserves * 1000 + amountMinusFee;
        return numerator / denominator;
    }

    /**
     * @notice Function for executing xToY swap
     * @param swapee is the address to swap from
     * @param amount is the amount of y (native, `msg.value` of swap or swapFrom) to be swapped
     * @dev The function transfers the output tokens (retrieved by calculateTokenOutput)
     * to `swapee`.
     *
     * This function reverts if the transfer of output tokens fails.
     *
     * This function emits the {Swap} event.
     */
    function _swapXtoY(address swapee, uint256 amount) internal {
        uint256 xReservesMinusMsgValue = address(this).balance - amount;
        uint256 yReserves = i_token.balanceOf(address(this));

        uint256 output = calculateOutput(amount, xReservesMinusMsgValue, yReserves, i_swapFee);

        if (!i_token.transfer(swapee, output)) revert NativeLiquidityPool__TokenTransferFailed();

        emit Swap(swapee, amount, output, SwapDirection.xToY);
    }

    /**
     * @notice Function for executing yToX swap
     * @param swapee is the address to swap from
     * @param amount is the amount of y (tokens) to be swapped
     * @dev The function transfers `amount` to the pool and in return transfers the
     * output tokens (retrieved by calculateTokenOutput) to `swapee`.
     *
     * This function reverts if the transfer of output tokens fails.
     *
     * This function emits the {Swap} event.
     */
    function _swapYtoX(address swapee, uint256 amount) internal {
        uint256 xReserves = address(this).balance;
        uint256 yReserves = i_token.balanceOf(address(this));

        uint256 output = calculateOutput(amount, yReserves, xReserves, i_swapFee);

        if (!i_token.transferFrom(swapee, address(this), amount))
            revert NativeLiquidityPool__TokenTransferFailed();

        (bool successfulTransfer, ) = swapee.call{value: output}("");
        if (!successfulTransfer) revert NativeLiquidityPool__NativeTransferFailed();

        emit Swap(swapee, amount, output, SwapDirection.yToX);
    }

    /// @inheritdoc ILiquidityPool
    function getKind() public pure override returns (Kind) {
        return LP_KIND;
    }

    /**
     * @notice Function for retrieving the address of ERC20 token
     * @return Address of ERC20 token
     */
    function getTokenAddress() public view returns (address) {
        return address(i_token);
    }

    /**
     * @notice Function for retrieving the total liquidity in the pool
     * @return Pool liquidity
     */
    function getPoolLiquidity() public view returns (uint256) {
        return s_poolLiquidity;
    }

    /**
     * @notice Function for retrieving liquidity of `addr`
     * @param addr is the address of the liquidity owner
     * @return Liquidity of `addr`
     */
    function getLiquidityOf(address addr) public view returns (uint256) {
        return s_liquidityOf[addr];
    }

    /// @inheritdoc ILiquidityPool
    function getAllowanceOf(address owner, address allowee)
        public
        view
        override
        returns (Allowance memory)
    {
        return s_allowanceOf[owner][allowee];
    }

    /**
     * @notice Function for retrieving token output for swap of `nativeAmount`.
     * Note that token output fluctuates with price and therefore changes constantly
     * @param nativeAmount is the amount of native to be swapped
     * @return Amount of tokens expected to be received for swap
     */
    function getTokenOutputForSwap(uint256 nativeAmount) public view returns (uint256) {
        uint256 xReserves = address(this).balance;
        uint256 yReserves = i_token.balanceOf(address(this));

        return calculateOutput(nativeAmount, xReserves, yReserves, i_swapFee);
    }

    /**
     * @notice Function for retrieving native output for swap of `tokenAmount`.
     * Note that native output fluctuates with price and therefore changes constantly
     * @param tokenAmount is the amount of tokens to be swapped
     * @return Amount of native expected to be received for swap
     */
    function getNativeOutputForSwap(uint256 tokenAmount) public view returns (uint256) {
        uint256 xReserves = address(this).balance;
        uint256 yReserves = i_token.balanceOf(address(this));

        return calculateOutput(tokenAmount, yReserves, xReserves, i_swapFee);
    }

    /**
     * @notice Function for retrieving the amount of tokens required, when providing
     * liquidity with `nativeAmount` to the pool.
     * Note that token amount fluctuates with price and therefore changes constantly
     * @param nativeAmount is the amount of native currency
     * @return Amount of tokens required for deposit of `nativeAmount`
     */
    function getTokenAmountForNativeDeposit(uint256 nativeAmount) public view returns (uint256) {
        uint256 xReserves = address(this).balance;
        uint256 yReserves = i_token.balanceOf(address(this));

        return (nativeAmount * yReserves) / xReserves;
    }

    /**
     * @notice Function for retrieving eligible amount of native when withdrawing
     * `liquidityAmount`.
     * Note that native output fluctuates with price and therefore changes constantly
     * @param liquidityAmount is the amount of liquidity to be withdrawn
     * @return Native output when withdrawing `liquidityAmount`
     */
    function getEligibleNativeOf(uint256 liquidityAmount) public view returns (uint256) {
        uint256 xReserves = address(this).balance;
        return (liquidityAmount * xReserves) / s_poolLiquidity;
    }

    /**
     * @notice Function for retrieving eligible amount of tokens when withdrawing
     * `liquidityAmount`.
     * Note that token output fluctuates with price and therefore changes constantly
     * @param liquidityAmount is the amount of liquidity to be withdrawn
     * @return Token output when withdrawing `liquidityAmount`
     */
    function getEligibleTokensOf(uint256 liquidityAmount) public view returns (uint256) {
        uint256 yReserves = i_token.balanceOf(address(this));
        return (liquidityAmount * yReserves) / s_poolLiquidity;
    }
}
