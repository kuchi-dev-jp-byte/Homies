import { ImageSource } from "expo-image";

const bundled: Record<string, number> = {
  "header:akari": require("../../assets/images/headers/akari.jpg"),
  "header:asahi": require("../../assets/images/headers/asahi.jpg"),
  "header:haruka": require("../../assets/images/headers/haruka.jpg"),
  "header:haruto": require("../../assets/images/headers/haruto.jpg"),
  "header:hina": require("../../assets/images/headers/hina.jpg"),
  "header:itsuki": require("../../assets/images/headers/itsuki.jpg"),
  "header:kanna": require("../../assets/images/headers/kanna.jpg"),
  "header:koharu": require("../../assets/images/headers/koharu.jpg"),
  "header:me": require("../../assets/images/headers/me.jpg"),
  "header:mei": require("../../assets/images/headers/mei.jpg"),
  "header:mio": require("../../assets/images/headers/mio.jpg"),
  "header:nanami": require("../../assets/images/headers/nanami.jpg"),
  "header:naoki": require("../../assets/images/headers/naoki.jpg"),
  "header:ren": require("../../assets/images/headers/ren.jpg"),
  "header:riko": require("../../assets/images/headers/riko.jpg"),
  "header:ryo": require("../../assets/images/headers/ryo.jpg"),
  "header:saki": require("../../assets/images/headers/saki.jpg"),
  "header:shun": require("../../assets/images/headers/shun.jpg"),
  "header:sota": require("../../assets/images/headers/sota.jpg"),
  "header:takumi": require("../../assets/images/headers/takumi.jpg"),
  "header:tanaka": require("../../assets/images/headers/tanaka.jpg"),
  "header:yui": require("../../assets/images/headers/yui.jpg"),
  "header:yuto": require("../../assets/images/headers/yuto.jpg"),
  "avatar:akari": require("../../assets/images/avatars/akari.jpg"),
  "avatar:asahi": require("../../assets/images/avatars/asahi.jpg"),
  "avatar:haruto": require("../../assets/images/avatars/haruto.jpg"),
  "avatar:hina": require("../../assets/images/avatars/hina.jpg"),
  "avatar:itsuki": require("../../assets/images/avatars/itsuki.jpg"),
  "avatar:kanna": require("../../assets/images/avatars/kanna.jpg"),
  "avatar:koharu": require("../../assets/images/avatars/koharu.jpg"),
  "avatar:mei": require("../../assets/images/avatars/mei.jpg"),
  "avatar:nanami": require("../../assets/images/avatars/nanami.jpg"),
  "avatar:naoki": require("../../assets/images/avatars/naoki.jpg"),
  "avatar:ren": require("../../assets/images/avatars/ren.jpg"),
  "avatar:riko": require("../../assets/images/avatars/riko.jpg"),
  "avatar:ryo": require("../../assets/images/avatars/ryo.jpg"),
  "avatar:saki": require("../../assets/images/avatars/saki.jpg"),
  "avatar:shun": require("../../assets/images/avatars/shun.jpg"),
  "avatar:takumi": require("../../assets/images/avatars/takumi.jpg"),
  "avatar:tanaka": require("../../assets/images/avatars/tanaka.jpg"),
  "photo-1455390582262-044cdead277a": require("../../assets/images/photo-1455390582262-044cdead277a.jpg"),
  "photo-1511795409834-ef04bbd61622": require("../../assets/images/photo-1511795409834-ef04bbd61622.jpg"),
  "photo-1524250502761-1ac6f2e30d43": require("../../assets/images/photo-1524250502761-1ac6f2e30d43.jpg"),
  "photo-1472396961693-142e6e269027": require("../../assets/images/photo-1472396961693-142e6e269027.jpg"),
  "photo-1524504388940-b1c1722653e1": require("../../assets/images/photo-1524504388940-b1c1722653e1.jpg"),
  "photo-1500648767791-00dcc994a43e": require("../../assets/images/photo-1500648767791-00dcc994a43e.jpg"),
  "photo-1506794778202-cad84cf45f1d": require("../../assets/images/photo-1506794778202-cad84cf45f1d.jpg"),
  "photo-1534528741775-53994a69daeb": require("../../assets/images/photo-1534528741775-53994a69daeb.jpg"),
  "photo-1513364776144-60967b0f800f": require("../../assets/images/photo-1513364776144-60967b0f800f.jpg"),
  "photo-1520903920243-00d872a2d1c9": require("../../assets/images/photo-1520903920243-00d872a2d1c9.jpg"),
  "photo-1510915361894-db8b60106cb1": require("../../assets/images/photo-1510915361894-db8b60106cb1.jpg"),
};

/** Bundled demo photos work offline; picked photos retain their local URI. */
export function imageSource(uri: string): ImageSource | number {
  const key = /^(avatar|header):/.test(uri)
    ? uri
    : uri.match(/photo-[^?]+/)?.[0];
  return key && bundled[key] ? bundled[key] : { uri };
}
