import {
    assert,
    describe,
    test,
    clearStore,
    beforeAll,
    afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { LiquidityPool } from "../generated/schema"
import { NLP, TLP } from "../generated/templates"
import { LiquidityPoolActivated, LiquidityPoolAdded } from "../generated/DEX/DEX"
import {
    handleLiquidityPoolActivated,
    handleLiquidityPoolRemoved,
    handleLiquidityPoolAdded
} from "../src/dex"
import {
    createLiquidityPoolActivatedEvent,
    createLiquidityPoolRemovedEvent,
    createLiquidityPoolAddedEvent
} from "./dex-utils"

describe("liquidityPoolAdded", () => {
    const lpAddress = "0xc93edd423af2070da8d35221972402417ddd547d"
    beforeAll(() => {
        let newLPAddedEvent = createLiquidityPoolAddedEvent(Address.fromString(lpAddress), 0)
        handleLiquidityPoolAdded(newLPAddedEvent)
    })

    afterAll(() => {
        clearStore()
    })

    test("populates fields correctly", () => {
        const entityName = "LiquidityPool"
        assert.entityCount(entityName, 1)

        assert.fieldEquals(entityName, lpAddress, "address", lpAddress)
        assert.fieldEquals(entityName, lpAddress, "active", "true")
        assert.fieldEquals(entityName, lpAddress, "kind", "NLP")
    })
})

describe("liquidityPoolRemoved", () => {
    const lpAddress = "0xc93edd423af2070da8d35221972402417ddd547d"
    beforeAll(() => {
        let newLPAddedEvent = createLiquidityPoolAddedEvent(Address.fromString(lpAddress), 0)
        handleLiquidityPoolAdded(newLPAddedEvent)

        let lpRemovedEvent = createLiquidityPoolRemovedEvent(Address.fromString(lpAddress))
        handleLiquidityPoolRemoved(lpRemovedEvent)
    })

    afterAll(() => {
        clearStore()
    })

    test("sets active to false", () => {
        const entityName = "LiquidityPool"
        assert.fieldEquals(entityName, lpAddress, "active", "false")
    })
})

describe("liquidityPoolActivated", () => {
    const lpAddress = "0xc93edd423af2070da8d35221972402417ddd547d"
    beforeAll(() => {
        let newLPAddedEvent = createLiquidityPoolAddedEvent(Address.fromString(lpAddress), 0)
        handleLiquidityPoolAdded(newLPAddedEvent)

        let lpRemovedEvent = createLiquidityPoolRemovedEvent(Address.fromString(lpAddress))
        handleLiquidityPoolRemoved(lpRemovedEvent)

        let lpActivatedEvent = createLiquidityPoolActivatedEvent(Address.fromString(lpAddress))
        handleLiquidityPoolActivated(lpActivatedEvent)
    })

    afterAll(() => {
        clearStore()
    })

    test("sets active to true", () => {
        const entityName = "LiquidityPool"
        assert.fieldEquals(entityName, lpAddress, "active", "true")
    })
})
