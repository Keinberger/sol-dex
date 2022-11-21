import { useContract, useContractRead, useContractWrite } from "@thirdweb-dev/react"

export function useRetrieveTokenSymbol(address) {
    const { contract } = useContract(address, "token")
    // contract.erc20.get() may be used instead
    const { data } = useContractRead(contract, "symbol")

    return data
}

export function useApprove(erc20Address) {
    const { contract } = useContract(erc20Address, "token")
    const { mutate: approve } = useContractWrite(contract, "approve")

    return approve
}

export function useRetrieveTokenBalance(erc20address, account) {
    const { contract } = useContract(erc20address, "token")
    // contract.erc20.get() may be used instead
    const { data } = useContractRead(contract, "balanceOf", account)

    return data
}
