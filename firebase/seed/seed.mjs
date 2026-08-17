/**
 * Seeds the Full Muscle-Up content into Firestore.
 *
 *   cd firebase/seed
 *   npm install
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node seed.mjs
 *
 * Safe to re-run: every write is keyed by a deterministic id, so it updates in
 * place rather than duplicating.
 */
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'node:fs'

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
initializeApp({
  credential: keyPath && existsSync(keyPath)
    ? cert(JSON.parse(readFileSync(keyPath, 'utf8')))
    : applicationDefault(),
})

const db = getFirestore()

const SKILLS = [
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
]

// The fourth drill is optional, matching the original design: filming yourself
// is encouraged but must not block clearing the level.
const DRILLS = [
  ['Watch: {level} breakdown', 'شاهد: شرح {level}', '4:12 video', 'فيديو ٤:١٢', true],
  ['Mobility warm-up', 'إحماء وإطالة', '6 min', '٦ دقائق', true],
  ['Practice — 3 sets × 8 reps', 'تدرب — ٣ مجموعات × ٨ تكرارات', 'Log each set', 'سجّل كل مجموعة', true],
  ['Film yourself and self-check', 'صوّر نفسك وقيّم أداءك', 'Optional, 30s clip', 'اختياري، مقطع ٣٠ ث', false],
]

const COACHES = [
  { id: 'omar', name_en: 'Omar Fathy', name_ar: 'عمر فتحي', skillId: 'calisthenics-advanced', city_en: 'Cairo', city_ar: 'القاهرة', rating: 4.9, rateEgp: 450 },
  { id: 'nour', name_en: 'Nour El-Sayed', name_ar: 'نور السيد', skillId: 'boxing-basics', city_en: 'Alexandria', city_ar: 'الإسكندرية', rating: 4.8, rateEgp: 400 },
  { id: 'karim', name_en: 'Karim Adel', name_ar: 'كريم عادل', skillId: 'sprint-speed', city_en: 'Giza', city_ar: 'الجيزة', rating: 5.0, rateEgp: 500 },
  { id: 'youssef', name_en: 'Youssef Hany', name_ar: 'يوسف هاني', skillId: 'parkour-basics', city_en: 'Cairo', city_ar: 'القاهرة', rating: 4.7, rateEgp: 380 },
  { id: 'laila', name_en: 'Laila Mostafa', name_ar: 'ليلى مصطفى', skillId: 'boxing-basics', city_en: 'Cairo', city_ar: 'القاهرة', rating: 4.9, rateEgp: 420 },
  { id: 'tarek', name_en: 'Tarek Zaki', name_ar: 'طارق زكي', skillId: 'parkour-basics', city_en: 'Alexandria', city_ar: 'الإسكندرية', rating: 4.6, rateEgp: 360 },
]

const SLOTS = [
  ['Mon', 'الإثنين', '17:00'],
  ['Mon', 'الإثنين', '19:00'],
  ['Tue', 'الثلاثاء', '07:00'],
  ['Tue', 'الثلاثاء', '18:30'],
  ['Wed', 'الأربعاء', '17:30'],
  ['Thu', 'الخميس', '20:00'],
]

const batch = db.batch()
let levelCount = 0
let drillCount = 0

for (const [order, { lessons, ...skill }] of SKILLS.entries()) {
  // lessonCount is denormalised so My learning can show a progress bar per
  // course without reading every course's lessons. The seed owns it, so it
  // cannot drift from the lessons actually written below.
  batch.set(db.collection('skills').doc(skill.id), {
    ...skill,
    sortOrder: order,
    isPublished: true,
    lessonCount: lessons.length,
  })

  for (const [i, [nameEn, nameAr]] of lessons.entries()) {
    const idx = i + 1
    const levelId = `${skill.id}-${idx}`
    batch.set(db.collection('levels').doc(levelId), {
      skillId: skill.id,
      idx,
      name_en: nameEn,
      name_ar: nameAr,
      hasVideo: false,
      durationS: null,
      isPublished: true,
    })
    levelCount++

    for (const [j, [dEn, dAr, mEn, mAr, required]] of DRILLS.entries()) {
      batch.set(db.collection('drills').doc(`${levelId}-${j}`), {
        levelId,
        idx: j,
        name_en: dEn.replace('{level}', nameEn),
        name_ar: dAr.replace('{level}', nameAr),
        meta_en: mEn,
        meta_ar: mAr,
        isRequired: required,
      })
      drillCount++
    }
  }
}

// merge:true keeps fields the payload omits, but still overwrites the ones it
// names — so ownerUid and the bio can only be initialised on documents that do
// not exist yet. Including them unconditionally would hand every coach profile
// back to nobody, and erase their bio, on every re-seed.
const existingCoaches = await db.getAll(...COACHES.map((c) => db.collection('coaches').doc(c.id)))
const isNewCoach = new Map(existingCoaches.map((d) => [d.id, !d.exists]))

for (const [order, coach] of COACHES.entries()) {
  batch.set(
    db.collection('coaches').doc(coach.id),
    {
      ...coach,
      sortOrder: order,
      isPublished: true,
      // ownerUid stays null until an admin links the profile to a real
      // account, because "verified coach" has to mean somebody checked.
      ...(isNewCoach.get(coach.id) ? { ownerUid: null, bio_en: '', bio_ar: '' } : {}),
    },
    { merge: true },
  )
  for (const [i, [dayEn, dayAr, time]] of SLOTS.entries()) {
    batch.set(db.collection('coaches').doc(coach.id).collection('slots').doc(`${coach.id}-${i}`), {
      idx: i,
      day_en: dayEn,
      day_ar: dayAr,
      time,
    })
  }
}

// Courses from an earlier catalog are still in Firestore and still published,
// so without this the app would list them alongside the current ones. They are
// unpublished rather than deleted: a learner who bought one keeps their
// purchase and their completed lessons, and can still open it from My learning.
const allCourses = await db.collection('skills').get()
const currentIds = new Set(SKILLS.map((s) => s.id))
let retired = 0
for (const docSnap of allCourses.docs) {
  if (!currentIds.has(docSnap.id) && docSnap.data().isPublished !== false) {
    batch.update(docSnap.ref, { isPublished: false })
    retired++
  }
}

await batch.commit()
console.log(
  `Seeded ${SKILLS.length} courses, ${levelCount} lessons, ${drillCount} steps, ` +
    `${COACHES.length} coaches, ${COACHES.length * SLOTS.length} slots` +
    (retired ? `, retired ${retired} old course(s).` : '.'),
)
process.exit(0)
