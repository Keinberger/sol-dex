import { useRetrieveTokenSymbol } from "../../hooks/erc20/web3.js"

export default function Symbol({ address }) {
    const symbol = useRetrieveTokenSymbol(address)
    return symbol
}
