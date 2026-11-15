import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { C, Empty, Screen } from "../../src/components/ui";
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
        <View
          accessibilityRole="tablist"
          style={{
            flexDirection: "row",
            marginHorizontal: 18,
            marginBottom: 12,
            borderBottomWidth: 1,
            borderColor: C.line,
          }}
        >
          {["投稿", "掲示板", "匿名"].map((tab) => {
            const active = filter === tab;
            return (
              <Pressable
                key={tab}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(tab)}
                style={{
                  flex: 1,
                  minHeight: 46,
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottomWidth: 2,
                  borderColor: active ? C.purple : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: active ? "800" : "600",
                    color: active ? C.purple : C.muted,
                  }}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ paddingBottom: 70 }}>
          {posts.map((p) => (
            <PostCard key={p.id} post={p} flat />
          ))}
          {!posts.length && (
            <Empty
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
          width: 52,
          height: 52,
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
