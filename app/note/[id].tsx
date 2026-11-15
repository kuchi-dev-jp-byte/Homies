import { Heart } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Avatar,
  Button,
  C,
  DetailScreen,
  Empty,
  styles,
} from "../../src/components/ui";
import { profiles } from "../../src/data/mock";
import { chatThreads } from "../../src/data/social";
import { useAppStore } from "../../src/store/useAppStore";

export default function NoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reply, setReply] = useState("");
  const friends = useAppStore((s) => s.friends);
  const blocked = useAppStore((s) => s.blocked);
  const send = useAppStore((s) => s.sendDirect);
  const toggleLike = useAppStore((s) => s.toggleNoteLike);
  const likedNote = useAppStore((s) => s.noteLikes[`${s.role}:${id}`]);
  const person = profiles.find((profile) => profile.id === id);
  const note = chatThreads(friends).find((thread) => thread.id === id)?.note;

  if (!person || !note || blocked.includes(person.id)) {
    return (
      <DetailScreen title="ノート">
        <Empty
          title="ノートを表示できません"
          body="チャットのノート一覧をご確認ください。"
        />
      </DetailScreen>
    );
  }

  const liked = likedNote === note;
  return (
    <DetailScreen title="ノート">
      <View style={{ alignItems: "center", paddingVertical: 28, gap: 12 }}>
        <Avatar uri={person.avatar} size={86} online={person.online} />
        <Text style={[styles.title, { fontSize: 18 }]}>{person.name}</Text>
        <View style={[styles.card, { padding: 16, maxWidth: "100%" }]}>
          <Text style={[styles.text, { fontSize: 17, textAlign: "center" }]}>
            {note}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TextInput
          accessibilityLabel="ノートへの返信"
          placeholder="ノートに返信…"
          placeholderTextColor={C.placeholder}
          value={reply}
          onChangeText={setReply}
          maxLength={1000}
          multiline
          style={{
            flex: 1,
            minHeight: 44,
            maxHeight: 110,
            backgroundColor: "#F3F3F3",
            borderRadius: 16,
            padding: 10,
            color: C.ink,
          }}
        />
        <Button
          small
          disabled={!reply.trim()}
          onPress={() => {
            if (!reply.trim()) return;
            send(person.id, reply);
            router.replace(`/chat/${person.id}`);
          }}
        >
          返信
        </Button>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            liked ? "ノートのいいねを取り消す" : "ノートにいいね"
          }
          accessibilityState={{ selected: liked }}
          onPress={() => toggleLike(person.id, note)}
          style={{
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heart
            size={24}
            color={liked ? C.pink : C.ink}
            fill={liked ? C.pink : "none"}
          />
        </Pressable>
      </View>
    </DetailScreen>
  );
}
