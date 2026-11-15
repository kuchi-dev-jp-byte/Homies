import { View } from "react-native";
import { Screen, SectionTitle } from "../../src/components/ui";
import { SchoolLife } from "../../src/features/SchoolLife";
import { PostCard } from "../../src/components/PostCard";
import { useVisiblePosts } from "../../src/lib/hooks";

export default function Schoolwork() {
  const posts = useVisiblePosts().filter((post) => post.kind === "school");
  return (
    <Screen>
      <View style={{ paddingHorizontal: 20 }}>
        <SchoolLife />
        <SectionTitle>学校からのお知らせ</SectionTitle>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </View>
    </Screen>
  );
}
