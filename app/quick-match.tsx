import { Mascot } from "../src/components/Mascot";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { router } from "expo-router";
import {
  ArrowLeft,
  Check,
  Ellipsis,
  Gamepad2,
  MessageCircle,
  Music2,
  Pencil,
  Tv,
  Zap,
} from "lucide-react-native";
import { Button, C, Empty, IconButton } from "../src/components/ui";
import type { QuickTopic } from "../src/lib/groups";
import { useAppStore } from "../src/store/useAppStore";

const demoWaitMs = 3000;

const topicOptions = [
  { id: "雑談", label: "なんでも雑談", Icon: MessageCircle },
  { id: "ゲーム", label: "ゲーム", Icon: Gamepad2 },
  { id: "音楽", label: "音楽", Icon: Music2 },
  { id: "アニメ", label: "アニメ", Icon: Tv },
  { id: "学校生活", label: "学校生活", Icon: Pencil },
  { id: "その他", label: "その他", Icon: Ellipsis },
] as const;

export default function QuickMatch() {
  const [topic, setTopic] = useState<QuickTopic>("雑談");
  const [waiting, setWaiting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(demoWaitMs / 1000);
  const [error, setError] = useState("");
  const create = useAppStore((s) => s.createQuickGroup);
  const role = useAppStore((s) => s.role);
  const current = useAppStore((s) =>
    s.groups.find(
      (group) =>
        group.trial && !group.members.some((id) => s.blocked.includes(id)),
    ),
  );
  useEffect(() => {
    if (!waiting || role !== "student") return;
    const startedAt = Date.now();
    const countdown = setInterval(() => {
      setRemainingSeconds(
        Math.max(0, Math.ceil((demoWaitMs - (Date.now() - startedAt)) / 1000)),
      );
    }, 250);
    const timer = setTimeout(() => {
      const id = create(topic);
      if (id) router.replace(`/group-chat/${id}`);
      else {
        setError("近い学年の参加者が足りません。");
        setWaiting(false);
      }
    }, demoWaitMs);
    return () => {
      clearTimeout(timer);
      clearInterval(countdown);
    };
  }, [waiting, topic, role, create]);

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F7F8FF", "#F5F6FF"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={layout.header}>
          <IconButton
            label="戻る"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/matching")
            }
          >
            <ArrowLeft size={26} color={C.ink} />
          </IconButton>
          <Text style={layout.headerTitle}>クイックマッチ</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView
          contentContainerStyle={layout.content}
          showsVerticalScrollIndicator={false}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Svg
              width={110}
              height={160}
              viewBox="0 0 110 160"
              style={{ position: "absolute", top: 38, left: -30 }}
            >
              <Path
                d="M0 30 C45 48 85 -6 103 27 C125 57 59 81 45 123 C26 176 -8 163 0 30Z"
                fill="#E9FF9A"
              />
            </Svg>
            <Svg
              width={94}
              height={92}
              viewBox="0 0 94 92"
              style={{ position: "absolute", top: 24, right: -26 }}
            >
              <Path
                d="M94 0 C35 4 70 34 21 47 C-14 59 2 88 35 82 L94 74Z"
                fill="#E1E6FF"
              />
            </Svg>
            <Svg
              width={153}
              height={140}
              viewBox="0 0 153 140"
              style={{ position: "absolute", top: 276, right: -24 }}
            >
              <Path
                d="M153 2 C92 3 106 52 42 72 C-25 96 2 133 48 119 C105 101 122 130 153 105Z"
                fill="#E9FF9A"
              />
            </Svg>
          </View>
          {role !== "student" ? (
            <Empty
              title="生徒のアカウントで利用できます"
              body="設定から生徒アカウントに切り替えてください。"
            />
          ) : (
            <>
              <View style={layout.hero}>
                <Mascot id={waiting ? "sleep" : "crown"} size={190} />
                <Text accessibilityRole="header" style={layout.title}>
                  {waiting ? "マッチング待機中" : "今すぐ話そう！"}
                </Text>
                <Text style={layout.subtitle}>
                  {"同年代の3〜5人と\nグループチャット"}
                </Text>
              </View>
              {waiting ? (
                <View style={{ gap: 20, paddingVertical: 30 }}>
                  <ActivityIndicator color={C.accent} />
                  <View
                    style={{
                      backgroundColor: C.accentSoft,
                      padding: 18,
                      borderRadius: 20,
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        color: C.accent,
                        fontSize: 19,
                        fontWeight: "800",
                      }}
                    >
                      {remainingSeconds > 0
                        ? `予想待ち時間：あと約${remainingSeconds}秒`
                        : "まもなくルームに移動します"}
                    </Text>
                    <Text
                      style={{
                        textAlign: "center",
                        color: C.muted,
                        fontSize: 12,
                      }}
                    >
                      デモの待ち時間の目安です
                    </Text>
                  </View>
                  <Text
                    accessibilityLiveRegion="polite"
                    style={{ textAlign: "center", color: C.muted }}
                  >
                    {topic}で参加者を探しています
                  </Text>
                  <Button secondary onPress={() => setWaiting(false)}>
                    待機をキャンセル
                  </Button>
                </View>
              ) : (
                <>
                  <View style={{ gap: 16 }}>
                    <Text
                      accessibilityRole="header"
                      style={layout.sectionTitle}
                    >
                      話したいジャンル
                    </Text>
                    <View style={layout.topics}>
                      {topicOptions.map(({ id, label, Icon }) => {
                        const active = id === (current?.trial?.topic ?? topic);
                        const TopicIcon = active ? Check : Icon;
                        return (
                          <Pressable
                            key={id}
                            accessibilityRole="button"
                            accessibilityState={{
                              selected: active,
                              disabled: !!current,
                            }}
                            disabled={!!current}
                            onPress={() => setTopic(id)}
                            style={({ pressed }) => [
                              layout.topic,
                              active && layout.selectedTopic,
                              { opacity: pressed ? 0.75 : 1 },
                            ]}
                          >
                            <TopicIcon
                              size={24}
                              color={active ? "white" : C.ink}
                              strokeWidth={2.2}
                            />
                            <Text
                              style={[
                                layout.topicText,
                                active && { color: "white" },
                              ]}
                            >
                              {label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {!!error && (
                      <Text
                        accessibilityLiveRegion="polite"
                        style={{ color: C.pink }}
                      >
                        {error}
                      </Text>
                    )}
                  </View>
                  <View style={layout.footer}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        if (current) {
                          router.push(`/group-chat/${current.id}`);
                          return;
                        }
                        setError("");
                        setRemainingSeconds(demoWaitMs / 1000);
                        setWaiting(true);
                      }}
                      style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                    >
                      <LinearGradient
                        colors={["#465CFF", "#3048EE"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={layout.start}
                      >
                        <Zap size={25} color="white" fill="white" />
                        <Text
                          style={{
                            color: "white",
                            fontSize: 20,
                            fontWeight: "800",
                          }}
                        >
                          {current ? "ルームに戻る" : "マッチング開始"}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                    <Text
                      style={{
                        textAlign: "center",
                        color: C.muted,
                        fontSize: 10,
                        marginTop: 10,
                      }}
                    >
                      {current
                        ? "参加中のルームがあります。終了後にジャンルを変更できます。"
                        : "サンプルの参加者と15分間お試しできます。"}
                    </Text>
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const layout = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 22,
    overflow: "hidden",
  },
  hero: { alignItems: "center", paddingTop: 35, paddingBottom: 38, gap: 12 },
  title: {
    color: "#121528",
    fontSize: 37,
    lineHeight: 48,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 29,
    color: "#717587",
    textAlign: "center",
    fontWeight: "600",
  },
  sectionTitle: { fontSize: 19, fontWeight: "800", color: C.ink },
  topics: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  topic: {
    width: "47%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 53,
    paddingHorizontal: 7,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEDF4",
    shadowColor: "#3B437C",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  selectedTopic: { backgroundColor: "#4054F5", borderColor: "#5C6CFF" },
  topicText: {
    color: "#202332",
    fontSize: 16,
    flexShrink: 1,
    fontWeight: "700",
  },
  footer: { marginTop: "auto", paddingTop: 44 },
  start: {
    minHeight: 64,
    borderRadius: 34,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.accent,
    shadowOpacity: 0.23,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
});
