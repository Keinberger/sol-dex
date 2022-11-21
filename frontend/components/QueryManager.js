import { useAddress } from "@thirdweb-dev/react"
import { useQuery, gql } from "@apollo/client"

import ContentManager from "./ContentManager"

export default function QueryManager() {
    const userAddress = useAddress()

    const GET_LIQUIDITY_POOLS = gql`
        {
            liquidityPools(where: { active: true }) {
                address
                kind
            }
        }
    `
    const GET_LP_POSITIONS = gql`
        {
            lppositions(
                where: {
                    provider: "${userAddress}"
                    closed: false
                }
            ) {
                liquidityAmount
                lpAddress
                xDeposit
                yDeposit
                xWithdrawn
                yWithdrawn
            }
        }
    `

    const { data: liquidityPoolsData, loading: liquidityPoolsLoading } =
        useQuery(GET_LIQUIDITY_POOLS)
    const { data: lpPositionsData, loading: lpPositionsLoading } = useQuery(GET_LP_POSITIONS)

    return (
        !liquidityPoolsLoading &&
        liquidityPoolsData.liquidityPools != undefined && (
            <ContentManager
                liquidityPools={liquidityPoolsData.liquidityPools}
                lpPositions={
                    !lpPositionsLoading && lpPositionsData != undefined
                        ? lpPositionsData.lppositions
                        : []
                }
            />
        )
    )
}
