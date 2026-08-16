import { useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../components/Txt'
import { PrimaryButton } from '../../components/ui'
import { IconCheck } from '../../components/Icons'
import { useLocale, localizeNumber } from '../../lib/i18n'
import { cardShadow, colors, radius } from '../../theme/tokens'

type PlanId = 'monthly' | 'annual'

export default function Paywall() {
  const { t, locale } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [plan, setPlan] = useState<PlanId>('annual')

  const egp = (n: number) =>
    t(`EGP ${n.toLocaleString('en')}`, `${localizeNumber(n, 'ar')} ج.م`)

  const plans: { id: PlanId; name: string; meta: string; price: string; note: string }[] = [
    {
      id: 'monthly',
      name: t('Monthly', 'شهري'),
      meta: t('Billed every month', 'يُحصّل شهرياً'),
      price: egp(149),
      note: '',
    },
    {
      id: 'annual',
      name: t('Annual', 'سنوي'),
      meta: t('Billed once a year', 'يُحصّل مرة سنوياً'),
      price: egp(1190),
      note: t('Save 33%', 'وفر ٣٣٪'),
    },
  ]

  const features = [
    t('All four skill paths, 24 levels total', 'كل المسارات الأربعة، ٢٤ مستوى'),
    t('Arabic-first instruction with English subtitles', 'شرح بالعربية أولاً مع ترجمة إنجليزية'),
    t('Offline course packs for weak connections', 'حزم تحميل للمشاهدة دون إنترنت'),
    t('One free coach form review each month', 'مراجعة أداء مجانية مع مدرب شهرياً'),
    t('Crava Certified badge on completion', 'شارة كرافا المعتمدة عند الإنهاء'),
  ]

  /**
   * Deliberately cannot grant anything. Entitlement is not a client-writable
   * field — the security rules leave it out of the user document's updatable
   * keys — so a subscription can only ever be written by a verified store
   * receipt. Until RevenueCat is wired up there is nothing honest for this
   * button to do but say so.
   */
  const subscribe = () => {
    Alert.alert(
      t('Not available yet', 'غير متاح بعد'),
      t(
        'Payments are not connected yet. This build cannot take a subscription.',
        'لم يتم ربط الدفع بعد. لا يمكن لهذه النسخة تفعيل اشتراك.',
      ),
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 18 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('Close', 'إغلاق')}
          style={{
            alignSelf: 'flex-start',
            width: 34,
            height: 34,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.fill,
          }}
        >
          <Txt style={{ fontSize: 17, color: colors.textSecondary }}>✕</Txt>
        </Pressable>

        <View
          style={{
            borderRadius: 28,
            padding: 26,
            backgroundColor: colors.accentDark,
            shadowColor: colors.accentDark,
            shadowOpacity: 0.32,
            shadowRadius: 44,
            shadowOffset: { width: 0, height: 16 },
            elevation: 6,
          }}
        >
          <Txt style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.85)' }}>
            CRAVA PRO
          </Txt>
          <Txt style={{ fontSize: 34, fontWeight: '700', letterSpacing: -1.2, lineHeight: 36, color: '#fff', marginTop: 12 }}>
            {t('Train without limits', 'تدرب بلا حدود')}
          </Txt>
          <Txt style={{ fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.92)', marginTop: 10 }}>
            {t(
              'Every skill path, every coach video, offline downloads.',
              'كل مسارات المهارات، كل فيديوهات المدربين، وتحميل للمشاهدة دون إنترنت.',
            )}
          </Txt>
        </View>

        <View style={{ gap: 10 }}>
          {plans.map((p) => {
            const active = plan === p.id
            return (
              <Pressable
                key={p.id}
                onPress={() => setPlan(p.id)}
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
                  <Txt style={{ fontSize: 17, fontWeight: '600', color: colors.text }}>{p.name}</Txt>
                  <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{p.meta}</Txt>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Txt style={{ fontSize: 18, fontWeight: '700', letterSpacing: -0.4, color: colors.text }}>
                    {p.price}
                  </Txt>
                  {!!p.note && (
                    <Txt style={{ fontSize: 11, fontWeight: '700', color: colors.accentDark }}>{p.note}</Txt>
                  )}
                </View>
              </Pressable>
            )
          })}
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: 18, gap: 14, ...cardShadow }}>
          {features.map((f) => (
            <View key={f} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.accentTint,
                }}
              >
                <IconCheck size={12} color={colors.accentDark} strokeWidth={3} />
              </View>
              <Txt style={{ flex: 1, fontSize: 15, lineHeight: 21, color: colors.text }}>{f}</Txt>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, gap: 8 }}>
        <PrimaryButton label={t('Start 7-day free trial', 'ابدأ ٧ أيام مجاناً')} onPress={subscribe} />
        <Txt style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
          {t('Cancel anytime · charged after trial', 'إلغاء في أي وقت · يبدأ الخصم بعد التجربة')}
        </Txt>
      </View>
    </View>
  )
}
