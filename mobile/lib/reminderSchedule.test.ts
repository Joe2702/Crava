import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { weekdaysForGoal } from './reminderSchedule.ts'

test('each goal schedules that many days', () => {
  assert.equal(weekdaysForGoal(2).length, 2)
  assert.equal(weekdaysForGoal(4).length, 4)
  assert.equal(weekdaysForGoal(6).length, 6)
})

test('an unset goal falls back to the recommended four days', () => {
  assert.deepEqual(weekdaysForGoal(null), weekdaysForGoal(4))
})

test('weekdays stay inside the 1-7 range expo-notifications expects', () => {
  for (const goal of [2, 4, 6, null]) {
    for (const d of weekdaysForGoal(goal)) {
      assert.ok(d >= 1 && d <= 7, `${goal} produced weekday ${d}`)
    }
  }
})

test('no day is scheduled twice for one goal', () => {
  for (const goal of [2, 4, 6]) {
    const days = weekdaysForGoal(goal)
    assert.equal(new Set(days).size, days.length, `goal ${goal} repeats a day`)
  }
})
