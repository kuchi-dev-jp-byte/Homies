import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { CalendarDays, Check } from "lucide-react-native";
import {
  Button,
  C,
  DetailScreen,
  SectionTitle,
  styles,
} from "../src/components/ui";
import { Field } from "../src/components/forms";
import { useAppStore } from "../src/store/useAppStore";
export default function Homework() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const role = useAppStore((s) => s.role),
    items = useAppStore((s) => s.homework),
    seen = useAppStore((s) => s.homeworkSeen),
    ack = useAppStore((s) => s.acknowledgeHomework),
    publish = useAppStore((s) => s.publishHomework),
    me = useAppStore((s) => s.me);
  const [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [due, setDue] = useState(""),
    [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unconfirmed" | "seen">("all");
  const unconfirmed = items.filter((item) => !seen[item.id]).length;
  const visibleItems = items
    .filter(
      (item) => filter === "all" || !!seen[item.id] === (filter === "seen"),
    )
    .sort((a, b) => Number(b.id === id) - Number(a.id === id));
  const tabs = [
    { value: "all", label: "すべて" },
    { value: "unconfirmed", label: `未確認 ${unconfirmed}` },
    { value: "seen", label: "確認済み" },
  ] as const;
  return (
    <DetailScreen title="宿題通知">
      {role === "teacher" && (
        <>
          <SectionTitle>宿題を通知する</SectionTitle>
          <Field
            label="宿題のタイトル"
            value={title}
            onChange={setTitle}
            maxLength={80}
          />
          <Field
            label="先生からの連絡"
            value={body}
            onChange={setBody}
            multiline
            maxLength={2000}
          />
          <Field
            label="提出期限"
            value={due}
            onChange={setDue}
            placeholder="2026-11-12"
          />
          {error && (
            <Text style={{ color: C.pink, marginBottom: 12 }}>{error}</Text>
          )}
          <Button
            onPress={() => {
              if (publish(title, body, due)) {
                setTitle("");
                setBody("");
                setDue("");
                setError("");
              } else
                setError(
                  "タイトル・本文と、実在する日付（YYYY-MM-DD）を入力してください",
                );
            }}
          >
            宿題を通知
          </Button>
        </>
      )}
      {role === "teacher" ? (
        <SectionTitle>通知した宿題</SectionTitle>
      ) : (
        <View accessibilityRole="tablist" style={layout.tabs}>
          {tabs.map(({ value, label }) => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === value }}
              onPress={() => setFilter(value)}
              style={[layout.tab, filter === value && layout.selectedTab]}
            >
              <Text
                style={[
                  layout.tabLabel,
                  filter === value && layout.selectedLabel,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {visibleItems.length === 0 && (
        <Text style={[styles.muted, layout.empty]}>
          この条件の宿題はありません。
        </Text>
      )}
      {visibleItems.map((h) => (
        <View
          key={h.id}
          style={[styles.card, layout.card, h.id === id && layout.focused]}
        >
          <View style={layout.date}>
            <CalendarDays size={15} color={C.purple} />
            <Text style={layout.deadline}>提出 {h.due}</Text>
          </View>
          <Text style={layout.title}>{h.title}</Text>
          <Text style={styles.muted}>
            {h.teacher} · {h.createdAt.slice(0, 10)}
          </Text>
          <Text style={styles.text}>{h.body}</Text>
          {role === "student" ? (
            seen[h.id] ? (
              <View style={layout.date}>
                <Check size={17} color="#5D5D5D" />
                <Text style={layout.confirmed}>ミマシタヨ！済み</Text>
              </View>
            ) : (
              <Button secondary onPress={() => ack(h.id)}>
                ミマシタヨ！
              </Button>
            )
          ) : (
            <Text style={styles.muted}>
              {seen[h.id]
                ? `${me.name}：ミマシタヨ！ ${new Date(seen[h.id]).toLocaleString("ja-JP")}`
                : "まだ確認されていません"}
            </Text>
          )}
        </View>
      ))}
    </DetailScreen>
  );
}

const layout = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "#EEEEEE",
    borderRadius: 13,
    padding: 4,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
  },
  tabLabel: { fontSize: 13, color: C.muted, fontWeight: "700" },
  selectedTab: { backgroundColor: "white" },
  selectedLabel: { color: C.purple },
  empty: { padding: 18, textAlign: "center" },
  card: { padding: 16, marginBottom: 10, gap: 8 },
  focused: { borderColor: C.purple },
  date: { flexDirection: "row", alignItems: "center", gap: 6 },
  deadline: { fontSize: 12, color: C.purple, fontWeight: "700" },
  title: { fontSize: 17, color: C.ink, fontWeight: "800" },
  confirmed: { fontSize: 13, color: "#5D5D5D", fontWeight: "700" },
});
