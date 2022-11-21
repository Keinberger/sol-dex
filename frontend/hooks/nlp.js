import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react"
import { abi as nlpAbi } from "../constants/NativeLiquidityPool"

export function useRetrieveToken(lpAddress) {
    const { contract } = useContract(lpAddress, nlpAbi)
    const { data } = useContractRead(contract, "getTokenAddress")

    return data
}

export function useRetrieveTokenAmountForDeposit(lpAddress, nativeAmount) {
    const { contract } = useContract(lpAddress, nlpAbi)
    const { data } = useContractRead(contract, "getTokenAmountForNativeDeposit", nativeAmount)

    return data
}

export function useRetrieveTokenOutputForSwap(lpAddress, nativeAmount) {
    const { contract } = useContract(lpAddress, nlpAbi)
    const { data } = useContractRead(contract, "getTokenOutputForSwap", nativeAmount)

    return data
}

export function useRetrieveEligibleNative(lpAddress, liquidityAmount) {
    const { contract } = useContract(lpAddress, nlpAbi)
    const { data } = useContractRead(contract, "getEligibleNativeOf", liquidityAmount)

    return data
}

export function useRetrieveEligibleTokens(lpAddress, liquidityAmount) {
    const { contract } = useContract(lpAddress, nlpAbi)
    const { data } = useContractRead(contract, "getEligibleTokensOf", liquidityAmount)

    return data
}

export function useWithdrawLiquidity(lpAddress) {
    const { contract } = useContract(lpAddress, nlpAbi)

    const { mutate: withdrawLiquidity } = useContractWrite(contract, "withdrawLiquidity")
    return withdrawLiquidity
}

export function getContract(address) {
    const { contract } = useContract(address, nlpAbi)
    return contract
}
