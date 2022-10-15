import { useEffect } from "react"
import { chainId } from "../../constants/config"
import { useNativeBalance } from "react-moralis"

export function useRetrieveNativeBalance(address) {
    const { getBalances: retrieveBalance, data } = useNativeBalance({
        chain: chainId,
        address: address,
    })

    useEffect(() => {
        retrieveBalance()
    }, [])

    return data.balance
}
