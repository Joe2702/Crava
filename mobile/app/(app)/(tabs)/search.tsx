import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { Chip } from '../../../components/Chip'
import { IconChevronRight, IconSearch } from '../../../components/Icons'
import { TAB_BAR_CLEARANCE } from '../../../components/TabBar'
import { useCatalog } from '../../../lib/catalog'
import { useLocale } from '../../../lib/i18n'
import { cardShadow, colors, radius } from '../../../theme/tokens'

const ALL = '__all__'

export default function Browse() {
  const { skills, loading, error, reload, setActiveSkillId } = useCatalog()
  const { t, field } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [q, setQ] = useState('')
  const [category, setCategory] = useState(ALL)

  // Categories come from the catalog rather than a fixed list, so publishing a
  // skill in a new category surfaces it here with no code change.
  const categories = useMemo(() => {
    const seen = new Map<string, string>()
    for (const s of skills) if (!seen.has(s.category_en)) seen.set(s.category_en, s.id)
    return [...seen.keys()]
  }, [skills])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return skills
      .filter((s) => category === ALL || s.category_en === category)
      .filter((s) => {
        if (!needle) return true
        const hay = `${s.name_en} ${s.name_ar} ${s.category_en} ${s.category_ar} ${s.coach_name_en} ${s.coach_name_ar}`
        return hay.toLowerCase().includes(needle)
      })
  }, [skills, q, category])

  const open = (id: string) => {
    setActiveSkillId(id)
    router.push('/tree')
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 12,
        paddingBottom: TAB_BAR_CLEARANCE + insets.bottom,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
        {t('Browse', 'تصفح')}
      </Txt>

      <View style={{ justifyContent: 'center' }}>
        <View style={{ position: 'absolute', insetInlineStart: 14, zIndex: 1 }}>
          <IconSearch color={colors.textSecondary} />
        </View>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('Search skills, coaches', 'ابحث عن مهارة أو مدرب')}
          placeholderTextColor={colors.textTertiary}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={{
            backgroundColor: colors.fill,
            borderRadius: radius.sm,
            paddingVertical: 13,
            paddingHorizontal: 16,
            paddingStart: 44,
            fontSize: 16,
            color: colors.text,
          }}
        />
      </View>

      {categories.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label={t('All', 'الكل')} selected={category === ALL} onPress={() => setCategory(ALL)} />
          {categories.map((c) => {
            const skill = skills.find((s) => s.category_en === c)!
            return (
              <Chip
                key={c}
                label={field(skill, 'category')}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            )
          })}
        </ScrollView>
      )}

      {loading && skills.length === 0 && <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />}

      {error && (
        <View style={{ gap: 8, paddingVertical: 16 }}>
          <Txt style={{ fontSize: 15, color: colors.textSecondary }}>{error}</Txt>
          <Pressable onPress={reload} accessibilityRole="button">
            <Txt style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>
              {t('Try again', 'حاول مرة أخرى')}
            </Txt>
          </Pressable>
        </View>
      )}

      {results.length > 0 && (
        <View style={{ backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', ...cardShadow }}>
          {results.map((s, i) => (
            <Pressable
              key={s.id}
              onPress={() => open(s.id)}
              accessibilityRole="button"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                padding: 14,
                borderBottomWidth: i === results.length - 1 ? 0 : 1,
                borderBottomColor: colors.separator,
              }}
            >
              <View style={{ width: 56, height: 56, borderRadius: radius.md, backgroundColor: '#d4d4da' }} />
              <View style={{ flex: 1, gap: 3 }}>
                <Txt style={{ fontSize: 16, fontWeight: '600', letterSpacing: -0.25, color: colors.text }}>
                  {field(s, 'name')}
                </Txt>
                <Txt style={{ fontSize: 13, color: colors.textSecondary }}>
                  {t(
                    `${s.category_en} · 6 levels · ${s.coach_name_en}`,
                    `${s.category_ar} · ٦ مستويات · ${s.coach_name_ar}`,
                  )}
                </Txt>
              </View>
              <IconChevronRight />
            </Pressable>
          ))}
        </View>
      )}

      {!loading && !error && results.length === 0 && (
        <Txt style={{ paddingVertical: 24, fontSize: 15, color: colors.textSecondary }}>
          {t('Nothing matches that yet.', 'لا توجد نتائج مطابقة بعد.')}
        </Txt>
      )}
    </ScrollView>
  )
}
