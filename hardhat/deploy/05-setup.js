const { networkConfig, constants } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const contracts = networkConfig[chainId].contracts

    const governorProxy = await ethers.getContract(contracts.Governor.name + "_Proxy", deployer)
    const governor = await ethers.getContractAt(
        contracts.Governor.name,
        governorProxy.address,
        deployer
    )
    const timelock = await ethers.getContract(contracts.Timelock.name, deployer)

    log("Setting up roles for timelock contract")
    const proposerRole = await timelock.PROPOSER_ROLE()
    const executorRole = await timelock.EXECUTOR_ROLE()
    const adminRole = await timelock.TIMELOCK_ADMIN_ROLE()

    // timelock: set governor to be sole proposer
    const proposerTx = await timelock.grantRole(proposerRole, governor.address)
    await proposerTx.wait()
    log(`Set governor contract (${governor.address}) as only proposer`)

    // timelock: set null_address (everyone) as executor
    const executorTx = await timelock.grantRole(executorRole, constants.NULL_ADDRESS) // => anyone can execute
    await executorTx.wait()
    log(`Set NULL_ADDRESS (EVERYONE) as executor`)

    // timelock: revoking admin role of depoyer
    const revokeTx = await timelock.revokeRole(adminRole, deployer)
    await revokeTx.wait()
    log(`Revoked admin role from deployer address (${deployer})`)

    const dexProxy = await ethers.getContract(contracts.DEX.name + "_Proxy", deployer)
    const dex = await ethers.getContractAt(contracts.DEX.name, dexProxy.address, deployer)

    // dex: transfer ownership to timelock
    const TransferOwnership_dex_tx = await dex.transferOwnership(timelock.address)
    await TransferOwnership_dex_tx.wait()
    console.log(`Transferred ownership of (${contracts.DEX.name}) to (${timelock.address})`)

    // governanceToken: delegate votes of deployer
    const tokenProxy = await ethers.getContract(contracts.GovernanceToken.name + "_Proxy", deployer)
    const token = await ethers.getContractAt(
        contracts.GovernanceToken.name,
        tokenProxy.address,
        deployer
    )
    const delegateTx = await token.delegate(deployer)
    await delegateTx.wait()
    log(`Delegated all voting power of (${deployer}) to (${deployer}). (obligatory step)`)

    // transferring commonProxyAdmin ownership to timelock
    const commonProxyAdmin = await ethers.getContract(constants.proxyAdminName, deployer)
    const transferOwnership_commonProxy_tx = await commonProxyAdmin.transferOwnership(
        timelock.address
    )
    await transferOwnership_commonProxy_tx.wait()
    log(
        `Transferred ownership of commonProxyAdmin (${commonProxyAdmin.address}) to timelock (${timelock.address})`
    )

    log("------------------------------")
}

module.exports.tags = ["all", "setup"]
