import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../components/Txt'
import { useAuth } from '../../lib/auth'
import { useLocale } from '../../lib/i18n'
import { ErrorText, Field, PrimaryButton } from '../../components/ui'
import { LanguageToggle } from '../../components/LanguageToggle'
import { colors } from '../../theme/tokens'

export default function SignUp() {
  const { signUp } = useAuth()
  const { t } = useLocale()
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (password.length < 8) {
      setError(t('Password must be at least 8 characters.', 'كلمة المرور يجب ألا تقل عن ٨ أحرف.'))
      return
    }
    setError(null)
    setBusy(true)
    try {
      await signUp(email.trim(), password, name.trim())
      setNotice(t('Check your email to confirm your account.', 'تحقق من بريدك لتأكيد حسابك.'))
    } catch (e) {
      setError(e instanceof Error ? e.message : t('Could not create account', 'تعذر إنشاء الحساب'))
    } finally {
      setBusy(false)
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

        <View style={{ gap: 8 }}>
          <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>Crava</Txt>
          <Txt style={{ fontSize: 34, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
            {t('Start training', 'ابدأ التدريب')}
          </Txt>
          <Txt style={{ fontSize: 15, lineHeight: 23, color: colors.textSecondary }}>
            {t('Six levels from dead hang to full muscle-up.', 'ستة مستويات من التعليق الميت إلى المسل أب الكامل.')}
          </Txt>
        </View>

        <View style={{ gap: 14 }}>
          <Field
            label={t('Name', 'الاسم')}
            value={name}
            onChangeText={setName}
            autoComplete="name"
            placeholder={t('Your name', 'اسمك')}
          />
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
            autoComplete="new-password"
            placeholder={t('At least 8 characters', '٨ أحرف على الأقل')}
          />
          {error && <ErrorText>{error}</ErrorText>}
          {notice && <Txt style={{ color: colors.successDark, fontSize: 14 }}>{notice}</Txt>}
          <PrimaryButton label={t('Create account', 'أنشئ حساباً')} onPress={submit} busy={busy} />
        </View>

        <View style={{ marginTop: 'auto', alignItems: 'center', paddingBottom: insets.bottom + 12 }}>
          <Link href="/sign-in" accessibilityRole="link">
            <Txt style={{ fontSize: 15, color: colors.accent, fontWeight: '600' }}>
              {t('Already have an account? Sign in', 'لديك حساب بالفعل؟ سجّل الدخول')}
            </Txt>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
