import { readDataYaml } from "./data-file";

/** プロジェクトルートからの翻訳定義ファイルの相対パス */
const TRANSLATIONS_FILE_PATH = "data/nightreign_translations.yaml";

/** 読み込んだ対応表。全ページで同じ内容なので一度だけ読む */
let cached: Record<string, string> | undefined;

/**
 * 読み解いた yaml を英名から日本語名への対応表にする。
 * 値が文字列でない項目は翻訳ではないためエラーにする。
 */
export function toTranslations(source: unknown): Record<string, string> {
  if (source === null || source === undefined) {
    return {};
  }
  if (typeof source !== "object" || Array.isArray(source)) {
    throw new Error(
      `${TRANSLATIONS_FILE_PATH} は「キー: 値」の形で書いてください`,
    );
  }

  const translations: Record<string, string> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== "string") {
      throw new Error(
        `${TRANSLATIONS_FILE_PATH} の「${key}」の訳が文字列ではありません`,
      );
    }
    translations[key] = value;
  }
  return translations;
}

/**
 * 翻訳定義ファイルを読み込み、英名から日本語名への対応表を返す。
 * ビルド時にのみ呼び出すこと。
 */
export function loadTranslations(): Record<string, string> {
  cached ??= toTranslations(readDataYaml(TRANSLATIONS_FILE_PATH));
  return cached;
}

/**
 * 対応表から日本語名を引く。定義が無い場合は原因が分かるようにエラーにする。
 */
export function translate(
  translations: Record<string, string>,
  key: string,
): string {
  const translated = translations[key];
  if (translated === undefined) {
    throw new Error(
      `「${key}」の日本語訳が ${TRANSLATIONS_FILE_PATH} に定義されていません`,
    );
  }
  return translated;
}
