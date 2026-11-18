import { useAppStore } from "../../src/store/useAppStore";
import { MascotBanner } from "../../src/components/MascotBanner";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { C, Empty, Screen, SegmentTabs } from "../../src/components/ui";
import { PostCard } from "../../src/components/PostCard";
import { useVisiblePosts } from "../../src/lib/hooks";
export default function Home() {
  const { feed, feedKey } = useLocalSearchParams<{
    feed?: string;
    feedKey?: string;
  }>();
  const [filter, setFilter] = useState("投稿");
  useEffect(() => {
    if (feed)
      setFilter(
        feed === "board" ? "掲示板" : feed === "anonymous" ? "匿名" : "投稿",
      );
  }, [feed, feedKey]);
  const reposted = useAppStore((s) => s.reposted);
  const posts = useVisiblePosts().filter((p) =>
    filter === "掲示板"
      ? p.kind === "board"
      : filter === "匿名"
        ? !!p.anonymous
        : p.kind === "student" && !p.anonymous,
  );
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 14 }}>
          <SegmentTabs
            items={["投稿", "掲示板", "匿名"]}
            value={filter}
            onChange={setFilter}
          />
        </View>
        <View style={{ marginHorizontal: 12, marginBottom: 14 }}>
          <MascotBanner
            mascot={
              filter === "匿名"
                ? "cool"
                : filter === "掲示板"
                  ? "gift"
                  : "skate"
            }
            tone={
              filter === "匿名"
                ? "blue"
                : filter === "掲示板"
                  ? "neutral"
                  : "lime"
            }
            title={
              filter === "匿名"
                ? "気軽に、ひとこと。"
                : filter === "掲示板"
                  ? "いっしょに、何しよう？"
                  : "今日の「好き」をシェア！"
            }
            body="何気ないひとことから、つながろう。"
            onPress={() =>
              router.push({
                pathname: "/create",
                params:
                  filter === "掲示板"
                    ? { kind: "board" }
                    : filter === "匿名"
                      ? { anonymous: "1" }
                      : {},
              })
            }
          />
        </View>
        <View style={{ paddingBottom: 70, paddingHorizontal: 0 }}>
          {filter === "投稿" &&
            posts
              .filter((p) => reposted.includes(p.id))
              .map((p) => (
                <View key={`repost-${p.id}`}>
                  <Text style={{ padding: 12, color: C.muted }}>
                    あなたがリポストしました
                  </Text>
                  <PostCard post={p} />
                </View>
              ))}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {!posts.length && (
            <Empty
              mascot="study"
              title="まだ投稿がありません"
              body="最初のひとことを投稿してみよう。"
            />
          )}
        </View>
      </Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="投稿を作成"
        onPress={() =>
          router.push({
            pathname: "/create",
            params:
              filter === "掲示板"
                ? { kind: "board" }
                : filter === "匿名"
                  ? { anonymous: "1" }
                  : {},
          })
        }
        style={{
          position: "absolute",
          bottom: 22,
          right: 22,
          width: 58,
          height: 58,
          borderWidth: 2,
          borderColor: C.bg,
          borderRadius: 29,
          backgroundColor: C.accent,
          alignItems: "center",
          justifyContent: "center",
          elevation: 5,
          shadowColor: C.accent,
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 5 },
        }}
      >
        <Plus size={27} color="white" />
      </Pressable>
    </View>
  );
}
