import config from "../../constants/config"
import { useRetrieveTokenSymbol } from "../../hooks/erc20/web3"

export default function Web3OptionSymbol({ address }) {
    const symbol =
        address == config.nativeCurrencySymbol || address == ""
            ? address
            : useRetrieveTokenSymbol(address, 0)

    return (
        <option value={address} id={address}>
            {symbol}
        </option>
    )
}
