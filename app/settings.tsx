import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  ChevronRight,
  Flag,
  Shield,
  Trash2,
  UserRound,
} from "lucide-react-native";
import {
  Button,
  C,
  DetailScreen,
  SectionTitle,
  styles,
} from "../src/components/ui";
import { useAppStore } from "../src/store/useAppStore";

export default function Settings() {
  const [confirm, setConfirm] = useState(false);
  const reset = useAppStore((s) => s.reset);
  const blocked = useAppStore((s) => s.blocked);
  const reported = useAppStore((s) => s.reported);
  const role = useAppStore((s) => s.role);

  return (
    <DetailScreen title="設定">
      <SectionTitle>プライバシーと安全</SectionTitle>
      <View style={[styles.card, layout.group]}>
        <View style={layout.row}>
          <Shield size={19} color={C.purple} />
          <Text style={[styles.text, layout.grow]}>非表示にしたユーザー</Text>
          <Text style={styles.muted}>{blocked.length}人</Text>
        </View>
        <View style={[layout.row, layout.divider]}>
          <Flag size={19} color={C.purple} />
          <Text style={[styles.text, layout.grow]}>端末に記録した通報</Text>
          <Text style={styles.muted}>{reported.length}件</Text>
        </View>
      </View>
      <Text style={[styles.muted, layout.caption]}>
        通報はこの端末に記録されます。
      </Text>

      <SectionTitle>アカウント</SectionTitle>
      <View style={[styles.card, layout.group]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/login")}
          style={layout.row}
        >
          <UserRound size={19} color={C.purple} />
          <Text style={[styles.text, layout.grow]}>アカウントを切り替える</Text>
          <Text style={styles.muted}>
            {role === "teacher" ? "教職員" : "生徒"}
          </Text>
          <ChevronRight size={16} color={C.muted} />
        </Pressable>
      </View>
      <SectionTitle>端末のデータ</SectionTitle>
      <View style={[styles.card, layout.group]}>
        {confirm ? (
          <View style={[layout.info, layout.divider]}>
            <Text style={styles.text}>
              この端末で作成した投稿や設定を初期状態に戻しますか？
            </Text>
            <View style={layout.actions}>
              <Button small secondary onPress={() => setConfirm(false)}>
                キャンセル
              </Button>
              <Button
                small
                onPress={() => {
                  reset();
                  router.replace("/");
                }}
              >
                初期状態に戻す
              </Button>
            </View>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirm(true)}
            style={[layout.row, layout.divider]}
          >
            <Trash2 size={19} color="#484848" />
            <Text style={[styles.text, layout.danger]}>データをリセット</Text>
          </Pressable>
        )}
      </View>
    </DetailScreen>
  );
}

const layout = StyleSheet.create({
  group: { overflow: "hidden" },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  grow: { flex: 1 },
  divider: { borderTopWidth: 1, borderColor: C.line },
  caption: { marginTop: 6, marginHorizontal: 4 },
  info: { padding: 15, gap: 8 },
  brand: { color: C.ink, fontSize: 16, fontWeight: "800" },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  danger: { color: "#484848" },
});
