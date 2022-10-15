const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (lpAddress, direction, amount) => {
    const chainId = network.config.chainId
    const nlpName = networkConfig[chainId].contracts.NativeLiquidityPool.name
    const nlp = await ethers.getContractAt(nlpName, lpAddress)

    let swapTx
    if (direction == 0) {
        swapTx = await nlp.swap(0, 0, { value: amount })
    } else if (direction == 1) {
        // approve nlp to spend tokens (for swap)
        const tokenAddress = await nlp.getTokenAddress()
        const token = await ethers.getContractAt("IERC20", tokenAddress)

        const approveTx = await token.approve(lpAddress, amount)
        await approveTx.wait()

        swapTx = await nlp.swap(amount, 1)
    } else {
        return
    }

    await swapTx.wait()
}

main(constants.scriptsConfig.nlp.swap.lpAddress, constants.scriptsConfig.nlp.swap.liquidityAmount)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
