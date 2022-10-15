const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (etherValue, tokenAddress, tokenValue) => {
    const chainId = network.config.chainId
    const timelockName = networkConfig[chainId].contracts.Timelock.name
    const timelock = await ethers.getContract(timelockName)
    const token = await ethers.getContractAt("IERC20", tokenAddress.toString())

    if (etherValue.toString() != 0) {
        const [account] = await ethers.getSigners()

        const tx = {
            to: timelock.address,
            value: etherValue,
        }

        await account.sendTransaction(tx)
    }

    if (tokenValue.toString() != 0) {
        await token.transfer(timelock.address, tokenValue)
    }
}

main(
    constants.scriptsConfig.fundTimelock.etherValue,
    constants.scriptsConfig.fundTimelock.tokenAddress,
    constants.scriptsConfig.fundTimelock.tokenValue
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
