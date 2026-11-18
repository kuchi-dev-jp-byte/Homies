import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ArrowRight, Eye, EyeOff } from "lucide-react-native";
import { C } from "../src/components/ui";
import { LoginLayout } from "../src/components/LoginLayout";
import DemoLogin from "../src/components/DemoLogin";
import { authClient, demoAuth } from "../src/lib/supabase";

const inputStyle = {
  flex: 1,
  minHeight: 56,
  paddingHorizontal: 16,
  color: C.ink,
  fontSize: 15,
};
const labelStyle = {
  color: C.ink,
  fontSize: 12,
  fontWeight: "600" as const,
  marginBottom: 9,
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [visible, setVisible] = useState(false);
  const passwordInput = useRef<TextInput>(null);
  if (demoAuth) return <DemoLogin />;

  const submit = async () => {
    if (busy || !authClient || !email.trim() || !password) return;
    setBusy(true);
    setError("");
    try {
      const result = await authClient.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (result.error) {
        setError(
          result.error.code === "invalid_credentials"
            ? "メールアドレスまたはパスワードをご確認ください。"
            : "ログインできませんでした。通信状況とアカウントの状態をご確認ください。",
        );
      }
    } catch {
      setError("通信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  const disabled = !authClient || busy || !email.trim() || !password;
  const fieldStyle = (name: string) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: focused === name ? C.accent : "#ECECEC",
    borderRadius: 16,
    backgroundColor: focused === name ? "#FFFFFF" : C.surface,
  });
  return (
    <LoginLayout subtitle="学校から発行されたアカウントでログイン">
      <View style={{ marginBottom: 22 }}>
        <Text style={labelStyle}>メールアドレス</Text>
        <View style={fieldStyle("email")}>
          <TextInput
            accessibilityLabel="メールアドレス"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="name@example.com"
            placeholderTextColor={C.placeholder}
            editable={!busy && !!authClient}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused("")}
            returnKeyType="next"
            onSubmitEditing={() => passwordInput.current?.focus()}
            style={inputStyle}
          />
        </View>
      </View>
      <View style={{ marginBottom: 28 }}>
        <Text style={labelStyle}>パスワード</Text>
        <View style={fieldStyle("password")}>
          <TextInput
            ref={passwordInput}
            accessibilityLabel="パスワード"
            autoComplete="current-password"
            textContentType="password"
            secureTextEntry={!visible}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="パスワードを入力"
            placeholderTextColor={C.placeholder}
            editable={!busy && !!authClient}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused("")}
            onSubmitEditing={() => void submit()}
            returnKeyType="go"
            style={inputStyle}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              visible ? "パスワードを隠す" : "パスワードを表示"
            }
            onPress={() => setVisible(!visible)}
            style={{
              width: 48,
              height: 48,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {visible ? (
              <EyeOff size={19} color={C.muted} />
            ) : (
              <Eye size={19} color={C.muted} />
            )}
          </Pressable>
        </View>
      </View>
      {(!authClient || !!error) && (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            color: C.pink,
            fontSize: 13,
            lineHeight: 20,
            marginBottom: 20,
          }}
        >
          {error ||
            "認証サービスの設定が完了していません。管理者にお問い合わせください。"}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled, busy }}
        disabled={disabled}
        onPress={() => void submit()}
        style={({ pressed }) => ({
          minHeight: 56,
          borderRadius: 16,
          backgroundColor: disabled ? C.accentSoft : C.accent,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        {busy && <ActivityIndicator size="small" color={C.accent} />}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: disabled ? C.tagInk : "#FFFFFF",
          }}
        >
          {busy ? "ログイン中…" : "ログイン"}
        </Text>
        {!busy && (
          <ArrowRight size={18} color={disabled ? C.tagInk : "white"} />
        )}
      </Pressable>
    </LoginLayout>
  );
}
