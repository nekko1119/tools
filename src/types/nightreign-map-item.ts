/**
 * アイコンの見せ方。
 * 宝箱は共通の線画を塗り分けて使い、それ以外は種別ごとの線画を使う。
 */
export type MapItemAppearance =
  | { kind: "chest"; fillColor: string }
  | { kind: "corpse" }
  | { kind: "sacred_seal" };

/** アイテム種別の定義 */
export type MapItemType = {
  /** 配置ファイルの item に書く識別子 */
  id: string;
  /** 画像の alt などに使う表示名 */
  label: string;
  appearance: MapItemAppearance;
  /** アイコンの短辺の表示サイズ(px)。省略すると既定の大きさになる */
  iconShortSide?: number;
};

/** 地図に置く1つのアイテム。座標は地図画像の原寸を基準としたピクセル値 */
export type MapItem = {
  typeId: string;
  x: number;
  y: number;
};

/**
 * アイテムの配置パターン。
 * パターンはタイプをまたいで重複しないため、パターンを選べば地図のタイプも決まる。
 */
export type MapItemPattern = {
  /** セレクタに出す名前。拠点内で一意 */
  name: string;
  /** このパターンで表示する地図のタイプid */
  mapTypeId: string;
  /** 階層idからその階層に置くアイテムを引く */
  itemsByFloorId: Record<string, readonly MapItem[]>;
};

/** 拠点1つ分のアイテム配置。表示順に並べたパターンの一覧 */
export type MapItemPlacement = {
  patterns: readonly MapItemPattern[];
};
