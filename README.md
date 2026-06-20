# Test Design Studio

Test Design Studio は、Webアプリケーションの仕様把握、UI構造、データ条件、業務ルール、未確認事項、テスト観点、テストケース、変更履歴、トレーサビリティを構造化して扱う、ローカルファーストなテスト設計ワークスペースです。

単なるテストケース管理ではなく、テストケースに至る前提や根拠を残し、将来的な回帰テスト再設計、変更影響確認、Playwright自動化準備、AIエージェント向けcontext exportにつなげることを目的とします。

## Current status

このリポジトリは現在、実装前の設計・タスク分解を完了し、Vite + React + TypeScript の最小アプリ基盤と最低限の品質ゲートを追加した段階です。

現時点で追加済みのものは次の通りです。

- Vite + React + TypeScript のWebアプリ基盤
- 初期画面のアプリ名、プロダクト概要、空状態
- ESLint
- Prettier
- Vitest
- Testing Library
- GitHub Actions の `check` ワークフロー

未実装の主な領域は、ドメインモデル、IndexedDB / Dexie、Project作成画面、Chrome拡張、AI支援、Playwright連携です。

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

このプロジェクトでは、MVPを単発の簡易版ではなく、段階的に価値を積み上げる実装単位として扱います。

### P0: Web Design MVP

Webアプリ単体で、1機能分の仕様把握、観点作成、ケース作成、Markdown / JSON 出力までを成立させます。

対象範囲の例:

- Project / Feature / Screen / UiNode
- DataType / BusinessRule / OpenQuestion
- TestViewpoint / TestCase / TestStep
- TraceLink / ChangeRecord の保存モデル
- Markdown export
- JSON export/import

### P1: Capture & Trace MVP

Chrome拡張で実画面からUI候補を取り込み、変更履歴と影響追跡に接続します。

対象範囲の例:

- Manifest V3 Chrome拡張
- Side Panel / Content Script
- Element Picker
- DOM Capture
- 任意追加のAccessibility Tree Capture Adapter
- UiCaptureCandidate / UiCaptureBundle
- ChangeRecord UI
- TraceLink UI
- 影響候補表示

### P2: Assistive Design MVP

構造化済みデータを使って、テスト技法ベースの観点候補生成、AIレビュー支援、Playwright draft exportへ進みます。

対象範囲の例:

- DataTypeからの観点候補生成
- BusinessRuleからのDecisionTable観点候補生成
- StateTransitionからの観点候補生成
- AI context export
- Playwright draft export

## Repository structure

```text
.
├── AGENTS.md
├── README.md
├── package.json
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
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
    ├── App.css
    ├── index.css
    └── test/
        └── setup.ts
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

`docs/design.md` は長期構想を含む親設計書です。実装時にそのまま全体を実装してはいけません。現在対応するTask IDのScopeを優先してください。

## Implementation rules

- 1PRでは原則として1つのTask IDだけを扱います。
- `Scope` に書かれていない機能をついでに実装しません。
- `Non-goals` に書かれている内容は実装しません。
- UIだけ、型だけ、保存処理だけで終わる中途半端な変更を避けます。
- ただし、`TASK-002` や `TASK-003` のような基盤構築タスクでは、各タスクのAcceptance criteriaを優先します。
- DexieのschemaVersionを変更する場合は、migration方針を明記します。
- DOM解析およびAccessibility Tree解析は入力補助であり、仕様の完全自動生成として扱いません。

## Task flow

Task IDは `docs/plans/task-breakdown.md` で管理します。次に着手するTask IDは、必ずタスク一覧と対応する詳細タスク文書を正本として確認してください。

`TASK-002: Reactアプリ基盤作成` と `TASK-003: 品質ゲート追加` は完了済みです。

次の実装候補は `TASK-004: Dexie初期化` です。TASK-004では、IndexedDBを利用するためのDexie基盤、database module、schemaVersion、database name、テスト用DB分離の入口を追加します。

具体的なScope、Non-goals、Acceptance criteriaは次を参照してください。

- `docs/plans/tasks/phase-0-1.md`
- `docs/plans/task-breakdown.md`

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

`npm run check` は、ESLint、Prettier形式チェック、TypeScript型チェック、Vitestをまとめて実行します。

現時点では、依存更新時のGitHub API経由大容量lockfile更新を避けるため、`package-lock.json` はコミット対象外です。CIも `npm install` で依存関係を解決します。依存バージョン固定を強める段階で、lockfileを再導入してください。

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
