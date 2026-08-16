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
      <Tabs.Screen name="index" options={{ title: t('Home', 'الرئيسية') }} />
      <Tabs.Screen name="search" options={{ title: t('Browse', 'تصفح') }} />
      <Tabs.Screen name="tree" options={{ title: t('Train', 'تدرب') }} />
      <Tabs.Screen name="profile" options={{ title: t('You', 'حسابي') }} />
    </Tabs>
  )
}
