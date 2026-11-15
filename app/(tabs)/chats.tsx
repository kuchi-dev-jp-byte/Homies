import Svg, { Path } from "react-native-svg";
import { isMutualInterest } from "../../src/lib/matching";
import { activeUntil } from "../../src/lib/activity";
import { useNow } from "../../src/lib/useNow";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Search, Plus, Images } from "lucide-react-native";
import {
  Avatar,
  Button,
  C,
  Empty,
  Screen,
  styles,
} from "../../src/components/ui";
import { profiles } from "../../src/data/mock";
import { chatThreads } from "../../src/data/social";
import { useAppStore } from "../../src/store/useAppStore";
const ownNoteSize = 93;
const friendNoteSize = 103;
const noteAvatarSize = Math.round(friendNoteSize * 0.85 * 0.9) * 0.9;

const noteLabelStyle = {
  fontSize: 11,
  lineHeight: 16,
  color: C.muted,
  marginTop: 5,
};

function NoteBubble({
  text,
  width,
  avatarSize,
  muted,
}: {
  text: string;
  width: number;
  avatarSize: number;
  muted?: boolean;
}) {
  return (
    <View
      style={{
        width,
        height: 49,
        paddingHorizontal: 10,
        paddingVertical: 7,
        justifyContent: "center",
        borderRadius: 24,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: C.line,
        marginBottom: -Math.round(avatarSize * 0.08),
        zIndex: 1,
      }}
    >
      <Text
        numberOfLines={2}
        style={{
          fontSize: 10,
          lineHeight: 14,
          textAlign: "center",
          color: muted ? C.muted : C.ink,
        }}
      >
        {text}
      </Text>
      <View
        pointerEvents="none"
        style={{ position: "absolute", bottom: -8, left: "24%" }}
      >
        <Svg width={13} height={9} viewBox="0 0 13 9">
          <Path d="M1 0 H12 V2 H1 Z" fill="white" />
          <Path
            d="M1 1.5 A5.5 5.5 0 0 0 12 1.5"
            fill="white"
            stroke={C.line}
            strokeWidth={1}
          />
        </Svg>
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -16,
          left: width * 0.36 - 8,
          width: 6.5,
          height: 6.5,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: C.line,
          backgroundColor: "white",
        }}
      />
    </View>
  );
}

