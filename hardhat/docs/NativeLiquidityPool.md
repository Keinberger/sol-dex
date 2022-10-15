# NativeLiquidityPool

*Philipp Keinberger*

> NativeLiquidityPool

This contract is a liquidity pool, where users can swap between an ERC20 token and native blockchain currency (e.g. ETH, MATIC). Users can also provide liquidity to the pool, while accumulating rewards over time from the swapping fee. Liquidity can be withdrawn at all times. Users can swap tokens on behalf of other users by using the Allowance feature. In order to use that feature, one has to approve another user for future swaps on ones own behalf.

*This contract implements the ILiquidityPool interface to allow for standardized liquidity pool functionality for exchanges. This contract also implements the IERC20 Openzeppelin inteface for the ERC20 token standard. The TokenLiquidityPool inherits from Openzeppelins Ownable contract to allow for owner features. It also inherits from Openzeppelins Initializable contract to allow for a safe initialize function, favourably used by exchanges to initialize the liquidity pool. &quot;X&quot; refers to the native currency, while &quot;Y&quot; refers to the ERC20 token in the contract.*

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

### getEligibleNativeOf

```solidity
function getEligibleNativeOf(uint256 liquidityAmount) external view returns (uint256)
```

Function for retrieving eligible amount of native when withdrawing `liquidityAmount`. Note that native output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityAmount | uint256 | is the amount of liquidity to be withdrawn |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Native output when withdrawing `liquidityAmount` |

### getEligibleTokensOf

```solidity
function getEligibleTokensOf(uint256 liquidityAmount) external view returns (uint256)
```

Function for retrieving eligible amount of tokens when withdrawing `liquidityAmount`. Note that token output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityAmount | uint256 | is the amount of liquidity to be withdrawn |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Token output when withdrawing `liquidityAmount` |

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

### getNativeOutputForSwap

```solidity
function getNativeOutputForSwap(uint256 tokenAmount) external view returns (uint256)
```

Function for retrieving native output for swap of `tokenAmount`. Note that native output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAmount | uint256 | is the amount of tokens to be swapped |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of native expected to be received for swap |

### getPoolLiquidity

```solidity
function getPoolLiquidity() external view returns (uint256)
```

Function for retrieving the total liquidity in the pool




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Pool liquidity |

### getTokenAddress

```solidity
function getTokenAddress() external view returns (address)
```

Function for retrieving the address of ERC20 token




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | Address of ERC20 token |

### getTokenAmountForNativeDeposit

```solidity
function getTokenAmountForNativeDeposit(uint256 nativeAmount) external view returns (uint256)
```

Function for retrieving the amount of tokens required, when providing liquidity with `nativeAmount` to the pool. Note that token amount fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| nativeAmount | uint256 | is the amount of native currency |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of tokens required for deposit of `nativeAmount` |

### getTokenOutputForSwap

```solidity
function getTokenOutputForSwap(uint256 nativeAmount) external view returns (uint256)
```

Function for retrieving token output for swap of `nativeAmount`. Note that token output fluctuates with price and therefore changes constantly



#### Parameters

| Name | Type | Description |
|---|---|---|
| nativeAmount | uint256 | is the amount of native to be swapped |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Amount of tokens expected to be received for swap |

### initialize

```solidity
function initialize(uint256 tokenDeposit) external payable
```

Function for initializing (setting up) the liquidity pool

