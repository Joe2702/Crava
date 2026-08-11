import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../../lib/supabase'
import type { Tables } from '../../../lib/database.types'
import { PrimaryButton } from '../../../components/ui'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function LevelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [level, setLevel] = useState<Tables<'levels'> | null>(null)
  const [drills, setDrills] = useState<Tables<'drills'>[]>([])
  const [done, setDone] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [levelRes, drillRes] = await Promise.all([
      supabase.from('levels').select('*').eq('id', id).single(),
      supabase.from('drills').select('*').eq('level_id', id).order('idx'),
    ])
    if (levelRes.error || drillRes.error) {
      Alert.alert('Could not load lesson', levelRes.error?.message ?? drillRes.error?.message)
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
  }, [id])

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
      Alert.alert('Could not save', error.message)
    }
  }

  const complete = async () => {
    setSaving(true)
    const { data, error } = await supabase.rpc('complete_level', { p_level_id: id })
    setSaving(false)
    if (error) {
      Alert.alert('Could not complete level', error.message)
      return
    }
    const result = data?.[0]
    Alert.alert(
      result?.already_completed ? 'Already cleared' : 'Level cleared',
      result?.already_completed
        ? 'You have already finished this level.'
        : `+120 XP · ${result?.streak_count} day streak`,
      [{ text: 'Continue', onPress: () => router.back() }],
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
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>‹ Back</Text>
        </View>
      </Pressable>

      <View
        style={{
          height: 200,
          borderRadius: radius.xxl,
          backgroundColor: '#232326',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
          {level?.video_id ? 'Video ready' : 'Video not uploaded yet'}
        </Text>
      </View>

      <View>
        <Text style={{ fontSize: 28, fontWeight: '700', letterSpacing: -0.8, color: colors.text }}>
          {level?.name_en}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 6 }}>Level {level?.idx} of 6</Text>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        {drills.map((d, i) => {
          const isDone = done.has(d.id)
          return (
            <Pressable
              key={d.id}
              onPress={() => toggleDrill(d.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isDone }}
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
                {isDone && <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: isDone ? colors.textSecondary : colors.text,
                    textDecorationLine: isDone ? 'line-through' : 'none',
                  }}
                >
                  {d.name_en}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  {d.meta_en}
                  {d.is_required ? '' : ' · optional'}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      <PrimaryButton
        label={requiredDone ? 'Mark level complete · +120 XP' : 'Finish the drills to unlock'}
        onPress={complete}
        disabled={!requiredDone}
        busy={saving}
      />
    </ScrollView>
  )
}
