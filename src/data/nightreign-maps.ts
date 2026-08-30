import greatChurchTypeADark1f from "../assets/maps/great-church/great_church_type_a_dark_1f.webp";
import greatChurchTypeADark2f from "../assets/maps/great-church/great_church_type_a_dark_2f.webp";
import greatChurchTypeADarkB1 from "../assets/maps/great-church/great_church_type_a_dark_b1.webp";
import greatChurchTypeALight1f from "../assets/maps/great-church/great_church_type_a_light_1f.webp";
import greatChurchTypeALight2f from "../assets/maps/great-church/great_church_type_a_light_2f.webp";
import greatChurchTypeALightB1 from "../assets/maps/great-church/great_church_type_a_light_b1.webp";
import greatChurchTypeBDark1f from "../assets/maps/great-church/great_church_type_b_dark_1f.webp";
import greatChurchTypeBDark2f from "../assets/maps/great-church/great_church_type_b_dark_2f.webp";
import greatChurchTypeBLight1f from "../assets/maps/great-church/great_church_type_b_light_1f.webp";
import greatChurchTypeBLight2f from "../assets/maps/great-church/great_church_type_b_light_2f.webp";
import ruinsTypeADark1f from "../assets/maps/ruins/ruins_type_a_dark_1f.webp";
import ruinsTypeADarkB1 from "../assets/maps/ruins/ruins_type_a_dark_b1.webp";
import ruinsTypeALight1f from "../assets/maps/ruins/ruins_type_a_light_1f.webp";
import ruinsTypeALightB1 from "../assets/maps/ruins/ruins_type_a_light_b1.webp";
import { defineMapType, selectMapItemTypes } from "../lib/nightreign/map";
import { nightreignMapItemTypes } from "./nightreign-map-item-types";
import type { MapLocation } from "../types/nightreign-map";

/**
 * 拠点地図の定義。拠点を追加するときはこの配列に足す。
 * 拠点名の日本語訳は data/nightreign_translations.yaml に englishName をキーとして定義する。
 */
export const nightreignMaps: readonly MapLocation[] = [
  {
    slug: "great-church",
    englishName: "Great Church",
    itemTypes: selectMapItemTypes(nightreignMapItemTypes, [
      "common_chest",
      "rare_chest",
      "corpse",
      "sacred_seal",
    ]),
    types: [
      defineMapType({
        id: "a",
        defaultFloor: "1f",
        floors: [
          {
            id: "2f",
            label: "2F",
            images: {
              dark: greatChurchTypeADark2f,
              light: greatChurchTypeALight2f,
            },
          },
          {
            id: "1f",
            label: "1F",
            images: {
              dark: greatChurchTypeADark1f,
              light: greatChurchTypeALight1f,
            },
          },
          {
            id: "b1",
            label: "B1",
            images: {
              dark: greatChurchTypeADarkB1,
              light: greatChurchTypeALightB1,
            },
          },
        ],
      }),
      defineMapType({
        id: "b",
        defaultFloor: "1f",
        floors: [
          {
            id: "2f",
            label: "2F",
            images: {
              dark: greatChurchTypeBDark2f,
              light: greatChurchTypeBLight2f,
            },
          },
          {
            id: "1f",
            label: "1F",
            images: {
              dark: greatChurchTypeBDark1f,
              light: greatChurchTypeBLight1f,
            },
          },
        ],
      }),
    ],
  },
  {
    slug: "ruins",
    englishName: "Ruins",
    // 遺跡に聖印は無い
    itemTypes: selectMapItemTypes(nightreignMapItemTypes, [
      "common_chest",
      "rare_chest",
      "corpse",
    ]),
    // TODO: タイプBを追加する。階層構成は未確認。
    // 地図画像がまだ無いため保留。用意できたら src/assets/maps/ruins/ に
    // ruins_type_b_<テーマ>_<階層>.webp を置き、その階層構成のとおりに定義を足す。
    // あわせて data/map-items/ruins.yaml にタイプBのパターンを書く。
    // パターンがタイプを指す作りのため、パターンが無いとそのタイプの地図を選べない。
    types: [
      defineMapType({
        id: "a",
        defaultFloor: "1f",
        floors: [
          {
            id: "1f",
            label: "1F",
            images: {
              dark: ruinsTypeADark1f,
              light: ruinsTypeALight1f,
            },
          },
          {
            id: "b1",
            label: "B1",
            images: {
              dark: ruinsTypeADarkB1,
              light: ruinsTypeALightB1,
            },
          },
        ],
      }),
    ],
  },
];
