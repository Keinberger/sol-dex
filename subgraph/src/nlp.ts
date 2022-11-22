import { BigInt } from "@graphprotocol/graph-ts"
import {
    NativeLiquidityPool,
    LiquidityAdded as LiquidityAddedEvent,
    LiquidityRemoved as LiquidityRemovedEvent
} from "../generated/templates/NLP/NativeLiquidityPool"

import { LPPosition } from "../generated/schema"

import { getIdFromEventParams } from "./utils"

export function handleLiquidityAdded(event: LiquidityAddedEvent): void {
    const id = getIdFromEventParams(event.params.liquidityProvider, event.transaction.to!)
    let lpPosition = LPPosition.load(id)
    if (!lpPosition) {
        lpPosition = new LPPosition(id)

        lpPosition.provider = event.params.liquidityProvider
        lpPosition.lpAddress = event.transaction.to!
        lpPosition.liquidityAmount = new BigInt(0)
        lpPosition.xDeposit = new BigInt(0)
        lpPosition.yDeposit = new BigInt(0)
        lpPosition.xWithdrawn = new BigInt(0)
        lpPosition.yWithdrawn = new BigInt(0)
    }

    lpPosition.closed = false
    lpPosition.liquidityAmount = lpPosition.liquidityAmount.plus(event.params.liquidityAmount)
    lpPosition.xDeposit = lpPosition.xDeposit.plus(event.params.nativeDeposit)
    lpPosition.yDeposit = lpPosition.yDeposit.plus(event.params.tokenDeposit)

    lpPosition.save()
}

export function handleLiquidityRemoved(event: LiquidityRemovedEvent): void {
    let lpPosition = LPPosition.load(
        getIdFromEventParams(event.params.liquidityProvider, event.transaction.to!)
    )

    lpPosition!.liquidityAmount = lpPosition!.liquidityAmount.minus(event.params.liquidityAmount)
    lpPosition!.xWithdrawn = lpPosition!.xWithdrawn.plus(event.params.nativeWithdrawn)
    lpPosition!.yWithdrawn = lpPosition!.yWithdrawn.plus(event.params.tokensWithdrawn)

    if (lpPosition!.liquidityAmount.isZero()) lpPosition!.closed = true

    lpPosition!.save()
}
