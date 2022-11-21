import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react"
import { abi as tlpAbi } from "../constants/TokenLiquidityPool"

export function useRetrieveLpKind(lpAddress) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { data } = useContractRead(contract, "getKind")

    return data
}

export function useSwap(lpAddress) {
    const { contract } = useContract(lpAddress, tlpAbi)
    const { mutate: swap } = useContractWrite(contract, "swap")

    return swap
}
