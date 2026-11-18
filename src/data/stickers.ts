export const stickerLabels = {
  crown: "王冠",
  brand: "Homies",
  sleep: "おやすみ",
  music: "音楽",
  heart: "ハートをどうぞ",
  game: "ゲーム",
  gift: "プレゼント",
  skate: "スケート",
  study: "作業中",
  camera: "写真",
  tired: "ひと休み",
  cool: "クール",
  fav: "お気に入り",
  ok: "OK！",
  omg: "びっくり",
  hearts: "ダブルハート",
} as const;

export type StickerId = keyof typeof stickerLabels;

export function stickerCaption(id: StickerId) {
  return `スタンプ：${stickerLabels[id]}`;
}
