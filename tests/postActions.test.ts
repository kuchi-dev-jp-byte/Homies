import { test } from "node:test";
import assert from "node:assert/strict";
import { initialPosts } from "../src/data/mock";
import { deleteOwnedPost, withoutDeletedPosts } from "../src/lib/postActions";

const own = { ...initialPosts[0], id: "own", authorId: "me", anonymous: true };
const other = { ...initialPosts[0], id: "other", authorId: "mio" };
const teacher = { ...initialPosts[0], id: "notice", authorId: "teacher" };
const state = {
  posts: [own, other, teacher],
  deletedPostIds: [],
  comments: [{ id: "reply", postId: "own", authorId: "mio", body: "返信" }],
  liked: ["own", "other"],
  saved: ["own"],
  staffSaved: ["own"],
  applications: ["own"],
};

test("deleting an owned anonymous post removes related state without changing other posts", () => {
  const result = deleteOwnedPost(state, "own", "me")!;
  assert.deepEqual(result.posts, [other, teacher]);
  assert.deepEqual(result.deletedPostIds, ["own"]);
  assert.deepEqual(result.comments, []);
  assert.deepEqual(result.liked, ["other"]);
  assert.deepEqual(result.saved, []);
  assert.deepEqual(result.staffSaved, []);
  assert.deepEqual(result.applications, []);
  assert.equal(state.posts.length, 3);
});

test("only the active author can delete, including teacher accounts", () => {
  assert.equal(deleteOwnedPost(state, "other", "me"), undefined);
  assert.equal(deleteOwnedPost(state, "missing", "me"), undefined);
  assert.equal(deleteOwnedPost(state, "own", "teacher"), undefined);
  assert.deepEqual(
    deleteOwnedPost(state, "notice", "teacher")?.deletedPostIds,
    ["notice"],
  );
});

test("deleted sample posts do not return when storage merges the initial data", () => {
  const result = deleteOwnedPost(state, "own", "me")!;
  const hydrated = withoutDeletedPosts(
    [...result.posts, own],
    result.deletedPostIds,
  );
  assert.deepEqual(hydrated, [other, teacher]);
  assert.deepEqual(withoutDeletedPosts(state.posts, []), state.posts);
});
