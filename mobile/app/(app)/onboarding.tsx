import { useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Txt } from '../../components/Txt'
import { PrimaryButton } from '../../components/ui'
import { IconCheck } from '../../components/Icons'
import { db, isDemo } from '../../lib/firebase'
import { demo } from '../../lib/demo'
import { useAuth } from '../../lib/auth'
import { useCatalog } from '../../lib/catalog'
import { enroll } from '../../lib/enrollment'
import { useLocale } from '../../lib/i18n'
import { syncReminders } from '../../lib/reminders'
import { cardShadow, colors, radius } from '../../theme/tokens'

interface Option {
  id: string
  title: string
  meta: string
}

export default function Onboarding() {
  const { user } = useAuth()
  const { courses } = useCatalog()
  const { t, field } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [goal, setGoal] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const GOALS: Record<string, number> = { '2': 2, '4': 4, '6': 6 }

  const steps: { kicker: string; title: string; sub: string; opts: Option[]; value: string | null; pick: (id: string) => void }[] = [
    {
      kicker: t('Step 1 of 2', 'الخطوة ١ من ٢'),
      title: t('What do you want to learn?', 'ماذا تريد أن تتعلم؟'),
      sub: t('Pick a course to start with. You can take others later.', 'اختر دورة للبدء. يمكنك أخذ غيرها لاحقاً.'),
      opts: courses.map((c) => ({
        id: c.id,
        title: field(c, 'name'),
        meta: t(`${c.category_en} · 6 lessons`, `${c.category_ar} · ٦ دروس`),
      })),
      value: courseId,
      pick: setCourseId,
    },
    {
      kicker: t('Step 2 of 2', 'الخطوة ٢ من ٢'),
      title: t('How often will you study?', 'كم مرة ستدرس؟'),
      sub: t('We will remind you on those days.', 'سنذكرك في تلك الأيام.'),
      opts: [
        { id: '2', title: t('2 days a week', 'يومان أسبوعياً'), meta: t('Light', 'خفيف') },
        { id: '4', title: t('4 days a week', '٤ أيام أسبوعياً'), meta: t('Recommended', 'موصى به') },
        { id: '6', title: t('6 days a week', '٦ أيام أسبوعياً'), meta: t('Serious', 'جاد') },
      ],
      value: goal,
      pick: setGoal,
    },
  ]

  const current = steps[step]

  const finish = async (skipped: boolean) => {
    if (!user) return
    setSaving(true)
    // Skipping still marks the user onboarded — the screen must not reappear
    // every launch — it just leaves the answers unset.
    const answers = { weeklyGoal: skipped || !goal ? null : GOALS[goal] }
    try {
      if (isDemo) demo.updateUser({ ...answers, onboardedAt: Date.now() })
      else
        await setDoc(
          doc(db(), 'users', user.uid),
          { ...answers, onboardedAt: serverTimestamp() },
          { merge: true },
        )
      // Scheduled from the goal just chosen rather than waiting for the
      // profile snapshot to come back.
      void syncReminders({
        enabled: true,
        weeklyGoal: answers.weeklyGoal,
        title: t('Time to study', 'وقت الدراسة'),
        body: t('Your next lesson is waiting.', 'درسك التالي في انتظارك.'),
      }).catch(() => {})
      // Picking a course in step 1 is an enrolment — otherwise My learning is
      // empty the moment onboarding finishes, which is the wrong first screen.
      if (!skipped && courseId) await enroll(user.uid, courseId).catch(() => {})
      router.replace('/')
    } catch (e) {
      Alert.alert(t('Could not save', 'تعذر الحفظ'), e instanceof Error ? e.message : '')
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12 }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={{
                height: 5,
                flex: 1,
                borderRadius: radius.pill,
                backgroundColor: i <= step ? colors.accent : 'rgba(118,118,128,0.2)',
              }}
            />
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>{current.kicker}</Txt>
          <Txt style={{ fontSize: 34, fontWeight: '700', letterSpacing: -1.2, lineHeight: 37, color: colors.text }}>
            {current.title}
          </Txt>
          <Txt style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary }}>{current.sub}</Txt>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden', ...cardShadow }}>
          {current.opts.map((o, i) => {
            const active = current.value === o.id
            return (
              <Pressable
                key={o.id}
                onPress={() => current.pick(o.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 13,
                  padding: 16,
                  backgroundColor: active ? 'rgba(228,52,26,0.06)' : undefined,
                  borderBottomWidth: i === current.opts.length - 1 ? 0 : 1,
                  borderBottomColor: colors.separator,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{o.title}</Txt>
                  <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{o.meta}</Txt>
                </View>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: active ? 0 : 1.5,
                    borderColor: colors.textTertiary,
                    backgroundColor: active ? colors.accent : 'transparent',
                  }}
                >
                  {active && <IconCheck size={13} color="#fff" strokeWidth={3} />}
                </View>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 6 }}>
        <PrimaryButton
          label={step < 1 ? t('Continue', 'متابعة') : t('Start learning', 'ابدأ التعلم')}
          disabled={!current.value}
          busy={saving}
          onPress={() => (step < 1 ? setStep(step + 1) : void finish(false))}
        />
        <Pressable onPress={() => void finish(true)} accessibilityRole="button" disabled={saving}>
          <Txt style={{ textAlign: 'center', padding: 12, fontSize: 15, color: colors.textSecondary }}>
            {t('Skip for now', 'تخطي الآن')}
          </Txt>
        </Pressable>
      </View>
    </View>
  )
}
