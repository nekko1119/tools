import greatChurchTypeADark1f from "../assets/maps/great-church/great_church_type_a_dark_1f.webp";
import greatChurchTypeADark2f from "../assets/maps/great-church/great_church_type_a_dark_2f.webp";
import greatChurchTypeADarkB1 from "../assets/maps/great-church/great_church_type_a_dark_b1.webp";
import greatChurchTypeBDark1f from "../assets/maps/great-church/great_church_type_b_dark_1f.webp";
import greatChurchTypeBDark2f from "../assets/maps/great-church/great_church_type_b_dark_2f.webp";
import { defineMapType } from "../lib/nightreign/map";
import type { MapLocation } from "../types/nightreign-map";

/**
 * 拠点地図の定義。拠点を追加するときはこの配列に足す。
 * 拠点名の日本語訳は data/nightreign_translations.yaml に englishName をキーとして定義する。
 */
export const nightreignMaps: readonly MapLocation[] = [
  {
    slug: "great-church",
    englishName: "Great Church",
    types: [
      defineMapType({
        id: "a",
        defaultFloor: "1f",
        floors: [
          { id: "2f", label: "2F", images: { dark: greatChurchTypeADark2f } },
          { id: "1f", label: "1F", images: { dark: greatChurchTypeADark1f } },
          { id: "b1", label: "B1", images: { dark: greatChurchTypeADarkB1 } },
        ],
      }),
      defineMapType({
        id: "b",
        defaultFloor: "1f",
        floors: [
          { id: "2f", label: "2F", images: { dark: greatChurchTypeBDark2f } },
          { id: "1f", label: "1F", images: { dark: greatChurchTypeBDark1f } },
        ],
      }),
    ],
  },
];
