import { Pressable } from 'react-native'
import { Txt } from './Txt'
import { colors, radius } from '../theme/tokens'

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        paddingVertical: 9,
        paddingHorizontal: 15,
        borderRadius: radius.pill,
        backgroundColor: selected ? colors.text : colors.fill,
      }}
    >
      <Txt style={{ fontSize: 14, fontWeight: '600', color: selected ? '#fff' : colors.textSecondary }}>
        {label}
      </Txt>
    </Pressable>
  )
}
