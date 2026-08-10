import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const INPUT = resolve("data/nightreign_map_pattern.csv");
const OUTPUT = resolve("data/nightreign_map_pattern.json");

function parseRow(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

type Row = Record<string, string | Record<string, string>>;

function convert(content: string): Row[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");

  const header1 = parseRow(lines[0]);
  const header2 = parseRow(lines[1]);

  return lines.slice(2).map((line) => {
    const values = parseRow(line);
    const row: Row = {};

    for (let i = 0; i < header1.length; i++) {
      const key = header1[i];
      const sub = header2[i];
      const value = values[i] ?? "";

      if (key === "") continue;

      // row2にサブヘッダーがある列はオブジェクトとしてグループ化
      if (sub !== "") {
        if (typeof row[key] !== "object") row[key] = {};
        (row[key] as Record<string, string>)[sub] = value;
      } else {
        row[key] = value;
      }
    }

    return row;
  });
}

const csv = readFileSync(INPUT, "utf-8");
const json = convert(csv);

writeFileSync(OUTPUT, JSON.stringify(json, null, 2), "utf-8");
console.log(`${json.length}件を ${OUTPUT} に書き出しました`);
