import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Circle, CircleCheck } from "lucide-react-native";
import { Button, C, DetailScreen, Empty, styles } from "../src/components/ui";
import { useAppStore } from "../src/store/useAppStore";
export default function Safety() {
  const { userId, postId, mode } = useLocalSearchParams<{
      userId?: string;
      postId?: string;
      mode?: string;
    }>(),
    [reason, setReason] = useState("不適切な内容"),
    report = useAppStore((s) => s.report),
    block = useAppStore((s) => s.block);
  if (!postId && !userId)
    return (
      <DetailScreen title="通報・非表示">
        <Empty
          title="対象が選択されていません"
          body="投稿やプロフィールのメニューから開いてください。"
        />
      </DetailScreen>
    );
  return (
    <DetailScreen title="通報・非表示">
      <Text style={[styles.title, { fontSize: 21, marginBottom: 8 }]}>
        通報の理由を選ぶ
      </Text>
      <Text style={[styles.muted, { marginBottom: 16 }]}>
        通報はこの端末に記録されます。
      </Text>
      <View
        accessibilityRole="radiogroup"
        style={[styles.card, { marginBottom: 16, paddingHorizontal: 14 }]}
      >
        {["不適切な内容", "迷惑行為", "個人情報の掲載", "その他"].map(
          (r, i) => {
            const active = reason === r;
            const Indicator = active ? CircleCheck : Circle;
            return (
              <Pressable
                key={r}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setReason(r)}
                style={{
                  minHeight: 50,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTopWidth: i ? 1 : 0,
                  borderColor: C.line,
                }}
              >
                <Text
                  style={[
                    styles.text,
                    active && { color: C.purple, fontWeight: "700" },
                  ]}
                >
                  {r}
                </Text>
                <Indicator size={20} color={active ? C.purple : C.muted} />
              </Pressable>
            );
          },
        )}
      </View>
      <Button
        onPress={() => {
          report(`${postId ?? userId}:${reason}`);
          if (router.canGoBack()) router.back();
          else router.replace("/");
        }}
      >
        通報内容を記録する
      </Button>
      {mode !== "report" &&
        userId &&
        userId !== "school" &&
        userId !== "me" && (
          <View style={{ marginTop: 18 }}>
            <Button
              secondary
              onPress={() => {
                block(userId);
                router.replace("/");
              }}
            >
              このユーザーを非表示にする
            </Button>
            <Text style={[styles.muted, { marginTop: 12 }]}>
              ホームとマッチングに表示されなくなります。設定でデータをリセットすると解除されます。
            </Text>
          </View>
        )}
    </DetailScreen>
  );
}
