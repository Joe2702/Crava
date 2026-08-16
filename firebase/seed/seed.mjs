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

// The fourth drill is optional, matching the original design: filming yourself
// is encouraged but must not block clearing the level.
const DRILLS = [
  ['Watch: {level} breakdown', 'شاهد: شرح {level}', '4:12 video', 'فيديو ٤:١٢', true],
  ['Mobility warm-up', 'إحماء وإطالة', '6 min', '٦ دقائق', true],
  ['Practice — 3 sets × 8 reps', 'تدرب — ٣ مجموعات × ٨ تكرارات', 'Log each set', 'سجّل كل مجموعة', true],
  ['Film yourself and self-check', 'صوّر نفسك وقيّم أداءك', 'Optional, 30s clip', 'اختياري، مقطع ٣٠ ث', false],
]

const batch = db.batch()
let levelCount = 0
let drillCount = 0

for (const [order, { levels, ...skill }] of SKILLS.entries()) {
  batch.set(db.collection('skills').doc(skill.id), { ...skill, sortOrder: order, isPublished: true })

  for (const [i, [nameEn, nameAr]] of levels.entries()) {
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

await batch.commit()
console.log(`Seeded ${SKILLS.length} skills, ${levelCount} levels, ${drillCount} drills.`)
process.exit(0)
