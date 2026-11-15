import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight, ClipboardList, Megaphone } from "lucide-react-native";
import { C, DetailScreen, SectionTitle, styles } from "../src/components/ui";
import { profiles } from "../src/data/mock";
import { useVisiblePosts } from "../src/lib/hooks";
import { useAppStore } from "../src/store/useAppStore";

export default function Notifications() {
  const staff = useAppStore((s) => s.role === "teacher");
  const read = useAppStore((s) => s.readNotifications);
  const homework = useAppStore((s) => s.homework);
  const seen = useAppStore((s) => s.homeworkSeen);
  const notices = useVisiblePosts().filter((post) => post.kind === "school");
  useEffect(() => {
    read();
  }, [read]);

  return (
    <DetailScreen title="学校の通知">
      <SectionTitle>宿題</SectionTitle>
      {homework.length ? (
        <View style={[styles.card, layout.group]}>
          {homework.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/homework", params: { id: item.id } })
              }
              style={({ pressed }) => [
                layout.row,
                index > 0 && layout.divider,
                !seen[item.id] && layout.unread,
                pressed && layout.pressed,
              ]}
            >
              <View style={layout.icon}>
                <ClipboardList size={20} color={C.purple} />
              </View>
              <View style={layout.copy}>
                <Text style={layout.title}>{item.title}</Text>
                <Text style={styles.muted}>
                  {item.teacher} · 提出 {item.due}
                </Text>
                {!seen[item.id] && <Text style={layout.status}>未確認</Text>}
              </View>
              <ChevronRight size={16} color={C.muted} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>宿題の通知はありません。</Text>
      )}

      <SectionTitle
        action={staff ? "学校連絡を作成" : undefined}
        onPress={() =>
          router.push({ pathname: "/create", params: { kind: "school" } })
        }
      >
        学校からのお知らせ
      </SectionTitle>
      {notices.length ? (
        <View style={[styles.card, layout.group]}>
          {notices.map((post, index) => (
            <Pressable
              key={post.id}
              accessibilityRole="button"
              onPress={() => router.push(`/post/${post.id}`)}
              style={({ pressed }) => [
                layout.row,
                index > 0 && layout.divider,
                pressed && layout.pressed,
              ]}
            >
              <View style={layout.icon}>
                <Megaphone size={20} color={C.purple} />
              </View>
              <View style={layout.copy}>
                <Text style={layout.title}>{post.title || post.body}</Text>
                <Text style={styles.muted}>
                  {profiles.find((person) => person.id === post.authorId)
                    ?.name ?? "学校"}{" "}
                  · 教職員
                </Text>
              </View>
              <ChevronRight size={16} color={C.muted} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.muted}>学校からのお知らせはありません。</Text>
      )}
    </DetailScreen>
  );
}

const layout = StyleSheet.create({
  group: { overflow: "hidden" },
  row: {
    minHeight: 64,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  divider: { borderTopWidth: 1, borderColor: C.line },
  unread: { backgroundColor: "#F9F9F9" },
  pressed: { backgroundColor: "#EEEEEE" },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 3 },
  title: { color: C.ink, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  status: { color: C.purple, fontSize: 11, fontWeight: "700" },
});
