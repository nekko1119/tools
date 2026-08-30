import { describe, expect, it } from "vitest";
import type { MapItemIcon, MapItemType } from "../../types/nightreign-map-item";
import { selectMapItemTypes } from "./map";

const icon = { width: 16, height: 16 } as MapItemIcon;

const ITEM_TYPES = [
  { id: "common_chest", label: "宝箱", icon },
  { id: "rare_chest", label: "レア宝箱", icon },
  { id: "corpse", label: "遺体", icon },
  { id: "sacred_seal", label: "聖印", icon },
] as const satisfies readonly MapItemType[];

describe("selectMapItemTypes", () => {
  it("識別子で指定した種別だけを返す", () => {
    const selected = selectMapItemTypes(ITEM_TYPES, ["corpse", "rare_chest"]);

    expect(selected.map((itemType) => itemType.id)).toEqual([
      "rare_chest",
      "corpse",
    ]);
  });

  it("指定した順ではなく定義順に並べる", () => {
    const selected = selectMapItemTypes(ITEM_TYPES, [
      "sacred_seal",
      "common_chest",
    ]);

    expect(selected.map((itemType) => itemType.id)).toEqual([
      "common_chest",
      "sacred_seal",
    ]);
  });

  it("同じ識別子を重ねて書いても1つだけ返す", () => {
    const selected = selectMapItemTypes(ITEM_TYPES, ["corpse", "corpse"]);

    expect(selected.map((itemType) => itemType.id)).toEqual(["corpse"]);
  });

  it("何も指定しなければ空になる", () => {
    expect(selectMapItemTypes(ITEM_TYPES, [])).toEqual([]);
  });

  it("種別の定義そのものを返し、複製しない", () => {
    const [selected] = selectMapItemTypes(ITEM_TYPES, ["corpse"]);

    expect(selected).toBe(ITEM_TYPES[2]);
  });
});
