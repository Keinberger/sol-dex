const { expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const chainId = network.config.chainId

const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.GovernanceToken
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName + " (proxy)", () => {
          let contract, deployer

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["all"])
              const proxy = await ethers.getContract(contractName + "_Proxy", deployer)
              contract = await ethers.getContractAt(contractName, proxy.address, deployer)
          })

          it("balanceOf", async () => {
              const balance = await contract.balanceOf(deployer.address)
              expect(balance.toString()).to.equal(contractConfig.args.maxSupply.toString())
          })
      })
