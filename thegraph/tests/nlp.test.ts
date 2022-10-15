import {
    assert,
    describe,
    test,
    clearStore,
    beforeAll,
    afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { handleLiquidityAdded, handleLiquidityRemoved } from "../src/nlp"
import { createLiquidityAddedEvent, createLiquidityRemovedEvent } from "./nlp-utils"

// import { newMockEvent } from "matchstick-as"
// import { getIdFromEventParams } from "../src/utils"

import { logStore } from "matchstick-as/assembly/store"

describe("liquidityAdded", () => {
    const entityName = "LPPosition"
    const liquidityProviderAddress = "0xc93edd423af2070da8d35221972402417ddd547d"
    const liquidityAmount = 10
    const nativeDeposit = 10
    const tokensDeposit = 10
    const id =
        "0xc93edd423af2070da8d35221972402417ddd547d0xa16081f360e3847006db660bae1c6d1b2e17ec2a"

    beforeAll(() => {
        let liquidityAddedEvent = createLiquidityAddedEvent(
            Address.fromString(liquidityProviderAddress),
            BigInt.fromI64(liquidityAmount),
            BigInt.fromI64(nativeDeposit),
            BigInt.fromI64(tokensDeposit)
        )
        handleLiquidityAdded(liquidityAddedEvent)
    })

    afterAll(() => {
        clearStore()
    })

    test("populates fields correctly", () => {
        assert.entityCount(entityName, 1)

        logStore()

        assert.fieldEquals(entityName, id, "provider", liquidityProviderAddress)
        assert.fieldEquals(entityName, id, "liquidityAmount", liquidityAmount.toString())
        assert.fieldEquals(entityName, id, "xDeposit", nativeDeposit.toString())
        assert.fieldEquals(entityName, id, "yDeposit", tokensDeposit.toString())
        assert.fieldEquals(entityName, id, "xWithdrawn", "0")
        assert.fieldEquals(entityName, id, "yWithdrawn", "0")
        assert.fieldEquals(entityName, id, "closed", "false")
    })
    test("adds liquidity if already existant to liquidity position", () => {
        let secLiquidityAddedEvent = createLiquidityAddedEvent(
            Address.fromString(liquidityProviderAddress),
            BigInt.fromI64(liquidityAmount),
            BigInt.fromI64(nativeDeposit),
            BigInt.fromI64(tokensDeposit)
        )
        handleLiquidityAdded(secLiquidityAddedEvent)

        assert.entityCount(entityName, 1)

        assert.fieldEquals(entityName, id, "liquidityAmount", (liquidityAmount * 2).toString())
        assert.fieldEquals(entityName, id, "xDeposit", (nativeDeposit * 2).toString())
        assert.fieldEquals(entityName, id, "yDeposit", (tokensDeposit * 2).toString())
    })
})

describe("liquidityRemoved", () => {
    const entityName = "LPPosition"
    const liquidityProviderAddress = "0xc93edd423af2070da8d35221972402417ddd547d"
    const liquidityAmountAdded = 10
    const nativeDeposit = 10
    const tokensDeposit = 10
    const liquidityRemoved = 5
    const nativeWithdrawn = 5
    const tokensWithdrawn = 5
    const id =
        "0xc93edd423af2070da8d35221972402417ddd547d0xa16081f360e3847006db660bae1c6d1b2e17ec2a"

    beforeAll(() => {
        let liquidityAddedEvent = createLiquidityAddedEvent(
            Address.fromString(liquidityProviderAddress),
            BigInt.fromI64(liquidityAmountAdded),
            BigInt.fromI64(nativeDeposit),
            BigInt.fromI64(tokensDeposit)
        )
        handleLiquidityAdded(liquidityAddedEvent)

        let liquidityRemovedEvent = createLiquidityRemovedEvent(
            Address.fromString(liquidityProviderAddress),
            BigInt.fromI64(liquidityRemoved),
            BigInt.fromI64(nativeWithdrawn),
            BigInt.fromI64(tokensWithdrawn)
        )
        handleLiquidityRemoved(liquidityRemovedEvent)
    })

    afterAll(() => {
        clearStore()
    })

    test("subtracts liquidity from existing position", () => {
        assert.entityCount(entityName, 1)

        assert.fieldEquals(
            entityName,
            id,
            "liquidityAmount",
            (liquidityAmountAdded - liquidityRemoved).toString()
        )
        assert.fieldEquals(entityName, id, "xWithdrawn", nativeWithdrawn.toString())
        assert.fieldEquals(entityName, id, "yWithdrawn", tokensWithdrawn.toString())
    })

    test("closes position if all liquidity withdrawn", () => {
        let secLiquidityRemovedEvent = createLiquidityRemovedEvent(
            Address.fromString(liquidityProviderAddress),
            BigInt.fromI64(liquidityRemoved),
            BigInt.fromI64(nativeWithdrawn),
            BigInt.fromI64(tokensWithdrawn)
        )
        handleLiquidityRemoved(secLiquidityRemovedEvent)

        assert.entityCount(entityName, 1)
        assert.fieldEquals(entityName, id, "closed", "true")
    })
})
