import { useEffect } from "react"
import { useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import { abi as tlpAbi } from "../../constants/TokenLiquidityPool"

export function useRetrieveLpKind(lpAddress) {
    const { runContractFunction: retrieveKind, data } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "getKind",
    })

    useEffect(() => {
        retrieveKind()
    }, [])

    return data
}

export function useSwap(lpAddress, tokenAmount, msgValue, direction) {
    const { runContractFunction: swap } = useWeb3Contract({
        abi: tlpAbi,
        contractAddress: lpAddress,
        functionName: "swap",
        params: {
            tokenAmount: tokenAmount ? ethers.utils.parseEther(tokenAmount) : 0,
            direction: direction,
        },
        msgValue: msgValue ? ethers.utils.parseEther(msgValue) : 0,
    })

    return swap
}
