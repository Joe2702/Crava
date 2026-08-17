import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { canOpenLesson, hasAllAccess, ownsCourse, type Entitlement } from './entitlement.ts'

const NOW = Date.UTC(2026, 0, 15)
const sub = (over: Partial<NonNullable<Entitlement>> = {}): Entitlement => ({
  productId: 'all_access_monthly',
  status: 'active',
  source: 'android',
  expiresAt: NOW + 86_400_000,
  ...over,
})
const owned = (...ids: string[]) => new Set(ids)

const open = (lessonIdx: number, courseId: string, ownedIds: Set<string>, entitlement: Entitlement) =>
  canOpenLesson({ lessonIdx, courseId, ownedCourseIds: ownedIds, entitlement, now: NOW })

test('lesson 1 previews free without owning anything', () => {
  assert.equal(open(1, 'boxing', owned(), null), true)
})

test('later lessons need the course to be bought', () => {
  assert.equal(open(2, 'boxing', owned(), null), false)
  assert.equal(open(2, 'boxing', owned('boxing'), null), true)
})

test('owning one course does not open another', () => {
  assert.equal(ownsCourse('boxing', owned('parkour')), false)
  assert.equal(open(3, 'boxing', owned('parkour'), null), false)
})

test('all-access opens a course that was never bought', () => {
  assert.equal(open(4, 'boxing', owned(), sub()), true)
})

test('an expired subscription does not open a course', () => {
  assert.equal(open(4, 'boxing', owned(), sub({ expiresAt: NOW - 1 })), false)
})

test('a bought course survives the subscription lapsing', () => {
  // Buying is permanent; it must not depend on a subscription still running.
  assert.equal(open(4, 'boxing', owned('boxing'), sub({ status: 'expired' })), true)
})

test('trialing and grace both count as all-access', () => {
  for (const status of ['trialing', 'grace'] as const) {
    assert.equal(hasAllAccess(sub({ status }), NOW), true, status)
  }
})

test('cancelled does not', () => {
  assert.equal(hasAllAccess(sub({ status: 'cancelled' }), NOW), false)
})
