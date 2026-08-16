// 代表として1つの SVG から型を借りる。Astro が SVG を読み込むと
// 「コンポーネント兼 ImageMetadata」になり、その型に名前が付いていないため
import type chestIcon from "../assets/map-items/chest.svg";

/** Astro が読み込んだ線画アイコン */
export type MapItemIcon = typeof chestIcon;

/** アイテム種別の定義 */
export type MapItemType = {
  /** 配置ファイルの item に書く識別子 */
  id: string;
  /** 画像の alt などに使う表示名 */
  label: string;
  icon: MapItemIcon;
  /** 線画の内側を塗る色。省略すると塗らない */
  fillColor?: string;
  /** アイコンの短辺の表示サイズ(px)。省略すると既定の大きさになる */
  iconShortSide?: number;
};

/** 地図に置く1つのアイテム。座標は地図画像の原寸を基準としたピクセル値 */
export type MapItem = {
  itemType: MapItemType;
  x: number;
  y: number;
};

/**
 * アイテムの配置パターン。
 * パターンはタイプをまたいで重複しないため、パターンを選べば地図のタイプも決まる。
 */
export type MapItemPattern = {
  /** セレクタに出す名前。拠点内で一意で、表示の出し分けの鍵にもなる */
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
