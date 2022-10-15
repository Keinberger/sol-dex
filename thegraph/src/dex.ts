import {
    DEX,
    LiquidityPoolAdded as LiquidityPoolAddedEvent,
    LiquidityPoolRemoved as LiquidityPoolRemovedEvent,
    LiquidityPoolActivated as LiquidityPoolActivatedEvent
} from "../generated/DEX/DEX"

import { NLP, TLP } from "../generated/templates"
import { LiquidityPool } from "../generated/schema"

export function handleLiquidityPoolAdded(event: LiquidityPoolAddedEvent): void {
    const id = event.params.liquidityPoolAddress
    let lp = LiquidityPool.load(id)
    if (!lp) {
        lp = new LiquidityPool(id)
    }

    lp.address = event.params.liquidityPoolAddress
    lp.active = true

    const kind = event.params.liquidityPoolKind
    switch (kind) {
        case 0:
            NLP.create(event.params.liquidityPoolAddress)
            lp.kind = "NLP"
            break
        case 1:
            TLP.create(event.params.liquidityPoolAddress)
            lp.kind = "TLP"
            break
    }

    lp.save()
}

export function handleLiquidityPoolActivated(event: LiquidityPoolActivatedEvent): void {
    let lp = LiquidityPool.load(event.params.liquidityPoolAddress)
    lp!.active = true
    lp!.save()
}

export function handleLiquidityPoolRemoved(event: LiquidityPoolRemovedEvent): void {
    let lp = LiquidityPool.load(event.params.liquidityPoolAddress)
    lp!.active = false
    lp!.save()
}
