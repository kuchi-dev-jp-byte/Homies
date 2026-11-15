import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Camera, LockKeyhole, X } from "lucide-react-native";
import { Avatar, Button, C, DetailScreen, styles } from "../src/components/ui";
import { Field } from "../src/components/forms";
import { useAppStore } from "../src/store/useAppStore";
import { profileSchema } from "../src/lib/domain";
import { imageSource } from "../src/data/images";
import { InterestPicker } from "../src/components/InterestPicker";
import { useCurrentProfile } from "../src/lib/hooks";
export default function EditProfile() {
  const me = useCurrentProfile(),
    update = useAppStore((s) => s.updateProfile);
  const [gender, setGender] = useState(me.gender ?? "unspecified"),
    [banner, setBanner] = useState(me.banner);
  const [name, setName] = useState(me.name),
    [bio, setBio] = useState(me.bio),
    [skills, setSkills] = useState(me.skills),
    [wishes, setWishes] = useState(me.wishes),
    [tags, setTags] = useState(me.interests),
    [avatar, setAvatar] = useState(me.avatar),
    [error, setError] = useState("");
  const [editingTags, setEditingTags] = useState(false);
  const pick = async (target: "avatar" | "banner" = "avatar") => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: target === "banner" ? [3, 1] : [1, 1],
        quality: 0.8,
      });
      if (!r.canceled) {
        if (target === "banner") setBanner(r.assets[0].uri);
        else setAvatar(r.assets[0].uri);
      }
    } catch {
      setError("画像へのアクセス許可をご確認ください。");
    }
  };
  const save = () => {
    const parsed = profileSchema.safeParse({ name, bio, skills, wishes });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    update({
      ...parsed.data,
      avatar,
      banner,
      gender,
      interests: tags,
    });
    if (router.canGoBack()) router.back();
    else router.replace("/mypage");
  };
  return (
    <DetailScreen title="プロフィールを編集">
      <View style={{ marginBottom: 18 }}>
        <View
          style={{
            aspectRatio: 3,
            backgroundColor: "#DADADA",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="カバー画像を変更"
            onPress={() => pick("banner")}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            {!!banner && (
              <Image
                source={imageSource(banner)}
                contentFit="cover"
                style={{ position: "absolute", width: "100%", height: "100%" }}
              />
            )}
            <View
              style={{
                backgroundColor: "#252525CC",
                padding: 10,
                borderRadius: 22,
              }}
            >
              <Camera size={20} color="white" />
            </View>
          </Pressable>
          {!!banner && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="カバー画像を削除"
              onPress={() => setBanner(null)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "#252525CC",
                padding: 8,
                borderRadius: 20,
              }}
              hitSlop={5}
            >
              <X size={16} color="white" />
            </Pressable>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="プロフィール写真を変更"
          onPress={() => pick("avatar")}
          style={{
            alignSelf: "flex-start",
            marginTop: -27,
            marginLeft: 12,
            borderWidth: 4,
            borderColor: C.bg,
            borderRadius: 50,
          }}
        >
          <Avatar uri={avatar} size={75} />
          <View
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              backgroundColor: C.purple,
              padding: 6,
              borderRadius: 16,
            }}
          >
            <Camera size={14} color="white" />
          </View>
        </Pressable>
      </View>
      <Field label="名前" value={name} onChange={setName} maxLength={20} />
      <Text style={[styles.muted, { marginBottom: 20 }]}>
        所属：{`高${me.grade}・${me.classroom}組`}（所属確認後に設定する項目）
      </Text>
      <Field
        label="自己紹介"
        value={bio}
        onChange={setBio}
        multiline
        maxLength={250}
      />
      <View style={{ marginBottom: 18 }}>
        <Button secondary onPress={() => setEditingTags(true)}>
          趣味・興味タグを選ぶ（{tags.length}件）
        </Button>
        {!!tags.length && (
          <Text style={[styles.muted, { marginTop: 8 }]}>
            {tags.map((tag) => tag.label).join("、")}
          </Text>
        )}
      </View>
      <Modal
        visible={editingTags}
        animationType="slide"
        onRequestClose={() => setEditingTags(false)}
      >
        {editingTags && (
          <InterestPicker
            initial={tags}
            onCancel={() => setEditingTags(false)}
            onSave={(selection) => {
              update({ interests: selection });
              setTags(selection);
              setEditingTags(false);
            }}
          />
        )}
      </Modal>
      <Field
        label="得意なこと"
        value={skills}
        onChange={setSkills}
        maxLength={100}
      />
      <Field
        label="やりたいこと"
        value={wishes}
        onChange={setWishes}
        maxLength={100}
      />
      <View style={[styles.card, { padding: 14, marginBottom: 18 }]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginBottom: 5,
          }}
        >
          <LockKeyhole size={15} color={C.muted} />
          <Text style={{ color: C.ink, fontWeight: "700", fontSize: 13 }}>
            性別（任意）
          </Text>
        </View>
        <Text style={styles.muted}>
          性別は公開されず、トレンドの男女別集計に自動で反映されます。
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 10,
          }}
        >
          {(
            [
              ["unspecified", "設定しない"],
              ["male", "男子"],
              ["female", "女子"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              small
              secondary={gender !== id}
              onPress={() => setGender(id)}
            >
              {label}
            </Button>
          ))}
        </View>
      </View>
      {error && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: C.pink, marginBottom: 15 }}
        >
          {error}
        </Text>
      )}
      <View>
        <Button onPress={save}>変更を保存</Button>
      </View>
    </DetailScreen>
  );
}
