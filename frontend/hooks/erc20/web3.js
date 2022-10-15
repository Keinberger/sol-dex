import { ethers } from "ethers"
import { useEffect } from "react"
import { useWeb3Contract } from "react-moralis"
import { abi as tokenAbi } from "../../constants/ERC20"

export function useApprove(erc20Address, spender, amount) {
    const { runContractFunction: approve } = useWeb3Contract({
        abi: tokenAbi,
        contractAddress: erc20Address,
        functionName: "approve",
        params: {
            spender: spender,
            amount: ethers.utils.parseEther(amount),
        },
    })

    return approve
}

export function useRetrieveTokenBalance(erc20Address, account) {
    const {
        runContractFunction: retrieveBalance,
        data,
        error,
    } = useWeb3Contract({
        abi: tokenAbi,
        contractAddress: erc20Address,
        functionName: "balanceOf",
        params: {
            account: account,
        },
    })

    error && erc20Address != config.nativeCurrencySymbol && console.log(error)

    useEffect(() => {
        retrieveBalance()
    }, [])

    return data
}

export function useRetrieveTokenSymbol(address) {
    const { runContractFunction: retrieveSymbol, data } = useWeb3Contract({
        abi: tokenAbi,
        contractAddress: address,
        functionName: "symbol",
    })

    useEffect(() => {
        retrieveSymbol()
    }, [])

    return data
}
