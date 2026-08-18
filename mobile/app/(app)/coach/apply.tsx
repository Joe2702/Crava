import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { Field, PrimaryButton } from '../../../components/ui'
import { useAuth } from '../../../lib/auth'
import { applyToCoach, hasApplied } from '../../../lib/coachRole'
import { useLocale } from '../../../lib/i18n'
import { colors, radius } from '../../../theme/tokens'

export default function CoachApply() {
  const { user } = useAuth()
  const { t, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [checking, setChecking] = useState(true)

  // Without this the form is offered again to someone who already applied, and
  // sending overwrites their first application with no sign anything happened.
  useEffect(() => {
    if (!user) return
    hasApplied(user.uid)
      .then(setSent)
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [user])

  const submit = async () => {
    if (!user || !note.trim()) return
    setSending(true)
    try {
      await applyToCoach(user.uid, note)
      setSent(true)
    } catch (e) {
      Alert.alert(t('Could not send', 'تعذر الإرسال'), e instanceof Error ? e.message : '')
    } finally {
      setSending(false)
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

        <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
          {t('Coach on Crava', 'درّب على كرافا')}
        </Txt>

        {checking ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />
        ) : sent ? (
          <Txt style={{ fontSize: 16, lineHeight: 24, color: colors.text }}>
            {t(
              'Your application is in. Every coach is checked by a person before going live, so this is not instant — we will be in touch.',
              'وصل طلبك. يراجع شخص كل مدرب قبل النشر، لذا الأمر ليس فورياً — سنتواصل معك.',
            )}
          </Txt>
        ) : (
          <>
            <Txt style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary }}>
              {t(
                'Tell us what you coach, your background, and where you train. Every coach is verified by a person before appearing in the app.',
                'أخبرنا ماذا تدرب وما خلفيتك وأين تتدرب. يتم توثيق كل مدرب من شخص قبل ظهوره في التطبيق.',
              )}
            </Txt>
            <Field
              label={t('About you', 'نبذة عنك')}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={600}
              placeholder={t('Your experience and what you would coach', 'خبرتك وما ستدربه')}
              placeholderTextColor={colors.textTertiary}
            />
          </>
        )}
      </ScrollView>

      {!sent && !checking && (
        <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}>
          <PrimaryButton
            label={t('Send application', 'إرسال الطلب')}
            disabled={!note.trim()}
            busy={sending}
            onPress={() => void submit()}
          />
        </View>
      )}
    </View>
  )
}
