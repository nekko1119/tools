import { readFileSync, writeFileSync } from "fs";

const yamlPath = "data/nightreign_translations.yaml";

const REMOVE_KEYS = new Set([
  "Above Stormhill Tunnel Entrance",
  "Banished Knights",
  "Beastly Brigade",
  "Beastmen of Farum Azula",
  "Below Summonwater Hawk",
  "Bloodhound Knight",
  "Camp - Banished Knights",
  "Camp - Elder Lion",
  "Camp - Flame Chariots",
  "Camp - Frenzied Flame Troll",
  "Camp - Leonine Misbegotten",
  "Camp - Redmane Knights",
  "Camp - Royal Army Knights",
  "Church - Normal",
  "Church - Rats",
  "Crucible Knight with Spear",
  "Crucible Knight with Sword",
  "Crucible Knights",
  "Crystalians",
  "Difficult Sorcerer's Rise - Above Door, Teleporting Trees, Missing Statue",
  "Difficult Sorcerer's Rise - Fake Building, Pool Reflection, Second Floor",
  "Difficult Sorcerer's Rise - Fake Building, Right of Door, Unlit Candle",
  "Difficult Sorcerer's Rise - Imp Statue, Teleporting Trees, Fleeing Stump",
  "Difficult Sorcerer's Rise - Imp Statue, Windy Trees, Second Floor",
  "Difficult Sorcerer's Rise - Rear Withered Trees, Right of Door, Missing Statue",
  "East of Cavalry Bridge",
  "East of Saintsbridge",
  "Far Southwest",
  "Fort - Abductor Virgin",
  "Fort - Crystalians",
  "Fort - Guardian Golem",
  "Fort - Lordsworn Captain",
  "Godskin Apostle",
  "Godskin Noble",
  "Grave Warden Duelist",
  "Great Church - Fire Monk",
  "Great Church - Guardian Golem",
  "Great Church - Mausoleum Knight",
  "Great Church - Oracle Envoys",
  "Map Event - Artist's Shack",
  "Map Event - Gatefront",
  "Map Event - Minor Erdtree",
  "Map Event - Northeast Mistwood",
  "Map Event - Northeast Stormhill",
  "Map Event - Northwest Mistwood",
  "Map Event - Northwest Stormhill",
  "Map Event - South Lake",
  "Map Event - South Mistwood",
  "Map Event - Summonwater",
  "Map Event - Summonwater Approach",
  "Map Event - West Mistwood",
  "Minor Erdtree",
  "Noklateo Entrance",
  "North of Crater",
  "Northeast Corner",
  "Northeast of Lake",
  "Northeast of Saintsbridge",
  "Northwest Corner",
  "Northwest Lake",
  "Northwest Mistwood Pond",
  "Northwest Rotted Woods",
  "Northwest of Castle",
  "Nox Warriors",
  "Omen",
  "Ruins - Albinauric Archers",
  "Ruins - Albinaurics",
  "Ruins - Ancient Heroes of Zamor",
  "Ruins - Battlemages",
  "Ruins - Beastmen of Farum Azula",
  "Ruins - Depraved Perfumer",
  "Ruins - Erdtree Burial Watchdogs",
  "Ruins - Perfumer",
  "Ruins - Runebear",
  "Ruins - Sanguine Noble",
  "Ruins - Wormface",
  "Small Camp - Caravans",
  "Small Camp - Caravans and Nobles",
  "Small Camp - Demi-Humans",
  "Small Camp - Dogs",
  "Small Camp - Dogs and Soldiers",
  "Small Camp - Foot Soldiers",
  "Small Camp - Guilty",
  "Small Camp - Misbegotten",
  "Small Camp - Nobles and Soldiers",
  "Small Camp - Rats and Demi-Humans",
  "Small Camp - Shack",
  "Small Camp - Soldiers",
  "Small Camp - Wandering Nobles",
  "Sorcerer's Rise - Above Door",
  "Sorcerer's Rise - Fake Building",
  "Sorcerer's Rise - Fleeing Stump",
  "Sorcerer's Rise - Fog Door",
  "Sorcerer's Rise - Imp Statue",
  "Sorcerer's Rise - Missing Statue",
  "Sorcerer's Rise - Pool Reflection",
  "Sorcerer's Rise - Unlit Candle",
  "Sorcerer's Rise - Windy Trees",
  "Sorcerer's Rise - Withered Trees",
  "South Lake",
  "South of Castle",
  "Southeast Mountaintop",
  "Southeast Rotted Woods",
  "Southeast of Lake",
  "Southwest Corner",
  "Southwest Mistwood",
  "Stoneskin Lords",
  "Stormhill South of Gate",
  "Township - Township",
  "Trolls",
  "West Stormhill Graveyard",
  "West of Warmaster's Shack",
]);

// セクションごとに追加するキー
const ADD_TO_SECTION: Record<string, string[]> = {
  "# --- Nightlord ---": ["Harmonia", "Straghess"],
  "# --- Night Boss / Extra Night Boss ---": [
    "Curseblade and Divine Beast Warrior",
    "Death Knights",
    "Demon Prince",
    "Demon Princes",
    "Divine Beast Dancing Lion",
    "Great Red Bear",
    "Knight Artorias",
    "Mohg",
  ],
  "# --- Shifting Earth ---": ["Great Hollow"],
  "# --- Special Event ---": [
    "Day 1 Balancers Raid",
    "Day 1 Caligo Blizzard",
    "Day 1 Gladius Invasion",
    "Day 1 Gradius Invasion",
    "Day 2 Caligo Blizzard",
    "Day 2 Gladius Invasion",
  ],
};

const extractKey = (line: string): string | null => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx === -1) return null;
  return trimmed.slice(0, colonIdx).trim();
};

const lines = readFileSync(yamlPath, "utf-8").split("\n");
const output: string[] = [];
let currentSection = "";

for (const line of lines) {
  const trimmed = line.trim();

  // セクションヘッダーの検出
  if (trimmed.startsWith("# ---")) {
    // 前のセクションへの追加エントリを挿入
    if (currentSection && ADD_TO_SECTION[currentSection]) {
      for (const key of ADD_TO_SECTION[currentSection]) {
        output.push(`${key}: ""`);
      }
    }
    currentSection = trimmed;
    output.push(line);
    continue;
  }

  // 削除対象キーはスキップ
  const key = extractKey(line);
  if (key !== null && REMOVE_KEYS.has(key)) continue;

  output.push(line);
}

// 最終セクションへの追加
if (currentSection && ADD_TO_SECTION[currentSection]) {
  for (const key of ADD_TO_SECTION[currentSection]) {
    output.push(`${key}: ""`);
  }
}

writeFileSync(yamlPath, output.join("\n"));

const removed = REMOVE_KEYS.size;
const added = Object.values(ADD_TO_SECTION).flat().length;
console.log(`削除: ${removed}件、追加: ${added}件`);
