import { Text, View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  C,
  DetailScreen,
  Empty,
  SectionTitle,
  styles,
} from "../src/components/ui";
import { useAppStore } from "../src/store/useAppStore";
import { dayKey, hasPostedToday } from "../src/lib/activity";
import { Card, handValue } from "../src/lib/cards";
import { useNow } from "../src/lib/useNow";
function Hand({ cards, hide = false }: { cards: Card[]; hide?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 7,
        marginVertical: 12,
      }}
    >
      {cards.map((c, i) => (
        <View
          key={i}
          style={{
            width: 49,
            height: 69,
            borderRadius: 9,
            backgroundColor: hide && i === 1 ? C.purple : "white",
            borderWidth: 1,
            borderColor: "#DCDCDC",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: c.suit === "♥" || c.suit === "♦" ? "#757575" : C.ink,
              fontSize: 20,
              fontWeight: "700",
            }}
          >
            {hide && i === 1
              ? ""
              : `${["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"][c.rank]}${c.suit}`}
          </Text>
        </View>
      ))}
    </View>
  );
}
export function DisabledCards() {
  return (
    <DetailScreen title="現在ご利用いただけません">
      <Empty title="この機能は休止中です" body="再公開までお待ちください。" />
    </DetailScreen>
  );
}
export default DisabledCards;
export function Cards() {
  const game = useAppStore((s) => s.cardGame),
    start = useAppStore((s) => s.startCardGame),
    play = useAppStore((s) => s.playCard),
    scores = useAppStore((s) => s.cardScores),
    me = useAppStore((s) => s.me),
    posts = useAppStore((s) => s.posts),
    role = useAppStore((s) => s.role),
    now = useNow();
  const unlocked = role !== "student" || hasPostedToday(posts, now);
  const ranking = [
    { name: me.name, score: scores[dayKey(now)] ?? 0 },
    { name: "みお（サンプル）", score: 200 },
    { name: "ゆうと（サンプル）", score: 130 },
    { name: "はるか（サンプル）", score: 100 },
  ].sort((a, b) => b.score - a.score);
  return (
    <DetailScreen title="放課後トランプ">
      {!unlocked ? (
        <Empty
          title="今日の投稿でトランプを開こう"
          body="毎日1回投稿すると、その日は何度でも遊べます。"
          action="投稿する"
          onPress={() => router.push("/create")}
        />
      ) : (
        <>
          <Text style={styles.title}>ブラックジャック</Text>
          <Text style={[styles.muted, { marginVertical: 15 }]}>
            21に近づけよう。Aは1または11、絵札は10。ディーラーは17まで引きます。勝利100点・引き分け30点。お金や景品のやり取りはありません。
          </Text>
          {game ? (
            <View style={[styles.card, { padding: 18, marginBottom: 18 }]}>
              <Text style={styles.text}>
                ディーラー{" "}
                {game.status === "playing" ? "" : handValue(game.dealer)}
              </Text>
              <Hand cards={game.dealer} hide={game.status === "playing"} />
              <Text style={styles.text}>あなた · {handValue(game.player)}</Text>
              <Hand cards={game.player} />
              {game.status === "playing" ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button onPress={() => play("hit")}>もう1枚</Button>
                  <Button secondary onPress={() => play("stand")}>
                    勝負する
                  </Button>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  <Text
                    style={{ color: C.purple, fontWeight: "800", fontSize: 20 }}
                  >
                    {game.status === "win"
                      ? "勝ち！ +100点"
                      : game.status === "draw"
                        ? "引き分け +30点"
                        : "次こそ！"}
                  </Text>
                  <Button onPress={start}>もう一度遊ぶ</Button>
                </View>
              )}
            </View>
          ) : (
            <Button onPress={start}>ゲームを始める</Button>
          )}
          <SectionTitle>今日のランキング</SectionTitle>
          <Text style={[styles.muted, { marginBottom: 12 }]}>
            自分の端末のスコアと架空のサンプル順位です。
          </Text>
          {ranking.map((r, i) => (
            <View
              key={r.name}
              style={[
                styles.card,
                { padding: 15, marginBottom: 8, flexDirection: "row", gap: 14 },
              ]}
            >
              <Text style={{ color: C.purple, fontWeight: "800" }}>
                {i + 1}
              </Text>
              <Text style={[styles.text, { flex: 1 }]}>{r.name}</Text>
              <Text style={styles.text}>{r.score}点</Text>
            </View>
          ))}
        </>
      )}
    </DetailScreen>
  );
}
