const { run } = require("hardhat")

const initialize = async (contractName, contractAddress, args) => {
    const contract = await ethers.getContractAt(contractName, contractAddress)
    const initializeTx = await contract.initialize(...args)
    await initializeTx.wait()
}

module.exports = { initialize }
