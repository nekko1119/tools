/** ホイールの移動量。WheelEvent をそのまま渡せる形にしている */
export type WheelDelta = {
  deltaX: number;
  deltaY: number;
  /** 移動量の単位。WheelEvent.deltaMode と同じ値 */
  deltaMode: number;
};

/** ピクセル単位で届いた場合の deltaMode */
const DOM_DELTA_PIXEL = 0;
/** 行単位で届いた場合の deltaMode */
const DOM_DELTA_LINE = 1;
/** ページ単位で届いた場合の deltaMode */
const DOM_DELTA_PAGE = 2;

/** 1行ぶんの移動量とみなすピクセル数 */
const LINE_SIZE = 16;

/** 2次元の移動量 */
export type Delta = { x: number; y: number };

/**
 * ホイールの移動量をピクセルに換算する。
 * 単位は環境によって行やページになるため、そのままでは表示位置に足せない。
 * ページ単位のときは1ページを表示領域の大きさとみなす。
 */
export function wheelDeltaInPixels(
  wheel: WheelDelta,
  frameWidth: number,
  frameHeight: number,
): Delta {
  switch (wheel.deltaMode) {
    case DOM_DELTA_LINE:
      return { x: wheel.deltaX * LINE_SIZE, y: wheel.deltaY * LINE_SIZE };
    case DOM_DELTA_PAGE:
      return { x: wheel.deltaX * frameWidth, y: wheel.deltaY * frameHeight };
    case DOM_DELTA_PIXEL:
      return { x: wheel.deltaX, y: wheel.deltaY };
    default:
      // 未知の単位でも操作を止めないよう、ピクセルとして扱う
      return { x: wheel.deltaX, y: wheel.deltaY };
  }
}
