import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native'
import { colors, radius } from '../theme/tokens'

export function PrimaryButton({
  label,
  onPress,
  disabled,
  busy,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  busy?: boolean
}) {
  const inactive = disabled || busy
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor: inactive ? colors.fill : colors.accent,
        borderRadius: radius.md,
        paddingVertical: 17,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {busy ? (
        <ActivityIndicator color={colors.textSecondary} />
      ) : (
        <Text style={{ color: inactive ? colors.textSecondary : '#fff', fontSize: 17, fontWeight: '600' }}>
          {label}
        </Text>
      )}
    </Pressable>
  )
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={{
          backgroundColor: colors.fill,
          borderRadius: radius.sm,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: colors.text,
        }}
        {...props}
      />
    </View>
  )
}

export function ErrorText({ children }: { children: string }) {
  return <Text style={{ color: colors.accentDark, fontSize: 14, lineHeight: 20 }}>{children}</Text>
}
