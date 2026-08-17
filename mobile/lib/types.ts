/**
 * The product calls these Courses and Lessons; Firestore still stores them in
 * `skills`, `levels` and `drills`. Renaming the collections would orphan every
 * completion already recorded against a level id, which is not worth it for a
 * vocabulary change — so the mapping is stated here and kept in one place.
 */
export interface Course {
  id: string
  name_en: string
  name_ar: string
  category_en: string
  category_ar: string
  coach_name_en: string
  coach_name_ar: string
  sortOrder: number
  isPublished: boolean
  /** Denormalised by the seed so a progress bar needs no extra read. */
  lessonCount?: number
}

export interface Lesson {
  id: string
  /** Storage field name; this is the course id. */
  skillId: string
  idx: number
  name_en: string
  name_ar: string
  /** Whether a video exists. The playback id itself lives in levelVideos,
   *  which no client can read; the URL is minted by getPlaybackUrl. */
  hasVideo: boolean
  durationS: number | null
  isPublished: boolean
}

/** A step inside a lesson: watch, warm up, practise. */
export interface Step {
  id: string
  /** Storage field name; this is the lesson id. */
  levelId: string
  idx: number
  name_en: string
  name_ar: string
  meta_en: string
  meta_ar: string
  isRequired: boolean
}

/**
 * One document per user — profile only. XP and streak are derived from
 * levelCompletions rather than stored, so there is no counter a client could
 * tamper with.
 */
export interface UserDoc {
  displayName: string | null
  locale: 'en' | 'ar'
  city: string | null
  notifEnabled: boolean
  onboardedAt: number | null
  /** Study sessions per week the learner committed to. Drives reminders. */
  weeklyGoal: number | null
  createdAt: number
  entitlement: {
    productId: string
    status: 'active' | 'trialing' | 'expired' | 'cancelled' | 'grace'
    source: 'ios' | 'android' | 'web' | 'promo'
    expiresAt: number | null
  } | null
}

export type { Course as Skill, Lesson as Level, Step as Drill }
