import { describe, expect, it } from "vitest";
import { wheelDeltaInPixels } from "./wheel-delta";

const FRAME_WIDTH = 800;
const FRAME_HEIGHT = 600;

function toPixels(deltaX: number, deltaY: number, deltaMode: number) {
  return wheelDeltaInPixels(
    { deltaX, deltaY, deltaMode },
    FRAME_WIDTH,
    FRAME_HEIGHT,
  );
}

describe("wheelDeltaInPixels", () => {
  it("ピクセル単位ならそのまま返す", () => {
    expect(toPixels(12, -34, 0)).toEqual({ x: 12, y: -34 });
  });

  it("行単位なら1行を16pxとして換算する", () => {
    expect(toPixels(2, -3, 1)).toEqual({ x: 32, y: -48 });
  });

  it("ページ単位なら1ページを表示領域の大きさとして換算する", () => {
    expect(toPixels(1, -2, 2)).toEqual({
      x: FRAME_WIDTH,
      y: -2 * FRAME_HEIGHT,
    });
  });

  it("未知の単位はピクセルとして扱う", () => {
    expect(toPixels(5, 6, 99)).toEqual({ x: 5, y: 6 });
  });
});
