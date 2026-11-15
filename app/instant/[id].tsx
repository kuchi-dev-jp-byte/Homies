import { imageSource } from "../../src/data/images";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform, Text, View } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Eye, ShieldCheck } from "lucide-react-native";
import * as Capture from "expo-screen-capture";
import {
  Button,
  C,
  DetailScreen,
  Empty,
  styles,
} from "../../src/components/ui";
import { useAppStore } from "../../src/store/useAppStore";
import { activeUntil } from "../../src/lib/activity";
import { useNow } from "../../src/lib/useNow";
export default function Instant() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const items = useAppStore((s) => s.instants),
    seen = useAppStore((s) => s.viewedInstants),
    view = useAppStore((s) => s.viewInstant),
    item = items.find((i) => i.id === id),
    now = useNow();
  const friends = useAppStore((s) => s.friends);
  const blocked = useAppStore((s) => s.blocked);
  const permitted =
    item &&
    (item.authorId === "me" ||
      (friends.includes(item.authorId) && !blocked.includes(item.authorId)));
  const [ready, setReady] = useState(false),
    [opened, setOpened] = useState(false),
    [remaining, setRemaining] = useState(10),
    [error, setError] = useState(""),
    claimed = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      const protectionKey = `instant-${id}-${Date.now()}-${Math.random()}`;
      if (Platform.OS !== "web") {
        void (async () => {
          try {
            if (!(await Capture.isAvailableAsync()))
              throw new Error("unsupported");
            await Capture.preventScreenCaptureAsync(protectionKey);
            if (alive) setReady(true);
            else await Capture.allowScreenCaptureAsync(protectionKey);
          } catch {
            if (alive)
              setError(
                "この端末では閲覧保護を有効にできません。写真は表示しません。",
              );
          }
        })();
      }
      return () => {
        alive = false;
        setReady(false);
        setOpened(false);
        claimed.current = false;
        if (Platform.OS !== "web")
          void Capture.allowScreenCaptureAsync(protectionKey).catch(() => {});
      };
    }, [id]),
  );
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") setOpened(false);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!opened) return;
    const end = Date.now() + 10000;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setOpened(false);
    }, 250);
    return () => clearInterval(timer);
  }, [opened]);
  if (!item || !permitted)
    return (
      <DetailScreen title="インスタント">
        <Empty
          title="写真を表示できません"
          body="公開中のインスタントを一覧から選択してください。"
        />
      </DetailScreen>
    );
  if (!activeUntil(item.createdAt, now))
    return (
      <DetailScreen title="インスタント">
        <Empty
          title="公開が終了しました"
          body="インスタントは24時間で表示されなくなります。"
        />
      </DetailScreen>
    );
  const consumed =
    item.authorId !== "me" && seen.includes(id) && !claimed.current;
  return (
    <DetailScreen title="インスタント">
      {Platform.OS === "web" ? (
        <Empty
          title="アプリで閲覧してください"
          body="Webではスクリーンショットを防止できないため、写真の表示を停止しています。"
        />
      ) : error ? (
        <Text style={styles.text}>{error}</Text>
      ) : !ready ? (
        <Text style={styles.muted}>閲覧保護を準備しています…</Text>
      ) : opened ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ShieldCheck size={18} color={C.purple} />
            <Text style={{ color: C.purple, fontWeight: "700" }}>
              残り {remaining}秒
            </Text>
          </View>
          <Image
            source={imageSource(item.uri)}
            contentFit="contain"
            style={{
              width: "100%",
              aspectRatio: 4 / 5,
              backgroundColor: "#242424",
              borderRadius: 20,
              marginTop: 10,
            }}
          />
          {item.caption && (
            <Text style={[styles.text, { marginTop: 10 }]}>{item.caption}</Text>
          )}
        </>
      ) : consumed || claimed.current ? (
        <Empty
          title="閲覧が終了しました"
          body="このインスタントは再表示できません。"
        />
      ) : (
        <View style={[styles.card, { gap: 12, padding: 18 }]}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: "#ECECEC",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Eye size={22} color={C.purple} />
          </View>
          <Text style={{ color: C.ink, fontSize: 17, fontWeight: "800" }}>
            10秒間だけ表示されます
          </Text>
          <Text style={styles.muted}>
            スクリーンショットと画面収録の防止が有効です。
          </Text>
          <Button
            onPress={() => {
              claimed.current = true;
              view(id);
              setRemaining(10);
              setOpened(true);
            }}
          >
            写真を開く
          </Button>
        </View>
      )}
    </DetailScreen>
  );
}
