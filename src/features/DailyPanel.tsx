import { Text, View } from "react-native";
import { router } from "expo-router";
import { Button, C, styles } from "../components/ui";
import { hasPostedToday, dayKey, dailyAllowance } from "../lib/activity";
import { useAppStore } from "../store/useAppStore";
import { useNow } from "../lib/useNow";
export function DailyPanel() {
  const posts = useAppStore((s) => s.posts),
    usage = useAppStore((s) => s.swipeUsage),
    role = useAppStore((s) => s.role),
    now = useNow();
  const posted = hasPostedToday(posts, now);
  return (
    <View
      style={[
        styles.card,
        { marginHorizontal: 20, padding: 16, marginBottom: 18, gap: 12 },
      ]}
    >
      <Text style={{ fontSize: 13, fontWeight: "700", color: C.ink }}>
        {posted ? "今日の投稿 ✓" : "今日のひとことを投稿しよう"}
      </Text>
      <Text style={styles.muted}>
        {role === "student"
          ? `カードマッチング 残り${dailyAllowance(posts, usage[dayKey(now)] ?? 0, now)}回 · ${posted ? "流行・トランプ公開中" : "投稿で流行・トランプが開きます"}`
          : "先生モード"}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button small secondary onPress={() => router.push("/trends")}>
          今の流行
        </Button>

        <Button
          small
          secondary
          onPress={() => router.push("/create?anonymous=1")}
        >
          匿名つぶやき
        </Button>
      </View>
    </View>
  );
}
