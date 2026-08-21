import { describe, expect, it } from "vitest";
import {
  clampPan,
  coverState,
  INITIAL_ZOOM_STATE,
  MAX_ZOOM,
  panBy,
  zoomAtPoint,
  type ZoomState,
} from "./zoom-state";

/** 等倍のときの地図の大きさ。表示領域の中央に置かれている前提で扱う */
const MAP_WIDTH = 800;
const MAP_HEIGHT = 566;

/** 地図の端が表示領域の中央に来るときの表示位置 */
const HALF_WIDTH = MAP_WIDTH / 2;
const HALF_HEIGHT = MAP_HEIGHT / 2;

describe("clampPan", () => {
  it("等倍でも表示位置を動かせる", () => {
    const state: ZoomState = { zoom: 1, panX: -100, panY: -50 };

    expect(clampPan(state, MAP_WIDTH, MAP_HEIGHT)).toEqual(state);
  });

  it("地図の左上の端は表示領域の中央より内側には入らない", () => {
    const state: ZoomState = { zoom: 2, panX: 900, panY: 900 };

    // 地図は中央に置かれるため、半分ぶん動かすと左上の端がちょうど中央に来る
    expect(clampPan(state, MAP_WIDTH, MAP_HEIGHT)).toEqual({
      zoom: 2,
      panX: HALF_WIDTH,
      panY: HALF_HEIGHT,
    });
  });

  it("地図の右下の端は表示領域の中央より内側には入らない", () => {
    const state: ZoomState = { zoom: 2, panX: -3000, panY: -3000 };

    // 2倍のとき拡大レイヤーは地図の2倍。右下の端を中央に置くと 2倍 - 半分 だけずれる
    expect(clampPan(state, MAP_WIDTH, MAP_HEIGHT)).toEqual({
      zoom: 2,
      panX: -(MAP_WIDTH * 2 - HALF_WIDTH),
      panY: -(MAP_HEIGHT * 2 - HALF_HEIGHT),
    });
  });

  it("範囲内の表示位置はそのまま保つ", () => {
    const state: ZoomState = { zoom: 2, panX: -300, panY: -200 };

    expect(clampPan(state, MAP_WIDTH, MAP_HEIGHT)).toEqual(state);
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
      MAP_WIDTH,
      MAP_HEIGHT,
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
      MAP_WIDTH,
      MAP_HEIGHT,
    );

    expect(zoomed.zoom).toBe(MAX_ZOOM);
  });

  it("下限を下回る倍率は下限に丸める", () => {
    const state: ZoomState = { zoom: 2, panX: -300, panY: -200 };

    const zoomed = zoomAtPoint(state, 400, 283, 0.2, MAP_WIDTH, MAP_HEIGHT);

    // 等倍に戻っても、基準にした点は動かさないため表示位置は原点には戻らない
    expect(zoomed).toEqual({ zoom: 1, panX: 50, panY: 41.5 });
  });

  it("拡大しても可動域の外へは出ない", () => {
    // 地図のはるか外側を基準に拡大すると大きく右下へ寄るが、可動域で止まる
    const zoomed = zoomAtPoint(
      INITIAL_ZOOM_STATE,
      -1000,
      -1000,
      MAX_ZOOM,
      MAP_WIDTH,
      MAP_HEIGHT,
    );

    expect(zoomed.panX).toBe(HALF_WIDTH);
    expect(zoomed.panY).toBe(HALF_HEIGHT);
  });
});

describe("panBy", () => {
  it("拡大中は表示位置をずらせる", () => {
    const state: ZoomState = { zoom: 2, panX: -100, panY: -100 };

    expect(panBy(state, -50, -30, MAP_WIDTH, MAP_HEIGHT)).toEqual({
      zoom: 2,
      panX: -150,
      panY: -130,
    });
  });

  it("等倍でも表示位置をずらせる", () => {
    expect(panBy(INITIAL_ZOOM_STATE, -50, -30, MAP_WIDTH, MAP_HEIGHT)).toEqual({
      zoom: 1,
      panX: -50,
      panY: -30,
    });
  });

  it("動かしすぎても可動域の外には出ない", () => {
    const state: ZoomState = { zoom: 2, panX: -1000, panY: -700 };

    expect(panBy(state, -500, -500, MAP_WIDTH, MAP_HEIGHT)).toEqual({
      zoom: 2,
      panX: -(MAP_WIDTH * 2 - HALF_WIDTH),
      panY: -(MAP_HEIGHT * 2 - HALF_HEIGHT),
    });
  });
});

describe("coverState", () => {
  it("縦長の表示領域では高さを埋める倍率になる", () => {
    const covered = coverState(
      MAP_WIDTH,
      MAP_HEIGHT * 2,
      MAP_WIDTH,
      MAP_HEIGHT,
    );

    expect(covered.zoom).toBe(2);
  });

  it("横長の表示領域では幅を埋める倍率になる", () => {
    const covered = coverState(
      MAP_WIDTH * 2,
      MAP_HEIGHT,
      MAP_WIDTH,
      MAP_HEIGHT,
    );

    expect(covered.zoom).toBe(2);
  });

  it("埋めた地図は表示領域の中央に来る", () => {
    const covered = coverState(
      MAP_WIDTH,
      MAP_HEIGHT * 2,
      MAP_WIDTH,
      MAP_HEIGHT,
    );

    // 地図は表示領域の中央に置かれるため、地図の中心が表示領域の中心にあたる
    expect(covered.panX + (MAP_WIDTH * covered.zoom) / 2).toBe(MAP_WIDTH / 2);
    expect(covered.panY + (MAP_HEIGHT * covered.zoom) / 2).toBe(MAP_HEIGHT / 2);
  });

  it("表示領域と地図の縦横比が同じなら等倍になる", () => {
    expect(coverState(MAP_WIDTH, MAP_HEIGHT, MAP_WIDTH, MAP_HEIGHT)).toEqual({
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  });

  it("埋めるのに上限を超える倍率が要るときは上限で止める", () => {
    const covered = coverState(
      MAP_WIDTH,
      MAP_HEIGHT * 10,
      MAP_WIDTH,
      MAP_HEIGHT,
    );

    expect(covered.zoom).toBe(MAX_ZOOM);
  });
});
