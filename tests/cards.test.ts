import { test } from "node:test";
import assert from "node:assert/strict";
import { newGame, handValue, stand, hit, CardGame } from "../src/lib/cards";
test("52 unique cards are dealt without replacement", () => {
  const game = newGame(() => 0.5),
    cards = [...game.deck, ...game.player, ...game.dealer];
  assert.equal(cards.length, 52);
  assert.equal(new Set(cards.map((c) => c.suit + c.rank)).size, 52);
});
test("aces choose 1 or 11 correctly", () => {
  assert.equal(
    handValue([
      { rank: 1, suit: "♠" },
      { rank: 1, suit: "♥" },
      { rank: 9, suit: "♣" },
    ]),
    21,
  );
  assert.equal(
    handValue([
      { rank: 1, suit: "♠" },
      { rank: 13, suit: "♥" },
      { rank: 10, suit: "♣" },
    ]),
    21,
  );
});
test("dealer draws to 17 and finished rounds cannot be played again", () => {
  const game: CardGame = {
    player: [
      { rank: 10, suit: "♠" },
      { rank: 10, suit: "♥" },
    ],
    dealer: [
      { rank: 10, suit: "♣" },
      { rank: 6, suit: "♦" },
    ],
    deck: [{ rank: 3, suit: "♠" }],
    status: "playing",
  };
  const done = stand(game);
  assert.equal(done.status, "win");
  assert.equal(handValue(done.dealer), 19);
  assert.equal(stand(done), done);
  assert.equal(hit(done), done);
  assert.equal(
    hit({
      ...game,
      player: [
        { rank: 10, suit: "♠" },
        { rank: 10, suit: "♥" },
      ],
      deck: [{ rank: 5, suit: "♠" }],
    }).status,
    "lose",
  );
});
