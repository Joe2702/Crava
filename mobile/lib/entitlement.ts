import type { UserDoc } from './types'

/** Level 1 of every skill is free; the rest need an active subscription. */
export const FREE_LEVEL_IDX = 1

export type Entitlement = UserDoc['entitlement']

export function isSubscribed(entitlement: Entitlement, now = Date.now()): boolean {
  if (!entitlement) return false
  if (entitlement.status !== 'active' && entitlement.status !== 'trialing' && entitlement.status !== 'grace') {
    return false
  }
  // A null expiry means a non-expiring grant (promo codes, comped accounts).
  return entitlement.expiresAt === null || entitlement.expiresAt > now
}

export function canOpenLevel(levelIdx: number, entitlement: Entitlement, now = Date.now()): boolean {
  return levelIdx <= FREE_LEVEL_IDX || isSubscribed(entitlement, now)
}
