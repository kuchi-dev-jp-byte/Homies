import { Plus } from "lucide-react-native";
import { Pressable } from "react-native";
import { C } from "./ui";

export function CreateFab({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        position: "absolute",
        bottom: 22,
        right: 22,
        width: 58,
        height: 58,
        borderWidth: 2,
        borderColor: C.bg,
        borderRadius: 29,
        backgroundColor: C.accent,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
        shadowColor: C.accent,
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Plus size={27} color="white" />
    </Pressable>
  );
}
