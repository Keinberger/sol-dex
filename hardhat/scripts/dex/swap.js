const { network, ethers } = require("hardhat")
const { constants, networkConfig } = require("../../helper-hardhat-config")

const main = async (address, amount, direction) => {
    const chainId = network.config.chainId
    const dexName = networkConfig[chainId].contracts.DEX.name
    const nativeLpName = networkConfig[chainId].contracts.NativeLiquidityPool.name
    const ierc20Name = "IERC20"
    const tokenLpName = networkConfig[chainId].contracts.TokenLiquidityPool.name
    const proxy = await ethers.getContract(dexName + "_Proxy")
    const dex = await ethers.getContractAt(dexName, proxy.address)

    const liquidityPool = await ethers.getContractAt(nativeLpName, address)

    const kind = await liquidityPool.getKind()

    await liquidityPool.approve(dex.address, amount, direction)

    let actualLp
    switch (kind) {
        case 0: // nativeLiquidityPool
            actualLp = await ethers.getContractAt(nativeLpName, address)
            if (direction == 0) {
                await dex.swapAt(address, 0, { value: amount })
            } else if (direction == 1) {
                const tokenAddress = await actualLp.getTokenAddress()
                const token = await ethers.getContractAt(ierc20Name, tokenAddress.toString())

                await token.approve(actualLp.address, amount)
                await dex.swapAt(address, amount)
            }
            break
        case 1: // tokenLiquidityPool
            actualLp = await ethers.getContractAt(tokenLpName, address)
            if (direction == 0) {
                const xTokenAddress = await actualLp.getXTokenAddress()
                const xToken = await ethers.getContractAt(ierc20Name, xTokenAddress.toString())

                await xToken.approve(actualLp.address, amount)
            } else if (direction == 1) {
                const yTokenAddress = await actualLp.getYTokenAddress()
                const yToken = await ethers.getContractAt(ierc20Name, yTokenAddress.toString())

                await yToken.approve(actualLp.address, amount)
            }
            await dex.swapAt(address, amount)
            break
    }
}

main(
    constants.scriptsConfig.dex.address,
    constants.scriptsConfig.dex.amount,
    constants.scriptsConfig.dex.direction
)
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
