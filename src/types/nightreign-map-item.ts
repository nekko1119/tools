/**
 * アイコンの見せ方。
 * 宝箱は共通の線画を塗り分けて使い、それ以外は種別ごとの線画を使う。
 */
export type MapItemAppearance =
  { kind: "chest"; fillColor: string } | { kind: "corpse" };

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
