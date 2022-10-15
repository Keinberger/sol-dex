const { expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const chainId = network.config.chainId

const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.Timelock
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName + " (setup)", () => {
          let contract, deployer, proxyAdmin

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["all"])
              contract = await ethers.getContract(contractName, deployer.address)
              proxyAdmin = await ethers.getContract(constants.proxyAdminName)
          })

          describe("owner of", () => {
              it("DEX", async () => {
                  const dex = await ethers.getContract(contracts.DEX.name)
                  const owner = await dex.owner()
                  expect(owner).to.equal(contract.address)
              })
              it("common proxy admin", async () => {
                  const owner = await proxyAdmin.owner()
                  expect(owner).to.equal(contract.address)
              })
          })
      })
