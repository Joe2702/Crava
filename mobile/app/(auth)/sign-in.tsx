import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth'
import { ErrorText, Field, PrimaryButton } from '../../components/ui'
import { colors } from '../../theme/tokens'

export default function SignIn() {
  const { signIn, resetPassword } = useAuth()
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
      setError(e instanceof Error ? e.message : 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  const forgot = async () => {
    if (!email.trim()) {
      setError('Enter your email first, then tap reset.')
      return
    }
    setError(null)
    try {
      await resetPassword(email.trim())
      setNotice('Check your inbox for a reset link.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send reset email')
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
            Welcome back
          </Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: colors.textSecondary }}>
            Pick up your skill path where you left it.
          </Text>
        </View>

        <View style={{ gap: 14 }}>
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
            autoComplete="current-password"
            placeholder="••••••••"
          />
          {error && <ErrorText>{error}</ErrorText>}
          {notice && <Text style={{ color: colors.successDark, fontSize: 14 }}>{notice}</Text>}
          <PrimaryButton label="Sign in" onPress={submit} busy={busy} />
          <Pressable onPress={forgot} accessibilityRole="button">
            <Text style={{ textAlign: 'center', color: colors.textSecondary, fontSize: 14, paddingVertical: 8 }}>
              Forgot password?
            </Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 'auto', alignItems: 'center', paddingBottom: insets.bottom + 12 }}>
          <Link href="/sign-up" accessibilityRole="link">
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>
              New here? <Text style={{ color: colors.accent, fontWeight: '600' }}>Create an account</Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
