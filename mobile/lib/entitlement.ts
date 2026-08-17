import type { UserDoc } from './types'

/** Lesson 1 of every course is a free preview. */
export const FREE_LESSON_IDX = 1

export type Entitlement = UserDoc['entitlement']

/**
 * Access to a course comes from owning it. Courses are bought one at a time —
 * that is the product — and the all-access subscription is a second, optional
 * way in rather than the only one.
 *
 * Neither is client-writable. Purchases are written by verified store receipts
 * and the rules refuse any write from an app, which is what stops someone
 * granting themselves a course they did not buy.
 */
export function ownsCourse(courseId: string, ownedCourseIds: ReadonlySet<string>): boolean {
  return ownedCourseIds.has(courseId)
}

export function hasAllAccess(entitlement: Entitlement, now = Date.now()): boolean {
  if (!entitlement) return false
  if (entitlement.status !== 'active' && entitlement.status !== 'trialing' && entitlement.status !== 'grace') {
    return false
  }
  // A null expiry means a non-expiring grant (promo codes, comped accounts).
  return entitlement.expiresAt === null || entitlement.expiresAt > now
}

export function canOpenLesson(input: {
  lessonIdx: number
  courseId: string
  ownedCourseIds: ReadonlySet<string>
  entitlement: Entitlement
  now?: number
}): boolean {
  if (input.lessonIdx <= FREE_LESSON_IDX) return true
  if (ownsCourse(input.courseId, input.ownedCourseIds)) return true
  return hasAllAccess(input.entitlement, input.now ?? Date.now())
}
