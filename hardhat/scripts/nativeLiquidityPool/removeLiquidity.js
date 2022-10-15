const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (lpAddress, liquidityAmount) => {
    const chainId = network.config.chainId
    const nlpName = networkConfig[chainId].contracts.NativeLiquidityPool.name
    const nlp = await ethers.getContractAt(nlpName, lpAddress)

    const withdrawTx = await nlp.withdrawLiquidity(liquidityAmount)
    await withdrawTx.wait()
}

main(
    constants.scriptsConfig.nlp.removeLiquidity.lpAddress,
    constants.scriptsConfig.nlp.removeLiquidity.liquidityAmount
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
