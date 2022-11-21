import { useState } from "react"
import { useAddress } from "@thirdweb-dev/react"

import NewPosition from "./NewPosition"
import Position from "./Position"

export default function LiquidityBox({ processedPositions, tokenMapping }) {
    const userAddress = useAddress()
    const isWeb3Enabled = userAddress !== undefined
    const [newPositionVisibility, setNewPositionVisibility] = useState(false)
    const showNewPosition = () => setNewPositionVisibility(true)
    const hideNewPosition = () => setNewPositionVisibility(false)

    return (
        <section name="Liquidity">
            <div className="w-full h-full">
                <div className="flex mt-32">
                    <div
                        className={`mx-auto w-[300px] sm:w-[450px] md:w-[550px]
                        lg:w-[750px] rounded-2xl drop-shadow-xl bg-black`}
                    >
                        <div className="px-7 py-5 flex flex-row justify-between">
                            <div>
                                <h1 className="text-slate-200 text-base sm:text-lg md:text-xl">
                                    Your <span className="hidden sm:contents">Liquidity Pool</span>{" "}
                                    Positions{" "}
                                    <span className="text-slate-400">
                                        ({processedPositions.length})
                                    </span>
                                </h1>
                            </div>
                            <div>
                                <button
                                    onClick={showNewPosition}
                                    className={`popOutHover bg-emerald-700 border border-emerald-700 rounded-lg
                                  text-slate-200 text-xs sm:text-sm md:text-base py-1 px-2 focus:border focus:border-emerald-600
                                   hover:bg-emerald-600 transition disabled:cursor-not-allowed 
                                   disabled:hover:bg-emerald-700`}
                                    disabled={!isWeb3Enabled}
                                >
                                    Add position
                                </button>
                            </div>
                        </div>
                        {processedPositions.length > 0 ? (
                            processedPositions.map((position, index) => (
                                <Position lpPosition={position} key={index} />
                            ))
                        ) : (
                            <div
                                className={`mx-auto w-[230px] sm:w-[250px] md:w-[450px]
                            lg:w-[550px] rounded-xl drop-shadow-xl bg-zinc-900 my-10`}
                            >
                                <div className="flex py-8 sm:py-16">
                                    <h3 className="text-zinc-500 text-center mx-10 md:mx-auto text-base md:text-lg">
                                        Any active positions will appear here
                                    </h3>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="w-full h-full">
                {isWeb3Enabled && (
                    <NewPosition
                        isVisible={newPositionVisibility}
                        hide={hideNewPosition}
                        tokenMapping={tokenMapping}
                        currentPositions={processedPositions}
                    />
                )}
            </div>
        </section>
    )
}
