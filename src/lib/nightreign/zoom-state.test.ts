import { describe, expect, it } from "vitest";
import {
  clampPan,
  INITIAL_ZOOM_STATE,
  MAX_ZOOM,
  panBy,
  zoomAtPoint,
  type ZoomState,
} from "./zoom-state";

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 566;

describe("clampPan", () => {
  it("拡大していないときは表示位置を原点に戻す", () => {
    const state: ZoomState = { zoom: 1, panX: -100, panY: -50 };

    expect(clampPan(state, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)).toEqual({
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  });

  it("表示領域の左上より内側には動かせない", () => {
    const state: ZoomState = { zoom: 2, panX: 50, panY: 30 };

    expect(clampPan(state, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)).toEqual({
      zoom: 2,
      panX: 0,
      panY: 0,
    });
  });

  it("表示領域の右下より外側には動かせない", () => {
    const state: ZoomState = { zoom: 2, panX: -2000, panY: -2000 };

    // 2倍のとき拡大レイヤーは表示領域の2倍なので、はみ出せるのは表示領域1つ分
    expect(clampPan(state, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)).toEqual({
      zoom: 2,
      panX: -VIEWPORT_WIDTH,
      panY: -VIEWPORT_HEIGHT,
    });
  });

  it("範囲内の表示位置はそのまま保つ", () => {
    const state: ZoomState = { zoom: 2, panX: -300, panY: -200 };

    expect(clampPan(state, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)).toEqual(state);
  });
});

describe("zoomAtPoint", () => {
  it("基準にした点が画面上で動かない", () => {
    const focusX = 200;
    const focusY = 150;

    const zoomed = zoomAtPoint(
      INITIAL_ZOOM_STATE,
      focusX,
      focusY,
      2,
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT,
    );

    // 拡大前後で、基準点が指していたレイヤー上の位置が変わらないことを確かめる
    const pointBefore =
      (focusX - INITIAL_ZOOM_STATE.panX) / INITIAL_ZOOM_STATE.zoom;
    const pointAfter = (focusX - zoomed.panX) / zoomed.zoom;
    expect(pointAfter).toBeCloseTo(pointBefore);
  });

  it("上限を超える倍率は上限に丸める", () => {
    const zoomed = zoomAtPoint(
      INITIAL_ZOOM_STATE,
      400,
      283,
      10,
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT,
    );

    expect(zoomed.zoom).toBe(MAX_ZOOM);
  });

  it("下限を下回る倍率は下限に丸め、表示位置も原点に戻る", () => {
    const state: ZoomState = { zoom: 2, panX: -300, panY: -200 };

    const zoomed = zoomAtPoint(
      state,
      400,
      283,
      0.2,
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT,
    );

    expect(zoomed).toEqual({ zoom: 1, panX: 0, panY: 0 });
  });

  it("拡大後に地図が表示領域から離れないよう位置を補正する", () => {
    // 左端を基準に拡大すると右にはみ出す方向へ寄るが、左端より内側には入らない
    const zoomed = zoomAtPoint(
      INITIAL_ZOOM_STATE,
      0,
      0,
      2,
      VIEWPORT_WIDTH,
      VIEWPORT_HEIGHT,
    );

    expect(zoomed.panX).toBe(0);
    expect(zoomed.panY).toBe(0);
  });
});

describe("panBy", () => {
  it("拡大中は表示位置をずらせる", () => {
    const state: ZoomState = { zoom: 2, panX: -100, panY: -100 };

    expect(panBy(state, -50, -30, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)).toEqual({
      zoom: 2,
      panX: -150,
      panY: -130,
    });
  });

  it("拡大していないときは動かせない", () => {
    expect(
      panBy(INITIAL_ZOOM_STATE, -50, -30, VIEWPORT_WIDTH, VIEWPORT_HEIGHT),
    ).toEqual(INITIAL_ZOOM_STATE);
  });

  it("動かしすぎても表示領域の外には出ない", () => {
    const state: ZoomState = { zoom: 2, panX: -700, panY: -500 };

    expect(panBy(state, -500, -500, VIEWPORT_WIDTH, VIEWPORT_HEIGHT)).toEqual({
      zoom: 2,
      panX: -VIEWPORT_WIDTH,
      panY: -VIEWPORT_HEIGHT,
    });
  });
});
