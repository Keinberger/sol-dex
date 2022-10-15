import { useState } from "react"
import { useCookies } from "react-cookie"
import { ethers } from "ethers"

import LiquidityForm from "./liquidity/LiquidityForm"

import { useWithdrawLiquidity as useWithdrawLiquidityNLP } from "../../../../hooks/nlp/web3"
import { useWithdrawLiquidity as useWithdrawLiquidityTLP } from "../../../../hooks/tlp/web3"

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
        ? useWithdrawLiquidityNLP(position.lpAddress, liquidityToWithdraw)
        : useWithdrawLiquidityTLP(position.lpAddress, liquidityToWithdraw)

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

    const withdrawLiquidity = async () => {
        setSendingTx(true)
        await sendWithdrawLiquidity({
            onComplete: () => {},
            onSuccess: async (withdrawTx) => {
                setCookie("latestMessage", config.tx.posted)
                await withdrawTx.wait(config.tx.confirmations)

                handleTxSuccess(withdrawTx, setCookie)
                setSendingTx(false)

                window.location.reload(true)
            },
            onError: handleTxError,
        })
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
