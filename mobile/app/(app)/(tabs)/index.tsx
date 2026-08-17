import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { CourseCard } from '../../../components/CourseCard'
import { LanguageToggle } from '../../../components/LanguageToggle'
import { TAB_BAR_CLEARANCE } from '../../../components/TabBar'
import { useAuth } from '../../../lib/auth'
import { useCatalog } from '../../../lib/catalog'
import { fetchEnrollments } from '../../../lib/enrollment'
import { fetchCompletedLessonIds } from '../../../lib/course'
import { progressOf } from '../../../lib/progress'
import { useLocale } from '../../../lib/i18n'
import { colors } from '../../../theme/tokens'

const LESSONS_PER_COURSE = 6

export default function MyLearning() {
  const { user } = useAuth()
  const { courses, loading: catalogLoading } = useCatalog()
  const { t } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [enrolledIds, setEnrolledIds] = useState<string[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const [enrollments, done] = await Promise.all([
      fetchEnrollments(user.uid),
      fetchCompletedLessonIds(user.uid),
    ])
    setEnrolledIds(enrollments.map((e) => e.courseId))
    setCompleted(done)
    setLoading(false)
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const enrolled = enrolledIds
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))

  const progressFor = (courseId: string) => {
    const done = [...completed].filter((id) => id.startsWith(`${courseId}-`)).length
    return progressOf(done, LESSONS_PER_COURSE)
  }

  const busy = loading || catalogLoading

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 12,
        paddingBottom: TAB_BAR_CLEARANCE + insets.bottom,
        gap: 18,
      }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Crava</Txt>
        <LanguageToggle />
      </View>

      <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
        {t('My learning', 'تعلّمي')}
      </Txt>

      {busy && <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />}

      {!busy && enrolled.length === 0 && (
        <View style={{ gap: 12, paddingVertical: 8 }}>
          <Txt style={{ fontSize: 16, lineHeight: 24, color: colors.textSecondary }}>
            {t(
              'You have not started a course yet.',
              'لم تبدأ أي دورة بعد.',
            )}
          </Txt>
          <Pressable onPress={() => router.push('/search')} accessibilityRole="button">
            <Txt style={{ fontSize: 16, fontWeight: '600', color: colors.accent }}>
              {t('Browse courses', 'تصفح الدورات')}
            </Txt>
          </Pressable>
        </View>
      )}

      {enrolled.map((c) => (
        <CourseCard
          key={c.id}
          course={c}
          progress={progressFor(c.id)}
          onPress={() => router.push(`/course/${c.id}`)}
        />
      ))}
    </ScrollView>
  )
}