*This function initializes the liquidity pool with `msg.value` for x and `tokenDeposit` for y. This function reverts if the caller is not the owner of the contract. The function also reverts if `tokenDeposit` is not greater than zero. If the ERC20 transfer of `tokenDeposit` from caller to the contract fails, the function will revert. Note that this function can only be called once. This function emits the {LiquidityAdded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenDeposit | uint256 | is the token amount deposited |

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
function provideLiquidity() external payable
```

Function for providing liquidity to the pool

*The function uses `msg.value` to calculate the amount of tokens required for deposit. The amount of tokens has to be calculated, because it and `msg.value` have to be in ratio with the reserves of X and Y in the pool. Otherwise, a random amount of tokens would change the price of the assets in the pool. The amount of tokens required for a deposit of `msg.value` can be retrieved by the getTokenAmountForNativeDeposit function. Before calling the function, the caller has to approve the liquidity pool to transfer the amount of tokens required (getTokenAmountForNativeDeposit). It is advised to set allowance at the ERC20 higher than the output of getTokenAmountForNativeDeposit because of price fluctuations. This function reverts if the transfer of the required (calculated) deposit of tokens fails. This function emits the {LiquidityAdded} event.*


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

*This function calls _swapXtoY or _swapYtoX depending on `direction`. See _swapXtoY and _swapYtoX for more documentation*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAmount | uint256 | is the amount of tokens to be swapped to native currency. Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool) |
| direction | enum ILiquidityPool.SwapDirection | defines the direction of the swap (xToY or yToX) |

### swapFrom

```solidity
function swapFrom(address from, uint256 tokenAmount) external payable
```

Function for swapping tokens on other users behalf

*This function calls _swapXtoY or _swapYtoX depending on `direction`. See _swapXtoY and _swapYtoX for more documentation*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | is the address from which to swap |
| tokenAmount | uint256 | is the amount of tokens to be swapped to native currency. Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool) |

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

*The function calculates the amount of native and tokens eligible for withdrawal and automatically transfers that amount to the caller. The amount of native and tokens eligible is dependent on the pool reserves of both assets, `liquidityAmount` and the total liquidity in the pool. The eligible amount of the assets for withdrawal can be lower than the liquidity provided (Impermantent Loss), but usually is greater than the amount provided, because of accumulating swap fees in the liquidity pool. The function reverts if `liquidityAmount` exceeds the liquidity of the caller. This function also reverts if the native transfer or ERC20 transfer fails. The function emits the {LiquidityRemoved} event.*

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
event LiquidityAdded(address liquidityProvider, uint256 liquidityAmount, uint256 nativeDeposit, uint256 tokenDeposit)
```

Event emitted when new liquidity is provided (added) to the pool



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityProvider  | address | undefined |
| liquidityAmount  | uint256 | undefined |
| nativeDeposit  | uint256 | undefined |
| tokenDeposit  | uint256 | undefined |

### LiquidityRemoved

```solidity
event LiquidityRemoved(address liquidityProvider, uint256 liquidityAmount, uint256 nativeWithdrawn, uint256 tokensWithdrawn)
```

Event emitted when liquidity is withdrawn (removed) from the pool



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityProvider  | address | undefined |
| liquidityAmount  | uint256 | undefined |
| nativeWithdrawn  | uint256 | undefined |
| tokensWithdrawn  | uint256 | undefined |

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

### NativeLiquidityPool__NativeTransferFailed

```solidity
error NativeLiquidityPool__NativeTransferFailed()
```

Thrown when transfer of native currency fails




### NativeLiquidityPool__NotAboveZero

```solidity
error NativeLiquidityPool__NotAboveZero(uint256 value)
```

Thrown when `value` is not above zero



#### Parameters

| Name | Type | Description |
|---|---|---|
| value | uint256 | undefined |

### NativeLiquidityPool__NotEnoughAllowance

```solidity
error NativeLiquidityPool__NotEnoughAllowance()
```

Thrown when requested amount to swap is smaller than allowance




### NativeLiquidityPool__NotEnoughLiquidity

```solidity
error NativeLiquidityPool__NotEnoughLiquidity()
```

Thrown when requested liquidity amount for withdrawal exceeds actual liquidity




### NativeLiquidityPool__TokenTransferFailed

```solidity
error NativeLiquidityPool__TokenTransferFailed()
```

Thrown when transfer of erc20 token fails





