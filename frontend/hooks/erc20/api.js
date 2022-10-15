import Moralis from "moralis"
import { useEffect, useState } from "react"
import { chainId } from "../../constants/config"

export function useRetrieveTokenSymbol(address) {
    if (address == null) return null

    const [symbol, setSymbol] = useState(null)

    const retrieveSymbol = async () => {
        await Moralis.start({
            apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY,
        })

        const response = await Moralis.EvmApi.token.getTokenMetadata({
            addresses: [address],
            chain: chainId,
        })

        setSymbol(response.result[0].token.symbol)
    }

    useEffect(() => {
        retrieveSymbol()
    }, [])

    return symbol
}
