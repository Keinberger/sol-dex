import { useState, useEffect } from "react"
import { useCookies } from "react-cookie"
import { ethers } from "ethers"
import { IoIosCloseCircleOutline } from "react-icons/io"

import OptionSymbol from "../OptionSymbol"
import { useApprove } from "../../../hooks/erc20.js"
import { getContract as getNLPContract } from "../../../hooks/nlp"
import { useProvideLiquidity as useProvideLiquidityTLP } from "../../../hooks/tlp.js"
import config from "../../../constants/config"
import { trimNumber, convertToWei } from "../../../helpers/helpers"

export default function NewPosition({ isVisible, hide, tokenMapping }) {
    const [cookies, setCookie] = useCookies(["latestMessage"])
    const [sendingTx, setSendingTx] = useState(false)
    const [firstAmount, setFirstAmount] = useState("")
    const [secondAmount, setSecondAmount] = useState("")
    const [firstTokenSelected, setFirstTokenSelected] = useState("")
    const [secondTokenSelected, setSecondTokenSelected] = useState("")
    const [changedAmount, setChangedAmount] = useState(false)

    const currentLpConfig =
        tokenMapping.get(firstTokenSelected) != undefined &&
        tokenMapping.get(firstTokenSelected).tokens.get(secondTokenSelected) != undefined &&
        tokenMapping.get(firstTokenSelected).tokens.get(secondTokenSelected)

    const currentLpAddress = currentLpConfig.lpAddress
    const currentDirection = currentLpConfig.direction

    const currentLpKind =
        firstTokenSelected == config.nativeCurrencySymbol ||
        secondTokenSelected == config.nativeCurrencySymbol
            ? 0
            : 1
    const xToken = currentDirection == 0 ? firstTokenSelected : secondTokenSelected
    const yToken = currentDirection == 0 ? secondTokenSelected : firstTokenSelected
    const xAmount =
        currentDirection == 0
            ? convertToWei(Number(firstAmount).toString())
            : convertToWei(Number(secondAmount).toString())
    const yAmount =
        currentDirection == 0
            ? convertToWei(Number(secondAmount).toString())
            : convertToWei(Number(firstAmount).toString())

    const sendApproveX = useApprove(xToken)
    const sendApproveY = useApprove(yToken)
    const nlpContract = getNLPContract(currentLpAddress)
    const sendProvideLiquidityTLP = useProvideLiquidityTLP(currentLpAddress)

    const firstTokens = [...tokenMapping.keys()]
    const secondTokens = tokenMapping.has(firstTokenSelected)
        ? tokenMapping.get(firstTokenSelected) != undefined && [
              ...tokenMapping.get(firstTokenSelected).tokens.keys(),
          ]
        : tokenMapping.get([...tokenMapping.keys()][0]) != undefined && [
              ...tokenMapping.get([...tokenMapping.keys()][0]).tokens.keys(),
          ]

    if (
        firstTokenSelected !== "" &&
        secondTokenSelected !== "" &&
        (tokenMapping.get(firstTokenSelected).tokens.get(secondTokenSelected) == undefined ||
            firstTokenSelected == secondTokenSelected)
    ) {
        setSecondTokenSelected([...tokenMapping.get(firstTokenSelected).tokens.keys()][0])
    }

    useEffect(() => {
        const firstKey = [...tokenMapping.keys()][0]
        const secondKey = [...tokenMapping.get(firstKey).tokens.keys()][0]

        setFirstTokenSelected(firstKey)
        setSecondTokenSelected(secondKey)
    }, [])

    useEffect(() => {
        if (firstTokenSelected == "" || secondTokenSelected == "") return
        if (changedAmount) {
            setChangedAmount(false)
            return
        }
        if (firstAmount == "" || firstAmount == "0") {
            setSecondAmount("0")
            return
        }

        const conversionRateBig = tokenMapping
            .get(firstTokenSelected)
            .tokens.get(secondTokenSelected).provideConversionRate
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
        if (changedAmount) {
            setChangedAmount(false)
            return
        }
        if (secondAmount == "" || secondAmount == "0") {
            setFirstAmount("0")
            return
        }

        const conversionRateBig = tokenMapping
            .get(secondTokenSelected)
            .tokens.get(firstTokenSelected).provideConversionRate
        const secondAmountBig = ethers.utils.parseEther(secondAmount)

        const firstAmount = ethers.utils.formatEther(
            secondAmountBig.mul(conversionRateBig).div(ethers.utils.parseEther("1"))
        )
        const setAmount = trimNumber(firstAmount, 5)

        setChangedAmount(true)
        setFirstAmount(setAmount)
    }, [secondAmount, secondTokenSelected])

    const handleTxError = () => {
        setSendingTx(false)
        setCookie("latestMessage", config.tx.error)
    }

    const handleTxSuccess = (tx) => {
        setCookie("latestMessage", {
            text: `Transaction (${tx.hash}) complete!`,
            kind: "success",
        })
    }

    return (
        <div
            className={`${
                isVisible ? "display-block" : "hidden"
            } fixed w-full top-0 left-0 h-full bg-black/70`}
        >
            <div className="flex flex-col space-y-5 w-[90%] sm:w-[80%] md:w-[70%] mt-40 bg-zinc-900 mx-auto rounded-2xl">
                <div className="px-10 pt-5 flex flex-row w-full justify-between">
                    <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl text-slate-200">
                            Add New Position
                        </h1>
                    </div>
                    <div>
                        <button onClick={hide}>
                            <div className="text-xl sm:text-2xl md:text-3xl text-slate-200 hover:text-gray-500 transition">
                                <IoIosCloseCircleOutline />
                            </div>
                        </button>
                    </div>
                </div>
                <div className="px-10 pb-10">
                    <hr className="border-1 border-gray-700 rounded-xl"></hr>
                </div>
                <div className="w-[250px] sm:w-[340px] md:w-[470px] lg:w-[550px] mx-auto border border-cyan-700 rounded-3xl px-8 py-8 bg-black/20 shadow-2xl">
                    <div className="space-y-4">
                        <div className="text-center md:text-left">
                            <h5 className="text-slate-200 text-base sm:text-lg md:text-xl font-bold">
                                Select Asset Pair
                            </h5>
                        </div>
                        <div className="flex flex-col md:flex-row items-center md:justify-between md:space-x-10 space-y-5 md:space-y-0">
                            <div>
                                <select
                                    name="xToken"
                                    id="xToken"
                                    className={`newPositionSelect`}
                                    onChange={(props) => {
                                        setFirstTokenSelected(props.target.value)
                                    }}
                                    defaultValue={firstTokenSelected}
                                >
                                    {firstTokens.map((token, index) => (
                                        <OptionSymbol address={token} key={index} />
                                    ))}
                                </select>
                            </div>
                            <div>
                                <select
                                    name="yToken"
                                    id="yToken"
                                    className={`newPositionSelect`}
                                    onChange={(props) => {
                                        setSecondTokenSelected(props.target.value)
                                    }}
                                    defaultValue={secondTokenSelected}
                                >
                                    {secondTokens.map((token, index) => (
                                        <OptionSymbol address={token} key={index} />
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 space-y-4">
                        <div className="text-center md:text-left">
                            <h5 className="text-slate-200 text-base sm:text-lg md:text-xl font-bold">
                                Your deposits
                            </h5>
                        </div>
                        <div className="flex flex-col space-y-5 px-0 sm:px-7 md:px-10">
                            <div className="flex mx-auto w-full">
                                <select
                                    className={`defaultInputSelect`}
                                    value={firstTokenSelected}
                                    disabled
                                >
                                    {firstTokens.map((token, index) => (
                                        <OptionSymbol address={token} key={index} />
                                    ))}
                                </select>
                                <input
                                    className={`defaultInput`}
                                    onChange={(props) => {
                                        setFirstAmount(props.target.value)
                                    }}
                                    placeholder={0}
                                    type="number"
                                    min="0"
                                    name="xTokenAmount"
                                    id="xTokenAmount"
                                    value={firstAmount}
                                ></input>
                            </div>
                            <div className="flex mx-auto w-full">
                                <select
                                    className={`defaultInputSelect`}
                                    value={secondTokenSelected}
                                    disabled
                                >
                                    {secondTokens.map((token, index) => (
                                        <OptionSymbol address={token} key={index} />
                                    ))}
                                </select>
                                <input
                                    className={`defaultInput`}
                                    onChange={(props) => {
                                        setSecondAmount(props.target.value)
                                    }}
                                    placeholder={0}
                                    type="number"
                                    min={0}
                                    name="yTokenAmount"
                                    id="yTokenAmount"
                                    value={secondAmount}
                                ></input>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-auto mx-auto pt-4 sm:pt-7 md:pt-10 pb-8 sm:pb-14 md:pb-20">
                    <div className="flex shadow-2xl">
                        <button
                            className={`popOutHover w-full px-10 bg-cyan-800 border border-cyan-800 rounded-xl
                            text-cyan-200 text-sm sm:text-base md:text-lg py-3 focus:border focus:border-cyan-600
                            hover:bg-cyan-600 hover:text-cyan-100 transition disabled:cursor-not-allowed 
                            disabled:hover:bg-cyan-800 disabled:hover:text-cyan-200`}
                            disabled={firstAmount == 0 || secondAmount == 0 || sendingTx}
                            onClick={async () => {
                                switch (currentLpKind) {
                                    case 0:
                                        setSendingTx(true)
                                        sendApproveY([currentLpAddress, yAmount], {
                                            onSuccess: async () => {
                                                try {
                                                    const tx = await nlpContract.call(
                                                        "provideLiquidity",
                                                        {
                                                            value: xAmount,
                                                        }
                                                    )
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
                                    case 1:
                                        setSendingTx(true)
                                        sendApproveX([currentLpAddress, xAmount], {
                                            onSuccess: () => {
                                                sendApproveY([currentLpAddress, yAmount], {
                                                    onSuccess: () => {
                                                        sendProvideLiquidityTLP(
                                                            [currentLpAddress, xAmount],
                                                            {
                                                                onSucess: (data) => {
                                                                    handleTxSuccess(data)
                                                                    window.location.reload()
                                                                },
                                                                onError: handleTxError,
                                                            }
                                                        )
                                                    },
                                                    onError: handleTxError,
                                                })
                                            },
                                            onError: handleTxError,
                                        })
                                        break
                                }
                            }}
                        >
                            {!sendingTx ? "Add Liquidity" : "Loading..."}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
