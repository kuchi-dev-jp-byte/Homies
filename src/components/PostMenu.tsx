import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ban, Flag, MoreHorizontal, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Post } from "../data/types";
import { useCurrentProfile } from "../lib/hooks";
import { useAppStore } from "../store/useAppStore";
import { C, IconButton } from "./ui";

export function PostMenu({
  post,
  full = false,
}: {
  post: Post;
  full?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const viewer = useCurrentProfile();
  const own = post.authorId === viewer.id;
  const remove = useAppStore((s) => s.deletePost);
  const block = useAppStore((s) => s.block);
  const insets = useSafeAreaInsets();
  const choices = own
    ? [
        {
          label: "削除する",
          Icon: Trash2,
          action: () => {
            setOpen(false);
            if (remove(post.id) && full) router.replace("/");
          },
        },
      ]
    : [
        {
          label: "ブロックする",
          Icon: Ban,
          action: () => {
            setOpen(false);
            block(post.authorId);
            if (full) router.replace("/");
          },
        },
        {
          label: "通報する",
          Icon: Flag,
          action: () => {
            setOpen(false);
            router.push({
              pathname: "/safety",
              params: {
                postId: post.id,
                mode: "report",
                ...(post.anonymous ? {} : { userId: post.authorId }),
              },
            });
          },
        },
      ];
  return (
    <>
      <IconButton label="投稿のメニュー" onPress={() => setOpen(true)}>
        <MoreHorizontal size={21} color={C.muted} />
      </IconButton>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "#15152155",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="メニューを閉じる"
            onPress={() => setOpen(false)}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          />
          <View
            accessibilityViewIsModal
            style={{
              width: "100%",
              maxWidth: 500,
              backgroundColor: "white",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: Math.max(insets.bottom, 16),
            }}
          >
            <View
              style={{
                alignSelf: "center",
                height: 4,
                width: 36,
                backgroundColor: C.line,
                borderRadius: 2,
                marginBottom: 18,
              }}
            />
            <Text
              accessibilityRole="header"
              style={{
                color: C.ink,
                fontSize: 16,
                fontWeight: "800",
                marginBottom: 12,
              }}
            >
              投稿のメニュー
            </Text>
            {choices.map(({ label, Icon, action }) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                onPress={action}
                style={({ pressed }) => ({
                  minHeight: 56,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 8,
                  borderRadius: 12,
                  backgroundColor: pressed ? C.surface : "white",
                })}
              >
                <Icon size={21} color={C.pink} />
                <Text
                  style={{ color: C.pink, fontSize: 15, fontWeight: "700" }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setOpen(false)}
              style={{
                minHeight: 48,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: C.surface,
                borderRadius: 24,
                marginTop: 10,
              }}
            >
              <Text style={{ color: C.ink, fontWeight: "700" }}>
                キャンセル
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
