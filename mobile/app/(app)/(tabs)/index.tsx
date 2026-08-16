import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native' 
import { Txt } from '../../../components/Txt'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSkillPath } from '../../../lib/useSkillPath'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { LanguageToggle } from '../../../components/LanguageToggle'
import { cardShadow, colors, radius } from '../../../theme/tokens'
import { TAB_BAR_CLEARANCE } from '../../../components/TabBar'

const XP_MAX = 2000

export default function Home() {
  const { data, loading, error, reload } = useSkillPath()
  const { t, field, locale } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const n = (v: number) => localizeNumber(v, locale)

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

  const { skill, levels, user, xp, streak, cleared } = data
  const xpPct = Math.min(100, Math.round((xp / XP_MAX) * 100))

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: TAB_BAR_CLEARANCE + insets.bottom, gap: 18 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.accent} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>Crava</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <LanguageToggle />
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel={t('Profile', 'حسابي')}
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.pill,
              backgroundColor: colors.fill,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Txt style={{ fontSize: 15 }}>☰</Txt>
          </Pressable>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flexShrink: 1 }}>
          <Txt style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>
            {t('Welcome back', 'أهلاً بعودتك')}
          </Txt>
          <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
            {user.displayName || t('Athlete', 'بطل')}
          </Txt>
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
          <Txt style={{ fontSize: 17, fontWeight: '700', color: colors.accentDark }}>{n(streak)}</Txt>
          <Txt style={{ fontSize: 12, fontWeight: '600', color: colors.accentDark }}>
            {t('day streak', 'يوم متتالي')}
          </Txt>
        </View>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, gap: 12, ...cardShadow }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{t('Progress', 'التقدم')}</Txt>
          <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
            {n(xp)} / {n(XP_MAX)} XP
          </Txt>
        </View>
        <View style={{ height: 12, borderRadius: radius.pill, backgroundColor: colors.fill, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${xpPct}%`, backgroundColor: colors.accent, borderRadius: radius.pill }} />
        </View>
      </View>

      <View>
        <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
          {t('Skill path', 'مسار المهارة')}
        </Txt>
        <Txt style={{ fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: colors.text, marginTop: 2 }}>
          {field(skill, 'name')}
        </Txt>
        <Txt style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
          {t(
            `${cleared} of ${levels.length} levels cleared`,
            `أنهيت ${n(cleared)} من ${n(levels.length)} مستويات`,
          )}
        </Txt>
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        {levels.map((l, i) => {
          const locked = l.state === 'locked'
          const statusLabel =
            l.state === 'done' ? t('Done', 'تم') : l.state === 'current' ? t('Next', 'التالي') : t('Locked', 'مغلق')
          return (
            <Pressable
              key={l.id}
              disabled={locked}
              accessibilityRole="button"
              accessibilityState={{ disabled: locked }}
              accessibilityLabel={`${field(l, 'name')} — ${statusLabel}`}
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
                <Txt
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color:
                      l.state === 'done' ? colors.successDark : l.state === 'current' ? '#fff' : colors.textSecondary,
                  }}
                >
                  {l.state === 'done' ? '✓' : n(l.idx)}
                </Txt>
              </View>
              <View style={{ flex: 1 }}>
                <Txt style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{field(l, 'name')}</Txt>
                <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
                  {t('4 drills · 12 min', '٤ تمارين · ١٢ دقيقة')}
                </Txt>
              </View>
              <View
                style={{
                  borderRadius: radius.pill,
                  paddingHorizontal: 11,
                  paddingVertical: 5,
                  backgroundColor: l.state === 'current' ? colors.accentTint : colors.fill,
                }}
              >
                <Txt
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: l.state === 'current' ? colors.accentDark : colors.textSecondary,
                  }}
                >
                  {statusLabel}
                </Txt>
              </View>
            </Pressable>
          )
        })}
      </View>
    </ScrollView>
  )
}
