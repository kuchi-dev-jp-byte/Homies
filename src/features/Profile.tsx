import Animated, {
  FadeInDown,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated";
import { FriendButton } from "../components/FriendButton";
import { Image } from "expo-image";
import { imageSource } from "../data/images";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Camera,
  ChevronRight,
  GraduationCap,
  MoreHorizontal,
  Settings,
} from "lucide-react-native";
import { profiles, communities, schoolName } from "../data/mock";
import { Profile as ProfileType } from "../data/types";
import { useAppStore } from "../store/useAppStore";
import { useCurrentProfile, useVisiblePosts } from "../lib/hooks";
import {
  Avatar,
  Button,
  C,
  Chip,
  IconButton,
  Screen,
  SectionTitle,
  Tags,
  styles,
  Empty,
} from "../components/ui";
import { PostCard } from "../components/PostCard";
import { ProfileCard } from "./Matching";

export function ProfileContent({
  profile,
  own = false,
}: {
  profile: ProfileType;
  own?: boolean;
}) {
  const [interestsExpanded, setInterestsExpanded] = useState(false);
  const [profileTab, setProfileTab] = useState("投稿");
  const joined = useAppStore((s) => s.joined);
  const visible = useVisiblePosts();
  const saved = useAppStore((s) => (profile.role ? s.staffSaved : s.saved));
  const actions = useAppStore((s) => s.actions);
  const blocked = useAppStore((s) => s.blocked);
  const [savedTab, setSavedTab] = useState("投稿");
  const posts = visible.filter(
    (p) => p.authorId === profile.id && (own || !p.anonymous),
  );
  const savedPosts = own ? visible.filter((p) => saved.includes(p.id)) : [];
  const people =
    own && !profile.role
      ? profiles.filter(
          (p) =>
            !p.role &&
            actions[p.id] === "interested" &&
            !blocked.includes(p.id),
        )
      : [];
  const media = posts.filter(
    (p) => typeof p.image === "string" && p.image.length > 0,
  );
  const groups =
    own && !profile.role
      ? communities.filter((c) => joined.includes(c.id))
      : [];
  return (
    <>
      <View
        style={{
          backgroundColor: "white",
          marginHorizontal: -20,
          paddingBottom: 18,
        }}
      >
        <View style={{ aspectRatio: 3, backgroundColor: "#DADADA" }}>
          {profile.banner && (
            <Image
              source={imageSource(profile.banner)}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: -35,
              marginBottom: 14,
            }}
          >
            <View
              style={{ borderWidth: 4, borderColor: "white", borderRadius: 60 }}
            >
              <Avatar uri={profile.avatar} size={86} />
            </View>
            <View
              style={{
                paddingBottom: 3,
                flexDirection: "row",
                gap: 6,
                alignItems: "center",
              }}
            >
              {own ? (
                !profile.role && (
                  <Button
                    small
                    secondary
                    onPress={() => router.push("/edit-profile")}
                  >
                    プロフィールを編集
                  </Button>
                )
              ) : (
                <>
                  {!profile.role && <FriendButton id={profile.id} />}
                  <IconButton
                    label="通報・非表示"
                    onPress={() =>
                      router.push({
                        pathname: "/safety",
                        params: { userId: profile.id },
                      })
                    }
                  >
                    <MoreHorizontal size={20} color={C.ink} />
                  </IconButton>
                </>
              )}
            </View>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: C.ink }}>
            {profile.name}
          </Text>
          <Text style={styles.muted}>@{profile.id}</Text>
          {!!profile.bio && (
            <Text style={[styles.text, { marginTop: 10 }]}>{profile.bio}</Text>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 12,
            }}
          >
            <GraduationCap size={16} color={C.muted} />
            <Text style={styles.muted}>
              {schoolName} ·{" "}
              {profile.role
                ? "教職員"
                : `高${profile.grade}・${profile.classroom}組`}
              {profile.club ? ` · ${profile.club}` : ""}
            </Text>
          </View>
          {profile.interests.length > 0 && (
            <Animated.View
              layout={LinearTransition.duration(180).reduceMotion(
                ReduceMotion.System,
              )}
            >
              {interestsExpanded && (
                <Animated.View
                  entering={FadeInDown.duration(180).reduceMotion(
                    ReduceMotion.System,
                  )}
                  style={{ marginTop: 12 }}
                >
                  <Tags items={profile.interests} />
                </Animated.View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: interestsExpanded }}
                onPress={() => setInterestsExpanded((expanded) => !expanded)}
                style={{
                  alignSelf: "flex-start",
                  minHeight: 44,
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#757575", fontSize: 13 }}>
                  {interestsExpanded ? "閉じる" : "もっと見る"}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
        style={{
          marginHorizontal: -20,
          marginBottom: 14,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderColor: C.line,
        }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
      >
        {(own
          ? ["投稿", "メディア", "紹介", "保存"]
          : ["投稿", "メディア", "紹介"]
        ).map((t) => (
          <Pressable
            key={t}
            accessibilityRole="tab"
            accessibilityState={{ selected: profileTab === t }}
            onPress={() => setProfileTab(t)}
            style={{
              minWidth: 90,
              paddingHorizontal: 20,
              paddingVertical: 14,
              alignItems: "center",
              borderBottomWidth: 3,
              borderColor: profileTab === t ? C.purple : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 15,
                color: profileTab === t ? C.ink : C.muted,
                fontWeight: "700",
              }}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {profileTab === "保存" && own ? (
        <>
          {!profile.role && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
              {["投稿", "人"].map((tab) => (
                <Chip
                  key={tab}
                  label={tab}
                  active={savedTab === tab}
                  onPress={() => setSavedTab(tab)}
                />
              ))}
            </View>
          )}
          {savedTab === "人" && !profile.role ? (
            people.length ? (
              people.map((p) => <ProfileCard key={p.id} profile={p} />)
            ) : (
              <Empty
                icon="users"
                title="保存した人はまだいません"
                body="マッチングで「気になる」を送った相手がここに表示されます。"
                action="マッチングを見る"
                onPress={() => router.navigate("/matching")}
              />
            )
          ) : savedPosts.length ? (
            savedPosts.map((p) => <PostCard key={p.id} post={p} />)
          ) : (
            <Empty
              icon="bookmark"
              title="保存した投稿はまだありません"
              body="投稿のブックマークを押すと保存できます。"
            />
          )}
        </>
      ) : profileTab === "紹介" ? (
        <>
          {!!profile.interests.length && (
            <>
              <SectionTitle>好きなこと</SectionTitle>
              <View style={[styles.card, { padding: 14 }]}>
                <Tags items={profile.interests} />
              </View>
            </>
          )}
          {(profile.skills || profile.wishes) && (
            <View
              style={[styles.card, { padding: 14, marginTop: 10, gap: 12 }]}
            >
              {[
                { label: "得意なこと", value: profile.skills },
                { label: "やりたいこと", value: profile.wishes },
              ].map(({ label, value }) =>
                value ? (
                  <View key={label}>
                    <Text style={styles.muted}>{label}</Text>
                    <Text style={styles.text}>{value}</Text>
                  </View>
                ) : null,
              )}
            </View>
          )}
          {own && groups.length > 0 && (
            <>
              <SectionTitle>自分が参加中のコミュニティ</SectionTitle>
              <View style={[styles.card, { overflow: "hidden" }]}>
                {groups.map((c, index) => (
                  <Pressable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${c.name}を開く`}
                    onPress={() => router.push(`/community/${c.id}`)}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      padding: 13,
                      borderTopWidth: index ? 1 : 0,
                      borderColor: C.line,
                      backgroundColor: pressed ? C.bg : "white",
                    })}
                  >
                    <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                    <Text style={[styles.text, { flex: 1 }]}>{c.name}</Text>
                    <ChevronRight size={16} color={C.muted} />
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {!own &&
            !profile.interests.length &&
            !profile.skills &&
            !profile.wishes && (
              <Text style={styles.muted}>紹介はまだありません。</Text>
            )}
        </>
      ) : profileTab === "メディア" ? (
        media.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {media.map((post) => (
              <Pressable
                key={post.id}
                accessibilityRole="button"
                accessibilityLabel={post.title || "写真付き投稿を開く"}
                onPress={() => router.push(`/post/${post.id}`)}
                style={{
                  width: "31.33%",
                  margin: "1%",
                  aspectRatio: 1,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={imageSource(post.image!)}
                  contentFit="cover"
                  style={{ flex: 1 }}
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 25, gap: 8 }}>
            <Camera size={22} color={C.muted} />
            <Text style={styles.muted}>写真付きの投稿はまだありません。</Text>
          </View>
        )
      ) : posts.length ? (
        posts.map((p) => <PostCard key={p.id} post={p} />)
      ) : (
        <Text
          style={[styles.muted, { textAlign: "center", paddingVertical: 25 }]}
        >
          まだ投稿はありません。
        </Text>
      )}
    </>
  );
}
export default function MyPage() {
  const me = useCurrentProfile();
  return (
    <Screen
      title="マイページ"
      right={
        <IconButton label="設定" onPress={() => router.push("/settings")}>
          <Settings size={21} color={C.muted} />
        </IconButton>
      }
    >
      <View style={{ paddingHorizontal: 20 }}>
        <ProfileContent key={me.id} profile={me} own />
      </View>
    </Screen>
  );
}
