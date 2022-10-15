import Head from "next/head"
import QueryManager from "../components/QueryManager"

export default function Home() {
    return (
        <div>
            <Head>
                <title>DEX</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <QueryManager />
        </div>
    )
}
