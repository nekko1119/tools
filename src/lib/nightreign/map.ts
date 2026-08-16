import type { MapFloor, MapType } from "../../types/nightreign-map";

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

/** タイプの表示名。タイプが2つ以上ある拠点でのみ見出しとして使う */
export function formatMapTypeLabel(type: MapType): string {
  return `タイプ${type.id.toUpperCase()}`;
}
