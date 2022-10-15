const { expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const chainId = network.config.chainId

const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.Governor
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName + " (proxy)", () => {
          let contract, deployer

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["all"])
              const governorProxy = await ethers.getContract(contractName + "_Proxy", deployer)
              contract = await ethers.getContractAt(contractName, governorProxy.address, deployer)
          })

          it("propose", async () => {
              const dex = await ethers.getContract(contracts.DEX.name)
              const encodedFunctionCall = dex.interface.encodeFunctionData("getVersion", [])

              const tx = await contract.propose([dex.address], [0], [encodedFunctionCall], "")
              await tx.wait()
          })
      })
