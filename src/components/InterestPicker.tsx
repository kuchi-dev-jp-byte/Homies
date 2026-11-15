import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Button, C, styles } from "./ui";
import { Field } from "./forms";
import { useAppStore } from "../store/useAppStore";
import type { Interest, InterestKind } from "../data/types";

const groups: {
  name: string;
  icon: string;
  kind: InterestKind;
  tags: string;
}[] = [
  {
    name: "音楽",
    icon: "🎸",
    kind: "music",
    tags: "弾き語り|作曲・編曲|ギター|ベース|ドラム|ピアノ|吹奏楽|合唱|カラオケ|DJ|DTM|J-POP|K-POP|ロック|ジャズ|クラシック|ヒップホップ|テクノ|音楽フェス|Mrs. GREEN APPLE|YOASOBI|ボカロ",
  },
  {
    name: "ゲーム",
    icon: "🎮",
    kind: "game",
    tags: "VALORANT|Minecraft|スプラトゥーン|フォートナイト|原神|ポケモン|音ゲー|格闘ゲーム|RPG|パズルゲーム|ボードゲーム|カードゲーム|TRPG|ゲーム制作",
  },
  {
    name: "アート・ものづくり",
    icon: "🎨",
    kind: "art",
    tags: "イラスト|デザイン|水彩画|油絵|漫画制作|デジタルアート|写真|動画編集|アニメ制作|3Dモデリング|裁縫|編み物|陶芸|工作",
  },
  {
    name: "勉強・テクノロジー",
    icon: "📚",
    kind: "study",
    tags: "数学|物理|化学|生物|英語|韓国語|歴史|地理|天文学|プログラミング|Web制作|電子工作|ロボット|資格勉強",
  },
  {
    name: "スポーツ・アウトドア",
    icon: "🏀",
    kind: "club",
    tags: "バスケ|サッカー|野球|バレー|テニス|卓球|バドミントン|水泳|陸上|ダンス|柔道|剣道|登山|キャンプ|サイクリング",
  },
  {
    name: "映画・アニメ・読書",
    icon: "🎬",
    kind: "other",
    tags: "映画鑑賞|海外ドラマ|邦画|アニメ|漫画|小説|ミステリー|SF|ライトノベル|詩|舞台鑑賞",
  },
  {
    name: "暮らし・おでかけ",
    icon: "☕",
    kind: "other",
    tags: "カフェ巡り|料理|お菓子作り|食べ歩き|ファッション|メイク|旅行|散歩|鉄道|動物|ガーデニング",
  },
];

export const interestKey = (label: string) =>
  label.normalize("NFKC").trim().toLowerCase();

