import { useEffect, useState } from "react"
import { useCookies } from "react-cookie"
import { useSDK } from "@thirdweb-dev/react"
import { ethers } from "ethers"

import LiquidityForm from "./liquidity/LiquidityForm"
import { useApprove } from "../../../../hooks/erc20.js"
import { getContract as getNLPContract } from "../../../../hooks/nlp.js"
import { useProvideLiquidity as useProvideLiquidityTLP } from "../../../../hooks/tlp.js"

import config from "../../../../constants/config"
import { convertToWei } from "../../../../helpers/helpers"

export default function AddLiquidity({ isVisible, position, conversionRate }) {
    const sdk = useSDK()
    const [xNativeBalance, setXNativeBalance] = useState("0")
    const [cookies, setCookie] = useCookies(["latestMessage"])
    const [sendingTx, setSendingTx] = useState(false)
    const [xAmount, setXAmount] = useState("")
    const [yAmount, setYAmount] = useState("")

    const isNLP = position.lpKind == "0"
    const safeXAmount = xAmount ? convertToWei(xAmount) : "1"
    const safeYAmount = yAmount ? convertToWei(yAmount) : "1"

    const sendApproveX = useApprove(position.xTokenAddress)
    const sendApproveY = useApprove(isNLP ? position.tokenAddress : position.yTokenAddress)
    const nlpContract = isNLP && getNLPContract(position.lpAddress)
    const sendProvideLiquidityTLP = !isNLP && useProvideLiquidityTLP(position.lpAddress)

    const handleTxError = () => {
        setSendingTx(false)
        setCookie("latestMessage", config.tx.error)
    }

    const handleTxSuccess = (tx) => {
        setSendingTx(false)
        setCookie("latestMessage", {
            text: `Transaction (${tx.transactionHash}) complete!`,
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

                console.log(formattedNativeBalance, xAmount)

                setSendingTx(true)
                sendApproveY([position.lpAddress, safeYAmount], {
                    onSuccess: async () => {
                        try {
                            const tx = await nlpContract.call("provideLiquidity", {
                                value: safeXAmount,
                            })
                            const receipt = tx.receipt
                            handleTxSuccess(receipt)
                            window.location.reload()
                        } catch {
                            handleTxError()
                        }
                    },
                    onError: handleTxError,
                })
                break
            case false:
                setSendingTx(true)
                sendApproveX([position.lpAddress, safeXAmount], {
                    onSuccess: () => {
                        sendApproveY([position.lpAddress, safeYAmount], {
                            onSuccess: () => {
                                sendProvideLiquidityTLP([safeXAmount, safeYAmount], {
                                    onSuccess: (data) => {
                                        handleTxSuccess(data)
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

    useEffect(() => {
        sdk.wallet.balance().then((bal) => setXNativeBalance(bal.value.toString()))
    }, [])

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
