import config from "../../constants/config"
import { useRetrieveTokenSymbol } from "../../hooks/erc20.js"

export default function OptionSymbol({ address }) {
    const symbol =
        address == config.nativeCurrencySymbol || address == ""
            ? address
            : useRetrieveTokenSymbol(address)

    return (
        <option value={address} id={address}>
            {symbol}
        </option>
    )
}
