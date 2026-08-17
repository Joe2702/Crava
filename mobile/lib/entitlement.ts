import type { UserDoc } from './types'

/** Lesson 1 of every course is free; the rest need an active subscription. */
export const FREE_LESSON_IDX = 1

export type Entitlement = UserDoc['entitlement']

export function isSubscribed(entitlement: Entitlement, now = Date.now()): boolean {
  if (!entitlement) return false
  if (entitlement.status !== 'active' && entitlement.status !== 'trialing' && entitlement.status !== 'grace') {
    return false
  }
  // A null expiry means a non-expiring grant (promo codes, comped accounts).
  return entitlement.expiresAt === null || entitlement.expiresAt > now
}

export function canOpenLesson(lessonIdx: number, entitlement: Entitlement, now = Date.now()): boolean {
  return lessonIdx <= FREE_LESSON_IDX || isSubscribed(entitlement, now)
}
