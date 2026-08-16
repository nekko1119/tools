import corpseIcon from "../assets/map-items/corpse.jpg";
import type { MapItemType } from "../types/nightreign-map-item";

/** 通常の宝箱。実際は茶色だが暗い地図の上で沈むため黄みのオレンジにする */
const COMMON_CHEST_COLOR = "#e0a83c";

/** レアな宝箱。石造りの見た目に寄せた灰色 */
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
    label: "レアな宝箱",
    appearance: { kind: "chest", fillColor: RARE_CHEST_COLOR },
  },
  {
    id: "corpse",
    label: "死体",
    appearance: { kind: "photo", image: corpseIcon },
  },
];
