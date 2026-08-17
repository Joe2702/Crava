import { Pressable, ScrollView, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { useLocale } from '../../../lib/i18n'
import { LEGAL, type LegalDoc } from '../../../lib/legal'
import { colors, radius } from '../../../theme/tokens'

export default function Legal() {
  const { doc } = useLocalSearchParams<{ doc: string }>()
  const { t, locale, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const key: LegalDoc = doc === 'terms' ? 'terms' : 'privacy'
  const content = LEGAL[key][locale === 'ar' ? 'ar' : 'en']

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40, gap: 16 }}
    >
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
        <View style={{ backgroundColor: colors.fill, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
          <Txt style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>{isRTL ? 'رجوع ›' : '‹ Back'}</Txt>
        </View>
      </Pressable>

      <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
        {content.title}
      </Txt>
      <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
        {t(`Last updated ${LEGAL.updated}`, `آخر تحديث ${LEGAL.updated}`)}
      </Txt>

      {content.sections.map((s) => (
        <View key={s.heading} style={{ gap: 6 }}>
          <Txt style={{ fontSize: 17, fontWeight: '700', color: colors.text, marginTop: 6 }}>{s.heading}</Txt>
          {s.paragraphs.map((p, i) => (
            <Txt key={i} style={{ fontSize: 15, lineHeight: 23, color: colors.text }}>
              {p}
            </Txt>
          ))}
        </View>
      ))}
    </ScrollView>
  )
}
