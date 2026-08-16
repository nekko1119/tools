import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** プロジェクトルートからの翻訳定義ファイルの相対パス */
const TRANSLATIONS_FILE_PATH = "data/nightreign_translations.yaml";

/**
 * `キー: "値"` 形式の行だけを拾う簡易パーサ。
 * コメント行・空行・インデントされた行は翻訳定義ではないため無視する。
 */
export function parseTranslations(yamlText: string): Record<string, string> {
  const translations: Record<string, string> = {};
  for (const line of yamlText.split("\n")) {
    const match = line.match(/^([^#\s][^:]*?):\s*"(.*)"\s*$/);
    if (match) {
      translations[match[1].trim()] = match[2];
    }
  }
  return translations;
}

/**
 * 翻訳定義ファイルを読み込み、英名から日本語名への対応表を返す。
 * ビルド時にのみ呼び出すこと。
 */
export function loadTranslations(): Record<string, string> {
  const filePath = resolve(process.cwd(), TRANSLATIONS_FILE_PATH);
  let yamlText: string;
  try {
    yamlText = readFileSync(filePath, "utf-8");
  } catch (cause) {
    throw new Error(`翻訳定義ファイルを読み込めません: ${filePath}`, { cause });
  }
  return parseTranslations(yamlText);
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
