const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")
const { moveBlocks } = require("../../utils/testing/moveBlocks")
const { vote } = require("../../utils/governance/governance")
const fs = require("fs")

const main = async (index, voteWay) => {
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)
    const governorName = networkConfig[chainId].contracts.Governor.name
    const governor = await ethers.getContract(governorName)

    let proposals = JSON.parse(
        fs.readFileSync(constants.scriptsConfig.governance.proposalsFile, "utf8")
    )
    const proposalId = proposals[chainId.toString()][index]

    await vote(proposalId, governor, voteWay)

    if (isDevelopmentChain) {
        await moveBlocks(constants.VOTING_PERIOD + 1)
    }

    console.log(`Voted ${voteWay} for proposal (${proposalId})`)
}

main(constants.scriptsConfig.governance.proposalIndex, constants.scriptsConfig.governance.voteWay)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
