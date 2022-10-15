import { useEffect } from "react"
import { useApiContract } from "react-moralis"
import { abi as tlpAbi } from "../../constants/TokenLiquidityPool"
import { chainId } from "../../constants/config"

export function useRetrieveXAmountForDeposit(lpAddress, yAmount) {
    const { runContractFunction: retrieveAmount, data } = useApiContract({
        abi: tlpAbi,
        chain: chainId,
        address: lpAddress,
        functionName: "getXAmountForDepositOfY",
        params: {
            yAmount: yAmount,
        },
    })

    useEffect(() => {
        retrieveAmount()
    }, [])

    return data
}

export function useRetrieveXToken(lpAddress) {
    const { runContractFunction: retrieveAddress, data } = useApiContract({
        abi: tlpAbi,
        address: lpAddress,
        chain: chainId,
        functionName: "getXTokenAddress",
    })

    useEffect(() => {
        retrieveAddress()
    }, [])

    return data
}

export function useRetrieveYAmountForDeposit(lpAddress, xAmount) {
    const { runContractFunction: retrieveAmount, data } = useApiContract({
        abi: tlpAbi,
        chain: chainId,
        address: lpAddress,
        functionName: "getYAmountForDepositOfX",
        params: {
            xAmount: xAmount,
        },
    })

    useEffect(() => {
        retrieveAmount()
    }, [])

    return data
}

export function useRetrieveYToken(lpAddress) {
    const { runContractFunction: retrieveAddress, data } = useApiContract({
        abi: tlpAbi,
        address: lpAddress,
        chain: chainId,
        functionName: "getYTokenAddress",
    })

    useEffect(() => {
        retrieveAddress()
    }, [])

    return data
}

export function useRetrieveYTokenOutputForSwap(lpAddress, xAmount) {
    const { runContractFunction: retrieveAmount, data } = useApiContract({
        abi: tlpAbi,
        address: lpAddress,
        chain: chainId,
        functionName: "getYTokenOutputForSwap",
        params: {
            xAmount: xAmount,
        },
    })

    useEffect(() => {
        retrieveAmount()
    }, [])

    return data
}
