export type Nightlord =
  | "Gladius"
  | "Adel"
  | "Gnoster"
  | "Maris"
  | "Libra"
  | "Fulghor"
  | "Caligo"
  | "Heolstor"
  | "Harmonia"
  | "Straghess";

export type ShiftingEarth =
  | "Default"
  | "Mountaintop"
  | "Crater"
  | "Rotted Woods"
  | "Noklateo"
  | "Great Hollow";

export type SpecialEvent =
  | ""
  | "Day 1 Balancers Raid"
  | "Day 1 Caligo Blizzard"
  | "Day 1 Extra Night Boss"
  | "Day 1 Gladius Invasion"
  | "Day 1 Gnoster Plague"
  | "Day 1 Libra Curse"
  | "Day 1 Maris Bubbles"
  | "Day 1 Meteor Strike"
  | "Day 1 Morgott Invasion"
  | "Day 1 Night Horde"
  | "Day 2 Caligo Blizzard"
  | "Day 2 Extra Night Boss"
  | "Day 2 Gladius Invasion"
  | "Day 2 Gnoster Plague"
  | "Day 2 Libra Curse"
  | "Day 2 Maris Bubbles"
  | "Day 2 Meteor Strike"
  | "Day 2 Morgott Invasion"
  | "Day 2 Night Horde"
  | "Difficult Sorcerer's Rise"
  | "Frenzy Tower"
  | "Walking Mausoleum";

export type Night1Boss =
  | "Battlefield Commander"
  | "Bell Bearing Hunter"
  | "Centipede Demon"
  | "Curseblade and Divine Beast Warrior"
  | "Death Knights"
  | "Demi-Human Queen and Swordmaster"
  | "Demon Princes"
  | "Gaping Dragon"
  | "Grafted Monarch"
  | "Great Red Bear"
  | "Night's Cavalry Duo"
  | "Royal Revenant"
  | "Smelter Demon"
  | "The Duke's Dear Freja"
  | "Tibia Mariner"
  | "Ulcerated Tree Spirit"
  | "Valiant Gargoyle"
  | "Wormface";

export type Night2Boss =
  | "Ancient Dragon"
  | "Crucible Knight and Golden Hippopotamus"
  | "Dancer of the Boreal Valley"
  | "Death Rite Bird"
  | "Demon Prince"
  | "Divine Beast Dancing Lion"
  | "Draconic Tree Sentinel and Royal Cavalrymen"
  | "Dragonkin Soldier"
  | "Fallingstar Beast"
  | "Godskin Duo"
  | "Great Wyrm"
  | "Knight Artorias"
  | "Mohg"
  | "Morgott"
  | "Nameless King"
  | "Outland Commander"
  | "Tree Sentinel and Royal Cavalrymen";

export type NightreignMapPattern = {
  nightlord: Nightlord;
  shiftingEarth: ShiftingEarth;
  isDLC: boolean;
  specialEvent: SpecialEvent;
  night1Boss: Night1Boss;
  night2Boss: Night2Boss;
  extraNightBoss: string;
};

export type QuizPattern = {
  shiftingEarth: ShiftingEarth;
  specialEvent: SpecialEvent;
  night1Boss: Night1Boss;
  // 難易度「上級」では2日目ボスを隠すため値が存在しないことがある
  night2Boss?: Night2Boss;
  extraNightBoss: string;
  correctNightlords: Nightlord[];
};

export type PatternSet = {
  unique: QuizPattern[];
  hard: QuizPattern[];
  nightlords: Nightlord[];
};

export type QuizData = {
  patternsByDlc: {
    on: PatternSet;
    off: PatternSet;
  };
  translations: Record<string, string>;
};

export type FieldKey = Exclude<
  keyof NightreignMapPattern,
  "nightlord" | "isDLC"
>;

export type FieldDef = {
  label: string;
  key: FieldKey;
  optional: boolean;
};

export type Difficulty = "easy" | "normal" | "hard";

export type DifficultyConfig = {
  label: string;
  pool: "default" | "hard";
  multiCount: number;
  choiceCount: number;
};

export type Question = QuizPattern & { choices: Nightlord[] };

export type Answer = {
  question: Question;
  selected: string[];
  isCorrect: boolean;
};
