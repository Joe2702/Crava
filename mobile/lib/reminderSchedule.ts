/**
 * Which weekdays to remind on for a given sessions-per-week goal. Weekday
 * numbers follow expo-notifications: 1 is Sunday.
 *
 * Kept free of any React Native import so it stays directly testable under
 * node — the scheduling side that talks to the OS lives in reminders.ts.
 */
export function weekdaysForGoal(goal: number | null): number[] {
  switch (goal) {
    case 2:
      return [2, 5] // Mon, Thu
    case 6:
      return [1, 2, 3, 4, 6, 7] // every day but Friday
    case 4:
    default:
      return [1, 3, 5, 7] // Sun, Tue, Thu, Sat
  }
}