export function InterestPicker({
  initial,
  filterOptions,
  onCancel,
  onSave,
}: {
  initial: Interest[];
  filterOptions?: Interest[];
  onCancel: () => void;
  onSave: (tags: Interest[]) => void;
}) {
  const catalog = useAppStore((s) => s.customInterests);
  const addInterest = useAppStore((s) => s.addCustomInterest);
  const [selected, setSelected] = useState(initial);
  const [open, setOpen] = useState<string[]>([groups[0].name]);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [groupName, setGroupName] = useState("暮らし・おでかけ");
  const [error, setError] = useState("");
  const term = interestKey(query).replace(/^#/, "");
  const builtIn = groups.flatMap((group) =>
    group.tags.split("|").map((label) => ({ label, kind: group.kind })),
  );
  const extras = [
    ...new Map(
      [...catalog, ...initial, ...(filterOptions ?? [])]
        .filter(
          (tag) =>
            !builtIn.some(
              (item) => interestKey(item.label) === interestKey(tag.label),
            ),
        )
        .map((tag) => [interestKey(tag.label), tag]),
    ).values(),
  ];
  const pick = (tag: Interest) => {
    const exists = selected.some(
      (item) => interestKey(item.label) === interestKey(tag.label),
    );
    if (!exists && selected.length >= 12) {
      setError("選べるタグは12件までです。");
      return;
    }
    setError("");
    setSelected(
      exists
        ? selected.filter(
            (item) => interestKey(item.label) !== interestKey(tag.label),
          )
        : [...selected, tag],
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={{ flex: 1, width: "100%", maxWidth: 540, alignSelf: "center" }}
      >
        <Text
          style={{
            fontSize: 19,
            fontWeight: "800",
            textAlign: "center",
            padding: 16,
          }}
        >
          趣味・興味タグ
        </Text>
        <View style={{ paddingHorizontal: 20 }}>
          <Field
            label="タグを検索"
            value={query}
            onChange={setQuery}
            placeholder="音楽、ゲーム、タグ名など"
          />
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          {groups.map((group, index) => {
            const options = [
              ...group.tags
                .split("|")
                .map((label) => ({ label, kind: group.kind })),
              ...extras.filter(
                (tag) =>
                  groups.findIndex((item) => item.kind === tag.kind) === index,
              ),
            ].filter(
              (tag) =>
                interestKey(group.name).includes(term) ||
                interestKey(tag.label).includes(term),
            );
            if (!options.length) return null;
            const expanded = !!term || open.includes(group.name);
            return (
              <View
                key={group.name}
                style={{ borderTopWidth: 1, borderColor: C.line }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  disabled={!!term}
                  onPress={() =>
                    setOpen(
                      expanded
                        ? open.filter((name) => name !== group.name)
                        : [...open, group.name],
                    )
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 17,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "800" }}>
                    {group.icon} {group.name}
                  </Text>
                  {expanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </Pressable>
                {expanded && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      paddingBottom: 18,
                    }}
                  >
                    {options.map((tag) => {
                      const active = selected.some(
                        (item) =>
                          interestKey(item.label) === interestKey(tag.label),
                      );
                      return (
                        <Pressable
                          key={tag.label}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          onPress={() => pick(tag)}
                          style={{
                            borderWidth: 1,
                            borderRadius: 22,
                            borderColor: active ? C.tagInk : C.line,
                            backgroundColor: active ? C.tagBg : C.bg,
                            paddingHorizontal: 13,
                            paddingVertical: 9,
                          }}
                        >
                          <Text
                            style={{
                              color: active ? C.tagInk : C.ink,
                              fontWeight: "600",
                            }}
                          >
                            #{tag.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
          {filterOptions ? null : adding ? (
            <>
              <Field
                label="新しいタグ"
                value={label}
                onChange={setLabel}
                maxLength={40}
              />
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                {groups
                  .filter((group) => group.name !== "映画・アニメ・読書")
                  .map((group) => (
                    <Button
                      key={group.name}
                      small
                      secondary={groupName !== group.name}
                      onPress={() => setGroupName(group.name)}
                    >
                      {group.name}
                    </Button>
                  ))}
              </View>
              <Button
                onPress={() => {
                  const name = label
                    .trim()
                    .replace(/^[#＃]+/, "")
                    .trim();
                  if (!name) return setError("タグ名を入力してください。");
                  const existing = [...builtIn, ...extras].find(
                    (tag) => interestKey(tag.label) === interestKey(name),
                  );
                  const kind =
                    groups.find((group) => group.name === groupName)?.kind ??
                    "other";
                  const tag = existing ?? { label: name, kind };
                  if (!existing) addInterest(tag);
                  if (
                    !selected.some(
                      (item) => interestKey(item.label) === interestKey(name),
                    )
                  )
                    pick(tag);
                  setOpen(
                    groups
                      .filter((group) => group.kind === tag.kind)
                      .map((group) => group.name),
                  );
                  setQuery("");
                  setLabel("");
                  setAdding(false);
                }}
              >
                タグを追加
              </Button>
            </>
          ) : (
            <Button
              secondary
              onPress={() => {
                setError("");
                setAdding(true);
              }}
            >
              ＋ 新しいタグを追加
            </Button>
          )}
        </ScrollView>
        <View
          style={{
            borderTopWidth: 1,
            borderColor: C.line,
            padding: 16,
            gap: 9,
          }}
        >
          <Text style={styles.muted}>
            選択中 {selected.length}/12
            {filterOptions
              ? " · 選んだタグをすべて持つ候補を表示"
              : " · 選んだタグはプロフィールに表示されます"}
          </Text>
          {!!error && (
            <Text accessibilityLiveRegion="polite" style={{ color: C.pink }}>
              {error}
            </Text>
          )}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button secondary onPress={onCancel}>
              戻る
            </Button>
            <View style={{ flex: 1 }}>
              <Button onPress={() => onSave(selected)}>
                {filterOptions ? "絞り込む" : "タグを保存"}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
