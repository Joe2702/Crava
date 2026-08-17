import { Pressable, View } from 'react-native'
import { Txt } from './Txt'
import { IconChevronRight } from './Icons'
import { localizeNumber, useLocale } from '../lib/i18n'
import type { CourseProgress } from '../lib/progress'
import type { Course } from '../lib/types'
import { cardShadow, colors, radius } from '../theme/tokens'

/**
 * The one way a course is presented anywhere in the app. Browse and My
 * learning showed the same thing in two different shapes before, which meant
 * two places to change and two chances to drift.
 */
export function CourseCard({
  course,
  progress,
  owned,
  onPress,
}: {
  course: Course
  progress?: CourseProgress
  owned?: boolean
  onPress: () => void
}) {
  const { t, field, locale } = useLocale()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
        <View style={{ width: 60, height: 60, borderRadius: radius.md, backgroundColor: '#d4d4da' }} />
        <View style={{ flex: 1, gap: 3 }}>
          <Txt style={{ fontSize: 17, fontWeight: '600', letterSpacing: -0.3, color: colors.text }} numberOfLines={2}>
            {field(course, 'name')}
          </Txt>
          <Txt style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
            {course.level_en ? `${field(course, 'level')} · ` : ''}
            {field(course, 'coach_name')}
          </Txt>
          {/* Price is the point of the card, so it sits with the title rather
              than in a corner the eye reaches last. Owned courses show no
              price — they have already been paid for. */}
          {owned ? (
            <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.successDark }}>
              {t('Purchased', 'تم الشراء')}
            </Txt>
          ) : course.priceEgp ? (
            <Txt style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
              {t(`EGP ${course.priceEgp}`, `${localizeNumber(course.priceEgp, locale)} ج.م`)}
            </Txt>
          ) : null}
        </View>
        <IconChevronRight />
      </View>

      {progress && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 6 }}>
          <View style={{ height: 5, borderRadius: radius.pill, backgroundColor: colors.fill, overflow: 'hidden' }}>
            <View
              style={{
                height: 5,
                width: `${progress.percent}%`,
                borderRadius: radius.pill,
                backgroundColor: progress.isComplete ? colors.success : colors.accent,
              }}
            />
          </View>
          <Txt style={{ fontSize: 12, color: colors.textSecondary }}>
            {progress.isComplete
              ? t('Complete', 'مكتملة')
              : t(
                  `${progress.percent}% · ${progress.completed} of ${progress.total} lessons`,
                  `${localizeNumber(progress.percent, locale)}٪ · ${localizeNumber(progress.completed, locale)} من ${localizeNumber(progress.total, locale)} دروس`,
                )}
          </Txt>
        </View>
      )}
    </Pressable>
  )
}
