import data from "../data/nightreign_map_pattern.json" with { type: "json" };

type Entry = Record<string, unknown>;

// nightlord以外のフィールドをキーにグループ化
const groups = new Map<string, string[]>();

for (const entry of data as Entry[]) {
  const { nightlord, ...rest } = entry as { nightlord: string } & Entry;
  if (!nightlord) continue;

  const key = JSON.stringify(rest);
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key)!.push(nightlord);
}

// 異なるnightlordが同じ残フィールドを持つケースを抽出
const conflicts = [...groups.entries()].filter(
  ([, lords]) => new Set(lords).size > 1,
);

if (conflicts.length === 0) {
  console.log(
    "該当なし: nightlord以外が完全一致するエントリの組み合わせは存在しません。",
  );
} else {
  console.log(`該当あり: ${conflicts.length}件\n`);
  for (const [key, lords] of conflicts) {
    const rest = JSON.parse(key) as Entry;
    console.log("Nightlord:", [...new Set(lords)].join(", "));
    for (const [k, v] of Object.entries(rest)) {
      const display =
        typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
      console.log(`  ${k}: ${display}`);
    }
    console.log();
  }
}
