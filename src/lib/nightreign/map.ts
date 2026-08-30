import type { MapFloor, MapType } from "../../types/nightreign-map";
import type { MapItemType } from "../../types/nightreign-map-item";

/**
 * タイプを定義する。floors のidから初期表示階層の候補を導き、
 * defaultFloor に存在しない階層を書いた場合は型エラーにする。
 */
export function defineMapType<const TFloors extends readonly MapFloor[]>(type: {
  id: string;
  floors: TFloors;
  defaultFloor: TFloors[number]["id"];
}): MapType {
  return type;
}

/**
 * 拠点で使うアイテム種別を識別子で選ぶ。
 * 定義に無い識別子を書いた場合は型エラーにする。
 *
 * 並びは指定した順ではなく定義順に揃える。
 * 拠点ごとに凡例の並びが変わらないようにするため。
 */
export function selectMapItemTypes<
  const TItemTypes extends readonly MapItemType[],
>(
  itemTypes: TItemTypes,
  ids: readonly TItemTypes[number]["id"][],
): readonly MapItemType[] {
  const selected = new Set<string>(ids);
  return itemTypes.filter((itemType) => selected.has(itemType.id));
}
