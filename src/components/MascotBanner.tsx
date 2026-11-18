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
  actionLabel,
  onPress,
}: {
  mascot: StickerId;
  title: string;
  body: string;
  tone?: keyof typeof mascotTones;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const content = (
    <>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text
          style={{
            fontSize: actionLabel ? 20 : 17,
            fontWeight: "900",
            color: C.ink,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 18, color: "#414155" }}>
          {body}
        </Text>
        {actionLabel && (
          <View
            style={{
              alignSelf: "flex-start",
              marginTop: 6,
              backgroundColor: C.ink,
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: C.bg, fontWeight: "700", fontSize: 12 }}>
              {actionLabel}
            </Text>
          </View>
        )}
      </View>
      <View style={{ transform: [{ rotate: "-5deg" }] }}>
        <Mascot id={mascot} size={actionLabel ? 108 : 94} />
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
    minHeight: actionLabel ? 136 : 108,
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
