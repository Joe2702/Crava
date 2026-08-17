import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { Txt } from './Txt'
import { colors, radius } from '../theme/tokens'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Without this, any render error is a white screen with no way out — the app
 * looks dead and the user has nothing to report. This at least names the error
 * and offers a way back.
 *
 * Deliberately not translated: the locale provider is inside the tree this
 * catches, so reaching for it here would be the second crash.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No crash reporter is wired up yet, so this is the only record that the
    // failure happened. It reaches `adb logcat` and a dev build's console.
    console.error('Unhandled error', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 }}>
        <View style={{ gap: 12 }}>
          <Txt style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>Something broke</Txt>
          <Txt style={{ fontSize: 15, lineHeight: 22, color: colors.textSecondary }}>
            This is a bug in Crava, not something you did. Reopening usually works.
          </Txt>
          <ScrollView style={{ maxHeight: 160 }}>
            <Txt style={{ fontSize: 12, color: colors.textSecondary }}>{String(error.message || error)}</Txt>
          </ScrollView>
          <Pressable
            onPress={() => this.setState({ error: null })}
            accessibilityRole="button"
            style={{
              backgroundColor: colors.accent,
              borderRadius: radius.md,
              paddingVertical: 15,
              alignItems: 'center',
            }}
          >
            <Txt style={{ fontSize: 17, fontWeight: '600', color: '#fff' }}>Try again</Txt>
          </Pressable>
        </View>
      </View>
    )
  }
}
