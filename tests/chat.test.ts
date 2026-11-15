import { test } from "node:test";
import assert from "node:assert/strict";
import { validatedMessage, roomMessages } from "../src/lib/chat";
import { initialChatMessages } from "../src/data/chat";

test("only joined, existing rooms accept messages, including after leaving", () => {
  assert.equal(
    validatedMessage("art", "  こんにちは  ", ["art"]),
    "こんにちは",
  );
  assert.equal(validatedMessage("art", "こんにちは", []), null);
  assert.equal(validatedMessage("missing", "こんにちは", ["missing"]), null);
});
test("empty and oversized chat messages are rejected", () => {
  assert.equal(validatedMessage("art", " \n ", ["art"]), null);
  assert.equal(validatedMessage("art", "あ".repeat(1001), ["art"]), null);
  assert.equal(
    validatedMessage("art", "あ".repeat(1000), ["art"])?.length,
    1000,
  );
});
test("room histories stay isolated and omit blocked authors", () => {
  const history = roomMessages(initialChatMessages, "art", ["mio"]);
  assert.ok(history.length > 0);
  assert.ok(
    history.every((m) => m.communityId === "art" && m.authorId !== "mio"),
  );
  assert.equal(roomMessages(initialChatMessages, "missing", []).length, 0);
});
