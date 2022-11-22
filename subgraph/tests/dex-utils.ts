import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
    LiquidityPoolActivated,
    LiquidityPoolAdded,
    LiquidityPoolRemoved
} from "../generated/DEX/DEX"

export function createLiquidityPoolActivatedEvent(
    liquidityPoolAddress: Address
): LiquidityPoolActivated {
    let liquidityPoolActivatedEvent = changetype<LiquidityPoolActivated>(newMockEvent())

    liquidityPoolActivatedEvent.parameters = new Array()

    liquidityPoolActivatedEvent.parameters.push(
        new ethereum.EventParam(
            "liquidityPoolAddress",
            ethereum.Value.fromAddress(liquidityPoolAddress)
        )
    )

    return liquidityPoolActivatedEvent
}

export function createLiquidityPoolAddedEvent(
    liquidityPoolAddress: Address,
    liquidityPoolKind: i32
): LiquidityPoolAdded {
    let liquidityPoolAddedEvent = changetype<LiquidityPoolAdded>(newMockEvent())

    liquidityPoolAddedEvent.parameters = new Array()

    liquidityPoolAddedEvent.parameters.push(
        new ethereum.EventParam(
            "liquidityPoolAddress",
            ethereum.Value.fromAddress(liquidityPoolAddress)
        )
    )
    liquidityPoolAddedEvent.parameters.push(
        new ethereum.EventParam(
            "liquidityPoolKind",
            ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(liquidityPoolKind))
        )
    )

    return liquidityPoolAddedEvent
}

export function createLiquidityPoolRemovedEvent(
    liquidityPoolAddress: Address
): LiquidityPoolRemoved {
    let liquidityPoolRemovedEvent = changetype<LiquidityPoolRemoved>(newMockEvent())

    liquidityPoolRemovedEvent.parameters = new Array()

    liquidityPoolRemovedEvent.parameters.push(
        new ethereum.EventParam(
            "liquidityPoolAddress",
            ethereum.Value.fromAddress(liquidityPoolAddress)
        )
    )

    return liquidityPoolRemovedEvent
}
