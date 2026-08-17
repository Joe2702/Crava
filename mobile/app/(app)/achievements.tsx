import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../components/Txt'
import { IconCheck } from '../../components/Icons'
import { useAuth } from '../../lib/auth'
import { fetchAllCompletions } from '../../lib/completions'
import { achievementsFrom, type Achievement } from '../../lib/achievements'
import { localizeNumber, useLocale } from '../../lib/i18n'
import { cardShadow, colors, radius } from '../../theme/tokens'

export default function Achievements() {
  const { user } = useAuth()
  const { t, field, locale, isRTL } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [list, setList] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    const { levelIds, dates } = await fetchAllCompletions(user.uid)
    setList(achievementsFrom(levelIds, dates))
    setLoading(false)
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const earned = list.filter((a) => a.earned).length

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

      <View>
        <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
          {t('Achievements', 'الإنجازات')}
        </Txt>
        {!loading && (
          <Txt style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
            {t(
              `${earned} of ${list.length} earned`,
              `${localizeNumber(earned, locale)} من ${localizeNumber(list.length, locale)}`,
            )}
          </Txt>
        )}
      </View>

      {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />}

      <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
        {list.map((a, i) => (
          <View
            key={a.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 13,
              padding: 16,
              opacity: a.earned ? 1 : 0.55,
              borderBottomWidth: i === list.length - 1 ? 0 : 1,
              borderBottomColor: colors.separator,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: a.earned ? 'rgba(52,199,89,0.14)' : colors.fill,
              }}
            >
              {a.earned ? (
                <IconCheck size={18} color={colors.successDark} strokeWidth={3} />
              ) : (
                <Txt style={{ fontSize: 15, color: colors.textTertiary }}>★</Txt>
              )}
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <Txt style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{field(a, 'name')}</Txt>
              <Txt style={{ fontSize: 13, color: colors.textSecondary }}>{field(a, 'detail')}</Txt>
              {!a.earned && a.progress > 0 && (
                <View style={{ height: 4, borderRadius: radius.pill, backgroundColor: colors.fill, marginTop: 4 }}>
                  <View
                    style={{
                      height: 4,
                      width: `${Math.round(a.progress * 100)}%`,
                      borderRadius: radius.pill,
                      backgroundColor: colors.accent,
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
