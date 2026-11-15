import { anonymousAllowed } from "../src/lib/activity";
import { imageSource } from "../src/data/images";
import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, LockKeyhole, UserRound, X } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, C, Chip, DetailScreen, styles } from "../src/components/ui";
import { Field } from "../src/components/forms";
import { postSchema } from "../src/lib/domain";
import { useAppStore } from "../src/store/useAppStore";
import { Post } from "../src/data/types";
export default function CreatePost() {
  const {
    communityId,
    kind: initialKind,
    anonymous: anonymousParam,
  } = useLocalSearchParams<{
    communityId?: string;
    kind?: string;
    anonymous?: string;
  }>();
  const staff = useAppStore((s) => s.role === "teacher");
  const [kind, setKind] = useState<Post["kind"]>(
      staff && initialKind === "school"
        ? "school"
        : initialKind === "board"
          ? "board"
          : "student",
    ),
    [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [category, setCategory] = useState("募集"),
    [tags, setTags] = useState(""),
    [image, setImage] = useState<string>(),
    [audience, setAudience] = useState<Post["audience"]>("school"),
    [capacity, setCapacity] = useState(""),
    [deadline, setDeadline] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [anonymous, setAnonymous] = useState(anonymousParam === "1");
  const [secret, setSecret] = useState(false);
  const add = useAppStore((s) => s.addPost);
  const pick = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!res.canceled) setImage(res.assets[0].uri);
    } catch {
      setError(
        "画像を選択できませんでした。写真へのアクセス許可をご確認ください。",
      );
    }
  };
  const submit = () => {
    if (busy) return;
    const notice = staff && kind === "school";
    const parsed = postSchema.safeParse({
      kind: notice ? "board" : kind,
      title,
      body,
      category: notice ? "学校連絡" : kind === "student" ? "投稿" : category,
      audience,
      capacity:
        kind === "board" && category === "募集" && capacity
          ? Number(capacity)
          : undefined,
      deadline:
        kind === "board" && category === "募集" && deadline
          ? deadline
          : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (
      !staff &&
      kind === "student" &&
      anonymous &&
      !anonymousAllowed(body + " " + tags)
    ) {
      setError("相手を傷つける表現が含まれています。言葉を変えてください。");
      return;
    }
    setBusy(true);
    add({
      ...parsed.data,
      kind,
      secret: !staff && secret,
      anonymous: !staff && kind === "student" && anonymous,
      id: `post-${Date.now()}`,
      authorId: "me",
      title: kind === "student" ? "" : title.trim(),
      image,
      tags: tags
        .split(/[,、]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8),
      time: "たった今",
      likes: 0,
      commentCount: 0,
      communityId,
    });
    if (communityId)
      router.replace({
        pathname: "/community/[id]",
        params: { id: communityId, tab: "notes" },
      });
    else if (notice) router.replace("/notifications");
    else
      router.replace({
        pathname: "/",
        params: {
          feed: !staff && kind === "student" && anonymous ? "anonymous" : kind,
          feedKey: Date.now().toString(),
        },
      });
  };
  return (
    <DetailScreen title={communityId ? "コミュニティに投稿" : "新しい投稿"}>
      <View className="flex-row" style={{ gap: 8, marginBottom: 24 }}>
        {(staff && !communityId
          ? (["student", "board", "school"] as const)
          : (["student", "board"] as const)
        ).map((t) => (
          <Chip
            key={t}
            label={
              t === "student" ? "投稿" : t === "board" ? "掲示板" : "学校連絡"
            }
            active={kind === t}
            onPress={() => setKind(t)}
          />
        ))}
      </View>
      {kind !== "student" && (
        <>
          <Field
            label="タイトル"
            value={title}
            onChange={setTitle}
            placeholder="ひと目で内容がわかるタイトル"
            maxLength={80}
          />
          {kind === "board" && (
            <>
              <Text
                style={[
                  styles.text,
                  { fontWeight: "700", fontSize: 12, marginBottom: 9 },
                ]}
              >
                カテゴリ
              </Text>
              <View
                className="flex-row flex-wrap"
                style={{ gap: 6, marginBottom: 20 }}
              >
                {["募集", "質問", "落とし物", "イベント", "勉強", "部活"].map(
                  (c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={category === c}
                      onPress={() => setCategory(c)}
                    />
                  ),
                )}
              </View>
            </>
          )}
        </>
      )}
      <Field
        label="本文"
        value={body}
        onChange={setBody}
        placeholder="今日のできごと、誰かへの質問、仲間の募集…"
        multiline
        maxLength={2000}
      />
      {image ? (
        <View style={{ marginBottom: 18 }}>
          <Image
            source={imageSource(image)}
            style={{ width: "100%", height: 180, borderRadius: 14 }}
          />
          <Pressable
            accessibilityLabel="画像を削除"
            onPress={() => setImage(undefined)}
            style={{
              position: "absolute",
              right: 10,
              top: 10,
              backgroundColor: "white",
              borderRadius: 20,
              padding: 8,
            }}
          >
            <X size={20} color={C.ink} />
          </Pressable>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={pick}
          style={{
            padding: 20,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: "#CFCFCF",
            borderRadius: 15,
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            backgroundColor: "#EFEFEF",
          }}
        >
          <ImagePlus size={25} color={C.purple} />
          <Text style={{ color: C.purple, fontSize: 12 }}>写真を追加</Text>
        </Pressable>
      )}
      <Field
        label="興味タグ（任意）"
        value={tags}
        onChange={setTags}
        placeholder="イラスト、音楽、文化祭"
        maxLength={100}
      />
      {kind === "board" && category === "募集" && (
        <>
          <Field
            label="募集人数（任意・1〜100人）"
            value={capacity}
            onChange={setCapacity}
            keyboard="number-pad"
            placeholder="5"
          />
          <Field
            label="締切（任意）"
            value={deadline}
            onChange={setDeadline}
            placeholder="2027-05-01"
          />
        </>
      )}
      {!staff && (
        <>
          <Text
            style={[
              styles.text,
              { fontSize: 12, fontWeight: "700", marginBottom: 9 },
            ]}
          >
            公開範囲
          </Text>
          <View className="flex-row" style={{ gap: 7, marginBottom: 22 }}>
            {(["school", "grade", "class"] as const).map((a, i) => (
              <Chip
                key={a}
                label={["学校全体", "同じ学年", "同じクラス"][i]}
                active={audience === a}
                onPress={() => setAudience(a)}
              />
            ))}
          </View>
          <View
            style={[styles.card, { paddingHorizontal: 14, marginBottom: 20 }]}
          >
            {kind === "student" && (
              <ModeRow
                label="匿名で投稿"
                value={anonymous}
                onChange={setAnonymous}
                icon={UserRound}
                detail="表示名を隠します。相手を傷つける表現は投稿できません。"
              />
            )}
            <View
              style={
                kind === "student"
                  ? { borderTopWidth: 1, borderColor: C.line }
                  : undefined
              }
            >
              <ModeRow
                label="シークレットモード"
                value={secret}
                onChange={setSecret}
                icon={LockKeyhole}
                detail="選んだ公開範囲のうち、承認済みの友達だけに表示します。"
              />
            </View>
          </View>
        </>
      )}
      {error && (
        <Text
          accessibilityRole="alert"
          style={{ color: "#656565", fontSize: 12, marginBottom: 14 }}
        >
          {error}
        </Text>
      )}
      <Button onPress={submit} disabled={busy}>
        投稿する
      </Button>
    </DetailScreen>
  );
}
function ModeRow({
  label,
  value,
  onChange,
  icon: Icon,
  detail,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon: typeof LockKeyhole;
  detail: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
      }}
    >
      <Icon size={19} color={value ? C.purple : C.muted} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, color: C.ink, fontWeight: "700" }}>
          {label}
        </Text>
        <Text style={[styles.muted, { marginTop: 3 }]}>{detail}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#DCDCDC", true: C.purple }}
      />
    </View>
  );
}
