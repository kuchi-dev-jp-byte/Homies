import { profiles } from "../../src/data/mock";
import { matchedProfiles } from "../../src/lib/matching";
import { Text, View, useWindowDimensions } from "react-native";
import { Tabs } from "expo-router";
import {
  Home,
  Flame,
  School,
  Users,
  MessageCircle,
  Search,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../../src/store/useAppStore";
import { C } from "../../src/components/ui";
const tabIcon = (Icon: typeof Home) =>
  function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return (
      <View
        style={{
          width: 36,
          height: 29,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: focused ? C.lime : "transparent",
        }}
      >
        <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
      </View>
    );
  };

export default function TabLayout() {
  const matchCount = useAppStore((s) =>
    s.role === "teacher"
      ? 0
      : matchedProfiles(
          profiles,
          s.actions,
          s.incomingInterests,
          s.blocked,
        ).filter(({ id }) => s.directMessages[id] === undefined).length,
  );
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const bottom = Math.max(8, insets.bottom);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.ink,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelPosition: "below-icon",
        tabBarLabel: ({ children, color }) => (
          <Text
            style={{
              color,
              alignSelf: "stretch",
              textAlign: "center",
              fontSize: width < 370 ? 8.5 : 10,
              marginHorizontal: -5,
              lineHeight: 14,
              fontWeight: "600",
              marginTop: 2,
            }}
          >
            {children}
          </Text>
        ),
        tabBarItemStyle: { minWidth: 0, paddingHorizontal: 0 },
        tabBarStyle: {
          height: 55 + bottom,
          paddingTop: 6,
          paddingBottom: bottom,
          borderTopColor: "#EFEFEF",
          backgroundColor: "#FFFFFF",
        },
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: tabIcon(Home),
        }}
      />
      <Tabs.Screen
        name="matching"
        options={{
          title: "マッチング",
          tabBarBadge: matchCount || undefined,
          tabBarBadgeStyle: {
            backgroundColor: C.accent,
            color: "#FFFFFF",
            fontWeight: "700",
          },
          tabBarIcon: tabIcon(Flame),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "検索",
          tabBarIcon: tabIcon(Search),
        }}
      />
      <Tabs.Screen
        name="schoolwork"
        options={{
          title: "学校",
          tabBarIcon: tabIcon(School),
        }}
      />
      <Tabs.Screen name="trends" options={{ href: null }} />
      <Tabs.Screen
        name="communities"
        options={{
          title: "コミュニティ",
          tabBarIcon: tabIcon(Users),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "チャット",
          tabBarIcon: tabIcon(MessageCircle),
        }}
      />
    </Tabs>
  );
}
