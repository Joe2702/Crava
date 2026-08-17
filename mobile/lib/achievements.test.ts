import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { achievementsFrom } from './achievements.ts'

const NOW = new Date('2026-01-15T12:00:00Z')
const day = (offset: number) => new Date(NOW.getTime() - offset * 86_400_000)
const by = (list: ReturnType<typeof achievementsFrom>, id: string) => list.find((a) => a.id === id)!

test('nothing is earned from an empty history', () => {
  const all = achievementsFrom([], [], 6, NOW)
  assert.equal(all.some((a) => a.earned), false)
})

test('one completion earns the first badge and no more', () => {
  const all = achievementsFrom(['muscleup-1'], [day(0)], 6, NOW)
  assert.equal(by(all, 'first-level').earned, true)
  assert.equal(by(all, 'three-levels').earned, false)
})

test('partial progress is reported as a fraction', () => {
  const all = achievementsFrom(['muscleup-1', 'muscleup-2'], [day(1), day(0)], 6, NOW)
  assert.equal(by(all, 'three-levels').progress, 2 / 3)
})

test('finishing every level of one skill earns the mastery badge', () => {
  const ids = [1, 2, 3, 4, 5, 6].map((i) => `muscleup-${i}`)
  const all = achievementsFrom(ids, ids.map((_, i) => day(i)), 6, NOW)
  assert.equal(by(all, 'skill-complete').earned, true)
  assert.equal(by(all, 'all-skills').earned, false)
})

test('levels spread across skills do not add up to a mastered skill', () => {
  const ids = ['muscleup-1', 'muscleup-2', 'boxing-1', 'boxing-2', 'sprint-1', 'parkour-1']
  const all = achievementsFrom(ids, ids.map((_, i) => day(i)), 6, NOW)
  assert.equal(by(all, 'skill-complete').earned, false)
  assert.equal(by(all, 'ten-levels').earned, false)
})

test('a skill id containing a dash still resolves to one skill', () => {
  const ids = [1, 2, 3, 4, 5, 6].map((i) => `front-lever-${i}`)
  const all = achievementsFrom(ids, ids.map((_, i) => day(i)), 6, NOW)
  assert.equal(by(all, 'skill-complete').earned, true)
})

test('streak badges follow consecutive days', () => {
  const dates = [day(2), day(1), day(0)]
  const all = achievementsFrom(['a-1', 'a-2', 'a-3'], dates, 6, NOW)
  assert.equal(by(all, 'streak-3').earned, true)
  assert.equal(by(all, 'streak-7').earned, false)
})
