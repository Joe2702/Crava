import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { COACHES, SKILLS } from '../data/content'
import type { Lang, ScreenId } from '../data/types'

interface AppState {
  lang: Lang | null
  screen: ScreenId
  ob: number
  obPicked: Record<number, string | null>
  skill: string
  level: number
  done: Record<string, boolean>
  xp: number
  streak: number
  unlocked: Record<string, number>
  levelUp: number | null
  plan: 'monthly' | 'annual'
  session: 'form' | 'live'
  slot: number
  booked: boolean
  coach: string
  q: string
  cat: string
  liked: Record<number, boolean>
  tick: number
  notif: boolean
}

const INITIAL_STATE: AppState = {
  lang: null,
  screen: 'onboarding',
  ob: 0,
  obPicked: { 0: 'muscleup', 1: null, 2: null },
  skill: 'muscleup',
  level: 4,
  done: {},
  xp: 1240,
  streak: 12,
  unlocked: { muscleup: 4, boxing: 2, sprint: 1, parkour: 1 },
  levelUp: null,
  plan: 'monthly',
  session: 'form',
  slot: 0,
  booked: false,
  coach: 'omar',
  q: '',
  cat: 'all',
  liked: {},
  tick: 0,
  notif: true,
}

export interface AppApi {
  state: AppState
  lang: Lang
  t: (en: string, ar: string) => string
  egp: (n: number) => string
  skillObj: (id?: string) => (typeof SKILLS)[number]
  coachObj: (id?: string) => (typeof COACHES)[number]
  set: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void
  nav: (patch: Partial<AppState>) => void
  go: (screen: ScreenId) => void
  setEN: () => void
  setAR: () => void
  toggleLang: () => void
  goHome: () => void
  goTree: () => void
  goLesson: () => void
  goSearch: () => void
  goCoaches: () => void
  goPaywall: () => void
  goCommunity: () => void
  goProfile: () => void
  goBooking: () => void
  drillsFor: (skill: string, level: number) => { en: string; ar: string; metaEn: string; metaAr: string }[]
  drillKey: (i: number) => string
  allDrillsDone: () => boolean
  toggleDrill: (i: number) => void
  complete: () => void
  closeLevelUp: () => void
}

const AppCtx = createContext<AppApi | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE)

  const set = useCallback((patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
  }, [])

  const nav = useCallback((patch: Partial<AppState>) => {
    setState((s) => ({ ...s, ...patch, tick: s.tick + 1 }))
  }, [])

  const go = useCallback((screen: ScreenId) => nav({ screen }), [nav])

  const lang: Lang = state.lang || 'en'
  const t = useCallback((en: string, ar: string) => (lang === 'ar' ? ar : en), [lang])
  const egp = useCallback((n: number) => (lang === 'ar' ? `${n} ج.م` : `EGP ${n}`), [lang])

  const skillObj = useCallback((id?: string) => SKILLS.find((s) => s.id === (id || state.skill))!, [state.skill])
  const coachObj = useCallback((id?: string) => COACHES.find((c) => c.id === (id || state.coach))!, [state.coach])

  const drillKey = useCallback((i: number) => `${state.skill}-${state.level}-${i}`, [state.skill, state.level])

  const drillsFor = useCallback((skill: string, level: number) => {
    const s = SKILLS.find((sk) => sk.id === skill)!
    const lv = s.levels[level - 1]
    return [
      { en: `Watch: ${lv[0]} breakdown`, ar: `شاهد: شرح ${lv[1]}`, metaEn: '4:12 video', metaAr: 'فيديو ٤:١٢' },
      { en: 'Mobility warm-up', ar: 'إحماء وإطالة', metaEn: '6 min', metaAr: '٦ دقائق' },
      { en: 'Practice — 3 sets × 8 reps', ar: 'تدرب — ٣ مجموعات × ٨ تكرارات', metaEn: 'Log each set', metaAr: 'سجّل كل مجموعة' },
      { en: 'Film yourself and self-check', ar: 'صوّر نفسك وقيّم أداءك', metaEn: 'Optional, 30s clip', metaAr: 'اختياري، مقطع ٣٠ ث' },
    ]
  }, [])

  const allDrillsDone = useCallback(
    () => [0, 1, 2].every((i) => state.done[drillKey(i)]),
    [state.done, drillKey],
  )

  const toggleDrill = useCallback(
    (i: number) => {
      const k = drillKey(i)
      setState((s) => ({ ...s, done: { ...s.done, [k]: !s.done[k] } }))
    },
    [drillKey],
  )

  const complete = useCallback(() => {
    if (![0, 1, 2].every((i) => state.done[drillKey(i)])) return
    const sk = state.skill
    const lv = state.level
    setState((s) => {
      const un = { ...s.unlocked }
      if (un[sk] <= lv) un[sk] = Math.min(6, lv + 1)
      return { ...s, unlocked: un, xp: s.xp + 120, levelUp: lv, streak: s.streak + 1 }
    })
  }, [state.done, state.skill, state.level, drillKey])

  const closeLevelUp = useCallback(() => {
    setState((s) => ({ ...s, levelUp: null, level: Math.min(6, s.level + 1), screen: 'tree', tick: s.tick + 1 }))
  }, [])

  const api = useMemo<AppApi>(
    () => ({
      state,
      lang,
      t,
      egp,
      skillObj,
      coachObj,
      set,
      nav,
      go,
      setEN: () => set({ lang: 'en' }),
      setAR: () => set({ lang: 'ar' }),
      toggleLang: () => set({ lang: lang === 'ar' ? 'en' : 'ar' }),
      goHome: () => nav({ screen: 'home', booked: false }),
      goTree: () => go('tree'),
      goLesson: () => go('lesson'),
      goSearch: () => go('search'),
      goCoaches: () => nav({ screen: 'coaches', booked: false }),
      goPaywall: () => go('paywall'),
      goCommunity: () => go('community'),
      goProfile: () => go('profile'),
      goBooking: () =>
        nav({
          screen: 'booking',
          coach: (COACHES.find((c) => c.skill === state.skill) || COACHES[0]).id,
          booked: false,
        }),
      drillsFor,
      drillKey,
      allDrillsDone,
      toggleDrill,
      complete,
      closeLevelUp,
    }),
    [state, lang, t, egp, skillObj, coachObj, set, nav, go, drillsFor, drillKey, allDrillsDone, toggleDrill, complete, closeLevelUp],
  )

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
