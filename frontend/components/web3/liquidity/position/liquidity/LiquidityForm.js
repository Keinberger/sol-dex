import { useState, useEffect } from "react"
import { trimNumber } from "../../../../../helpers/helpers"

export default function LiquidityForm({
    header,
    isVisible,
    position,
    conversionRate,
    firstAmountMax,
    secondAmountMax,
    functionToExecute,
    firstAmount,
    setFirstAmount,
    secondAmount,
    setSecondAmount,
    sendingTx,
}) {
    const [changedAmount, setChangedAmount] = useState(false)

    useEffect(() => {
        if (changedAmount) {
            setChangedAmount(false)
            return
        }
        if (firstAmount == 0 || firstAmount == "") {
            setSecondAmount("0")
            setChangedAmount(true)
            return
        }

        const secondAmount = String(firstAmount * conversionRate)
        const setAmount = trimNumber(secondAmount, 5)

        setChangedAmount(true)

        if (Number(setAmount) < 0) {
            setSecondAmount(0)
            setFirstAmount(0)
            return
        }

        if (Number(setAmount) > Number(secondAmountMax)) {
            setSecondAmount(secondAmountMax)
            setFirstAmount(firstAmountMax)
            return
        }

        setSecondAmount(setAmount)
    }, [firstAmount])

    useEffect(() => {
        if (changedAmount) {
            setChangedAmount(false)
            return
        }
        if (secondAmount == 0 || secondAmount == "") {
            setFirstAmount("0")
            setChangedAmount(true)
            return
        }

        const firstAmount = String(secondAmount * conversionRate)
        const setAmount = trimNumber(firstAmount, 5)

        setChangedAmount(true)

        if (Number(setAmount) < 0) {
            setFirstAmount(0)
            setSecondAmount(0)
            return
        }

        if (Number(setAmount) > Number(firstAmountMax)) {
            setFirstAmount(firstAmountMax)
            setSecondAmount(secondAmountMax)
            return
        }

        setFirstAmount(setAmount)
    }, [secondAmount])

    return (
        <div
            className={`px-7 flex flex-col space-y-4 ${
                isVisible ? "display-block" : "hidden"
            } transition-all`}
        >
            <div>
                <h4 className="text-slate-200 text-base sm:text-lg md:text-xl">{header}</h4>
            </div>
            <div className="flex flex-col space-y-5 px-0 md:px-10">
                <div className="flex mx-auto w-full">
                    <select className={`defaultInputSelect`} defaultValue={0} disabled>
                        <option>{position.xSymbol}</option>
                    </select>
                    <input
                        className={`defaultInput`}
                        onChange={(props) => {
                            setFirstAmount(props.target.value)
                        }}
                        placeholder={0}
                        type="number"
                        name="xTokenAmount"
                        id="xTokenAmount"
                        value={firstAmount}
                    ></input>
                </div>
                <div className="flex mx-auto w-full">
                    <select className={`defaultInputSelect`} defaultValue={0} disabled>
                        <option>{position.ySymbol}</option>
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
            <div className="w-auto mx-auto pt-2 pb-10">
                <div className="flex shadow-2xl">
                    <button
                        className={`popOutHover w-full px-8 bg-cyan-800 border border-cyan-800 rounded-xl
                        text-cyan-200 text-xs sm:text-sm md:text-base py-2 focus:border focus:border-cyan-600
                        hover:bg-cyan-600 hover:text-cyan-100 transition disabled:cursor-not-allowed
                        disabled:hover:bg-cyan-800 disabled:hover:text-cyan-200`}
                        disabled={firstAmount == 0 || secondAmount == 0 || sendingTx}
                        onClick={() => {
                            functionToExecute()
                        }}
                    >
                        {!sendingTx ? header : "Loading..."}
                    </button>
                </div>
            </div>
        </div>
    )
}
