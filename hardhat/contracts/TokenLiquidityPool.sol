// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "./ILiquidityPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/// @notice Thrown when `value` is not above zero
error TokenLiquidityPool__NotAboveZero(uint256 value);
/// @notice Thrown when transfer of tokens at erc20 contract `tokenAddress` fails
error TokenLiquidityPool__TokenTransferFailed(address tokenAddress);
/// @notice Thrown when requested liquidity amount for withdrawal exceeds actual liquidity
error TokenLiquidityPool__NotEnoughLiquidity();
/// @notice Thrown when caller sends native currency (eth) to the contract
error TokenLiquidityPool__NativeNotAccepted();
/// @notice Thrown when requested amount to swap is smaller than allowance
error TokenLiquidityPool__NotEnoughAllowance();

/**
 * @title TokenLiquidityPool
 * @author Philipp Keinberger
 * @notice This contract is a liquidity pool, where users can swap between two ERC20
 * tokens. Users can also provide liquidity to the pool, while accumulating rewards
 * over time from the swap fee. Liquidity can be withdrawn at all times. Users can
 * swap tokens on behalf of other users by using the Allowance feature. In order to use
 * that feature, one has to approve another user for future swaps on ones own behalf.
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
 */
contract TokenLiquidityPool is Ownable, Initializable, ILiquidityPool {
    Kind private constant LP_KIND = Kind.TokenLiquidityPool;
    IERC20 private immutable i_xToken;
    IERC20 private immutable i_yToken;
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
        uint256 xDeposit,
        uint256 yDeposit
    );
    /// @notice Event emitted when liquidity is withdrawn (removed) from the pool
    event LiquidityRemoved(
        address liquidityProvider,
        uint256 liquidityAmount,
        uint256 xWithdrawn,
        uint256 yWithdrawn
    );

    constructor(
        address xAddress,
        address yAddress,
        uint16 swapFee
    ) {
        i_xToken = IERC20(xAddress);
        i_yToken = IERC20(yAddress);
        i_swapFee = swapFee;
    }

    /**
     * @notice Function for initializing (setting up) the liquidity pool
     * @param xDeposit is the amount deposited from xToken
     * @param yDeposit is the mamount deposited from yToken
     * @dev This function initializes the liquidity pool with `xDeposit` for x
     * and `yDeposit` for y.
     * This function reverts if the caller is not the owner of the contract.
     * The function also reverts if `xDeposit` or `yDeposit` is not greater than zero.
     * If the transfer of `xDeposit` from xToken fails or the transfer of `yDeposit`
     * from yToken fails, the function will revert.
     *
     * Note that this function can only be called once.
     */
    function initialize(uint256 xDeposit, uint256 yDeposit) external onlyOwner initializer {
        if (xDeposit <= 0) revert TokenLiquidityPool__NotAboveZero(xDeposit);
        if (yDeposit <= 0) revert TokenLiquidityPool__NotAboveZero(yDeposit);

        if (!i_xToken.transferFrom(msg.sender, address(this), xDeposit))
            revert TokenLiquidityPool__TokenTransferFailed(address(i_xToken));
        if (!i_yToken.transferFrom(msg.sender, address(this), yDeposit))
            revert TokenLiquidityPool__TokenTransferFailed(address(i_yToken));

        s_liquidityOf[msg.sender] = xDeposit;
        s_poolLiquidity = xDeposit;

        emit LiquidityAdded(msg.sender, xDeposit, xDeposit, yDeposit);
    }

    /**
     * @notice Function for providing liquidity to the pool
     * @param xDeposit is the amount deposited from xToken
     * @dev The function uses `xDeposit` to calculate the amount of Y required
     * for deposit. The amount of Y has to be calculated, because it and `xDeposit`
     * have to be in ratio with the reserves of X and Y in the pool. Otherwise,
     * a random amount of Y would change the price of the assets in the pool.
     * The amount of Y required for a deposit of `xDeposit` can be retrieved by the
     * getYAmountForDepositOfX function.
     *
     * Before calling the function, the caller has to approve the liquidity pool
     * to transfer `xDeposit` at xToken and the amount of Y required at yToken.
     * It is advised to set allowance at yToken higher than the output of
     * getYAmountForDepositOfX because of price fluctuations.
     *
     * This function reverts if the transfer of `xDeposit` or the required
     * (calculated) deposit of Y fails.
     *
     * This function emits the {LiquidityAdded} event.
     */
    function provideLiquidity(uint256 xDeposit) external {
        uint256 xReserves = i_xToken.balanceOf(address(this));
        uint256 yReserves = i_yToken.balanceOf(address(this));

        uint256 requiredDepositOfY = (xDeposit * yReserves) / xReserves;

        if (!i_xToken.transferFrom(msg.sender, address(this), xDeposit))
            revert TokenLiquidityPool__TokenTransferFailed(address(i_xToken));

        if (!i_yToken.transferFrom(msg.sender, address(this), requiredDepositOfY))
            revert TokenLiquidityPool__TokenTransferFailed(address(i_yToken));

        uint256 userLiquidity = (xDeposit * s_poolLiquidity) / xReserves;
        s_liquidityOf[msg.sender] += userLiquidity;
        s_poolLiquidity += userLiquidity;

        emit LiquidityAdded(msg.sender, userLiquidity, xDeposit, requiredDepositOfY);
    }

    /**
     * @notice Function for withdrawing liquidity from the pool
     * @param liquidityAmount is the amount of liquidity to be withdrawn
     * @dev The function calculates the amount of x and y eligible
     * for withdrawal and automatically transfers that amount to the caller.
     * The amount of x and y eligible is dependent on the pool reserves of both assets,
     * `liquidityAmount` and the total liquidity in the pool. The eligible amount of
     * the assets for withdrawal can be lower than the liquidity provided (Impermantent Loss),
     * but usually is greater than the amount provided, because of accumulating swap fees in
     * the liquidity pool.
     *
     * The function reverts if `liquidityAmount` exceeds the liquidity of the caller.
     * This function also reverts if the transfer of the amount of x or y eligible fails.
     *
     * The function emits the {LiquidityRemoved} event.
     */
    function withdrawLiquidity(uint256 liquidityAmount) external {
        if (liquidityAmount > s_liquidityOf[msg.sender])
            revert TokenLiquidityPool__NotEnoughLiquidity();

        uint256 xReserves = i_xToken.balanceOf(address(this));
        uint256 yReserves = i_yToken.balanceOf(address(this));
        uint256 l_poolLiquidity = s_poolLiquidity;

        uint256 xEligible = (liquidityAmount * xReserves) / l_poolLiquidity;
        uint256 yEligible = (liquidityAmount * yReserves) / l_poolLiquidity;

        s_liquidityOf[msg.sender] -= liquidityAmount;
        s_poolLiquidity -= liquidityAmount;

        if (!i_xToken.transfer(msg.sender, xEligible))
            revert TokenLiquidityPool__TokenTransferFailed(address(i_xToken));
        if (!i_yToken.transfer(msg.sender, yEligible))
            revert TokenLiquidityPool__TokenTransferFailed(address(i_yToken));

        emit LiquidityRemoved(msg.sender, liquidityAmount, xEligible, yEligible);
    }

    /**
     * @inheritdoc ILiquidityPool
     * @dev This function calls _swap (see _swap for more documentation)
     */
    function swap(uint256 tokenAmount, SwapDirection direction) external payable override {
        if (msg.value > 0) revert TokenLiquidityPool__NativeNotAccepted();
        _swap(msg.sender, tokenAmount, direction);
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
     * @dev This function calls _swap (see _swap for more documentation)
     */
    function swapFrom(address from, uint256 amount) external payable override {
        if (msg.value > 0) revert TokenLiquidityPool__NativeNotAccepted();

        Allowance memory l_allowance = s_allowanceOf[from][msg.sender];
        if (amount > l_allowance.amount) revert TokenLiquidityPool__NotEnoughAllowance();

        s_allowanceOf[from][msg.sender].amount -= amount;

        _swap(from, amount, l_allowance.direction);
    }

    /**
     * @notice Function for calculating token output for swap
     * @param amount is the amount to be swapped
     * @param fromTokenReserves are the reserves of the token swapped from
     * @param outputTokenReserves are the reserves of the output token
     * @param fee is the fee (in 1/10 of percent) to be substracted
     * from the token output
     * @return Token output for swap of amount
     * @dev This function calculates the amount of tokens, that one recieves
     * for swapping `amount`. The fee `fee` will be substracted from the token
     * output
     */
    function calculateTokenOutput(
        uint256 amount,
        uint256 fromTokenReserves,
        uint256 outputTokenReserves,
        uint256 fee
    ) internal pure returns (uint256) {
        uint256 amountMinusFee = amount * (1000 - fee);

        uint256 numerator = amountMinusFee * outputTokenReserves;
        uint256 denominator = fromTokenReserves * 1000 + amountMinusFee;
        return numerator / denominator;
    }

    /**
     * @notice Function for executing token swap
     * @param swapee is the address to swap from
     * @param amount is the amount to be swapped
     * @param direction defines the direction of the swap (xToY or yToX)
     * @dev The function transfers `amount` to the pool and in return transfers
     * the output tokens (retrieved by calculateTokenOutput) to `swapee`.
     *
     * This function reverts if the transfer of `amount` or output tokens fails.
     *
     * This function emits the {Swap} event.
     */
    function _swap(
        address swapee,
        uint256 amount,
        SwapDirection direction
    ) internal {
        IERC20 fromToken;
        IERC20 outputToken;

        if (direction == SwapDirection.xToY) {
            fromToken = IERC20(i_xToken);
            outputToken = IERC20(i_yToken);
        } else if (direction == SwapDirection.yToX) {
            fromToken = IERC20(i_yToken);
            outputToken = IERC20(i_xToken);
        }

        uint256 tokenFromReserves = fromToken.balanceOf(address(this));
        uint256 tokenInReserves = outputToken.balanceOf(address(this));

        uint256 tokenOutput = calculateTokenOutput(
            amount,
            tokenFromReserves,
            tokenInReserves,
            i_swapFee
        );

        if (!fromToken.transferFrom(swapee, address(this), amount))
            revert TokenLiquidityPool__TokenTransferFailed(address(fromToken));

        if (!outputToken.transfer(swapee, tokenOutput))
            revert TokenLiquidityPool__TokenTransferFailed(address(outputToken));

        emit Swap(msg.sender, amount, tokenOutput, direction);
    }

    /// @inheritdoc ILiquidityPool
    function getKind() public pure override returns (Kind) {
        return LP_KIND;
    }

    /**
     * @notice Function for retrieving the address of x token
     * @return Address of x token
     */
    function getXTokenAddress() public view returns (address) {
        return address(i_xToken);
    }

    /**
     * @notice Function for retrieving the address of y token
     * @return Address of y token
     */
    function getYTokenAddress() public view returns (address) {
        return address(i_yToken);
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
     * @notice Function for retrieving y token output for swap of x tokens `xAmount`
     * Note that token output fluctuates with price and therefore changes constantly
     * @param xAmount is the amount of x tokens to be swapped
     * @return Amount of y tokens expected to be received for swap
     */
    function getYTokenOutputForSwap(uint256 xAmount) public view returns (uint256) {
        uint256 xReserves = i_xToken.balanceOf(address(this));
        uint256 yReserves = i_yToken.balanceOf(address(this));

        return calculateTokenOutput(xAmount, xReserves, yReserves, i_swapFee);
    }

    /**
     * @notice Function for retrieving x token output for swap of y tokens `yAmount`
     * Note that token output fluctuates with price and therefore changes constantly
     * @param yAmount is the amount of y tokens to be swapped
     * @return Amount of x tokens expected to be received for swap
     */
    function getXTokenOutputForSwap(uint256 yAmount) public view returns (uint256) {
        uint256 yReserves = i_yToken.balanceOf(address(this));
        uint256 xReserves = i_xToken.balanceOf(address(this));

        return calculateTokenOutput(yAmount, yReserves, xReserves, i_swapFee);
    }

    /**
     * @notice Function for retrieving the amount of y tokens required, when providing
     * liquidity with `xAmount` to the pool
     * Note that y amount fluctuates with price and therefore changes constantly
     * @param xAmount is the amount of x tokens
     * @return Amount of y tokens required for deposit of `xAmount`
     */
    function getYAmountForDepositOfX(uint256 xAmount) public view returns (uint256) {
        uint256 xReserves = i_xToken.balanceOf(address(this));
        uint256 yReserves = i_yToken.balanceOf(address(this));

        return (xAmount * yReserves) / xReserves;
    }

    /**
     * @notice Function for retrieving eligible amount of x tokens when withdrawing
     * `liquidityAmount`
     * Note that x token output fluctuates with price and therefore changes constantly
     * @param liquidityAmount is the amount of liquidity to be withdrawn
     * @return X token output when withdrawing `liquidityAmount`
     */
    function getEligibleXOf(uint256 liquidityAmount) public view returns (uint256) {
        uint256 xReserves = i_xToken.balanceOf(address(this));
        return (liquidityAmount * xReserves) / s_poolLiquidity;
    }

    /**
     * @notice Function for retrieving eligible amount of y tokens when withdrawing
     * `liquidityAmount`
     * Note that y token output fluctuates with price and therefore changes constantly
     * @param liquidityAmount is the amount of liquidity to be withdrawn
     * @return Y token output when withdrawing `liquidityAmount`
     */
    function getEligibleYOf(uint256 liquidityAmount) public view returns (uint256) {
        uint256 yReserves = i_yToken.balanceOf(address(this));
        return (liquidityAmount * yReserves) / s_poolLiquidity;
    }
}
