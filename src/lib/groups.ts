import type { StickerId } from "../data/stickers";
import type { Profile } from "../data/types";

export const trialDuration = 15 * 60 * 1000;
export const quickTopics = {
  雑談: { kind: "other", prompt: "最近、放課後にハマっていることは？" },
  ゲーム: { kind: "game", prompt: "みんなで遊ぶなら、どのゲームを選ぶ？" },
  音楽: { kind: "music", prompt: "今いちばん聴いている曲を教えて！" },
  アニメ: { kind: "art", prompt: "友達にすすめたい作品は？" },
  学校生活: { kind: "club", prompt: "学校で最近楽しみにしていることは？" },
  勉強: { kind: "study", prompt: "好きな教科や、おすすめの勉強法は？" },
  その他: { kind: "other", prompt: "最近、誰かに話したかったことは？" },
} as const;
export type QuickTopic = keyof typeof quickTopics;
export type GroupMessage = {
  stickerId?: StickerId;
  id: string;
  authorId: string;
  body: string;
  reaction?: string;
  createdAt?: string;
};
export type GroupChat = {
  icon?: string;
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  messages: GroupMessage[];
  trial?: {
    topic: QuickTopic;
    endsAt: number;
    extended?: boolean;
    votes: string[];
  };
};

export function demoQuickMembers(
  viewer: Profile,
  people: Profile[],
  blocked: string[],
  topic: QuickTopic,
) {
  const interests = new Set(viewer.interests.map((tag) => tag.label));
  const score = (person: Profile) =>
    person.interests.reduce(
      (total, tag) => total + Number(interests.has(tag.label)),
      0,
    ) +
    Number(
      person.interests.some((tag) =>
        topic === "アニメ"
          ? /アニメ|漫画/.test(tag.label)
          : tag.kind === quickTopics[topic].kind,
      ),
    );
  return people
    .filter(
      (person) =>
        !person.role &&
        person.id !== viewer.id &&
        !blocked.includes(person.id) &&
        Math.abs(person.grade - viewer.grade) <= 1,
    )
    .sort(
      (a, b) =>
        Math.abs(a.grade - viewer.grade) - Math.abs(b.grade - viewer.grade) ||
        score(b) - score(a),
    )
    .slice(0, 4);
}
