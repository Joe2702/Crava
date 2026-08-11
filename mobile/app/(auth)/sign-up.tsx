import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth'
import { ErrorText, Field, PrimaryButton } from '../../components/ui'
import { colors } from '../../theme/tokens'

export default function SignUp() {
  const { signUp } = useAuth()
  const insets = useSafeAreaInsets()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await signUp(email.trim(), password, name.trim())
      setNotice('Check your email to confirm your account.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create account')
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
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 40, gap: 22, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.accent }}>Crava</Text>
          <Text style={{ fontSize: 34, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
            Start training
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: colors.textSecondary }}>
            Six levels from dead hang to full muscle-up.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          <Field label="Name" value={name} onChangeText={setName} autoComplete="name" placeholder="Your name" />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          {error && <ErrorText>{error}</ErrorText>}
          {notice && <Text style={{ color: colors.successDark, fontSize: 14 }}>{notice}</Text>}
          <PrimaryButton label="Create account" onPress={submit} busy={busy} />
        </View>

        <View style={{ marginTop: 'auto', alignItems: 'center', paddingBottom: insets.bottom + 12 }}>
          <Link href="/sign-in" accessibilityRole="link">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>
              Already have an account? <Text style={{ color: colors.accent, fontWeight: '600' }}>Sign in</Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
