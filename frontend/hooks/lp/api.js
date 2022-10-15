import { useEffect } from "react"
import { useApiContract } from "react-moralis"
import { abi as tlpAbi } from "../../constants/TokenLiquidityPool"
import { chainId } from "../../constants/config"

export function useRetrieveLpKind(lpAddress) {
    const { runContractFunction: retrieveKind, data } = useApiContract({
        abi: tlpAbi,
        address: lpAddress,
        chain: chainId,
        functionName: "getKind",
    })

    useEffect(() => {
        retrieveKind()
    }, [])

    return data
}
