const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (lpAddress, nativeAmount) => {
    const chainId = network.config.chainId
    const nlpName = networkConfig[chainId].contracts.NativeLiquidityPool.name
    const nlp = await ethers.getContractAt(nlpName, lpAddress)

    const tokenAddress = await nlp.getTokenAddress()
    const tokenAmount = await nlp.getTokenAmountForNativeDeposit(nativeAmount)
    const token = await ethers.getContractAt("IERC20", tokenAddress)

    const approveTx = await token.approve(lpAddress, tokenAmount)
    await approveTx.wait()

    const lpTx = await nlp.provideLiquidity({ value: nativeAmount })
    await lpTx.wait()
}

main(
    constants.scriptsConfig.nlp.addLiquidity.lpAddress,
    constants.scriptsConfig.nlp.addLiquidity.nativeAmount
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
