const { ethers } = require("hardhat")

const propose = async (governor, targets, etherValues, encodedFunctionCalls, description) => {
    const tx = await governor.propose(targets, etherValues, encodedFunctionCalls, description)
    const receipt = await tx.wait()

    return receipt.events[0].args.proposalId
}

const vote = async (proposalId, governor, voteWay) => {
    const tx = await governor.castVote(proposalId, voteWay)
    await tx.wait()
}

const queue = async (governor, targets, etherValues, encodedFunctionCalls, description) => {
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description))

    const queueTx = await governor.queue(
        targets,
        etherValues,
        encodedFunctionCalls,
        descriptionHash
    )
    await queueTx.wait()
}

const execute = async (governor, targets, etherValues, encodedFunctionCalls, description) => {
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description))

    const executeTx = await governor.execute(
        targets,
        etherValues,
        encodedFunctionCalls,
        descriptionHash
    )
    await executeTx.wait()
}

module.exports = { propose, vote, queue, execute }
