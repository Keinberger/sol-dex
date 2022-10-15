const { networkConfig, constants } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/deployment/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)

    const contractConfig = networkConfig[chainId].contracts.GovernanceToken

    let args = [contractConfig.args.name, contractConfig.args.symbol, contractConfig.args.maxSupply]

    log(`Deploying ${contractConfig.name} to ${network.name}`)
    const deployedContract = await deploy(contractConfig.name, {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            viaAdminContract: {
                name: constants.proxyAdminName,
                artifact: constants.proxyAdminName,
            },
            execute: {
                init: {
                    methodName: "initialize",
                    args: args,
                },
            },
        },
    })
    const contractImplementation = await ethers.getContract(contractConfig.name + "_Implementation")

    log(`${contractConfig.name} (${deployedContract.address}) deployed at (${network.name})`)

    if (!isDevelopmentChain && process.env.EXPLORER_API_KEY) {
        await verify(contractImplementation.address, [], network.name)
    }

    log("------------------------------")
}

module.exports.tags = ["all", "governanceToken"]
