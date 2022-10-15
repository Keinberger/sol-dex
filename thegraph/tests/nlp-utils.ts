import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { LiquidityAdded, LiquidityRemoved } from "../generated/templates/NLP/NativeLiquidityPool"

export function createLiquidityAddedEvent(
    liquidityProvider: Address,
    liquidityAmount: BigInt,
    nativeDeposit: BigInt,
    tokenDeposit: BigInt
): LiquidityAdded {
    let liquidityAddedEvent = changetype<LiquidityAdded>(newMockEvent())
    liquidityAddedEvent.parameters = new Array()

    liquidityAddedEvent.parameters.push(
        new ethereum.EventParam("liquidityProvider", ethereum.Value.fromAddress(liquidityProvider))
    )
    liquidityAddedEvent.parameters.push(
        new ethereum.EventParam(
            "liquidityAmount",
            ethereum.Value.fromUnsignedBigInt(liquidityAmount)
        )
    )
    liquidityAddedEvent.parameters.push(
        new ethereum.EventParam("nativeDeposit", ethereum.Value.fromUnsignedBigInt(nativeDeposit))
    )
    liquidityAddedEvent.parameters.push(
        new ethereum.EventParam("tokenDeposit", ethereum.Value.fromUnsignedBigInt(tokenDeposit))
    )

    return liquidityAddedEvent
}

export function createLiquidityRemovedEvent(
    liquidityProvider: Address,
    liquidityAmount: BigInt,
    nativeWithdrawn: BigInt,
    tokensWithdrawn: BigInt
): LiquidityRemoved {
    let liquidityRemovedEvent = changetype<LiquidityRemoved>(newMockEvent())
    liquidityRemovedEvent.parameters = new Array()

    liquidityRemovedEvent.parameters.push(
        new ethereum.EventParam("liquidityProvider", ethereum.Value.fromAddress(liquidityProvider))
    )
    liquidityRemovedEvent.parameters.push(
        new ethereum.EventParam(
            "liquidityAmount",
            ethereum.Value.fromUnsignedBigInt(liquidityAmount)
        )
    )
    liquidityRemovedEvent.parameters.push(
        new ethereum.EventParam(
            "nativeWithdrawn",
            ethereum.Value.fromUnsignedBigInt(nativeWithdrawn)
        )
    )
    liquidityRemovedEvent.parameters.push(
        new ethereum.EventParam(
            "tokensWithdrawn",
            ethereum.Value.fromUnsignedBigInt(tokensWithdrawn)
        )
    )

    return liquidityRemovedEvent
}
