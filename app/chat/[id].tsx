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
import { ArrowLeft, ChevronRight, Send } from "lucide-react-native";
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
          {thread.time ? (
            <View style={{ alignItems: "flex-start" }}>
              <View
                style={{
                  paddingHorizontal: 13,
                  paddingVertical: 9,
                  borderRadius: 18,
                  borderBottomLeftRadius: 6,
                  backgroundColor: "white",
                  maxWidth: "82%",
                }}
              >
                <Text style={{ fontSize: 14, color: C.ink, lineHeight: 21 }}>
                  {thread.preview}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: C.muted,
                  marginTop: 4,
                  marginLeft: 4,
                }}
              >
                {thread.time}
              </Text>
            </View>
          ) : !all[id]?.length ? (
            <Empty title="メッセージを送ろう" body={thread.preview} />
          ) : null}
          {(all[id] ?? []).map((m, i) => (
            <View key={i} style={{ alignItems: "flex-end", marginTop: 10 }}>
              <View
                style={{
                  maxWidth: "80%",
                  backgroundColor: C.purple,
                  paddingHorizontal: 13,
                  paddingVertical: 9,
                  borderRadius: 18,
                  borderBottomRightRadius: 6,
                }}
              >
                <Text style={{ color: "white", fontSize: 14, lineHeight: 22 }}>
                  {m.body}
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 5 }}>
                {m.time}
              </Text>
            </View>
          ))}
        </ScrollView>
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
              backgroundColor: C.bg,
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
              backgroundColor: body.trim() ? C.purple : C.bg,
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
