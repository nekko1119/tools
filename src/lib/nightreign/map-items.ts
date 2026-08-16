import type { MapLocation } from "../../types/nightreign-map";
import type {
  MapItem,
  MapItemPattern,
  MapItemPlacement,
  MapItemType,
} from "../../types/nightreign-map-item";
import { readOptionalDataYaml } from "./data-file";

/** プロジェクトルートからの配置ファイル置き場の相対パス */
const PLACEMENT_DIR = "data/map-items";

const EMPTY_PLACEMENT: MapItemPlacement = { patterns: [] };

function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${context}は「キー: 値」の形で書いてください`);
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown, context: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${context}は「- 」で始まる一覧で書いてください`);
  }
  return value;
}

function parseCoordinate(
  value: unknown,
  axis: "x" | "y",
  limit: number,
  context: string,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${context}の ${axis} には数値を書いてください`);
  }
  if (value < 0 || value > limit) {
    throw new Error(
      `${context}の ${axis} が地図の範囲(0〜${limit})を超えています: ${value}`,
    );
  }
  return value;
}

function parseItem(
  source: unknown,
  itemTypes: readonly MapItemType[],
  width: number,
  height: number,
  context: string,
): MapItem {
  const record = asRecord(source, context);
  const typeId = record.item;
  if (typeof typeId !== "string") {
    throw new Error(`${context}に item を書いてください`);
  }
  const itemType = itemTypes.find((candidate) => candidate.id === typeId);
  if (itemType === undefined) {
    throw new Error(
      `${context}の item「${typeId}」は定義されていません。使えるのは ${itemTypes.map((t) => t.id).join(" / ")} です`,
    );
  }
  return {
    itemType,
    x: parseCoordinate(record.x, "x", width, context),
    y: parseCoordinate(record.y, "y", height, context),
  };
}

function parsePattern(
  source: unknown,
  location: MapLocation,
  itemTypes: readonly MapItemType[],
  context: string,
): MapItemPattern {
  const record = asRecord(source, context);

  const name = record.name;
  if (typeof name !== "string" || name.length === 0) {
    throw new Error(`${context}に name を書いてください`);
  }

  const mapTypeId = record.type;
  if (typeof mapTypeId !== "string") {
    throw new Error(`${context}に type を書いてください`);
  }
  const mapType = location.types.find(
    (candidate) => candidate.id === mapTypeId,
  );
  if (mapType === undefined) {
    throw new Error(
      `${context}の type「${mapTypeId}」は地図に定義されていません。定義されているのは ${location.types.map((t) => t.id).join(" / ")} です`,
    );
  }

  const floors = asRecord(record.floors ?? {}, `${context}の floors`);
  const itemsByFloorId: Record<string, readonly MapItem[]> = {};
  for (const [floorId, rawItems] of Object.entries(floors)) {
    const floor = mapType.floors.find((candidate) => candidate.id === floorId);
    if (floor === undefined) {
      throw new Error(
        `${context}の階層「${floorId}」はタイプ「${mapTypeId}」に定義されていません。定義されているのは ${mapType.floors.map((f) => f.id).join(" / ")} です`,
      );
    }
    const { width, height } = floor.images.dark;
    itemsByFloorId[floorId] = asArray(
      rawItems,
      `${context}の階層「${floorId}」`,
    ).map((rawItem, index) =>
      parseItem(
        rawItem,
        itemTypes,
        width,
        height,
        `${context}の階層「${floorId}」の${index + 1}件目`,
      ),
    );
  }

  return { name, mapTypeId, itemsByFloorId };
}

/**
 * 配置ファイルの内容を検証しながら読み解く。
 * 手で編集するファイルなので、誤りはビルド時に落として原因が分かるようにする。
 */
export function parseMapItemPlacement(
  source: unknown,
  location: MapLocation,
  itemTypes: readonly MapItemType[],
  sourceName: string,
): MapItemPlacement {
  const root = asRecord(source, `${sourceName} の内容`);
  const patterns = asArray(
    root.patterns ?? [],
    `${sourceName} の patterns`,
  ).map((rawPattern, index) =>
    parsePattern(
      rawPattern,
      location,
      itemTypes,
      `${sourceName} の${index + 1}件目のパターン`,
    ),
  );

  // 名前でパターンを選び分けるため、重複していると区別できない
  const seenNames = new Set<string>();
  for (const pattern of patterns) {
    if (seenNames.has(pattern.name)) {
      throw new Error(
        `${sourceName} のパターン名「${pattern.name}」が重複しています`,
      );
    }
    seenNames.add(pattern.name);
  }

  return { patterns };
}

/**
 * 拠点のアイテム配置を読み込む。
 * 配置ファイルがまだ無い拠点は、アイテムを持たないものとして扱う。
 */
export function loadMapItemPlacement(
  location: MapLocation,
  itemTypes: readonly MapItemType[],
): MapItemPlacement {
  const relativePath = `${PLACEMENT_DIR}/${location.slug}.yaml`;
  const parsed = readOptionalDataYaml(relativePath);
  if (parsed === null || parsed === undefined) {
    return EMPTY_PLACEMENT;
  }
  return parseMapItemPlacement(parsed, location, itemTypes, relativePath);
}
