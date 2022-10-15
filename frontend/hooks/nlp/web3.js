import { useEffect } from "react"
import { ethers } from "ethers"
import { useWeb3Contract } from "react-moralis"
import { abi as nlpAbi } from "../../constants/NativeLiquidityPool"

export function useProvideLiquidity(lpAddress, amount) {
    const { runContractFunction: provideLiquidity } = useWeb3Contract({
        abi: nlpAbi,
        contractAddress: lpAddress,
        functionName: "provideLiquidity",
        msgValue: ethers.utils.parseEther(amount),
    })

    return provideLiquidity
}

export function useRetrieveEligibleNative(lpAddress, liquidityAmount) {
    const { runContractFunction: retrieveLiquidity, data } = useWeb3Contract({
        abi: nlpAbi,
        contractAddress: lpAddress,
        functionName: "getEligibleNativeOf",
        params: {
            liquidityAmount: liquidityAmount,
        },
    })

    useEffect(() => {
        retrieveLiquidity()
    }, [])

    return data
}

export function useRetrieveEligibleTokens(lpAddress, liquidityAmount) {
    const { runContractFunction: retrieveLiquidity, data } = useWeb3Contract({
        abi: nlpAbi,
        contractAddress: lpAddress,
        functionName: "getEligibleTokensOf",
        params: {
            liquidityAmount: liquidityAmount,
        },
    })

    useEffect(() => {
        retrieveLiquidity()
    }, [])

    return data
}

export function useRetrieveToken(lpAddress) {
    const { runContractFunction: retrieveAddress, data } = useWeb3Contract({
        abi: nlpAbi,
        contractAddress: lpAddress,
        functionName: "getTokenAddress",
    })

    useEffect(() => {
        retrieveAddress()
    }, [])

    return data
}

export function useRetrieveTokenAmountForDeposit(lpAddress, nativeAmount) {
    const { runContractFunction: retrieveAmount, data } = useWeb3Contract({
        abi: nlpAbi,
        contractAddress: lpAddress,
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

export function useWithdrawLiquidity(lpAddress, liquidityAmount) {
    const { runContractFunction: withdrawLiquidity } = useWeb3Contract({
        abi: nlpAbi,
        contractAddress: lpAddress,
        functionName: "withdrawLiquidity",
        params: {
            liquidityAmount: liquidityAmount,
        },
    })

    return withdrawLiquidity
}
