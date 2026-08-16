import type { Drill, Level, Skill, UserDoc } from './types'

/**
 * In-memory stand-in for Firebase, used when no config is present so the app
 * can be run and shown without any backend setup. State lives for the lifetime
 * of the process — nothing is persisted, and that is the point: this exists to
 * demonstrate the app, not to be a second implementation to maintain.
 */

const LEVEL_NAMES: [string, string][] = [
  ['Dead Hang', 'التعليق الميت'],
  ['Scapular Pulls', 'سحب لوح الكتف'],
  ['Strict Pull-Up', 'العقلة الصارمة'],
  ['Explosive Pull', 'السحب الانفجاري'],
  ['Transition Drill', 'تمرين الانتقال'],
  ['Full Muscle-Up', 'المسل أب الكامل'],
]

const DRILL_TEMPLATE: [string, string, string, string, boolean][] = [
  ['Watch: {level} breakdown', 'شاهد: شرح {level}', '4:12 video', 'فيديو ٤:١٢', true],
  ['Mobility warm-up', 'إحماء وإطالة', '6 min', '٦ دقائق', true],
  ['Practice — 3 sets × 8 reps', 'تدرب — ٣ مجموعات × ٨ تكرارات', 'Log each set', 'سجّل كل مجموعة', true],
  ['Film yourself and self-check', 'صوّر نفسك وقيّم أداءك', 'Optional, 30s clip', 'اختياري، مقطع ٣٠ ث', false],
]

export const DEMO_SKILL: Skill = {
  id: 'muscleup',
  name_en: 'Full Muscle-Up',
  name_ar: 'المسل أب الكامل',
  category_en: 'Calisthenics',
  category_ar: 'كاليسثينكس',
  coach_name_en: 'Omar Fathy',
  coach_name_ar: 'عمر فتحي',
  sortOrder: 0,
  isPublished: true,
}

export const DEMO_LEVELS: Level[] = LEVEL_NAMES.map(([en, ar], i) => ({
  id: `muscleup-${i + 1}`,
  skillId: 'muscleup',
  idx: i + 1,
  name_en: en,
  name_ar: ar,
  hasVideo: false,
  durationS: null,
  isPublished: true,
}))

export const DEMO_DRILLS: Drill[] = DEMO_LEVELS.flatMap((level) =>
  DRILL_TEMPLATE.map(([en, ar, mEn, mAr, required], j) => ({
    id: `${level.id}-${j}`,
    levelId: level.id,
    idx: j,
    name_en: en.replace('{level}', level.name_en),
    name_ar: ar.replace('{level}', level.name_ar),
    meta_en: mEn,
    meta_ar: mAr,
    isRequired: required,
  })),
)

interface DemoState {
  signedIn: boolean
  user: UserDoc
  drillCompletions: Set<string>
  levelCompletions: Map<string, Date>
}

function freshUser(displayName = 'Yassin'): UserDoc {
  return {
    displayName,
    locale: 'en',
    city: null,
    notifEnabled: true,
    onboardedAt: null,
    createdAt: Date.now(),
    entitlement: null,
  }
}

const state: DemoState = {
  signedIn: false,
  user: freshUser(),
  drillCompletions: new Set(),
  levelCompletions: new Map(),
}

type Listener = () => void
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

export const demo = {
  subscribe(l: Listener) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
  get isSignedIn() {
    return state.signedIn
  },
  get user() {
    return state.user
  },
  signIn(displayName?: string) {
    state.signedIn = true
    if (displayName) state.user = { ...state.user, displayName }
    emit()
  },
  signOut() {
    state.signedIn = false
    emit()
  },
  reset() {
    state.signedIn = false
    state.user = freshUser()
    state.drillCompletions.clear()
    state.levelCompletions.clear()
    emit()
  },
  updateUser(patch: Partial<UserDoc>) {
    state.user = { ...state.user, ...patch }
    emit()
  },
  drillsDone(): Set<string> {
    return new Set(state.drillCompletions)
  },
  toggleDrill(drillId: string) {
    if (state.drillCompletions.has(drillId)) state.drillCompletions.delete(drillId)
    else state.drillCompletions.add(drillId)
    emit()
  },
  levelCompletions(): Map<string, Date> {
    return new Map(state.levelCompletions)
  },
  /** Mirrors the security rules: required drills first, and never twice. */
  completeLevel(levelId: string): { alreadyCompleted: boolean } {
    if (state.levelCompletions.has(levelId)) return { alreadyCompleted: true }
    const required = DEMO_DRILLS.filter((d) => d.levelId === levelId && d.isRequired)
    if (!required.every((d) => state.drillCompletions.has(d.id))) {
      throw new Error('Finish the required drills first.')
    }
    state.levelCompletions.set(levelId, new Date())
    emit()
    return { alreadyCompleted: false }
  },
}
