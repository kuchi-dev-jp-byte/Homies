import { Mascot } from "../../src/components/Mascot";
import { StickerPicker } from "../../src/components/StickerPicker";
import type { DirectMessage } from "../../src/data/types";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronRight, Send, Smile } from "lucide-react-native";
import { profiles } from "../../src/data/mock";
import { chatThreads } from "../../src/data/social";
import {
  Avatar,
  C,
  DetailScreen,
  Empty,
  IconButton,
} from "../../src/components/ui";
import { useAppStore } from "../../src/store/useAppStore";
export default function DirectChat() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    [body, setBody] = useState(""),
    scroll = useRef<ScrollView>(null);
  const [showStickers, setShowStickers] = useState(false);
  const friends = useAppStore((s) => s.friends);
  const directThreads = chatThreads(friends);
  const all = useAppStore((s) => s.directMessages),
    send = useAppStore((s) => s.sendDirect),
    blocked = useAppStore((s) => s.blocked);
  const p = profiles.find((p) => p.id === id),
    thread = directThreads.find((t) => t.id === id);
  if (!p || !thread || blocked.includes(id))
    return (
      <DetailScreen title="チャット">
        <Empty
          title="トークを表示できません"
          body="チャット一覧から選択してください。"
        />
      </DetailScreen>
    );
  const messages: DirectMessage[] = [
    ...(thread.time
      ? [{ authorId: p.id, time: thread.time, body: thread.preview }]
      : []),
    ...(all[id] ?? []),
  ];
  const minute = (message: DirectMessage) =>
    message.createdAt
      ? Math.floor(Date.parse(message.createdAt) / 60000)
      : message.time;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 5,
          gap: 5,
          borderBottomWidth: 1,
          borderBottomColor: C.line,
        }}
      >
        <IconButton
          label="チャット一覧に戻る"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/chats")
          }
        >
          <ArrowLeft color={C.ink} />
        </IconButton>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${p.name}のプロフィールを開く`}
          onPress={() => router.push(`/profile/${p.id}`)}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            minHeight: 44,
            gap: 9,
            paddingRight: 10,
          }}
        >
          <Avatar uri={p.avatar} size={34} />
          <Text
            style={{ fontSize: 16, fontWeight: "700", color: C.ink, flex: 1 }}
          >
            {p.name}
          </Text>
          <ChevronRight size={17} color={C.muted} />
        </Pressable>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          ref={scroll}
          onContentSizeChange={() =>
            scroll.current?.scrollToEnd({ animated: false })
          }
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, backgroundColor: C.bg }}
        >
          {!messages.length && (
            <Empty
              mascot="heart"
              title="メッセージを送ろう"
              body={thread.preview}
            />
          )}
          {messages.map((message, index) => {
            const incoming = message.authorId === p.id;
            const previous = messages[index - 1];
            const sameMinute =
              previous &&
              previous.authorId === message.authorId &&
              minute(previous) === minute(message);
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: incoming ? "flex-start" : "flex-end",
                  gap: 8,
                  marginTop: index ? (sameMinute ? 3 : 10) : 0,
                }}
              >
                {incoming && (
                  <View style={{ width: 32 }}>
                    {!sameMinute && <Avatar uri={p.avatar} size={32} />}
                  </View>
                )}
                <View
                  style={{
                    maxWidth: "80%",
                    alignItems: incoming ? "flex-start" : "flex-end",
                  }}
                >
                  {message.stickerId ? (
                    <Mascot id={message.stickerId} size={125} asMessage />
                  ) : (
                    <View
                      style={{
                        backgroundColor: incoming ? C.surface : C.accent,
                        paddingHorizontal: 13,
                        paddingVertical: 9,
                        borderRadius: 18,
                        borderBottomLeftRadius: incoming ? 6 : 18,
                        borderBottomRightRadius: incoming ? 18 : 6,
                      }}
                    >
                      <Text
                        style={{
                          color: incoming ? C.ink : "white",
                          fontSize: 14,
                          lineHeight: 21,
                        }}
                      >
                        {message.body}
                      </Text>
                    </View>
                  )}
                  {!sameMinute && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        marginTop: 4,
                        marginHorizontal: 4,
                      }}
                    >
                      {message.time}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
        {showStickers && (
          <View style={{ paddingHorizontal: 14, paddingVertical: 6 }}>
            <StickerPicker
              onSend={(stickerId) => {
                send(id, "", stickerId);
                setShowStickers(false);
              }}
            />
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 9,
            borderTopWidth: 1,
            borderTopColor: C.line,
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
            value={body}
            onChangeText={setBody}
            multiline
            maxLength={1000}
            style={{
              flex: 1,
              borderRadius: 24,
              paddingHorizontal: 14,
              paddingVertical: 11,
              minHeight: 44,
              backgroundColor: C.surface,
              maxHeight: 110,
              color: C.ink,
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="メッセージを送信"
            disabled={!body.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: body.trim() ? C.accent : C.bg,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              if (body.trim()) {
                send(id, body);
                setBody("");
              }
            }}
          >
            <Send size={19} color={body.trim() ? "white" : C.muted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
