import { useState } from "react";
import { Text, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, C, DetailScreen, Avatar } from "../src/components/ui";
import { Field } from "../src/components/forms";
import { profiles } from "../src/data/mock";
import { useAppStore } from "../src/store/useAppStore";
export default function RoomEditor() {
  const { kind, id } = useLocalSearchParams<{ kind: string; id?: string }>();
  const state = useAppStore();
  const community = state.communities.find((c) => c.id === id);
  const group = state.groups.find((g) => g.id === id);
  const [name, setName] = useState(
    kind === "community" ? (community?.name ?? "") : (group?.name ?? ""),
  );
  const [icon, setIcon] = useState(
    kind === "community" ? (community?.emoji ?? "🎨") : (group?.icon ?? "👥"),
  );
  const [members, setMembers] = useState<string[]>(
    kind === "community"
      ? (community?.memberIds ?? [])
      : (group?.members ?? []),
  );
  const [description, setDescription] = useState(community?.description ?? "");
  return (
    <DetailScreen title={id ? "ルームを編集" : "コミュニティを作成"}>
      <Text style={{ fontSize: 58, textAlign: "center" }}>{icon}</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          marginVertical: 20,
        }}
      >
        {[
          "👥",
          "🎨",
          "🎮",
          "🎵",
          "📚",
          "🐶",
          "🌟",
          "⚽",
          "💻",
          "🌈",
          "📷",
          "💙",
        ].map((e) => (
          <Pressable
            key={e}
            accessibilityRole="button"
            accessibilityLabel={`アイコン ${e}`}
            onPress={() => setIcon(e)}
            style={{
              padding: 10,
              borderRadius: 16,
              backgroundColor: e === icon ? C.lime : C.surface,
            }}
          >
            <Text style={{ fontSize: 26 }}>{e}</Text>
          </Pressable>
        ))}
      </View>
      <Field label="名前" value={name} onChange={setName} maxLength={40} />
      {kind === "community" && (
        <Field
          label="紹介"
          value={description}
          onChange={setDescription}
          maxLength={200}
        />
      )}
      <Text style={{ fontWeight: "800", marginVertical: 12 }}>
        メンバーを管理
      </Text>
      {profiles
        .filter((p) => p.id !== state.me.id && !state.blocked.includes(p.id))
        .map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: members.includes(p.id) }}
            onPress={() =>
              setMembers((m) =>
                m.includes(p.id) ? m.filter((x) => x !== p.id) : [...m, p.id],
              )
            }
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 10,
            }}
          >
            <Avatar uri={p.avatar} size={36} />
            <Text style={{ flex: 1 }}>{p.name}</Text>
            <Text>{members.includes(p.id) ? "✓" : "＋"}</Text>
          </Pressable>
        ))}
      <Button
        disabled={!name.trim()}
        onPress={() => {
          if (kind === "community") {
            const key = id ?? `community-${Date.now()}`;
            state.saveCommunity({
              id: key,
              name: name.trim(),
              description,
              emoji: icon,
              color: C.accentSoft,
              category: community?.category ?? "その他",
              count: members.length + 1,
              memberIds: [
                state.me.id,
                ...members.filter((x) => x !== state.me.id),
              ],
              ownerId: community?.ownerId ?? state.me.id,
            });
            router.replace(`/community/${key}`);
          } else if (id) {
            state.updateGroup(id, { name: name.trim(), icon, members });
            router.back();
          }
        }}
      >
        保存する
      </Button>
    </DetailScreen>
  );
}
