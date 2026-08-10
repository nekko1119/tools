import type {
  QuizPattern,
  QuizData,
  FieldKey,
  FieldDef,
  Difficulty,
  DifficultyConfig,
  Question,
  Answer,
  Nightlord,
} from "../../types/nightreign";

const TOTAL_QUESTIONS = 10;

const FIELDS: FieldDef[] = [
  { label: "1日目ボス", key: "night1Boss", optional: false },
  { label: "2日目ボス", key: "night2Boss", optional: false },
  { label: "地変", key: "shiftingEarth", optional: false },
  { label: "イベント", key: "specialEvent", optional: false },
  { label: "追加ボス", key: "extraNightBoss", optional: true },
];

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`要素が見つかりません: #${id}`);
  }
  return el as T;
}

const dataEl = getElement<HTMLScriptElement>("quiz-data");
const { patternsByDlc, translations }: QuizData = JSON.parse(
  dataEl.textContent ?? "{}",
);

const searchParams = new URLSearchParams(location.search);
const dlcEnabled = searchParams.get("dlc") !== "off";

const activePatternSet = dlcEnabled ? patternsByDlc.on : patternsByDlc.off;
const ACTIVE_NIGHTLORDS = activePatternSet.nightlords;
const ACTIVE_UNIQUE_PATTERNS = activePatternSet.unique;
const ACTIVE_HARD_UNIQUE_PATTERNS = activePatternSet.hard;

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { label: "初級", pool: "default", multiCount: 0, choiceCount: 4 },
  normal: {
    label: "中級",
    pool: "default",
    multiCount: 1,
    choiceCount: ACTIVE_NIGHTLORDS.length,
  },
  hard: {
    label: "上級",
    pool: "hard",
    multiCount: 0,
    choiceCount: ACTIVE_NIGHTLORDS.length,
  },
};

function isDifficulty(value: string | null): value is Difficulty {
  return value !== null && Object.hasOwn(DIFFICULTY_CONFIG, value);
}

const requestedDifficulty = searchParams.get("difficulty");
const difficulty: Difficulty = isDifficulty(requestedDifficulty)
  ? requestedDifficulty
  : "normal";
const difficultyConfig = DIFFICULTY_CONFIG[difficulty];

getElement("difficulty-badge").textContent = difficultyConfig.label;
getElement("dlc-badge").textContent = dlcEnabled ? "DLC: あり" : "DLC: なし";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function translate(key: string): string {
  return translations[key] ?? key;
}

function toBulletList(names: string[]): string {
  return `<ul class="list-disc list-inside">${names.map((n) => `<li>${n}</li>`).join("")}</ul>`;
}

function fieldDisplay(question: QuizPattern, key: FieldKey): string {
  const val = question[key];
  if (!val) return "—";
  if (key === "shiftingEarth" && val === "Default") return "なし";
  return translate(val);
}

function buildChoices(question: QuizPattern): Nightlord[] {
  if (
    question.correctNightlords.length > 1 ||
    difficultyConfig.choiceCount >= ACTIVE_NIGHTLORDS.length
  ) {
    return ACTIVE_NIGHTLORDS;
  }
  const correct = question.correctNightlords[0];
  const wrongPool = ACTIVE_NIGHTLORDS.filter((nl) => nl !== correct);
  const wrongCount = difficultyConfig.choiceCount - 1;
  return shuffle([correct, ...shuffle(wrongPool).slice(0, wrongCount)]);
}

function generateQuestions(): Question[] {
  if (difficultyConfig.pool === "hard") {
    return shuffle(ACTIVE_HARD_UNIQUE_PATTERNS)
      .slice(0, TOTAL_QUESTIONS)
      .map((q) => ({ ...q, choices: buildChoices(q) }));
  }

  const multi = ACTIVE_UNIQUE_PATTERNS.filter(
    (p) => p.correctNightlords.length > 1,
  );
  const single = ACTIVE_UNIQUE_PATTERNS.filter(
    (p) => p.correctNightlords.length === 1,
  );
  const multiCount = Math.min(difficultyConfig.multiCount, multi.length);
  const picked = [
    ...shuffle(multi).slice(0, multiCount),
    ...shuffle(single).slice(0, TOTAL_QUESTIONS - multiCount),
  ];
  return shuffle(picked).map((q) => ({ ...q, choices: buildChoices(q) }));
}

const questions = generateQuestions();
let currentIndex = 0;
const answers: Answer[] = [];

