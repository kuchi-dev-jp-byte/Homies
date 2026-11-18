import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight, LayoutGrid, Users } from "lucide-react-native";
import { Button, C, Empty, styles } from "../components/ui";
import type { Community } from "../data/types";
import { useAppStore } from "../store/useAppStore";

function memberCount(room: Community) {
  // Discovery only lists rooms the viewer hasn't joined.
  return room.count - Number(room.memberIds.includes("me"));
}

function DiscoveryCard({ room }: { room: Community }) {
  const join = useAppStore((s) => s.toggleJoin);
  const open = () => router.push(`/community/${room.id}`);
  return (
    <View style={[styles.card, layout.card]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={room.name + "の概要を開く"}
        onPress={open}
        style={layout.summary}
      >
        <View style={[layout.image, { backgroundColor: room.color }]}>
          <Text style={{ fontSize: 32 }}>{room.emoji}</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text numberOfLines={2} style={layout.name}>
            {room.name}
          </Text>
          <Text numberOfLines={2} style={styles.muted}>
            {room.description}
          </Text>
          <Text style={{ color: C.tagInk, fontSize: 12 }}>
            #{room.category}
          </Text>
        </View>
      </Pressable>
      <View style={layout.footer}>
        <Users size={13} color={C.muted} />
        <Text style={[styles.muted, { flex: 1 }]}>
          {memberCount(room)}人が参加中
        </Text>
        <Button
          small
          onPress={() => {
            join(room.id);
            open();
          }}
        >
          参加する
        </Button>
      </View>
    </View>
  );
}

export function CommunityDiscovery({
  rooms,
  search,
}: {
  rooms: Community[];
  search: string;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const categories = new Map(rooms.map((r) => [r.category, r.emoji]));
  const filtered = rooms.filter(
    (r) =>
      (!category || r.category === category) &&
      [r.name, r.category, r.description].some((v) =>
        v.normalize("NFKC").toLowerCase().includes(search),
      ),
  );
  const popular = [...filtered].sort((a, b) => memberCount(b) - memberCount(a));
  const recent = filtered
    .filter((r) => /^community-\d+$/.test(r.id))
    .sort((a, b) => Number(b.id.slice(10)) - Number(a.id.slice(10)));
  const sections = [
    { title: "人気のコミュニティ", rooms: popular },
    {
      title: "おすすめのコミュニティ",
      rooms: filtered.filter((r) => !popular.slice(0, 3).includes(r)),
    },
    { title: "最近作られたコミュニティ", rooms: recent },
  ];
  const browsing = !category && !search && !section;
  const visible = sections.find((s) => s.title === section)?.rooms ?? filtered;
  return (
    <View style={{ gap: 16 }}>
      <Text style={layout.heading}>カテゴリー</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {[null, ...categories.keys()].map((key) => (
          <Pressable
            key={key ?? "all"}
            accessibilityRole="button"
            accessibilityState={{ selected: category === key }}
            onPress={() => {
              setCategory(key);
              setSection(null);
            }}
            style={layout.category}
          >
            <View
              style={[
                layout.tile,
                category === key && {
                  backgroundColor: C.limeSoft,
                  borderColor: C.lime,
                },
              ]}
            >
              {key === null ? (
                <LayoutGrid size={23} color={C.ink} />
              ) : (
                <Text style={{ fontSize: 23 }}>{categories.get(key)}</Text>
              )}
            </View>
            <Text numberOfLines={1} style={layout.caption}>
              {key ?? "すべて"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {(browsing
        ? sections.filter((s) => s.rooms.length)
        : [
            {
              title: section ?? (search ? "検索結果" : category!),
              rooms: visible,
            },
          ]
      ).map((s) => (
        <View key={s.title} style={{ gap: 9 }}>
          <View style={layout.sectionHeader}>
            <Text style={layout.heading}>{s.title}</Text>
            {browsing && s.rooms.length > 3 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSection(s.title)}
                style={layout.link}
              >
                <Text style={styles.muted}>すべて見る</Text>
                <ChevronRight size={14} color={C.muted} />
              </Pressable>
            )}
            {section && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSection(null)}
              >
                <Text style={styles.muted}>一覧に戻る</Text>
              </Pressable>
            )}
          </View>
          {(browsing ? s.rooms.slice(0, 3) : s.rooms).map((r) => (
            <DiscoveryCard key={r.id} room={r} />
          ))}
        </View>
      ))}
      {!visible.length && (
        <Empty
          mascot="game"
          title="コミュニティが見つかりません"
          body={
            rooms.length
              ? "カテゴリーやキーワードを変えて探してみてください。"
              : "参加したコミュニティは「参加中」から開けます。"
          }
        />
      )}
    </View>
  );
}

const layout = StyleSheet.create({
  card: { padding: 13, gap: 8 },
  summary: { flexDirection: "row", alignItems: "center", gap: 13 },
  image: {
    width: 70,
    height: 70,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: C.ink, fontWeight: "700", fontSize: 15 },
  footer: { flexDirection: "row", alignItems: "center", gap: 5 },
  category: { width: 60, alignItems: "center", gap: 5 },
  tile: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  caption: { fontSize: 11, fontWeight: "600", color: C.ink },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heading: { fontSize: 16, fontWeight: "800", color: C.ink },
  link: { flexDirection: "row", alignItems: "center", paddingVertical: 5 },
});
