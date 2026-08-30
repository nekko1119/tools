import {
  clampPan,
  coverState,
  INITIAL_ZOOM_STATE,
  MAX_ZOOM,
  MIN_ZOOM,
  panBy,
  zoomAtPoint,
  type ZoomState,
} from "../../lib/nightreign/zoom-state";
import { wheelDeltaInPixels } from "../../lib/nightreign/wheel-delta";

/** ボタン1回あたりの倍率の変化量 */
const ZOOM_STEP = 1.5;

/** トラックパッドのピンチの移動量を倍率に換算する係数 */
const TRACKPAD_PINCH_SENSITIVITY = 0.01;

/** ダブルクリック1回あたりの倍率の変化量 */
const DOUBLE_CLICK_STEP = 2;

type Point = { x: number; y: number };

/** 変形前の地図の位置と大きさ。枠とは別で、枠の中に縦横比を保って収まっている */
type MapBox = { left: number; top: number; width: number; height: number };

function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function centerBetween(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * 枠の中の、変形前の地図を測る。
 * 倍率と表示位置はこの地図を基準に決めるため、枠ではなくこちらの大きさを使う。
 */
function mapBoxOf(panel: HTMLElement): MapBox {
  const map = panel.querySelector<HTMLElement>(".floor-switch__map");
  if (map === null) {
    throw new Error("地図が見つかりません");
  }
  // 変形の影響を受けない値で測る。getBoundingClientRect は拡大後の大きさを返してしまう
  const panelRect = panel.getBoundingClientRect();
  return {
    left: panelRect.left + map.offsetLeft,
    top: panelRect.top + map.offsetTop,
    width: map.offsetWidth,
    height: map.offsetHeight,
  };
}

/**
 * 拠点の地図に拡大縮小の操作を組み込む。
 * 倍率と表示位置は拠点単位で1つだけ持ち、全タイプの変形レイヤーに同じ値をかける。
 * そのため階層を切り替えてもパターンでタイプが変わっても、倍率と位置が保たれる。
 */
function setupMapZoom(root: HTMLElement): void {
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>(".floor-switch__panel"),
  );
  if (panels.length === 0) {
    throw new Error("地図の表示領域が見つかりません");
  }

  // DOM は増減しないので、状態更新のたびに引き直さず最初に集めておく
  const zoomInButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-zoom-action="in"]'),
  );
  const zoomOutButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-zoom-action="out"]'),
  );

  // 実際の大きさを測るまでは等倍で持ち、組み込みの最後に初期表示へ合わせる
  let state: ZoomState = INITIAL_ZOOM_STATE;
  // 押されているポインタの位置。2つになったらピンチとして扱う
  const activePointers = new Map<number, Point>();
  let previousPinchDistance = 0;
  // 2本指の中点。平行に動かしたぶんを表示位置に反映するために持つ
  let previousPinchCenter: Point | null = null;

  /** 表示中の階層の枠。隠れている階層やタイプは offsetParent が null になる */
  function visiblePanel(): HTMLElement {
    return panels.find((panel) => panel.offsetParent !== null) ?? panels[0]!;
  }

  /**
   * 初期表示。地図が表示領域を埋めるところまで拡大した状態。
   * 枠の大きさは画面によって変わるため、そのつど測り直す。
   */
  function initialState(): ZoomState {
    const panel = visiblePanel();
    const frame = panel.getBoundingClientRect();
    const box = mapBoxOf(panel);
    return coverState(frame.width, frame.height, box.width, box.height);
  }

  function applyState(): void {
    root.style.setProperty("--zoom", String(state.zoom));
    root.style.setProperty("--pan-x", `${state.panX}px`);
    root.style.setProperty("--pan-y", `${state.panY}px`);

    const isZoomed = state.zoom > MIN_ZOOM;
    for (const button of zoomInButtons) {
      button.disabled = state.zoom >= MAX_ZOOM;
    }
    for (const button of zoomOutButtons) {
      button.disabled = !isZoomed;
    }
  }

  /** 表示位置をずらす */
  function panByPixels(
    panel: HTMLElement,
    deltaX: number,
    deltaY: number,
  ): void {
    const box = mapBoxOf(panel);
    state = panBy(state, deltaX, deltaY, box.width, box.height);
    applyState();
  }

  /** 地図の左上を原点とした座標を基準に倍率を変える */
  function zoomTo(panel: HTMLElement, focus: Point, nextZoom: number): void {
    const box = mapBoxOf(panel);
    state = zoomAtPoint(
      state,
      focus.x - box.left,
      focus.y - box.top,
      nextZoom,
      box.width,
      box.height,
    );
    applyState();
  }

  for (const panel of panels) {
    panel.addEventListener(
      "wheel",
      (event) => {
        // ブラウザ自身のページ拡大やスクロールを止めて地図の操作に使う
        event.preventDefault();

        // トラックパッドのピンチは ctrl 付きのホイールとして届く
        if (event.ctrlKey) {
          const nextZoom =
            state.zoom * Math.exp(-event.deltaY * TRACKPAD_PINCH_SENSITIVITY);
          zoomTo(panel, { x: event.clientX, y: event.clientY }, nextZoom);
          return;
        }

        // ctrl が付かないホイールは2本指スワイプとして表示位置に使う。
        // 指の動きに地図が付いてくるよう、移動量の符号を反転する
        const frame = panel.getBoundingClientRect();
        const delta = wheelDeltaInPixels(event, frame.width, frame.height);
        panByPixels(panel, -delta.x, -delta.y);
      },
      { passive: false },
    );

    panel.addEventListener("pointerdown", (event) => {
      panel.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      if (activePointers.size === 2) {
        const [first, second] = Array.from(activePointers.values());
        previousPinchDistance = distanceBetween(first!, second!);
        previousPinchCenter = centerBetween(first!, second!);
      }
      root.classList.add("is-grabbing");
    });

    panel.addEventListener("pointermove", (event) => {
      const previous = activePointers.get(event.pointerId);
      if (previous === undefined) {
        return;
      }
      const current = { x: event.clientX, y: event.clientY };
      activePointers.set(event.pointerId, current);

      if (activePointers.size === 1) {
        panByPixels(panel, current.x - previous.x, current.y - previous.y);
        return;
      }
      if (activePointers.size === 2) {
        const [first, second] = Array.from(activePointers.values());
        const pinchCenter = centerBetween(first!, second!);
        // 2本指を平行に動かしたぶんは、ドラッグと同じように表示位置へ反映する
        if (previousPinchCenter !== null) {
          panByPixels(
            panel,
            pinchCenter.x - previousPinchCenter.x,
            pinchCenter.y - previousPinchCenter.y,
          );
        }
        previousPinchCenter = pinchCenter;

        const pinchDistance = distanceBetween(first!, second!);
        if (previousPinchDistance > 0) {
          zoomTo(
            panel,
            pinchCenter,
            state.zoom * (pinchDistance / previousPinchDistance),
          );
        }
        previousPinchDistance = pinchDistance;
      }
    });

    for (const eventName of ["pointerup", "pointercancel"] as const) {
      panel.addEventListener(eventName, (event) => {
        if (!activePointers.delete(event.pointerId)) {
          return;
        }
        if (panel.hasPointerCapture(event.pointerId)) {
          panel.releasePointerCapture(event.pointerId);
        }
        previousPinchDistance = 0;
        previousPinchCenter = null;
        if (activePointers.size === 0) {
          root.classList.remove("is-grabbing");
        }
      });
    }

    panel.addEventListener("dblclick", (event) => {
      // 上限まで拡大済みなら等倍に戻す
      const nextZoom =
        state.zoom >= MAX_ZOOM ? MIN_ZOOM : state.zoom * DOUBLE_CLICK_STEP;
      zoomTo(panel, { x: event.clientX, y: event.clientY }, nextZoom);
    });
  }

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const action =
      target.closest<HTMLElement>("[data-zoom-action]")?.dataset.zoomAction;
    if (action === undefined) {
      return;
    }

    const panel = visiblePanel();
    // 地図は枠の中央に置かれるため、地図の中心が枠の中心にあたる
    const box = mapBoxOf(panel);
    const center = {
      x: box.left + box.width / 2,
      y: box.top + box.height / 2,
    };
    switch (action) {
      case "in":
        zoomTo(panel, center, state.zoom * ZOOM_STEP);
        break;
      case "out":
        zoomTo(panel, center, state.zoom / ZOOM_STEP);
        break;
      case "reset":
        state = initialState();
        applyState();
        break;
      default:
        throw new Error(`地図の拡大操作「${action}」は定義されていません`);
    }
  });

  // 枠の大きさが変わると移動できる範囲も変わるため、位置を取り直す。
  // スマホでアドレスバーが伸び縮みしても resize が発火しないことがあるため、枠そのものを見る
  const resizeObserver = new ResizeObserver(() => {
    const box = mapBoxOf(visiblePanel());
    state = clampPan(state, box.width, box.height);
    applyState();
  });
  resizeObserver.observe(root);

  state = initialState();
  applyState();
}

for (const root of document.querySelectorAll<HTMLElement>(".map-view")) {
  setupMapZoom(root);
}
