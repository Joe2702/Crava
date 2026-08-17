import { streakFrom } from './progress.ts'

export interface Achievement {
  id: string
  name_en: string
  name_ar: string
  detail_en: string
  detail_ar: string
  earned: boolean
  /** How far along, 0..1, for the ones that are a count. */
  progress: number
}

/**
 * Derived from the completion set, exactly like XP and streak. Nothing is
 * stored, so there is no badge a client could award itself — the same reason
 * the rest of progress is computed rather than kept.
 */
export function achievementsFrom(
  completedLevelIds: string[],
  completedAt: Date[],
  levelsPerSkill = 6,
  now = new Date(),
): Achievement[] {
  const total = completedLevelIds.length
  const streak = streakFrom(completedAt, now)

  const perSkill = new Map<string, number>()
  for (const id of completedLevelIds) {
    // Level ids are "<skillId>-<idx>", so the skill is everything before the
    // last dash. Splitting on the first dash would break skill ids that
    // contain one.
    const skillId = id.slice(0, id.lastIndexOf('-'))
    if (skillId) perSkill.set(skillId, (perSkill.get(skillId) ?? 0) + 1)
  }
  const skillsFinished = [...perSkill.values()].filter((n) => n >= levelsPerSkill).length

  const count = (
    id: string,
    en: string,
    ar: string,
    dEn: string,
    dAr: string,
    have: number,
    need: number,
  ): Achievement => ({
    id,
    name_en: en,
    name_ar: ar,
    detail_en: dEn,
    detail_ar: dAr,
    earned: have >= need,
    progress: Math.min(1, need === 0 ? 1 : have / need),
  })

  return [
    count('first-level', 'First step', 'الخطوة الأولى', 'Clear your first level', 'أنهِ أول مستوى', total, 1),
    count('three-levels', 'Getting somewhere', 'في الطريق', 'Clear 3 levels', 'أنهِ ٣ مستويات', total, 3),
    count('ten-levels', 'Committed', 'ملتزم', 'Clear 10 levels', 'أنهِ ١٠ مستويات', total, 10),
    count('streak-3', 'Three in a row', 'ثلاثة متتالية', 'Train 3 days running', 'تدرب ٣ أيام متتالية', streak, 3),
    count('streak-7', 'A full week', 'أسبوع كامل', 'Train 7 days running', 'تدرب ٧ أيام متتالية', streak, 7),
    count('streak-30', 'A month straight', 'شهر متواصل', 'Train 30 days running', 'تدرب ٣٠ يوماً متتالياً', streak, 30),
    count(
      'skill-complete',
      'Skill mastered',
      'أتقنت مهارة',
      'Finish every level of one skill',
      'أنهِ كل مستويات مهارة واحدة',
      skillsFinished,
      1,
    ),
    count(
      'all-skills',
      'Crava Certified',
      'كرافا المعتمد',
      'Finish all four skills',
      'أنهِ المهارات الأربع',
      skillsFinished,
      4,
    ),
  ]
}
