import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { doc, setDoc } from 'firebase/firestore'
import { Txt } from '../../components/Txt'
import { Field, PrimaryButton } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useProfile } from '../../lib/profile'
import { db, isDemo } from '../../lib/firebase'
import { demo } from '../../lib/demo'
import { useLocale } from '../../lib/i18n'
import { colors, radius } from '../../theme/tokens'

export default function EditProfile() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { t, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)

  // Seeded once the document arrives, rather than on every render, so typing
  // is not overwritten by the live profile snapshot.
  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName ?? '')
    setCity(profile.city ?? '')
  }, [profile])

  const save = async () => {
    if (!user) return
    setSaving(true)
    const patch = {
      displayName: displayName.trim() || null,
      city: city.trim() || null,
    }
    try {
      if (isDemo) demo.updateUser(patch)
      else await setDoc(doc(db(), 'users', user.uid), patch, { merge: true })
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

        <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
          {t('Edit profile', 'تعديل الملف')}
        </Txt>

        <Field
          label={t('Display name', 'الاسم')}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          maxLength={40}
          placeholder={t('Your name', 'اسمك')}
          placeholderTextColor={colors.textTertiary}
        />
        <Field
          label={t('City', 'المدينة')}
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
          maxLength={40}
          placeholder={t('Cairo', 'القاهرة')}
          placeholderTextColor={colors.textTertiary}
        />

        <Txt style={{ fontSize: 13, lineHeight: 19, color: colors.textSecondary }}>
          {t(
            'Your name shows on anything you post to Milestones.',
            'اسمك يظهر على ما تنشره في الإنجازات.',
          )}
        </Txt>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16 }}>
        <PrimaryButton label={t('Save', 'حفظ')} busy={saving} onPress={() => void save()} />
      </View>
    </View>
  )
}
