/**
 * Course progress, expressed the way a course platform expresses it: how much
 * of the curriculum is done.
 *
 * There is deliberately no XP and no streak. Both were points systems bolted
 * onto what is really a catalogue of courses, and both pushed the app towards
 * feeling like a workout tracker rather than somewhere you learn a skill.
 */

export interface CourseProgress {
  completed: number
  total: number
  /** 0..1. Zero when the course has no lessons, rather than NaN. */
  fraction: number
  percent: number
  isComplete: boolean
}

export function progressOf(completedLessons: number, totalLessons: number): CourseProgress {
  const total = Math.max(0, totalLessons)
  const completed = Math.min(Math.max(0, completedLessons), total)
  const fraction = total === 0 ? 0 : completed / total
  return {
    completed,
    total,
    fraction,
    // Floor, so a course is never shown as 100% until it actually is. Rounding
    // would report 100% at 99.6%, which reads as a bug to the person who can
    // still see an unfinished lesson.
    percent: total === 0 ? 0 : Math.floor(fraction * 100),
    isComplete: total > 0 && completed >= total,
  }
}

/** The lesson to open when someone taps Continue: the first unfinished one. */
export function nextLessonIndex(lessonIds: string[], completed: Set<string>): number {
  const idx = lessonIds.findIndex((id) => !completed.has(id))
  return idx === -1 ? lessonIds.length - 1 : idx
}
