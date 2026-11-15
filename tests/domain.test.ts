import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compatibility,
  postSchema,
  profileSchema,
  visibleTo,
} from "../src/lib/domain";
import { profiles, initialPosts } from "../src/data/mock";
test("matching is deterministic and exact shared tags increase the score", () => {
  const result = compatibility(profiles[0], profiles[3]);
  assert.equal(result.common.length, 3);
  assert.equal(result.score, 88);
  assert.deepEqual(result, compatibility(profiles[0], profiles[3]));
  assert.ok(result.score > compatibility(profiles[0], profiles[2]).score);
});
test("class and grade scopes cannot leak to other classes or grades in demo feed", () => {
  const p = { ...initialPosts[2], audience: "class" as const };
  assert.equal(visibleTo(p, profiles[0], profiles[2]), false);
  assert.equal(visibleTo(p, profiles[0], profiles[3]), true);
  assert.equal(
    visibleTo({ ...p, audience: "grade" }, profiles[0], profiles[1]),
    true,
  );
  assert.equal(visibleTo(p, profiles[0]), false);
});
test("student cannot create school announcements and board requires title", () => {
  const base = {
    kind: "student",
    title: "",
    body: "hello",
    category: "生徒投稿",
    audience: "school",
  };
  assert.equal(postSchema.safeParse(base).success, true);
  assert.equal(
    postSchema.safeParse({ ...base, kind: "school" }).success,
    false,
  );
  assert.equal(postSchema.safeParse({ ...base, kind: "board" }).success, false);
  assert.equal(postSchema.safeParse({ ...base, body: "   " }).success, false);
});
test("recruiting validates actual date and capacity", () => {
  const base = {
    kind: "board",
    title: "募集",
    body: "一緒に勉強",
    category: "募集",
    audience: "school",
  };
  assert.equal(
    postSchema.safeParse({ ...base, deadline: "2027-02-30" }).success,
    false,
  );
  assert.equal(
    postSchema.safeParse({ ...base, deadline: "2027-02-28", capacity: 5 })
      .success,
    true,
  );
  assert.equal(postSchema.safeParse({ ...base, capacity: 0 }).success, false);
  assert.equal(postSchema.safeParse({ ...base, capacity: 1.5 }).success, false);
});
test("empty profile name is invalid", () => {
  assert.equal(
    profileSchema.safeParse({ name: "  ", bio: "", skills: "", wishes: "" })
      .success,
    false,
  );
});
