/**
 * アイテムの配置パターンを切り替える。
 * 階層の切り替えと違って選択の軸が2つ交差するため、
 * CSS の兄弟セレクタでは表せず JavaScript で出し分ける。
 * 読み込まれていない間は先頭の配置が表示される。
 */
function setupPatternSwitch(input: HTMLInputElement): void {
  const targetId = input.dataset.target;
  if (targetId === undefined) {
    throw new Error("配置の切り替え先が指定されていません");
  }
  const target = document.getElementById(targetId);
  if (target === null) {
    throw new Error(`配置の切り替え先「${targetId}」が見つかりません`);
  }
  const selectedIndex = input.dataset.patternInput;
  if (selectedIndex === undefined) {
    throw new Error("配置の番号が指定されていません");
  }

  input.addEventListener("change", () => {
    if (!input.checked) {
      return;
    }
    for (const group of target.querySelectorAll<HTMLElement>(
      "[data-pattern-index]",
    )) {
      group.hidden = group.dataset.patternIndex !== selectedIndex;
    }
  });
}

for (const input of document.querySelectorAll<HTMLInputElement>(
  "[data-pattern-input]",
)) {
  setupPatternSwitch(input);
}
