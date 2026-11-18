import { Image } from "expo-image";
import type { ImageSource } from "expo-image";
import { stickerLabels, type StickerId } from "../data/stickers";

const artwork: Record<StickerId, ImageSource | number> = {
  crown: require("../../assets/images/mascot/crown.png"),
  brand: require("../../assets/images/mascot/brand.png"),
  sleep: require("../../assets/images/mascot/sleep.png"),
  music: require("../../assets/images/mascot/music.png"),
  heart: require("../../assets/images/mascot/heart.png"),
  game: require("../../assets/images/mascot/game.png"),
  gift: require("../../assets/images/mascot/gift.png"),
  skate: require("../../assets/images/mascot/skate.png"),
  study: require("../../assets/images/mascot/study.png"),
  camera: require("../../assets/images/mascot/camera.png"),
  tired: require("../../assets/images/mascot/tired.png"),
  cool: require("../../assets/images/mascot/cool.png"),
  fav: require("../../assets/images/mascot/fav.png"),
  ok: require("../../assets/images/mascot/ok.png"),
  omg: require("../../assets/images/mascot/omg.png"),
  hearts: require("../../assets/images/mascot/hearts.png"),
};

export function Mascot({
  id,
  size,
  asMessage = false,
}: {
  id: StickerId;
  size: number;
  asMessage?: boolean;
}) {
  return (
    <Image
      source={artwork[id]}
      accessible={asMessage}
      accessibilityLabel={
        asMessage ? `スタンプ：${stickerLabels[id]}` : undefined
      }
      contentFit="contain"
      style={{ width: size, height: size * 0.79 }}
    />
  );
}
