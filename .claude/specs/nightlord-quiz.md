# Nightlord Quiz 仕様

## 概要

nightlordフィールドを隠して他のフィールドを表示し、どのナイトロードかを当てるクイズアプリ。

## ページ

`/nightreign/nightlord-quiz`  
実装ファイル: `src/pages/nightreign/nightlord-quiz.astro`

## データ

- ソース: `data/nightreign_map_pattern.json`（520件）
- 翻訳定義: `data/nightreign_translations.yaml`
- **表示フィールド（日本語翻訳して表示）**: `shiftingEarth`, `specialEvent`, `night1Boss`, `night2Boss`, `extraNightBoss`
- **隠すフィールド**: `nightlord`

### ナイトロード一覧（10人）

Adel, Caligo, Fulghor, Gladius, Gnoster, Harmonia, Heolstor, Libra, Maris, Straghess

### 一意でない組み合わせ

同じフィールド値の組み合わせが複数のナイトロードに対応するパターンが12種存在する。
これらは複数選択が必要な問題になる。

## 問題生成ロジック

1. 520件のデータを `nightlord` 以外のフィールド組み合わせでユニーク化する
2. ユニーク化した各パターンに対して、正解ナイトロードのセット（`string[]`）を計算する
   - 一意なパターン: 正解ナイトロードは1人
   - 非一意なパターン: 正解ナイトロードは複数人（全員選択が必要）
3. ユニーク化したパターンからランダムに10問選出する

## 回答UI

- 問題ページ上部に「10問中X問目」を表示する
- 10人のナイトロードを**チェックボックス形式**で一覧表示（全問共通）
- 正解が複数ナイトロードの場合のみ「複数選択あり」ヒントを表示する
- 「回答する」ボタンで回答確定
- 正解判定: 選択したナイトロードのセットと正解セットが**完全一致**

## 1問ごとのフロー

```
問題表示
  → フィールド一覧（日本語訳） + ナイトロード選択UI
  → 「回答する」ボタンで確定
  → 即時フィードバック（正解/不正解 + 正解ナイトロード名表示）
  → 「次の問題へ」（10問目は「結果を見る」）
```

## 結果ページ（10問終了後）

- スコア表示（X / 10）
- 10問分の一覧テーブル:
  | 問  | 表示フィールド | あなたの回答 | 正解 | 判定 |
  | --- | -------------- | ------------ | ---- | ---- |
- 「もう一度挑戦」ボタン（新たにランダム10問を生成）

## 型定義

```typescript
type QuizQuestion = {
  pattern: Omit<NightreignMapPattern, "nightlord">;
  correctNightlords: string[]; // 正解ナイトロードのセット（1人以上）
};

type QuizAnswer = {
  question: QuizQuestion;
  selectedNightlords: string[]; // ユーザーが選択したセット
  isCorrect: boolean;
};

type QuizPhase = "answering" | "feedback" | "result";
```

## コンポーネント構成

```
src/pages/nightreign/nightlord-quiz.astro
  └─ src/components/nightreign/NightlordQuiz.tsx   (client:load)
       ├─ QuestionCard.tsx                          (問題・選択UI)
       ├─ FeedbackPanel.tsx                         (正誤フィードバック)
       └─ ResultPage.tsx                            (結果ページ)
```

## 翻訳

`data/nightreign_translations.yaml` を使用するのはJSONデータの値（ナイトロード名・ボス名・シフティングアース名・スペシャルイベント名）を日本語表示する場合のみ。

UIテキスト（ボタンラベル、見出し、フィードバック文言など）はコンポーネント内に日本語で直接記述する。
