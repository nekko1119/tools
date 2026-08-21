/** 地図の拡大率と表示位置。位置は等倍のときの地図の左上を原点としたピクセル値 */
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

/** 可動域に足す余白。等倍の地図の大きさに対する割合 */
const PAN_SLACK_RATIO = 0.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * 地図が表示領域から離れすぎないよう表示位置を補正する。
 * 地図は表示領域の中央に置かれるため、等倍の地図の半分を余分な可動域として足すと、
 * 地図のどの端もちょうど表示領域の中央まで寄せられる。
 * 大きさは等倍のときの地図で受け取る。拡大レイヤーはその zoom 倍になる。
 */
export function clampPan(
  state: ZoomState,
  mapWidth: number,
  mapHeight: number,
): ZoomState {
  const slackX = mapWidth * PAN_SLACK_RATIO;
  const slackY = mapHeight * PAN_SLACK_RATIO;
  return {
    zoom: state.zoom,
    panX: clamp(state.panX, mapWidth * (1 - state.zoom) - slackX, slackX),
    panY: clamp(state.panY, mapHeight * (1 - state.zoom) - slackY, slackY),
  };
}

/**
 * 地図が表示領域を埋める倍率と、そのとき地図が中央に来る表示位置を求める。
 * 地図と表示領域で縦横比が違うため、埋めると縦か横のどちらかは表示領域の外に出る。
 * 大きさはどちらも等倍のときの値で受け取る。
 */
export function coverState(
  frameWidth: number,
  frameHeight: number,
  mapWidth: number,
  mapHeight: number,
): ZoomState {
  const zoom = clamp(
    Math.max(frameWidth / mapWidth, frameHeight / mapHeight),
    MIN_ZOOM,
    MAX_ZOOM,
  );
  // 拡大は地図の左上を原点に効くため、中央を保つには広がった分の半分だけ戻す
  return {
    zoom,
    panX: (mapWidth * (1 - zoom)) / 2,
    panY: (mapHeight * (1 - zoom)) / 2,
  };
}

/**
 * 指定した点を画面上で動かさないまま倍率を変える。
 * ホイールやピンチで、カーソルや指の位置を基準に拡大するために使う。
 * 点は等倍の地図の左上を原点とした座標で渡す。
 */
export function zoomAtPoint(
  state: ZoomState,
  focusX: number,
  focusY: number,
  nextZoom: number,
  mapWidth: number,
  mapHeight: number,
): ZoomState {
  const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const scale = clampedZoom / state.zoom;
  return clampPan(
    {
      zoom: clampedZoom,
      panX: focusX - (focusX - state.panX) * scale,
      panY: focusY - (focusY - state.panY) * scale,
    },
    mapWidth,
    mapHeight,
  );
}

/** 表示位置をずらす。可動域を出た分は切り詰める */
export function panBy(
  state: ZoomState,
  deltaX: number,
  deltaY: number,
  mapWidth: number,
  mapHeight: number,
): ZoomState {
  return clampPan(
    { zoom: state.zoom, panX: state.panX + deltaX, panY: state.panY + deltaY },
    mapWidth,
    mapHeight,
  );
}
