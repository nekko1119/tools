import type { ImageMetadata } from "astro";

/**
 * アイコンの見せ方。
 * 宝箱は共通の線画を塗り分け、それ以外は写真をそのまま出す。
 */
export type MapItemAppearance =
  | { kind: "photo"; image: ImageMetadata }
  | { kind: "chest"; fillColor: string };

/** アイテム種別の定義 */
export type MapItemType = {
  /** 配置ファイルの item に書く識別子 */
  id: string;
  /** 画像の alt などに使う表示名 */
  label: string;
  appearance: MapItemAppearance;
};

/** 地図に置く1つのアイテム。座標は地図画像の原寸を基準としたピクセル値 */
export type MapItem = {
  typeId: string;
  x: number;
  y: number;
};

/** 1つの配置パターン。階層idからその階層に置くアイテムを引く */
export type MapItemPattern = {
  name: string;
  itemsByFloorId: Record<string, readonly MapItem[]>;
};

/** 拠点1つ分のアイテム配置。地図のタイプidから配置パターンの一覧を引く */
export type MapItemPlacement = {
  patternsByTypeId: Record<string, readonly MapItemPattern[]>;
};
