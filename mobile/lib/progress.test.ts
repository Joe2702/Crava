import { test } from 'node:test'
import assert from 'node:assert/strict'
import { streakFrom, xpFrom } from './progress.ts'

const day = (iso: string) => new Date(`${iso}T12:00:00Z`)
const NOW = day('2026-03-10')

test('xp is a flat multiple of completions', () => {
  assert.equal(xpFrom(0), 0)
  assert.equal(xpFrom(3), 360)
})

test('no completions means no streak', () => {
  assert.equal(streakFrom([], NOW), 0)
})

test('counts consecutive days ending today', () => {
  assert.equal(streakFrom([day('2026-03-08'), day('2026-03-09'), day('2026-03-10')], NOW), 3)
})

test('a gap ends the streak', () => {
  assert.equal(streakFrom([day('2026-03-06'), day('2026-03-09'), day('2026-03-10')], NOW), 2)
})

test('yesterday still counts so a streak is not lost mid-day', () => {
  assert.equal(streakFrom([day('2026-03-08'), day('2026-03-09')], NOW), 2)
})

test('older than yesterday is a broken streak', () => {
  assert.equal(streakFrom([day('2026-03-07'), day('2026-03-08')], NOW), 0)
})

test('several completions on one day count once', () => {
  assert.equal(streakFrom([day('2026-03-10'), day('2026-03-10'), day('2026-03-09')], NOW), 2)
})
