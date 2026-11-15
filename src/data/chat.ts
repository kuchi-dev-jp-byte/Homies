import { ChatMessage } from "./types";

const conversations: Record<string, { authorId: string; body: string }[]> = {
  art: [
    { authorId: "haruka", body: "文化祭のポスター、どんな色にしよう？🎨" },
    { authorId: "mio", body: "ラベンダーと白の組み合わせかわいいと思う！" },
    {
      authorId: "haruka",
      body: "いいね！放課後、美術室でラフを描いてみよう。",
    },
    { authorId: "mio", body: "私も行くね。使っているペンも持っていきます ✏️" },
  ],
  code: [
    {
      authorId: "yuto",
      body: "はじめまして！ここでは作ったものや、わからないところを気軽にシェアしよう。",
    },
    {
      authorId: "yuto",
      body: "今日は自己紹介ページを作ってみました。みんなは何を作ってみたい？",
    },
  ],
  math: [
    {
      authorId: "yuto",
      body: "明日の放課後、図書館で数学の問題を一緒に解きませんか？",
    },
    { authorId: "yui", body: "参加したいです！二次関数を教えてほしい 📖" },
    { authorId: "yuto", body: "もちろん！16時に図書館の奥のテーブルで。" },
  ],
  games: [
    { authorId: "haruka", body: "みんな最近どんなゲームやってる？" },
    { authorId: "sota", body: "スプラトゥーン！チーム組めたら楽しそう 🎮" },
    { authorId: "yuto", body: "週末に一緒に遊びたい！初心者でも大丈夫？" },
  ],
  festival: [
    {
      authorId: "haruka",
      body: "文化祭のカフェ企画、アイデアをここで集めよう ☕",
    },
    {
      authorId: "sota",
      body: "BGMのプレイリスト作りたい！おすすめの曲教えて。",
    },
  ],
  movies: [
    { authorId: "yui", body: "最近観てよかった映画を教えてください 🎬" },
    {
      authorId: "mio",
      body: "アニメ映画を観たよ！色づかいがきれいで、また観たくなった。",
    },
  ],
};
export const initialChatMessages: ChatMessage[] = Object.entries(
  conversations,
).flatMap(([communityId, messages]) =>
  messages.map((message, index) => ({
    ...message,
    communityId,
    id: `seed-${communityId}-${index}`,
    createdAt: `2026-10-28T07:${String(10 + index * 3).padStart(2, "0")}:00.000Z`,
  })),
);
