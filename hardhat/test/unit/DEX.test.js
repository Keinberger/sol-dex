const { expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const getEventFromReceipt = require("../../utils/testing/getEventFromReceipt")
const { networkConfig, constants } = require("../../helper-hardhat-config")

const chainId = network.config.chainId
const contractConfig = networkConfig[chainId].contracts.DEX
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
              userContract,
              aToken,
              aUserToken,
              bToken,
              ERC20_ERROR_INSUFFICIENT_ALLOWANCE,
              OWNABLE_ERROR_CALLER_NOT_OWNER,
              DEX_ERROR_STATE_CLOSED
          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              user = await ethers.getSigner((await getNamedAccounts()).user)
              await deployments.fixture(["forTests", "DEX"])
              contract = await ethers.getContract(contractName, deployer.address)
              userContract = contract.connect(user)
              aToken = await ethers.getContract(aTokenName, deployer.address)
              aUserToken = await ethers.getContract(aTokenName, user.address)
              bToken = await ethers.getContract(bTokenName, deployer.address)

              ERC20_ERROR_INSUFFICIENT_ALLOWANCE = "ERC20: insufficient allowance"
              OWNABLE_ERROR_CALLER_NOT_OWNER = "Ownable: caller is not the owner"
              DEX_ERROR_STATE_CLOSED = "DEX__StateIs(0)"

              await aToken.transfer(user.address, ethers.utils.parseEther("1000"))
          })

          describe("setState", async () => {
              let newState
              beforeEach(async () => {
                  newState = "2"
              })
              it("can only be called by owner", async () => {
                  await expect(userContract.setState(2)).to.be.revertedWith(
                      OWNABLE_ERROR_CALLER_NOT_OWNER
                  )
              })
              it("updates state of dex", async () => {
                  await contract.setState(newState)

                  const state = await contract.getState()
                  expect(state.toString()).to.equal(newState)
              })
              it("emits event correctly", async () => {
                  await expect(contract.setState(newState))
                      .to.emit(contract, "StateUpdated")
                      .withArgs(Number(newState))
              })
          })

          describe("addNativeLiquidityPool", () => {
              let tokenAddress, swapFee, tokenDeposit, ethDeposit
              beforeEach(async () => {
                  await contract.setState(2)

                  tokenAddress = aToken.address
                  swapFee = 4
                  tokenDeposit = ethers.utils.parseEther("100")
                  nativeDeposit = ethers.utils.parseEther("5")
              })
              it("can only be called by owner", async () => {
                  await expect(
                      userContract.addNativeLiquidityPool(tokenAddress, swapFee, tokenDeposit, {
                          value: nativeDeposit,
                      })
                  ).to.be.revertedWith(OWNABLE_ERROR_CALLER_NOT_OWNER)
              })
              it("can only be called if not CLOSED", async () => {
                  await contract.setState(0)

                  await expect(
                      contract.addNativeLiquidityPool(tokenAddress, swapFee, tokenDeposit, {
                          value: nativeDeposit,
                      })
                  ).to.be.revertedWith(DEX_ERROR_STATE_CLOSED)
              })
              it("reverts if token transfer fails", async () => {
                  await expect(
                      contract.addNativeLiquidityPool(tokenAddress, swapFee, tokenDeposit, {
                          value: nativeDeposit,
                      })
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)
              })
              it("sets LP to active", async () => {
                  await aToken.approve(contract.address, tokenDeposit)
                  const tx = await contract.addNativeLiquidityPool(
                      tokenAddress,
                      swapFee,
                      tokenDeposit,
                      {
                          value: nativeDeposit,
                      }
                  )
                  const receipt = await tx.wait()
                  const event = receipt.events[receipt.events.length - 1].args
                  const isActive = await contract.getStatus(event.liquidityPoolAddress)

                  expect(isActive).to.equal(true)
              })
              it("calls initialize", async () => {
                  await aToken.approve(contract.address, tokenDeposit)
                  const tx = await contract.addNativeLiquidityPool(
                      tokenAddress,
                      swapFee,
                      tokenDeposit,
                      {
                          value: nativeDeposit,
                      }
                  )

                  const receipt = await tx.wait()
                  const event = receipt.events[receipt.events.length - 1].args
                  const lpAddress = event.liquidityPoolAddress

                  const nativeLiquidityPool = await ethers.getContractAt(
                      "NativeLiquidityPool",
                      lpAddress.toString(),
                      deployer.address
                  )

                  const liquidityOfDex = await nativeLiquidityPool.getLiquidityOf(contract.address)
                  expect(Number(liquidityOfDex.toString())).to.be.greaterThan(0)
              })
              it("emits event correctly", async () => {
                  await aToken.approve(contract.address, tokenDeposit)
                  const tx = await contract.addNativeLiquidityPool(
                      tokenAddress,
                      swapFee,
                      tokenDeposit,
                      {
                          value: nativeDeposit,
                      }
                  )
                  const receipt = await tx.wait()
                  const event = receipt.events[receipt.events.length - 1].args

                  expect(String(event.liquidityPoolKind)).to.equal("0")
              })
          })

          describe("addTokenLiquidityPool", () => {
              let xAddress, yAddress, swapFee, xDeposit, yDeposit
              beforeEach(async () => {
                  await contract.setState(2)

                  xAddress = aToken.address
                  yAddress = bToken.address
                  swapFee = 4
                  xDeposit = ethers.utils.parseEther("100")
                  yDeposit = ethers.utils.parseEther("100")
              })
              it("can only be called by owner", async () => {
                  await expect(
                      userContract.addTokenLiquidityPool(
                          xAddress,
                          yAddress,
                          swapFee,
                          xDeposit,
                          yDeposit
                      )
                  ).to.be.revertedWith(OWNABLE_ERROR_CALLER_NOT_OWNER)
              })
              it("can only be called if not CLOSED", async () => {
                  await contract.setState(0)

                  await expect(
                      contract.addTokenLiquidityPool(
                          xAddress,
                          yAddress,
                          swapFee,
                          xDeposit,
                          yDeposit
                      )
                  ).to.be.revertedWith(DEX_ERROR_STATE_CLOSED)
              })
              it("reverts if transfer of x or y token fails", async () => {
                  await expect(
                      contract.addTokenLiquidityPool(
                          xAddress,
                          yAddress,
                          swapFee,
                          xDeposit,
                          yDeposit
                      )
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)

                  await aToken.approve(contract.address, xDeposit)

                  await expect(
                      contract.addTokenLiquidityPool(
                          xAddress,
                          yAddress,
                          swapFee,
                          xDeposit,
                          yDeposit
                      )
                  ).to.be.revertedWith(ERC20_ERROR_INSUFFICIENT_ALLOWANCE)
              })
              it("sets LP to active", async () => {
                  await aToken.approve(contract.address, xDeposit)
                  await bToken.approve(contract.address, yDeposit)

                  const tx = await contract.addTokenLiquidityPool(
                      xAddress,
                      yAddress,
                      swapFee,
                      xDeposit,
                      yDeposit
                  )
                  const receipt = await tx.wait()
                  const event = receipt.events[receipt.events.length - 1].args
                  const isActive = await contract.getStatus(event.liquidityPoolAddress)

                  expect(isActive).to.equal(true)
              })
              it("calls initialize", async () => {
                  await aToken.approve(contract.address, xDeposit)
                  await bToken.approve(contract.address, yDeposit)

                  const tx = await contract.addTokenLiquidityPool(
                      xAddress,
                      yAddress,
                      swapFee,
                      xDeposit,
                      yDeposit
                  )

                  const receipt = await tx.wait()
                  const event = receipt.events[receipt.events.length - 1].args
                  const lpAddress = event.liquidityPoolAddress

                  const tokenLiquidityPool = await ethers.getContractAt(
                      "TokenLiquidityPool",
                      lpAddress.toString(),
                      deployer.address
                  )

                  const liquidityOfDex = await tokenLiquidityPool.getLiquidityOf(contract.address)
                  expect(Number(liquidityOfDex.toString())).to.be.greaterThan(0)
              })
              it("emits event correctly", async () => {
                  await aToken.approve(contract.address, xDeposit)
                  await bToken.approve(contract.address, yDeposit)

                  const tx = await contract.addTokenLiquidityPool(
                      xAddress,
                      yAddress,
                      swapFee,
                      xDeposit,
                      yDeposit
                  )

                  const receipt = await tx.wait()
                  const event = receipt.events[receipt.events.length - 1].args

                  expect(String(event.liquidityPoolKind)).to.equal("1")
              })
          })

          describe("removeLiquidityPool", () => {
              let lpAddress
              beforeEach(async () => {
                  await contract.setState(2)

                  const xAddress = aToken.address
                  const yAddress = bToken.address
                  const swapFee = 4
                  const xDeposit = ethers.utils.parseEther("100")
                  const yDeposit = ethers.utils.parseEther("100")

                  await aToken.approve(contract.address, xDeposit)
                  await bToken.approve(contract.address, yDeposit)

                  const tx = await contract.addTokenLiquidityPool(
                      xAddress,
                      yAddress,
                      swapFee,
                      xDeposit,
                      yDeposit
                  )
                  const receipt = await tx.wait()
                  lpAddress = receipt.events[receipt.events.length - 1].args.liquidityPoolAddress
              })
              it("can only be called by owner", async () => {
                  await expect(userContract.removeLiquidityPool(lpAddress)).to.be.revertedWith(
                      OWNABLE_ERROR_CALLER_NOT_OWNER
                  )
              })
              it("can only be called if not CLOSED", async () => {
                  await contract.setState(0)

                  await expect(contract.removeLiquidityPool(lpAddress)).to.be.revertedWith(
                      DEX_ERROR_STATE_CLOSED
                  )
              })
              it("can only be called if lp is active and exists", async () => {
                  const faultyAddress = ethers.constants.AddressZero

                  await expect(contract.removeLiquidityPool(faultyAddress)).to.be.revertedWith(
                      `DEX__LiquidityPoolNotActive("${faultyAddress}")`
                  )
              })
              it("removes liquidity pool", async () => {
                  await contract.removeLiquidityPool(lpAddress)
                  const status = await contract.getStatus(lpAddress)

                  expect(status).to.equal(false)
              })
              it("emits event correctly", async () => {
                  await expect(contract.removeLiquidityPool(lpAddress))
                      .to.emit(contract, "LiquidityPoolRemoved")
                      .withArgs(lpAddress)
              })
          })

          describe("activateLiquidityPool", () => {
              let lpAddress
              beforeEach(async () => {
                  await contract.setState(2)

                  const xAddress = aToken.address
                  const yAddress = bToken.address
                  const swapFee = 4
                  const xDeposit = ethers.utils.parseEther("100")
                  const yDeposit = ethers.utils.parseEther("100")

                  await aToken.approve(contract.address, xDeposit)
                  await bToken.approve(contract.address, yDeposit)

                  const tx = await contract.addTokenLiquidityPool(
                      xAddress,
                      yAddress,
                      swapFee,
                      xDeposit,
                      yDeposit
                  )
                  const receipt = await tx.wait()
                  lpAddress = receipt.events[receipt.events.length - 1].args.liquidityPoolAddress
              })
              it("can only be called by owner", async () => {
                  await expect(userContract.activateLiquidityPool(lpAddress)).to.be.revertedWith(
                      OWNABLE_ERROR_CALLER_NOT_OWNER
                  )
              })
              it("can only be called if not CLOSED", async () => {
                  await contract.setState(0)

                  await expect(contract.activateLiquidityPool(lpAddress)).to.be.revertedWith(
                      DEX_ERROR_STATE_CLOSED
                  )
              })
              it("reverts if already active", async () => {
                  await expect(contract.activateLiquidityPool(lpAddress)).to.be.revertedWith(
                      `DEX__LiquidityPoolIsActive("${lpAddress}")`
                  )
              })
              it("activates liquidity pool", async () => {
                  await contract.removeLiquidityPool(lpAddress)
                  await contract.activateLiquidityPool(lpAddress)
                  const status = await contract.getStatus(lpAddress)

                  expect(status.toString()).to.equal("true")
              })
              it("emits event correctly", async () => {
                  await contract.removeLiquidityPool(lpAddress)

                  await expect(contract.activateLiquidityPool(lpAddress))
                      .to.emit(contract, "LiquidityPoolActivated")
                      .withArgs(lpAddress)
              })
          })

          describe("swapAt", () => {
              let nlpAddress, tlpAddress, swapAmount
              beforeEach(async () => {
                  await contract.setState(2)

                  const tokenAddress = aToken.address
                  const swapFee = 4
                  const tokenDeposit = ethers.utils.parseEther("100")
                  const nativeDeposit = ethers.utils.parseEther("5")
                  await aToken.approve(contract.address, tokenDeposit)
                  const nlpTx = await contract.addNativeLiquidityPool(
                      tokenAddress,
                      swapFee,
                      tokenDeposit,
                      {
                          value: nativeDeposit,
                      }
                  )
                  const nlpReceipt = await nlpTx.wait()
                  const nlpEvent = nlpReceipt.events[nlpReceipt.events.length - 1].args
                  nlpAddress = nlpEvent.liquidityPoolAddress

                  const xAddress = aToken.address
                  const yAddress = bToken.address
                  const xDeposit = ethers.utils.parseEther("100")
                  const yDeposit = ethers.utils.parseEther("100")
                  await aToken.approve(contract.address, xDeposit)
                  await bToken.approve(contract.address, yDeposit)
                  const tlpTx = await contract.addTokenLiquidityPool(
                      xAddress,
                      yAddress,
                      swapFee,
                      xDeposit,
                      yDeposit
                  )
                  const tlpReceipt = await tlpTx.wait()
                  const tlpEvent = tlpReceipt.events[tlpReceipt.events.length - 1].args
                  tlpAddress = tlpEvent.liquidityPoolAddress

                  swapAmount = ethers.utils.parseEther("1")
              })
              it("can only be called if OPEN", async () => {
                  await contract.setState(0)

                  await expect(
                      contract.swapAt(nlpAddress, 0, { value: swapAmount })
                  ).to.be.revertedWith("DEX__StateIsNot(2)")
              })
              it("can only be called if address is valid", async () => {
                  const faultyAddress = ethers.constants.AddressZero
                  await expect(
                      contract.swapAt(faultyAddress, 0, {
                          value: swapAmount,
                      })
                  ).to.be.reverted
              })
              it("can only be called if lp is active", async () => {
                  await contract.removeLiquidityPool(nlpAddress)

                  await expect(
                      userContract.swapAt(nlpAddress, 0, { value: swapAmount })
                  ).to.be.revertedWith(`DEX__LiquidityPoolNotActive("${nlpAddress}")`)
              })
              it("swaps (NLP - xToY)", async () => {
                  const tokenBalanceBefore = await aToken.balanceOf(user.address)

                  const nativeLiquidityPool = await ethers.getContractAt(
                      "NativeLiquidityPool",
                      nlpAddress.toString(),
                      user.address
                  )
                  const expectedTokenOutput = await nativeLiquidityPool.getTokenOutputForSwap(
                      swapAmount
                  )

                  await nativeLiquidityPool.approve(userContract.address, swapAmount, 0)
                  await expect(
                      await userContract.swapAt(nlpAddress, 0, { value: swapAmount })
                  ).to.changeEtherBalances(
                      [user, nativeLiquidityPool],
                      ["-" + swapAmount.toString(), swapAmount.toString()]
                  )

                  const tokenBalance = await aToken.balanceOf(user.address)

                  expect(tokenBalanceBefore.add(expectedTokenOutput).toString()).to.equal(
                      tokenBalance.toString()
                  )
              })
              it("swaps (NLP - yToX)", async () => {
                  const tokenBalanceBefore = await aToken.balanceOf(user.address)

                  const nativeLiquidityPool = await ethers.getContractAt(
                      "NativeLiquidityPool",
                      nlpAddress.toString(),
                      user.address
                  )
                  const expectedNativeOutput = await nativeLiquidityPool.getNativeOutputForSwap(
                      swapAmount
                  )

                  await aUserToken.approve(nativeLiquidityPool.address, swapAmount)
                  await nativeLiquidityPool.approve(userContract.address, swapAmount, 1)
                  await expect(
                      await userContract.swapAt(nlpAddress, swapAmount)
                  ).to.changeEtherBalances(
                      [user, nativeLiquidityPool],
                      [expectedNativeOutput.toString(), "-" + expectedNativeOutput.toString()]
                  )

                  const tokenBalance = await aToken.balanceOf(user.address)

                  expect(tokenBalanceBefore.sub(swapAmount).toString()).to.equal(
                      tokenBalance.toString()
                  )
              })
              it("swaps (TLP)", async () => {
                  const xTokenBalanceBefore = await aToken.balanceOf(user.address)
                  const yTokenBalanceBefore = await bToken.balanceOf(user.address)

                  const tokenLiquidityPool = await ethers.getContractAt(
                      "TokenLiquidityPool",
                      tlpAddress.toString(),
                      user.address
                  )
                  const expectedYOutput = await tokenLiquidityPool.getYTokenOutputForSwap(
                      swapAmount
                  )

                  await aUserToken.approve(tokenLiquidityPool.address, swapAmount)
                  await tokenLiquidityPool.approve(userContract.address, swapAmount, 0)
                  await userContract.swapAt(tlpAddress, swapAmount)

                  const xTokenBalance = await aToken.balanceOf(user.address)
                  const yTokenBalance = await bToken.balanceOf(user.address)

                  expect(xTokenBalanceBefore.sub(swapAmount).toString()).to.equal(
                      xTokenBalance.toString()
                  )
                  expect(yTokenBalanceBefore.add(expectedYOutput).toString()).to.equal(
                      yTokenBalance.toString()
                  )
              })
          })
      })
