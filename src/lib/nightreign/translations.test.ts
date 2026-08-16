import { describe, expect, it } from "vitest";
import { parseTranslations, translate } from "./translations";

describe("parseTranslations", () => {
  it('`キー: "値"` 形式の行を対応表にする', () => {
    const yamlText = ['Great Church: "大教会"', 'Crater: "火口"'].join("\n");

    expect(parseTranslations(yamlText)).toEqual({
      "Great Church": "大教会",
      Crater: "火口",
    });
  });

  it("コメント行と空行を無視する", () => {
    const yamlText = [
      "# Nightreign 日本語訳定義ファイル",
      "",
      "# --- Location ---",
      'Great Church: "大教会"',
    ].join("\n");

    expect(parseTranslations(yamlText)).toEqual({ "Great Church": "大教会" });
  });

  it("キーに空白やアポストロフィを含む行を扱える", () => {
    const yamlText = [
      'Difficult Sorcerer\'s Rise: "古の魔術師塔"',
      'Crucible Knight and Golden Hippopotamus: "坩堝の騎士&黄金カバ"',
    ].join("\n");

    expect(parseTranslations(yamlText)).toEqual({
      "Difficult Sorcerer's Rise": "古の魔術師塔",
      "Crucible Knight and Golden Hippopotamus": "坩堝の騎士&黄金カバ",
    });
  });

  it("値が空文字の行も対応表に含める", () => {
    expect(parseTranslations('Default: ""')).toEqual({ Default: "" });
  });

  it("引用符で囲まれていない行は無視する", () => {
    expect(parseTranslations("Great Church: 大教会")).toEqual({});
  });

  it("何も定義されていない場合は空の対応表を返す", () => {
    expect(parseTranslations("")).toEqual({});
  });
});

describe("translate", () => {
  it("対応表から日本語名を引く", () => {
    expect(translate({ "Great Church": "大教会" }, "Great Church")).toBe(
      "大教会",
    );
  });

  it("定義が無いキーはキー名を含むエラーにする", () => {
    expect(() => translate({}, "Great Church")).toThrow(/Great Church/);
  });
});
