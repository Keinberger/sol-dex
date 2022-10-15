import { useState } from "react"
import { useCookies } from "react-cookie"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"

import LiquidityForm from "./liquidity/LiquidityForm"
import { useApprove } from "../../../../hooks/erc20/web3"
import { useProvideLiquidity as useProvideLiquidityNLP } from "../../../../hooks/nlp/web3"
import { useProvideLiquidity as useProvideLiquidityTLP } from "../../../../hooks/tlp/web3"
import { useRetrieveNativeBalance } from "../../../../hooks/native/api"

import config from "../../../../constants/config"

export default function AddLiquidity({ isVisible, position, conversionRate }) {
    const { account } = useMoralis()
    const [cookies, setCookie] = useCookies(["latestMessage"])
    const [sendingTx, setSendingTx] = useState(false)
    const [xAmount, setXAmount] = useState("")
    const [yAmount, setYAmount] = useState("")

    const isNLP = position.lpKind == "0"
    const safeXAmount = xAmount ? xAmount : "1"
    const safeYAmount = yAmount ? yAmount : "1"
    const xNativeBalance = useRetrieveNativeBalance(account)

    const sendApproveX =
        !isNLP && useApprove(position.xTokenAddress, position.lpAddress, safeXAmount)
    const sendApproveY = useApprove(
        isNLP ? position.tokenAddress : position.yTokenAddress,
        position.lpAddress,
        safeYAmount
    )
    const sendProvideLiquidity = isNLP
        ? useProvideLiquidityNLP(position.lpAddress, safeXAmount)
        : useProvideLiquidityTLP(position.lpAddress, safeYAmount)

    const handleTxError = (e) => {
        setSendingTx(false)
        if (e.code == 4001) return

        console.error(e)
        setCookie("latestMessage", config.tx.error)
    }

    const handleTxSuccess = (tx) => {
        setCookie("latestMessage", {
            text: `Transaction (${tx.hash}) complete!`,
            kind: "success",
        })
    }

    const provideLiquidity = async () => {
        switch (isNLP) {
            case true:
                const formattedNativeBalance = ethers.utils.formatEther(xNativeBalance)
                if (formattedNativeBalance < xAmount) {
                    setCookie("latestMessage", {
                        text:
                            "Not enough " + config.nativeCurrencySymbol + " to complete transation",
                        kind: "error",
                    })
                    break
                }

                setSendingTx(true)
                await sendApproveY({
                    onComplete: () => {},
                    onSuccess: async (approveTx) => {
                        setCookie("latestMessage", config.tx.posted)
                        await approveTx.wait(config.tx.confirmations)

                        // send provideLiquidity
                        await sendProvideLiquidity({
                            onComplete: () => {},
                            onSuccess: async (provideTx) => {
                                await provideTx.wait(config.tx.confirmations)

                                handleTxSuccess(provideTx, setCookie)
                                setSendingTx(false)

                                window.location.reload(true)
                            },
                            onError: handleTxError,
                        })
                    },
                    onError: handleTxError,
                })
                break
            case false:
                setSendingTx(true)
                await sendApproveX({
                    onComplete: () => {},
                    onSuccess: async (approveXTx) => {
                        setCookie("latestMessage", config.tx.posted)
                        await approveXTx.wait(config.tx.confirmations)

                        // send approve Y
                        await sendApproveY({
                            onComplete: () => {},
                            onSuccess: async (approveYTx) => {
                                setCookie("latestMessage", config.tx.posted)
                                await approveYTx.wait(config.tx.confirmations)

                                // send provide Liquidity
                                await sendProvideLiquidity({
                                    onComplete: () => {},
                                    onSuccess: async (provideTx) => {
                                        setCookie("latestMessage", config.tx.posted)
                                        await provideTx.wait(config.tx.confirmations)

                                        handleTxSuccess(provideTx, useCookies)
                                        setSendingTx(false)

                                        window.location.reload(true)
                                    },
                                    onError: handleTxError,
                                })
                            },
                            onError: handleTxError,
                        })
                    },
                    onError: handleTxError,
                })
                break
        }
    }

    return (
        <LiquidityForm
            header={"Add Liquidity"}
            isVisible={isVisible}
            position={position}
            conversionRate={conversionRate}
            firstAmount={xAmount}
            setFirstAmount={setXAmount}
            secondAmount={yAmount}
            setSecondAmount={setYAmount}
            sendingTx={sendingTx}
            functionToExecute={provideLiquidity}
        />
    )
}
