import { useLocalSearchParams } from "expo-router";
import { DetailScreen } from "../src/components/ui";
import { SchoolDetail } from "../src/features/SchoolLife";

export default function School() {
  const { section = "timetable" } = useLocalSearchParams<{ section: string }>();
  const title =
    section === "tasks"
      ? "やること・提出物"
      : section === "notices"
        ? "学校からのお知らせ"
        : "時間割";

  return (
    <DetailScreen title={title}>
      <SchoolDetail section={section} />
    </DetailScreen>
  );
}
