import { Platform } from 'react-native'
import type { TextStyle } from 'react-native'
import type { Locale } from '../lib/i18n'

/**
 * The system stack renders Arabic poorly outside iOS, so Arabic gets bundled
 * IBM Plex Sans Arabic. Latin keeps the platform font, which is what the
 * design was drawn against.
 */
const AR_FAMILY: Record<number, string> = {
  400: 'IBMPlexSansArabic_400Regular',
  500: 'IBMPlexSansArabic_500Medium',
  600: 'IBMPlexSansArabic_600SemiBold',
  700: 'IBMPlexSansArabic_700Bold',
}

type Weight = 400 | 500 | 600 | 700

function nearestWeight(w: TextStyle['fontWeight']): Weight {
  const n = typeof w === 'number' ? w : Number(w ?? 400)
  if (Number.isNaN(n)) return 400
  if (n >= 700) return 700
  if (n >= 600) return 600
  if (n >= 500) return 500
  return 400
}

/**
 * Arabic weights come from separate font files rather than a `fontWeight`,
 * so the weight has to be folded into the family name and then cleared.
 */
export function font(locale: Locale, weight: TextStyle['fontWeight'] = '400'): TextStyle {
  if (locale !== 'ar') {
    return {
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }),
      fontWeight: weight,
    }
  }
  return { fontFamily: AR_FAMILY[nearestWeight(weight)], fontWeight: undefined }
}
