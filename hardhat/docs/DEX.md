# DEX

*Philipp Keinberger*

> DEX

This contract provides a decentralized exchange, where users can use any of the liquidity pools added to the exchange to swap between assets. Liquidity pools can be added and removed through access-restricted functions, favourably controlled by a governor cvontract (e.g. DAO) to allow for decentralized governance of the DEX.

*This contract implements the IERC20 Openzeppelin interface for the ERC20 token standard. It also implements the ILiquidityPool interface for liquidity pools stored on the exchange. This contract inherits from Openzeppelins OwnableUpgradeable contract in order to allow for owner features, while still keeping upgradeablity functionality. The DEX is designed to be deployed through a proxy to allow for future upgrades of the contract.*

## Methods

### activateLiquidityPool

```solidity
function activateLiquidityPool(address liquidityPoolAddress) external nonpayable
```

Function for activating an already existing liquidity pool on the DEX

*This function can be used to allow previously used liquidity pools to be (re) activated on the DEX. It also allows for external liquidity pools that implement the ILiquidityPool interface to be activated on (added to) the exchange. The function can only be called by the owner and if the DEX is not CLOSED. The function will revert if any of these prerequisites is not met. This function emits the {LiquidityPoolActivated} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress | address | is the address of the active liquidity pool |

### addNativeLiquidityPool

```solidity
function addNativeLiquidityPool(address tokenAddress, uint16 swapFee, uint256 tokenDeposit) external payable
```

Function for adding a NativeLiquidityPool to the DEX

