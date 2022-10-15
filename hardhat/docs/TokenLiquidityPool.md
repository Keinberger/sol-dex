# TokenLiquidityPool

*Philipp Keinberger*

> TokenLiquidityPool

This contract is a liquidity pool, where users can swap between two ERC20 tokens. Users can also provide liquidity to the pool, while accumulating rewards over time from the swap fee. Liquidity can be withdrawn at all times. Users can swap tokens on behalf of other users by using the Allowance feature. In order to use that feature, one has to approve another user for future swaps on ones own behalf.

*This contract implements the ILiquidityPool interface to allow for standardized liquidity pool functionality for exchanges. This contract also implements the IERC20 Openzeppelin inteface for the ERC20 token standard. The TokenLiquidityPool inherits from Openzeppelins Ownable contract to allow for owner features. It also inherits from Openzeppelins Initializable contract to allow for a safe initialize function, favourably used by exchanges to initialize the liquidity pool.*

## Methods

### approve

```solidity
function approve(address approvee, uint256 amount, enum ILiquidityPool.SwapDirection direction) external nonpayable
```

Function for approving other users to swap on ones own behalf

*This function approves `approvee` to swap `amount` from caller in direction of `direction`. Calling this function with `amount` equal to zero in effect resets the allowance. This function emits the {Approval} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| approvee | address | is the address that should be approved |
| amount | uint256 | is the amount approved for `approvee` to swap |
| direction | enum ILiquidityPool.SwapDirection | is the direction to allow swapping in |

### getAllowanceOf

```solidity
function getAllowanceOf(address owner, address allowee) external view returns (struct ILiquidityPool.Allowance)
```

Function for retrieving the allowance of `allowee` to swap on behalf of `owner`



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner | address | is the owner the tokens to swap |
| allowee | address | is the address allowed to swap according to allowance |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | ILiquidityPool.Allowance | Allowance of `allowee` to swap for `owner` |

### getEligibleXOf

```solidity
function getEligibleXOf(uint256 liquidityAmount) external view returns (uint256)
```

Function for retrieving eligible amount of x tokens when withdrawing `liquidityAmount` Note that x token output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityAmount | uint256 | is the amount of liquidity to be withdrawn |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | X token output when withdrawing `liquidityAmount` |

### getEligibleYOf

```solidity
function getEligibleYOf(uint256 liquidityAmount) external view returns (uint256)
```

Function for retrieving eligible amount of y tokens when withdrawing `liquidityAmount` Note that y token output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityAmount | uint256 | is the amount of liquidity to be withdrawn |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Y token output when withdrawing `liquidityAmount` |

### getKind

```solidity
function getKind() external pure returns (enum ILiquidityPool.Kind)
```

Function for retrieving the kind of the liquidity pool




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | enum ILiquidityPool.Kind | Kind of the liquidity pool |

### getLiquidityOf

```solidity
function getLiquidityOf(address addr) external view returns (uint256)
```

Function for retrieving liquidity of `addr`



#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | is the address of the liquidity owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Liquidity of `addr` |

### getPoolLiquidity

```solidity
function getPoolLiquidity() external view returns (uint256)
```

Function for retrieving the total liquidity in the pool




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Pool liquidity |

### getXTokenAddress

```solidity
function getXTokenAddress() external view returns (address)
```

Function for retrieving the address of x token




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of x token |

### getXTokenOutputForSwap

```solidity
function getXTokenOutputForSwap(uint256 yAmount) external view returns (uint256)
```

Function for retrieving x token output for swap of y tokens `yAmount` Note that token output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| yAmount | uint256 | is the amount of y tokens to be swapped |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of x tokens expected to be received for swap |

### getYAmountForDepositOfX

```solidity
function getYAmountForDepositOfX(uint256 xAmount) external view returns (uint256)
```

Function for retrieving the amount of y tokens required, when providing liquidity with `xAmount` to the pool Note that y amount fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| xAmount | uint256 | is the amount of x tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of y tokens required for deposit of `xAmount` |

### getYTokenAddress

```solidity
function getYTokenAddress() external view returns (address)
```

Function for retrieving the address of y token




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of y token |

### getYTokenOutputForSwap

```solidity
function getYTokenOutputForSwap(uint256 xAmount) external view returns (uint256)
```

Function for retrieving y token output for swap of x tokens `xAmount` Note that token output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| xAmount | uint256 | is the amount of x tokens to be swapped |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of y tokens expected to be received for swap |

### initialize

```solidity
function initialize(uint256 xDeposit, uint256 yDeposit) external nonpayable
```

Function for initializing (setting up) the liquidity pool

*This function initializes the liquidity pool with `xDeposit` for x and `yDeposit` for y. This function reverts if the caller is not the owner of the contract. The function also reverts if `xDeposit` or `yDeposit` is not greater than zero. If the transfer of `xDeposit` from xToken fails or the transfer of `yDeposit` from yToken fails, the function will revert. Note that this function can only be called once.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| xDeposit | uint256 | is the amount deposited from xToken |
| yDeposit | uint256 | is the mamount deposited from yToken |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### provideLiquidity

```solidity
function provideLiquidity(uint256 xDeposit) external nonpayable
```

