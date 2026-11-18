import { router } from "expo-router";
import { LoginLayout } from "./LoginLayout";
import { Button } from "./ui";

export default function DemoLogin() {
  return (
    <LoginLayout subtitle="ボタンを押してHomiesをお試しください。">
      <Button onPress={() => router.replace("/")}>ログイン</Button>
    </LoginLayout>
  );
}
