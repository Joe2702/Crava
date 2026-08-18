import type { ReactElement } from 'react'
import { Platform, Pressable, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { BottomTabBarProps } from 'expo-router/tabs'
import { Txt } from './Txt'
import { IconHome, IconSearch, IconUser } from './Icons'
import { colors, radius } from '../theme/tokens'

const ICONS: Record<string, (p: { color: string }) => ReactElement> = {
  index: ({ color }) => <IconHome color={color} />,
  search: ({ color }) => <IconSearch size={23} color={color} />,
  profile: ({ color }) => <IconUser color={color} />,
}

/**
 * The floating glass pill from the design, rather than a docked system tab bar.
 * It sits above the content, so every scrolling screen pads its bottom by
 * TAB_BAR_CLEARANCE to keep the last row reachable.
 */
export const TAB_BAR_HEIGHT = 62
export const TAB_BAR_CLEARANCE = TAB_BAR_HEIGHT + 26

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: Math.max(insets.bottom, 14) + 12,
        borderRadius: radius.pill,
        overflow: 'hidden',
        // Android's elevation draws behind the blur, so the shadow is iOS-only
        // and Android gets a slightly more opaque fill to keep the edge visible.
        ...Platform.select({
          ios: {
            shadowColor: '#1c1c1e',
            shadowOpacity: 0.16,
            shadowRadius: 34,
            shadowOffset: { width: 0, height: 10 },
          },
          android: { elevation: 8 },
          default: {},
        }),
      }}
    >
      <BlurView
        intensity={Platform.OS === 'android' ? 40 : 70}
        tint="light"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 9,
          paddingHorizontal: 8,
          backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.62)',
        }}
      >
        {state.routes.map((route, i) => {
          const { options } = descriptors[route.key]
          const focused = state.index === i
          const color = focused ? colors.accent : colors.textSecondary
          const Icon = ICONS[route.name]

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.title ?? route.name}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name)
              }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 5 }}
            >
              {Icon ? <Icon color={color} /> : null}
              <Txt style={{ fontSize: 10.5, fontWeight: '600', color }} numberOfLines={1}>
                {options.title ?? route.name}
              </Txt>
            </Pressable>
          )
        })}
      </BlurView>
    </View>
  )
}
