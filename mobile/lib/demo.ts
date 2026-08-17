import type { Drill, Level, Skill, UserDoc } from './types'

/**
 * In-memory stand-in for Firebase, used when no config is present so the app
 * can be run and shown without any backend setup. State lives for the lifetime
 * of the process — nothing is persisted, and that is the point: this exists to
 * demonstrate the app, not to be a second implementation to maintain.
 */

/** Mirrors firebase/seed/seed.mjs. The two must be changed together. */
const CATALOG: {
  id: string
  name_en: string
  name_ar: string
  category_en: string
  category_ar: string
  coach_name_en: string
  coach_name_ar: string
  levels: [string, string][]
}[] = [
  {
    id: 'muscleup',
    name_en: 'Full Muscle-Up',
    name_ar: 'المسل أب الكامل',
    category_en: 'Calisthenics',
    category_ar: 'كاليسثينكس',
    coach_name_en: 'Omar Fathy',
    coach_name_ar: 'عمر فتحي',
    levels: [
      ['Dead Hang', 'التعليق الميت'],
      ['Scapular Pulls', 'سحب لوح الكتف'],
      ['Strict Pull-Up', 'العقلة الصارمة'],
      ['Explosive Pull', 'السحب الانفجاري'],
      ['Transition Drill', 'تمرين الانتقال'],
      ['Full Muscle-Up', 'المسل أب الكامل'],
    ],
  },
  {
    id: 'boxing',
    name_en: 'Boxing Combos',
    name_ar: 'توليفات الملاكمة',
    category_en: 'Boxing',
    category_ar: 'ملاكمة',
    coach_name_en: 'Nour El-Sayed',
    coach_name_ar: 'نور السيد',
    levels: [
      ['Stance & Guard', 'الوقفة والحماية'],
      ['The Jab', 'اللكمة المستقيمة'],
      ['Jab–Cross', 'جاب – كروس'],
      ['Hook & Slip', 'الهوك والمراوغة'],
      ['Three-Punch Combo', 'توليفة ثلاث لكمات'],
      ['Ring Combinations', 'توليفات الحلبة'],
    ],
  },
  {
    id: 'sprint',
    name_en: 'Sprint Mechanics',
    name_ar: 'ميكانيكا العدو',
    category_en: 'Athletics',
    category_ar: 'ألعاب قوى',
    coach_name_en: 'Karim Adel',
    coach_name_ar: 'كريم عادل',
    levels: [
      ['Posture & Lean', 'وضعية الجسم والميل'],
      ['A-Skip', 'القفز المتناوب'],
      ['Arm Mechanics', 'حركة الذراعين'],
      ['Acceleration', 'التسارع'],
      ['Top Speed', 'السرعة القصوى'],
      ['Block Start', 'الانطلاق من البلوك'],
    ],
  },
  {
    id: 'parkour',
    name_en: 'Parkour Basics',
    name_ar: 'أساسيات الباركور',
    category_en: 'Parkour',
    category_ar: 'باركور',
    coach_name_en: 'Youssef Hany',
    coach_name_ar: 'يوسف هاني',
    levels: [
      ['Landing & Roll', 'الهبوط والدحرجة'],
      ['Precision Jump', 'قفزة الدقة'],
      ['Vault Basics', 'أساسيات العبور'],
      ['Kong Vault', 'قفزة الكونغ'],
      ['Cat Leap', 'قفزة القط'],
      ['Wall Run', 'الجري على الحائط'],
    ],
  },
]

const DRILL_TEMPLATE: [string, string, string, string, boolean][] = [
  ['Watch: {level} breakdown', 'شاهد: شرح {level}', '4:12 video', 'فيديو ٤:١٢', true],
  ['Mobility warm-up', 'إحماء وإطالة', '6 min', '٦ دقائق', true],
  ['Practice — 3 sets × 8 reps', 'تدرب — ٣ مجموعات × ٨ تكرارات', 'Log each set', 'سجّل كل مجموعة', true],
  ['Film yourself and self-check', 'صوّر نفسك وقيّم أداءك', 'Optional, 30s clip', 'اختياري، مقطع ٣٠ ث', false],
]

export const DEMO_SKILLS: Skill[] = CATALOG.map(({ levels: _levels, ...s }, order) => ({
  ...s,
  sortOrder: order,
  isPublished: true,
}))

export const DEMO_LEVELS: Level[] = CATALOG.flatMap((skill) =>
  skill.levels.map(([en, ar], i) => ({
    id: `${skill.id}-${i + 1}`,
    skillId: skill.id,
    idx: i + 1,
    name_en: en,
    name_ar: ar,
    hasVideo: false,
    durationS: null,
    isPublished: true,
  })),
)

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

export const levelsForSkill = (skillId: string) => DEMO_LEVELS.filter((l) => l.skillId === skillId)

interface DemoState {
  signedIn: boolean
  user: UserDoc
  drillCompletions: Set<string>
  levelCompletions: Map<string, Date>
  enrollments: Map<string, Date>
}

function freshUser(displayName = 'Yassin'): UserDoc {
  return {
    displayName,
    locale: 'en',
    city: null,
    notifEnabled: true,
    onboardedAt: null,
    weeklyGoal: null,
    createdAt: Date.now(),
    entitlement: null,
  }
}

const state: DemoState = {
  signedIn: false,
  user: freshUser(),
  drillCompletions: new Set(),
  levelCompletions: new Map(),
  enrollments: new Map(),
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
    state.enrollments.clear()
    emit()
  },
  enrollments() {
    return [...state.enrollments.entries()]
      .map(([courseId, enrolledAt]) => ({ courseId, enrolledAt }))
      .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime())
  },
  enroll(courseId: string) {
    if (!state.enrollments.has(courseId)) state.enrollments.set(courseId, new Date())
    emit()
  },
  unenroll(courseId: string) {
    state.enrollments.delete(courseId)
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
