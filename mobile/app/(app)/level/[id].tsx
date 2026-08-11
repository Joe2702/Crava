import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native' 
import { Txt } from '../../../components/Txt'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../lib/database.types'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { PrimaryButton } from '../../../components/ui'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { t, field, locale, isRTL } = useLocale()

  const [level, setLevel] = useState<Tables<'levels'> | null>(null)
  const [drills, setDrills] = useState<Tables<'drills'>[]>([])
  const [done, setDone] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const n = (v: number) => localizeNumber(v, locale)

  const load = useCallback(async () => {
    const [levelRes, drillRes] = await Promise.all([
      supabase.from('levels').select('*').eq('id', id).single(),
      supabase.from('drills').select('*').eq('level_id', id).order('idx'),
    ])
    if (levelRes.error || drillRes.error) {
      Alert.alert(t('Could not load lesson', 'تعذر تحميل الدرس'), levelRes.error?.message ?? drillRes.error?.message)
      setLoading(false)
      return
    }
    const completions = await supabase
      .from('user_drill_completions')
      .select('drill_id')
      .in('drill_id', drillRes.data.map((d) => d.id))

    setLevel(levelRes.data)
    setDrills(drillRes.data)
    setDone(new Set(completions.data?.map((c) => c.drill_id) ?? []))
    setLoading(false)
  }, [id, t])

  useEffect(() => {
    void load()
  }, [load])

  const toggleDrill = async (drillId: string) => {
    const wasDone = done.has(drillId)
    // optimistic — the row is owned by this user and guarded by RLS, so the
    // only realistic failure is offline, which the revert below handles
    setDone((prev) => {
      const next = new Set(prev)
      if (wasDone) next.delete(drillId)
      else next.add(drillId)
      return next
    })

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    const { error } = wasDone
      ? await supabase.from('user_drill_completions').delete().eq('drill_id', drillId).eq('user_id', userId)
      : await supabase.from('user_drill_completions').insert({ drill_id: drillId, user_id: userId })

    if (error) {
      setDone((prev) => {
        const next = new Set(prev)
        if (wasDone) next.add(drillId)
        else next.delete(drillId)
        return next
      })
      Alert.alert(t('Could not save', 'تعذر الحفظ'), error.message)
    }
  }

  const complete = async () => {
    setSaving(true)
    const { data, error } = await supabase.rpc('complete_level', { p_level_id: id })
    setSaving(false)
    if (error) {
      Alert.alert(t('Could not complete level', 'تعذر إنهاء المستوى'), error.message)
      return
    }
    const result = data?.[0]
    Alert.alert(
      result?.already_completed ? t('Already cleared', 'تم إنهاؤه سابقاً') : t('Level cleared', 'تم إنهاء المستوى'),
      result?.already_completed
        ? t('You have already finished this level.', 'لقد أنهيت هذا المستوى بالفعل.')
        : t(
            `+120 XP · ${result?.streak_count} day streak`,
            `+١٢٠ نقطة · ${n(result?.streak_count ?? 0)} يوم متتالي`,
          ),
      [{ text: t('Continue', 'متابعة'), onPress: () => router.back() }],
    )
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  const requiredDone = drills.filter((d) => d.is_required).every((d) => done.has(d.id))

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, gap: 18 }}
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
        <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
          <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
            {isRTL ? 'رجوع ›' : '‹ Back'}
          </Txt>
        </View>
      </Pressable>

      <View
        style={{
          height: 200,
          borderRadius: radius.xxl,
          backgroundColor: '#232326',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Txt style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center' }}>
          {level?.video_id
            ? t('Video ready', 'الفيديو جاهز')
            : t('Video not uploaded yet', 'لم يتم رفع الفيديو بعد')}
        </Txt>
      </View>

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
                  {d.is_required ? '' : t(' · optional', ' · اختياري')}
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
