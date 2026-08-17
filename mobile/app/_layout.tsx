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
import { CatalogProvider } from '../lib/catalog'
import { ProfileProvider, useProfile } from '../lib/profile'
import { CoachRoleProvider } from '../lib/coachRole'
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
  const { profile, ready: profileReady } = useProfile()
  const { ready, isRTL } = useLocale()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) return void router.replace('/sign-in')
    if (user && inAuthGroup) return void router.replace('/')

    // Onboarding runs once, and only once the profile has actually been read —
    // acting on a not-yet-loaded document would show it to returning users.
    if (!user || !profileReady) return
    const onOnboarding = (segments as string[]).includes('onboarding')
    if (profile && !profile.onboardedAt && !onOnboarding) router.replace('/onboarding')
  }, [user, loading, segments, router, profile, profileReady])

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
          <ProfileProvider>
            <CatalogProvider>
              <CoachRoleProvider>
                <AuthGate />
              </CoachRoleProvider>
            </CatalogProvider>
          </ProfileProvider>
        </AuthProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  )
}
