import { Comment } from "./types";
export const sampleComments: Comment[] = [
  {
    id: "c1",
    postId: "guitar",
    authorId: "haruka",
    body: "初心者でも見学に行って大丈夫ですか？",
  },
  {
    id: "c2",
    postId: "guitar",
    authorId: "sota",
    body: "もちろん！楽器も貸せるので手ぶらで来てね 🎸",
  },
  {
    id: "c3",
    postId: "guitar",
    authorId: "mio",
    body: "私も見学してみたいです！",
  },
  {
    id: "c4",
    postId: "study",
    authorId: "yui",
    body: "参加したいです！二次関数を教えてほしいです。",
  },
  {
    id: "c5",
    postId: "study",
    authorId: "yuto",
    body: "16時に図書館で集まりましょう！",
  },
  {
    id: "c6",
    postId: "lost",
    authorId: "haruka",
    body: "図書館の受付に届いているかもしれません。確認してみて！",
  },
  {
    id: "c7",
    postId: "festival",
    authorId: "mio",
    body: "ポスター担当で参加したいです 🎨",
  },
  {
    id: "c8",
    postId: "festival",
    authorId: "haruka",
    body: "ありがとう！コミュニティでも相談しよう。",
  },
];
export const directThreads = [
  {
    id: "mio",
    note: "文化祭のラフ描いてる 🎨",
    preview: "明日、美術室で会おう！",
    time: "16:20",
  },
  {
    id: "haruka",
    note: "おすすめの曲教えて 🎧",
    preview: "その曲、私も好き！",
    time: "15:42",
  },
  {
    id: "yuto",
    note: "放課後は図書館 📚",
    preview: "ノートありがとう！助かった",
    time: "昨日",
  },
];

export function chatThreads(friends: string[]) {
  return friends.map(
    (id) =>
      directThreads.find((t) => t.id === id) ?? {
        id,
        note: "",
        preview: "友達になりました。挨拶してみよう！",
        time: "",
      },
  );
}
