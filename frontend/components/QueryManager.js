import { useMoralis } from "react-moralis"
import { useQuery, gql } from "@apollo/client"

import ContentManager from "./ContentManager"

export default function QueryManager() {
    const { account } = useMoralis()

    // define queries here
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
                    provider: "${account}"
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

    // execute queries here

    const { data: liquidityPoolsData, loading: liquidityPoolsLoading } =
        useQuery(GET_LIQUIDITY_POOLS)
    const { data: lpPositionsData, loading: lpPositionsLoading } = useQuery(GET_LP_POSITIONS)

    // pass query results on to site components

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
