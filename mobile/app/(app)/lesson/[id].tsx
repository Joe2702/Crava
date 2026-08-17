import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { Txt } from '../../../components/Txt'
import { PrimaryButton } from '../../../components/ui'
import { LessonVideo } from '../../../components/LessonVideo'
import { IconCheck, IconLock } from '../../../components/Icons'
import { db, isDemo } from '../../../lib/firebase'
import { demo, DEMO_DRILLS, DEMO_LEVELS } from '../../../lib/demo'
import { useAuth } from '../../../lib/auth'
import { useProfile } from '../../../lib/profile'
import { canOpenLesson } from '../../../lib/entitlement'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import type { Lesson, Step } from '../../../lib/types'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { t, field, locale, isRTL } = useLocale()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set())
  const [completed, setCompleted] = useState(false)
  const [siblings, setSiblings] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!user || !id) return
    setLoading(true)

    if (isDemo) {
      const l = DEMO_LEVELS.find((x) => x.id === id) ?? null
      setLesson(l)
      setSteps(DEMO_DRILLS.filter((d) => d.levelId === id))
      setDoneSteps(demo.drillsDone())
      setCompleted(demo.levelCompletions().has(id))
      setSiblings(l ? DEMO_LEVELS.filter((x) => x.skillId === l.skillId) : [])
      setLoading(false)
      return
    }

    try {
      const lessonSnap = await getDoc(doc(db(), 'levels', id))
      if (!lessonSnap.exists()) throw new Error('Lesson not found')
      const l = { id: lessonSnap.id, ...lessonSnap.data() } as Lesson

      const [stepSnap, doneSnap, completedSnap, sibSnap] = await Promise.all([
        getDocs(query(collection(db(), 'drills'), where('levelId', '==', id), orderBy('idx'))),
        getDocs(collection(db(), 'users', user.uid, 'drillCompletions')),
        getDoc(doc(db(), 'users', user.uid, 'levelCompletions', id)),
        getDocs(
          query(
            collection(db(), 'levels'),
            where('skillId', '==', l.skillId),
            where('isPublished', '==', true),
            orderBy('idx'),
          ),
        ),
      ])

      setLesson(l)
      setSteps(stepSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Step))
      setDoneSteps(new Set(doneSnap.docs.map((d) => d.id)))
      setCompleted(completedSnap.exists())
      setSiblings(sibSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Lesson))
    } catch (e) {
      Alert.alert(t('Could not load lesson', 'تعذر تحميل الدرس'), e instanceof Error ? e.message : '')
    } finally {
      setLoading(false)
    }
  }, [id, user, t])

  useEffect(() => {
    void load()
  }, [load])

  const toggleStep = async (stepId: string) => {
    if (!user) return
    if (isDemo) {
      demo.toggleDrill(stepId)
      setDoneSteps(demo.drillsDone())
      return
    }
    const was = doneSteps.has(stepId)
    // Optimistic, then rolled back on failure so the tick never lies about
    // what was saved.
    setDoneSteps((prev) => {
      const next = new Set(prev)
      if (was) next.delete(stepId)
      else next.add(stepId)
      return next
    })
    try {
      const ref = doc(db(), 'users', user.uid, 'drillCompletions', stepId)
      if (was) await deleteDoc(ref)
      else await setDoc(ref, { completedAt: serverTimestamp() })
    } catch (e) {
      setDoneSteps((prev) => {
        const next = new Set(prev)
        if (was) next.add(stepId)
        else next.delete(stepId)
        return next
      })
      Alert.alert(t('Could not save', 'تعذر الحفظ'), e instanceof Error ? e.message : '')
    }
  }

  const nextLesson = lesson ? siblings.find((s) => s.idx === lesson.idx + 1) ?? null : null

  const goNext = () => {
    if (nextLesson) router.replace(`/lesson/${nextLesson.id}`)
    else router.back()
  }

  const complete = async () => {
    if (!user || !id) return
    if (completed) return goNext()

    setSaving(true)
    try {
      if (isDemo) demo.completeLevel(id)
      else {
        // Create-only under the rules, so a second attempt is rejected rather
        // than re-recorded. serverTimestamp() is required: the rules compare it
        // to request.time, so a completion cannot be backdated.
        await setDoc(doc(db(), 'users', user.uid, 'levelCompletions', id), {
          completedAt: serverTimestamp(),
        })
      }
      setCompleted(true)
      goNext()
    } catch (e) {
      // Already-completed is not a failure worth interrupting for; it means the
      // lesson is done, which is where the learner wanted to get to.
      if ((e as { code?: string }).code === 'permission-denied') {
        setCompleted(true)
        goNext()
      } else {
        Alert.alert(t('Could not save', 'تعذر الحفظ'), e instanceof Error ? e.message : '')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (!lesson) return null

  if (!canOpenLesson(lesson.idx, profile?.entitlement ?? null)) {
    return <LockedLesson name={field(lesson, 'name')} idx={lesson.idx} />
  }

  const requiredDone = steps.filter((s) => s.isRequired).every((s) => doneSteps.has(s.id))

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 20, gap: 18 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
          <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
            <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isRTL ? 'رجوع ›' : '‹ Back'}</Txt>
          </View>
        </Pressable>

        <LessonVideo levelId={id} hasVideo={lesson.hasVideo === true} />

        <View style={{ gap: 4 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {t(
              `Lesson ${lesson.idx} of ${siblings.length}`,
              `الدرس ${localizeNumber(lesson.idx, locale)} من ${localizeNumber(siblings.length, locale)}`,
            )}
          </Txt>
          <Txt style={{ fontSize: 28, fontWeight: '700', letterSpacing: -0.9, color: colors.text }}>
            {field(lesson, 'name')}
          </Txt>
        </View>

        <View style={{ gap: 10 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {t('In this lesson', 'في هذا الدرس')}
          </Txt>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
            {steps.map((s, i) => {
              const ticked = doneSteps.has(s.id)
              return (
                <Pressable
                  key={s.id}
                  onPress={() => void toggleStep(s.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: ticked }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 13,
                    padding: 15,
                    borderBottomWidth: i === steps.length - 1 ? 0 : 1,
                    borderBottomColor: colors.separator,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: ticked ? 0 : 1.5,
                      borderColor: colors.textTertiary,
                      backgroundColor: ticked ? colors.success : 'transparent',
                    }}
                  >
                    {ticked && <IconCheck size={13} color="#fff" strokeWidth={3} />}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt style={{ fontSize: 16, color: colors.text }}>{field(s, 'name')}</Txt>
                    <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{field(s, 'meta')}</Txt>
                  </View>
                </Pressable>
              )
            })}
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 6 }}>
        <PrimaryButton
          label={
            completed
              ? nextLesson
                ? t('Next lesson', 'الدرس التالي')
                : t('Back to course', 'العودة للدورة')
              : nextLesson
                ? t('Complete and continue', 'إنهاء ومتابعة')
                : t('Complete lesson', 'إنهاء الدرس')
          }
          disabled={!completed && !requiredDone}
          busy={saving}
          onPress={() => void complete()}
        />
        {!completed && !requiredDone && (
          <Txt style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
            {t('Tick the steps above to finish this lesson.', 'أكمل الخطوات أعلاه لإنهاء الدرس.')}
          </Txt>
        )}
      </View>
    </View>
  )
}

function LockedLesson({ name, idx }: { name: string; idx: number }) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { t, locale } = useLocale()

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        padding: 24,
        paddingTop: insets.top + 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.accentTint,
        }}
      >
        <IconLock size={30} color={colors.accentDark} />
      </View>
      <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
        {t(`Lesson ${idx}`, `الدرس ${localizeNumber(idx, locale)}`)}
      </Txt>
      <Txt style={{ fontSize: 24, fontWeight: '700', letterSpacing: -0.7, color: colors.text, textAlign: 'center' }}>
        {name}
      </Txt>
      <Txt style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center', maxWidth: 300 }}>
        {t(
          'Lesson 1 of every course is free. The rest come with Crava Pro.',
          'الدرس الأول من كل دورة مجاني. الباقي مع كرافا برو.',
        )}
      </Txt>
      <View style={{ alignSelf: 'stretch', marginTop: 10, gap: 6 }}>
        <PrimaryButton label={t('See Crava Pro', 'اعرف كرافا برو')} onPress={() => router.push('/paywall')} />
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Txt style={{ textAlign: 'center', padding: 12, fontSize: 15, color: colors.textSecondary }}>
            {t('Back', 'رجوع')}
          </Txt>
        </Pressable>
      </View>
    </View>
  )
}
