import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ChevronRight, Heart, UserPlus, Users } from "lucide-react-native";
import {
  Avatar,
  Button,
  C,
  DetailScreen,
  SectionTitle,
  styles,
} from "../src/components/ui";
import { profiles } from "../src/data/mock";
import { useAppStore } from "../src/store/useAppStore";

const eventTypes = {
  reaction: { label: "があなたの投稿にいいねしました", icon: Heart },
  match: { label: "とマッチしました", icon: Heart },
  accepted: { label: "と友達になりました", icon: Users },
  request: { label: "から友達申請が届きました", icon: UserPlus },
};

export default function Activity() {
  const events = useAppStore((s) => s.socialEvents);
  const pending = useAppStore((s) => s.receivedRequests);
  const blocked = useAppStore((s) => s.blocked);
  const accept = useAppStore((s) => s.acceptFriendRequest);
  const decline = useAppStore((s) => s.declineFriendRequest);
  const read = useAppStore((s) => s.readSocial);

  useEffect(() => {
    if (events.some((event) => !event.read)) read();
  }, [events, read]);

  const requests = profiles.filter(
    (profile) => pending.includes(profile.id) && !blocked.includes(profile.id),
  );
  const history = events.filter(
    (event) =>
      !blocked.includes(event.actorId) &&
      !(event.type === "request" && pending.includes(event.actorId)),
  );

  return (
    <DetailScreen title="アクティビティ">
      {requests.length > 0 && (
        <>
          <SectionTitle>友達申請 {requests.length}</SectionTitle>
          <View style={[styles.card, layout.group]}>
            {requests.map((profile, index) => (
              <View
                key={profile.id}
                style={[layout.request, index > 0 && layout.divider]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${profile.name}のプロフィール`}
                  onPress={() => router.push(`/profile/${profile.id}`)}
                  style={layout.requestProfile}
                >
                  <Avatar uri={profile.avatar} size={42} />
                  <View style={layout.copy}>
                    <Text style={layout.name}>{profile.name}</Text>
                    <Text style={styles.muted}>
                      高{profile.grade}・{profile.classroom}組
                    </Text>
                  </View>
                  <ChevronRight size={16} color={C.muted} />
                </Pressable>
                <View style={layout.actions}>
                  <Button small onPress={() => accept(profile.id)}>
                    承認
                  </Button>
                  <Button small secondary onPress={() => decline(profile.id)}>
                    辞退
                  </Button>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      <SectionTitle>履歴</SectionTitle>
      {history.length > 0 ? (
        <View style={[styles.card, layout.group]}>
          {history.map((event, index) => {
            const profile = profiles.find((p) => p.id === event.actorId);
            const { label, icon: Icon } = eventTypes[event.type];
            return (
              <Pressable
                key={event.id}
                accessibilityRole="button"
                onPress={() =>
                  event.postId
                    ? router.push(`/post/${event.postId}`)
                    : router.push(`/profile/${event.actorId}`)
                }
                style={({ pressed }) => [
                  layout.row,
                  index > 0 && layout.divider,
                  pressed && layout.pressed,
                ]}
              >
                <View style={layout.avatar}>
                  {profile && <Avatar uri={profile.avatar} size={39} />}
                  <View style={layout.badge}>
                    <Icon size={10} color={C.purple} />
                  </View>
                </View>
                <View style={layout.copy}>
                  <Text style={styles.text}>
                    <Text style={layout.name}>
                      {profile?.name ?? "ユーザー"}
                    </Text>
                    {label}
                  </Text>
                  <Text style={styles.muted}>
                    {new Date(event.createdAt).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <ChevronRight size={16} color={C.muted} />
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={[styles.card, layout.empty]}>
          <Heart size={25} color={C.purple} />
          <Text style={layout.name}>アクティビティはまだありません</Text>
          <Text style={styles.muted}>
            いいねやマッチの通知がここに届きます。
          </Text>
        </View>
      )}
    </DetailScreen>
  );
}

const layout = StyleSheet.create({
  group: { overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    minHeight: 64,
  },
  request: { padding: 13, gap: 10 },
  requestProfile: { flexDirection: "row", alignItems: "center", gap: 12 },
  actions: { flexDirection: "row", gap: 8, marginLeft: 54 },
  divider: { borderTopWidth: 1, borderColor: C.line },
  pressed: { backgroundColor: "#F3F3F3" },
  copy: { flex: 1 },
  name: { color: C.ink, fontWeight: "800" },
  avatar: { width: 39, height: 39 },
  badge: {
    position: "absolute",
    right: -3,
    bottom: -2,
    borderRadius: 9,
    backgroundColor: "#EEEEEE",
    padding: 3,
    borderWidth: 1,
    borderColor: "white",
  },
  empty: { alignItems: "center", gap: 8, padding: 24 },
});
