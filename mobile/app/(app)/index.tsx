import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSkillPath } from '../../lib/useSkillPath'
import { useAuth } from '../../lib/auth'
import { cardShadow, colors, radius } from '../../theme/tokens'

const XP_MAX = 2000

export default function Home() {
  const { data, loading, error, reload } = useSkillPath()
  const { signOut } = useAuth()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12, backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>Could not load your path</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>{error}</Text>
        <Pressable onPress={reload} accessibilityRole="button">
          <Text style={{ color: colors.accent, fontWeight: '600', fontSize: 15, paddingVertical: 8 }}>Try again</Text>
        </Pressable>
      </View>
    )
  }

  const { skill, levels, stats, profile } = data
  const cleared = levels.filter((l) => l.state === 'done').length
  const current = levels.find((l) => l.state === 'current')
  const xpPct = Math.min(100, Math.round((stats.xp / XP_MAX) * 100))

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, gap: 18 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.accent} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>Welcome back</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
            {profile.display_name || 'Athlete'}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.accentTint,
            borderRadius: radius.pill,
            paddingHorizontal: 14,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '700', color: colors.accentDark }}>{stats.streak_count}</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accentDark }}>day streak</Text>
        </View>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, gap: 12, ...cardShadow }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Progress</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>{stats.xp} / {XP_MAX} XP</Text>
        </View>
        <View style={{ height: 12, borderRadius: radius.pill, backgroundColor: colors.fill, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${xpPct}%`, backgroundColor: colors.accent, borderRadius: radius.pill }} />
        </View>
      </View>

      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
        {skill.name_en} · {cleared} of {levels.length} levels cleared
      </Text>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        {levels.map((l, i) => {
          const locked = l.state === 'locked'
          return (
            <Pressable
              key={l.id}
              disabled={locked}
              accessibilityRole="button"
              accessibilityState={{ disabled: locked }}
              onPress={() => router.push({ pathname: '/level/[id]', params: { id: l.id } })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                opacity: locked ? 0.45 : 1,
                borderBottomWidth: i === levels.length - 1 ? 0 : 0.5,
                borderBottomColor: colors.separator,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    l.state === 'done' ? 'rgba(52,199,89,0.14)' : l.state === 'current' ? colors.accent : colors.fill,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: l.state === 'done' ? colors.successDark : l.state === 'current' ? '#fff' : colors.textSecondary,
                  }}
                >
                  {l.state === 'done' ? '✓' : l.idx}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{l.name_en}</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>4 drills · 12 min</Text>
              </View>
              <View
                style={{
                  borderRadius: radius.pill,
                  paddingHorizontal: 11,
                  paddingVertical: 5,
                  backgroundColor: l.state === 'current' ? colors.accentTint : colors.fill,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: l.state === 'current' ? colors.accentDark : colors.textSecondary,
                  }}
                >
                  {l.state === 'done' ? 'Done' : l.state === 'current' ? 'Next' : 'Locked'}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      {current && (
        <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
          Up next: {current.name_en}
        </Text>
      )}

      <Pressable onPress={signOut} accessibilityRole="button">
        <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 15, paddingVertical: 12 }}>
          Sign out
        </Text>
      </Pressable>
    </ScrollView>
  )
}