export default function Chats() {
  const [query, setQuery] = useState(""),
    [edit, setEdit] = useState(false),
    [note, setNote] = useState("");
  const friends = useAppStore((s) => s.friends);
  const actions = useAppStore((s) => s.actions);
  const incoming = useAppStore((s) => s.incomingInterests);
  const now = useNow(),
    ownNoteAt = useAppStore((s) => s.ownNoteAt);
  const me = useAppStore((s) => s.me),
    ownNote = useAppStore((s) => s.ownNote),
    save = useAppStore((s) => s.setOwnNote),
    messages = useAppStore((s) => s.directMessages),
    blocked = useAppStore((s) => s.blocked);
  const instants = useAppStore((s) => s.instants);
  const seen = useAppStore((s) => s.viewedInstants);
  const directThreads = chatThreads(
    friends.filter(
      (id) =>
        messages[id] !== undefined ||
        !isMutualInterest(id, actions, incoming, blocked),
    ),
  );
  const hasOwnNote = Boolean(
    ownNoteAt && activeUntil(ownNoteAt, now) && ownNote,
  );
  const search = query.trim().normalize("NFKC").toLowerCase();
  const visibleThreads = directThreads.flatMap((thread) => {
    const profile = profiles.find((p) => p.id === thread.id);
    return profile && !blocked.includes(thread.id) ? [{ thread, profile }] : [];
  });
  const threads = visibleThreads.filter(({ profile }) =>
    profile.name.normalize("NFKC").toLowerCase().includes(search),
  );
  const unseen = instants.filter(
    (item) =>
      friends.includes(item.authorId) &&
      !blocked.includes(item.authorId) &&
      !seen.includes(item.id) &&
      activeUntil(item.createdAt, now),
  ).length;
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <View
          style={{
            marginHorizontal: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#EEEEEE",
            borderRadius: 14,
            paddingHorizontal: 13,
            marginBottom: 20,
          }}
        >
          <Search size={17} color={C.muted} />
          <TextInput
            accessibilityLabel="チャットを検索"
            placeholder="友達の名前で検索"
            placeholderTextColor={C.placeholder}
            value={query}
            onChangeText={setQuery}
            style={{ minHeight: 44, flex: 1, color: C.ink, fontSize: 14 }}
          />
        </View>
        {!search && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 10,
              paddingTop: 2,
              paddingBottom: 9,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="自分のノートを編集"
              onPress={() => {
                setNote(hasOwnNote ? ownNote : "");
                setEdit(true);
              }}
              style={{
                width: ownNoteSize,
                alignItems: "center",
                alignSelf: "flex-start",
              }}
            >
              <NoteBubble
                text={hasOwnNote ? ownNote : "今の気分をシェア"}
                width={ownNoteSize}
                avatarSize={noteAvatarSize}
                muted={!hasOwnNote}
              />
              <Avatar uri={me.avatar} size={noteAvatarSize} />
              <View
                style={{
                  position: "absolute",
                  right: (ownNoteSize - noteAvatarSize) / 2 - 4,
                  bottom: 26,
                  borderRadius: 13,
                  backgroundColor: C.purple,
                  padding: 3,
                }}
              >
                <Plus size={14} color="white" />
              </View>
              <Text numberOfLines={1} style={noteLabelStyle}>
                あなたのノート
              </Text>
            </Pressable>
            {visibleThreads
              .filter(({ thread }) => Boolean(thread.note))
              .map(({ thread: t, profile: p }) => {
                return (
                  <Pressable
                    key={t.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.name}のノート：${t.note}。ノートを開く`}
                    onPress={() => router.push(`/note/${p.id}`)}
                    style={{
                      width: friendNoteSize,
                      alignItems: "center",
                      alignSelf: "flex-start",
                    }}
                  >
                    <NoteBubble
                      text={t.note ?? ""}
                      width={friendNoteSize}
                      avatarSize={noteAvatarSize}
                    />
                    <Avatar
                      uri={p.avatar}
                      size={noteAvatarSize}
                      online={p.online}
                    />
                    <Text numberOfLines={1} style={noteLabelStyle}>
                      {p.name}
                    </Text>
                  </Pressable>
                );
              })}
          </ScrollView>
        )}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: C.ink,
              marginVertical: 8,
            }}
          >
            メッセージ
          </Text>
          {threads.map(({ thread: t, profile: p }) => {
            const last = messages[t.id]?.at(-1);
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={`${p.name}とのチャット`}
                onPress={() => router.push(`/chat/${t.id}`)}
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                  minHeight: 82,
                  marginBottom: 6,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: C.line,
                }}
              >
                <Avatar uri={p.avatar} size={52.2} online={p.online} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: "700", color: C.ink }}
                  >
                    {p.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.muted, { marginTop: 2 }]}
                  >
                    {last ? `あなた: ${last.body}` : t.preview}
                  </Text>
                </View>
                {(last?.time || t.time) && (
                  <Text style={{ fontSize: 11, color: C.muted }}>
                    {last?.time || t.time}
                  </Text>
                )}
              </Pressable>
            );
          })}
          {!threads.length && (
            <Empty
              icon="users"
              title={
                search ? "チャットが見つかりません" : "まだチャットがありません"
              }
              body={
                search
                  ? "別の名前で検索してください。"
                  : "友達になると、ここからメッセージを送れます。"
              }
              action={search ? undefined : "友達を探す"}
              onPress={() => router.push("/search")}
            />
          )}
        </View>
        <Modal
          visible={edit}
          transparent
          animationType="fade"
          onRequestClose={() => setEdit(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#24242466",
              justifyContent: "center",
              padding: 25,
            }}
          >
            <View
              style={[
                styles.card,
                {
                  padding: 22,
                  gap: 16,
                  width: "100%",
                  maxWidth: 420,
                  alignSelf: "center",
                },
              ]}
            >
              <Text style={styles.title}>ノート</Text>
              <Text style={styles.muted}>
                友達のチャット画面に24時間表示されます。
              </Text>
              <TextInput
                accessibilityLabel="ノートを書く"
                value={note}
                onChangeText={setNote}
                maxLength={60}
                multiline
                placeholder="今なにしてる？"
                style={{
                  minHeight: 90,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: C.bg,
                  color: C.ink,
                }}
              />
              <Text style={[styles.muted, { textAlign: "right" }]}>
                {note.length} / 60
              </Text>
              <Button
                disabled={!note.trim()}
                onPress={() => {
                  save(note);
                  setEdit(false);
                }}
              >
                シェア
              </Button>
              {hasOwnNote && (
                <Button
                  secondary
                  onPress={() => {
                    save("");
                    setEdit(false);
                  }}
                >
                  ノートを削除
                </Button>
              )}
              <Button secondary onPress={() => setEdit(false)}>
                キャンセル
              </Button>
            </View>
          </View>
        </Modal>
        <View style={{ height: 52 }} />
      </Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          unseen ? `インスタント、未閲覧 ${unseen}件` : "インスタント"
        }
        onPress={() => router.push("/instants")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: 19,
          backgroundColor: C.ink,
          borderWidth: 2,
          borderColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Images size={25} color="white" />
        {unseen > 0 && (
          <View
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 21,
              height: 21,
              paddingHorizontal: 4,
              borderRadius: 11,
              backgroundColor: C.purple,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 11, fontWeight: "800" }}>
              {unseen}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
