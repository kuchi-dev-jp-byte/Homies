export type Card = { rank: number; suit: "♠" | "♥" | "♦" | "♣" };
export type CardGame = {
  deck: Card[];
  player: Card[];
  dealer: Card[];
  status: "playing" | "win" | "lose" | "draw";
};
export function handValue(cards: Card[]) {
  let total = cards.reduce((v, c) => v + Math.min(c.rank, 10), 0);
  if (cards.some((c) => c.rank === 1) && total + 10 <= 21) total += 10;
  return total;
}
export function newGame(random = Math.random): CardGame {
  const deck: Card[] = [];
  for (const suit of ["♠", "♥", "♦", "♣"] as const)
    for (let rank = 1; rank <= 13; rank++) deck.push({ rank, suit });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return {
    player: deck.splice(0, 2),
    dealer: deck.splice(0, 2),
    deck,
    status: "playing",
  };
}
export function hit(game: CardGame): CardGame {
  if (game.status !== "playing" || !game.deck.length) return game;
  const player = [...game.player, game.deck[0]];
  return {
    ...game,
    player,
    deck: game.deck.slice(1),
    status: handValue(player) > 21 ? "lose" : "playing",
  };
}
export function stand(game: CardGame): CardGame {
  if (game.status !== "playing") return game;
  const deck = [...game.deck],
    dealer = [...game.dealer];
  while (handValue(dealer) < 17 && deck.length) dealer.push(deck.shift()!);
  const a = handValue(game.player),
    b = handValue(dealer);
  return {
    ...game,
    dealer,
    deck,
    status:
      a > 21 ? "lose" : b > 21 || a > b ? "win" : a === b ? "draw" : "lose",
  };
}
export function gamePoints(game: CardGame) {
  return game.status === "win" ? 100 : game.status === "draw" ? 30 : 0;
}
