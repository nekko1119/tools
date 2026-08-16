import type { ImageMetadata } from "astro";
import { describe, expect, it } from "vitest";
import type { MapLocation } from "../../types/nightreign-map";
import type { MapItemIcon, MapItemType } from "../../types/nightreign-map-item";
import { parseMapItemPlacement } from "./map-items";

const image = {
  src: "/dummy.webp",
  width: 2338,
  height: 1654,
  format: "webp",
} as ImageMetadata;

const location: MapLocation = {
  slug: "great-church",
  englishName: "Great Church",
  types: [
    {
      id: "a",
      defaultFloor: "1f",
      floors: [
        { id: "1f", label: "1F", images: { dark: image } },
        { id: "b1", label: "B1", images: { dark: image } },
      ],
    },
    {
      id: "b",
      defaultFloor: "1f",
      floors: [{ id: "1f", label: "1F", images: { dark: image } }],
    },
  ],
};

const icon = { width: 16, height: 16 } as MapItemIcon;

const ITEM_TYPES: readonly MapItemType[] = [
  { id: "common_chest", label: "宝箱", icon },
  { id: "rare_chest", label: "レア宝箱", icon },
  { id: "corpse", label: "遺体", icon },
];

function itemTypeOf(id: string): MapItemType {
  const itemType = ITEM_TYPES.find((candidate) => candidate.id === id);
  if (itemType === undefined) {
    throw new Error(`テストの種別「${id}」が定義されていません`);
  }
  return itemType;
}

function parse(source: unknown) {
  return parseMapItemPlacement(source, location, ITEM_TYPES, "テスト.yaml");
}

describe("parseMapItemPlacement", () => {
  it("パターンを並び順のまま読み解く", () => {
    const placement = parse({
      patterns: [
        {
          name: "パターン1",
          type: "a",
          floors: {
            "1f": [{ item: "common_chest", x: 994, y: 513 }],
            b1: [{ item: "corpse", x: 100, y: 200 }],
          },
        },
        {
          name: "パターン2",
          type: "b",
          floors: { "1f": [{ item: "rare_chest", x: 1, y: 2 }] },
        },
      ],
    });

    expect(placement.patterns).toEqual([
      {
        name: "パターン1",
        mapTypeId: "a",
        itemsByFloorId: {
          "1f": [{ itemType: itemTypeOf("common_chest"), x: 994, y: 513 }],
          b1: [{ itemType: itemTypeOf("corpse"), x: 100, y: 200 }],
        },
      },
      {
        name: "パターン2",
        mapTypeId: "b",
        itemsByFloorId: {
          "1f": [{ itemType: itemTypeOf("rare_chest"), x: 1, y: 2 }],
        },
      },
    ]);
  });

  it("アイテムが無い階層は省略できる", () => {
    const placement = parse({
      patterns: [{ name: "パターン1", type: "a", floors: { "1f": [] } }],
    });

    expect(placement.patterns[0]?.itemsByFloorId).toEqual({ "1f": [] });
  });

  it("中身が空でもエラーにしない", () => {
    expect(parse({})).toEqual({ patterns: [] });
  });

  it("地図に無いタイプを指したらエラーにする", () => {
    expect(() =>
      parse({ patterns: [{ name: "パターン1", type: "z", floors: {} }] }),
    ).toThrow(/type「z」/);
  });

  it("type が無ければエラーにする", () => {
    expect(() =>
      parse({ patterns: [{ name: "パターン1", floors: {} }] }),
    ).toThrow(/type/);
  });

  it("そのタイプに無い階層を指したらエラーにする", () => {
    // b1 はタイプaにしかないので、タイプbのパターンでは使えない
    expect(() =>
      parse({
        patterns: [{ name: "パターン1", type: "b", floors: { b1: [] } }],
      }),
    ).toThrow(/階層「b1」.*「b」/s);
  });

  it("定義されていないアイテム種別を指したらエラーにする", () => {
    expect(() =>
      parse({
        patterns: [
          {
            name: "パターン1",
            type: "a",
            floors: { "1f": [{ item: "gold", x: 1, y: 2 }] },
          },
        ],
      }),
    ).toThrow(/gold/);
  });

  it("パターンに名前が無ければエラーにする", () => {
    expect(() => parse({ patterns: [{ type: "a", floors: {} }] })).toThrow(
      /name/,
    );
  });

  it("パターン名が重複していたらエラーにする", () => {
    expect(() =>
      parse({
        patterns: [
          { name: "同じ名前", type: "a", floors: {} },
          { name: "同じ名前", type: "b", floors: {} },
        ],
      }),
    ).toThrow(/重複/);
  });

  it("座標が地図の範囲を超えていたらエラーにする", () => {
    expect(() =>
      parse({
        patterns: [
          {
            name: "パターン1",
            type: "a",
            floors: { "1f": [{ item: "corpse", x: 9999, y: 10 }] },
          },
        ],
      }),
    ).toThrow(/範囲/);
  });

  it("座標が数値でなければエラーにする", () => {
    expect(() =>
      parse({
        patterns: [
          {
            name: "パターン1",
            type: "a",
            floors: { "1f": [{ item: "corpse", x: "100", y: 10 }] },
          },
        ],
      }),
    ).toThrow(/数値/);
  });

  it("エラーには場所が分かる情報を含める", () => {
    expect(() =>
      parse({
        patterns: [
          {
            name: "パターン1",
            type: "a",
            floors: {
              "1f": [{ item: "corpse", x: 1, y: 1 }, { item: "gold" }],
            },
          },
        ],
      }),
    ).toThrow(/テスト\.yaml.*1件目のパターン.*「1f」.*2件目/s);
  });
});
