import { useState, useEffect } from "react"

import { useRetrieveLpKind } from "../../hooks/lp.js"
import LiquidityBox from "../web3/liquidity/LiquidityBox"

export default function Liquidity({ lpPositions, tokenMapping }) {
    const [initialized, setInitialized] = useState(false)

    let processedPositions = []
    for (let i = 0; i < lpPositions.length; i++) {
        const position = lpPositions[i]
        const lpKind = useRetrieveLpKind(position.lpAddress)
        processedPositions.push({ ...lpPositions[i], lpKind })
    }

    useEffect(() => {
        let notFinished = false
        for (let i = 0; i < processedPositions.length; i++) {
            const position = processedPositions[i]
            if (position.lpKind == null) {
                notFinished = true
                break
            }
        }
        if (!notFinished) {
            setInitialized(true)
        }
    }, [processedPositions])

    return (
        initialized && (
            <LiquidityBox processedPositions={processedPositions} tokenMapping={tokenMapping} />
        )
    )
}
