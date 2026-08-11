export type Lang = 'en' | 'ar'

export type ScreenId =
  | 'onboarding'
  | 'home'
  | 'tree'
  | 'lesson'
  | 'search'
  | 'coaches'
  | 'booking'
  | 'paywall'
  | 'community'
  | 'profile'

export interface Skill {
  id: string
  en: string
  ar: string
  catEn: string
  catAr: string
  coachEn: string
  coachAr: string
  levels: [string, string][]
}

export interface Coach {
  id: string
  en: string
  ar: string
  skill: string
  cityEn: string
  cityAr: string
  rating: string
  rate: number
}

export interface Slot {
  dayEn: string
  dayAr: string
  time: string
}

export interface Post {
  en: string
  ar: string
  skill: string
  textEn: string
  textAr: string
  whenEn: string
  whenAr: string
  likes: number
  slot: string
}
