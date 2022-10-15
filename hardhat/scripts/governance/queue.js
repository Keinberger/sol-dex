const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { moveTime } = require("../../utils/testing/moveTime")
const { moveBlocks } = require("../../utils/testing/moveBlocks")
const { queue } = require("../../utils/governance/governance")

const main = async (
    targetNameOrAbi,
    targetAddress,
    functionToCall,
    etherValue,
    args,
    description
) => {
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)
    const governorName = networkConfig[chainId].contracts.Governor.name
    const governor = await ethers.getContract(governorName)

    const target = await ethers.getContractAt(targetNameOrAbi, targetAddress)
    const encodedFunctionCall = target.interface.encodeFunctionData(functionToCall, args)

    await queue(governor, [targetAddress], [etherValue], [encodedFunctionCall], description)

    if (isDevelopmentChain) {
        await moveTime(constants.MIN_DELAY + 1)
        await moveBlocks(1)
    }

    console.log("proposal has been queued up!")
}

main(
    constants.scriptsConfig.governance.targetNameOrAbi,
    constants.scriptsConfig.governance.targetAddress,
    constants.scriptsConfig.governance.functionToCall,
    constants.scriptsConfig.governance.etherValue,
    constants.scriptsConfig.governance.args,
    constants.scriptsConfig.governance.description
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
