# Phase 8-9 技法・AI・Playwright連携タスク詳細

## PR-025: DataTypeから観点候補生成

### Goal
DataTypeの制約から、同値分割・境界値分析のテスト観点候補を生成できるようにする。

### Scope
- 同値分割候補生成を追加する。
- 境界値候補生成を追加する。
- 候補レビューUIを追加する。
- 採用した候補をTestViewpointとして保存する。

### Non-goals
- 状態遷移テストは実装しない。
- デシジョンテーブルは実装しない。
- AI生成は実装しない。

### Acceptance criteria
- min / max / required / patternなどから候補を生成できる。
- 生成候補を採用・編集・却下できる。
- 採用した候補がTestViewpointとして保存される。

## PR-026: BusinessRuleからデシジョンテーブル観点候補生成

### Goal
BusinessRuleの条件と結果から、条件組み合わせの観点候補を生成できるようにする。

### Scope
- DecisionTableモデルを追加する。
- 条件、アクション、ルール行を保存できるようにする。
- 観点候補生成を追加する。
- 候補をTestViewpointとして保存できるようにする。

### Non-goals
- 全組み合わせ最適化の高度なアルゴリズムは実装しない。
- AI生成は実装しない。
- 外部仕様書からの自動抽出は実装しない。

### Acceptance criteria
- BusinessRuleに条件と結果を登録できる。
- 条件組み合わせから観点候補を生成できる。
- 候補をTestViewpointとして保存できる。

## PR-027: AI context export

### Goal
AIに渡しやすいFeature単位のコンテキストを出力できるようにする。

### Scope
- AI context export用のJSON生成を追加する。
- AI context export用のMarkdown生成を追加する。
- 仕様、UI、データ、ルール、観点、ケース、変更履歴、未確認事項を含める。

### Non-goals
- AI API呼び出しは実装しない。
- Playwrightコード生成は実装しない。
- プロンプト自動実行は実装しない。

### Acceptance criteria
- Feature単位でAI向けcontextを出力できる。
- contextに仕様・観点・ケース・TraceLinkが含まれる。
- MarkdownとJSONの両方で出力できる。

## PR-028: Playwright draft export

### Goal
構造化されたテストケースから、Playwright実装の草案に利用できる情報を出力する。

### Scope
- Playwright draft用Markdownを生成する。
- TestCaseのsteps / expectedResult / selectorHintを出力する。
- 自動化可否と注意点を出力する。

### Non-goals
- 実行可能なPlaywrightコードの完全生成は実装しない。
- ブラウザ実行は実装しない。
- 自己修復テストは実装しない。

### Acceptance criteria
- TestCase単位でPlaywright実装に必要な情報を出力できる。
- selectorHintがある場合は出力に含まれる。
- 自動化対象外の理由も出力できる。

## 実装上の注意

AIとPlaywright連携は、構造化データが十分に蓄積された後に価値が出る。先にAI API連携を実装すると、設計データの品質不足をAIでごまかす形になりやすい。Phase 8-9では、まず出力品質とコンテキスト構造を重視する。
