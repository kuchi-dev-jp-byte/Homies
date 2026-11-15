import { test } from "node:test";
import assert from "node:assert/strict";
import { isMutualInterest, matchedProfiles } from "../src/lib/matching";
import { profiles } from "../src/data/mock";
test("one-sided interest never matches; either arrival order becomes mutual", () => {
  assert.equal(isMutualInterest("mio", { mio: "interested" }, [], []), false);
  assert.equal(isMutualInterest("mio", {}, ["mio"], []), false);
  assert.equal(
    isMutualInterest("mio", { mio: "interested" }, ["mio"], []),
    true,
  );
});
test("revocation, skip, block and self are excluded from matches", () => {
  assert.equal(isMutualInterest("mio", { mio: "skipped" }, ["mio"], []), false);
  assert.equal(isMutualInterest("mio", { mio: "interested" }, [], []), false);
  assert.equal(
    isMutualInterest("mio", { mio: "interested" }, ["mio"], ["mio"]),
    false,
  );
  assert.equal(isMutualInterest("me", { me: "interested" }, ["me"], []), false);
});
test("matched list uses mutual actions only and ignores unknown IDs", () => {
  assert.deepEqual(
    matchedProfiles(
      profiles,
      { mio: "interested", haruka: "interested", unknown: "interested" },
      ["mio", "unknown"],
      [],
    ).map((p) => p.id),
    ["mio"],
  );
});
