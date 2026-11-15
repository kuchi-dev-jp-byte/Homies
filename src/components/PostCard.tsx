import { useCurrentProfile } from "../lib/hooks";
import { sampleComments } from "../data/social";
import { imageSource } from "../data/images";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Bookmark,
  Heart,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  UserRound,
} from "lucide-react-native";
import { Post } from "../data/types";
import { profiles } from "../data/mock";
import { useAppStore } from "../store/useAppStore";
import { Avatar, C, IconButton, styles } from "./ui";

const actionStyle = {
  flexDirection: "row",
  gap: 6,
  alignItems: "center",
  minHeight: 44,
  minWidth: 50,
} as const;

export function PostCard({
  post,
  full = false,
  flat = false,
}: {
  post: Post;
  full?: boolean;
  flat?: boolean;
}) {
  const liked = useAppStore((s) => s.liked.includes(post.id));
  const saved = useAppStore((s) =>
    (s.role === "teacher" ? s.staffSaved : s.saved).includes(post.id),
  );
  const allComments = useAppStore((s) => s.comments);
  const blocked = useAppStore((s) => s.blocked);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleSave = useAppStore((s) => s.toggleSave);
  const me = useAppStore((s) => s.me);
  const comments = [...sampleComments, ...allComments].filter(
    (c) => c.postId === post.id && !blocked.includes(c.authorId),
  );
  const school = post.kind === "school";
  const author = !post.anonymous
    ? post.authorId === "me"
      ? me
      : profiles.find((p) => p.id === post.authorId)
    : undefined;
  const open = () => router.push(`/post/${post.id}`);
  const identity = (
    <>
      {author ? (
        <Avatar uri={author.avatar} size={38} />
      ) : (
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#ECECEC",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {school ? (
            <Megaphone size={18} color={C.purple} />
          ) : (
            <UserRound size={22} color={C.muted} />
          )}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              fontSize: 14,
              color: C.ink,
              fontWeight: "700",
            }}
          >
            {author?.name ??
              (school
                ? "学校からのお知らせ"
                : post.anonymous
                  ? "匿名の生徒"
                  : "学校のメンバー")}
          </Text>
          {author?.role === "teacher" && (
            <Text style={{ fontSize: 11, fontWeight: "700", color: C.purple }}>
              教職員
            </Text>
          )}
          {post.secret && (
            <View accessible accessibilityLabel="シークレット投稿">
              <LockKeyhole size={15} color={C.purple} />
            </View>
          )}
        </View>
        <Text style={styles.muted}>
          {school
            ? "学校連絡 · "
            : author && !author.role
              ? `高${author.grade}・${author.classroom}組 · `
              : ""}
          {full && author ? `@${author.id}` : post.time}
        </Text>
      </View>
    </>
  );
  const renderHashtags = (value: string) =>
    value.split(/([#＃][^\s#＃、。！!？?]+)/g).map((part, index) =>
      index % 2 ? (
        <Text
          key={index}
          accessibilityRole="link"
          onPress={(event) => {
            event.stopPropagation();
            router.navigate({
              pathname: "/search",
              params: {
                hashtag: part.slice(1),
                request: String(Date.now()),
              },
            });
          }}
          style={{
            color: C.tagInk,
            fontWeight: "700",
          }}
        >
          {part}
        </Text>
      ) : (
        part
      ),
    );
  const body = (
    <>
      {!!post.title && (
        <Text
          style={{
            color: C.ink,
            fontWeight: "800",
            fontSize: 17,
            lineHeight: 24,
            marginBottom: 4,
          }}
        >
          {renderHashtags(post.title)}
        </Text>
      )}
      <Text
        numberOfLines={full ? undefined : 4}
        style={{
          color: C.ink,
          fontSize: full ? 17 : 14,
          lineHeight: full ? 26 : 22,
        }}
      >
        {renderHashtags(post.body)}
      </Text>
      {!!post.image && (
        <Image
          source={imageSource(post.image)}
          contentFit="cover"
          style={{
            width: "100%",
            height: full ? 260 : 195,
            borderRadius: 12,
            marginTop: 10,
            backgroundColor: C.line,
          }}
        />
      )}
    </>
  );
  const viewer = useCurrentProfile();
  const replied = comments.some((comment) => comment.authorId === viewer.id);
  const commentCount = (
    <>
      <MessageCircle size={22} color={replied ? C.accent : C.muted} />
      <Text style={styles.muted}>{comments.length}</Text>
    </>
  );
  return (
    <View
      style={[
        flat || full
          ? { borderBottomWidth: 1, borderColor: C.line }
          : styles.card,
        {
          paddingHorizontal: full ? 0 : 15,
          paddingTop: flat ? 15 : 11,
          paddingBottom: 3,
          marginBottom: flat ? 0 : 12,
        },
      ]}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        {author ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${author.name}のプロフィール`}
            onPress={() => router.push(`/profile/${author.id}`)}
            style={[actionStyle, { flex: 1, gap: 9 }]}
          >
            {identity}
          </Pressable>
        ) : (
          <View style={[actionStyle, { flex: 1, gap: 9 }]}>{identity}</View>
        )}
        <IconButton
          label="投稿のメニュー"
          onPress={() =>
            router.push({
              pathname: "/safety",
              params: post.anonymous
                ? { postId: post.id }
                : { postId: post.id, userId: post.authorId },
            })
          }
        >
          <MoreHorizontal size={21} color={C.muted} />
        </IconButton>
      </View>
      {full ? (
        <View>{body}</View>
      ) : (
        <Pressable accessibilityRole="link" onPress={open}>
          {body}
        </Pressable>
      )}
      {full && author && (
        <Text style={[styles.muted, { marginVertical: 10 }]}>{post.time}</Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginTop: 4,
        }}
      >
        <Pressable
          accessibilityLabel={liked ? "いいねを取り消す" : "いいね"}
          accessibilityRole="button"
          accessibilityState={{ selected: liked }}
          onPress={() => toggleLike(post.id)}
          style={actionStyle}
        >
          <Heart
            size={23}
            color={liked ? C.pink : C.ink}
            fill={liked ? C.pink : "transparent"}
          />
          <Text style={styles.muted}>{post.likes + (liked ? 1 : 0)}</Text>
        </Pressable>
        {full ? (
          <View style={actionStyle}>{commentCount}</View>
        ) : (
          <Pressable
            accessibilityLabel={`コメントを見る（${comments.length}件）`}
            accessibilityRole="link"
            onPress={open}
            style={actionStyle}
          >
            {commentCount}
          </Pressable>
        )}
        <View style={{ flex: 1 }} />
        {!school && (
          <IconButton
            label={saved ? "保存を解除" : "投稿を保存"}
            onPress={() => toggleSave(post.id)}
            style={{ minWidth: 50, minHeight: 48 }}
          >
            <Bookmark
              size={23}
              color={saved ? C.accent : C.muted}
              fill={saved ? C.accent : "transparent"}
            />
          </IconButton>
        )}
      </View>
      {post.kind === "board" && !full && comments.length > 0 && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`コメントをすべて見る（${comments.length}件）`}
          onPress={open}
          style={{
            borderTopWidth: 1,
            borderColor: C.line,
            paddingTop: 10,
            paddingBottom: 9,
            gap: 4,
          }}
        >
          {comments.slice(0, 2).map((c) => (
            <Text key={c.id} numberOfLines={2} style={styles.muted}>
              <Text style={{ fontWeight: "700", color: C.ink }}>
                {c.authorId === "me"
                  ? me.name
                  : (profiles.find((p) => p.id === c.authorId)?.name ??
                    "メンバー")}
                {"  "}
              </Text>
              {c.body}
            </Text>
          ))}
          <Text
            style={{
              fontSize: 12,
              color: C.purple,
              fontWeight: "700",
              paddingVertical: 5,
            }}
          >
            コメントをすべて見る（{comments.length}件）
          </Text>
        </Pressable>
      )}
    </View>
  );
}
