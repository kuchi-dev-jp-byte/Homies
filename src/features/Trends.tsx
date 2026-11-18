import { useState } from "react";
import { Screen, ChipRow, C, Empty, styles } from "../components/ui";
import { PostCard } from "../components/PostCard";
import { profiles } from "../data/mock";
import { Pressable, Text, View } from "react-native";
import { ChevronDown, ChevronRight, Info } from "lucide-react-native";
import { router } from "expo-router";
import { useAppStore } from "../store/useAppStore";
import { hasPostedToday, trends } from "../lib/activity";
import { useVisiblePosts } from "../lib/hooks";
import { useNow } from "../lib/useNow";

export default function Trends() {
  return (
    <Screen title="トレンド">
      <TrendContent />
    </Screen>
  );
}

export function TrendContent({ onTag }: { onTag?: (tag: string) => void }) {
  const [group, setGroup] = useState("全体");
  const [selected, setSelected] = useState<string>();
  const [showInfo, setShowInfo] = useState(false);
  const me = useAppStore((s) => s.me);
  const posts = useVisiblePosts();
  const all = useAppStore((s) => s.posts);
  const role = useAppStore((s) => s.role);
  const now = useNow();
  const unlocked = role !== "student" || hasPostedToday(all, now);
  const filtered = posts.filter(
    (p) =>
      p.audience === "school" &&
      (group === "全体" ||
        (p.authorId === "me" ? me : profiles.find((a) => a.id === p.authorId))
          ?.gender === (group === "男子" ? "male" : "female")),
  );
  const rows = unlocked ? trends(filtered, now) : [];

  return (
    <>
      {!unlocked ? (
        <Empty
          mascot="study"
          title="今日の投稿でトレンドを見る"
          body="投稿すると、学校で今話題になっているタグを確認できます。"
          action="投稿する"
          onPress={() => router.push("/create")}
        />
      ) : (
        <>
          <ChipRow
            items={["全体", "男子", "女子"]}
            value={group}
            onChange={(value) => {
              setSelected(undefined);
              setGroup(value);
            }}
          />
          <View style={{ paddingHorizontal: 18 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 16, color: C.ink, fontWeight: "800" }}>
                直近7日間
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: showInfo }}
                onPress={() => setShowInfo(!showInfo)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  minHeight: 44,
                }}
              >
                <Info size={15} color={C.muted} />
                <Text style={styles.muted}>集計について</Text>
              </Pressable>
            </View>
            {showInfo && (
              <Text style={[styles.muted, { marginBottom: 14 }]}>
                学校全体に公開された投稿のタグを集計し、その前の7日間と比較します。匿名・シークレット投稿は対象外です。男女別は投稿者のプロフィールで選択した性別をもとに自動集計します。
              </Text>
            )}
            {rows.map((r, i) => {
              const expanded = group === "全体" && selected === r.tag;
              const contents = (
                <>
                  <Text
                    style={{
                      width: 28,
                      fontSize: 19,
                      color: C.purple,
                      fontWeight: "800",
                    }}
                  >
                    {i + 1}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: C.tagInk,
                        fontSize: 16,
                        fontWeight: "800",
                      }}
                    >
                      #{r.tag}
                    </Text>
                    <Text style={[styles.muted, { marginTop: 3 }]}>
                      {r.current}件 · 前の7日間から {r.growth > 0 ? "+" : ""}
                      {r.growth}件
                    </Text>
                  </View>
                  {group === "全体" &&
                    (expanded ? (
                      <ChevronDown size={18} color={C.purple} />
                    ) : (
                      <ChevronRight size={18} color={C.muted} />
                    ))}
                </>
              );
              const rowStyle = {
                padding: 14,
                flexDirection: "row" as const,
                alignItems: "center" as const,
                gap: 9,
              };
              return (
                <View key={r.tag} style={[styles.card, { marginBottom: 8 }]}>
                  {group === "全体" ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                      onPress={() =>
                        onTag
                          ? onTag(r.tag)
                          : setSelected(expanded ? undefined : r.tag)
                      }
                      style={rowStyle}
                    >
                      {contents}
                    </Pressable>
                  ) : (
                    <View style={rowStyle}>{contents}</View>
                  )}
                  {expanded && (
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderColor: C.line,
                      }}
                    >
                      <Text style={[styles.muted, { marginBottom: 8 }]}>
                        このタグが使われている投稿
                      </Text>
                      {filtered
                        .filter((p) =>
                          trends([p], now).some((item) => item.tag === r.tag),
                        )
                        .map((p) => (
                          <PostCard key={p.id} post={p} />
                        ))}
                    </View>
                  )}
                </View>
              );
            })}
            {!rows.length && (
              <Empty
                title="集計できるタグがまだありません"
                body={
                  group === "全体"
                    ? "学校全体への投稿に #ハッシュタグ をつけてみよう。"
                    : "全体に切り替えると、学校全体のトレンドを確認できます。"
                }
                action={group === "全体" ? "投稿する" : "全体を見る"}
                onPress={() =>
                  group === "全体" ? router.push("/create") : setGroup("全体")
                }
              />
            )}
          </View>
        </>
      )}
    </>
  );
}
