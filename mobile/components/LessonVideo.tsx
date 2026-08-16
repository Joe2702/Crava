import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../lib/firebase'
import { useLocale } from '../lib/i18n'
import { Txt } from './Txt'
import { colors, radius } from '../theme/tokens'

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'ready'; url: string }
  | { kind: 'locked' }
  | { kind: 'noVideo' }
  | { kind: 'error'; message: string }

/**
 * Streams the lesson video. The playback URL is minted per request by a Cloud
 * Function and expires, so it is fetched on demand rather than stored with the
 * level — that is also where the entitlement check happens.
 */
export function LessonVideo({ levelId, hasVideo }: { levelId: string; hasVideo: boolean }) {
  const { t } = useLocale()
  const [state, setState] = useState<State>({ kind: hasVideo ? 'idle' : 'noVideo' })

  const player = useVideoPlayer(state.kind === 'ready' ? state.url : null, (p) => {
    p.timeUpdateEventInterval = 1
  })

  useEffect(() => {
    setState({ kind: hasVideo ? 'idle' : 'noVideo' })
  }, [levelId, hasVideo])

  const start = async () => {
    setState({ kind: 'loading' })
    try {
      const call = httpsCallable<{ levelId: string }, { url: string; expiresAt: number }>(
        functions(),
        'getPlaybackUrl',
      )
      const { data } = await call({ levelId })
      setState({ kind: 'ready', url: data.url })
    } catch (e) {
      const code = (e as { code?: string }).code ?? ''
      if (code.includes('permission-denied')) setState({ kind: 'locked' })
      else if (code.includes('failed-precondition')) setState({ kind: 'noVideo' })
      else setState({ kind: 'error', message: e instanceof Error ? e.message : 'Playback failed' })
    }
  }

  useEffect(() => {
    if (state.kind === 'ready') player.play()
  }, [state.kind, player])

  const shell = (children: React.ReactNode) => (
    <View
      style={{
        height: 210,
        borderRadius: radius.xxl,
        overflow: 'hidden',
        backgroundColor: '#232326',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 10,
      }}
    >
      {children}
    </View>
  )

  if (state.kind === 'ready') {
    return (
      <View style={{ height: 210, borderRadius: radius.xxl, overflow: 'hidden', backgroundColor: '#000' }}>
        <VideoView
          style={{ flex: 1 }}
          player={player}
          fullscreenOptions={{ enable: true }}
          allowsPictureInPicture
          contentFit="contain"
        />
      </View>
    )
  }

  if (state.kind === 'loading') return shell(<ActivityIndicator color="#fff" />)

  if (state.kind === 'noVideo') {
    return shell(
      <Txt style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center' }}>
        {t('Video not uploaded yet', 'لم يتم رفع الفيديو بعد')}
      </Txt>,
    )
  }

  if (state.kind === 'locked') {
    return shell(
      <>
        <Txt style={{ color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
          {t('Crava Pro', 'كرافا برو')}
        </Txt>
        <Txt style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' }}>
          {t('Subscribe to unlock this lesson.', 'اشترك لفتح هذا الدرس.')}
        </Txt>
      </>,
    )
  }

  if (state.kind === 'error') {
    return shell(
      <>
        <Txt style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, textAlign: 'center' }}>{state.message}</Txt>
        <Pressable onPress={start} accessibilityRole="button">
          <Txt style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{t('Try again', 'حاول مرة أخرى')}</Txt>
        </Pressable>
      </>,
    )
  }

  return shell(
    <Pressable onPress={start} accessibilityRole="button" accessibilityLabel={t('Play lesson', 'شغّل الدرس')}>
      <View
        style={{
          width: 66,
          height: 66,
          borderRadius: radius.pill,
          backgroundColor: 'rgba(255,255,255,0.94)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt style={{ fontSize: 24, color: colors.text, marginLeft: 4 }}>▶</Txt>
      </View>
    </Pressable>,
  )
}
