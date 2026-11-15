import { profiles } from "../../src/data/mock";
import { matchedProfiles } from "../../src/lib/matching";
import { Text, useWindowDimensions } from "react-native";
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
        tabBarActiveTintColor: C.purple,
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
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={24}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
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
          tabBarIcon: ({ color, focused }) => (
            <Flame
              size={24}
              color={color}
              fill={focused ? color : "transparent"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "検索",
          tabBarIcon: ({ color }) => <Search size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schoolwork"
        options={{
          title: "学校",
          tabBarIcon: ({ color }) => <School size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="trends" options={{ href: null }} />
      <Tabs.Screen
        name="communities"
        options={{
          title: "コミュニティ",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "チャット",
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
