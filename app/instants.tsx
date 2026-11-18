import { useState } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  ChevronRight,
  Image as ImageIcon,
  Users,
} from "lucide-react-native";
import {
  Avatar,
  Button,
  C,
  DetailScreen,
  Empty,
  styles,
} from "../src/components/ui";
import { profiles } from "../src/data/mock";
import { useAppStore } from "../src/store/useAppStore";
import { activeUntil } from "../src/lib/activity";
import { useNow } from "../src/lib/useNow";

export default function Instants() {
  const items = useAppStore((s) => s.instants),
    seen = useAppStore((s) => s.viewedInstants),
    publish = useAppStore((s) => s.publishInstant),
    friends = useAppStore((s) => s.friends),
    blocked = useAppStore((s) => s.blocked);

  const [error, setError] = useState(""),
    [caption, setCaption] = useState(""),
    [draft, setDraft] = useState<string>();
  const now = useNow();
  const web = Platform.OS === "web";
  const recipients = friends.filter((id) => !blocked.includes(id));
  const active = items.filter(
    (i) =>
      activeUntil(i.createdAt, now) &&
      (i.authorId === "me" || recipients.includes(i.authorId)),
  );

  async function takePhoto() {
    setError("");
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError("撮影にはカメラへのアクセス許可が必要です。");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        mediaTypes: ["images"],
        allowsEditing: false,
      });
      if (!result.canceled) setDraft(result.assets[0].uri);
    } catch {
      setError("カメラを起動できませんでした。");
    }
  }

  return (
    <DetailScreen title="インスタント" dark>
      <View
        style={{
          backgroundColor: "#101010",
          borderRadius: 24,
          padding: 12,
          gap: 12,
          marginBottom: 24,
        }}
      >
        <View
          style={{
            aspectRatio: 4 / 5,
            borderRadius: 22,
            overflow: "hidden",
            backgroundColor: "#262626",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {draft ? (
            <>
              <Image
                source={{ uri: draft }}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
              <TextInput
                accessibilityLabel="キャプション"
                value={caption}
                onChangeText={setCaption}
                placeholder="キャプションを追加…"
                placeholderTextColor="#dedede"
                maxLength={80}
                style={{
                  position: "absolute",
                  left: 12,
                  right: 12,
                  bottom: 12,
                  padding: 12,
                  borderRadius: 18,
                  color: "white",
                  backgroundColor: "#0009",
                }}
              />
            </>
          ) : (
            <View style={{ alignItems: "center", gap: 12, padding: 24 }}>
              <Camera size={28} color="#d0d0d0" />
              <Text style={{ color: "#dedede", textAlign: "center" }}>
                {web
                  ? "撮影はiOS・Androidアプリで利用できます。"
                  : "シャッターを押して撮影"}
              </Text>
            </View>
          )}
        </View>
        {draft ? (
          <>
            <Button
              disabled={!recipients.length}
              onPress={() => {
                publish(draft, caption);
                setDraft(undefined);
                setCaption("");
              }}
            >
              友達にシェア
            </Button>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Button
                small
                secondary
                onPress={() => {
                  setDraft(undefined);
                  setCaption("");
                  setError("");
                }}
              >
                破棄
              </Button>
              <Button small secondary onPress={() => void takePhoto()}>
                撮り直す
              </Button>
            </View>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="写真を撮る"
            disabled={web}
            onPress={() => void takePhoto()}
            style={{
              alignSelf: "center",
              width: 72,
              height: 72,
              borderRadius: 36,
              borderWidth: 3,
              borderColor: "white",
              alignItems: "center",
              justifyContent: "center",
              opacity: web ? 0.45 : 1,
            }}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                backgroundColor: "white",
              }}
            />
          </Pressable>
        )}
        <View
          style={{
            alignSelf: "center",
            alignItems: "center",
            gap: 8,
            paddingBottom: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderRadius: 20,
              backgroundColor: "#2a2a2a",
              paddingVertical: 7,
              paddingHorizontal: 12,
            }}
          >
            <Users size={15} color="white" />
            <Text style={{ color: "white", fontWeight: "700" }}>
              友達 {recipients.length}人
            </Text>
          </View>
          <Text style={{ color: "#bfbfbf", fontSize: 12 }}>
            1回だけ閲覧 · 24時間で終了
          </Text>
        </View>
      </View>
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={{ color: C.pink, marginBottom: 14 }}
        >
          {error}
        </Text>
      )}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "800",
          color: "white",
          marginBottom: 8,
        }}
      >
        届いた写真・シェアした写真
      </Text>
      {active.map((item) => {
        const own = item.authorId === "me";
        const author = profiles.find((p) => p.id === item.authorId);
        const viewed = !own && seen.includes(item.id);
        const status = own ? "あなたがシェア" : viewed ? "閲覧済み" : "未閲覧";
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${own ? "あなた" : (author?.name ?? "友達")}のインスタント、${status}`}
            onPress={() => router.push(`/instant/${item.id}`)}
            style={{
              minHeight: 56,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderBottomWidth: 1,
              borderBottomColor: C.line,
            }}
          >
            {author ? (
              <Avatar uri={author.avatar} size={38} />
            ) : (
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "#262626",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ImageIcon size={19} color={C.purple} />
              </View>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                numberOfLines={1}
                style={{ color: "white", fontSize: 14, fontWeight: "700" }}
              >
                {own ? "あなたのインスタント" : (author?.name ?? "友達")}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.muted, !own && !viewed && { color: "white" }]}
              >
                {status}
              </Text>
            </View>
            <ChevronRight size={16} color={C.muted} />
          </Pressable>
        );
      })}
      {!active.length && (
        <Empty
          mascot="camera"
          title="インスタントはまだありません"
          body="シェアした写真と、友達から届いた写真がここに並びます。"
        />
      )}
    </DetailScreen>
  );
}
