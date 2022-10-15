const { network } = require("hardhat")

const moveTime = async (amount) => {
    await network.provider.send("evm_increaseTime", [amount])
}

module.exports = { moveTime }
