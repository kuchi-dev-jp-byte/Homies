import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toast } from "../src/components/ui";
const client = new QueryClient();
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#EEEEEE" }}>
      <SafeAreaProvider>
        <QueryClientProvider client={client}>
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 500,
              alignSelf: "center",
              backgroundColor: "#F8F8F8",
              overflow: "hidden",
            }}
          >
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#F8F8F8" },
              }}
            />
            <Toast />
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
