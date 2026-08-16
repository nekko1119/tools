/** 地図の拡大率と表示位置。位置は表示領域の左上を原点としたピクセル値 */
export type ZoomState = {
  zoom: number;
  panX: number;
  panY: number;
};

/** 全体が表示領域に収まる倍率。これより小さくはしない */
export const MIN_ZOOM = 1;

/** 画像の原寸とほぼ一致する倍率。これ以上拡大しても粗くなるだけ */
export const MAX_ZOOM = 3;

export const INITIAL_ZOOM_STATE: ZoomState = {
  zoom: MIN_ZOOM,
  panX: 0,
  panY: 0,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 拡大した地図が表示領域から離れないよう表示位置を補正する。
 * 拡大レイヤーは表示領域の zoom 倍の大きさになるため、
 * 移動できる範囲は 表示領域 * (1 - zoom) から 0 までになる。
 */
export function clampPan(
  state: ZoomState,
  viewportWidth: number,
  viewportHeight: number,
): ZoomState {
  return {
    zoom: state.zoom,
    panX: clamp(state.panX, viewportWidth * (1 - state.zoom), 0),
    panY: clamp(state.panY, viewportHeight * (1 - state.zoom), 0),
  };
}

/**
 * 表示領域内の指定した点を画面上で動かさないまま倍率を変える。
 * ホイールやピンチで、カーソルや指の位置を基準に拡大するために使う。
 */
export function zoomAtPoint(
  state: ZoomState,
  focusX: number,
  focusY: number,
  nextZoom: number,
  viewportWidth: number,
  viewportHeight: number,
): ZoomState {
  const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const scale = clampedZoom / state.zoom;
  return clampPan(
    {
      zoom: clampedZoom,
      panX: focusX - (focusX - state.panX) * scale,
      panY: focusY - (focusY - state.panY) * scale,
    },
    viewportWidth,
    viewportHeight,
  );
}

/** 表示位置をずらす。拡大していないときは動かせない */
export function panBy(
  state: ZoomState,
  deltaX: number,
  deltaY: number,
  viewportWidth: number,
  viewportHeight: number,
): ZoomState {
  return clampPan(
    { zoom: state.zoom, panX: state.panX + deltaX, panY: state.panY + deltaY },
    viewportWidth,
    viewportHeight,
  );
}
