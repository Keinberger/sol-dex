const { expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const chainId = network.config.chainId
const contractConfig = networkConfig[chainId].contracts.NativeLiquidityPool
const contractName = contractConfig.name

const testContracts = networkConfig[chainId].forTests
const aTokenName = testContracts[0].name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName, () => {
          let contract,
              deployer,
              user,
              aToken,
              userContract,
              initializeAmount,
              aUserToken,
              ERC20_ERROR_INSUFFICIENT_ALLOWANCE

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              user = await ethers.getSigner((await getNamedAccounts()).user)
              await deployments.fixture(["forTests"])
              contract = await ethers.getContract(contractName, deployer.address)
              aToken = await ethers.getContract(aTokenName, deployer.address)
              userContract = contract.connect(user)
              aUserToken = aToken.connect(user)

              initializeAmount = ethers.utils.parseEther("100")

              await aToken.transfer(user.address, ethers.utils.parseEther("100"))

              ERC20_ERROR_INSUFFICIENT_ALLOWANCE = "ERC20: insufficient allowance"
          })

          describe("initialize", () => {
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
              })
              it("can only be called by owner", async () => {
                  await expect(
                      userContract.initialize(initializeAmount, { value: initializeAmount })
                  ).to.be.revertedWith("Ownable: caller is not the owner")
              })
              it("can only be called once", async () => {
                  await contract.initialize(initializeAmount, { value: initializeAmount })
                  await expect(
                      contract.initialize(initializeAmount, { value: initializeAmount })
                  ).to.be.revertedWith("Initializable: contract is already initialized")
              })
              it("reverts if msg.value or tokenDeposit smaller or equal to 0", async () => {
                  await expect(contract.initialize(initializeAmount)).to.be.revertedWith(
                      "NativeLiquidityPool__NotAboveZero(0)"
                  )
                  await expect(
                      contract.initialize(0, { value: initializeAmount })
                  ).to.be.revertedWith("NativeLiquidityPool__NotAboveZero(0)")
              })
              it("reverts if transfer of a tokens fails", async () => {
                  await expect(
                      contract.initialize(initializeAmount.add(1), { value: initializeAmount })
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)
              })
              it("sets the liquidity of the sender", async () => {
                  await contract.initialize(initializeAmount, { value: initializeAmount })
                  const liquidityOfSender = await contract.getLiquidityOf(deployer.address)

                  expect(liquidityOfSender.toString()).to.equal(initializeAmount.toString())
              })
              it("sets the liquidity of the pool", async () => {
                  await contract.initialize(initializeAmount, { value: initializeAmount })
                  const poolLiquidity = await contract.getPoolLiquidity()

                  expect(poolLiquidity.toString()).to.equal(initializeAmount.toString())
              })
              it("emits event correctly", async () => {
                  await expect(
                      contract.initialize(initializeAmount, {
                          value: initializeAmount,
                      })
                  )
                      .to.emit(contract, "LiquidityAdded")
                      .withArgs(
                          deployer.address,
                          initializeAmount.toString(),
                          initializeAmount.toString(),
                          initializeAmount.toString()
                      )
              })
          })

          describe("provideLiquidity", () => {
              let provideLiquidityAmount
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, { value: initializeAmount })

                  provideLiquidityAmount = ethers.utils.parseEther("5")
                  await aUserToken.approve(contract.address, provideLiquidityAmount)

                  const poolLiquidity = await contract.getPoolLiquidity()
                  const xReserves = await ethers.provider.getBalance(contract.address)
                  expectedLiquidityMinted = provideLiquidityAmount.mul(poolLiquidity).div(xReserves)
              })
              it("reverts if token transfer fails", async () => {
                  const tokenBalance = await aToken.balanceOf(user.address)

                  await expect(
                      userContract.provideLiquidity({
                          value: tokenBalance.add(1),
                      })
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)
              })
              it("sets minted liquidity of sender", async () => {
                  await userContract.provideLiquidity({
                      value: provideLiquidityAmount,
                  })

                  const liquidityOfSender = await contract.getLiquidityOf(user.address)
                  expect(liquidityOfSender.toString()).to.equal(expectedLiquidityMinted.toString())
              })
              it("sets minted liquidity of pool", async () => {
                  const poolLiquidityBefore = await contract.getPoolLiquidity()

                  await userContract.provideLiquidity({
                      value: provideLiquidityAmount,
                  })

                  const poolLiquidity = await contract.getPoolLiquidity()

                  expect(poolLiquidity.sub(poolLiquidityBefore).toString()).to.equal(
                      expectedLiquidityMinted.toString()
                  )
              })
              it("emits event correctly", async () => {
                  await expect(
                      userContract.provideLiquidity({
                          value: provideLiquidityAmount,
                      })
                  )
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
              let liquidityAmount, eligibleNative, eligibleTokens
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, { value: initializeAmount })

                  const provideLiquidityAmount = ethers.utils.parseEther("5")
                  await aUserToken.approve(contract.address, provideLiquidityAmount)
                  await userContract.provideLiquidity({
                      value: provideLiquidityAmount,
                  })
                  liquidityAmount = await contract.getLiquidityOf(user.address)

                  const xReserves = await ethers.provider.getBalance(userContract.address)
                  const yReserves = await aUserToken.balanceOf(userContract.address)
                  const poolLiquidity = await userContract.getPoolLiquidity()
                  eligibleNative = liquidityAmount.mul(xReserves).div(poolLiquidity)
                  eligibleTokens = liquidityAmount.mul(yReserves).div(poolLiquidity)
              })
              it("reverts if requested amount is above eligible liquidity", async () => {
                  await expect(
                      userContract.withdrawLiquidity(liquidityAmount.add(1))
                  ).to.be.revertedWith("NativeLiquidityPool__NotEnoughLiquidity")
              })
              it("updates liquidity of sender", async () => {
                  const liquidityOfSenderBefore = liquidityAmount
                  await userContract.withdrawLiquidity(liquidityAmount)
                  const liquidityOfSender = await userContract.getLiquidityOf(user.address)

                  expect(liquidityOfSender.toString()).to.equal(
                      liquidityOfSenderBefore.sub(liquidityAmount).toString()
                  )
              })
              it("updates pool liquidity", async () => {
                  const poolLiquidityBefore = await userContract.getPoolLiquidity()
                  await userContract.withdrawLiquidity(liquidityAmount)
                  const poolLiquidity = await userContract.getPoolLiquidity()

                  expect(poolLiquidity.toString()).to.equal(
                      poolLiquidityBefore.sub(liquidityAmount).toString()
                  )
              })
              it("sends eligible native to sender", async () => {
                  await expect(
                      await userContract.withdrawLiquidity(liquidityAmount)
                  ).to.changeEtherBalances(
                      [userContract, user],
                      ["-" + eligibleNative.toString(), eligibleNative.toString()]
                  )
              })
              it("sends eligible tokens to sender", async () => {
                  const userTokenBalanceBefore = await aUserToken.balanceOf(user.address)

                  await userContract.withdrawLiquidity(liquidityAmount)

                  const userTokenBalance = await aUserToken.balanceOf(user.address)

                  expect(userTokenBalance.sub(userTokenBalanceBefore).toString()).to.equal(
                      eligibleTokens.toString()
                  )
              })
              it("emits event correctly", async () => {
                  await expect(userContract.withdrawLiquidity(liquidityAmount))
                      .to.emit(userContract, "LiquidityRemoved")
                      .withArgs(user.address, liquidityAmount, eligibleNative, eligibleTokens)
              })
          })

          describe("swap", () => {
              let swapAmount
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, { value: initializeAmount })

                  swapAmount = ethers.utils.parseEther("10")
              })
              it("reverts if transfer of tokens fails", async () => {
                  await expect(userContract.swap(swapAmount, 1)).to.be.revertedWith(
                      ERC20_ERROR_INSUFFICIENT_ALLOWANCE
                  )
              })
              it("transfers tokens to sender (xToY)", async () => {
                  const userTokenBalanceBefore = await aUserToken.balanceOf(user.address)
                  const contractTokenBalanceBefore = await aUserToken.balanceOf(
                      userContract.address
                  )
                  const expectedTokenOutput = await userContract.getTokenOutputForSwap(swapAmount)

                  await expect(
                      await userContract.swap(0, 0, { value: swapAmount })
                  ).to.changeEtherBalances(
                      [userContract, user],
                      [swapAmount.toString(), "-" + swapAmount.toString()]
                  )

                  const userTokenBalance = await aUserToken.balanceOf(user.address)
                  const contractTokenBalance = await aUserToken.balanceOf(userContract.address)

                  expect(userTokenBalanceBefore.add(expectedTokenOutput).toString()).to.equal(
                      userTokenBalance.toString()
                  )
                  expect(contractTokenBalanceBefore.sub(expectedTokenOutput).toString()).to.equal(
                      contractTokenBalance.toString()
                  )
              })
              it("transfers native to sender (yToX)", async () => {
                  await aUserToken.approve(userContract.address, swapAmount)
                  const expectedNativeOutput = await userContract.getNativeOutputForSwap(swapAmount)

                  await expect(await userContract.swap(swapAmount, 1)).to.changeEtherBalances(
                      [userContract, user],
                      ["-" + expectedNativeOutput.toString(), expectedNativeOutput.toString()]
                  )
              })
              it("emits event correctly", async () => {
                  const expectedNativeOutput = await userContract.getNativeOutputForSwap(swapAmount)

                  await aUserToken.approve(userContract.address, swapAmount)
                  await expect(await userContract.swap(swapAmount, 1))
                      .to.emit(userContract, "Swap")
                      .withArgs(
                          user.address,
                          swapAmount.toString(),
                          expectedNativeOutput.toString(),
                          1
                      )
              })
          })

          describe("approve", async () => {
              let approvalAmount, approvalDirection
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, { value: initializeAmount })

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
              let allowanceAmount, swapAmount
              beforeEach(async () => {
                  await aToken.approve(contract.address, initializeAmount)
                  await contract.initialize(initializeAmount, { value: initializeAmount })

                  allowanceAmount = ethers.utils.parseEther("20")
                  swapAmount = ethers.utils.parseEther("10")

                  await aUserToken.approve(contract.address, allowanceAmount)
              })
              it("reverts if not enough allowance", async () => {
                  await expect(
                      contract.swapFrom(user.address, 0, { value: swapAmount })
                  ).to.be.revertedWith("NativeLiquidityPool__NotEnoughAllowance")

                  await userContract.approve(deployer.address, 0, 1)

                  await expect(contract.swapFrom(user.address, swapAmount)).to.be.revertedWith(
                      "NativeLiquidityPool__NotEnoughAllowance"
                  )
              })
              it("updates allowance (xToY)", async () => {
                  await userContract.approve(deployer.address, allowanceAmount, 0)
                  const allowanceBefore = await contract.getAllowanceOf(
                      user.address,
                      deployer.address
                  )

                  await contract.swapFrom(user.address, 0, { value: swapAmount })

                  const allowance = await contract.getAllowanceOf(user.address, deployer.address)
                  expect(allowanceBefore.amount.sub(swapAmount).toString()).to.equal(
                      allowance.amount.toString()
                  )
              })
              it("updates allowance (yToX)", async () => {
                  await userContract.approve(deployer.address, allowanceAmount, 1)
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
              it("swaps (xToY)", async () => {
                  await userContract.approve(deployer.address, allowanceAmount, 0)
                  const tokenBalanceBefore = await aUserToken.balanceOf(user.address)
                  const tokenOutput = await userContract.getTokenOutputForSwap(swapAmount)

                  await expect(
                      await contract.swapFrom(user.address, 0, { value: swapAmount })
                  ).to.changeEtherBalances(
                      [contract, deployer],
                      [swapAmount.toString(), "-" + swapAmount.toString()]
                  )

                  const tokenBalance = await aUserToken.balanceOf(user.address)
                  expect(tokenBalanceBefore.add(tokenOutput).toString()).to.equal(
                      tokenBalance.toString()
                  )
              })
              it("swaps (yToX)", async () => {
                  await userContract.approve(deployer.address, allowanceAmount, 1)
                  const tokenBalanceBefore = await aUserToken.balanceOf(user.address)
                  const nativeOutput = await userContract.getNativeOutputForSwap(swapAmount)

                  await expect(
                      await contract.swapFrom(user.address, swapAmount)
                  ).to.changeEtherBalances(
                      [contract, user],
                      ["-" + nativeOutput.toString(), nativeOutput.toString()]
                  )

                  const tokenBalance = await aUserToken.balanceOf(user.address)
                  expect(tokenBalanceBefore.sub(swapAmount).toString()).to.equal(
                      tokenBalance.toString()
                  )
              })
          })
      })
