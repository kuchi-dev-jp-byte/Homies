import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { C, Toast } from "../src/components/ui";
import { AuthProvider, useAuth } from "../src/lib/auth";
import { demoAuth } from "../src/lib/supabase";

const applicationRoutes = [
  "(tabs)",
  "activity",
  "cards",
  "chat/[id]",
  "community/[id]",
  "create-group",
  "room-editor",
  "create",
  "edit-profile",
  "group-chat/[id]",
  "homework",
  "instant/[id]",
  "instants",
  "mypage",
  "note/[id]",
  "notifications",
  "post/[id]",
  "profile/[id]",
  "quick-match",
  "safety",
  "school",
  "settings",
] as const;

function AuthenticatedRoutes() {
  const { ready, signedIn, storageError } = useAuth();
  if (storageError)
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text accessibilityRole="alert">
          端末のデータを読み込めませんでした。アプリを開き直してください。
        </Text>
      </View>
    );
  if (!ready)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator accessibilityLabel="ログイン状態を確認中" />
      </View>
    );
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Protected guard={demoAuth || signedIn}>
          {applicationRoutes.map((name) => (
            <Stack.Screen key={name} name={name} />
          ))}
        </Stack.Protected>
        <Stack.Protected guard={demoAuth || !signedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
      <Toast />
    </>
  );
}

const client = new QueryClient();
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: C.surface }}>
      <SafeAreaProvider>
        <QueryClientProvider client={client}>
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 500,
              alignSelf: "center",
              backgroundColor: C.bg,
              overflow: "hidden",
            }}
          >
            <StatusBar style="dark" />
            <AuthProvider>
              <AuthenticatedRoutes />
            </AuthProvider>
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
