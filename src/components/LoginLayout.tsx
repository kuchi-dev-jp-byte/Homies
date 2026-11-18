import { Mascot } from "./Mascot";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C } from "./ui";

export function LoginLayout({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle: string;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            paddingVertical: 40,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              width: "100%",
              maxWidth: 380,
              alignSelf: "center",
              paddingVertical: 32,
            }}
          >
            <View style={{ marginBottom: 44 }}>
              <View
                accessible
                accessibilityLabel="Homies"
                style={{ marginBottom: 20 }}
              >
                <Mascot id="brand" size={154} />
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                  color: C.ink,
                }}
              >
                おかえりなさい。
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 21,
                  color: C.muted,
                  marginTop: 10,
                }}
              >
                {subtitle}
              </Text>
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
