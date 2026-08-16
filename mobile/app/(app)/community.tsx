import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Txt } from '../../components/Txt'
import { PrimaryButton } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { useProfile } from '../../lib/profile'
import { useCatalog } from '../../lib/catalog'
import { isDemo } from '../../lib/firebase'
import { localizeNumber, useLocale } from '../../lib/i18n'
import {
  blockAuthor,
  createPost,
  deletePost,
  fetchFeed,
  MAX_POST_LENGTH,
  reportPost,
  setLiked,
  type Post,
} from '../../lib/community'
import { cardShadow, colors, radius } from '../../theme/tokens'

export default function Community() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { activeSkillId } = useCatalog()
  const { t, locale } = useLocale()
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  const load = useCallback(async () => {
    if (!user || isDemo) {
      setLoading(false)
      return
    }
    setError(null)
    try {
      setPosts(await fetchFeed(user.uid))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the feed')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const submit = async () => {
    if (!user || !body.trim()) return
    setPosting(true)
    try {
      await createPost({
        uid: user.uid,
        authorName: profile?.displayName ?? user.displayName ?? null,
        body,
        skillId: activeSkillId,
      })
      setBody('')
      await load()
    } catch (e) {
      Alert.alert(t('Could not post', 'تعذر النشر'), e instanceof Error ? e.message : '')
    } finally {
      setPosting(false)
    }
  }

  // Optimistic so the tap feels instant; the count is re-read on the next load.
  const toggleLike = async (post: Post) => {
    if (!user) return
    const next = !post.likedByMe
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, likedByMe: next, likeCount: p.likeCount + (next ? 1 : -1) } : p,
      ),
    )
    try {
      await setLiked(post.id, user.uid, next)
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likedByMe: !next, likeCount: p.likeCount + (next ? -1 : 1) } : p,
        ),
      )
    }
  }

  const moderate = (post: Post) => {
    if (!user) return
    if (post.mine) {
      return Alert.alert(t('Delete post', 'حذف المنشور'), t('This cannot be undone.', 'لا يمكن التراجع.'), [
        { text: t('Cancel', 'إلغاء'), style: 'cancel' },
        {
          text: t('Delete', 'حذف'),
          style: 'destructive',
          onPress: async () => {
            await deletePost(post.id)
            await load()
          },
        },
      ])
    }
    Alert.alert(t('Report or block', 'إبلاغ أو حظر'), t('What would you like to do?', 'ماذا تريد أن تفعل؟'), [
      { text: t('Cancel', 'إلغاء'), style: 'cancel' },
      {
        text: t('Report post', 'الإبلاغ عن المنشور'),
        onPress: async () => {
          await reportPost(post.id, user.uid, 'user_report')
          Alert.alert(t('Reported', 'تم الإبلاغ'), t('Thanks — we will review it.', 'شكراً، سنراجعه.'))
        },
      },
      {
        text: t('Block this person', 'حظر هذا الشخص'),
        style: 'destructive',
        onPress: async () => {
          await blockAuthor(user.uid, post.authorUid)
          await load()
        },
      },
    ])
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.accent} />}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1.1, color: colors.text }}>
          {t('Milestones', 'الإنجازات')}
        </Txt>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('Close', 'إغلاق')}
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.fill,
          }}
        >
          <Txt style={{ fontSize: 17, color: colors.textSecondary }}>✕</Txt>
        </Pressable>
      </View>

      {isDemo ? (
        <Txt style={{ fontSize: 15, color: colors.textSecondary, paddingVertical: 24 }}>
          {t(
            'The community needs a real account. Demo mode has no one to post to.',
            'المجتمع يحتاج حساباً حقيقياً. وضع العرض بلا مستخدمين.',
          )}
        </Txt>
      ) : (
        <>
          <View style={{ backgroundColor: colors.surface, borderRadius: radius.xxl, padding: 16, gap: 12, ...cardShadow }}>
            <TextInput
              value={body}
              onChangeText={(v) => setBody(v.slice(0, MAX_POST_LENGTH))}
              placeholder={t('Share a milestone…', 'شارك إنجازاً…')}
              placeholderTextColor={colors.textTertiary}
              multiline
              style={{ fontSize: 16, lineHeight: 22, color: colors.text, minHeight: 60 }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Txt style={{ flex: 1, fontSize: 12, color: colors.textSecondary }}>
                {localizeNumber(body.length, locale)}/{localizeNumber(MAX_POST_LENGTH, locale)}
              </Txt>
              <View style={{ minWidth: 110 }}>
                <PrimaryButton
                  label={t('Post', 'نشر')}
                  disabled={!body.trim()}
                  busy={posting}
                  onPress={() => void submit()}
                />
              </View>
            </View>
          </View>

          {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />}

          {error && (
            <View style={{ gap: 8 }}>
              <Txt style={{ fontSize: 15, color: colors.textSecondary }}>{error}</Txt>
              <Pressable onPress={load} accessibilityRole="button">
                <Txt style={{ color: colors.accent, fontWeight: '600', fontSize: 15 }}>
                  {t('Try again', 'حاول مرة أخرى')}
                </Txt>
              </Pressable>
            </View>
          )}

          {!loading && !error && posts.length === 0 && (
            <Txt style={{ fontSize: 15, color: colors.textSecondary, paddingVertical: 24 }}>
              {t('No milestones yet. Be the first.', 'لا إنجازات بعد. كن الأول.')}
            </Txt>
          )}

          {posts.map((p) => (
            <PostCard key={p.id} post={p} onLike={() => void toggleLike(p)} onMore={() => moderate(p)} />
          ))}
        </>
      )}
    </ScrollView>
  )
}

function PostCard({ post, onLike, onMore }: { post: Post; onLike: () => void; onMore: () => void }) {
  const { t, locale } = useLocale()

  const when = post.createdAt
    ? post.createdAt.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : ''

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.xxl, padding: 18, gap: 12, ...cardShadow }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: radius.pill, backgroundColor: '#d4d4da' }} />
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
            {post.authorName ?? t('Someone', 'مستخدم')}
          </Txt>
          <Txt style={{ fontSize: 12, color: colors.textSecondary }}>{when}</Txt>
        </View>
        <Pressable
          onPress={onMore}
          accessibilityRole="button"
          accessibilityLabel={post.mine ? t('Delete', 'حذف') : t('Report or block', 'إبلاغ أو حظر')}
          hitSlop={10}
        >
          <Txt style={{ fontSize: 20, color: colors.textTertiary }}>⋯</Txt>
        </Pressable>
      </View>

      <Txt style={{ fontSize: 16, lineHeight: 23, color: colors.text }}>{post.body}</Txt>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={onLike}
          accessibilityRole="button"
          accessibilityState={{ selected: post.likedByMe }}
          style={{
            borderRadius: radius.pill,
            paddingVertical: 8,
            paddingHorizontal: 14,
            backgroundColor: post.likedByMe ? colors.accentTint : colors.fill,
          }}
        >
          <Txt style={{ fontSize: 13, fontWeight: '600', color: post.likedByMe ? colors.accentDark : colors.textSecondary }}>
            {(post.likedByMe ? '♥ ' : '♡ ') + localizeNumber(post.likeCount, locale)}
          </Txt>
        </Pressable>
      </View>
    </View>
  )
}