function renderQuestion(): void {
  const q = questions[currentIndex];

  getElement("question-counter").textContent = `10問中${currentIndex + 1}問目`;

  getElement("fields-table").innerHTML = FIELDS.filter(
    (f) => !(f.optional && !q[f.key]),
  )
    .map(
      (f) =>
        `<tr><th class="text-sm font-medium w-24 sm:w-36">${f.label}</th><td>${fieldDisplay(q, f.key)}</td></tr>`,
    )
    .join("");

  getElement("multiple-hint").classList.toggle(
    "hidden",
    q.correctNightlords.length <= 1,
  );

  getElement("nightlord-grid").innerHTML = q.choices
    .map(
      (
        nl,
      ) => `<label class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-base-200 select-none">
      <input type="checkbox" class="checkbox checkbox-sm nightlord-checkbox" value="${nl}" />
      <span>${translate(nl)}</span>
    </label>`,
    )
    .join("");

  getElement("feedback-panel").classList.add("hidden");
  getElement("submit-btn").classList.remove("hidden");
  getElement("next-btn").classList.add("hidden");
}

function submitAnswer(): void {
  const selected = Array.from(
    document.querySelectorAll<HTMLInputElement>(".nightlord-checkbox:checked"),
  ).map((cb) => cb.value);

  if (selected.length === 0) return;

  const q = questions[currentIndex];
  const correctSet = new Set<string>(q.correctNightlords);
  const selectedSet = new Set(selected);
  const isCorrect =
    selectedSet.size === correctSet.size &&
    [...selectedSet].every((n) => correctSet.has(n));

  answers.push({ question: q, selected, isCorrect });

  document
    .querySelectorAll<HTMLInputElement>(".nightlord-checkbox")
    .forEach((cb) => {
      cb.disabled = true;
    });
  getElement("submit-btn").classList.add("hidden");

  getElement("feedback-panel").classList.remove("hidden");

  const feedbackResult = getElement("feedback-result");
  feedbackResult.textContent = isCorrect ? "正解！" : "不正解";
  feedbackResult.className = isCorrect
    ? "font-bold text-xl mb-2 text-success"
    : "font-bold text-xl mb-2 text-error";

  getElement("correct-answer").innerHTML = toBulletList(
    q.correctNightlords.map((n) => translate(n)),
  );

  const nextBtn = getElement("next-btn");
  nextBtn.classList.remove("hidden");
  nextBtn.textContent =
    currentIndex >= TOTAL_QUESTIONS - 1 ? "結果を見る" : "次の問題へ";
}

function nextQuestion(): void {
  if (currentIndex >= TOTAL_QUESTIONS - 1) {
    showResult();
    return;
  }
  currentIndex++;
  renderQuestion();
}

function showResult(): void {
  getElement("quiz-view").classList.add("hidden");
  getElement("result-view").classList.remove("hidden");

  const score = answers.filter((a) => a.isCorrect).length;
  getElement("score").textContent = String(score);

  const shareText = `標的不明クイズ(難易度: ${difficultyConfig.label}, DLC: ${dlcEnabled ? "あり" : "なし"}): ${score} / ${TOTAL_QUESTIONS} 問正解！ #ELDENRING_NIGHTREIGN`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(location.href)}`;
  getElement<HTMLAnchorElement>("share-btn").href = shareUrl;

  getElement("result-tbody").innerHTML = answers
    .map((a, i) => {
      const q = a.question;
      const fieldValues = FIELDS.filter((f) => !(f.optional && !q[f.key]))
        .map((f) => fieldDisplay(q, f.key))
        .join(" / ");
      const yourAnswer = toBulletList(a.selected.map((n) => translate(n)));
      const correctAnswer = toBulletList(
        q.correctNightlords.map((n) => translate(n)),
      );
      const judge = a.isCorrect
        ? '<span class="text-success font-bold">○</span>'
        : '<span class="text-error font-bold">✗</span>';
      return `<tr>
        <td>${i + 1}</td>
        <td class="text-xs">${fieldValues}</td>
        <td>${yourAnswer}</td>
        <td>${correctAnswer}</td>
        <td class="text-center">${judge}</td>
      </tr>`;
    })
    .join("");
}

getElement("nightlord-grid").addEventListener("change", (e) => {
  const target = e.target as HTMLElement;
  if (!target.classList.contains("nightlord-checkbox")) return;
  if (
    questions[currentIndex].correctNightlords.length === 1 &&
    (target as HTMLInputElement).checked
  ) {
    document
      .querySelectorAll<HTMLInputElement>(".nightlord-checkbox")
      .forEach((cb) => {
        if (cb !== target) cb.checked = false;
      });
  }
});

getElement("submit-btn").addEventListener("click", submitAnswer);
getElement("next-btn").addEventListener("click", nextQuestion);

renderQuestion();
