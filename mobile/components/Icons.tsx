import Svg, { Circle, Path, Polygon } from 'react-native-svg'
import { colors } from '../theme/tokens'

/**
 * Ported one-for-one from the design's SVGs so the native app and the design
 * stay the same drawing. Every icon is a 24x24 viewBox, which is what lets a
 * single `size` prop scale them without the strokes drifting apart.
 */
interface IconProps {
  size?: number
  color?: string
  strokeWidth?: number
}

const stroke = {
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function IconBell({ size = 17, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" stroke={color} strokeWidth={strokeWidth} {...stroke} />
      <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke={color} strokeWidth={strokeWidth} {...stroke} />
    </Svg>
  )
}

export function IconFlame({ size = 15, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13 2 4.5 13.5H11l-1 8.5L18.5 10.5H12z" stroke={color} strokeWidth={strokeWidth} {...stroke} />
    </Svg>
  )
}

export function IconPlay({ size = 13, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="6 3 20 12 6 21" fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  )
}

export function IconPlayBig({ size = 24, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="7 4 20 12 7 20" fill={color} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  )
}

export function IconSearch({ size = 18, color = colors.text, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="11" cy="11" r="7.5" stroke={color} strokeWidth={strokeWidth} fill="none" />
      <Path d="m21 21-4.3-4.3" stroke={color} strokeWidth={strokeWidth} {...stroke} />
    </Svg>
  )
}

export function IconHome({ size = 23, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth={2} {...stroke} />
      <Path d="M9 22V13h6v9" stroke={color} strokeWidth={2} {...stroke} />
    </Svg>
  )
}

export function IconTrain({ size = 23, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={color} strokeWidth={2} {...stroke} />
    </Svg>
  )
}

export function IconCoaches({ size = 23, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} {...stroke} />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={2} fill="none" />
      <Path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke={color} strokeWidth={2} {...stroke} />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={color} strokeWidth={2} {...stroke} />
    </Svg>
  )
}

export function IconUser({ size = 23, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" stroke={color} strokeWidth={2} {...stroke} />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  )
}

export function IconChevronRight({ size = 18, color = colors.textTertiary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="m9 18 6-6-6-6" stroke={color} strokeWidth={2.5} {...stroke} />
    </Svg>
  )
}

export function IconCheck({ size = 13, color = colors.text, strokeWidth = 3 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" stroke={color} strokeWidth={strokeWidth} {...stroke} />
    </Svg>
  )
}

export function IconCheckBig({ size = 36, color = colors.text }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 6 9 17l-5-5" stroke={color} strokeWidth={2.6} {...stroke} />
    </Svg>
  )
}

export function IconLock({ size = 15, color = colors.textTertiary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 11V8a6 6 0 0 1 12 0v3" stroke={color} strokeWidth={2} {...stroke} />
      <Path d="M4.5 11h15v10.5h-15z" stroke={color} strokeWidth={2} {...stroke} />
    </Svg>
  )
}
