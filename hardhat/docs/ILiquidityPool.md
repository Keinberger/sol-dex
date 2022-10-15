# ILiquidityPool







*This is an interface for the TokenLiquidityPool and NativeLiquidityPool contracts to implement standardized functionality of both liquidity pools. Using this interface, third party contracts can use liquidity pools of both types, while keeping core features standardized.*

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

### getKind

```solidity
function getKind() external nonpayable returns (enum ILiquidityPool.Kind)
```

Function for retrieving the kind of the liquidity pool




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | enum ILiquidityPool.Kind | Kind of the liquidity pool |

### swap

```solidity
function swap(uint256 tokenAmount, enum ILiquidityPool.SwapDirection direction) external payable
```

Function for swapping tokens

*This function has to be payable to allow for native currency to token swaps. Note that tn that case, `tokenAmount` may be zero.*

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

*This function swaps `tokenAmount` from `from` in the direction specified by the allowance and removes `tokenAmount` from the allowance. This function reverts if `tokenAmount` is greater than the allowance set by `from`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| from | address | is the address from which to swap |
| tokenAmount | uint256 | is the amount of tokens to be swapped to native currency. Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool) |



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



