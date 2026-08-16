import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { Txt } from '../../../components/Txt'
import { db, isDemo } from '../../../lib/firebase'
import { demo, DEMO_DRILLS, DEMO_LEVELS } from '../../../lib/demo'
import { useAuth } from '../../../lib/auth'
import type { Drill, Level } from '../../../lib/types'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { PrimaryButton } from '../../../components/ui'
import { LessonVideo } from '../../../components/LessonVideo'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { t, field, locale, isRTL } = useLocale()

  const [level, setLevel] = useState<Level | null>(null)
  const [drills, setDrills] = useState<Drill[]>([])
  const [done, setDone] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const n = (v: number) => localizeNumber(v, locale)

  const load = useCallback(async () => {
    if (!user || !id) return

    if (isDemo) {
      setLevel(DEMO_LEVELS.find((l) => l.id === id) ?? null)
      setDrills(DEMO_DRILLS.filter((d) => d.levelId === id))
      setDone(demo.drillsDone())
      setLoading(false)
      return
    }

    try {
      const [levelSnap, drillSnap, doneSnap] = await Promise.all([
        getDoc(doc(db(), 'levels', id)),
        getDocs(query(collection(db(), 'drills'), where('levelId', '==', id), orderBy('idx'))),
        getDocs(collection(db(), 'users', user.uid, 'drillCompletions')),
      ])
      if (!levelSnap.exists()) throw new Error('Level not found')
      setLevel({ id: levelSnap.id, ...levelSnap.data() } as Level)
      setDrills(drillSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Drill))
      setDone(new Set(doneSnap.docs.map((d) => d.id)))
    } catch (e) {
      Alert.alert(t('Could not load lesson', 'تعذر تحميل الدرس'), e instanceof Error ? e.message : '')
    } finally {
      setLoading(false)
    }
  }, [id, user, t])

  useEffect(() => {
    void load()
  }, [load])

  const toggleDrill = async (drillId: string) => {
    if (!user) return
    if (isDemo) {
      demo.toggleDrill(drillId)
      setDone(demo.drillsDone())
      return
    }
    const wasDone = done.has(drillId)
    // optimistic — this write grants nothing on its own, and the Cloud Function
    // re-checks completions server-side before awarding anything
    setDone((prev) => {
      const next = new Set(prev)
      if (wasDone) next.delete(drillId)
      else next.add(drillId)
      return next
    })

    const ref = doc(db(), 'users', user.uid, 'drillCompletions', drillId)
    try {
      if (wasDone) await deleteDoc(ref)
      else await setDoc(ref, { completedAt: serverTimestamp() })
    } catch (e) {
      setDone((prev) => {
        const next = new Set(prev)
        if (wasDone) next.add(drillId)
        else next.delete(drillId)
        return next
      })
      Alert.alert(t('Could not save', 'تعذر الحفظ'), e instanceof Error ? e.message : '')
    }
  }

  const complete = async () => {
    if (!user) return

    if (isDemo) {
      const { alreadyCompleted } = demo.completeLevel(id)
      Alert.alert(
        alreadyCompleted ? t('Already cleared', 'تم إنهاؤه سابقاً') : t('Level cleared', 'تم إنهاء المستوى'),
        alreadyCompleted
          ? t('You have already finished this level.', 'لقد أنهيت هذا المستوى بالفعل.')
          : t('+120 XP', '+١٢٠ نقطة'),
        [{ text: t('Continue', 'متابعة'), onPress: () => router.back() }],
      )
      return
    }

    setSaving(true)
    try {
      // Create-only under the rules, so a second attempt is rejected rather
      // than re-awarding. serverTimestamp() is required — the rules compare it
      // to request.time so completion dates cannot be backdated.
      await setDoc(doc(db(), 'users', user.uid, 'levelCompletions', id), {
        completedAt: serverTimestamp(),
      })
      Alert.alert(
        t('Level cleared', 'تم إنهاء المستوى'),
        t('+120 XP', '+١٢٠ نقطة'),
        [{ text: t('Continue', 'متابعة'), onPress: () => router.back() }],
      )
    } catch (e) {
      const already = (e as { code?: string }).code === 'permission-denied'
      Alert.alert(
        already ? t('Already cleared', 'تم إنهاؤه سابقاً') : t('Could not complete level', 'تعذر إنهاء المستوى'),
        already
          ? t('You have already finished this level.', 'لقد أنهيت هذا المستوى بالفعل.')
          : e instanceof Error
            ? e.message
            : '',
        [{ text: t('Continue', 'متابعة'), onPress: () => router.back() }],
      )
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

  const requiredDone = drills.filter((d) => d.isRequired).every((d) => done.has(d.id))

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, gap: 18 }}
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
        <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
          <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isRTL ? 'رجوع ›' : '‹ Back'}</Txt>
        </View>
      </Pressable>

      <LessonVideo levelId={id} hasVideo={level?.hasVideo === true} />

      <View>
        <Txt style={{ fontSize: 28, fontWeight: '700', letterSpacing: -0.8, color: colors.text }}>
          {level ? field(level, 'name') : ''}
        </Txt>
        <Txt style={{ fontSize: 14, color: colors.textSecondary, marginTop: 6 }}>
          {t(`Level ${level?.idx} of 6`, `المستوى ${n(level?.idx ?? 0)} من ٦`)}
        </Txt>
      </View>

      <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>{t('Drills', 'التمارين')}</Txt>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        {drills.map((d, i) => {
          const isDone = done.has(d.id)
          return (
            <Pressable
              key={d.id}
              onPress={() => toggleDrill(d.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isDone }}
              accessibilityLabel={field(d, 'name')}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 14,
                padding: 16,
                borderBottomWidth: i === drills.length - 1 ? 0 : 0.5,
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
                  backgroundColor: isDone ? colors.accent : 'rgba(118,118,128,0.14)',
                }}
              >
                {isDone && <Txt style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Txt>}
              </View>
              <View style={{ flex: 1 }}>
                <Txt
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: isDone ? colors.textSecondary : colors.text,
                    textDecorationLine: isDone ? 'line-through' : 'none',
                  }}
                >
                  {field(d, 'name')}
                </Txt>
                <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
                  {field(d, 'meta')}
                  {d.isRequired ? '' : t(' · optional', ' · اختياري')}
                </Txt>
              </View>
            </Pressable>
          )
        })}
      </View>

      <PrimaryButton
        label={
          requiredDone
            ? t('Mark level complete · +120 XP', 'أنهِ المستوى · +١٢٠ نقطة')
            : t('Finish the drills to unlock', 'أكمل التمارين للفتح')
        }
        onPress={complete}
        disabled={!requiredDone}
        busy={saving}
      />
    </ScrollView>
  )
}
