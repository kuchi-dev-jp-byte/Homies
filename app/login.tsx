import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ChevronRight, GraduationCap, School } from "lucide-react-native";
import { staffProfile } from "../src/data/accounts";
import { C, DetailScreen, styles } from "../src/components/ui";
import { useAppStore } from "../src/store/useAppStore";

export default function Login() {
  const student = useAppStore((s) => s.me);
  const role = useAppStore((s) => s.role);
  const signIn = useAppStore((s) => s.setDemoRole);
  const accounts = [
    { role: "student", name: student.name, label: "生徒", Icon: GraduationCap },
    { role: "teacher", name: staffProfile.name, label: "教職員", Icon: School },
  ] as const;

  return (
    <DetailScreen title="ログイン">
      <Text
        style={[styles.title, { color: C.purple, fontSize: 34, marginTop: 24 }]}
      >
        Homies
      </Text>
      <Text style={[styles.text, { marginTop: 12, marginBottom: 20 }]}>
        アカウントを選択
      </Text>
      <View style={[styles.card, { overflow: "hidden" }]}>
        {accounts.map(({ role: accountRole, name, label, Icon }, index) => (
          <Pressable
            key={accountRole}
            accessibilityRole="button"
            accessibilityLabel={`${label}としてログイン`}
            onPress={() => {
              signIn(accountRole);
              router.replace("/");
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              minHeight: 70,
              padding: 15,
              gap: 12,
              borderTopWidth: index,
              borderColor: C.line,
            }}
          >
            <Icon size={23} color={C.purple} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.text, { fontWeight: "700" }]}>{name}</Text>
              <Text style={styles.muted}>{label}</Text>
            </View>
            {role === accountRole && <Text style={styles.muted}>使用中</Text>}
            <ChevronRight size={18} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </DetailScreen>
  );
}
