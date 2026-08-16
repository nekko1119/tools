import type { ImageMetadata } from "astro";
import { describe, expect, it } from "vitest";
import type { MapLocation } from "../../types/nightreign-map";
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
  ],
};

const ITEM_TYPE_IDS = ["common_chest", "rare_chest", "corpse"];

function parse(source: unknown) {
  return parseMapItemPlacement(source, location, ITEM_TYPE_IDS, "テスト.yaml");
}

describe("parseMapItemPlacement", () => {
  it("タイプごとの配置パターンを読み解く", () => {
    const placement = parse({
      types: {
        a: [
          {
            name: "配置1",
            floors: {
              "1f": [{ item: "common_chest", x: 994, y: 513 }],
              b1: [{ item: "corpse", x: 100, y: 200 }],
            },
          },
          {
            name: "配置2",
            floors: { "1f": [{ item: "rare_chest", x: 1, y: 2 }] },
          },
        ],
      },
    });

    expect(placement.patternsByTypeId.a).toEqual([
      {
        name: "配置1",
        itemsByFloorId: {
          "1f": [{ typeId: "common_chest", x: 994, y: 513 }],
          b1: [{ typeId: "corpse", x: 100, y: 200 }],
        },
      },
      {
        name: "配置2",
        itemsByFloorId: { "1f": [{ typeId: "rare_chest", x: 1, y: 2 }] },
      },
    ]);
  });

  it("アイテムが無い階層は省略できる", () => {
    const placement = parse({
      types: { a: [{ name: "配置1", floors: { "1f": [] } }] },
    });

    expect(placement.patternsByTypeId.a?.[0]?.itemsByFloorId).toEqual({
      "1f": [],
    });
  });

  it("中身が空でもエラーにしない", () => {
    expect(parse({})).toEqual({ patternsByTypeId: {} });
  });

  it("地図に無いタイプを指したらエラーにする", () => {
    expect(() => parse({ types: { z: [] } })).toThrow(/タイプ「z」/);
  });

  it("地図に無い階層を指したらエラーにする", () => {
    expect(() =>
      parse({ types: { a: [{ name: "配置1", floors: { "3f": [] } }] } }),
    ).toThrow(/階層「3f」/);
  });

  it("定義されていないアイテム種別を指したらエラーにする", () => {
    expect(() =>
      parse({
        types: {
          a: [
            { name: "配置1", floors: { "1f": [{ item: "gold", x: 1, y: 2 }] } },
          ],
        },
      }),
    ).toThrow(/gold/);
  });

  it("配置に名前が無ければエラーにする", () => {
    expect(() => parse({ types: { a: [{ floors: {} }] } })).toThrow(/name/);
  });

  it("座標が地図の範囲を超えていたらエラーにする", () => {
    expect(() =>
      parse({
        types: {
          a: [
            {
              name: "配置1",
              floors: { "1f": [{ item: "corpse", x: 9999, y: 10 }] },
            },
          ],
        },
      }),
    ).toThrow(/範囲/);
  });

  it("座標が数値でなければエラーにする", () => {
    expect(() =>
      parse({
        types: {
          a: [
            {
              name: "配置1",
              floors: { "1f": [{ item: "corpse", x: "100", y: 10 }] },
            },
          ],
        },
      }),
    ).toThrow(/数値/);
  });

  it("エラーには場所が分かる情報を含める", () => {
    expect(() =>
      parse({
        types: {
          a: [
            {
              name: "配置1",
              floors: {
                "1f": [{ item: "corpse", x: 1, y: 1 }, { item: "gold" }],
              },
            },
          ],
        },
      }),
    ).toThrow(/テスト\.yaml.*「a」.*1件目の配置.*「1f」.*2件目/s);
  });
});
