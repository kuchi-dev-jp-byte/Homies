import { useEffect, useRef, useState } from "react";
import { TextInput, View, Pressable, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronRight, Search, X } from "lucide-react-native";
import {
  useCurrentProfile,
  useProfiles,
  useVisiblePosts,
} from "../../src/lib/hooks";
import { useAppStore } from "../../src/store/useAppStore";
import {
  Avatar,
  C,
  Screen,
  SegmentTabs,
  Empty,
  Loading,
  styles,
} from "../../src/components/ui";

import { TrendContent } from "../../src/features/Trends";
import { PostCard } from "../../src/components/PostCard";
import { profiles } from "../../src/data/mock";
import { trends } from "../../src/lib/activity";

const tabs = ["トレンド", "投稿", "ユーザー"] as const;
type SearchTab = (typeof tabs)[number];
const normalize = (value: string) =>
  value.trim().normalize("NFKC").toLocaleLowerCase();

export default function UserSearch() {
  const { hashtag, request } = useLocalSearchParams<{
    hashtag?: string;
    request?: string;
  }>();
  const [exactTag, setExactTag] = useState(hashtag);
  const [query, setQuery] = useState(hashtag ? `#${hashtag}` : "");
  const [tab, setTab] = useState<SearchTab>(hashtag ? "投稿" : "トレンド");
  const [trendTag, setTrendTag] = useState<string>();
  useEffect(() => {
    if (hashtag) {
      setExactTag(hashtag);
      setTrendTag(undefined);
      setQuery(`#${hashtag}`);
      setTab("投稿");
    }
  }, [hashtag, request]);
  const viewer = useCurrentProfile();
  const posts = useVisiblePosts();
  const [focused, setFocused] = useState(false);
  const input = useRef<TextInput>(null);
  const { data, isLoading } = useProfiles();
  const blocked = useAppStore((s) => s.blocked);
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const searching = terms.length > 0;
  const rows = (data ?? []).filter((p) => {
    const keywords = normalize(
      `${p.name} @${p.id} ${p.bio} ${p.interests.map((i) => i.label).join(" ")}`,
    );
    return (
      p.id !== viewer.id &&
      !blocked.includes(p.id) &&
      terms.every((term) => keywords.includes(term))
    );
  });

  const postResults = searching
    ? posts.filter((p) => {
        if (exactTag) {
          return [
            ...p.tags,
            ...Array.from(
              `${p.title} ${p.body}`.matchAll(/[#＃]([^\s#＃、。！!？?]+)/g),
              (match) => match[1],
            ),
          ].some(
            (tag) => normalize(tag).replace(/^#/, "") === normalize(exactTag),
          );
        }
        if (trendTag) {
          return (
            p.audience === "school" &&
            trends([p]).some(({ tag }) => tag === trendTag)
          );
        }
        const author = p.anonymous
          ? undefined
          : p.authorId === viewer.id
            ? viewer
            : profiles.find((person) => person.id === p.authorId);
        const keywords = normalize(
          [p.title, p.body, ...p.tags, author?.name, author?.id].join(" "),
        );
        return terms.every((term) =>
          keywords.includes(term.replace(/^#(?=.)/, "")),
        );
      })
    : [];

  return (
    <Screen>
      <View style={{ paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingHorizontal: 13,
            minHeight: 48,
            borderWidth: 1,
            borderColor: focused ? C.accent : C.line,
            borderRadius: 14,
            backgroundColor: "white",
            marginBottom: 18,
          }}
        >
          <Search size={19} color={focused ? C.accent : C.muted} />
          <TextInput
            ref={input}
            accessibilityLabel="投稿やユーザーを検索"
            placeholder="投稿・ハッシュタグ・ユーザーを検索"
            placeholderTextColor={C.placeholder}
            value={query}
            onChangeText={(value) => {
              setQuery(value);
              setTrendTag(undefined);
              setExactTag(undefined);
              if (tab === "トレンド" && value.trim()) setTab("投稿");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            style={{ flex: 1, minHeight: 46, color: C.ink, fontSize: 14 }}
          />
          {query.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="検索をクリア"
              onPress={() => {
                setQuery("");
                setTrendTag(undefined);
                setExactTag(undefined);
                input.current?.focus();
              }}
              hitSlop={8}
              style={{ padding: 5 }}
            >
              <X size={17} color={C.muted} />
            </Pressable>
          )}
        </View>
        <View style={{ marginBottom: 14 }}>
          <SegmentTabs items={tabs} value={tab} onChange={setTab} />
        </View>
        {tab === "トレンド" ? (
          <View style={{ marginHorizontal: -20 }}>
            <TrendContent
              onTag={(tag) => {
                setExactTag(undefined);
                setTrendTag(tag);
                setQuery(`#${tag}`);
                setTab("投稿");
              }}
            />
          </View>
        ) : tab === "投稿" ? (
          postResults.length ? (
            postResults.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <Empty
              title={searching ? "投稿が見つかりません" : "投稿を検索"}
              body={
                searching
                  ? "別のキーワードをお試しください。"
                  : "本文のキーワードやハッシュタグで探せます。"
              }
            />
          )
        ) : isLoading ? (
          <Loading />
        ) : rows.length ? (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 14, color: C.ink, fontWeight: "700" }}>
                {searching ? "検索結果" : "同じ学校のユーザー"}
              </Text>
              <Text style={styles.muted}>{rows.length}人</Text>
            </View>
            <View style={[styles.card, { overflow: "hidden" }]}>
              {rows.map((p, index) => (
                <Pressable
                  key={p.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.name}のプロフィールを開く`}
                  onPress={() => router.push(`/profile/${p.id}`)}
                  style={({ pressed }) => ({
                    paddingVertical: 10,
                    paddingHorizontal: 13,
                    flexDirection: "row",
                    gap: 11,
                    alignItems: "center",
                    borderTopWidth: index ? 1 : 0,
                    borderColor: C.line,
                    backgroundColor: pressed ? C.bg : "white",
                  })}
                >
                  <Avatar uri={p.avatar} size={44} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{ fontSize: 14, fontWeight: "700", color: C.ink }}
                    >
                      {p.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.muted}>
                      @{p.id} ·{" "}
                      {p.role ? "教職員" : `高${p.grade}・${p.classroom}組`}
                    </Text>
                  </View>
                  <ChevronRight size={17} color={C.muted} />
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <Empty
            icon="users"
            title="ユーザーが見つかりません"
            body={searching ? "別の名前や趣味で検索してください。" : ""}
          />
        )}
      </View>
    </Screen>
  );
}
