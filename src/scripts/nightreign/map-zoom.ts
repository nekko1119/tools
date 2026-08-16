import {
  clampPan,
  INITIAL_ZOOM_STATE,
  MAX_ZOOM,
  MIN_ZOOM,
  panBy,
  zoomAtPoint,
  type ZoomState,
} from "../../lib/nightreign/zoom-state";

/** ボタン1回あたりの倍率の変化量 */
const ZOOM_STEP = 1.5;

/** トラックパッドのピンチの移動量を倍率に換算する係数 */
const TRACKPAD_PINCH_SENSITIVITY = 0.01;

/** ダブルクリック1回あたりの倍率の変化量 */
const DOUBLE_CLICK_STEP = 2;

type Point = { x: number; y: number };

function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function centerBetween(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** 地図に重ねた操作ボタンの上で起きたイベントかどうか */
function isZoomControl(target: EventTarget | null): boolean {
  return (
    target instanceof Element && target.closest("[data-zoom-action]") !== null
  );
}

/**
 * 1つのタイプの地図に拡大縮小の操作を組み込む。
 * 階層ごとの画像は共通の変形レイヤーに乗るため、
 * 倍率と表示位置は階層を切り替えても保たれる。
 */
function setupMapZoom(root: HTMLElement): void {
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>(".floor-switch__panel"),
  );
  if (panels.length === 0) {
    throw new Error("地図の表示領域が見つかりません");
  }

  let state: ZoomState = INITIAL_ZOOM_STATE;
  // 押されているポインタの位置。2つになったらピンチとして扱う
  const activePointers = new Map<number, Point>();
  let previousPinchDistance = 0;

  /** 表示中の階層の枠。全階層が同じ大きさなので代表として使う */
  function visiblePanel(): HTMLElement {
    return panels.find((panel) => panel.offsetParent !== null) ?? panels[0]!;
  }

  function applyState(): void {
    root.style.setProperty("--zoom", String(state.zoom));
    root.style.setProperty("--pan-x", `${state.panX}px`);
    root.style.setProperty("--pan-y", `${state.panY}px`);

    const isZoomed = state.zoom > MIN_ZOOM;
    root.classList.toggle("is-zoomed", isZoomed);
    // 拡大中だけタッチを地図の移動に使い、等倍のときはページの縦スクロールに残す
    for (const panel of panels) {
      panel.style.touchAction = isZoomed ? "none" : "pan-y";
    }
    for (const button of root.querySelectorAll<HTMLButtonElement>(
      '[data-zoom-action="in"]',
    )) {
      button.disabled = state.zoom >= MAX_ZOOM;
    }
    for (const button of root.querySelectorAll<HTMLButtonElement>(
      '[data-zoom-action="out"]',
    )) {
      button.disabled = !isZoomed;
    }
  }

  /** 枠の左上を原点とした座標に変換する */
  function toLocalPoint(panel: HTMLElement, clientPoint: Point): Point {
    const rect = panel.getBoundingClientRect();
    return { x: clientPoint.x - rect.left, y: clientPoint.y - rect.top };
  }

  function zoomTo(panel: HTMLElement, focus: Point, nextZoom: number): void {
    const rect = panel.getBoundingClientRect();
    const local = toLocalPoint(panel, focus);
    state = zoomAtPoint(
      state,
      local.x,
      local.y,
      nextZoom,
      rect.width,
      rect.height,
    );
    applyState();
  }

  for (const panel of panels) {
    panel.addEventListener(
      "wheel",
      (event) => {
        // トラックパッドのピンチは ctrl 付きのホイールとして届く。
        // 素のホイールはページの縦スクロールに残す
        if (!event.ctrlKey) {
          return;
        }
        // ブラウザ自身のページ拡大を止めて地図の拡大に使う
        event.preventDefault();
        const nextZoom =
          state.zoom * Math.exp(-event.deltaY * TRACKPAD_PINCH_SENSITIVITY);
        zoomTo(panel, { x: event.clientX, y: event.clientY }, nextZoom);
      },
      { passive: false },
    );

    panel.addEventListener("pointerdown", (event) => {
      // 操作ボタンを押しただけのときは地図のドラッグを始めない
      if (isZoomControl(event.target)) {
        return;
      }
      panel.setPointerCapture(event.pointerId);
      activePointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });
      if (activePointers.size === 2) {
        const [first, second] = Array.from(activePointers.values());
        previousPinchDistance = distanceBetween(first!, second!);
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

      const rect = panel.getBoundingClientRect();
      if (activePointers.size === 1) {
        state = panBy(
          state,
          current.x - previous.x,
          current.y - previous.y,
          rect.width,
          rect.height,
        );
        applyState();
        return;
      }
      if (activePointers.size === 2) {
        const [first, second] = Array.from(activePointers.values());
        const pinchDistance = distanceBetween(first!, second!);
        if (previousPinchDistance > 0) {
          zoomTo(
            panel,
            centerBetween(first!, second!),
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
        if (activePointers.size === 0) {
          root.classList.remove("is-grabbing");
        }
      });
    }

    panel.addEventListener("dblclick", (event) => {
      // 操作ボタンの連打を、地図のダブルクリックとして二重に拾わない
      if (isZoomControl(event.target)) {
        return;
      }
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
    const rect = panel.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    switch (action) {
      case "in":
        zoomTo(panel, center, state.zoom * ZOOM_STEP);
        break;
      case "out":
        zoomTo(panel, center, state.zoom / ZOOM_STEP);
        break;
      case "reset":
        state = INITIAL_ZOOM_STATE;
        applyState();
        break;
      default:
        throw new Error(`地図の拡大操作「${action}」は定義されていません`);
    }
  });

  // 枠の大きさが変わると移動できる範囲も変わるため、位置を取り直す
  window.addEventListener("resize", () => {
    const rect = visiblePanel().getBoundingClientRect();
    state = clampPan(state, rect.width, rect.height);
    applyState();
  });

  applyState();
}

for (const root of document.querySelectorAll<HTMLElement>(".floor-switch")) {
  setupMapZoom(root);
}
