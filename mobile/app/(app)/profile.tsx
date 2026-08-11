import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, View } from 'react-native' 
import { Txt } from '../../components/Txt'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { localizeNumber, useLocale } from '../../lib/i18n'
import { useSkillPath } from '../../lib/useSkillPath'
import { LanguageToggle } from '../../components/LanguageToggle'
import { cardShadow, colors, radius } from '../../theme/tokens'

export default function Profile() {
  const { data, loading, reload } = useSkillPath()
  const { signOut } = useAuth()
  const { t, locale, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const n = (v: number) => localizeNumber(v, locale)

  if (loading || !data) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  const { stats, profile, levels } = data
  const cleared = levels.filter((l) => l.state === 'done').length

  const toggleNotif = async (value: boolean) => {
    const { error } = await supabase.from('profiles').update({ notif_enabled: value }).eq('id', profile.id)
    if (error) Alert.alert(t('Could not save', 'تعذر الحفظ'), error.message)
    else void reload()
  }

  const confirmDelete = () => {
    Alert.alert(
      t('Delete account?', 'حذف الحساب؟'),
      t(
        'This permanently erases your account and all your progress. It cannot be undone.',
        'سيؤدي هذا إلى حذف حسابك وكل تقدمك نهائياً. لا يمكن التراجع عن هذا الإجراء.',
      ),
      [
        { text: t('Cancel', 'إلغاء'), style: 'cancel' },
        {
          text: t('Delete', 'حذف'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true)
            const { error } = await supabase.rpc('delete_account')
            setBusy(false)
            if (error) {
              Alert.alert(t('Could not delete account', 'تعذر حذف الحساب'), error.message)
              return
            }
            await supabase.auth.signOut()
          },
        },
      ],
    )
  }

  const stat = (value: string, label: string) => (
    <View key={label} style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, ...cardShadow }}>
      <Txt style={{ fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: colors.text }}>{value}</Txt>
      <Txt style={{ fontSize: 12, color: colors.textSecondary, marginTop: 6 }}>{label}</Txt>
    </View>
  )

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
        <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
          <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isRTL ? 'رجوع ›' : '‹ Back'}</Txt>
        </View>
      </Pressable>

      <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
        {profile.display_name || t('Athlete', 'بطل')}
      </Txt>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {stat(n(cleared), t('Levels', 'مستويات'))}
        {stat(n(stats.streak_count), t('Day streak', 'يوم متتالي'))}
        {stat(n(stats.xp), 'XP')}
      </View>

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.separator,
          }}
        >
          <Txt style={{ fontSize: 16, color: colors.text }}>{t('Language', 'اللغة')}</Txt>
          <LanguageToggle />
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.separator,
          }}
        >
          <Txt style={{ fontSize: 16, color: colors.text }}>{t('Notifications', 'الإشعارات')}</Txt>
          <Switch
            value={profile.notif_enabled}
            onValueChange={toggleNotif}
            trackColor={{ true: colors.success, false: 'rgba(118,118,128,0.24)' }}
            accessibilityLabel={t('Notifications', 'الإشعارات')}
          />
        </View>
        <Pressable onPress={signOut} accessibilityRole="button" style={{ padding: 16 }}>
          <Txt style={{ fontSize: 16, color: colors.text }}>{t('Sign out', 'تسجيل الخروج')}</Txt>
        </Pressable>
      </View>

      <Pressable onPress={confirmDelete} disabled={busy} accessibilityRole="button" style={{ padding: 16 }}>
        <Txt style={{ fontSize: 15, color: colors.accent, textAlign: 'center' }}>
          {busy ? t('Deleting…', 'جارٍ الحذف…') : t('Delete account', 'حذف الحساب')}
        </Txt>
      </Pressable>
    </ScrollView>
  )
}
