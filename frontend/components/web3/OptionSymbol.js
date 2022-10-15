import config from "../../constants/config"
import { useRetrieveTokenSymbol } from "../../hooks/erc20/api.js"

export default function OptionSymbol({ address }) {
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
