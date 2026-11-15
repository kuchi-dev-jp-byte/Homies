import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { profiles } from "../../src/data/mock";
import { DetailScreen, Empty } from "../../src/components/ui";
import { ProfileContent } from "../../src/features/Profile";
import { useCurrentProfile } from "../../src/lib/hooks";
import { useAppStore } from "../../src/store/useAppStore";
export default function ProfileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    student = useAppStore((s) => s.me),
    blocked = useAppStore((s) => s.blocked.includes(id));
  const current = useCurrentProfile();
  const profile = id === "me" ? student : profiles.find((p) => p.id === id);
  return (
    <DetailScreen title={profile && !blocked ? profile.name : "プロフィール"}>
      {profile && !blocked ? (
        <View style={{ marginTop: -20 }}>
          <ProfileContent profile={profile} own={id === current.id} />
        </View>
      ) : (
        <Empty
          title="プロフィールを表示できません"
          body="非表示設定またはプロフィールをご確認ください。"
        />
      )}
    </DetailScreen>
  );
}
