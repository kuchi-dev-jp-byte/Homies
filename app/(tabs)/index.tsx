import { useAppStore } from "../../src/store/useAppStore";
import { CreateFab } from "../../src/components/CreateFab";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
      <CreateFab
        label="投稿を作成"
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
  );
}
