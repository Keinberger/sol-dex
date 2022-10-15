const { expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const chainId = network.config.chainId
const contractConfig = networkConfig[chainId].contracts.TokenLiquidityPool
const contractName = contractConfig.name

const testContracts = networkConfig[chainId].forTests
const aTokenName = testContracts[0].name
const bTokenName = testContracts[1].name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName, () => {
          let contract,
              deployer,
              user,
              aToken,
              bToken,
              initializeAmount,
              userContract,
              aUserToken,
              bUserToken,
              ERC20_ERROR_INSUFFICIENT_ALLOWANCE

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              user = await ethers.getSigner((await getNamedAccounts()).user)
              await deployments.fixture(["forTests"])
              contract = await ethers.getContract(contractName, deployer.address)
              aToken = await ethers.getContract(aTokenName, deployer.address)
              bToken = await ethers.getContract(bTokenName, deployer.address)
              userContract = contract.connect(user)
              aUserToken = aToken.connect(user)
              bUserToken = bToken.connect(user)

              initializeAmount = ethers.utils.parseEther("1000")

              const userTokenBalance = ethers.utils.parseEther("1000")
              await aToken.transfer(user.address, userTokenBalance)
              await bToken.transfer(user.address, userTokenBalance)

              ERC20_ERROR_INSUFFICIENT_ALLOWANCE = "ERC20: insufficient allowance"
          })

          describe("initialize", () => {
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await bToken.approve(contract.address, initializeAmount)
              })
              it("can only be called by owner", async () => {
                  await expect(
                      userContract.initialize(initializeAmount, initializeAmount)
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
              it("can only be called once", async () => {
                  await contract.initialize(initializeAmount, initializeAmount)
                  await expect(
                      contract.initialize(initializeAmount, initializeAmount)
                  ).to.be.revertedWith("Initializable: contract is already initialized")
              })
              it("reverts if x or y deposit smaller or equal to 0", async () => {
                  await expect(contract.initialize(0, initializeAmount)).to.be.revertedWith(
                      "TokenLiquidityPool__NotAboveZero(0)"
                  )
                  await expect(contract.initialize(initializeAmount, 0)).to.be.revertedWith(
                      "TokenLiquidityPool__NotAboveZero(0)"
                  )
              })
              it("reverts if transfer of a or b tokens fails", async () => {
                  await expect(
                      contract.initialize(initializeAmount.add(1), initializeAmount)
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)

                  await expect(
                      contract.initialize(initializeAmount, initializeAmount.add(1))
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)
              })
              it("sets the liquidity of sender", async () => {
                  await contract.initialize(initializeAmount, initializeAmount)
                  const liquidityOfSender = await contract.getLiquidityOf(deployer.address)

                  expect(liquidityOfSender.toString()).to.equal(initializeAmount)
              })
              it("sets the liquidity of the pool", async () => {
                  await contract.initialize(initializeAmount, initializeAmount)
                  const poolLiquidity = await contract.getPoolLiquidity()

                  expect(poolLiquidity.toString()).to.equal(initializeAmount.toString())
              })
              it("emits event correctly", async () => {
                  await expect(contract.initialize(initializeAmount, initializeAmount))
                      .to.emit(contract, "LiquidityAdded")
                      .withArgs(
                          deployer.address,
                          initializeAmount,
                          initializeAmount,
                          initializeAmount
                      )
              })
          })

          describe("provideLiquidity", () => {
              let provideLiquidityAmount, expectedLiquidityMinted
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await bToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, initializeAmount)

                  provideLiquidityAmount = ethers.utils.parseEther("100")
                  await aUserToken.approve(contract.address, provideLiquidityAmount)
                  await bUserToken.approve(contract.address, provideLiquidityAmount)

                  const poolLiquidity = await contract.getPoolLiquidity()
                  const xReserves = await aToken.balanceOf(contract.address)
                  expectedLiquidityMinted = provideLiquidityAmount.mul(poolLiquidity).div(xReserves)
              })
              it("reverts if transfer of a or b tokens fails", async () => {
                  const aBalanceOfUser = await aToken.balanceOf(user.address)

                  await expect(
                      userContract.provideLiquidity(aBalanceOfUser.add(1))
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)
              })
              it("sets minted liquidity of sender", async () => {
                  await userContract.provideLiquidity(provideLiquidityAmount)

                  const liquidityOfSender = await contract.getLiquidityOf(user.address)
                  expect(liquidityOfSender.toString()).to.equal(expectedLiquidityMinted.toString())
              })
              it("sets minted liquidity of pool", async () => {
                  const poolLiquidityBefore = await contract.getPoolLiquidity()

                  await userContract.provideLiquidity(provideLiquidityAmount)

                  const poolLiquidity = await contract.getPoolLiquidity()

                  expect(poolLiquidity.sub(poolLiquidityBefore).toString()).to.equal(
                      expectedLiquidityMinted.toString()
                  )
              })
              it("emits event correctly", async () => {
                  await expect(userContract.provideLiquidity(provideLiquidityAmount))
                      .to.emit(userContract, "LiquidityAdded")
                      .withArgs(
                          user.address,
                          expectedLiquidityMinted.toString(),
                          provideLiquidityAmount.toString(),
                          provideLiquidityAmount.toString()
                      )
              })
          })

          describe("withdrawLiquidity", () => {
              let liquidityAmount, aEligible, bEligible
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await bToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, initializeAmount)

                  provideLiquidityAmount = ethers.utils.parseEther("100")
                  await aUserToken.approve(contract.address, provideLiquidityAmount)
                  await bUserToken.approve(contract.address, provideLiquidityAmount)
                  await userContract.provideLiquidity(provideLiquidityAmount)

                  liquidityAmount = await contract.getLiquidityOf(user.address)

                  const aReserves = await aUserToken.balanceOf(userContract.address)
                  const poolLiquidity = await userContract.getPoolLiquidity()
                  aEligible = liquidityAmount.mul(aReserves).div(poolLiquidity)

                  const bReserves = await bUserToken.balanceOf(userContract.address)
                  bEligible = liquidityAmount.mul(bReserves).div(poolLiquidity)
              })

              it("reverts if requested amount is above eligible liquidity", async () => {
                  await expect(
                      userContract.withdrawLiquidity(liquidityAmount.add(1))
                  ).to.be.revertedWith("TokenLiquidityPool__NotEnoughLiquidity")
              })
              it("updates liquidity of sender", async () => {
                  const liquidityBefore = await userContract.getLiquidityOf(user.address)
                  await userContract.withdrawLiquidity(liquidityAmount)
                  const liquidityNow = await userContract.getLiquidityOf(user.address)

                  expect(liquidityBefore.sub(liquidityAmount).toString()).to.equal(
                      liquidityNow.toString()
                  )
              })
              it("updates pool liquidity", async () => {
                  const liquidityBefore = await userContract.getPoolLiquidity()
                  await userContract.withdrawLiquidity(liquidityAmount)
                  const liquidityNow = await userContract.getPoolLiquidity()

                  expect(liquidityBefore.sub(liquidityAmount).toString()).to.equal(
                      liquidityNow.toString()
                  )
              })
              it("sends eligible x tokens to sender", async () => {
                  const userTokenBalanceBefore = await aUserToken.balanceOf(user.address)

                  await userContract.withdrawLiquidity(liquidityAmount)

                  const userTokenBalance = await aUserToken.balanceOf(user.address)

                  expect(userTokenBalance.sub(userTokenBalanceBefore).toString()).to.equal(
                      aEligible.toString()
                  )
              })
              it("sends eligible y tokens to sender", async () => {
                  const userTokenBalanceBefore = await bUserToken.balanceOf(user.address)

                  await userContract.withdrawLiquidity(liquidityAmount)

                  const userTokenBalance = await bUserToken.balanceOf(user.address)

                  expect(userTokenBalance.sub(userTokenBalanceBefore).toString()).to.equal(
                      bEligible.toString()
                  )
              })
              it("emits event correctly", async () => {
                  await expect(userContract.withdrawLiquidity(liquidityAmount))
                      .to.emit(userContract, "LiquidityRemoved")
                      .withArgs(
                          user.address,
                          liquidityAmount.toString(),
                          aEligible.toString(),
                          bEligible.toString()
                      )
              })
          })

          describe("swap", () => {
              let swapAmount
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await bToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, initializeAmount)

                  swapAmount = ethers.utils.parseEther("10")
              })
              it("reverts if eth sent to function", async () => {
                  await expect(
                      userContract.swap(swapAmount, 0, { value: swapAmount })
                  ).to.be.revertedWith("TokenLiquidityPool__NativeNotAccepted()")
              })
              it("reverts if transfer of tokens from sender fails", async () => {
                  await expect(userContract.swap(swapAmount, 0)).to.be.revertedWith(
                      ERC20_ERROR_INSUFFICIENT_ALLOWANCE
                  )
              })
              it("transfers tokens to sender (xToY)", async () => {
                  const aBalanceBefore = await aToken.balanceOf(user.address)
                  const bBalanceBefore = await bToken.balanceOf(user.address)
                  const bTokenOutput = await userContract.getYTokenOutputForSwap(swapAmount)

                  await aUserToken.approve(userContract.address, swapAmount)
                  await userContract.swap(swapAmount, 0)

                  const aBalanceNow = await aToken.balanceOf(user.address)
                  const bBalanceNow = await bToken.balanceOf(user.address)

                  expect(aBalanceBefore.sub(swapAmount).toString()).to.equal(aBalanceNow.toString())
                  expect(bBalanceBefore.add(bTokenOutput).toString()).to.equal(
                      bBalanceNow.toString()
                  )
              })
              it("transfers tokens to sender (yToX)", async () => {
                  const aBalanceBefore = await aToken.balanceOf(user.address)
                  const bBalanceBefore = await bToken.balanceOf(user.address)
                  const aTokenOutput = await userContract.getXTokenOutputForSwap(swapAmount)

                  await bUserToken.approve(userContract.address, swapAmount)
                  await userContract.swap(swapAmount, 1)

                  const aBalanceNow = await aToken.balanceOf(user.address)
                  const bBalanceNow = await bToken.balanceOf(user.address)

                  expect(aBalanceBefore.add(aTokenOutput).toString()).to.equal(
                      aBalanceNow.toString()
                  )
                  expect(bBalanceBefore.sub(swapAmount).toString()).to.equal(bBalanceNow.toString())
              })
              it("emits event correctly", async () => {
                  const bTokenOutput = await userContract.getYTokenOutputForSwap(swapAmount)
                  await aUserToken.approve(userContract.address, swapAmount)
                  await expect(userContract.swap(swapAmount, 0))
                      .to.emit(userContract, "Swap")
                      .withArgs(user.address, swapAmount.toString(), bTokenOutput.toString(), 0)
              })
          })

          describe("approve", async () => {
              let approvalAmount, approvalDirection
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await bToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, initializeAmount)

                  approvalAmount = ethers.utils.parseEther("1")
                  approvalDirection = 1
              })
              it("sets allowance", async () => {
                  await userContract.approve(deployer.address, approvalAmount, approvalDirection)
                  const allowance = await userContract.getAllowanceOf(
                      user.address,
                      deployer.address
                  )

                  expect(allowance.amount.toString()).to.equal(approvalAmount.toString())
                  expect(allowance.direction.toString()).to.equal(approvalDirection.toString())
              })
              it("emits event correctly", async () => {
                  await expect(
                      userContract.approve(deployer.address, approvalAmount, approvalDirection)
                  )
                      .to.emit(userContract, "Approval")
                      .withArgs(
                          user.address,
                          deployer.address,
                          approvalAmount.toString(),
                          approvalDirection
                      )
              })
          })
          describe("swapFrom", async () => {
              let allowanceAmount, swapAmount, swapDirection
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await bToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, initializeAmount)

                  allowanceAmount = ethers.utils.parseEther("20")
                  swapAmount = ethers.utils.parseEther("10")
                  swapDirection = 0

                  await aUserToken.approve(contract.address, allowanceAmount)
              })
              it("reverts if eth sent to function", async () => {
                  await expect(
                      contract.swapFrom(user.address, swapAmount, { value: swapAmount })
                  ).to.be.revertedWith("TokenLiquidityPool__NativeNotAccepted")
              })
              it("reverts if not enough allowance", async () => {
                  await expect(contract.swapFrom(user.address, swapAmount)).to.be.revertedWith(
                      "TokenLiquidityPool__NotEnoughAllowance"
                  )
              })
              it("updates allowance", async () => {
                  await userContract.approve(deployer.address, allowanceAmount, swapDirection)
                  const allowanceBefore = await contract.getAllowanceOf(
                      user.address,
                      deployer.address
                  )

                  await contract.swapFrom(user.address, swapAmount)

                  const allowance = await contract.getAllowanceOf(user.address, deployer.address)
                  expect(allowanceBefore.amount.sub(swapAmount).toString()).to.equal(
                      allowance.amount.toString()
                  )
              })
              it("swaps tokens", async () => {
                  await userContract.approve(deployer.address, allowanceAmount, swapDirection)

                  const aBalanceBefore = await aToken.balanceOf(user.address)
                  const bBalanceBefore = await bToken.balanceOf(user.address)
                  const bTokenOutput = await userContract.getYTokenOutputForSwap(swapAmount)

                  await expect(contract.swapFrom(user.address, swapAmount)).to.emit(
                      contract,
                      "Swap"
                  )

                  const aBalance = await aToken.balanceOf(user.address)
                  const bBalance = await bToken.balanceOf(user.address)

                  expect(aBalanceBefore.sub(swapAmount).toString()).to.equal(aBalance.toString())
                  expect(bBalanceBefore.add(bTokenOutput).toString()).to.equal(bBalance.toString())
              })
          })
      })