*The function uses the parameters to deploy a new NativeLiquidityPool and initializes it. The new liuqidity pool is then added to the DEX. Note that already existing liquidity pools with the same parameters as an existing one may still be added to the DEX. This function reverts if the caller is not the owner, or the state of the contract is CLOSED. It also reverts if the transfer of `tokenDeposit` from `msg.sender` fails, or the approval of the new liquidity pool to transfer `tokenDeposit` to itself fails. This function emits the {LiquidityPoolAdded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | is the address of the ERC20 contract |
| swapFee | uint16 | is the swapFee to be used for swapping in the pool |
| tokenDeposit | uint256 | is the amount of tokens to be used for initialization of the liquidity pool |

### addTokenLiquidityPool

```solidity
function addTokenLiquidityPool(address xAddress, address yAddress, uint16 swapFee, uint256 xDeposit, uint256 yDeposit) external nonpayable
```

Function for adding a TokenLiquidityPool to the DEX

*The function uses the parameters to deploy a new TokenLiquidityPool and initializes it. The new liuqidity pool is then added to the DEX. Note that already existing liquidity pools with the same parameters as an existing one may still be added to the DEX. The token addresses `xAddress` and `yAddress` may not match each other. This function reverts if the caller is not the owner, or the state of the contract is CLOSED. It also reverts if the transfer of `xDeposit` or `yDeposit` from `msg.sender` fails, or the approval of the new liquidity pool to transfer `xDeposit` or `yDeposit` to itself fails. This function emits the {LiquidityPoolAdded} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| xAddress | address | is the address of the x token in the new pool |
| yAddress | address | is the address of the y token in the new pool |
| swapFee | uint16 | is the swapFee to be used for swapping in the new pool |
| xDeposit | uint256 | is the amount of x tokens to be used of the caller for initialization of the pool |
| yDeposit | uint256 | is the amount of y tokens to be used of the caller for initialization of the pool |

### getState

```solidity
function getState() external view returns (enum DEX.State)
```

Function for retrieving the current State of the DEX




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | enum DEX.State | State of the DEX |

### getStatus

```solidity
function getStatus(address liquidityPoolAddress) external view returns (bool)
```

Function for retrieving activation status of liquidity pool at `liquidityPoolAddress`



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress | address | is the address of the liquidity pool |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | Activation value of liquidity pool at `liquidityPoolAddress` |

### getVersion

```solidity
function getVersion() external pure returns (uint256)
```

Function for retrieving version of the DEX




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | Version |

### initialize

```solidity
function initialize() external nonpayable
```



*Initializer function which replaces constructor for upgradeability functionality. Sets `msg.sender` as owner of the contract*


### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### removeLiquidityPool

```solidity
function removeLiquidityPool(address liquidityPoolAddress) external nonpayable
```

Function for removing a liquidity pool

*The function can only be called by the owner, if the DEX is not CLOSED and the liquidity pool exists on the DEX. The function will revert if any of these prerequisites is not met. This function emits the {LiquidityPoolRemoved} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress | address | is the address of the liquidity pool |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### setState

```solidity
function setState(enum DEX.State newState) external nonpayable
```

Function for setting the state of the DEX

*This function can only be called by the owner. This function emits the {StateUpdated} event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newState | enum DEX.State | is the new state value of the contract |

### swapAt

```solidity
function swapAt(address liquidityPoolAddress, uint256 tokenAmount) external payable
```

Function for swapping at liquidity pool at `liquidityPoolAddress`

*The function calls the swapFrom function of the liquidity pool at `liquidityPoolAddress` (see ILiquidityPool for more documentation). In order for the DEX to be able to swap from the caller (swap on behalf of `msg.sender`), the DEX needs to be approved with the `tokenAmount` or `msg.value` (depending on the pool and swap direction) by the caller at the liquidity pool prior to calling this function. See `approve` at ILiquidityPool for more documentation. The function can only be called if the DEX is not CLOSED. This implemenation will check for the liquidity pool at `liquidityPoolAddress` being active. The function will revert if any of these prerequisites is not met.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress | address | is the address of the liquidity pool |
| tokenAmount | uint256 | is the amount of tokens to be swapped. Note that `tokenAmount` can be zero if swapping native for tokens (xToY, NativeLiquidityPool) |

### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### LiquidityPoolActivated

```solidity
event LiquidityPoolActivated(address liquidityPoolAddress)
```

Event emitted when an already existing liquidity pool is activated on the DEX



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress  | address | undefined |

### LiquidityPoolAdded

```solidity
event LiquidityPoolAdded(address liquidityPoolAddress, enum ILiquidityPool.Kind liquidityPoolKind)
```

Event emitted when a new liquidity pool is added to the pool



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress  | address | undefined |
| liquidityPoolKind  | enum ILiquidityPool.Kind | undefined |

### LiquidityPoolRemoved

```solidity
event LiquidityPoolRemoved(address liquidityPoolAddress)
```

Event emitted when a liquidity pool is removed from the DEX



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress  | address | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### StateUpdated

```solidity
event StateUpdated(enum DEX.State newState)
```

Event emitted when the state of the contract gets updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| newState  | enum DEX.State | undefined |



## Errors

### DEX__LiquidityPoolIsActive

```solidity
error DEX__LiquidityPoolIsActive(address liquidityPoolAddress)
```

Thrown when liquidity pool at `liquidityPoolAddress` is already activated



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress | address | undefined |

### DEX__LiquidityPoolNotActive

```solidity
error DEX__LiquidityPoolNotActive(address liquidityPoolAddress)
```

Thrown when `liquidityPoolAddress` is not an active liquidity pool



#### Parameters

| Name | Type | Description |
|---|---|---|
| liquidityPoolAddress | address | undefined |

### DEX__StateIs

```solidity
error DEX__StateIs(uint8 state)
```

Thrown when state of contract is not equal to `state`



#### Parameters

| Name | Type | Description |
|---|---|---|
| state | uint8 | undefined |

### DEX__StateIsNot

```solidity
error DEX__StateIsNot(uint8 state)
```

Thrown when state of contract is equal to `state`



#### Parameters

| Name | Type | Description |
|---|---|---|
| state | uint8 | undefined |

### DEX__TokenAddressesOfTokenLiquidityPoolMatching

```solidity
error DEX__TokenAddressesOfTokenLiquidityPoolMatching()
```

Thrown when x and y addresses of new TokenLiquidityPool match




### DEX__TokenApprovalFailed

```solidity
error DEX__TokenApprovalFailed(address tokenAddress)
```

Thrown when approve function of ERC20 at `tokenAddress` fails



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |

### DEX__TokenTransferFailed

```solidity
error DEX__TokenTransferFailed(address tokenAddress)
```

Thrown when transfer of tokens at ERC20 `tokenAddress` fails



#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |


