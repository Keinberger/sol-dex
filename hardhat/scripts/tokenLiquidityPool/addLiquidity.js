const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (lpAddress, xAmount) => {
    const chainId = network.config.chainId
    const tlpName = networkConfig[chainId].contracts.TokenLiquidityPool.name
    const tlp = await ethers.getContractAt(tlpName, lpAddress)

    const xTokenAddress = await tlp.getXTokenAddress()
    const yTokenAddress = await tlp.getYTokenAddress()

    const xToken = await ethers.getContractAt("IERC20", xTokenAddress)
    const yToken = await ethers.getContractAt("IERC20", yTokenAddress)
    const yAmount = await tlp.getYAmountForDepositOfX(xAmount)

    const xApproveTx = await xToken.approve(lpAddress, xAmount)
    await xApproveTx.wait()
    const yApproveTx = await yToken.approve(lpAddress, yAmount)
    await yApproveTx.wait()

    const lpTx = await tlp.provideLiquidity(xAmount)
    await lpTx.wait()
}

main(
    constants.scriptsConfig.tlp.addLiquidity.lpAddress,
    constants.scriptsConfig.tlp.addLiquidity.xAmount
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
