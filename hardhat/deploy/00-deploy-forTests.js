const { constants, networkConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)

    if (!isDevelopmentChain) return

    const contracts = networkConfig[chainId].forTests
    for (let i = 0; i < contracts.length; i++) {
        const contractConfig = contracts[i]
        let constructorArguments = contractConfig.args

        if (contractConfig.name == "TokenLiquidityPool") {
            const aToken = await ethers.getContract(contracts[0].name)
            const bToken = await ethers.getContract(contracts[1].name)

            contractConfig.args[0] = aToken.address
            contractConfig.args[1] = bToken.address
        }

        if (contractConfig.name == "NativeLiquidityPool") {
            const aToken = await ethers.getContract(contracts[0].name)
            contractConfig.args[0] = aToken.address
        }

        log(`Deploying ${contractConfig.name} to ${network.name}`)
        const deployedContract = await deploy(contractConfig.name, {
            from: deployer,
            args: constructorArguments,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        })
        log(`${contractConfig.name} (${deployedContract.address}) deployed at (${network.name})`)
    }

    log("------------------------------")
}

module.exports.tags = ["all", "forTests"]
