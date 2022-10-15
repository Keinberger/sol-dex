const { constants } = require("../../helper-hardhat-config")
const { moveBlocks } = require("./moveBlocks")
const { moveTime } = require("./moveTime")
const { propose, vote, queue, execute } = require("../governance/governance")

const propose_vote_queue_execute = async (governor, target, encodedFunctionCall, description) => {
    const proposalId = await propose(governor, [target], [0], [encodedFunctionCall], description)

    await moveBlocks(constants.VOTING_DELAY + 1)

    await vote(proposalId, governor, 1)

    await moveBlocks(constants.VOTING_PERIOD + 1)

    await queue(governor, [target], [0], [encodedFunctionCall], description)

    await moveTime(constants.MIN_DELAY + 1)
    await moveBlocks(1)

    await execute(governor, [target], [0], [encodedFunctionCall], description)
}

module.exports = { propose_vote_queue_execute }
