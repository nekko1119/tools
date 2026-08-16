import commonChestIcon from "../assets/map-items/common_chest.jpg";
import corpseIcon from "../assets/map-items/corpse.jpg";
import rareChestIcon from "../assets/map-items/rare_chest.jpg";
import type { MapItemType } from "../types/nightreign-map-item";

/**
 * 地図に置けるアイテムの種別。
 * ここの id を data/map-items/<拠点>.yaml の item に書く。
 */
export const nightreignMapItemTypes: readonly MapItemType[] = [
  { id: "common_chest", label: "宝箱", icon: commonChestIcon },
  { id: "rare_chest", label: "レアな宝箱", icon: rareChestIcon },
  { id: "corpse", label: "死体", icon: corpseIcon },
];
