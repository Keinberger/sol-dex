export default function TokensListing({
    header,
    firstAmount,
    secondAmount,
    firstTokenSymbol,
    secondTokenSymbol,
}) {
    return (
        <div className="border border-zinc-800 rounded-xl py-3 space-y-1 w-auto px-5 md:px-0 md:w-[44%] mx-auto md:mx-0">
            <div className="text-center">
                <h5 className="text-zinc-600 text-xs sm:text-sm md:text-base">{header}</h5>
            </div>
            <div className="text-center">
                <p className="font-mono text-slate-300 text-sm sm:text-base md:text-lg">
                    {firstAmount ? firstAmount : "0.0"}{" "}
                    <span className="text-slate-400">{firstTokenSymbol}</span>
                </p>
                <p className="font-mono text-slate-300 text-sm sm:text-base md:text-lg">
                    {secondAmount ? secondAmount : "0.0"}{" "}
                    <span className="text-slate-400">{secondTokenSymbol}</span>
                </p>
            </div>
        </div>
    )
}
