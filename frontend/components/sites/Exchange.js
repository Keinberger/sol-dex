import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import { useCookies } from "react-cookie"
import { AiOutlineArrowDown } from "react-icons/ai"
import { ethers } from "ethers"

import InputForm from "../web3/exchange/InputForm"
import config from "../../constants/config"
import { trimNumber } from "../../helpers/helpers"
import { useSwap } from "../../hooks/lp/web3"
import { useApprove } from "../../hooks/erc20/web3"

export default function Exchange({ tokenMapping }) {
    const [cookies, setCookie] = useCookies(["latestMessage"])
    const { isWeb3Enabled } = useMoralis()
    const [sendingTx, setSendingTx] = useState(false)
    const [firstAmount, setFirstAmount] = useState(0)
    const [secondAmount, setSecondAmount] = useState(0)
    const [firstTokenSelected, setFirstTokenSelected] = useState("")
    const [secondTokenSelected, setSecondTokenSelected] = useState("")
    const [changedAmount, setChangedAmount] = useState(false)

    if (
        firstTokenSelected == secondTokenSelected &&
        firstTokenSelected !== "" &&
        secondTokenSelected !== ""
    ) {
        setSecondTokenSelected([...tokenMapping.get(firstTokenSelected).tokens.keys()][0])
    }

    const currentLpAddress =
        tokenMapping.get(firstTokenSelected) != undefined &&
        tokenMapping.get(firstTokenSelected).tokens.get(secondTokenSelected) != undefined &&
        tokenMapping.get(firstTokenSelected).tokens.get(secondTokenSelected).lpAddress
    const currentDirection =
        tokenMapping.get(firstTokenSelected) != undefined &&
        tokenMapping.get(firstTokenSelected).tokens.get(secondTokenSelected) != undefined
            ? tokenMapping.get(firstTokenSelected).tokens.get(secondTokenSelected).direction
            : 0
    const currentLpKind =
        firstTokenSelected == config.nativeCurrencySymbol ||
        secondTokenSelected == config.nativeCurrencySymbol
            ? 0
            : 1
    const xToken = currentDirection == 0 ? firstTokenSelected : secondTokenSelected
    const yToken = currentDirection == 0 ? secondTokenSelected : firstTokenSelected
    const xAmount =
        currentDirection == 0 ? Number(firstAmount).toString() : Number(secondAmount).toString()
    const yAmount =
        currentDirection == 0 ? Number(secondAmount).toString() : Number(firstAmount).toString()

    const sendApproveX = useApprove(xToken, currentLpAddress, xAmount)
    const sendApproveY = useApprove(yToken, currentLpAddress, yAmount)
    const sendUseSwap =
        currentLpKind == 0
            ? useSwap(
                  currentLpAddress,
                  currentDirection == 0 ? 0 : yAmount,
                  currentDirection == 0 ? xAmount : 0,
                  currentDirection
              )
            : useSwap(
                  currentLpAddress,
                  currentDirection == 0 ? xAmount : yAmount,
                  0,
                  currentDirection
              )

    useEffect(() => {
        const firstKey = [...tokenMapping.keys()][0]
        const secondKey = [...tokenMapping.get(firstKey).tokens.keys()][0]

        setFirstTokenSelected(firstKey)
        setSecondTokenSelected(secondKey)
    }, [])

    useEffect(() => {
        if (firstTokenSelected == "" || secondTokenSelected == "") return
        if (firstAmount == "" || firstAmount == "0") {
            setSecondAmount("0")
            return
        }
        if (changedAmount) {
            setChangedAmount(false)
            return
        }

        const conversionRateBig = tokenMapping
            .get(firstTokenSelected)
            .tokens.get(secondTokenSelected).swapConversionRate
        const firstAmountBig = ethers.utils.parseEther(firstAmount)

        const secondAmount = ethers.utils.formatEther(
            firstAmountBig.mul(conversionRateBig).div(ethers.utils.parseEther("1"))
        )
        const setAmount = trimNumber(secondAmount, 5)

        setChangedAmount(true)
        setSecondAmount(setAmount)
    }, [firstAmount, firstTokenSelected])

    useEffect(() => {
        if (secondTokenSelected == "" || firstTokenSelected == "") return
        if (secondAmount == "" || secondAmount == "0") {
            setFirstAmount("0")
            return
        }
        if (changedAmount) {
            setChangedAmount(false)
            return
        }

        const conversionRateBig = tokenMapping
            .get(secondTokenSelected)
            .tokens.get(firstTokenSelected).swapConversionRate
        const secondAmountBig = ethers.utils.parseEther(secondAmount)

        const firstAmount = ethers.utils.formatEther(
            secondAmountBig.mul(conversionRateBig).div(ethers.utils.parseEther("1"))
        )
        const setAmount = trimNumber(firstAmount, 5)

        setChangedAmount(true)
        setFirstAmount(setAmount)
    }, [secondAmount, secondTokenSelected])

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

    return (
        <section name="Exchange">
            <div className="w-full h-full">
                <div className="flex mt-32">
                    <div
                        className={`mx-auto w-[300px] sm:w-[400px] md:w-[450px]
                        lg:w-[550px] rounded-2xl drop-shadow-xl bg-black`}
                    >
                        <div className="px-7 py-5">
                            <div>
                                <h1 className="text-slate-200 text-base sm:text-lg md:text-xl">
                                    Swap
                                </h1>
                            </div>

                            <InputForm
                                amount={firstAmount}
                                setAmount={setFirstAmount}
                                inputName={"firstTokenAmount"}
                                inpoutId={"firstTokenAmount"}
                                selectName={"firstToken"}
                                selectId={"firstToken"}
                                setTokenSelected={setFirstTokenSelected}
                                tokenSelected={firstTokenSelected}
                                tokens={[...tokenMapping.keys()]}
                                margins={"mt-6 mb-2"}
                            />

                            <div className="text-xl text-slate-400 flex">
                                <div className="mx-auto">
                                    <AiOutlineArrowDown />
                                </div>
                            </div>

                            <InputForm
                                amount={secondAmount}
                                setAmount={setSecondAmount}
                                inputName={"secondTokenAmount"}
                                inputId={"secondTokenAmount"}
                                selectName={"secondToken"}
                                selectId={"secondToken"}
                                setTokenSelected={setSecondTokenSelected}
                                tokenSelected={secondTokenSelected}
                                tokens={
                                    tokenMapping.has(firstTokenSelected)
                                        ? tokenMapping.get(firstTokenSelected) != undefined && [
                                              ...tokenMapping.get(firstTokenSelected).tokens.keys(),
                                          ]
                                        : tokenMapping.get([...tokenMapping.keys()][0]) !=
                                              undefined && [
                                              ...tokenMapping
                                                  .get([...tokenMapping.keys()][0])
                                                  .tokens.keys(),
                                          ]
                                }
                                margins={"my-2"}
                            />

                            <div className="flex my-6 mx-6 sm:mx-12 lg:mx-20">
                                <div className="w-full">
                                    <button
                                        className={`popOutHover w-full bg-emerald-700 border border-emerald-700 rounded-xl
                                        text-emerald-300 text-sm sm:text-base md:text-lg py-3 focus:border focus:border-emerald-600
                                        hover:bg-emerald-600 transition disabled:cursor-not-allowed 
                                        disabled:hover:bg-emerald-700
                                        `}
                                        disabled={
                                            (firstAmount == 0 && secondAmount == 0) ||
                                            !isWeb3Enabled ||
                                            sendingTx
                                        }
                                        onClick={async () => {
                                            Y: switch (currentLpKind) {
                                                case 0:
                                                    switch (currentDirection) {
                                                        case 0:
                                                            sendUseSwap({
                                                                onComplete: () => {},
                                                                onSuccess: async (swapTx) => {
                                                                    setSendingTx(true)
                                                                    setCookie(
                                                                        "latestMessage",
                                                                        config.tx.posted
                                                                    )
                                                                    await swapTx.wait(
                                                                        config.tx.confirmations
                                                                    )

                                                                    handleTxSuccess(swapTx)
                                                                    setSendingTx(false)
                                                                    window.location.reload(true)
                                                                },
                                                                onError: handleTxError,
                                                            })
                                                            break Y
                                                        case 1:
                                                            sendApproveY({
                                                                onComplete: () => {},
                                                                onSuccess: async (approveTx) => {
                                                                    setSendingTx(true)
                                                                    setCookie(
                                                                        "latestMessage",
                                                                        config.tx.posted
                                                                    )
                                                                    await approveTx.wait(
                                                                        config.tx.confirmations
                                                                    )

                                                                    sendUseSwap({
                                                                        onComplete: () => {},
                                                                        onSuccess: async (
                                                                            swapTx
                                                                        ) => {
                                                                            setSendingTx(true)
                                                                            setCookie(
                                                                                "latestMessage",
                                                                                config.tx.posted
                                                                            )
                                                                            await swapTx.wait(
                                                                                config.tx
                                                                                    .confirmations
                                                                            )

                                                                            handleTxSuccess(swapTx)
                                                                            setSendingTx(false)
                                                                            window.location.reload(
                                                                                true
                                                                            )
                                                                        },
                                                                        onError: handleTxError,
                                                                    })
                                                                },
                                                                onError: handleTxError,
                                                            })
                                                            break Y
                                                    }
                                                    break
                                                case 1:
                                                    switch (currentDirection) {
                                                        case 0:
                                                            sendApproveX({
                                                                onComplete: () => {},
                                                                onSuccess: async (approveTx) => {
                                                                    setSendingTx(true)
                                                                    setCookie(
                                                                        "latestMessage",
                                                                        config.tx.posted
                                                                    )
                                                                    await approveTx.wait(
                                                                        config.tx.confirmations
                                                                    )

                                                                    sendUseSwap({
                                                                        onComplete: () => {},
                                                                        onSuccess: async (
                                                                            swapTx
                                                                        ) => {
                                                                            setSendingTx(true)
                                                                            setCookie(
                                                                                "latestMessage",
                                                                                config.tx.posted
                                                                            )
                                                                            await swapTx.wait(
                                                                                config.tx
                                                                                    .confirmations
                                                                            )

                                                                            handleTxSuccess(swapTx)
                                                                            setSendingTx(false)
                                                                            window.location.reload(
                                                                                true
                                                                            )
                                                                        },
                                                                        onError: handleTxError,
                                                                    })
                                                                },
                                                                onError: handleTxError,
                                                            })
                                                            break Y
                                                        case 1:
                                                            sendApproveY({
                                                                onComplete: () => {},
                                                                onSuccess: async (approveTx) => {
                                                                    setSendingTx(true)
                                                                    setCookie(
                                                                        "latestMessage",
                                                                        config.tx.posted
                                                                    )
                                                                    await approveTx.wait(
                                                                        config.tx.confirmations
                                                                    )

                                                                    sendUseSwap({
                                                                        onComplete: () => {},
                                                                        onSuccess: async (
                                                                            swapTx
                                                                        ) => {
                                                                            setSendingTx(true)
                                                                            setCookie(
                                                                                "latestMessage",
                                                                                config.tx.posted
                                                                            )
                                                                            await swapTx.wait(
                                                                                config.tx
                                                                                    .confirmations
                                                                            )

                                                                            handleTxSuccess(swapTx)
                                                                            setSendingTx(false)
                                                                            window.location.reload(
                                                                                true
                                                                            )
                                                                        },
                                                                        onError: handleTxError,
                                                                    })
                                                                },
                                                                onError: handleTxError,
                                                            })
                                                            break Y
                                                    }
                                                    break
                                            }
                                        }}
                                    >
                                        {isWeb3Enabled
                                            ? sendingTx
                                                ? "Swapping"
                                                : "Swap"
                                            : "Connect wallet"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
