const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (lpAddress, liquidityAmount) => {
    const chainId = network.config.chainId
    const tlpName = networkConfig[chainId].contracts.TokenLiquidityPool.name
    const tlp = await ethers.getContractAt(tlpName, lpAddress)

    const withdrawTx = await tlp.withdrawLiquidity(liquidityAmount)
    await withdrawTx.wait()
}

main(
    constants.scriptsConfig.tlp.removeLiquidity.lpAddress,
    constants.scriptsConfig.tlp.removeLiquidity.liquidityAmount
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
