import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Megaphone,
  Square,
} from "lucide-react-native";
import { router } from "expo-router";
import { Button, C, styles } from "../components/ui";
import { profiles } from "../data/mock";
import { useVisiblePosts } from "../lib/hooks";
import { useAppStore } from "../store/useAppStore";

export const tasks = [
  { id: "english", label: "英語 単語テスト", due: "4/25まで" },
  { id: "chemistry", label: "化学プリント提出", due: "4/26まで" },
  { id: "research", label: "探究レポート", due: "4/27まで" },
];
export const timetable = ["現代文", "体育", "化学", "総合探究"];
const periods = ["英語コミュニケーション", "数学Ⅰ", ...timetable];

export function SchoolLife() {
  const done = useAppStore((s) => s.completedTasks);
  const homework = useAppStore((s) => s.homework);
  const seen = useAppStore((s) => s.homeworkSeen);
  const unconfirmed = homework.filter((item) => !seen[item.id]).length;

  const destinations = [
    {
      label: "先生からの宿題",
      summary: unconfirmed ? `未確認 ${unconfirmed}件` : "すべて確認済み",
      icon: ClipboardList,
      color: C.accent,
      path: "/homework" as const,
    },
    {
      label: "学校からのお知らせ",
      summary: "全校への連絡",
      icon: Megaphone,
      color: "#B94D30",
      path: "/school?section=notices" as const,
    },
    {
      label: "時間割",
      summary: "4月25日（木） · 1〜6限",
      icon: CalendarDays,
      color: C.accent,
      path: "/school?section=timetable" as const,
    },
    {
      label: "やること・提出物",
      summary: `完了 ${tasks.filter((task) => done.includes(task.id)).length}/${tasks.length}件`,
      icon: ClipboardCheck,
      color: "#227950",
      path: "/school?section=tasks" as const,
    },
  ];

  return (
    <View style={[styles.card, layout.group]}>
      {destinations.map(
        ({ label, summary, icon: Icon, color, path }, index) => (
          <Pressable
            key={path}
            accessibilityRole="button"
            onPress={() => router.push(path)}
            style={({ pressed }) => [
              layout.row,
              index > 0 && layout.divider,
              pressed && layout.pressed,
            ]}
          >
            <View style={[layout.icon, { backgroundColor: color + "14" }]}>
              <Icon color={color} size={21} />
            </View>
            <View style={layout.copy}>
              <Text style={layout.label}>{label}</Text>
              <Text
                style={[
                  styles.muted,
                  index === 0 &&
                    unconfirmed > 0 && { color: C.purple, fontWeight: "700" },
                ]}
              >
                {summary}
              </Text>
            </View>
            <ChevronRight size={16} color={C.muted} />
          </Pressable>
        ),
      )}
    </View>
  );
}

export function SchoolDetail({ section }: { section: string }) {
  const done = useAppStore((s) => s.completedTasks);
  const toggle = useAppStore((s) => s.toggleTask);

  if (section === "tasks") {
    return (
      <>
        <Text style={[styles.muted, layout.context]}>
          完了 {tasks.filter((task) => done.includes(task.id)).length}/
          {tasks.length}件
        </Text>
        <View style={[styles.card, layout.group]}>
          {tasks.map((task, index) => {
            const checked = done.includes(task.id);
            const Icon = checked ? Check : Square;
            return (
              <Pressable
                key={task.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                onPress={() => toggle(task.id)}
                style={({ pressed }) => [
                  layout.row,
                  index > 0 && layout.divider,
                  pressed && layout.pressed,
                ]}
              >
                <Icon size={21} color={checked ? C.purple : C.muted} />
                <Text
                  style={[
                    styles.text,
                    layout.copy,
                    checked && {
                      color: C.muted,
                      textDecorationLine: "line-through",
                    },
                  ]}
                >
                  {task.label}
                </Text>
                <Text style={styles.muted}>{task.due}</Text>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  }

  if (section === "notices") return <SchoolNotices />;

  return (
    <>
      <Text style={[styles.muted, layout.context]}>4月25日（木）</Text>
      <View style={[styles.card, layout.group]}>
        {periods.map((subject, index) => (
          <View key={subject} style={[layout.row, index > 0 && layout.divider]}>
            <Text style={layout.period}>{index + 1}限</Text>
            <Text style={styles.text}>{subject}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

function SchoolNotices() {
  const notices = useVisiblePosts().filter((post) => post.kind === "school");
  const staff = useAppStore((s) => s.role === "teacher");
  return (
    <View style={{ gap: 10 }}>
      {staff && (
        <Button
          onPress={() =>
            router.push({ pathname: "/create", params: { kind: "school" } })
          }
        >
          学校連絡を作成
        </Button>
      )}
      {notices.map((post) => (
        <Pressable
          key={post.id}
          accessibilityRole="button"
          onPress={() => router.push(`/post/${post.id}`)}
          style={[styles.card, layout.row]}
        >
          <View style={layout.icon}>
            <Megaphone size={20} color={C.purple} />
          </View>
          <View style={layout.copy}>
            <Text style={layout.label}>{post.title || post.body}</Text>
            <Text style={styles.muted}>
              {profiles.find((p) => p.id === post.authorId)?.name ?? "学校"} ·
              教職員
            </Text>
          </View>
          <ChevronRight size={16} color={C.muted} />
        </Pressable>
      ))}
    </View>
  );
}

const layout = StyleSheet.create({
  group: { overflow: "hidden" },
  row: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  divider: { borderTopWidth: 1, borderColor: C.line },
  pressed: { backgroundColor: "#F3F3F3" },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  label: { color: C.ink, fontSize: 15, fontWeight: "700" },
  context: { marginBottom: 10 },
  period: { width: 35, color: C.purple, fontWeight: "700" },
});
