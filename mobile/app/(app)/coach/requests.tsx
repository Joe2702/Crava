import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { useAuth } from '../../../lib/auth'
import { useCoachRole, fetchCoachBookings, decideBooking, type CoachBooking } from '../../../lib/coachRole'
import { fetchCoach, type Slot } from '../../../lib/coaches'
import { useLocale } from '../../../lib/i18n'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function CoachRequests() {
  const { user } = useAuth()
  const { coach } = useCoachRole()
  const { t, field, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [rows, setRows] = useState<CoachBooking[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user || !coach) {
      setLoading(false)
      return
    }
    setError(null)
    try {
      const [bookings, detail] = await Promise.all([fetchCoachBookings(user.uid), fetchCoach(coach.id)])
      setRows(bookings)
      setSlots(detail.slots)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load requests')
    } finally {
      setLoading(false)
    }
  }, [user, coach])

  useEffect(() => {
    void load()
  }, [load])

  const decide = async (row: CoachBooking, status: 'confirmed' | 'declined') => {
    setBusy(row.id)
    try {
      await decideBooking(row.id, status)
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)))
    } catch (e) {
      Alert.alert(t('Could not update', 'تعذر التحديث'), e instanceof Error ? e.message : '')
    } finally {
      setBusy(null)
    }
  }

  const pending = rows.filter((r) => r.status === 'requested')
  const settled = rows.filter((r) => r.status !== 'requested')

  const slotLabel = (slotId: string) => {
    const s = slots.find((x) => x.id === slotId)
    return s ? `${field(s, 'day')} ${s.time}` : '—'
  }

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

      <View>
        <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
          {t('Coaching', 'التدريب')}
        </Txt>
        <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
          {t('Requests', 'الطلبات')}
        </Txt>
      </View>

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
          {t('No requests yet.', 'لا طلبات بعد.')}
        </Txt>
      )}

      {pending.length > 0 && (
        <View style={{ gap: 10 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {t('Waiting on you', 'بانتظارك')}
          </Txt>
          {pending.map((r) => (
            <View
              key={r.id}
              style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, gap: 12, ...cardShadow }}
            >
              <View style={{ gap: 3 }}>
                <Txt style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {r.sessionType === 'form' ? t('Form review', 'مراجعة أداء') : t('Live 1-on-1', 'جلسة فردية')}
                </Txt>
                <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{slotLabel(r.slotId)}</Txt>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => void decide(r, 'confirmed')}
                  disabled={busy === r.id}
                  accessibilityRole="button"
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 11,
                    borderRadius: radius.pill,
                    backgroundColor: colors.success,
                    opacity: busy === r.id ? 0.5 : 1,
                  }}
                >
                  <Txt style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{t('Accept', 'قبول')}</Txt>
                </Pressable>
                <Pressable
                  onPress={() => void decide(r, 'declined')}
                  disabled={busy === r.id}
                  accessibilityRole="button"
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 11,
                    borderRadius: radius.pill,
                    backgroundColor: colors.fill,
                    opacity: busy === r.id ? 0.5 : 1,
                  }}
                >
                  <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{t('Decline', 'رفض')}</Txt>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {settled.length > 0 && (
        <View style={{ gap: 10 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {t('Decided', 'تم البت فيها')}
          </Txt>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
            {settled.map((r, i) => (
              <View
                key={r.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  gap: 12,
                  borderBottomWidth: i === settled.length - 1 ? 0 : 1,
                  borderBottomColor: colors.separator,
                }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                    {r.sessionType === 'form' ? t('Form review', 'مراجعة أداء') : t('Live 1-on-1', 'جلسة فردية')}
                  </Txt>
                  <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{slotLabel(r.slotId)}</Txt>
                </View>
                <View
                  style={{
                    borderRadius: radius.pill,
                    paddingHorizontal: 11,
                    paddingVertical: 5,
                    backgroundColor: r.status === 'confirmed' ? 'rgba(52,199,89,0.14)' : colors.fill,
                  }}
                >
                  <Txt
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: r.status === 'confirmed' ? colors.successDark : colors.textSecondary,
                    }}
                  >
                    {r.status === 'confirmed' ? t('Accepted', 'مقبول') : t('Declined', 'مرفوض')}
                  </Txt>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}
