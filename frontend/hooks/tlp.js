import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react"
import { abi as tlpAbi } from "../constants/TokenLiquidityPool"

export function useRetrieveXAmountForDeposit(lpAddress, yAmount) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getXAmountForDepositOfY", yAmount)

    return data
}

export function useRetrieveXToken(lpAddress) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getXTokenAddress")

    return data
}

export function useRetrieveYAmountForDeposit(lpAddress, xAmount) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getYAmountForDepositOfX", xAmount)

    return data
}

export function useRetrieveYToken(lpAddress) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getYTokenAddress")

    return data
}

export function useRetrieveYTokenOutputForSwap(lpAddress, xAmount) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getYTokenOutputForSwap", xAmount)

    return data
}

export function useRetrieveEligibleX(lpAddress, liquidityAmount) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getEligibleXOf", liquidityAmount)

    return data
}

export function useRetrieveEligibleY(lpAddress, liquidityAmount) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getEligibleYOf", liquidityAmount)

    return data
}

export function useProvideLiquidity(lpAddress) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { mutate: provideLiquidity } = useContractWrite(contract, "provideLiquidity")

    return provideLiquidity
}

export function useWithdrawLiquidity(lpAddress) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { mutate: withdrawLiquidity } = useContractWrite(contract, "withdrawLiquidity")

    return withdrawLiquidity
}
