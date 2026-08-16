import type {
  MapFloor,
  MapLocation,
  MapType,
} from "../../types/nightreign-map";

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

/** slugから拠点を引く。定義が無い場合は原因が分かるようにエラーにする */
export function findMapLocation(
  locations: readonly MapLocation[],
  slug: string,
): MapLocation {
  const location = locations.find((candidate) => candidate.slug === slug);
  if (location === undefined) {
    throw new Error(`拠点「${slug}」が地図の定義に見つかりません`);
  }
  return location;
}
