import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
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
            <MoralisProvider
                // initializeOnMount={false}
                appId={process.env.NEXT_PUBLIC_MORALIS_APP_ID}
                serverUrl={process.env.NEXT_PUBLIC_MORALIS_SERVER_URL}
            >
                <ApolloProvider client={client}>
                    <NotificationProvider>
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </CookiesProvider>
    )
}

export default DEX
