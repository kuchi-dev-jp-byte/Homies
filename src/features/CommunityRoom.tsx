import { Mascot } from "../components/Mascot";
import { StickerPicker } from "../components/StickerPicker";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Info, Send, Smile, Users, X } from "lucide-react-native";
import { profiles } from "../data/mock";
import { ChatMessage } from "../data/types";
import {
  Avatar,
  Button,
  C,
  DetailScreen,
  Empty,
  IconButton,
  styles,
} from "../components/ui";
import { PostCard } from "../components/PostCard";
import { useAppStore } from "../store/useAppStore";
import { useVisiblePosts } from "../lib/hooks";
import { messageDate, messageTime, roomMessages } from "../lib/chat";

function MessageBubble({ message }: { message: ChatMessage }) {
  const me = useAppStore((s) => s.me),
    own = message.authorId === "me";
  const author = own ? me : profiles.find((p) => p.id === message.authorId);
  return (
    <View
      style={{
        flexDirection: own ? "row-reverse" : "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 11,
      }}
    >
      {!own && author && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${author.name}のプロフィール`}
          onPress={() => router.push(`/profile/${author.id}`)}
        >
          <Avatar uri={author.avatar} size={33} />
        </Pressable>
      )}
      <View
        style={{ maxWidth: "78%", alignItems: own ? "flex-end" : "flex-start" }}
      >
        {!own && (
          <Text
            style={{
              fontSize: 11,
              color: "#7A7A7A",
              marginBottom: 5,
              marginLeft: 3,
            }}
          >
            {author?.name ?? "メンバー"}
          </Text>
        )}
        {message.stickerId ? (
          <Mascot id={message.stickerId} size={125} asMessage />
        ) : (
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: own ? C.accent : C.surface,
              borderRadius: 18,
              borderTopLeftRadius: own ? 18 : 4,
              borderTopRightRadius: own ? 4 : 18,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                lineHeight: 21,
                color: own ? "white" : C.ink,
              }}
            >
              {message.body}
            </Text>
          </View>
        )}
        <Text
          style={{
            fontSize: 10,
            color: "#9C9C9C",
            marginTop: 4,
            marginHorizontal: 3,
          }}
        >
          {messageTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function CommunityRoom() {
  const { id, tab: requestedTab } = useLocalSearchParams<{
    id: string;
    tab?: string;
  }>();
  const [showStickers, setShowStickers] = useState(false);
  const [section, setSection] = useState(
      requestedTab === "notes" ? "ノート" : "トーク",
    ),
    [info, setInfo] = useState(false),
    [leaving, setLeaving] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const community = useAppStore((s) => s.communities.find((c) => c.id === id));
  const joined = useAppStore((s) => s.joined.includes(id)),
    toggleJoin = useAppStore((s) => s.toggleJoin),
    me = useAppStore((s) => s.me),
    blocked = useAppStore((s) => s.blocked);
  const allMessages = useAppStore((s) => s.chatMessages),
    draft = useAppStore((s) => s.chatDrafts[id] ?? ""),
    setDraft = useAppStore((s) => s.setChatDraft),
    send = useAppStore((s) => s.sendMessage);
  const posts = useVisiblePosts().filter((p) => p.communityId === id);
  const messages = roomMessages(allMessages, id, blocked);
  if (!community)
    return (
      <DetailScreen title="コミュニティ">
        <Empty
          title="コミュニティが見つかりません"
          body="一覧からもう一度選択してください。"
        />
      </DetailScreen>
    );
  const members = [
    ...profiles.filter(
      (p) =>
        p.id !== "me" &&
        community.memberIds.includes(p.id) &&
        !blocked.includes(p.id),
    ),
    ...(joined ? [me] : []),
  ];
  const count =
    community.count +
    Number(joined) -
    Number(community.memberIds.includes("me"));
  const back = () =>
    router.canGoBack() ? router.back() : router.replace("/communities");
  const closeInfo = () => {
    setInfo(false);
    setLeaving(false);
  };
  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <Button
        small
        secondary
        onPress={() =>
          router.push({
            pathname: "/room-editor",
            params: { kind: "community", id },
          })
        }
      >
        コミュニティを編集
      </Button>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 5,
          gap: 5,
          borderBottomWidth: 1,
          borderColor: C.line,
        }}
      >
        <IconButton label="コミュニティ一覧に戻る" onPress={back}>
          <ArrowLeft size={22} color={C.ink} />
        </IconButton>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 9,
          }}
        >
          {joined && (
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 11,
                backgroundColor: community.color,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20 }}>{community.emoji}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 15, fontWeight: "700", color: C.ink }}
            >
              {joined ? community.name : "コミュニティ概要"}
            </Text>
            {joined && (
              <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {count}人
              </Text>
            )}
          </View>
        </View>
        {joined && (
          <IconButton label="ルーム情報" onPress={() => setInfo(true)}>
            <Info size={21} color={C.muted} />
          </IconButton>
        )}
      </View>
      {!joined ? (
        <>
          <ScrollView
            contentContainerStyle={{ padding: 22, alignItems: "center" }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 26,
                backgroundColor: community.color,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 40 }}>{community.emoji}</Text>
            </View>
            <Text style={[styles.title, { fontSize: 23, textAlign: "center" }]}>
              {community.name}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                marginTop: 12,
              }}
            >
              <Users size={14} color={C.muted} />
              <Text style={styles.muted}>
                {count}人 · {community.category}
              </Text>
            </View>
            <Text
              style={[
                styles.text,
                { textAlign: "center", marginTop: 24, fontSize: 14 },
              ]}
            >
              {community.description}
            </Text>
          </ScrollView>
          <View style={{ padding: 20, borderTopWidth: 1, borderColor: C.line }}>
            <Button
              onPress={() => {
                toggleJoin(id);
                setSection("トーク");
              }}
            >
              参加してトークを開く
            </Button>
          </View>
        </>
      ) : (
        <>
          <View
            accessibilityRole="tablist"
            style={{
              flexDirection: "row",
              backgroundColor: "white",
              borderBottomWidth: 1,
              borderColor: C.line,
            }}
          >
            {["トーク", "ノート", "メンバー"].map((t) => (
              <Pressable
                key={t}
                accessibilityRole="tab"
                aria-selected={section === t}
                onPress={() => setSection(t)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderColor: section === t ? C.ink : "transparent",
                  backgroundColor: section === t ? C.lime : "transparent",
                  borderTopLeftRadius: 18,
                  borderTopRightRadius: 18,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: section === t ? C.purple : C.muted,
                  }}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
          {section === "トーク" ? (
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <ScrollView
                ref={scroll}
                showsVerticalScrollIndicator={false}
                onLayout={() =>
                  scroll.current?.scrollToEnd({ animated: false })
                }
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1, backgroundColor: "white" }}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 12,
                }}
                onContentSizeChange={() =>
                  scroll.current?.scrollToEnd({ animated: false })
                }
              >
                {messages.map((message, index) => (
                  <View key={message.id}>
                    {(index === 0 ||
                      messageDate(messages[index - 1].createdAt) !==
                        messageDate(message.createdAt)) && (
                      <View
                        style={{
                          alignSelf: "center",
                          paddingVertical: 5,
                          paddingHorizontal: 12,
                          borderRadius: 20,
                          backgroundColor: "#E7E7E7",
                          marginBottom: 12,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: "#8A8A8A" }}>
                          {messageDate(message.createdAt)}
                        </Text>
                      </View>
                    )}
                    <MessageBubble message={message} />
                  </View>
                ))}
                {!messages.length && (
                  <Empty
                    title="まだメッセージがありません"
                    body="最初のひとことを送ってみよう。"
                  />
                )}
              </ScrollView>
              {showStickers && (
                <View style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
                  <StickerPicker
                    onSend={(stickerId) => {
                      if (send(id, "", stickerId)) setShowStickers(false);
                    }}
                  />
                </View>
              )}
              <View
                style={{
                  backgroundColor: "white",
                  borderTopWidth: 1,
                  borderColor: C.line,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: 9,
                }}
              >
                <IconButton
                  label={showStickers ? "スタンプを閉じる" : "スタンプを開く"}
                  onPress={() => setShowStickers(!showStickers)}
                  style={{
                    backgroundColor: showStickers ? C.lime : C.surface,
                    borderRadius: 22,
                  }}
                >
                  <Smile size={22} color={C.ink} />
                </IconButton>
                <TextInput
                  accessibilityLabel="メッセージ"
                  placeholder="メッセージを入力"
                  placeholderTextColor="#A0A0A0"
                  multiline
                  maxLength={1000}
                  value={draft}
                  onChangeText={(value) => setDraft(id, value)}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    maxHeight: 120,
                    paddingHorizontal: 15,
                    paddingVertical: 11,
                    borderRadius: 22,
                    backgroundColor: C.surface,
                    color: C.ink,
                    fontSize: 14,
                    lineHeight: 22,
                  }}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="メッセージを送信"
                  disabled={!draft.trim()}
                  onPress={() => send(id, draft)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: draft.trim() ? C.accent : C.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Send size={20} color={draft.trim() ? "white" : "#B3B3B3"} />
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
              style={{ backgroundColor: C.bg }}
            >
              {section === "ノート" ? (
                <>
                  <View style={{ marginBottom: 18 }}>
                    <Button
                      secondary
                      onPress={() =>
                        router.push({
                          pathname: "/create",
                          params: { communityId: id },
                        })
                      }
                    >
                      ＋ ノートを投稿
                    </Button>
                  </View>
                  {posts.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                  {!posts.length && (
                    <Empty
                      title="ノートはまだありません"
                      body="予定や残しておきたい情報を投稿できます。"
                    />
                  )}
                </>
              ) : (
                <>
                  <Text style={[styles.muted, { marginBottom: 14 }]}>
                    メンバー {members.length}人を表示
                  </Text>
                  {members.map((p) => (
                    <Pressable
                      key={p.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${p.name}のプロフィール`}
                      onPress={() => router.push(`/profile/${p.id}`)}
                      style={[
                        styles.card,
                        {
                          padding: 14,
                          marginBottom: 9,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                        },
                      ]}
                    >
                      <Avatar uri={p.avatar} />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: C.ink,
                          }}
                        >
                          {p.name}
                        </Text>
                        <Text style={styles.muted}>
                          高{p.grade}・{p.classroom}組
                        </Text>
                      </View>
                      <Text style={{ color: C.purple }}>›</Text>
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          )}
        </>
      )}
      <Modal
        visible={info}
        transparent
        animationType="fade"
        onRequestClose={closeInfo}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#1B1B1B66",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={[styles.card, { padding: 22, width: "100%", maxWidth: 420 }]}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "700", color: C.ink }}>
                ルーム情報
              </Text>
              <IconButton label="ルーム情報を閉じる" onPress={closeInfo}>
                <X size={21} color={C.muted} />
              </IconButton>
            </View>
            <Text style={{ fontSize: 36, marginVertical: 12 }}>
              {community.emoji}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: C.ink }}>
              {community.name}
            </Text>
            <Text style={[styles.muted, { marginTop: 8 }]}>
              {count}人 · {community.category}
            </Text>
            <Text
              style={[
                styles.text,
                { fontSize: 13, marginTop: 18, marginBottom: 22 },
              ]}
            >
              {community.description}
            </Text>
            {joined &&
              (leaving ? (
                <View style={{ gap: 12 }}>
                  <Text style={styles.text}>このルームから退出しますか？</Text>
                  <Button
                    onPress={() => {
                      toggleJoin(id);
                      closeInfo();
                    }}
                  >
                    退出する
                  </Button>
                  <Button secondary onPress={() => setLeaving(false)}>
                    キャンセル
                  </Button>
                </View>
              ) : (
                <Button secondary onPress={() => setLeaving(true)}>
                  ルームを退出
                </Button>
              ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
