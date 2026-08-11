import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native'
import { useLocale } from '../lib/i18n'
import { font } from '../theme/typography'

/**
 * Drop-in replacement for <Text> that picks the right font family for the
 * active locale. Use this everywhere instead of <Text> so Arabic never falls
 * back to a system face that renders it badly.
 *
 * The resolved font is applied last so it wins over any inline fontFamily, and
 * for Arabic it clears fontWeight — the weight lives in the font file itself.
 */
export function Txt({ style, ...props }: TextProps) {
  const { locale } = useLocale()
  const flat = (StyleSheet.flatten(style) ?? {}) as TextStyle
  return <Text {...props} style={[style, font(locale, flat.fontWeight)]} />
}
