import { Pressable, Text, View } from "react-native";
import { Mascot } from "./Mascot";
import { C } from "./ui";
import type { StickerId } from "../data/stickers";

export const mascotTones = {
  lime: C.limeSoft,
  blue: C.accentSoft,
  neutral: C.surface,
};

/** A compact, reusable scene using the original Homies sticker artwork. */
export function MascotBanner({
  mascot,
  title,
  body,
  tone = "lime",
  onPress,
}: {
  mascot: StickerId;
  title: string;
  body: string;
  tone?: keyof typeof mascotTones;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text style={{ fontSize: 17, fontWeight: "900", color: C.ink }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: "#414155" }}>
          {body}
        </Text>
      </View>
      <View style={{ transform: [{ rotate: "-5deg" }] }}>
        <Mascot id={mascot} size={94} />
      </View>
    </>
  );
  const style = {
    backgroundColor: mascotTones[tone],
    borderRadius: 24,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    minHeight: 108,
  };
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.75 : 1 }]}
    >
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}
