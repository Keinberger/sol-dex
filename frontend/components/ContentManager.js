import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { ethers } from "ethers"
import { useMoralis } from "react-moralis"

import NavBar from "./NavBar"
import Exchange from "./sites/Exchange"
import Liquidity from "./sites/Liquidity"
import NoLiquidity from "./sites/NoLiquidity"

import {
    useRetrieveXToken,
    useRetrieveYToken,
    useRetrieveYTokenOutputForSwap,
    useRetrieveYAmountForDeposit,
} from "../hooks/tlp/api"
import {
    useRetrieveToken,
    useRetrieveTokenOutputForSwap,
    useRetrieveTokenAmountForDeposit,
} from "../hooks/nlp/api"

import config from "../constants/config"
import { getEthInverse } from "../helpers/helpers"

export default function ContentManager({ liquidityPools, lpPositions }) {
    const { isWeb3Enabled } = useMoralis()
    const [content, setContent] = useState(0)
    const [initialized, setInitialized] = useState(false)
    const [cookies, setCookie] = useCookies(["currentSite", "latestMessage"])

    const oneEther = ethers.utils.parseEther("1")
    const tokenMapping = new Map([])
    for (let i = 0; i < liquidityPools.length; i++) {
        const lpAddress = liquidityPools[i].address

        switch (liquidityPools[i].kind) {
            case "TLP":
                const xTokenAddress = useRetrieveXToken(lpAddress)
                const yTokenAddress = useRetrieveYToken(lpAddress)
                const yTokenOutput = useRetrieveYTokenOutputForSwap(lpAddress, oneEther)
                const yAmountForXDeposit = useRetrieveYAmountForDeposit(lpAddress, oneEther)

                let newXObj = tokenMapping.get(xTokenAddress)
                if (newXObj == undefined) {
                    newXObj = {}
                    newXObj.tokens = new Map([])
                }
                newXObj.tokens.set(yTokenAddress, {
                    lpAddress: lpAddress,
                    swapConversionRate: yTokenOutput,
                    provideConversionRate: yAmountForXDeposit,
                    direction: 0,
                })
                tokenMapping.set(xTokenAddress, newXObj)

                let newYObj = tokenMapping.get(yTokenAddress)
                if (newYObj == undefined) {
                    newYObj = {}
                    newYObj.tokens = new Map([])
                }
                newYObj.tokens.set(xTokenAddress, {
                    lpAddress: lpAddress,
                    swapConversionRate: getEthInverse(
                        yTokenOutput != null ? yTokenOutput : oneEther
                    ),
                    provideConversionRate: getEthInverse(
                        yAmountForXDeposit != null ? yAmountForXDeposit : oneEther
                    ),
                    direction: 1,
                })
                tokenMapping.set(yTokenAddress, newYObj)

                break
            case "NLP":
                const tokenAddress = useRetrieveToken(lpAddress)
                const tokenOutput = useRetrieveTokenOutputForSwap(lpAddress, oneEther)
                const tokenAmountForDeposit = useRetrieveTokenAmountForDeposit(lpAddress, oneEther)

                let xObj = tokenMapping.get(config.nativeCurrencySymbol)
                if (xObj == undefined) {
                    xObj = {}
                    xObj.tokens = new Map([])
                }
                xObj.tokens.set(tokenAddress, {
                    lpAddress: lpAddress,
                    swapConversionRate: tokenOutput,
                    provideConversionRate: tokenAmountForDeposit,
                    direction: 0,
                })
                tokenMapping.set(config.nativeCurrencySymbol, xObj)

                let yObj = tokenMapping.get(tokenAddress)
                if (yObj == undefined) {
                    yObj = {}
                    yObj.tokens = new Map([])
                }
                yObj.tokens.set(config.nativeCurrencySymbol, {
                    lpAddress: lpAddress,
                    swapConversionRate: getEthInverse(tokenOutput != null ? tokenOutput : oneEther),
                    provideConversionRate: getEthInverse(
                        tokenAmountForDeposit != null ? tokenAmountForDeposit : oneEther
                    ),
                    direction: 1,
                })
                tokenMapping.set(tokenAddress, yObj)

                break
        }
    }

    useEffect(() => {
        const topLevelKeys = [...tokenMapping.keys()]
        let notFinished = false
        Y: for (let i = 0; i < topLevelKeys.length; i++) {
            if (topLevelKeys[i] == null) {
                notFinished = true
                break Y
            }

            const value = tokenMapping.get(topLevelKeys[i]).tokens
            const tokensKeys = [...value.keys()]
            for (let j = 0; j < tokensKeys.length; j++) {
                const subValue = value.get(tokensKeys[j])
                if (
                    tokensKeys[j] == null ||
                    subValue.lpAddress == null ||
                    subValue.swapConversionRate == null
                ) {
                    notFinished = true
                    break Y
                }
            }
        }

        if (!notFinished && !initialized && topLevelKeys.length > 0) {
            setInitialized(true)
        }
    }, [tokenMapping])

    useEffect(() => {
        if (cookies.currentSite == undefined) {
            setCookie("currentSite", "0")
        }
        if (cookies.latestMessage == undefined) {
            // setCookie("latestMessage", { kind: "success", text: "Connect your wallet" })
        }
    }, [])

    return (
        <section name="DEX">
            <NavBar
                items={["Exchange", "Liquidity"]}
                contentFunc={setContent}
                activeItem={content}
            />
            {initialized && content == 0 ? (
                <Exchange tokenMapping={tokenMapping} />
            ) : (
                content == 1 &&
                (isWeb3Enabled ? (
                    <Liquidity lpPositions={lpPositions} tokenMapping={tokenMapping} />
                ) : (
                    <NoLiquidity tokenMapping={tokenMapping} />
                ))
            )}
        </section>
    )
}
