# Test Design Studio

Test Design Studio は、Webアプリケーションの仕様把握、UI構造、データ条件、業務ルール、未確認事項、テスト観点、テストケース、変更履歴、トレーサビリティを構造化して扱う、ローカルファーストなテスト設計ワークスペースです。

単なるテストケース管理ではなく、テストケースに至る前提や根拠を残し、将来的な回帰テスト再設計、変更影響確認、Playwright自動化準備、AIエージェント向けcontext exportにつなげることを目的とします。

## Current status

**Foundation Phase 完了。**

このリポジトリは、後続すべてのPhaseが依存する最小基盤（アプリ基盤、品質ゲート、IndexedDB保存層、全ドメインモデル、Repository層）を確立しました。

### 実装済み

- Vite + React + TypeScript アプリ基盤
- 初期画面（アプリ名、プロダクト概要、空状態）
- ESLint / Prettier / Vitest / Testing Library
- GitHub Actions quality gate（`npm run check`）
- Dexie-based IndexedDB 基盤
- ドメインモデル一式（Project, Feature, Screen, UiNode, DataEntity, DataField, DataType, BusinessRule, TestViewpoint, TestCase, TestStep, OpenQuestion, TraceLink, ChangeRecord）
- Repository層（CRUD + 論理削除）
- Repositoryテスト（149 tests）
- Reserved model hooks（State, StateTransition, Flow, FlowStep, ErrorCase, DecisionTable, Evidence）

### 未実装（今後のPhase）

- 各ドメインの編集画面 UI
- Chrome 拡張
- Accessibility Tree 取得
- Import / Export ワークフロー
- AI 生成支援
- Playwright コード生成
- クラウド同期
- 認証

## Product direction

Test Design Studio は、次の情報を関連づけて管理することを目指します。

- Project / Feature / Screen
- UI要素を表す `UiNode`
- DataType / DataEntity / DataField
- BusinessRule
- OpenQuestion
- TestViewpoint
- TestCase / TestStep
- TraceLink
- ChangeRecord
- Chrome拡張やPlaywright等から取得したUI候補を表す `UiCaptureCandidate`

重要な方針は、DOMやAccessibility Treeをそのまま仕様正本にしないことです。取得結果は候補として扱い、利用者が確認・編集してから `UiNode` やテスト設計情報へ反映します。

## Staged MVP

### Foundation Phase

アプリ基盤、品質ゲート、ローカル保存層、ドメインモデル、Repositoryを確立。

### P0: Web Design MVP

Webアプリ単体で、1機能分の仕様把握、観点作成、ケース作成、Markdown / JSON 出力までを成立させます。

### P1: Capture & Trace MVP

Chrome拡張で実画面からUI候補を取り込み、変更履歴と影響追跡に接続します。

### P2: Assistive Design MVP

構造化済みデータを使って、テスト技法ベースの観点候補生成、AIレビュー支援、Playwright draft exportへ進みます。

## Repository structure

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── package-lock.json
├── index.html
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── .gitignore
├── .github/
│   ├── pull_request_template.md
│   └── workflows/
│       └── check.yml
├── docs/
│   ├── design.md
│   ├── agents/
│   ├── plans/
│   └── specs/
└── src/
    ├── App.tsx
    ├── App.test.tsx
    ├── main.tsx
    ├── index.css
    ├── test-setup.ts
    └── lib/
        ├── constants.ts
        ├── db.ts
        ├── errors.ts
        ├── id.ts
        ├── types.ts
        ├── models/
        └── repositories/
```

## Important documents

実装者・AIエージェント・レビュアーは、次の順で確認してください。

1. `AGENTS.md`
2. `docs/agents/coding-instructions.md`
3. 対応する `docs/plans/tasks/*.md` の `Scope / Non-goals / Acceptance criteria`
4. `docs/plans/task-breakdown.md`
5. `docs/plans/implementation-plan.md`
6. 対象領域の `docs/specs/*.md`
7. UI実装時は `docs/specs/ui/README.md` と対象画面のUI仕様
8. `docs/design.md`

`docs/design.md` は長期構想を含む親設計書です。実装時にそのまま全体を実装してはいけません。現在対応するフェーズのScopeを優先してください。

## Implementation rules

- 1PRでは原則として1つのフェーズだけを扱います。
- フェーズ内の複数Taskをまとめて実装してよい。ただし、PR本文に含めたTask ID、Scope、Non-goals、検証結果を明記します。
- `Scope` に書かれていない機能をついでに実装しません。
- `Non-goals` に書かれている内容は実装しません。
- UIだけ、型だけ、保存処理だけで終わる中途半端な変更を避けます。
- DexieのschemaVersionを変更する場合は、migration方針を明記します。
- DOM解析およびAccessibility Tree解析は入力補助であり、仕様の完全自動生成として扱いません。

## Task flow

Task IDは `docs/plans/task-breakdown.md` で管理します。

**Completed:**

- Foundation Phase (TASK-002～TASK-010A)

**Next:**

- Phase 3: Web application UI phase
  - Project workspace UI
  - Feature / Screen editing UI
  - UiNode tree UI
  - Test viewpoint and test case editing UI

## Local development

ローカルでは次のコマンドを使用します。

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run check
```

`npm run check` は、TypeScript型チェック、ESLint、Prettier形式チェック、Vitestをまとめて実行します。

## Non-goals for early phases

P0/P1では、次を実装しません。

- クラウド同期
- 認証
- 複数ユーザー同時編集
- AIによる仕様やテストケースの自動確定
- Playwright specの自動生成・実行
- 外部SaaS連携
- 対象アプリのDOMやAccessibility Treeからの仕様完全自動生成

詳細は `docs/specs/09-non-goals.md` を参照してください。

## Pull request checklist

PR本文には、最低限次を記載してください。

- 対応したTask ID
- 実装したScope
- 実装しなかったNon-goals
- 変更ファイル
- 動作確認結果
- 未対応事項または次PRへの引き継ぎ

## License

未定義です。配布・再利用の方針が決まった段階で明記します。
