import { mascotTones } from "./MascotBanner";
import { Pressable, ScrollView, Text, View } from "react-native";
import { stickerLabels, type StickerId } from "../data/stickers";
import { Mascot } from "./Mascot";
import { C } from "./ui";

const ids = Object.keys(stickerLabels) as StickerId[];

export function StickerPicker({ onSend }: { onSend: (id: StickerId) => void }) {
  return (
    <ScrollView
      style={{ maxHeight: 230, backgroundColor: C.surface, borderRadius: 16 }}
      aria-label="Homiesスタンプ"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 8 }}
    >
      <Text
        style={{
          color: C.accent,
          fontSize: 12,
          fontWeight: "800",
          paddingBottom: 8,
        }}
      >
        HOMIES STICKERS
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {ids.map((id, index) => (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={`${stickerLabels[id]}のスタンプを送る`}
            onPress={() => onSend(id)}
            style={({ pressed }) => ({
              width: "23%",
              flexGrow: 1,
              minHeight: 80,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              backgroundColor: pressed
                ? C.accentSoft
                : Object.values(mascotTones)[
                    index % Object.keys(mascotTones).length
                  ],
            })}
          >
            <Mascot id={id} size={58} />
            <Text
              numberOfLines={1}
              style={{ fontSize: 9, color: C.ink, marginTop: 3 }}
            >
              {stickerLabels[id]}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
