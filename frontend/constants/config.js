const config = {
    nativeCurrencySymbol: "MATIC",
    tallyUrl:
        "https://www.tally.xyz/governance/eip155:137:0xC499560F09c323622878cBDaf7322270E84D89B1",
    chainId: "0x89",
    tx: {
        confirmations: 4,
        posted: {
            text: "Transaction has been posted",
            kind: "info",
        },
        error: {
            text: "Transaction failed",
            kind: "error",
        },
    },
}

module.exports = config
