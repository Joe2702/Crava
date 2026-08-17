import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../components/Txt'
import { useAuth } from '../../lib/auth'
import { isDemo } from '../../lib/firebase'
import { fetchMyBookings, type BookingRow } from '../../lib/completions'
import { fetchCoaches, type Coach } from '../../lib/coaches'
import { useLocale } from '../../lib/i18n'
import { cardShadow, colors, radius } from '../../theme/tokens'

const STATUS_TINT: Record<string, { bg: string; fg: string }> = {
  requested: { bg: colors.fill, fg: colors.textSecondary },
  confirmed: { bg: 'rgba(52,199,89,0.14)', fg: colors.successDark },
  declined: { bg: colors.accentTint, fg: colors.accentDark },
}

export default function Sessions() {
  const { user } = useAuth()
  const { t, field, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [rows, setRows] = useState<BookingRow[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user || isDemo) {
      setLoading(false)
      return
    }
    setError(null)
    try {
      const [bookings, coachList] = await Promise.all([fetchMyBookings(user.uid), fetchCoaches()])
      setRows(bookings)
      setCoaches(coachList)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load sessions')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const label = (status: string) =>
    status === 'confirmed'
      ? t('Confirmed', 'مؤكد')
      : status === 'declined'
        ? t('Declined', 'مرفوض')
        : t('Awaiting the coach', 'بانتظار المدرب')

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, gap: 16 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
        <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
          <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isRTL ? 'رجوع ›' : '‹ Back'}</Txt>
        </View>
      </Pressable>

      <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
        {t('My sessions', 'جلساتي')}
      </Txt>

      {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />}

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

      {!loading && !error && rows.length === 0 && (
        <Txt style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary }}>
          {t(
            'No sessions yet. Book one from the Coaches tab.',
            'لا جلسات بعد. احجز واحدة من تبويب المدربين.',
          )}
        </Txt>
      )}

      {rows.length > 0 && (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
          {rows.map((r, i) => {
            const coach = coaches.find((c) => c.id === r.coachId)
            const tint = STATUS_TINT[r.status] ?? STATUS_TINT.requested
            return (
              <View
                key={r.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 13,
                  padding: 16,
                  borderBottomWidth: i === rows.length - 1 ? 0 : 1,
                  borderBottomColor: colors.separator,
                }}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                    {coach ? field(coach, 'name') : r.coachId}
                  </Txt>
                  <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
                    {r.sessionType === 'form'
                      ? t('Form review', 'مراجعة أداء')
                      : t('Live 1-on-1', 'جلسة فردية')}
                  </Txt>
                </View>
                <View style={{ borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 5, backgroundColor: tint.bg }}>
                  <Txt style={{ fontSize: 12, fontWeight: '600', color: tint.fg }}>{label(r.status)}</Txt>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}
