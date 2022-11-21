import "../styles/globals.css"
import { ThirdwebProvider, ChainId, useSDK } from "@thirdweb-dev/react"
import { NotificationProvider } from "@web3uikit/core"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import { CookiesProvider } from "react-cookie"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: "https://api.thegraph.com/subgraphs/name/" + process.env.NEXT_PUBLIC_SUBGRAPH_NAME,
})

function DEX({ Component, pageProps }) {
    return (
        <CookiesProvider>
            <ThirdwebProvider
                desiredChainId={ChainId.Polygon}
                chainRpc={{
                    [ChainId.Polygon]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
                }}
                supportedChains={[ChainId.Polygon]}
            >
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </ThirdwebProvider>
        </CookiesProvider>
    )
}

export default DEX
