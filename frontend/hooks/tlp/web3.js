import { useEffect } from "react"
import { ethers } from "ethers"
import { useWeb3Contract } from "react-moralis"
import { abi as tlpAbi } from "../../constants/TokenLiquidityPool"

export function useProvideLiquidity(lpAddress, amount) {
    const { runContractFunction: provideLiquidity } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "provideLiquidity",
        params: {
            xDeposit: ethers.utils.parseEther(amount),
        },
    })

    return provideLiquidity
}

export function useRetrieveEligibleX(lpAddress, liquidityAmount) {
    const { runContractFunction: retrieveLiquidity, data } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "getEligibleXOf",
        params: {
            liquidityAmount: liquidityAmount,
        },
    })

    useEffect(() => {
        retrieveLiquidity()
    }, [])

    return data
}

export function useRetrieveEligibleY(lpAddress, liquidityAmount) {
    const { runContractFunction: retrieveLiquidity, data } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "getEligibleYOf",
        params: {
            liquidityAmount: liquidityAmount,
        },
    })

    useEffect(() => {
        retrieveLiquidity()
    }, [])

    return data
}

export function useRetrieveXToken(lpAddress) {
    const { runContractFunction: retrieveAddress, data } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "getXTokenAddress",
    })

    useEffect(() => {
        retrieveAddress()
    }, [])

    return data
}

export function useRetrieveYAmountForDeposit(lpAddress, xAmount) {
    const { runContractFunction: retrieveAmount, data } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
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
    const { runContractFunction: retrieveAddress, data } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "getYTokenAddress",
    })

    useEffect(() => {
        retrieveAddress()
    }, [])

    return data
}

export function useWithdrawLiquidity(lpAddress, liquidityAmount) {
    const { runContractFunction: withdrawLiquidity } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "withdrawLiquidity",
        params: {
            liquidityAmount: liquidityAmount,
        },
    })

    return withdrawLiquidity
}
