import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { PrimaryButton } from '../../../components/ui'
import { Chip } from '../../../components/Chip'
import { IconCheck, IconCheckBig } from '../../../components/Icons'
import { useAuth } from '../../../lib/auth'
import { useProfile } from '../../../lib/profile'
import { fetchCoach, requestBooking, FORM_REVIEW_EGP, type Coach, type SessionType, type Slot } from '../../../lib/coaches'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function Booking() {
  const { coachId } = useLocalSearchParams<{ coachId: string }>()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { t, field, locale, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [coach, setCoach] = useState<Coach | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionType, setSessionType] = useState<SessionType>('live')
  const [slotId, setSlotId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [requested, setRequested] = useState(false)

  const egp = (n: number) => t(`EGP ${n}`, `${localizeNumber(n, 'ar')} ج.م`)

  const load = useCallback(async () => {
    if (!coachId) return
    try {
      const res = await fetchCoach(coachId)
      setCoach(res.coach)
      setSlots(res.slots)
      setSlotId(res.slots[0]?.id ?? null)
    } catch (e) {
      Alert.alert(t('Could not load coach', 'تعذر تحميل المدرب'), e instanceof Error ? e.message : '')
    } finally {
      setLoading(false)
    }
  }, [coachId, t])

  useEffect(() => {
    void load()
  }, [load])

  const submit = async () => {
    if (!user || !coach || !slotId) return
    setSending(true)
    try {
      await requestBooking({
        uid: user.uid,
        userName: profile?.displayName ?? user.displayName ?? null,
        coachId: coach.id,
        coachOwnerUid: coach.ownerUid ?? null,
        slotId,
        sessionType,
      })
      setRequested(true)
    } catch (e) {
      Alert.alert(t('Could not request', 'تعذر الحجز'), e instanceof Error ? e.message : '')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (!coach) return null

  const price = sessionType === 'form' ? FORM_REVIEW_EGP : coach.rateEgp
  const slot = slots.find((s) => s.id === slotId)

  if (requested) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 32, gap: 18 }}
      >
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: radius.pill,
            backgroundColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconCheckBig color="#fff" />
        </View>
        <View>
          <Txt style={{ fontSize: 30, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
            {t('Request sent', 'تم إرسال الطلب')}
          </Txt>
          <Txt style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary, marginTop: 8 }}>
            {t(
              `${coach.name_en} confirms or suggests another time. Nothing is charged yet.`,
              `${coach.name_ar} سيؤكد أو يقترح موعداً آخر. لم يتم خصم أي مبلغ.`,
            )}
          </Txt>
        </View>
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: 18, ...cardShadow }}>
          {[
            [t('Coach', 'المدرب'), field(coach, 'name')],
            [t('Session', 'الجلسة'), sessionType === 'form' ? t('Form review', 'مراجعة أداء') : t('Live 1-on-1', 'جلسة فردية')],
            [t('When', 'الموعد'), slot ? `${field(slot, 'day')} ${slot.time}` : '—'],
            [t('Price', 'السعر'), egp(price)],
          ].map(([k, v], i, arr) => (
            <View
              key={k}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderBottomWidth: i === arr.length - 1 ? 0 : 1,
                borderBottomColor: colors.separator,
              }}
            >
              <Txt style={{ fontSize: 15, color: colors.textSecondary }}>{k}</Txt>
              <Txt style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{v}</Txt>
            </View>
          ))}
        </View>
        <PrimaryButton label={t('Done', 'تم')} onPress={() => router.back()} />
      </ScrollView>
    )
  }

  const sessions: { id: SessionType; name: string; meta: string; price: number }[] = [
    {
      id: 'form',
      name: t('Form review', 'مراجعة أداء'),
      meta: t('Send a clip, notes in 48h', 'أرسل مقطعاً واستلم ملاحظات خلال ٤٨ ساعة'),
      price: FORM_REVIEW_EGP,
    },
    {
      id: 'live',
      name: t('Live 1-on-1', 'جلسة فردية مباشرة'),
      meta: t('60 minutes, video call', '٦٠ دقيقة، مكالمة فيديو'),
      price: coach.rateEgp,
    },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 20, gap: 18 }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
          <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
            <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isRTL ? 'رجوع ›' : '‹ Back'}</Txt>
          </View>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 64, height: 64, borderRadius: radius.pill, backgroundColor: '#d4d4da' }} />
          <View style={{ flex: 1, gap: 3 }}>
            <Txt style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.6, color: colors.text }}>
              {field(coach, 'name')}
            </Txt>
            <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
              {field(coach, 'city')} · ★ {localizeNumber(coach.rating, locale)}
            </Txt>
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {t('Session type', 'نوع الجلسة')}
          </Txt>
          {sessions.map((s) => {
            const active = sessionType === s.id
            return (
              <Pressable
                key={s.id}
                onPress={() => setSessionType(s.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor: colors.surface,
                  borderRadius: radius.lg,
                  padding: 18,
                  borderWidth: 2,
                  borderColor: active ? colors.accent : 'transparent',
                  ...cardShadow,
                }}
              >
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
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>{s.name}</Txt>
                  <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{s.meta}</Txt>
                </View>
                <Txt style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>{egp(s.price)}</Txt>
              </Pressable>
            )
          })}
        </View>

        <View style={{ gap: 10 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>
            {t('Pick a time', 'اختر موعداً')}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {slots.map((s) => (
              <Chip
                key={s.id}
                label={`${field(s, 'day')} ${s.time}`}
                selected={s.id === slotId}
                onPress={() => setSlotId(s.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}>
        <PrimaryButton
          label={t('Request this session', 'اطلب هذه الجلسة')}
          disabled={!slotId}
          busy={sending}
          onPress={() => void submit()}
        />
        <Txt style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
          {t(
            'The coach confirms before anything is charged.',
            'يؤكد المدرب قبل خصم أي مبلغ.',
          )}
        </Txt>
      </View>
    </View>
  )
}
