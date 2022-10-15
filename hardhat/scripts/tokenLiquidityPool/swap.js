const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (lpAddress, direction, amount) => {
    const chainId = network.config.chainId
    const tlpName = networkConfig[chainId].contracts.TokenLiquidityPool.name
    const tlp = await ethers.getContractAt(tlpName, lpAddress)

    if (direction == 0) {
        // approve x tokens
        const xTokenAddress = await tlp.getXTokenAddress()
        const xToken = await ethers.getContractAt("IERC20", xTokenAddress)

        const approveTx = await xToken.approve(lpAddress, amount)
        await approveTx.wait()
    } else if (direction == 1) {
        // approve y tokens
        const yTokenAddress = await tlp.getYTokenAddress()
        const yToken = await ethers.getContractAt("IERC20", yTokenAddress)

        const approveTx = await yToken.approve(lpAddress, amount)
        await approveTx.wait()
    }
    const swapTx = await tlp.swap(amount, direction)
    await swapTx.wait()
}

main(constants.scriptsConfig.tlp.swap.lpAddress, constants.scriptsConfig.tlp.swap.liquidityAmount)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
