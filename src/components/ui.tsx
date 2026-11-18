import { Mascot } from "./Mascot";
import type { StickerId } from "../data/stickers";
import { useCurrentProfile } from "../lib/hooks";
import { imageSource } from "../data/images";
import { ReactNode, useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Heart,
  BookOpen,
  ChevronRight,
  Gamepad2,
  GraduationCap,
  Music2,
  Palette,
  Bookmark,
  MessageCircle,
  Users,
  UserRound,
  Trophy,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Interest, InterestKind } from "../data/types";
import { useAppStore } from "../store/useAppStore";
export const C = {
  purple: "#171717",
  accent: "#3048EE",
  accentSoft: "#EEF0FF",
  lime: "#D1FA00",
  limeSoft: "#ECFFA3",
  surface: "#F4F4F6",
  tagInk: "#3042CA",
  tagBg: "#EEF0FF",
  ink: "#171717",
  muted: "#626262",
  placeholder: "#909090",
  line: "#E8E8ED",
  bg: "#FFFFFF",
  pink: "#BC2342",
};
export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: "#515151",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },
  text: { color: C.ink, fontSize: 14, lineHeight: 22 },
  muted: { color: C.muted, fontSize: 12, lineHeight: 19 },
  title: { fontSize: 24, fontWeight: "800", color: C.ink, letterSpacing: -0.6 },
});
export function Avatar({
  uri,
  size = 42,
  online,
}: {
  uri: string;
  size?: number;
  online?: boolean;
}) {
  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={imageSource(uri)}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#E7E7E7",
          }}
          contentFit="cover"
          transition={180}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#E7E7E7",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserRound size={size * 0.53} color={C.purple} />
        </View>
      )}
      {online !== undefined && (
        <View
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 13,
            height: 13,
            borderRadius: 8,
            backgroundColor: online ? "#168B45" : "#A4A4A4",
            borderWidth: 2,
            borderColor: "white",
          }}
        />
      )}
    </View>
  );
}
export function IconButton({
  children,
  onPress,
  label,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  label: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minWidth: 44,
          minHeight: 44,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.55 : 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
export function Header() {
  const me = useCurrentProfile(),
    read = useAppStore((s) => s.notificationsRead);
  const homework = useAppStore((s) => s.homework),
    seen = useAppStore((s) => s.homeworkSeen);
  const socialEvents = useAppStore((s) => s.socialEvents),
    blocked = useAppStore((s) => s.blocked);
  const socialUnread = socialEvents.some(
    (e) => !e.read && !blocked.includes(e.actorId),
  );
  const unreadHomework = homework.some((h) => !seen[h.id]);
  return (
    <View
      className="flex-row items-center justify-between"
      style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 11 }}
    >
      <Pressable
        onPress={() => router.navigate("/")}
        accessibilityRole="button"
        accessibilityLabel="ホームへ"
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text
            style={{
              fontSize: 35,
              fontWeight: "900",
              letterSpacing: -2,
              color: C.purple,
            }}
          >
            Homies
          </Text>
        </View>
      </Pressable>
      <View className="flex-row items-center" style={{ gap: 2 }}>
        <IconButton
          label="学校からの通知"
          onPress={() => router.push("/notifications")}
        >
          <Bell size={23} color={C.ink} />
          {(!read || unreadHomework) && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 9,
                width: 7,
                height: 7,
                backgroundColor: C.pink,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "white",
              }}
            />
          )}
        </IconButton>
        <IconButton
          label="アクティビティ"
          onPress={() => router.push("/activity")}
        >
          <Heart size={23} color={C.ink} />
          {socialUnread && (
            <View
              style={{
                position: "absolute",
                right: 7,
                top: 7,
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: C.pink,
              }}
            />
          )}
        </IconButton>
        <Pressable
          accessibilityLabel="マイページ"
          accessibilityRole="button"
          onPress={() => router.navigate("/mypage")}
          style={{
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Avatar uri={me.avatar} size={36} />
        </Pressable>
      </View>
    </View>
  );
}
export function Screen({
  children,
  title,
  subtitle,
  header = true,
  scroll = true,
  right,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  header?: boolean;
  scroll?: boolean;
  right?: ReactNode;
}) {
  const content = (
    <>
      {title && (
        <View style={{ paddingHorizontal: 22, marginBottom: 20 }}>
          <View className="flex-row items-center justify-between">
            <Text style={styles.title}>{title}</Text>
            {right}
          </View>
          {subtitle && (
            <Text style={[styles.muted, { marginTop: 7 }]}>{subtitle}</Text>
          )}
        </View>
      )}
      {children}
    </>
  );
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      {header && <Header />}
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{content}</View>
      )}
    </SafeAreaView>
  );
}
export function DetailScreen({
  title,
  children,
  footer,
  hideBack = false,
  centered = false,
  subtitle,
  headerAction,
  dark = false,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  hideBack?: boolean;
  centered?: boolean;
  subtitle?: string;
  headerAction?: ReactNode;
  dark?: boolean;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: dark ? "#090909" : C.bg }}>
      <View
        className="flex-row items-center"
        style={{
          paddingHorizontal: 10,
          paddingVertical: 9,
          borderBottomWidth: 1,
          borderColor: dark ? "#262626" : C.line,
          backgroundColor: dark ? "#090909" : "white",
        }}
      >
        {!hideBack && (
          <IconButton
            label="戻る"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          >
            <ArrowLeft color={dark ? "white" : C.ink} size={22} />
          </IconButton>
        )}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            alignItems: centered ? "center" : "flex-start",
            paddingHorizontal: 5,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: dark ? "white" : C.ink,
            }}
          >
            {title}
          </Text>
          {!!subtitle && (
            <Text numberOfLines={1} style={styles.muted}>
              {subtitle}
            </Text>
          )}
        </View>
        {headerAction ??
          (centered && !hideBack ? <View style={{ width: 44 }} /> : null)}
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {children}
        </ScrollView>
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
  small = false,
}: {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={small ? 6 : undefined}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 28,
        backgroundColor: secondary ? C.surface : C.accent,
        minHeight: small ? 32 : 48,
        paddingHorizontal: small ? 15 : 20,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          color: secondary ? C.ink : "#FFFFFF",
          fontWeight: "700",
          fontSize: small ? 11 : 14,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function SegmentTabs<T extends string>({
  items,
  value,
  onChange,
  labels,
}: {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        gap: 4,
        borderBottomWidth: 1,
        borderColor: C.line,
      }}
    >
      {items.map((item) => {
        const selected = item === value;
        return (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(item)}
            style={{
              flex: 1,
              borderBottomWidth: 2,
              borderBottomColor: selected ? C.ink : "transparent",
              paddingBottom: 5,
            }}
          >
            <View
              style={{
                minHeight: 38,
                borderRadius: 22,
                backgroundColor: selected ? C.lime : "transparent",
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  color: selected ? C.ink : C.muted,
                  fontSize: 13,
                  fontWeight: selected ? "800" : "700",
                  textAlign: "center",
                }}
              >
                {labels?.[item] ?? item}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      aria-pressed={active}
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: active ? C.lime : C.surface,
        borderWidth: 1,
        borderColor: active ? C.lime : C.line,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: active ? C.ink : C.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function ChipRow({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 7,
        paddingHorizontal: 20,
        paddingBottom: 14,
      }}
    >
      {items.map((i) => (
        <Chip
          key={i}
          label={i}
          active={i === value}
          onPress={() => onChange(i)}
        />
      ))}
    </ScrollView>
  );
}
const tagTheme: Record<
  InterestKind,
  { color: string; bg: string; icon: typeof Music2 }
> = {
  game: { color: "#57349B", bg: "#F0E8FF", icon: Gamepad2 },
  music: { color: "#A32A58", bg: "#FCE8F0", icon: Music2 },
  art: { color: "#875000", bg: "#FFF1D6", icon: Palette },
  study: { color: "#086782", bg: "#E1F6FD", icon: BookOpen },
  club: { color: "#226541", bg: "#E3F6E9", icon: Trophy },
  other: { color: "#949494", bg: "#F4F4F4", icon: GraduationCap },
};
export function Tags({ items }: { items: Interest[] }) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: 5 }}>
      {items.map((t) => {
        const theme = tagTheme[t.kind];
        return (
          <View
            key={t.label}
            className="flex-row items-center"
            style={{
              backgroundColor: theme.bg,
              paddingHorizontal: 8,
              paddingVertical: 5,
              borderRadius: 20,
              gap: 4,
            }}
          >
            <theme.icon color={theme.color} size={11} />
            <Text
              style={{ color: theme.color, fontSize: 10, fontWeight: "600" }}
            >
              {t.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
export function SectionTitle({
  children,
  action,
  onPress,
}: {
  children: ReactNode;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View
      className="flex-row justify-between items-center"
      style={{ marginVertical: 14 }}
    >
      <Text style={{ fontSize: 17, fontWeight: "800", color: C.ink }}>
        {children}
      </Text>
      {action && (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "700", color: C.purple }}>
            {action}
          </Text>
          <ChevronRight size={14} color={C.purple} />
        </Pressable>
      )}
    </View>
  );
}
export function Empty({
  title,
  body,
  action,
  onPress,
  icon = "message",
  mascot,
}: {
  title: string;
  body: string;
  mascot?: StickerId;
  icon?: "bookmark" | "users" | "message";
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={{ padding: 30, alignItems: "center", gap: 14 }}>
      {mascot ? (
        <Mascot id={mascot} size={103} />
      ) : icon === "bookmark" ? (
        <Bookmark size={30} color={C.purple} />
      ) : icon === "users" ? (
        <Users size={30} color={C.purple} />
      ) : (
        <MessageCircle size={30} color={C.purple} />
      )}
      <Text style={[styles.title, { fontSize: 18, textAlign: "center" }]}>
        {title}
      </Text>
      <Text style={[styles.muted, { textAlign: "center" }]}>{body}</Text>
      {action && onPress && <Button onPress={onPress}>{action}</Button>}
    </View>
  );
}
export function Loading() {
  return <ActivityIndicator color={C.purple} style={{ padding: 40 }} />;
}
export function Toast() {
  const toast = useAppStore((s) => s.toast),
    notify = useAppStore((s) => s.notify);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => notify(null), 4000);
    return () => clearTimeout(t);
  }, [toast, notify]);
  return toast ? (
    <Pressable
      accessibilityRole="alert"
      onPress={() => notify(null)}
      style={{
        position: "absolute",
        bottom: 100,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "#2B2B2B",
        zIndex: 100,
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 13,
          lineHeight: 21,
          textAlign: "center",
        }}
      >
        {toast}
      </Text>
    </Pressable>
  ) : null;
}
