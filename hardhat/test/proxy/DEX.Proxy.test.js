const { expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { propose_vote_queue_execute } = require("../../utils/testing/propose_vote_queue_execute")

const chainId = network.config.chainId

const contracts = networkConfig[chainId].contracts
const contractConfig = contracts.DEX
const contractName = contractConfig.name

!constants.developmentChains.includes(network.name)
    ? describe.skip
    : describe(contractName + " (proxy)", () => {
          let contract, governor, deployer, proxy, newContractName

          beforeEach(async () => {
              deployer = await ethers.getSigner((await getNamedAccounts()).deployer)
              await deployments.fixture(["all"])
              proxy = await ethers.getContract(contractName + "_Proxy", deployer)
              contract = await ethers.getContractAt(contractName, proxy.address, deployer)

              const governorContractName = contracts.Governor.name
              const governorProxy = await ethers.getContract(
                  governorContractName + "_Proxy",
                  deployer
              )
              governor = await ethers.getContractAt(
                  governorContractName,
                  governorProxy.address,
                  deployer
              )
              newContractName = networkConfig[chainId].forTests[2].name
          })

          it("getVersion", async () => {
              const version = await contract.getVersion()
              expect(version.toString()).to.equal("1")
          })

          describe("upgrade", () => {
              let newContract
              beforeEach(async () => {
                  const stateFunctionCall = contract.interface.encodeFunctionData("setState", [1])
                  await propose_vote_queue_execute(
                      governor,
                      contract.address,
                      stateFunctionCall,
                      "Setting state to 1"
                  )

                  const proxyAdmin = await ethers.getContract(constants.proxyAdminName)
                  const v2Dex = await ethers.getContract(newContractName)
                  const upgradeFunctionCall = proxyAdmin.interface.encodeFunctionData("upgrade", [
                      proxy.address,
                      v2Dex.address,
                  ])

                  await propose_vote_queue_execute(
                      governor,
                      proxyAdmin.address,
                      upgradeFunctionCall,
                      "Testing updating the contract"
                  )

                  newContract = await ethers.getContractAt(newContractName, proxy.address, deployer)
              })
              it("retains storage vars", async () => {
                  const state = await newContract.getState()
                  expect(state.toString()).to.equal("1")
              })
              it("allows for new storage vars", async () => {
                  const newVar = await newContract.newValue()
                  expect(newVar.toString()).to.equal("0")
              })
              it("allows for new funcs", async () => {
                  const newValue = "20"
                  await newContract.setNewValue(newValue)

                  const newValueRetrieved = await newContract.newValue()
                  expect(newValueRetrieved.toString()).to.equal(newValue)
              })
          })
      })
