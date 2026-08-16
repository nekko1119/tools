/**
 * アイテムのパターンを切り替える。
 * パターンはどれか1つのタイプに属するため、パターンを選ぶと地図のタイプも切り替わる。
 * 階層の選択は、切り替え先に同じ階層があれば引き継ぎ、無ければそのタイプの既定の階層に戻す。
 * 階層とパターンは選択の軸が交差するため、CSS の兄弟セレクタでは表せず JavaScript で出し分ける。
 */

/** 表示中のタイプの階層セレクタ。タイプを切り替えた後に呼ぶこと */
function visibleFloorSwitch(view: HTMLElement): HTMLElement | null {
  return view.querySelector<HTMLElement>(
    "[data-map-type-pane]:not([hidden]) .floor-switch",
  );
}

function selectedFloorId(view: HTMLElement): string | undefined {
  return visibleFloorSwitch(view)?.querySelector<HTMLInputElement>(
    "[data-floor-id]:checked",
  )?.dataset.floorId;
}

/** 切り替え先のタイプで、できるだけ同じ階層を選び直す */
function restoreFloor(view: HTMLElement, floorId: string | undefined): void {
  const floorSwitch = visibleFloorSwitch(view);
  if (floorSwitch === null) {
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
  const view = input.closest<HTMLElement>(".map-view");
  if (view === null) {
    throw new Error("パターンの切り替え先の .map-view が見つかりません");
  }
  const patternName = input.dataset.patternInput;
  const mapTypeId = input.dataset.mapType;
  if (patternName === undefined || mapTypeId === undefined) {
    throw new Error("パターンの名前またはタイプが指定されていません");
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
      "[data-pattern-group]",
    )) {
      group.hidden = group.dataset.patternGroup !== patternName;
    }

    restoreFloor(view, previousFloorId);
  });
}

for (const input of document.querySelectorAll<HTMLInputElement>(
  "[data-pattern-input]",
)) {
  setupPatternSwitch(input);
}
