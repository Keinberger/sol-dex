import LiquidityBox from "../web3/liquidity/LiquidityBox"

export default function NoLiquidity({ tokenMapping }) {
    return <LiquidityBox processedPositions={[]} tokenMapping={tokenMapping} />
}
