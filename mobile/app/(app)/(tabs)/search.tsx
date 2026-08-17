import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../../components/Txt'
import { Chip } from '../../../components/Chip'
import { IconSearch } from '../../../components/Icons'
import { CourseCard } from '../../../components/CourseCard'
import { TAB_BAR_CLEARANCE } from '../../../components/TabBar'
import { useCatalog } from '../../../lib/catalog'
import { useLocale } from '../../../lib/i18n'
import { colors, radius } from '../../../theme/tokens'

const ALL = '__all__'

export default function Browse() {
  const { courses, loading, error, reload } = useCatalog()
  const { t, field } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [q, setQ] = useState('')
  const [category, setCategory] = useState(ALL)

  // Categories come from the catalog rather than a fixed list, so publishing a
  // skill in a new category surfaces it here with no code change.
  const categories = useMemo(() => {
    const seen = new Map<string, string>()
    for (const c of courses) if (!seen.has(c.category_en)) seen.set(c.category_en, c.id)
    return [...seen.keys()]
  }, [courses])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return courses
      .filter((c) => category === ALL || c.category_en === category)
      .filter((c) => {
        if (!needle) return true
        const hay = `${c.name_en} ${c.name_ar} ${c.category_en} ${c.category_ar} ${c.coach_name_en} ${c.coach_name_ar}`
        return hay.toLowerCase().includes(needle)
      })
  }, [courses, q, category])

  const open = (id: string) => router.push(`/course/${id}`)

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
        {t('Courses', 'الدورات')}
      </Txt>

      <View style={{ justifyContent: 'center' }}>
        <View style={{ position: 'absolute', insetInlineStart: 14, zIndex: 1 }}>
          <IconSearch color={colors.textSecondary} />
        </View>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t('Search courses', 'ابحث عن دورة')}
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
            const sample = courses.find((x) => x.category_en === c)!
            return (
              <Chip
                key={c}
                label={field(sample, 'category')}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            )
          })}
        </ScrollView>
      )}

      {loading && courses.length === 0 && <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />}

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

      {results.map((c) => (
        <CourseCard key={c.id} course={c} onPress={() => open(c.id)} />
      ))}

      {!loading && !error && results.length === 0 && (
        <Txt style={{ paddingVertical: 24, fontSize: 15, color: colors.textSecondary }}>
          {t('Nothing matches that yet.', 'لا توجد نتائج مطابقة بعد.')}
        </Txt>
      )}
    </ScrollView>
  )
}
