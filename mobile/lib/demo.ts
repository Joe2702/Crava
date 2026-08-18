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
  level_en: string
  level_ar: string
  priceEgp: number
  coach_name_en: string
  coach_name_ar: string
  summary_en: string
  summary_ar: string
  lessons: [string, string][]
}[] = [
  {
    id: 'calisthenics-beginner',
    name_en: 'Calisthenics for Beginners',
    name_ar: 'الكاليسثينكس للمبتدئين',
    category_en: 'Calisthenics',
    category_ar: 'كاليسثينكس',
    level_en: 'Beginner',
    level_ar: 'مبتدئ',
    priceEgp: 349,
    coach_name_en: 'Omar Fathy',
    coach_name_ar: 'عمر فتحي',
    summary_en: 'Build the pushing, pulling and core strength every other skill sits on.',
    summary_ar: 'ابنِ قوة الدفع والسحب والجذع التي تقوم عليها كل المهارات الأخرى.',
    lessons: [
      ['Dead Hang', 'التعليق الميت'],
      ['Push-Up Form', 'أداء تمرين الضغط'],
      ['Scapular Pulls', 'سحب لوح الكتف'],
      ['Hollow Body Hold', 'وضعية الجسم المجوف'],
      ['Assisted Pull-Up', 'العقلة بمساعدة'],
      ['First Strict Pull-Up', 'أول عقلة صارمة'],
    ],
  },
  {
    id: 'boxing-basics',
    name_en: 'Boxing Basics',
    name_ar: 'أساسيات الملاكمة',
    category_en: 'Boxing',
    category_ar: 'ملاكمة',
    level_en: 'Beginner',
    level_ar: 'مبتدئ',
    priceEgp: 299,
    coach_name_en: 'Nour El-Sayed',
    coach_name_ar: 'نور السيد',
    summary_en: 'Stance, guard and the three punches everything else is built from.',
    summary_ar: 'الوقفة والحماية واللكمات الثلاث التي يُبنى عليها كل شيء.',
    lessons: [
      ['Stance & Guard', 'الوقفة والحماية'],
      ['The Jab', 'اللكمة المستقيمة'],
      ['The Cross', 'الكروس'],
      ['The Hook', 'الهوك'],
      ['Footwork', 'حركة القدمين'],
      ['Slipping & Rolling', 'المراوغة والدوران'],
    ],
  },
  {
    id: 'calisthenics-advanced',
    name_en: 'Calisthenics: The Muscle-Up',
    name_ar: 'الكاليسثينكس: المسل أب',
    category_en: 'Calisthenics',
    category_ar: 'كاليسثينكس',
    level_en: 'Advanced',
    level_ar: 'متقدم',
    priceEgp: 499,
    coach_name_en: 'Omar Fathy',
    coach_name_ar: 'عمر فتحي',
    summary_en: 'Go from a strict pull-up to a clean bar muscle-up.',
    summary_ar: 'انتقل من العقلة الصارمة إلى مسل أب نظيف على العقلة.',
    lessons: [
      ['Strict Pull-Up Standard', 'معيار العقلة الصارمة'],
      ['Explosive Pull', 'السحب الانفجاري'],
      ['Straight Bar Dip', 'الغطس على العقلة'],
      ['The Transition', 'مرحلة الانتقال'],
      ['Putting It Together', 'الدمج الكامل'],
      ['Clean Muscle-Up', 'المسل أب النظيف'],
    ],
  },
  {
    id: 'boxing-combos',
    name_en: 'Boxing Combinations',
    name_ar: 'توليفات الملاكمة',
    category_en: 'Boxing',
    category_ar: 'ملاكمة',
    level_en: 'Intermediate',
    level_ar: 'متوسط',
    priceEgp: 399,
    coach_name_en: 'Laila Mostafa',
    coach_name_ar: 'ليلى مصطفى',
    summary_en: 'Chain punches together and move between them without stalling.',
    summary_ar: 'اربط اللكمات معاً وتحرك بينها دون توقف.',
    lessons: [
      ['Jab–Cross', 'جاب – كروس'],
      ['Jab–Cross–Hook', 'جاب – كروس – هوك'],
      ['Body Shots', 'ضربات الجسم'],
      ['Counter Punching', 'اللكم المضاد'],
      ['Four-Punch Chains', 'سلاسل أربع لكمات'],
      ['Ring Combinations', 'توليفات الحلبة'],
    ],
  },
  {
    id: 'parkour-basics',
    name_en: 'Parkour Fundamentals',
    name_ar: 'أساسيات الباركور',
    category_en: 'Parkour',
    category_ar: 'باركور',
    level_en: 'Beginner',
    level_ar: 'مبتدئ',
    priceEgp: 379,
    coach_name_en: 'Youssef Hany',
    coach_name_ar: 'يوسف هاني',
    summary_en: 'Land, roll and vault without hurting yourself.',
    summary_ar: 'اهبط وتدحرج واعبر دون أن تؤذي نفسك.',
    lessons: [
      ['Landing & Roll', 'الهبوط والدحرجة'],
      ['Precision Jump', 'قفزة الدقة'],
      ['Vault Basics', 'أساسيات العبور'],
      ['Kong Vault', 'قفزة الكونغ'],
      ['Cat Leap', 'قفزة القط'],
      ['Wall Run', 'الجري على الحائط'],
    ],
  },
  {
    id: 'sprint-speed',
    name_en: 'Run Faster: Sprint Mechanics',
    name_ar: 'اركض أسرع: ميكانيكا العدو',
    category_en: 'Athletics',
    category_ar: 'ألعاب قوى',
    level_en: 'All levels',
    level_ar: 'كل المستويات',
    priceEgp: 349,
    coach_name_en: 'Karim Adel',
    coach_name_ar: 'كريم عادل',
    summary_en: 'Fix the mechanics that cost you tenths over 100 metres.',
    summary_ar: 'صحّح الميكانيكا التي تكلفك أعشار الثانية في المئة متر.',
    lessons: [
      ['Posture & Lean', 'وضعية الجسم والميل'],
      ['A-Skip', 'القفز المتناوب'],
      ['Arm Mechanics', 'حركة الذراعين'],
      ['Acceleration', 'التسارع'],
      ['Top Speed', 'السرعة القصوى'],
      ['Block Start', 'الانطلاق من البلوك'],
    ],
  },
]

