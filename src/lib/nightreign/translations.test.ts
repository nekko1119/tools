import { describe, expect, it } from "vitest";
import { toTranslations, translate } from "./translations";

describe("toTranslations", () => {
  it("読み解いた内容を対応表にする", () => {
    expect(
      toTranslations({ "Great Church": "大教会", Crater: "火口" }),
    ).toEqual({
      "Great Church": "大教会",
      Crater: "火口",
    });
  });

  it("値が空文字の項目も対応表に含める", () => {
    expect(toTranslations({ Default: "" })).toEqual({ Default: "" });
  });

  it("中身が空でもエラーにしない", () => {
    expect(toTranslations(null)).toEqual({});
    expect(toTranslations({})).toEqual({});
  });

  it("訳が文字列でなければエラーにする", () => {
    expect(() => toTranslations({ "Great Church": 123 })).toThrow(
      /Great Church/,
    );
  });

  it("キーと値の対応になっていなければエラーにする", () => {
    expect(() => toTranslations(["大教会"])).toThrow(/キー: 値/);
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
