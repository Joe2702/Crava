import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { nextLessonIndex, progressOf } from './progress.ts'

test('an empty course is 0% rather than NaN', () => {
  const p = progressOf(0, 0)
  assert.equal(p.percent, 0)
  assert.equal(p.fraction, 0)
  assert.equal(p.isComplete, false)
})

test('percent floors, so 100% means finished', () => {
  // 249 of 250 is 99.6%, which must not round up to 100.
  assert.equal(progressOf(249, 250).percent, 99)
  assert.equal(progressOf(250, 250).percent, 100)
})

test('completion beyond the total is clamped', () => {
  const p = progressOf(9, 6)
  assert.equal(p.completed, 6)
  assert.equal(p.percent, 100)
  assert.equal(p.isComplete, true)
})

test('negative input cannot produce a negative bar', () => {
  assert.equal(progressOf(-3, 6).percent, 0)
  assert.equal(progressOf(3, -6).total, 0)
})

test('continue opens the first unfinished lesson', () => {
  const ids = ['a-1', 'a-2', 'a-3']
  assert.equal(nextLessonIndex(ids, new Set(['a-1'])), 1)
  assert.equal(nextLessonIndex(ids, new Set()), 0)
})

test('a gap in the middle is where continue goes, not the end', () => {
  const ids = ['a-1', 'a-2', 'a-3']
  assert.equal(nextLessonIndex(ids, new Set(['a-1', 'a-3'])), 1)
})

test('a finished course keeps continue on the last lesson', () => {
  const ids = ['a-1', 'a-2']
  assert.equal(nextLessonIndex(ids, new Set(ids)), 1)
})