const DRILL_TEMPLATE: [string, string, string, string, boolean][] = [
  ['Watch: {level} breakdown', 'شاهد: شرح {level}', '4:12 video', 'فيديو ٤:١٢', true],
  ['Mobility warm-up', 'إحماء وإطالة', '6 min', '٦ دقائق', true],
  ['Practice — 3 sets × 8 reps', 'تدرب — ٣ مجموعات × ٨ تكرارات', 'Log each set', 'سجّل كل مجموعة', true],
  ['Film yourself and self-check', 'صوّر نفسك وقيّم أداءك', 'Optional, 30s clip', 'اختياري، مقطع ٣٠ ث', false],
]

export const DEMO_SKILLS: Skill[] = CATALOG.map(({ lessons, ...s }, order) => ({
  ...s,
  sortOrder: order,
  isPublished: true,
  lessonCount: lessons.length,
}))

export const DEMO_LEVELS: Level[] = CATALOG.flatMap((course) =>
  course.lessons.map(([en, ar], i) => ({
    id: `${course.id}-${i + 1}`,
    skillId: course.id,
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
  purchases: Set<string>
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
  purchases: new Set(),
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
    state.purchases.clear()
    emit()
  },
  enrollments() {
    return [...state.enrollments.entries()]
      .map(([courseId, enrolledAt]) => ({ courseId, enrolledAt }))
      .sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime())
  },
  purchases(): string[] {
    return [...state.purchases]
  },
  /**
   * Demo mode only. In the real app a purchase can only be written by a
   * verified store receipt — the rules refuse it from any client — so there is
   * deliberately no equivalent of this anywhere outside the demo store.
   */
  grantPurchase(courseId: string) {
    state.purchases.add(courseId)
    state.enrollments.set(courseId, state.enrollments.get(courseId) ?? new Date())
    emit()
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
