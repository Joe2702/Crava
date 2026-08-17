import { Tabs } from 'expo-router'
import { TabBar } from '../../../components/TabBar'
import { useLocale } from '../../../lib/i18n'
import { colors } from '../../../theme/tokens'

export default function TabsLayout() {
  const { t } = useLocale()

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('Learning', 'تعلّمي') }} />
      <Tabs.Screen name="search" options={{ title: t('Courses', 'الدورات') }} />
      <Tabs.Screen name="profile" options={{ title: t('Account', 'حسابي') }} />
    </Tabs>
  )
}
