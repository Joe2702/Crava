import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { IconChevronRight } from '../../../components/Icons'
import { TAB_BAR_CLEARANCE } from '../../../components/TabBar'
import { fetchCoaches, type Coach } from '../../../lib/coaches'
import { isDemo } from '../../../lib/firebase'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function Coaches() {
  const { t, field, locale } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (isDemo) {
      setLoading(false)
      return
    }
    setError(null)
    try {
      setCoaches(await fetchCoaches())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load coaches')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 12,
        paddingBottom: TAB_BAR_CLEARANCE + insets.bottom,
        gap: 16,
      }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
    >
      <View>
        <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
          {t('Marketplace', 'السوق')}
        </Txt>
        <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text, marginVertical: 2 }}>
          {t('Verified coaches', 'مدربون معتمدون')}
        </Txt>
        <Txt style={{ fontSize: 14, lineHeight: 20, color: colors.textSecondary }}>
          {t(
            'Local athletes. Form reviews and live 1-on-1 sessions.',
            'رياضيون محليون. مراجعة أداء وجلسات فردية مباشرة.',
          )}
        </Txt>
      </View>

      {isDemo && (
        <Txt style={{ fontSize: 15, color: colors.textSecondary, paddingVertical: 24 }}>
          {t('Booking needs a real account.', 'الحجز يحتاج حساباً حقيقياً.')}
        </Txt>
      )}

      {loading && !isDemo && <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />}

      {error && (
        <View style={{ gap: 8 }}>
          <Txt style={{ fontSize: 15, color: colors.textSecondary }}>{error}</Txt>
          <Pressable onPress={load} accessibilityRole="button">
            <Txt style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>
              {t('Try again', 'حاول مرة أخرى')}
            </Txt>
          </Pressable>
        </View>
      )}

      {coaches.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => router.push(`/booking/${c.id}`)}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            padding: 16,
            ...cardShadow,
          }}
        >
          <View style={{ width: 64, height: 64, borderRadius: radius.pill, backgroundColor: '#d4d4da' }} />
          <View style={{ flex: 1, gap: 4 }}>
            <Txt style={{ fontSize: 17, fontWeight: '600', letterSpacing: -0.35, color: colors.text }}>
              {field(c, 'name')}
            </Txt>
            <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{field(c, 'city')}</Txt>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 3 }}>
              <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Txt style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                  ★ {localizeNumber(c.rating, locale)}
                </Txt>
              </View>
              <View style={{ backgroundColor: colors.accentTint, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Txt style={{ fontSize: 12, fontWeight: '600', color: colors.accentDark }}>
                  {t('Verified', 'معتمد')}
                </Txt>
              </View>
            </View>
            <Txt style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
              {t(
                `From EGP ${c.rateEgp} per session`,
                `من ${localizeNumber(c.rateEgp, 'ar')} ج.م للجلسة`,
              )}
            </Txt>
          </View>
          <IconChevronRight />
        </Pressable>
      ))}
    </ScrollView>
  )
}
