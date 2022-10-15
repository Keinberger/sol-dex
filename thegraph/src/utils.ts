import { Address } from "@graphprotocol/graph-ts"

export function getIdFromEventParams(providerAddress: Address, lpAddress: Address): string {
    return providerAddress.toHexString() + lpAddress.toHexString()
}
