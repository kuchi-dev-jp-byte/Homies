import { Mascot } from "../../src/components/Mascot";
import { StickerPicker } from "../../src/components/StickerPicker";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  Ellipsis,
  MessageCircle,
  Plus,
  Send,
  Smile,
} from "lucide-react-native";
import { messageTime } from "../../src/lib/chat";
import { router, useLocalSearchParams } from "expo-router";
import {
  Avatar,
  Button,
  C,
  DetailScreen,
  Empty,
  IconButton,
  styles,
} from "../../src/components/ui";
import { profiles } from "../../src/data/mock";
import { quickTopics } from "../../src/lib/groups";
import { useAppStore } from "../../src/store/useAppStore";

export default function GroupRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useAppStore((s) => s.me);
  const role = useAppStore((s) => s.role);
  const group = useAppStore((s) => s.groups.find((item) => item.id === id));
  const blocked = useAppStore((s) => s.blocked);
  const send = useAppStore((s) => s.sendGroupMessage);
  const react = useAppStore((s) => s.reactToGroupMessage);
  const extend = useAppStore((s) => s.extendGroup);
  const leave = useAppStore((s) => s.leaveGroup);
  const vote = useAppStore((s) => s.voteForGroup);
  const [draft, setDraft] = useState("");
  const [now, setNow] = useState(Date.now);
  const [showMembers, setShowMembers] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);

  useEffect(() => {
    if (!group?.trial) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [group?.trial]);

  if (!group || group.ownerId !== me.id || role !== "student") {
    return (
      <DetailScreen title="グループチャット">
        <Empty
          title="ルームを開けません"
          body="チャット一覧からグループを選んでください。"
        />
      </DetailScreen>
    );
  }

  const trial = group.trial;
  const seconds = trial
    ? Math.max(0, Math.ceil((trial.endsAt - now) / 1000))
    : 0;
  const elapsed = Boolean(trial && seconds === 0);
  const members = profiles.filter(
    (person) =>
      person.id !== me.id &&
      group.members.includes(person.id) &&
      !blocked.includes(person.id),
  );
  const canSave = !group.members.some((member) => blocked.includes(member));
  const countdown = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const submit = () => {
    if (!draft.trim()) return;
    send(group.id, draft);
    setDraft("");
  };
  const toggleRoomMenu = () => {
    setShowMembers(!showMembers);
    setConfirmExit(false);
  };

  return (
    <DetailScreen
      title={
        trial ? `${trial.topic}ルーム` : `${group.icon ?? "👥"} ${group.name}`
      }
      centered
      subtitle={[
        `${members.length + 1}人`,
        trial ? (elapsed ? "終了" : `残り ${countdown}`) : "",
      ]
        .filter(Boolean)
        .join(" · ")}
      headerAction={
        <IconButton
          label={showMembers ? "ルームメニューを閉じる" : "ルームメニュー"}
          onPress={toggleRoomMenu}
        >
          <Ellipsis size={22} color={C.ink} />
        </IconButton>
      }
      footer={
        !elapsed && (
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: C.line,
              backgroundColor: C.bg,
              gap: 8,
            }}
          >
            {showStickers && (
              <StickerPicker
                onSend={(stickerId) => {
                  send(group.id, "", stickerId);
                  setShowStickers(false);
                }}
              />
            )}
            <View
              style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showStickers ? "スタンプを閉じる" : "スタンプを開く"
                }
                accessibilityState={{ expanded: showStickers }}
                onPress={() => setShowStickers(!showStickers)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 25,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: showStickers ? C.lime : C.surface,
                }}
              >
                <Plus size={22} color={C.ink} />
              </Pressable>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  backgroundColor: C.surface,
                  borderRadius: 24,
                }}
              >
                <TextInput
                  accessibilityLabel="メッセージ"
                  placeholder="メッセージを入力…"
                  placeholderTextColor={C.placeholder}
                  value={draft}
                  onChangeText={setDraft}
                  maxLength={1000}
                  multiline
                  style={{
                    flex: 1,
                    minHeight: 46,
                    maxHeight: 110,
                    paddingLeft: 15,
                    paddingVertical: 12,
                    color: C.ink,
                  }}
                />
                <IconButton
                  label={draft.trim() ? "送信" : "スタンプ"}
                  onPress={
                    draft.trim() ? submit : () => setShowStickers(!showStickers)
                  }
                >
                  {draft.trim() ? (
                    <Send size={19} color={C.accent} />
                  ) : (
                    <Smile size={21} color={C.ink} />
                  )}
                </IconButton>
              </View>
            </View>
          </View>
        )
      }
    >
      <View style={{ gap: 16, paddingBottom: 16 }}>
        {!trial && (
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <Button small secondary onPress={() => setShowMembers(false)}>
              トーク
            </Button>
            <Button small secondary onPress={() => setShowMembers(true)}>
              メンバー
            </Button>
            <Button
              small
              secondary
              onPress={() =>
                router.push({
                  pathname: "/room-editor",
                  params: { kind: "group", id },
                })
              }
            >
              編集
            </Button>
          </View>
        )}
        {showMembers && (
          <View style={[styles.card, { padding: 12, gap: 9 }]}>
            {members.map((person) => (
              <View
                key={person.id}
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Avatar uri={person.avatar} size={28} />
                <Text style={[styles.text, { flex: 1 }]}>{person.name}</Text>
                <Button
                  small
                  secondary
                  onPress={() =>
                    router.push({
                      pathname: "/safety",
                      params: { userId: person.id },
                    })
                  }
                >
                  通報・ブロック
                </Button>
              </View>
            ))}
            {trial && !elapsed && !trial.extended && (
              <Button small secondary onPress={() => extend(group.id)}>
                15分延長
              </Button>
            )}
            {confirmExit ? (
              <>
                <Text style={styles.text}>このグループから退出しますか？</Text>
                <Button
                  small
                  onPress={() => {
                    leave(group.id);
                    router.replace("/chats");
                  }}
                >
                  退出する
                </Button>
              </>
            ) : (
              <Button small secondary onPress={() => setConfirmExit(true)}>
                退出
              </Button>
            )}
          </View>
        )}
        {trial && (
          <View
            style={{
              borderRadius: 20,
              backgroundColor: C.limeSoft,
              padding: 16,
              gap: 9,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
            >
              <MessageCircle size={20} color={C.ink} />
              <Text
                style={{
                  color: "white",
                  backgroundColor: C.accent,
                  borderRadius: 12,
                  overflow: "hidden",
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  fontSize: 12,
                  fontWeight: "800",
                }}
              >
                お題
              </Text>
            </View>
            <Text
              style={{
                color: C.ink,
                fontSize: 17,
                lineHeight: 24,
                fontWeight: "800",
              }}
            >
              {quickTopics[trial.topic].prompt}
            </Text>
            <Text style={{ fontSize: 11, color: "#464B29" }}>
              サンプルの参加者とのチャットです。
            </Text>
            {elapsed && (
              <>
                <Text style={styles.text}>このメンバーとまた話したい？</Text>
                <Button disabled={!canSave} onPress={() => vote(group.id)}>
                  また話したい
                </Button>
                <Button
                  secondary
                  onPress={() => {
                    leave(group.id);
                    router.replace("/chats");
                  }}
                >
                  終了する
                </Button>
              </>
            )}
          </View>
        )}
        {!showMembers &&
          group.messages
            .filter((message) => !blocked.includes(message.authorId))
            .map((message) => {
              const own = message.authorId === me.id;
              const person = members.find(
                (member) => member.id === message.authorId,
              );
              return (
                <View
                  key={message.id}
                  style={{
                    flexDirection: "row",
                    alignSelf: own ? "flex-end" : "flex-start",
                    maxWidth: "94%",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  {!own && <Avatar uri={person?.avatar ?? ""} size={36} />}
                  <View
                    style={{
                      flexShrink: 1,
                      alignItems: own ? "flex-end" : "flex-start",
                      gap: 4,
                    }}
                  >
                    {!own && (
                      <Text
                        style={{
                          color: C.muted,
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        {person?.name ?? "メンバー"}
                      </Text>
                    )}
                    {message.stickerId ? (
                      <Mascot id={message.stickerId} size={125} asMessage />
                    ) : (
                      <View
                        style={{
                          paddingVertical: 9,
                          paddingHorizontal: 13,
                          borderRadius: 19,
                          backgroundColor: own ? C.accent : C.surface,
                        }}
                      >
                        <Text
                          style={{
                            color: own ? "white" : C.ink,
                            fontSize: 14,
                            lineHeight: 21,
                          }}
                        >
                          {message.body}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {message.createdAt && (
                        <Text style={styles.muted}>
                          {messageTime(message.createdAt)}
                        </Text>
                      )}
                      {!own && !elapsed ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            message.reaction
                              ? "リアクションを取り消す"
                              : "メッセージにいいね"
                          }
                          accessibilityState={{
                            selected: Boolean(message.reaction),
                          }}
                          onPress={() => react(group.id, message.id, "❤️")}
                          hitSlop={8}
                        >
                          <Text
                            style={{
                              color: message.reaction ? C.pink : C.muted,
                            }}
                          >
                            {message.reaction ?? "♡"}
                          </Text>
                        </Pressable>
                      ) : (
                        message.reaction && <Text>{message.reaction}</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
      </View>
    </DetailScreen>
  );
}
