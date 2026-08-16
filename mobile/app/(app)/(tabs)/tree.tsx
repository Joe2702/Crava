import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { Chip } from '../../../components/Chip'
import { IconCheck } from '../../../components/Icons'
import { TAB_BAR_CLEARANCE } from '../../../components/TabBar'
import { useCatalog } from '../../../lib/catalog'
import { useSkillPath, type LevelWithState } from '../../../lib/useSkillPath'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function Tree() {
  const { skills, activeSkillId, setActiveSkillId } = useCatalog()
  const { data, loading, error, reload } = useSkillPath()
  const { t, field, locale } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const n = (v: number) => localizeNumber(v, locale)

  if (loading && !data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (error || !data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
        <Txt style={{ fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'center' }}>
          {t('Could not load your path', 'تعذر تحميل مسارك')}
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

  const { skill, levels, cleared } = data

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 12,
        paddingBottom: TAB_BAR_CLEARANCE + insets.bottom,
        gap: 18,
      }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.accent} />}
    >
      <View>
        <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
          {t('Skill path', 'مسار المهارة')}
        </Txt>
        <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text, marginVertical: 2 }}>
          {field(skill, 'name')}
        </Txt>
        <Txt style={{ fontSize: 14, color: colors.textSecondary }}>
          {t(
            `${cleared} of ${levels.length} levels cleared`,
            `أنهيت ${n(cleared)} من ${n(levels.length)} مستويات`,
          )}
        </Txt>
      </View>

      {skills.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {skills.map((s) => (
            <Chip
              key={s.id}
              label={field(s, 'category')}
              selected={s.id === activeSkillId}
              onPress={() => setActiveSkillId(s.id)}
            />
          ))}
        </ScrollView>
      )}

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        {levels.map((lv, i) => (
          <LevelRow
            key={lv.id}
            level={lv}
            last={i === levels.length - 1}
            onPress={() => router.push(`/level/${lv.id}`)}
          />
        ))}
      </View>
    </ScrollView>
  )
}

function LevelRow({ level, last, onPress }: { level: LevelWithState; last: boolean; onPress: () => void }) {
  const { t, field, locale } = useLocale()
  const locked = level.state === 'locked'
  const current = level.state === 'current'
  const done = level.state === 'done'

  const badge = done ? t('Done', 'تم') : current ? t('Next', 'التالي') : t('Locked', 'مغلق')

  return (
    <Pressable
      disabled={locked}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        padding: 14,
        opacity: locked ? 0.45 : 1,
        borderBottomWidth: last ? 0 : 1,
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
          backgroundColor: done ? 'rgba(52,199,89,0.14)' : current ? colors.accent : colors.fill,
        }}
      >
        {done ? (
          <IconCheck size={16} color={colors.successDark} strokeWidth={3} />
        ) : (
          <Txt style={{ fontSize: 15, fontWeight: '600', color: current ? '#fff' : colors.textSecondary }}>
            {localizeNumber(level.idx, locale)}
          </Txt>
        )}
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Txt style={{ fontSize: 16, fontWeight: '600', letterSpacing: -0.25, color: colors.text }}>
          {field(level, 'name')}
        </Txt>
        <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
          {t('4 drills · 12 min', '٤ تمارين · ١٢ دقيقة')}
        </Txt>
      </View>

      <View
        style={{
          borderRadius: radius.pill,
          paddingVertical: 5,
          paddingHorizontal: 11,
          backgroundColor: current ? colors.accentTint : colors.fill,
        }}
      >
        <Txt style={{ fontSize: 12, fontWeight: '600', color: current ? colors.accentDark : colors.textSecondary }}>
          {badge}
        </Txt>
      </View>
    </Pressable>
  )
}
