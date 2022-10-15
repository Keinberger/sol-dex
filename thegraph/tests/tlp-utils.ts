import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import { LiquidityAdded, LiquidityRemoved } from "../generated/templates/TLP/TokenLiquidityPool"

export function createLiquidityAddedEvent(
    liquidityProvider: Address,
    liquidityAmount: BigInt,
    xDeposit: BigInt,
    yDeposit: BigInt
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
        new ethereum.EventParam("xDeposit", ethereum.Value.fromUnsignedBigInt(xDeposit))
    )
    liquidityAddedEvent.parameters.push(
        new ethereum.EventParam("yDeposit", ethereum.Value.fromUnsignedBigInt(yDeposit))
    )

    return liquidityAddedEvent
}

export function createLiquidityRemovedEvent(
    liquidityProvider: Address,
    liquidityAmount: BigInt,
    xWithdrawn: BigInt,
    yWithdrawn: BigInt
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
        new ethereum.EventParam("xWithdrawn", ethereum.Value.fromUnsignedBigInt(xWithdrawn))
    )
    liquidityRemovedEvent.parameters.push(
        new ethereum.EventParam("yWithdrawn", ethereum.Value.fromUnsignedBigInt(yWithdrawn))
    )

    return liquidityRemovedEvent
}
