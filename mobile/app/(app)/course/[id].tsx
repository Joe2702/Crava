import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { PrimaryButton } from '../../../components/ui'
import { IconCheck, IconLock, IconPlay } from '../../../components/Icons'
import { useAuth } from '../../../lib/auth'
import { useProfile } from '../../../lib/profile'
import { useCourse, type LessonWithState } from '../../../lib/course'
import { enroll, fetchEnrollments, unenroll } from '../../../lib/enrollment'
import { canOpenLesson, ownsCourse, FREE_LESSON_IDX } from '../../../lib/entitlement'
import { usePurchases } from '../../../lib/purchases'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { owned } = usePurchases()
  const { data, loading, error, reload } = useCourse(id)
  const { t, field, locale, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [enrolled, setEnrolled] = useState<boolean | null>(null)
  const [working, setWorking] = useState(false)

  const loadEnrollment = useCallback(async () => {
    if (!user || !id) return
    const list = await fetchEnrollments(user.uid)
    setEnrolled(list.some((e) => e.courseId === id))
  }, [user, id])

  useEffect(() => {
    void loadEnrollment()
  }, [loadEnrollment])

  const toggleEnrollment = async () => {
    if (!user || !id) return
    setWorking(true)
    try {
      if (enrolled) await unenroll(user.uid, id)
      else await enroll(user.uid, id)
      setEnrolled(!enrolled)
    } catch (e) {
      Alert.alert(t('Could not save', 'تعذر الحفظ'), e instanceof Error ? e.message : '')
    } finally {
      setWorking(false)
    }
  }

  /**
   * Deliberately cannot grant the course. Purchases are read-only to every
   * client in the security rules, so the only thing that can record one is a
   * verified store receipt processed server-side. Until billing is connected
   * there is nothing honest for this button to do but say so.
   */
  const buy = () => {
    Alert.alert(
      t('Not available yet', 'غير متاح بعد'),
      t(
        'Payments are not connected yet. This build cannot take a purchase.',
        'لم يتم ربط الدفع بعد. لا يمكن لهذه النسخة إتمام عملية شراء.',
      ),
    )
  }

  const start = async () => {
    if (!data?.nextLessonId) return
    // Opening a lesson is enrolling. Making someone press two buttons to begin
    // is friction with nothing behind it.
    if (!enrolled && user && id) {
      setEnrolled(true)
      void enroll(user.uid, id).catch(() => setEnrolled(false))
    }
    router.push(`/lesson/${data.nextLessonId}`)
  }

  if (loading && !data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: colors.bg }}>
        <Txt style={{ fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'center' }}>
          {t('Could not load this course', 'تعذر تحميل الدورة')}
        </Txt>
        {error && <Txt style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>{error}</Txt>}
        <Pressable onPress={reload} accessibilityRole="button">
          <Txt style={{ color: colors.accent, fontWeight: '600', fontSize: 15, paddingVertical: 8 }}>
            {t('Try again', 'حاول مرة أخرى')}
          </Txt>
        </Pressable>
      </View>
    )
  }

  const { course, lessons, progress } = data
  const entitlement = profile?.entitlement ?? null
  const bought = id ? ownsCourse(id, owned) : false
  const started = progress.completed > 0

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 20, gap: 18 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
          <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
            <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isRTL ? 'رجوع ›' : '‹ Back'}</Txt>
          </View>
        </Pressable>

        <View style={{ height: 160, borderRadius: radius.xl, backgroundColor: '#d4d4da' }} />

        <View style={{ gap: 6 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {field(course, 'category')}
          </Txt>
          <Txt style={{ fontSize: 30, fontWeight: '700', letterSpacing: -1, lineHeight: 34, color: colors.text }}>
            {field(course, 'name')}
          </Txt>
          {!!course.summary_en && (
            <Txt style={{ fontSize: 16, lineHeight: 24, color: colors.text, marginTop: 4 }}>
              {field(course, 'summary')}
            </Txt>
          )}
          <Txt style={{ fontSize: 15, color: colors.textSecondary, marginTop: 4 }}>
            {t(
              `${lessons.length} lessons · ${course.level_en ?? ''} · Taught by ${course.coach_name_en}`,
              `${localizeNumber(lessons.length, locale)} دروس · ${course.level_ar ?? ''} · بإشراف ${course.coach_name_ar}`,
            )}
          </Txt>
        </View>

        {progress.completed > 0 && (
          <View style={{ gap: 6 }}>
            <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.fill, overflow: 'hidden' }}>
              <View
                style={{
                  height: 6,
                  width: `${progress.percent}%`,
                  borderRadius: radius.pill,
                  backgroundColor: progress.isComplete ? colors.success : colors.accent,
                }}
              />
            </View>
            <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
              {t(
                `${progress.percent}% complete`,
                `${localizeNumber(progress.percent, locale)}٪ مكتمل`,
              )}
            </Txt>
          </View>
        )}

        <View style={{ gap: 10 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {t('Curriculum', 'المنهج')}
          </Txt>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
            {lessons.map((l, i) => (
              <LessonRow
                key={l.id}
                lesson={l}
                last={i === lessons.length - 1}
                locked={!canOpenLesson({ lessonIdx: l.idx, courseId: course.id, ownedCourseIds: owned, entitlement })}
                onPress={() => router.push(`/lesson/${l.id}`)}
              />
            ))}
          </View>
          {!bought && (
            <Txt style={{ fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>
              {t(
                `Lesson ${FREE_LESSON_IDX} is a free preview. Buy the course to watch the rest.`,
                `الدرس ${localizeNumber(FREE_LESSON_IDX, locale)} معاينة مجانية. اشترِ الدورة لمشاهدة الباقي.`,
              )}
            </Txt>
          )}
        </View>

        {enrolled && (
          <Pressable onPress={() => void toggleEnrollment()} disabled={working} accessibilityRole="button">
            <Txt style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', paddingVertical: 8 }}>
              {t('Remove from My learning', 'إزالة من تعلّمي')}
            </Txt>
          </Pressable>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}>
        {bought ? (
          <PrimaryButton
            label={
              progress.isComplete
                ? t('Review the course', 'راجع الدورة')
                : started
                  ? t('Continue', 'متابعة')
                  : t('Start learning', 'ابدأ التعلم')
            }
            busy={working}
            onPress={() => void start()}
          />
        ) : (
          <>
            <PrimaryButton
              label={
                course.priceEgp
                  ? t(`Buy for EGP ${course.priceEgp}`, `اشترِ بـ ${localizeNumber(course.priceEgp, locale)} ج.م`)
                  : t('Buy this course', 'اشترِ هذه الدورة')
              }
              onPress={buy}
            />
            <Pressable onPress={() => void start()} accessibilityRole="button">
              <Txt style={{ fontSize: 15, color: colors.accent, fontWeight: '600', textAlign: 'center', paddingVertical: 6 }}>
                {t('Watch lesson 1 free', 'شاهد الدرس الأول مجاناً')}
              </Txt>
            </Pressable>
          </>
        )}
      </View>
    </View>
  )
}

function LessonRow({
  lesson,
  last,
  locked,
  onPress,
}: {
  lesson: LessonWithState
  last: boolean
  locked: boolean
  onPress: () => void
}) {
  const { field, locale } = useLocale()

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        padding: 15,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.separator,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: lesson.completed ? 'rgba(52,199,89,0.14)' : colors.fill,
        }}
      >
        {lesson.completed ? (
          <IconCheck size={15} color={colors.successDark} strokeWidth={3} />
        ) : (
          <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
            {localizeNumber(lesson.idx, locale)}
          </Txt>
        )}
      </View>

      <Txt
        style={{
          flex: 1,
          fontSize: 16,
          fontWeight: lesson.isNext ? '600' : '400',
          color: colors.text,
        }}
        numberOfLines={2}
      >
        {field(lesson, 'name')}
      </Txt>

      {locked ? <IconLock size={16} /> : <IconPlay size={13} color={colors.textTertiary} />}
    </Pressable>
  )
}
