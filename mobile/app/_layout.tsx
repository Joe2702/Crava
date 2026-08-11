import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic'
import { AuthProvider, useAuth } from '../lib/auth'
import { LocaleProvider, useLocale } from '../lib/i18n'
import { colors } from '../theme/tokens'

void SplashScreen.preventAutoHideAsync()

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  )
}

function AuthGate() {
  const { user, loading } = useAuth()
  const { ready, isRTL } = useLocale()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) router.replace('/sign-in')
    else if (user && inAuthGroup) router.replace('/')
  }, [user, loading, segments, router])

  if (loading || !ready) return <Loading />

  // `direction` flips the whole subtree's layout without the app restart that
  // I18nManager.forceRTL would require, so language can be switched in place.
  return (
    <View style={{ flex: 1, direction: isRTL ? 'rtl' : 'ltr' }}>
      <Slot />
    </View>
  )
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  })

  useEffect(() => {
    // a font failure must not leave the user staring at the splash forever
    if (fontsLoaded || fontError) void SplashScreen.hideAsync()
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) return null

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LocaleProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  )
}
