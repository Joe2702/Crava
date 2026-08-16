import { useEffect, useRef } from 'react'
import { Animated, Easing, Modal, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from './Txt'
import { PrimaryButton } from './ui'
import { localizeNumber, useLocale } from '../lib/i18n'
import { colors, radius } from '../theme/tokens'

export interface LevelUpInfo {
  levelIdx: number
  xpGained: number
  cleared: number
  nextLevelName: string | null
}

/**
 * The payoff moment. A system alert was standing in for this, which made
 * clearing a level feel like an error dialog.
 */
export function LevelUpSheet({ info, onClose }: { info: LevelUpInfo | null; onClose: () => void }) {
  const { t, locale } = useLocale()
  const insets = useSafeAreaInsets()
  const slide = useRef(new Animated.Value(0)).current

  const visible = info !== null

  useEffect(() => {
    if (!visible) {
      slide.setValue(0)
      return
    }
    Animated.timing(slide, {
      toValue: 1,
      duration: 340,
      easing: Easing.bezier(0.22, 0.9, 0.28, 1),
      useNativeDriver: true,
    }).start()
  }, [visible, slide])

  if (!info) return null

  const n = (v: number) => localizeNumber(v, locale)

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('Close', 'إغلاق')}
        style={{ flex: 1, backgroundColor: 'rgba(28,28,30,0.4)', justifyContent: 'flex-end' }}
      >
        {/* Stops a tap inside the sheet from closing it. */}
        <Pressable onPress={() => {}}>
          <Animated.View
            style={{
              backgroundColor: colors.bg,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: insets.bottom + 26,
              transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }],
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                borderRadius: radius.pill,
                backgroundColor: 'rgba(60,60,67,0.2)',
                alignSelf: 'center',
                marginBottom: 18,
              }}
            />

            <View style={{ gap: 16 }}>
              <View
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: radius.pill,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.accentDark,
                  shadowOpacity: 0.3,
                  shadowRadius: 26,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 6,
                }}
              >
                <Txt style={{ fontSize: 28, color: '#fff' }}>★</Txt>
              </View>

              <View>
                <Txt style={{ fontSize: 13, fontWeight: '600', color: colors.accentDark }}>
                  {t('Level cleared', 'تم إنهاء المستوى')}
                </Txt>
                <Txt style={{ fontSize: 30, fontWeight: '700', letterSpacing: -1, color: colors.text, marginTop: 4 }}>
                  {t(`Level ${info.levelIdx} done`, `المستوى ${n(info.levelIdx)} تم`)}
                </Txt>
                {info.nextLevelName && (
                  <Txt style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary, marginTop: 8 }}>
                    {t(
                      `Next up: ${info.nextLevelName}. It is unlocked now.`,
                      `التالي: ${info.nextLevelName}. تم فتحه الآن.`,
                    )}
                  </Txt>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Stat label={t('XP earned', 'النقاط')} value={`+${n(info.xpGained)}`} />
                <Stat label={t('Levels cleared', 'مستويات مكتملة')} value={n(info.cleared)} />
              </View>

              <PrimaryButton label={t('Keep going', 'واصل')} onPress={onClose} />
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 14, gap: 2 }}>
      <Txt style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.text }}>{value}</Txt>
      <Txt style={{ fontSize: 12, color: colors.textSecondary }}>{label}</Txt>
    </View>
  )
}
