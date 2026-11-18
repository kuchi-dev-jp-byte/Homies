import { extractHashtags } from "./hashtags";
import { Post } from "../data/types";
export function dayKey(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function hasPostedToday(posts: Post[], now = new Date()) {
  return posts.some(
    (p) =>
      p.authorId === "me" &&
      p.kind !== "school" &&
      p.createdAt &&
      dayKey(new Date(p.createdAt)) === dayKey(now),
  );
}
export function dailyAllowance(posts: Post[], used: number, now = new Date()) {
  return Math.max(0, (hasPostedToday(posts, now) ? 20 : 3) - used);
}
export function anonymousAllowed(text: string) {
  const normalized = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{Cf}]/gu, "")
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
  return (
    text.trim().length > 0 &&
    ![
      "死ね",
      "しね",
      "きえろ",
      "消えろ",
      "ばか",
      "バカ",
      "あほ",
      "きもい",
      "きも",
      "うざい",
      "くず",
      "ごみ",
      "殺す",
      "ころす",
      "fuck",
      "bitch",
      "idiot",
    ].some((w) => normalized.includes(w.toLowerCase()))
  );
}
export function activeUntil(createdAt: string, now = new Date()) {
  return new Date(createdAt).getTime() + 24 * 60 * 60 * 1000 > now.getTime();
}
export function trends(posts: Post[], now = new Date()) {
  const counts = new Map<string, { current: number; previous: number }>();
  for (const post of posts) {
    if (
      !post.createdAt ||
      post.anonymous ||
      post.secret ||
      post.kind === "school"
    )
      continue;
    const age = now.getTime() - new Date(post.createdAt).getTime();
    if (age < 0 || age > 14 * 86400000) continue;
    const tags = [
      ...post.tags,
      ...extractHashtags(`${post.title} ${post.body}`),
    ];
    for (const tag of new Set(tags.map((t) => t.trim()).filter(Boolean))) {
      const entry = counts.get(tag) ?? { current: 0, previous: 0 };
      if (age < 7 * 86400000) entry.current++;
      else entry.previous++;
      counts.set(tag, entry);
    }
  }
  return [...counts]
    .map(([tag, v]) => ({ tag, ...v, growth: v.current - v.previous }))
    .filter((v) => v.current > 0)
    .sort(
      (a, b) =>
        b.current - a.current ||
        b.growth - a.growth ||
        a.tag.localeCompare(b.tag),
    );
}
