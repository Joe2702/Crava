import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, View } from 'react-native' 
import { Txt } from '../../../components/Txt'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { doc, updateDoc } from 'firebase/firestore'
import { db, isDemo } from '../../../lib/firebase'
import { demo } from '../../../lib/demo'
import { useAuth } from '../../../lib/auth'
import { localizeNumber, useLocale } from '../../../lib/i18n'
import { useSkillPath } from '../../../lib/useSkillPath'
import { LanguageToggle } from '../../../components/LanguageToggle'
import { IconChevronRight } from '../../../components/Icons'
import { syncReminders } from '../../../lib/reminders'
import { useCoachRole } from '../../../lib/coachRole'
import { cardShadow, colors, radius } from '../../../theme/tokens'

export default function Profile() {
  const { data, loading, reload } = useSkillPath()
  const { signOut, deleteAccount, user: authUser } = useAuth()
  const { t, locale } = useLocale()
  const { coach } = useCoachRole()
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

  const { user, xp, streak, cleared } = data

  // The stored flag is the user's intent; the OS schedule is rebuilt from it
  // each time so the two cannot drift. Permission may still be refused, which
  // leaves the toggle on and nothing scheduled — recoverable from system
  // settings without the app having lied about the preference.
  const applyReminders = (enabled: boolean) =>
    syncReminders({
      enabled,
      weeklyGoal: user.weeklyGoal,
      title: t('Time to train', 'وقت التدريب'),
      body: t('Your next level is waiting.', 'مستواك التالي في انتظارك.'),
    }).catch(() => {})

  const toggleNotif = async (value: boolean) => {
    if (!authUser) return
    void applyReminders(value)
    if (isDemo) return void demo.updateUser({ notifEnabled: value })
    try {
      await updateDoc(doc(db(), 'users', authUser.uid), { notifEnabled: value })
      void reload()
    } catch (e) {
      Alert.alert(t('Could not save', 'تعذر الحفظ'), e instanceof Error ? e.message : '')
    }
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
            try {
              await deleteAccount()
            } catch (e) {
              Alert.alert(t('Could not delete account', 'تعذر حذف الحساب'), e instanceof Error ? e.message : '')
            } finally {
              setBusy(false)
            }
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
      <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1, color: colors.text }}>
        {user.displayName || t('Athlete', 'بطل')}
      </Txt>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {stat(n(cleared), t('Levels', 'مستويات'))}
        {stat(n(streak), t('Day streak', 'يوم متتالي'))}
        {stat(n(xp), 'XP')}
      </View>

      {/* Coaching only appears for accounts an admin has linked to a coach
          profile — the same account learns and coaches, like an instructor on a
          course platform. Everyone else is offered the way in. */}
      {coach ? (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
            <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.accentDark }}>
              {t('Coaching', 'التدريب')}
            </Txt>
          </View>
          <LinkRow label={t('Requests', 'الطلبات')} onPress={() => router.push('/coach/requests')} />
          <LinkRow label={t('Your listing', 'ملفك كمدرب')} onPress={() => router.push('/coach/profile')} last />
        </View>
      ) : (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
          <LinkRow label={t('Coach on Crava', 'درّب على كرافا')} onPress={() => router.push('/coach/apply')} last />
        </View>
      )}

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        <LinkRow label={t('Edit profile', 'تعديل الملف')} onPress={() => router.push('/edit-profile')} />
        <LinkRow label={t('Achievements', 'الإنجازات')} onPress={() => router.push('/achievements')} />
        <LinkRow label={t('My sessions', 'جلساتي')} onPress={() => router.push('/sessions')} />
        <LinkRow label={t('Milestones', 'الإنجازات العامة')} onPress={() => router.push('/community')} />
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
            value={user.notifEnabled}
            onValueChange={toggleNotif}
            trackColor={{ true: colors.success, false: 'rgba(118,118,128,0.24)' }}
            accessibilityLabel={t('Notifications', 'الإشعارات')}
          />
        </View>
        <Pressable onPress={signOut} accessibilityRole="button" style={{ padding: 16 }}>
          <Txt style={{ fontSize: 16, color: colors.text }}>{t('Sign out', 'تسجيل الخروج')}</Txt>
        </Pressable>
      </View>

      {/* Both stores require these to be reachable from inside the app. */}
      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        <LinkRow label={t('Privacy policy', 'سياسة الخصوصية')} onPress={() => router.push('/legal/privacy')} />
        <LinkRow label={t('Terms of use', 'شروط الاستخدام')} onPress={() => router.push('/legal/terms')} last />
      </View>

      <Pressable onPress={confirmDelete} disabled={busy} accessibilityRole="button" style={{ padding: 16 }}>
        <Txt style={{ fontSize: 15, color: colors.accent, textAlign: 'center' }}>
          {busy ? t('Deleting…', 'جارٍ الحذف…') : t('Delete account', 'حذف الحساب')}
        </Txt>
      </Pressable>
    </ScrollView>
  )
}

function LinkRow({ label, onPress, last }: { label: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: last ? 0 : 0.5,
        borderBottomColor: colors.separator,
      }}
    >
      <Txt style={{ fontSize: 16, color: colors.text }}>{label}</Txt>
      <IconChevronRight />
    </Pressable>
  )
}
