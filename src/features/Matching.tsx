import { MascotBanner } from "../components/MascotBanner";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { FriendButton } from "../components/FriendButton";
import { matchedProfiles } from "../lib/matching";
import { imageSource } from "../data/images";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Gamepad2,
  Heart,
  MoreHorizontal,
  SlidersHorizontal,
} from "lucide-react-native";
import { InterestPicker, interestKey } from "../components/InterestPicker";
import { Interest, Profile } from "../data/types";
import { useAppStore } from "../store/useAppStore";
import { compatibility } from "../lib/domain";
import { useProfiles } from "../lib/hooks";
import {
  Avatar,
  Button,
  C,
  Empty,
  IconButton,
  Loading,
  Screen,
  Tags,
  styles,
} from "../components/ui";
export function Score({ score }: { score: number }) {
  return (
    <View
      className="flex-row items-center"
      style={{
        gap: 3,
        paddingVertical: 5,
        paddingHorizontal: 4,
        borderRadius: 20,
        backgroundColor: "#FFF0F2",
      }}
    >
      <Heart size={12} color={C.pink} fill={C.pink} />
      <Text style={{ fontSize: 11, fontWeight: "700", color: C.pink }}>
        共通度 {score}%
      </Text>
    </View>
  );
}
export function ProfileCard({
  profile,
  candidate = false,
}: {
  profile: Profile;
  candidate?: boolean;
}) {
  const me = useAppStore((s) => s.me),
    { score, common } = compatibility(me, profile);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${profile.name}のプロフィール`}
      onPress={() => router.push(`/profile/${profile.id}`)}
      style={[
        styles.card,
        { padding: 13, marginBottom: 9, flexDirection: "row", gap: 12 },
      ]}
    >
      <Avatar uri={profile.avatar} size={54} online={profile.online} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View className="flex-row items-center" style={{ gap: 3 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: C.ink }}>
              {profile.name}
            </Text>
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
              高{profile.grade}・{profile.classroom}組
            </Text>
          </View>
          <Score score={score} />
          <IconButton
            label={`${profile.name}のメニュー`}
            onPress={() =>
              router.push({
                pathname: "/safety",
                params: { userId: profile.id },
              })
            }
            style={{ minWidth: 24, minHeight: 32 }}
          >
            <MoreHorizontal size={16} color={C.muted} />
          </IconButton>
        </View>
        <View
          className="flex-row items-center"
          style={{ gap: 4, marginTop: 3, marginBottom: 8 }}
        >
          <Gamepad2 size={12} color={C.purple} />
          <Text style={{ fontSize: 11, color: C.purple, fontWeight: "600" }}>
            共通点 {common.length}つ
          </Text>
        </View>
        {candidate ? (
          <SharedTags items={common} />
        ) : (
          <Tags items={profile.interests} />
        )}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 11,
            color: "#848484",
            lineHeight: 17,
            marginTop: 7,
          }}
        >
          {profile.bio}
        </Text>
      </View>
    </Pressable>
  );
}
const tagColors = {
  game: ["#57349B", "#F0E8FF"],
  music: ["#A32A58", "#FCE8F0"],
  art: ["#875000", "#FFF1D6"],
  study: ["#086782", "#E1F6FD"],
  club: ["#226541", "#E3F6E9"],
  other: ["#454545", "#EFEFEF"],
} satisfies Record<Profile["interests"][number]["kind"], [string, string]>;

function CandidateRow({ profile }: { profile: Profile }) {
  const match = useAppStore((s) => s.match);
  const decide = (interested: boolean) =>
    match(profile.id, interested ? "interested" : "skipped");
  const offset = useSharedValue(0);
  const slide = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));
  const rightHint = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, offset.value / 45)),
  }));
  const leftHint = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.max(0, -offset.value / 45)),
  }));
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-18, 18])
    .failOffsetY([-14, 14])
    .onUpdate(({ translationX }) => {
      offset.value = translationX;
    })
    .onEnd(({ translationX }) => {
      if (Math.abs(translationX) >= 65) decide(translationX > 0);
    })
    .onFinalize(() => {
      offset.value = withTiming(0, { duration: 150 });
    });

  return (
    <View style={{ overflow: "hidden", borderRadius: 19 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 9,
            left: 0,
            backgroundColor: C.accentSoft,
            justifyContent: "center",
            paddingHorizontal: 12,
          },
          rightHint,
        ]}
      >
        <Text style={{ color: C.tagInk, fontWeight: "800" }}>申請 →</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 9,
            left: 0,
            backgroundColor: "#FFF0F2",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingHorizontal: 12,
          },
          leftHint,
        ]}
      >
        <Text style={{ color: C.pink, fontWeight: "800" }}>← スキップ</Text>
      </Animated.View>
      <GestureDetector gesture={swipe} touchAction="pan-y">
        <Animated.View
          collapsable={false}
          style={slide}
          accessibilityActions={[
            { name: "request", label: "友達申請を送る" },
            { name: "skip", label: "スキップ" },
          ]}
          onAccessibilityAction={({ nativeEvent }) => {
            if (nativeEvent.actionName === "request") decide(true);
            if (nativeEvent.actionName === "skip") decide(false);
          }}
        >
          <ProfileCard profile={profile} candidate />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function SharedTags({ items }: { items: Profile["interests"] }) {
  return (
    <View
      style={{
        gap: 4,
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {items.map(({ label, kind }) => (
        <Text
          key={label}
          numberOfLines={1}
          style={{
            color: tagColors[kind][0],
            backgroundColor: tagColors[kind][1],
            borderRadius: 5,
            paddingHorizontal: 4,
            paddingVertical: 2,
            fontSize: 10,
            fontWeight: "700",
          }}
        >
          {label}
        </Text>
      ))}
    </View>
  );
}
function GridProfile({ profile }: { profile: Profile }) {
  const me = useAppStore((s) => s.me);
  const { score, common } = compatibility(me, profile);

  return (
    <View style={{ width: "33.333%", padding: 4 }}>
      <View
        style={{
          borderWidth: 1,
          borderColor: C.line,
          borderRadius: 12,
          overflow: "hidden",
          flex: 1,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${profile.name}のプロフィール`}
          onPress={() => router.push(`/profile/${profile.id}`)}
        >
          <View
            style={{
              aspectRatio: 0.78,
              overflow: "hidden",
              backgroundColor: C.muted,
            }}
          >
            <Image
              source={imageSource(profile.avatar)}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
            <View style={{ position: "absolute", top: 6, left: 6 }}>
              <Score score={score} />
            </View>
            <LinearGradient
              colors={["transparent", "#000000E0"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: 6,
                paddingTop: 18,
              }}
            >
              <Text
                numberOfLines={1}
                style={{ color: "white", fontWeight: "800" }}
              >
                {profile.name}
              </Text>
              <Text numberOfLines={1} style={{ color: "white", fontSize: 10 }}>
                高{profile.grade}・{profile.classroom}組
              </Text>
            </LinearGradient>
          </View>
        </Pressable>
        <View
          style={{
            padding: 5,
            gap: 6,
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <SharedTags items={common.slice(0, 2)} />
          <FriendButton id={profile.id} />
        </View>
      </View>
    </View>
  );
}
export default function Matching() {
  const role = useAppStore((s) => s.role);
  const unread = useAppStore((s) => s.unreadMatches),
    readMatches = useAppStore((s) => s.readMatches);
  const incoming = useAppStore((s) => s.incomingInterests);
  const [mode, setMode] = useState("候補"),
    [filters, setFilters] = useState(false),
    [grade, setGrade] = useState("すべて"),
    [classroom, setClassroom] = useState(""),
    [club, setClub] = useState(""),
    [interestFilters, setInterestFilters] = useState<Interest[]>([]),
    [pickingInterests, setPickingInterests] = useState(false);
  const { data: people, isLoading } = useProfiles(),
    me = useAppStore((s) => s.me),
    blocked = useAppStore((s) => s.blocked),
    friends = useAppStore((s) => s.friends),
    actions = useAppStore((s) => s.actions);
  const candidates = (people ?? [])
    .filter(
      (p) =>
        !p.role &&
        !blocked.includes(p.id) &&
        !friends.includes(p.id) &&
        !actions[p.id] &&
        (grade === "すべて" || p.grade === Number(grade)) &&
        (!classroom || p.classroom === Number(classroom)) &&
        (!club || p.club.includes(club)) &&
        interestFilters.every((tag) =>
          p.interests.some(
            (item) => interestKey(item.label) === interestKey(tag.label),
          ),
        ),
    )
    .sort((a, b) => compatibility(me, b).score - compatibility(me, a).score);
  const directMessages = useAppStore((s) => s.directMessages);
  const matched = matchedProfiles(
    people ?? [],
    actions,
    incoming,
    blocked,
  ).filter((p) => directMessages[p.id] === undefined);
  const showingMatches = mode === "マッチした相手";
  const newMatches = unread.some((id) => !blocked.includes(id));
  if (role === "teacher") {
    return (
      <Screen>
        <Empty
          title="生徒向けのマッチング"
          body="生徒のアカウントで利用できます。"
        />
      </Screen>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <View
          accessibilityRole="tablist"
          className="flex-row"
          style={{
            marginHorizontal: 22,
            marginTop: 8,
            backgroundColor: C.surface,
            padding: 4,
            borderRadius: 17,
            marginBottom: 10,
          }}
        >
          {["候補", "マッチした相手"].map((v) => {
            const matchesTab = v === "マッチした相手";
            const selected = matchesTab === showingMatches;
            return (
              <Pressable
                key={v}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={
                  matchesTab && newMatches ? `${v}、未読あり` : v
                }
                onPress={() => {
                  setMode(v);
                  if (matchesTab) readMatches();
                }}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 13,
                  backgroundColor: selected ? C.lime : "transparent",
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: selected ? C.purple : C.ink,
                  }}
                >
                  {v}
                </Text>
                {matchesTab && newMatches && (
                  <View
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 4,
                      backgroundColor: C.accent,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
        <View style={{ marginHorizontal: 20, marginTop: 4, marginBottom: 10 }}>
          <MascotBanner
            mascot="heart"
            tone="lime"
            actionLabel="クイックマッチを開く"
            title="クイックマッチで、今すぐ話そう。"
            body="同年代の3〜5人とグループチャット"
            onPress={() => router.push("/quick-match")}
          />
        </View>
        {!showingMatches && (
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 22,
              justifyContent: "flex-end",
              gap: 4,
              alignItems: "center",
              minHeight: 40,
            }}
          >
            <IconButton
              label={filters ? "絞り込みを閉じる" : "絞り込み"}
              onPress={() => setFilters(!filters)}
              style={{
                borderRadius: 10,
                backgroundColor: filters ? "#EBEBEB" : "transparent",
              }}
            >
              <SlidersHorizontal size={19} color={C.purple} />
            </IconButton>
          </View>
        )}
        {filters && !showingMatches && (
          <View
            style={[
              styles.card,
              { marginHorizontal: 20, padding: 15, marginBottom: 15 },
            ]}
          >
            <Text style={[styles.text, { fontWeight: "700", marginBottom: 9 }]}>
              条件を絞り込む
            </Text>
            <View className="flex-row" style={{ gap: 7, marginBottom: 12 }}>
              {["すべて", "1", "2", "3"].map((g) => (
                <Button
                  key={g}
                  small
                  secondary={grade !== g}
                  onPress={() => setGrade(g)}
                >
                  {g === "すべて" ? g : `高${g}`}
                </Button>
              ))}
            </View>
            {[
              [classroom, setClassroom, "クラス（例：4）"],
              [club, setClub, "部活（例：美術部）"],
            ].map(([value, setter, placeholder], i) => (
              <TextInput
                key={i}
                value={value as string}
                onChangeText={setter as (v: string) => void}
                placeholder={placeholder as string}
                placeholderTextColor={C.placeholder}
                style={{
                  borderWidth: 1,
                  borderColor: C.line,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 8,
                  fontSize: 12,
                  color: C.ink,
                }}
              />
            ))}
            <View style={{ marginBottom: 8 }}>
              <Button secondary small onPress={() => setPickingInterests(true)}>
                {interestFilters.length
                  ? interestFilters.map((tag) => `#${tag.label}`).join(" · ")
                  : "趣味タグを選ぶ"}
              </Button>
            </View>
            <Modal
              visible={pickingInterests}
              animationType="slide"
              onRequestClose={() => setPickingInterests(false)}
            >
              {pickingInterests && (
                <InterestPicker
                  initial={interestFilters}
                  filterOptions={(people ?? []).flatMap(
                    (person) => person.interests,
                  )}
                  onCancel={() => setPickingInterests(false)}
                  onSave={(tags) => {
                    setInterestFilters(tags);
                    setPickingInterests(false);
                  }}
                />
              )}
            </Modal>
            <Button
              secondary
              small
              onPress={() => {
                setGrade("すべて");
                setClassroom("");
                setClub("");
                setInterestFilters([]);
              }}
            >
              条件をクリア
            </Button>
          </View>
        )}
        {showingMatches ? (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {matched.map((p) => (
                <GridProfile key={p.id} profile={p} />
              ))}
            </View>
            {!matched.length && (
              <Empty
                icon="users"
                title="まだマッチした相手はいません"
                body="お互いに「気になる」を送ると、ここに表示されます。"
                action="相手を見つける"
                onPress={() => setMode("候補")}
              />
            )}
          </View>
        ) : isLoading ? (
          <Loading />
        ) : candidates.length ? (
          <View style={{ paddingHorizontal: 14 }}>
            {candidates.map((profile) => (
              <CandidateRow key={profile.id} profile={profile} />
            ))}
          </View>
        ) : (
          <Empty
            mascot="tired"
            title="条件に合う候補がいません"
            body="絞り込み条件を変えてみてください。"
          />
        )}
        <View style={{ height: 20 }} />
      </Screen>
    </View>
  );
}
