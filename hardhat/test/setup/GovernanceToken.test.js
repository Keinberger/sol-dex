const { expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const chainId = network.config.chainId

const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.GovernanceToken
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName + " (setup)", () => {
          let contract, deployer

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["all"])
              contract = await ethers.getContract(contractName, deployer.address)
          })

          describe("setup", async () => {
              it("deployer delegated all votes", async () => {
                  const balance = await contract.balanceOf(deployer.address)
                  const delegatedVotes = await contract.getVotes(deployer.address)

                  expect(delegatedVotes.toString()).to.equal(balance.toString())
              })
          })
      })
