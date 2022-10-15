import { useEffect } from "react"
import { useApiContract } from "react-moralis"
import { abi as nlpAbi } from "../../constants/NativeLiquidityPool"
import { chainId } from "../../constants/config"

export function useRetrieveToken(lpAddress) {
    const { runContractFunction: retrieveAddress, data } = useApiContract({
        abi: nlpAbi,
        address: lpAddress,
        chain: chainId,
        functionName: "getTokenAddress",
    })

    useEffect(() => {
        retrieveAddress()
    }, [])

    return data
}

export function useRetrieveTokenAmountForDeposit(lpAddress, nativeAmount) {
    const { runContractFunction: retrieveAmount, data } = useApiContract({
        abi: nlpAbi,
        chain: chainId,
        address: lpAddress,
        functionName: "getTokenAmountForNativeDeposit",
        params: {
            nativeAmount: nativeAmount,
        },
    })

    useEffect(() => {
        retrieveAmount()
    }, [])

    return data
}

export function useRetrieveTokenOutputForSwap(lpAddress, nativeAmount) {
    const { runContractFunction: retrieveAmount, data } = useApiContract({
        abi: nlpAbi,
        address: lpAddress,
        chain: chainId,
        functionName: "getTokenOutputForSwap",
        params: {
            nativeAmount: nativeAmount,
        },
    })

    useEffect(() => {
        retrieveAmount()
    }, [])

    return data
}
