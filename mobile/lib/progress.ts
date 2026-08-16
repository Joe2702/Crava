export const XP_PER_LEVEL = 120

/**
 * XP and streak are derived from level completions rather than stored.
 *
 * A stored counter would have to be client-writable on the free tier, which
 * means it could be set to anything. Completions cannot: security rules make
 * them create-only, require the level's drills to be done, and force
 * completedAt to the server clock. Deriving from them leaves nothing to forge.
 */
export function xpFrom(completionCount: number): number {
  return completionCount * XP_PER_LEVEL
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function addDays(key: string, delta: number): string {
  return dayKey(new Date(Date.parse(key) + delta * 86_400_000))
}

/**
 * Consecutive days ending today (or yesterday, so a streak isn't shown as
 * broken until a full day has been missed).
 */
export function streakFrom(completedAt: Date[], now = new Date()): number {
  if (completedAt.length === 0) return 0

  const days = new Set(completedAt.map(dayKey))
  const today = dayKey(now)
  const yesterday = addDays(today, -1)

  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : null
  if (!cursor) return 0

  let streak = 0
  while (days.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}