Function for providing liquidity to the pool

*The function uses `xDeposit` to calculate the amount of Y required for deposit. The amount of Y has to be calculated, because it and `xDeposit` have to be in ratio with the reserves of X and Y in the pool. Otherwise, a random amount of Y would change the price of the assets in the pool. The amount of Y required for a deposit of `xDeposit` can be retrieved by the getYAmountForDepositOfX function. Before calling the function, the caller has to approve the liquidity pool to transfer `xDeposit` at xToken and the amount of Y required at yToken. It is advised to set allowance at yToken higher than the output of getYAmountForDepositOfX because of price fluctuations. This function reverts if the transfer of `xDeposit` or the required (calculated) deposit of Y fails. This function emits the {LiquidityAdded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| xDeposit | uint256 | is the amount deposited from xToken |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### swap

```solidity
function swap(uint256 tokenAmount, enum ILiquidityPool.SwapDirection direction) external payable
```

Function for swapping tokens

*This function calls _swap (see _swap for more documentation)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAmount | uint256 | is the amount of tokens to be swapped to native currency. Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool) |
| direction | enum ILiquidityPool.SwapDirection | defines the direction of the swap (xToY or yToX) |

### swapFrom

```solidity
function swapFrom(address from, uint256 amount) external payable
```

Function for swapping tokens on other users behalf

*This function calls _swap (see _swap for more documentation)*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | is the address from which to swap |
| amount | uint256 | undefined |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### withdrawLiquidity

```solidity
function withdrawLiquidity(uint256 liquidityAmount) external nonpayable
```

Function for withdrawing liquidity from the pool

*The function calculates the amount of x and y eligible for withdrawal and automatically transfers that amount to the caller. The amount of x and y eligible is dependent on the pool reserves of both assets, `liquidityAmount` and the total liquidity in the pool. The eligible amount of the assets for withdrawal can be lower than the liquidity provided (Impermantent Loss), but usually is greater than the amount provided, because of accumulating swap fees in the liquidity pool. The function reverts if `liquidityAmount` exceeds the liquidity of the caller. This function also reverts if the transfer of the amount of x or y eligible fails. The function emits the {LiquidityRemoved} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityAmount | uint256 | is the amount of liquidity to be withdrawn |



## Events

### Approval

```solidity
event Approval(address owner, address approvee, uint256 amount, enum ILiquidityPool.SwapDirection direction)
```

Event emitted when `owner` approves `approvee` to swap `amount` in the direction of `direction`



#### Parameters

| Name | Type | Description |
|---|---|---|
| owner  | address | undefined |
| approvee  | address | undefined |
| amount  | uint256 | undefined |
| direction  | enum ILiquidityPool.SwapDirection | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### LiquidityAdded

```solidity
event LiquidityAdded(address liquidityProvider, uint256 liquidityAmount, uint256 xDeposit, uint256 yDeposit)
```

Event emitted when new liquidity is provided (added) to the pool



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityProvider  | address | undefined |
| liquidityAmount  | uint256 | undefined |
| xDeposit  | uint256 | undefined |
| yDeposit  | uint256 | undefined |

### LiquidityRemoved

```solidity
event LiquidityRemoved(address liquidityProvider, uint256 liquidityAmount, uint256 xWithdrawn, uint256 yWithdrawn)
```

Event emitted when liquidity is withdrawn (removed) from the pool



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityProvider  | address | undefined |
| liquidityAmount  | uint256 | undefined |
| xWithdrawn  | uint256 | undefined |
| yWithdrawn  | uint256 | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### Swap

```solidity
event Swap(address swapee, uint256 amount, uint256 output, enum ILiquidityPool.SwapDirection direction)
```

Event emitted when `swapee` swaps `amount` in the direction of `direction`. Note that `amount` may be zero.



#### Parameters

| Name | Type | Description |
|---|---|---|
| swapee  | address | undefined |
| amount  | uint256 | undefined |
| output  | uint256 | undefined |
| direction  | enum ILiquidityPool.SwapDirection | undefined |



## Errors

### TokenLiquidityPool__NativeNotAccepted

```solidity
error TokenLiquidityPool__NativeNotAccepted()
```

Thrown when caller sends native currency (eth) to the contract




### TokenLiquidityPool__NotAboveZero

```solidity
error TokenLiquidityPool__NotAboveZero(uint256 value)
```

Thrown when `value` is not above zero



#### Parameters

| Name | Type | Description |
|---|---|---|
| value | uint256 | undefined |

### TokenLiquidityPool__NotEnoughAllowance

```solidity
error TokenLiquidityPool__NotEnoughAllowance()
```

Thrown when requested amount to swap is smaller than allowance




### TokenLiquidityPool__NotEnoughLiquidity

```solidity
error TokenLiquidityPool__NotEnoughLiquidity()
```

Thrown when requested liquidity amount for withdrawal exceeds actual liquidity




### TokenLiquidityPool__TokenTransferFailed

```solidity
error TokenLiquidityPool__TokenTransferFailed(address tokenAddress)
```

Thrown when transfer of tokens at erc20 contract `tokenAddress` fails



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |


