import type { ImageMetadata } from "astro";
import type { MapItemType } from "./nightreign-map-item";

/**
 * 1つの階層の地図画像。
 * TODO: ライトテーマ用の地図画像が用意できたら light を必須にし、
 * prefers-color-scheme で切り替える(現在はダークテーマ用のみ)
 */
export type MapImages = {
  dark: ImageMetadata;
  light?: ImageMetadata;
};

export type MapFloor = {
  /** 階層を識別する値。同一タイプ内で一意 */
  id: string;
  /** 画面に表示する階層名。例: "B1" */
  label: string;
  images: MapImages;
};

/** 同じ拠点に存在する地図のバリエーション */
export type MapType = {
  /** タイプを識別する値。タイプAなら "a" */
  id: string;
  /** 表示順に並べた階層。上層から下層の順 */
  floors: readonly MapFloor[];
  /** 初期表示する階層のid */
  defaultFloor: string;
};

/** ゲーム内の攻略拠点 */
export type MapLocation = {
  /** URLに使う識別子。例: "great-church" */
  slug: string;
  /** nightreign_translations.yaml のキーになる英名 */
  englishName: string;
  /**
   * この拠点に出るアイテム種別。凡例に並べるものであり、
   * 配置ファイルの item に書ける範囲でもある
   */
  itemTypes: readonly MapItemType[];
  types: readonly MapType[];
};
