import { useState } from "react"
import { useCookies } from "react-cookie"
import { ethers } from "ethers"

import LiquidityForm from "./liquidity/LiquidityForm"

import { useWithdrawLiquidity as useWithdrawLiquidityNLP } from "../../../../hooks/nlp.js"
import { getContract as getNLPContract } from "../../../../hooks/nlp.js"
import { useWithdrawLiquidity as useWithdrawLiquidityTLP } from "../../../../hooks/tlp.js"

import config from "../../../../constants/config"
import { trimNumber } from "../../../../helpers/helpers"

export default function WithdrawLiquidity({ isVisible, position, conversionRate }) {
    const [cookies, setCookie] = useCookies(["latestMessage"])
    const [sendingTx, setSendingTx] = useState(false)
    const [xAmount, setXAmount] = useState("")
    const [yAmount, setYAmount] = useState("")

    const isNLP = position.lpKind == "0"
    const safeXAmount = xAmount ? xAmount : "1"
    const liquidityPercentage = trimNumber(
        String(safeXAmount / Number(ethers.utils.formatEther(position.xEligible))),
        14
    )
    const liquidityToWithdraw = String(liquidityPercentage * position.liquidityAmount)

    const sendWithdrawLiquidity = isNLP
        ? useWithdrawLiquidityNLP(position.lpAddress)
        : useWithdrawLiquidityTLP(position.lpAddress)

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

    const withdrawLiquidity = () => {
        setSendingTx(true)
        switch (isNLP) {
            case true:
                sendWithdrawLiquidity([liquidityToWithdraw], {
                    onSuccess: (data) => {
                        handleTxSuccess(data)
                        window.location.reload()
                    },
                    onError: handleTxError,
                })
                break
            case false:
                sendWithdrawLiquidity([liquidityToWithdraw], {
                    onSuccess: (data) => {
                        handleTxSuccess(data)
                        window.location.reload()
                    },
                })
                break
        }

        // send withdraw liquidity
    }

    return (
        <LiquidityForm
            header={"Withdraw Liquidity"}
            isVisible={isVisible}
            position={position}
            conversionRate={conversionRate}
            firstAmount={xAmount}
            setFirstAmount={setXAmount}
            secondAmount={yAmount}
            setSecondAmount={setYAmount}
            firstAmountMax={ethers.utils.formatEther(position.xEligible)}
            secondAmountMax={ethers.utils.formatEther(position.yEligible)}
            sendingTx={sendingTx}
            functionToExecute={withdrawLiquidity}
        />
    )
}
