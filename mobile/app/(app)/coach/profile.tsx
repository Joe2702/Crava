import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { Field, PrimaryButton } from '../../../components/ui'
import { useCoachRole, updateCoachProfile } from '../../../lib/coachRole'
import { useLocale } from '../../../lib/i18n'
import { colors, radius } from '../../../theme/tokens'

export default function CoachProfile() {
  const { coach, reload } = useCoachRole()
  const { t, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [bioEn, setBioEn] = useState('')
  const [bioAr, setBioAr] = useState('')
  const [rate, setRate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!coach) return
    setBioEn(coach.bio_en ?? '')
    setBioAr(coach.bio_ar ?? '')
    setRate(String(coach.rateEgp ?? ''))
  }, [coach])

  if (!coach) return null

  const save = async () => {
    // The rules accept only these keys, so anything else sent here would be
    // rejected outright rather than silently dropped.
    const rateEgp = Number(rate)
    if (!Number.isFinite(rateEgp) || rateEgp <= 0) {
      return Alert.alert(t('Check the rate', 'راجع السعر'), t('Enter a number above zero.', 'أدخل رقماً أكبر من صفر.'))
    }
    setSaving(true)
    try {
      await updateCoachProfile(coach.id, { bio_en: bioEn.trim(), bio_ar: bioAr.trim(), rateEgp })
      reload()
      router.back()
    } catch (e) {
      Alert.alert(t('Could not save', 'تعذر الحفظ'), e instanceof Error ? e.message : '')
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, gap: 18 }}
        keyboardShouldPersistTaps="handled"
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
            {t('Your listing', 'ملفك كمدرب')}
          </Txt>
        </View>

        <Field
          label={t('About you (English)', 'نبذة (إنجليزي)')}
          value={bioEn}
          onChangeText={setBioEn}
          multiline
          maxLength={400}
          placeholder={t('What you coach and who you have trained', 'ماذا تدرب ومن دربت')}
          placeholderTextColor={colors.textTertiary}
        />
        <Field
          label={t('About you (Arabic)', 'نبذة (عربي)')}
          value={bioAr}
          onChangeText={setBioAr}
          multiline
          maxLength={400}
          placeholder={t('Same, in Arabic', 'نفس النبذة بالعربية')}
          placeholderTextColor={colors.textTertiary}
        />
        <Field
          label={t('Rate per live session (EGP)', 'سعر الجلسة المباشرة (ج.م)')}
          value={rate}
          onChangeText={setRate}
          keyboardType="number-pad"
          maxLength={5}
        />

        <Txt style={{ fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>
          {t(
            'Your name, skill and verified status are set by Crava and cannot be edited here.',
            'اسمك ومهارتك وحالة التوثيق تحددها كرافا ولا يمكن تعديلها هنا.',
          )}
        </Txt>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}>
        <PrimaryButton label={t('Save', 'حفظ')} busy={saving} onPress={() => void save()} />
      </View>
    </View>
  )
}
