import type { MapItemType } from "../types/nightreign-map-item";

/** 通常の宝箱。実際は茶色だが暗い地図の上で沈むため黄みのオレンジにする */
const COMMON_CHEST_COLOR = "#e0a83c";

/** レア宝箱。石造りの見た目に寄せた灰色 */
const RARE_CHEST_COLOR = "#b9bec6";

/**
 * 地図に置けるアイテムの種別。
 * ここの id を data/map-items/<拠点>.yaml の item に書く。
 */
export const nightreignMapItemTypes: readonly MapItemType[] = [
  {
    id: "common_chest",
    label: "宝箱",
    appearance: { kind: "chest", fillColor: COMMON_CHEST_COLOR },
  },
  {
    id: "rare_chest",
    label: "レア宝箱",
    appearance: { kind: "chest", fillColor: RARE_CHEST_COLOR },
  },
  {
    id: "corpse",
    label: "遺体",
    appearance: { kind: "corpse" },
    // 円だけの単純な形なので、宝箱より小さくても見分けられる
    iconShortSide: 8,
  },
  { id: "sacred_seal", label: "聖印", appearance: { kind: "sacred_seal" } },
];
