import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../components/Txt'
import { useAuth } from '../../lib/auth'
import { useLocale } from '../../lib/i18n'
import { ErrorText, Field, PrimaryButton } from '../../components/ui'
import { LanguageToggle } from '../../components/LanguageToggle'
import { colors, radius } from '../../theme/tokens'
import { isDemo } from '../../lib/firebase'

export default function SignIn() {
  const { signIn, resetPassword } = useAuth()
  const { t } = useLocale()
  const insets = useSafeAreaInsets()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const submit = async () => {
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      await signIn(email.trim(), password)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not sign in', 'تعذر تسجيل الدخول'))
    } finally {
      setBusy(false)
    }
  }

  const forgot = async () => {
    if (!email.trim()) {
      setError(t('Enter your email first, then tap reset.', 'أدخل بريدك الإلكتروني أولاً ثم اضغط على إعادة التعيين.'))
      return
    }
    setError(null)
    try {
      await resetPassword(email.trim())
      setNotice(t('Check your inbox for a reset link.', 'تحقق من بريدك للحصول على رابط إعادة التعيين.'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not send reset email', 'تعذر إرسال رسالة إعادة التعيين'))
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 24, gap: 22, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <LanguageToggle />
        </View>

        {isDemo && (
          <View style={{ backgroundColor: colors.accentTint, borderRadius: radius.sm, padding: 12, gap: 4 }}>
            <Txt style={{ fontSize: 13, fontWeight: '700', color: colors.accentDark }}>
              {t('Demo mode', 'وضع العرض')}
            </Txt>
            <Txt style={{ fontSize: 13, lineHeight: 19, color: colors.accentDark }}>
              {t(
                'No backend configured — sign in with anything. Progress is kept in memory and lost on restart.',
                'لا يوجد خادم مهيأ — سجّل الدخول بأي بيانات. التقدم مؤقت ويُفقد عند إعادة التشغيل.',
              )}
            </Txt>
          </View>
        )}

        <View style={{ gap: 8 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>Crava</Txt>
          <Txt style={{ fontSize: 34, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
            {t('Welcome back', 'أهلاً بعودتك')}
          </Txt>
          <Txt style={{ fontSize: 15, lineHeight: 23, color: colors.textSecondary }}>
            {t('Pick up your skill path where you left it.', 'أكمل مسار مهارتك من حيث توقفت.')}
          </Txt>
        </View>

        <View style={{ gap: 14 }}>
          <Field
            label={t('Email', 'البريد الإلكتروني')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Field
            label={t('Password', 'كلمة المرور')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            placeholder="••••••••"
          />
          {error && <ErrorText>{error}</ErrorText>}
          {notice && <Txt style={{ color: colors.successDark, fontSize: 14 }}>{notice}</Txt>}
          <PrimaryButton label={t('Sign in', 'تسجيل الدخول')} onPress={submit} busy={busy} />
          <Pressable onPress={forgot} accessibilityRole="button">
            <Txt style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 14, paddingVertical: 8 }}>
              {t('Forgot password?', 'نسيت كلمة المرور؟')}
            </Txt>
          </Pressable>
        </View>

        <View style={{ marginTop: 'auto', alignItems: 'center', paddingBottom: insets.bottom + 12 }}>
          <Link href="/sign-up" accessibilityRole="link">
            <Txt style={{ fontSize: 15, color: colors.accent, fontWeight: '600' }}>
              {t('New here? Create an account', 'جديد هنا؟ أنشئ حساباً')}
            </Txt>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
