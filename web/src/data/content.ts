import type { Coach, Post, Skill, Slot } from './types'

export const SKILLS: Skill[] = [
  {
    id: 'muscleup',
    en: 'Full Muscle-Up',
    ar: 'المسل أب الكامل',
    catEn: 'Calisthenics',
    catAr: 'كاليسثينكس',
    coachEn: 'Omar Fathy',
    coachAr: 'عمر فتحي',
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
    en: 'Boxing Combos',
    ar: 'توليفات الملاكمة',
    catEn: 'Boxing',
    catAr: 'ملاكمة',
    coachEn: 'Nour El-Sayed',
    coachAr: 'نور السيد',
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
    en: 'Sprint Mechanics',
    ar: 'ميكانيكا العدو',
    catEn: 'Athletics',
    catAr: 'ألعاب قوى',
    coachEn: 'Karim Adel',
    coachAr: 'كريم عادل',
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
    en: 'Parkour Basics',
    ar: 'أساسيات الباركور',
    catEn: 'Parkour',
    catAr: 'باركور',
    coachEn: 'Youssef Hany',
    coachAr: 'يوسف هاني',
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

export const COACHES: Coach[] = [
  { id: 'omar', en: 'Omar Fathy', ar: 'عمر فتحي', skill: 'muscleup', cityEn: 'Cairo', cityAr: 'القاهرة', rating: '4.9', rate: 450 },
  { id: 'nour', en: 'Nour El-Sayed', ar: 'نور السيد', skill: 'boxing', cityEn: 'Alexandria', cityAr: 'الإسكندرية', rating: '4.8', rate: 400 },
  { id: 'karim', en: 'Karim Adel', ar: 'كريم عادل', skill: 'sprint', cityEn: 'Giza', cityAr: 'الجيزة', rating: '5.0', rate: 500 },
  { id: 'youssef', en: 'Youssef Hany', ar: 'يوسف هاني', skill: 'parkour', cityEn: 'Cairo', cityAr: 'القاهرة', rating: '4.7', rate: 380 },
  { id: 'laila', en: 'Laila Mostafa', ar: 'ليلى مصطفى', skill: 'boxing', cityEn: 'Cairo', cityAr: 'القاهرة', rating: '4.9', rate: 420 },
  { id: 'tarek', en: 'Tarek Zaki', ar: 'طارق زكي', skill: 'parkour', cityEn: 'Alexandria', cityAr: 'الإسكندرية', rating: '4.6', rate: 360 },
]

export const SLOTS: Slot[] = [
  { dayEn: 'Mon', dayAr: 'الإثنين', time: '17:00' },
  { dayEn: 'Mon', dayAr: 'الإثنين', time: '19:00' },
  { dayEn: 'Tue', dayAr: 'الثلاثاء', time: '07:00' },
  { dayEn: 'Tue', dayAr: 'الثلاثاء', time: '18:30' },
  { dayEn: 'Wed', dayAr: 'الأربعاء', time: '17:30' },
  { dayEn: 'Thu', dayAr: 'الخميس', time: '20:00' },
]

export const POSTS: Post[] = [
  { en: 'Mariam K.', ar: 'مريم ك.', skill: 'muscleup', textEn: 'First muscle-up after nine weeks on the path.', textAr: 'أول مسل أب بعد تسعة أسابيع على المسار.', whenEn: '2h ago', whenAr: 'قبل ساعتين', likes: 214, slot: 'Clip 0:12' },
  { en: 'Ahmed R.', ar: 'أحمد ر.', skill: 'muscleup', textEn: 'Twelve strict pull-ups today. Level 3 cleared.', textAr: 'اثنتا عشرة عقلة صارمة اليوم. أنهيت المستوى ٣.', whenEn: '5h ago', whenAr: 'قبل ٥ ساعات', likes: 96, slot: 'Clip 0:20' },
  { en: 'Salma T.', ar: 'سلمى ت.', skill: 'sprint', textEn: 'Shaved 0.4s off my 60m after fixing arm mechanics.', textAr: 'قللت ٠.٤ ثانية في الستين متر بعد تصحيح حركة الذراعين.', whenEn: '1d ago', whenAr: 'قبل يوم', likes: 341, slot: 'Clip 0:08' },
  { en: 'Hassan M.', ar: 'حسن م.', skill: 'parkour', textEn: 'Clean precision jump, no wobble. Coach signed it off.', textAr: 'قفزة دقة نظيفة بدون اهتزاز. المدرب اعتمدها.', whenEn: '2d ago', whenAr: 'قبل يومين', likes: 58, slot: 'Clip 0:15' },
  { en: 'Nada S.', ar: 'ندى س.', skill: 'boxing', textEn: 'Three-punch combo at full speed, finally clean.', textAr: 'توليفة الثلاث لكمات بأقصى سرعة، أخيراً نظيفة.', whenEn: '3d ago', whenAr: 'قبل ٣ أيام', likes: 127, slot: 'Clip 0:11' },
  { en: 'Omar T.', ar: 'عمر ت.', skill: 'sprint', textEn: 'Thirty days without missing a session.', textAr: '٣٠ يوماً بدون تفويت جلسة.', whenEn: '4d ago', whenAr: 'قبل ٤ أيام', likes: 402, slot: 'Clip 0:09' },
]

export const ACCENT = '#e4341a'
export const ACCENT_DARK = '#c22a13'
export const SEP = '0.5px solid rgba(60,60,67,0.14)'
