import { Pressable, View } from 'react-native' 
import { Txt } from './Txt'
import { useLocale } from '../lib/i18n'
import { colors, radius } from '../theme/tokens'

export function LanguageToggle() {
  const { locale, setLocale } = useLocale()

  const option = (value: 'en' | 'ar', label: string) => {
    const active = locale === value
    return (
      <Pressable
        key={value}
        onPress={() => setLocale(value)}
        accessibilityRole="radio"
        accessibilityState={{ selected: active }}
        accessibilityLabel={value === 'ar' ? 'العربية' : 'English'}
        style={{
          borderRadius: radius.pill,
          paddingHorizontal: 13,
          paddingVertical: 6,
          backgroundColor: active ? colors.surface : 'transparent',
        }}
      >
        <Txt style={{ fontSize: 13, fontWeight: '600', color: active ? colors.text : colors.textSecondary }}>
          {label}
        </Txt>
      </Pressable>
    )
  }

  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.fill, borderRadius: radius.pill, padding: 2 }}>
      {option('en', 'EN')}
      {option('ar', 'عربي')}
    </View>
  )
}
