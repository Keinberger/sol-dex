import { useEffect, useState } from "react"
import { FiChevronDown, FiChevronUp } from "react-icons/fi"
import { ethers } from "ethers"

import AddLiquidity from "./position/AddLiquidity"
import WithdrawLiquidity from "./position/WithdrawLiquidity"
import TokensListing from "./position/TokensListing"

import {
    useRetrieveToken,
    useRetrieveEligibleNative,
    useRetrieveEligibleTokens,
    useRetrieveTokenAmountForDeposit,
} from "../../../hooks/nlp.js"
import {
    useRetrieveXToken,
    useRetrieveYToken,
    useRetrieveEligibleX,
    useRetrieveEligibleY,
    useRetrieveYAmountForDeposit,
} from "../../../hooks/tlp.js"

import Symbol from "../Symbol"
import config from "../../../constants/config"

import { trimNumber } from "../../../helpers/helpers"

export default function Position({ lpPosition }) {
    const [isBig, setIsBig] = useState(false)
    const setBig = () => setIsBig(true)
    const setSmall = () => setIsBig(false)

    const [addLiquidityVisibility, setAddLiquidityVisibility] = useState(false)
    const showAddLiquidity = () => setAddLiquidityVisibility(true)
    const hideAddLiquidity = () => setAddLiquidityVisibility(false)

    const [withdrawVisibility, setWithdrawVisibility] = useState(false)
    const showWithdraw = () => setWithdrawVisibility(true)
    const hideWithdraw = () => setWithdrawVisibility(false)

    const [initialized, setInitialized] = useState(false)
    const [currentXDeposit, setCurrentXDeposit] = useState("1")
    const [currentYDeposit, setCurrentYDeposit] = useState("1")

    const oneEther = ethers.utils.parseEther("1")
    let position = {}
    switch (lpPosition.lpKind) {
        case 0:
            const tokenAddress = useRetrieveToken(lpPosition.lpAddress)
            const nativeEligible = useRetrieveEligibleNative(
                lpPosition.lpAddress,
                lpPosition.liquidityAmount
            )
            const tokensEligible = useRetrieveEligibleTokens(
                lpPosition.lpAddress,
                lpPosition.liquidityAmount
            )
            const tokenAmountForDeposit = useRetrieveTokenAmountForDeposit(
                lpPosition.lpAddress,
                oneEther
            )
            const formattedTokensAmount =
                tokenAmountForDeposit != null
                    ? ethers.utils.formatEther(tokenAmountForDeposit)
                    : "1"

            position = {
                ...lpPosition,
                tokenAddress,
                xEligible: nativeEligible ? nativeEligible : "0",
                yEligible: tokensEligible ? tokensEligible : "0",
                yAmountForDepositOfOne: formattedTokensAmount,
            }
            break
        case 1:
            const xTokenAddress = useRetrieveXToken(lpPosition.lpAddress)
            const yTokenAddress = useRetrieveYToken(lpPosition.lpAddress)
            const xEligible = useRetrieveEligibleX(lpPosition.lpAddress, lpPosition.liquidityAmount)
            const yEligible = useRetrieveEligibleY(lpPosition.lpAddress, lpPosition.liquidityAmount)
            const yAmountForDeposit = useRetrieveYAmountForDeposit(lpPosition.lpAddress, oneEther)

            const formattedYAmount =
                yAmountForDeposit != null ? ethers.utils.formatEther(yAmountForDeposit) : "1"

            position = {
                ...lpPosition,
                xTokenAddress,
                yTokenAddress,
                xEligible,
                yEligible,
                yAmountForDepositOfOne: formattedYAmount,
            }
            break
    }

    useEffect(() => {
        let notFinished = false
        switch (lpPosition.lpKind) {
            case 0:
                if (position.tokenAddress == null) notFinished = true
                break
            case 1:
                if (position.xTokenAddress == null || position.yTokenAddress == null)
                    notFinished = true
                break
        }
        if (!notFinished) {
            setCurrentXDeposit((position.xDeposit - position.xWithdrawn).toString())
            setCurrentYDeposit((position.yDeposit - position.yWithdrawn).toString())
            setInitialized(true)
        }
    }, [position])

    const rawROIX = (
        (ethers.utils.formatEther(position.xEligible ? position.xEligible : "1") /
            ethers.utils.formatEther(currentXDeposit) -
            1) *
        100
    ).toString()
    const rawROIY = (
        (ethers.utils.formatEther(position.yEligible ? position.yEligible : "1") /
            ethers.utils.formatEther(currentYDeposit) -
            1) *
        100
    ).toString()
    const ROI = trimNumber(String(Number(rawROIX) + Number(rawROIY)), 3)

    position.xSymbol =
        initialized && position.lpKind == "0" ? (
            config.nativeCurrencySymbol
        ) : (
            <Symbol address={position.xTokenAddress} />
        )
    position.ySymbol =
        initialized && position.lpKind == "0" ? (
            <Symbol address={position.tokenAddress} />
        ) : (
            <Symbol address={position.yTokenAddress} />
        )

    return (
        <section name="position">
            {initialized && (
                <div
                    className={`mx-auto w-[230px] sm:w-[330px] md:w-[450px]
                    lg:w-[550px] rounded-xl drop-shadow-xl bg-zinc-900 my-10`}
                >
                    <div className="py-5 px-5 sm:px-7 flex flex-row justify-between">
                        <div className="flex flex-col md:flex-row items-center md:space-x-4">
                            <h3 className="text-slate-200 text-base sm:text-lg md:text-xl">
                                {position.xSymbol} / {position.ySymbol}
                            </h3>
                            <p
                                className={`${
                                    ROI >= 0 ? "text-emerald-600" : "text-red-400"
                                } text-xs sm:text-sm md:text-base font-mono text-center animate-pulse`}
                            >
                                {ROI >= 0 ? "+" + ROI : ROI}%
                            </p>
                        </div>

                        <div className={!isBig ? "my-auto" : "my-auto"}>
                            <button
                                className={`${
                                    isBig
                                        ? `focus:border-pink-600 hover:bg-pink-600 border-pink-500`
                                        : `focus:border-emerald-700 hover:bg-emerald-700 border-emerald-600`
                                } bg-zinc-900 border rounded-lg text-xl text-slate-200 py-1 px-2
                                focus:border transition disabled:cursor-not-allowed disabled:hover:bg-zinc-900`}
                                onClick={isBig ? setSmall : setBig}
                            >
                                {isBig ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                        </div>
                    </div>

                    {isBig && (
                        <div className="flex w-auto px-5 sm:px-7 pb-5">
                            <div className="space-y-4 md:space-x-4 md:space-y-0 flex flex-col md:flex-row mx-auto md:mx-0">
                                <button
                                    className={`positionManageButton bg-cyan-700 border-cyan-700 focus:border-cyan-800
                            hover:bg-cyan-800 `}
                                    onClick={
                                        addLiquidityVisibility
                                            ? hideAddLiquidity
                                            : () => {
                                                  showAddLiquidity()
                                                  hideWithdraw()
                                              }
                                    }
                                >
                                    {addLiquidityVisibility
                                        ? "Close Add Liquidity"
                                        : "Add Liquidity"}
                                </button>
                                <button
                                    className={`positionManageButton bg-cyan-800 border-cyan-800 focus:border-cyan-900
                            hover:bg-cyan-900`}
                                    onClick={
                                        withdrawVisibility
                                            ? hideWithdraw
                                            : () => {
                                                  showWithdraw()
                                                  hideAddLiquidity()
                                              }
                                    }
                                >
                                    {withdrawVisibility ? "Close Withdraw" : "Withdraw"}
                                </button>
                            </div>
                        </div>
                    )}

                    {isBig && (
                        <div className="w-[80%] flex flex-col md:flex-row space-y-4 md:space-y-0 md:justify-around mx-auto mt-4 pb-10">
                            <TokensListing
                                header={"Current Deposit"}
                                firstAmount={trimNumber(
                                    ethers.utils.formatEther(currentXDeposit),
                                    5
                                )}
                                secondAmount={trimNumber(
                                    ethers.utils.formatEther(
                                        String(position.yDeposit - position.yWithdrawn)
                                    ),
                                    5
                                )}
                                firstTokenSymbol={position.xSymbol}
                                secondTokenSymbol={position.ySymbol}
                            />
                            <TokensListing
                                header={"Eligible"}
                                firstAmount={trimNumber(
                                    ethers.utils.formatEther(position.xEligible),
                                    5
                                )}
                                secondAmount={trimNumber(
                                    ethers.utils.formatEther(position.yEligible),
                                    5
                                )}
                                firstTokenSymbol={position.xSymbol}
                                secondTokenSymbol={position.ySymbol}
                            />
                        </div>
                    )}

                    {isBig && (
                        <div>
                            <AddLiquidity
                                isVisible={addLiquidityVisibility}
                                position={position}
                                conversionRate={Number(position.yAmountForDepositOfOne)}
                            />
                            <WithdrawLiquidity
                                isVisible={withdrawVisibility}
                                position={position}
                                conversionRate={(
                                    position.yEligible / position.xEligible
                                ).toString()}
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
