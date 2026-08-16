/**
 * アイテムのパターンを切り替える。
 * パターンはどれか1つのタイプに属するため、パターンを選ぶと地図のタイプも切り替わる。
 * 階層の選択は、切り替え先に同じ階層があれば引き継ぎ、無ければそのタイプの既定の階層に戻す。
 * 階層とパターンは選択の軸が交差するため、CSS の兄弟セレクタでは表せず JavaScript で出し分ける。
 */
function findView(input: HTMLInputElement): HTMLElement {
  const viewId = input.dataset.view;
  if (viewId === undefined) {
    throw new Error("パターンの切り替え先が指定されていません");
  }
  const view = document.getElementById(viewId);
  if (view === null) {
    throw new Error(`パターンの切り替え先「${viewId}」が見つかりません`);
  }
  return view;
}

/** 表示中のタイプの階層セレクタ。タイプを切り替えた後に呼ぶこと */
function visibleFloorSwitch(view: HTMLElement): HTMLElement | undefined {
  return Array.from(view.querySelectorAll<HTMLElement>(".floor-switch")).find(
    (floorSwitch) => floorSwitch.offsetParent !== null,
  );
}

function selectedFloorId(view: HTMLElement): string | undefined {
  const floorSwitch = visibleFloorSwitch(view);
  return floorSwitch?.querySelector<HTMLInputElement>("[data-floor-id]:checked")
    ?.dataset.floorId;
}

/** 切り替え先のタイプで、できるだけ同じ階層を選び直す */
function restoreFloor(view: HTMLElement, floorId: string | undefined): void {
  const floorSwitch = visibleFloorSwitch(view);
  if (floorSwitch === undefined) {
    return;
  }
  const inputs = Array.from(
    floorSwitch.querySelectorAll<HTMLInputElement>("[data-floor-id]"),
  );
  const sameFloor = inputs.find((input) => input.dataset.floorId === floorId);
  if (sameFloor !== undefined) {
    sameFloor.checked = true;
    return;
  }

  const defaultFloorId = floorSwitch.dataset.defaultFloor;
  const defaultFloor = inputs.find(
    (input) => input.dataset.floorId === defaultFloorId,
  );
  if (defaultFloor === undefined) {
    throw new Error(
      `既定の階層「${defaultFloorId}」が階層セレクタに見つかりません`,
    );
  }
  defaultFloor.checked = true;
}

function setupPatternSwitch(input: HTMLInputElement): void {
  const view = findView(input);
  const patternIndex = input.dataset.patternInput;
  const mapTypeId = input.dataset.mapType;
  if (patternIndex === undefined || mapTypeId === undefined) {
    throw new Error("パターンの番号またはタイプが指定されていません");
  }

  input.addEventListener("change", () => {
    if (!input.checked) {
      return;
    }

    // タイプを切り替える前に、選んでいた階層を控えておく
    const previousFloorId = selectedFloorId(view);

    for (const pane of view.querySelectorAll<HTMLElement>(
      "[data-map-type-pane]",
    )) {
      pane.hidden = pane.dataset.mapTypePane !== mapTypeId;
    }
    for (const group of view.querySelectorAll<HTMLElement>(
      "[data-pattern-index]",
    )) {
      group.hidden = group.dataset.patternIndex !== patternIndex;
    }

    restoreFloor(view, previousFloorId);
  });
}

for (const input of document.querySelectorAll<HTMLInputElement>(
  "[data-pattern-input]",
)) {
  setupPatternSwitch(input);
}
