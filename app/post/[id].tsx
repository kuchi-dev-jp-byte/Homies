import { anonymousAllowed } from "../../src/lib/activity";
import { sampleComments } from "../../src/data/social";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Avatar,
  Button,
  C,
  DetailScreen,
  Empty,
  SectionTitle,
  styles,
} from "../../src/components/ui";
import { PostCard } from "../../src/components/PostCard";
import { profiles } from "../../src/data/mock";
import { useAppStore } from "../../src/store/useAppStore";
import { useCurrentProfile, useVisiblePosts } from "../../src/lib/hooks";
export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(),
    [body, setBody] = useState("");
  const [commentError, setCommentError] = useState("");
  const posts = useVisiblePosts(),
    post = posts.find((p) => p.id === id),
    me = useAppStore((s) => s.me),
    allComments = useAppStore((s) => s.comments),
    add = useAppStore((s) => s.addComment),
    apply = useAppStore((s) => s.apply),
    applied = useAppStore((s) => s.applications.includes(id));
  const viewer = useCurrentProfile();
  const blocked = useAppStore((s) => s.blocked);
  const comments = [...sampleComments, ...allComments].filter(
    (c) => c.postId === id && !blocked.includes(c.authorId),
  );
  if (!post)
    return (
      <DetailScreen title="投稿">
        <Empty
          title="この投稿は表示できません"
          body="公開範囲や非表示設定をご確認ください。"
        />
      </DetailScreen>
    );
  const submitReply = () => {
    if (!body.trim()) return;
    if (post.anonymous && !anonymousAllowed(body)) {
      setCommentError("相手を傷つける表現は投稿できません");
      return;
    }
    setCommentError("");
    add(id, body);
    setBody("");
  };

  return (
    <DetailScreen
      title="投稿"
      footer={
        <View
          style={{
            backgroundColor: C.bg,
            borderTopWidth: 1,
            borderColor: C.line,
            padding: 12,
          }}
        >
          {!!commentError && (
            <Text accessibilityRole="alert" style={{ color: C.pink }}>
              {commentError}
            </Text>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Avatar uri={viewer.avatar} size={32} />
            <TextInput
              accessibilityLabel="返信を書く"
              placeholder="返信を書く"
              placeholderTextColor={C.placeholder}
              multiline
              maxLength={500}
              value={body}
              onChangeText={setBody}
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 110,
                color: C.ink,
                backgroundColor: "#F3F3F3",
                borderRadius: 18,
                paddingHorizontal: 12,
                paddingVertical: 9,
              }}
            />
            <Button small disabled={!body.trim()} onPress={submitReply}>
              返信
            </Button>
          </View>
        </View>
      }
    >
      <PostCard post={post} full />
      {post.capacity && (
        <View style={[styles.card, { padding: 18, marginTop: 16, gap: 12 }]}>
          <Text style={styles.text}>
            募集人数：{post.capacity}人
            {post.deadline ? `　締切：${post.deadline}` : ""}
          </Text>
          <Button onPress={() => apply(id)} secondary={applied}>
            {applied ? "参加希望を取り消す" : "参加したい"}
          </Button>
          <Text style={styles.muted}>
            参加希望を端末に保存します。連絡は送信されません。
          </Text>
        </View>
      )}
      {post.communityId && (
        <View style={{ marginTop: 16 }}>
          <Button
            secondary
            onPress={() => router.push(`/community/${post.communityId}`)}
          >
            関連コミュニティを見る →
          </Button>
        </View>
      )}
      <SectionTitle>返信（{comments.length}件）</SectionTitle>
      {!comments.length && (
        <Text style={[styles.muted, { marginBottom: 16 }]}>
          まだ返信はありません。
        </Text>
      )}
      {comments.map((c) => {
        const person =
          c.authorId === "me" ? me : profiles.find((p) => p.id === c.authorId);
        return (
          <View
            key={c.id}
            style={{
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderColor: C.line,
              flexDirection: "row",
              gap: 10,
            }}
          >
            {person && (
              <Pressable onPress={() => router.push(`/profile/${person.id}`)}>
                <Avatar uri={person.avatar} size={32} />
              </Pressable>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: C.ink }}>
                {person?.name ?? "メンバー"}
                {person?.role ? " · 教職員" : ""}
              </Text>
              <Text style={[styles.text, { fontSize: 13 }]}>{c.body}</Text>
            </View>
          </View>
        );
      })}
    </DetailScreen>
  );
}
