import { Text, TextInput, View } from "react-native";
import { C } from "./ui";
export function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  keyboard = "default",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboard?: "default" | "number-pad";
  maxLength?: number;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          color: C.ink,
          fontSize: 12,
          fontWeight: "700",
          marginBottom: 9,
        }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.placeholder}
        multiline={multiline}
        keyboardType={keyboard}
        maxLength={maxLength}
        textAlignVertical={multiline ? "top" : "center"}
        style={{
          backgroundColor: C.surface,
          borderRadius: 13,
          borderWidth: 1,
          borderColor: C.line,
          padding: 14,
          minHeight: multiline ? 120 : 48,
          color: C.ink,
          fontSize: 14,
          lineHeight: 22,
        }}
      />
    </View>
  );
}
