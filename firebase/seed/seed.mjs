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

const SKILL = {
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

const LEVELS = [
  ['Dead Hang', 'التعليق الميت'],
  ['Scapular Pulls', 'سحب لوح الكتف'],
  ['Strict Pull-Up', 'العقلة الصارمة'],
  ['Explosive Pull', 'السحب الانفجاري'],
  ['Transition Drill', 'تمرين الانتقال'],
  ['Full Muscle-Up', 'المسل أب الكامل'],
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

batch.set(db.collection('skills').doc(SKILL.id), SKILL)

for (const [i, [nameEn, nameAr]] of LEVELS.entries()) {
  const idx = i + 1
  const levelId = `${SKILL.id}-${idx}`
  batch.set(db.collection('levels').doc(levelId), {
    skillId: SKILL.id,
    idx,
    name_en: nameEn,
    name_ar: nameAr,
    videoId: null,
    durationS: null,
    isPublished: true,
  })

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
  }
}

await batch.commit()
console.log(`Seeded 1 skill, ${LEVELS.length} levels, ${LEVELS.length * DRILLS.length} drills.`)
process.exit(0)
