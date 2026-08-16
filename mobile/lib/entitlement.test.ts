import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { canOpenLevel, isSubscribed, type Entitlement } from './entitlement.ts'

const NOW = Date.UTC(2026, 0, 15)
const ent = (over: Partial<NonNullable<Entitlement>>): Entitlement => ({
  productId: 'pro_monthly',
  status: 'active',
  source: 'android',
  expiresAt: NOW + 86_400_000,
  ...over,
})

test('no entitlement is not subscribed', () => {
  assert.equal(isSubscribed(null, NOW), false)
})

test('active and trialing and grace all count as subscribed', () => {
  for (const status of ['active', 'trialing', 'grace'] as const) {
    assert.equal(isSubscribed(ent({ status }), NOW), true, status)
  }
})

test('expired and cancelled do not count', () => {
  for (const status of ['expired', 'cancelled'] as const) {
    assert.equal(isSubscribed(ent({ status }), NOW), false, status)
  }
})

test('an active status that has run past its expiry is not subscribed', () => {
  assert.equal(isSubscribed(ent({ expiresAt: NOW - 1 }), NOW), false)
})

test('a null expiry never expires, for promos and comped accounts', () => {
  assert.equal(isSubscribed(ent({ expiresAt: null }), NOW), true)
})

test('level 1 is free without any entitlement', () => {
  assert.equal(canOpenLevel(1, null, NOW), true)
})

test('levels past the first need a subscription', () => {
  assert.equal(canOpenLevel(2, null, NOW), false)
  assert.equal(canOpenLevel(6, ent({}), NOW), true)
})
