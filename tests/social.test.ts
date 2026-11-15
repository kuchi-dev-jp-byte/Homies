import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SocialState,
  requestFriend,
  acceptFriend,
  matchedSocial,
} from "../src/lib/social";
const initial: SocialState = {
  friends: [],
  sentRequests: [],
  receivedRequests: [],
  socialEvents: [],
  unreadMatches: [],
};
test("request does not grant chat membership until acceptance", () => {
  const sent = { ...initial, ...requestFriend(initial, "yui") };
  assert.deepEqual(sent.friends, []);
  assert.deepEqual(sent.sentRequests, ["yui"]);
  assert.deepEqual(requestFriend(sent, "yui"), {});
  assert.deepEqual(acceptFriend(sent, "yui"), {});
  const accepted = {
    ...sent,
    ...acceptFriend({ ...sent, receivedRequests: ["yui"] }, "yui"),
  };
  assert.deepEqual(accepted.friends, ["yui"]);
  assert.deepEqual(accepted.sentRequests, []);
  assert.equal(accepted.socialEvents[0].type, "accepted");
});
test("crossing requests accept once and matching creates one friend plus unread badge", () => {
  const received = { ...initial, receivedRequests: ["sota"] };
  const accepted = { ...received, ...requestFriend(received, "sota") };
  assert.deepEqual(accepted.friends, ["sota"]);
  const matched = { ...accepted, ...matchedSocial(accepted, "sota") };
  assert.deepEqual(matched.friends, ["sota"]);
  assert.deepEqual(matched.unreadMatches, ["sota"]);
  assert.equal(matched.socialEvents[0].type, "match");
});
