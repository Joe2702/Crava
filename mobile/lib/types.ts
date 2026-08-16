export interface Skill {
  id: string
  name_en: string
  name_ar: string
  category_en: string
  category_ar: string
  coach_name_en: string
  coach_name_ar: string
  sortOrder: number
  isPublished: boolean
}

export interface Level {
  id: string
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

export interface Drill {
  id: string
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
  createdAt: number
  entitlement: {
    productId: string
    status: 'active' | 'trialing' | 'expired' | 'cancelled' | 'grace'
    source: 'ios' | 'android' | 'web' | 'promo'
    expiresAt: number | null
  } | null
}
