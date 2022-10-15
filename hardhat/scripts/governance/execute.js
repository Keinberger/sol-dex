const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { execute } = require("../../utils/governance/governance.js")
const fs = require("fs")

const main = async (
    targetNameOrAbi,
    targetAddress,
    functionToCall,
    etherValue,
    args,
    description
) => {
    const chainId = network.config.chainId
    const governorName = networkConfig[chainId].contracts.Governor.name
    const governor = await ethers.getContract(governorName)

    const target = await ethers.getContractAt(targetNameOrAbi, targetAddress)
    const encodedFunctionCall = target.interface.encodeFunctionData(functionToCall, args)

    await execute(governor, [targetAddress], [etherValue], [encodedFunctionCall], description)

    let proposals = JSON.parse(
        fs.readFileSync(constants.scriptsConfig.governance.proposalsFile, "utf8")
    )
    proposals[chainId.toString()] = []
    fs.writeFileSync(constants.scriptsConfig.governance.proposalsFile, JSON.stringify(proposals))

    console.log("proposal has been executed!")
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
