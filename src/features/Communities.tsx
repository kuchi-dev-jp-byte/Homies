import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight, Search, Users } from "lucide-react-native";
import { Community } from "../data/types";
import { useAppStore } from "../store/useAppStore";
import { useCommunities } from "../lib/hooks";
import { messageTime, roomMessages } from "../lib/chat";
import { C, Empty, Loading, Screen, styles } from "../components/ui";

export function CommunityCard({
  community,
  showConversation = false,
}: {
  community: Community;
  showConversation?: boolean;
}) {
  const joined = useAppStore((s) => s.joined.includes(community.id));
  const messages = useAppStore((s) => s.chatMessages),
    blocked = useAppStore((s) => s.blocked);
  const latest = showConversation
    ? roomMessages(messages, community.id, blocked).at(-1)
    : undefined;
  const count =
    community.count +
    Number(joined) -
    Number(community.memberIds.includes("me"));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${community.name}の${joined ? "トーク" : "概要"}を開く`}
      onPress={() => router.push(`/community/${community.id}`)}
      style={[
        !showConversation && styles.card,
        {
          paddingHorizontal: showConversation ? 2 : 14,
          paddingVertical: showConversation ? 11 : 13,
          marginBottom: showConversation ? 0 : 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: C.line,
        },
      ]}
    >
      <View
        style={{
          width: 49,
          height: 49,
          borderRadius: 16,
          backgroundColor: community.color,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24 }}>{community.emoji}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            numberOfLines={1}
            style={{ fontSize: 14, fontWeight: "700", color: C.ink, flex: 1 }}
          >
            {community.name}
          </Text>
          {latest ? (
            <Text style={{ fontSize: 10, color: C.muted }}>
              {messageTime(latest.createdAt)}
            </Text>
          ) : (
            <ChevronRight size={16} color={C.muted} />
          )}
        </View>
        <Text
          numberOfLines={showConversation ? 1 : 2}
          style={[styles.muted, { fontSize: 12, marginTop: 5, lineHeight: 19 }]}
        >
          {showConversation
            ? (latest?.body ?? "トークをはじめよう")
            : community.description}
        </Text>
        {!showConversation && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              marginTop: 6,
            }}
          >
            <Users size={13} color={C.muted} />
            <Text style={{ fontSize: 11, color: C.muted }}>{count}人</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>
              · {community.category}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
export default function Communities() {
  const [query, setQuery] = useState(""),
    [mode, setMode] = useState("参加中");
  const { data, isLoading } = useCommunities(),
    joined = useAppStore((s) => s.joined),
    messages = useAppStore((s) => s.chatMessages),
    blocked = useAppStore((s) => s.blocked);
  const search = query.trim().normalize("NFKC").toLowerCase();
  const items = (data ?? []).filter(
    (c) =>
      (c.name + c.description + c.category)
        .normalize("NFKC")
        .toLowerCase()
        .includes(search) &&
      (mode === "参加中" ? joined.includes(c.id) : !joined.includes(c.id)),
  );
  if (mode === "参加中")
    items.sort((a, b) => {
      const lastA =
        roomMessages(messages, a.id, blocked).at(-1)?.createdAt ?? "";
      const lastB =
        roomMessages(messages, b.id, blocked).at(-1)?.createdAt ?? "";
      return lastB.localeCompare(lastA);
    });
  return (
    <Screen>
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 10,
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 14,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Search size={18} color="#A8A8A8" />
        <TextInput
          accessibilityLabel="コミュニティを検索"
          placeholder="コミュニティを検索"
          placeholderTextColor={C.placeholder}
          value={query}
          onChangeText={setQuery}
          style={{ flex: 1, minHeight: 44, color: C.ink, fontSize: 14 }}
        />
      </View>
      <View
        accessibilityRole="tablist"
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          gap: 26,
          borderBottomWidth: 1,
          borderColor: C.line,
          marginBottom: 8,
        }}
      >
        {["参加中", "おすすめ"].map((m) => (
          <Pressable
            key={m}
            accessibilityRole="tab"
            aria-selected={mode === m}
            onPress={() => setMode(m)}
            style={{
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderColor: mode === m ? C.purple : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: mode === m ? C.purple : C.muted,
              }}
            >
              {m}
              {m === "参加中" ? ` (${joined.length})` : ""}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        {isLoading ? (
          <Loading />
        ) : (
          items.map((c) => (
            <CommunityCard
              key={c.id}
              community={c}
              showConversation={mode === "参加中"}
            />
          ))
        )}
        {!isLoading && !items.length && (
          <Empty
            title={
              search
                ? "コミュニティが見つかりません"
                : mode === "参加中"
                  ? "参加中のコミュニティはありません"
                  : "新しいおすすめはありません"
            }
            body={
              search
                ? "別のキーワードで検索してください。"
                : mode === "参加中"
                  ? "おすすめから参加したいルームを探せます。"
                  : "参加中のルームは「参加中」から開けます。"
            }
            action={mode === "参加中" ? "おすすめを見る" : undefined}
            onPress={() => {
              setMode("おすすめ");
              setQuery("");
            }}
          />
        )}
      </View>
    </Screen>
  );
}
