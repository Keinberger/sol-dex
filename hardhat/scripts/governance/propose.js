const { network, ethers } = require("hardhat")
const { networkConfig, constants } = require("../../helper-hardhat-config")
const { moveBlocks } = require("../../utils/testing/moveBlocks")
const { propose } = require("../../utils/governance/governance")
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
    const isDevelopmentChain = constants.developmentChains.includes(network.name)
    const governorName = networkConfig[chainId].contracts.Governor.name
    const governor = await ethers.getContract(governorName)

    const target = await ethers.getContractAt(targetNameOrAbi, targetAddress)
    const encodedFunctionCall = target.interface.encodeFunctionData(functionToCall, args)

    const proposalId = await propose(
        governor,
        [targetAddress],
        [etherValue],
        [encodedFunctionCall],
        description
    )

    console.log(
        `Created new proposal (id: ${proposalId})\nData: ${encodedFunctionCall}\nDescription: ${description}`
    )

    let proposals = JSON.parse(
        fs.readFileSync(constants.scriptsConfig.governance.proposalsFile, "utf8")
    )
    proposals[chainId.toString()].push(proposalId.toString())
    fs.writeFileSync(constants.scriptsConfig.governance.proposalsFile, JSON.stringify(proposals))

    console.log(
        `Appended proposal (${proposalId}) to local JSON file ${constants.scriptsConfig.governance.proposalsFile}`
    )

    if (isDevelopmentChain) {
        await moveBlocks(constants.VOTING_DELAY + 1)
    }
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
