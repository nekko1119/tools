import chestIcon from "../assets/map-items/chest.svg";
import corpseIcon from "../assets/map-items/corpse.svg";
import sacredSealIcon from "../assets/map-items/sacred_seal.svg";
import type { MapItemType } from "../types/nightreign-map-item";

/** 石造りの見た目に寄せた灰色。レア宝箱と聖印で使う */
const STONE_COLOR = "#b9bec6";

/**
 * 地図に置けるアイテムの種別。
 * ここの id を data/map-items/<拠点>.yaml の item に書く。
 * アイコンの色は地図の明暗が反転しても見えるよう、明るい塗りで揃える。
 */
export const nightreignMapItemTypes = [
  {
    id: "common_chest",
    label: "宝箱",
    icon: chestIcon,
    // 実際は茶色だが、暗い地図の上で沈むため視認性を優先して黄みのオレンジにする
    fillColor: "#e0a83c",
  },
  {
    id: "rare_chest",
    label: "レア宝箱",
    icon: chestIcon,
    fillColor: STONE_COLOR,
  },
  {
    id: "corpse",
    label: "遺体",
    icon: corpseIcon,
    fillColor: "#00ff00",
    // 円だけの単純な形なので、宝箱より小さくても見分けられる
    iconShortSide: 16,
  },
  {
    id: "sacred_seal",
    label: "聖印",
    icon: sacredSealIcon,
    fillColor: STONE_COLOR,
  },
] as const satisfies readonly MapItemType[];
