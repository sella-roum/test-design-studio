# Phase 8-9 技法・AI・Playwright連携タスク詳細

この文書は、Phase 8〜9 のテスト技法ワークベンチ、AI向け出力、Playwright草案出力の実装タスクを定義する。

Phase 8〜9は、構造化済みの設計データが十分に蓄積された後に価値が出る。先にAI API連携やコード生成を作ると、設計データの品質不足をAIでごまかす形になりやすい。そのため、まずは候補生成、レビュー、Export品質を重視する。

## 共通参照

- `docs/specs/01-domain-model.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/06-traceability-spec.md`
- `docs/specs/08-test-design-workbench.md`
- `docs/specs/09-non-goals.md`

## 共通ルール

- 生成候補は自動採用しない。
- ユーザーが採用・編集・却下できる状態にする。
- AI API呼び出しは初期実装しない。
- 実行可能なPlaywrightコードの完全生成は初期実装しない。
- 出力は構造化データの品質確認にも使える形にする。

## PR-025: DataTypeから観点候補生成

### Goal

DataTypeの制約から、同値分割・境界値分析のテスト観点候補を生成できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- 同値分割候補生成を追加する。
- 境界値候補生成を追加する。
- 候補レビューUIを追加する。
- 採用した候補をTestViewpointとして保存する。
- 採用時にDataTypeとのTraceLinkを作成できるようにする。

### Non-goals

- 状態遷移テストは実装しない。
- デシジョンテーブルは実装しない。
- AI生成は実装しない。
- TestCaseの完全自動生成は実装しない。

### Acceptance criteria

- required / min / max / minLength / maxLength / patternなどから候補を生成できる。
- 有効同値クラスと無効同値クラスを区別できる。
- 境界値候補を生成できる。
- 生成候補を採用・編集・却下できる。
- 採用した候補がTestViewpointとして保存される。
- 生成ロジックに単体テストがある。

## PR-026: BusinessRuleからデシジョンテーブル観点候補生成

### Goal

BusinessRuleの条件と結果から、条件組み合わせの観点候補を生成できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- DecisionTableモデルを追加する。
- 条件、アクション、ルール行を保存できるようにする。
- 観点候補生成を追加する。
- 候補をTestViewpointとして保存できるようにする。
- BusinessRuleと生成観点のTraceLinkを作成できるようにする。

### Non-goals

- 全組み合わせ最適化の高度なアルゴリズムは実装しない。
- AI生成は実装しない。
- 外部仕様書からの自動抽出は実装しない。
- 複雑な制約解決エンジンは実装しない。

### Acceptance criteria

- BusinessRuleに条件と結果を登録できる。
- 条件組み合わせから観点候補を生成できる。
- 無効または不要な組み合わせを除外できる。
- 候補を採用・編集・却下できる。
- 候補をTestViewpointとして保存できる。
- 生成ロジックに単体テストがある。

## PR-027: AI context export

### Goal

AIに渡しやすいFeature単位のコンテキストを出力できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/06-traceability-spec.md`
- `docs/specs/09-non-goals.md`

### Scope

- AI context export用のJSON生成を追加する。
- AI context export用のMarkdown生成を追加する。
- 仕様、UI、データ、ルール、観点、ケース、変更履歴、未確認事項を含める。
- TraceLinkを使って、観点・ケースの根拠を出力できるようにする。
- AIに渡さない方がよい内部情報を除外する方針を定義する。

### Non-goals

- AI API呼び出しは実装しない。
- Playwrightコード生成は実装しない。
- プロンプト自動実行は実装しない。
- 外部LLMサービス設定画面は実装しない。

### Acceptance criteria

- Feature単位でAI向けcontextを出力できる。
- contextに仕様・UI・データ・ルール・観点・ケース・TraceLinkが含まれる。
- MarkdownとJSONの両方で出力できる。
- AIへ渡す前提で不足情報や未確認事項が分かる。
- 出力生成関数にテストがある。

## PR-028: Playwright draft export

### Goal

構造化されたテストケースから、Playwright実装の草案に利用できる情報を出力する。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/09-non-goals.md`

### Scope

- Playwright draft用Markdownを生成する。
- TestCaseのsteps / expectedResult / selectorHintを出力する。
- 自動化可否と注意点を出力する。
- selectorHintがない場合の不足情報を出力する。
- 実装者向けの確認事項を出力する。

### Non-goals

- 実行可能なPlaywrightコードの完全生成は実装しない。
- ブラウザ実行は実装しない。
- 自己修復テストは実装しない。
- CIでのE2E実行は実装しない。
- 認証情報や秘密情報を出力しない。

### Acceptance criteria

- TestCase単位でPlaywright実装に必要な情報を出力できる。
- selectorHintがある場合は出力に含まれる。
- selectorHintがない場合は不足情報として表示される。
- 自動化対象外の理由も出力できる。
- 実装者がPlaywright化の可否を判断できる内容になっている。
- 出力生成関数にテストがある。

## 実装上の注意

AIとPlaywright連携は、構造化データが十分に蓄積された後に価値が出る。先にAI API連携を実装すると、設計データの品質不足をAIでごまかす形になりやすい。Phase 8-9では、まず出力品質とコンテキスト構造を重視する。

## Phase 8-9で明確にやらないこと

- AI APIキー管理。
- LLMへの直接リクエスト。
- Playwrightコードの完全自動生成。
- Playwrightテストの実行。
- テスト失敗時の自己修復。
- 外部仕様書からの自動読み取り。
