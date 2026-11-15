import { test } from "node:test";
import assert from "node:assert/strict";
import {
  dayKey,
  hasPostedToday,
  dailyAllowance,
  anonymousAllowed,
  activeUntil,
  trends,
} from "../src/lib/activity";
import { initialPosts } from "../src/data/mock";
const now = new Date("2026-11-10T15:01:00Z");
const mine = {
  ...initialPosts[0],
  authorId: "me",
  kind: "student" as const,
  createdAt: "2026-11-10T15:00:00Z",
  tags: ["音楽", "音楽"],
  body: "#音楽 #ゲーム",
};
test("daily gates use Japan midnight and cannot unlock with yesterday or another author", () => {
  assert.equal(dayKey(now), "2026-11-11");
  assert.equal(hasPostedToday([mine], now), true);
  assert.equal(
    hasPostedToday([{ ...mine, createdAt: "2026-11-10T14:59:00Z" }], now),
    false,
  );
  assert.equal(hasPostedToday([{ ...mine, authorId: "mio" }], now), false);
  assert.equal(dailyAllowance([], 3, now), 0);
  assert.equal(dailyAllowance([mine], 3, now), 17);
  assert.equal(dailyAllowance([mine], 25, now), 0);
});
test("anonymous filter rejects normalized and separated prohibited expressions", () => {
  for (const text of ["バ カ", "ｼﾈ", "死ね", "f u c k", "う\u200bざい"])
    assert.equal(anonymousAllowed(text), false, text);
  assert.equal(anonymousAllowed("今日の音楽の授業が楽しかった！"), true);
});
test("notes and instants expire at 24 hours", () => {
  assert.equal(activeUntil("2026-11-09T15:02:00Z", now), true);
  assert.equal(activeUntil("2026-11-09T15:01:00Z", now), false);
});
test("trends deduplicate tags per post, exclude anonymous and compare weeks", () => {
  const result = trends(
    [
      mine,
      { ...mine, id: "y", anonymous: true },
      {
        ...mine,
        id: "old",
        createdAt: "2026-11-02T15:00:00Z",
        tags: ["音楽"],
        body: "",
      },
    ],
    now,
  );
  assert.equal(result.find((r) => r.tag === "音楽")?.current, 1);
  assert.equal(result.find((r) => r.tag === "音楽")?.previous, 1);
  assert.equal(result.find((r) => r.tag === "ゲーム")?.current, 1);
});

test("secret posts never enter public trend counts", () => {
  assert.deepEqual(trends([{ ...mine, secret: true }], now), []);
});
