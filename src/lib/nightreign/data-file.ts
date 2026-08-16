import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * data ディレクトリの yaml を読み解く。ビルド時にのみ呼び出すこと。
 * 中身が空のファイルは undefined を返す。
 */
export function readDataYaml(relativePath: string): unknown {
  const filePath = resolve(process.cwd(), relativePath);

  let yamlText: string;
  try {
    yamlText = readFileSync(filePath, "utf-8");
  } catch (cause) {
    throw new Error(`${relativePath} を読み込めません`, { cause });
  }

  try {
    return parseYaml(yamlText);
  } catch (cause) {
    throw new Error(`${relativePath} の書式が不正です`, { cause });
  }
}

/** ファイルが無ければ undefined を返す。拠点ごとに任意で置くファイル向け */
export function readOptionalDataYaml(relativePath: string): unknown {
  if (!existsSync(resolve(process.cwd(), relativePath))) {
    return undefined;
  }
  return readDataYaml(relativePath);
}
