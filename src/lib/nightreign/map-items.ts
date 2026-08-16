import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import type { MapLocation, MapType } from "../../types/nightreign-map";
import type {
  MapItem,
  MapItemPattern,
  MapItemPlacement,
} from "../../types/nightreign-map-item";

/** プロジェクトルートからの配置ファイル置き場の相対パス */
const PLACEMENT_DIR = "data/map-items";

const EMPTY_PLACEMENT: MapItemPlacement = { patternsByTypeId: {} };

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
  itemTypeIds: readonly string[],
  width: number,
  height: number,
  context: string,
): MapItem {
  const record = asRecord(source, context);
  const typeId = record.item;
  if (typeof typeId !== "string") {
    throw new Error(`${context}に item を書いてください`);
  }
  if (!itemTypeIds.includes(typeId)) {
    throw new Error(
      `${context}の item「${typeId}」は定義されていません。使えるのは ${itemTypeIds.join(" / ")} です`,
    );
  }
  return {
    typeId,
    x: parseCoordinate(record.x, "x", width, context),
    y: parseCoordinate(record.y, "y", height, context),
  };
}

function parsePattern(
  source: unknown,
  mapType: MapType,
  itemTypeIds: readonly string[],
  context: string,
): MapItemPattern {
  const record = asRecord(source, context);
  const name = record.name;
  if (typeof name !== "string" || name.length === 0) {
    throw new Error(`${context}に name を書いてください`);
  }

  const floors = asRecord(record.floors ?? {}, `${context}の floors`);
  const itemsByFloorId: Record<string, readonly MapItem[]> = {};
  for (const [floorId, rawItems] of Object.entries(floors)) {
    const floor = mapType.floors.find((candidate) => candidate.id === floorId);
    if (floor === undefined) {
      throw new Error(
        `${context}の階層「${floorId}」は地図に定義されていません。定義されているのは ${mapType.floors.map((f) => f.id).join(" / ")} です`,
      );
    }
    const { width, height } = floor.images.dark;
    itemsByFloorId[floorId] = asArray(
      rawItems,
      `${context}の階層「${floorId}」`,
    ).map((rawItem, index) =>
      parseItem(
        rawItem,
        itemTypeIds,
        width,
        height,
        `${context}の階層「${floorId}」の${index + 1}件目`,
      ),
    );
  }

  return { name, itemsByFloorId };
}

/**
 * 配置ファイルの内容を検証しながら読み解く。
 * 手で編集するファイルなので、誤りはビルド時に落として原因が分かるようにする。
 */
export function parseMapItemPlacement(
  source: unknown,
  location: MapLocation,
  itemTypeIds: readonly string[],
  sourceName: string,
): MapItemPlacement {
  const root = asRecord(source, `${sourceName} の内容`);
  const types = asRecord(root.types ?? {}, `${sourceName} の types`);

  const patternsByTypeId: Record<string, readonly MapItemPattern[]> = {};
  for (const [typeId, rawPatterns] of Object.entries(types)) {
    const mapType = location.types.find((candidate) => candidate.id === typeId);
    if (mapType === undefined) {
      throw new Error(
        `${sourceName} のタイプ「${typeId}」は地図に定義されていません。定義されているのは ${location.types.map((t) => t.id).join(" / ")} です`,
      );
    }
    patternsByTypeId[typeId] = asArray(
      rawPatterns,
      `${sourceName} のタイプ「${typeId}」`,
    ).map((rawPattern, index) =>
      parsePattern(
        rawPattern,
        mapType,
        itemTypeIds,
        `${sourceName} のタイプ「${typeId}」の${index + 1}件目の配置`,
      ),
    );
  }

  return { patternsByTypeId };
}

/**
 * 拠点のアイテム配置を読み込む。
 * 配置ファイルがまだ無い拠点は、アイテムを持たないものとして扱う。
 */
export function loadMapItemPlacement(
  location: MapLocation,
  itemTypeIds: readonly string[],
): MapItemPlacement {
  const relativePath = `${PLACEMENT_DIR}/${location.slug}.yaml`;
  const filePath = resolve(process.cwd(), relativePath);
  if (!existsSync(filePath)) {
    return EMPTY_PLACEMENT;
  }

  let yamlText: string;
  try {
    yamlText = readFileSync(filePath, "utf-8");
  } catch (cause) {
    throw new Error(`配置ファイルを読み込めません: ${relativePath}`, { cause });
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(yamlText);
  } catch (cause) {
    throw new Error(`配置ファイルの書式が不正です: ${relativePath}`, { cause });
  }
  if (parsed === null || parsed === undefined) {
    return EMPTY_PLACEMENT;
  }

  return parseMapItemPlacement(parsed, location, itemTypeIds, relativePath);
}
