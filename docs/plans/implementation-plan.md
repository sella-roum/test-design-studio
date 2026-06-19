# Test Design Studio 実装計画

この文書は、`docs/design.md` を親設計書として扱い、Test Design Studio を段階的に実装するための実装計画である。

親設計書は長期構想を含むため、実装時はこの文書、`docs/specs/*`、`docs/plans/task-breakdown.md`、`docs/plans/tasks/*.md` を参照して、1PRごとのScopeを固定する。

## 参照優先度

AIエージェント、実装者、レビュー担当者は、迷った場合に次の優先順位で判断する。

1. `AGENTS.md`
   - リポジトリ全体の作業ルール。
   - AIエージェントが最初に読むべき入口。
2. `docs/agents/coding-instructions.md`
   - Test Design Studio 固有の実装ルール。
   - Scope、Non-goals、Acceptance criteriaの扱いを定義する。
3. 現在対応する `docs/plans/tasks/*.md` の `Scope / Non-goals / Acceptance criteria`
   - そのPRで実装してよい範囲を固定する。
4. `docs/plans/task-breakdown.md`
   - Task ID単位の一覧と実装順序を定義する。
5. `docs/plans/implementation-plan.md`
   - フェーズ、優先順位、ゲートを定義する本書。
6. 対象領域の `docs/specs/*.md`
   - 実装判断に使う仕様の正本。
7. `docs/design.md`
   - 長期構想と背景思想。
   - 直接すべてを実装する対象ではない。

矛盾した場合は、原則として **現在対応する詳細タスク > 対象領域の仕様書 > 親設計書** の順で優先する。

## 基本方針

Test Design Studio は、仕様把握、UI構造、データ条件、業務ルール、未確認事項、テスト観点、テストケース、変更履歴、トレーサビリティを一体で扱うローカルファーストなテスト設計ワークスペースとして実装する。

ただし、親設計書の全構想を一度に実装しない。設計は長期視点で維持し、実装はAIエージェントが1PRずつ完了できる粒度に分割する。

## Staged MVP方針

このプロジェクトでは、MVPを「簡易版」ではなく「段階的に全体構想へ到達するための実装単位」として扱う。

### P0: Web Design MVP

P0はPhase 0〜4とする。

P0では、Webアプリ単体で1機能分の仕様把握、観点作成、ケース作成、Markdown/JSON出力ができる状態を作る。

P0に含めるもの:

- Project / Feature / Screen / UiNode
- DataEntity / DataField / DataType
- BusinessRule
- OpenQuestion
- TestViewpoint
- TestCase / TestStep
- TraceLink / ChangeRecordの保存モデル
- Markdown export
- JSON export/import

P0で予約するが、専用UIや生成機能までは必須にしないもの:

- State / StateTransition
- Flow / FlowStep
- ErrorCase
- DecisionTable
- Evidence

### P1: Capture & Trace MVP

P1はPhase 5〜7とする。

P1では、Chrome拡張で実画面からUI候補を取り込み、変更履歴と影響追跡に接続する。

P1に含めるもの:

- Manifest V3 Chrome拡張
- Side Panel
- Content Script
- Element Picker
- DomCaptureCandidate / DomCaptureBundle
- ChangeRecord UI
- TraceLink UI
- 影響候補表示

### P2: Assistive Design MVP

P2はPhase 8〜9とする。

P2では、構造化済みの仕様データを使って、技法ベースの観点候補生成、AIレビュー、Playwright実装支援に進む。

P2に含めるもの:

- DataTypeからの観点候補生成
- BusinessRuleからのDecisionTable観点候補生成
- StateTransitionからの観点候補生成
- AI context export
- Playwright draft export

## P0 implementation slices

P0はWeb Design MVP全体を指す。ただし、実装時は次の補助スライスで進める。

### P0a: Core editing slice

目的:
Project、Feature、TestViewpoint、TestCaseの最小縦切りを作り、Webアプリとして設計データを保存できる状態にする。

含めるもの:

- Project作成・一覧
- Feature作成・一覧
- TestViewpoint作成・一覧
- TestCase作成・一覧
- TestCase.stepsのTestStep[]保存
- 最小Repositoryと単体テスト

含めないもの:

- Chrome拡張
- Export / Import
- TraceLink専用UI
- ChangeRecord UI

### P0b: Specification structure slice

目的:
仕様・UI・データ・ルール・未確認事項を構造化し、観点・ケースの根拠として使える状態にする。

含めるもの:

- Screen
- UiNode
- DataEntity / DataField / DataType
- BusinessRule
- OpenQuestion
- TestViewpoint derived_from source element
- TestCase depends_on UiNode

### P0c: Output and portability slice

目的:
作成した設計データを外部レビュー・バックアップできる状態にする。

含めるもの:

- Markdown export
- JSON export
- create-new-project import
- P0必須モデルのID remapping
- export/import round trip test

P0a/P0b/P0cは正式なPhaseではなく、P0実装を安全に進めるための補助区分である。PR本文では、必要に応じて該当するP0 sliceを明記する。

## 実装原則

- 1PRでは1つの責務だけを完了させる。
- Scope外の将来機能を先回りして実装しない。
- `Non-goals` に書かれたものを実装しない。
- 保存対象は後続のExport、Import、TraceLink、ChangeRecordと接続できる前提にする。
- Chrome拡張は仕様生成エンジンではなく、対象アプリの現物UIから設計素材を取り込む入力補助として扱う。
- AI生成とPlaywright生成は、構造化データが安定してから接続する。
- UIだけを作って保存できない状態、型だけを作って利用されない状態、保存だけを作って画面導線がない状態を避ける。
- ただし、Phase 1、Phase 2のように基盤構築が目的のタスクでは、タスクのAcceptance criteriaを優先する。

## 実装判断の正本

各領域の実装判断は、次の仕様書を正本とする。

| 領域 | 正本 |
|---|---|
| プロダクト価値、対象ユーザー、利用シナリオ | `docs/specs/00-product-overview.md` |
| ドメインモデル、型、関連 | `docs/specs/01-domain-model.md` |
| IndexedDB、Dexie、schemaVersion、Repository | `docs/specs/02-storage-design.md` |
| Webアプリの画面、導線、Feature Workspace | `docs/specs/03-web-app-spec.md` |
| Chrome拡張、Side Panel、Content Script | `docs/specs/04-chrome-extension-spec.md` |
| JSON、Markdown、CSV、Import/Export | `docs/specs/05-import-export-spec.md` |
| TraceLink、カバレッジ、影響追跡 | `docs/specs/06-traceability-spec.md` |
| ChangeRecord、変更種別、変更影響 | `docs/specs/07-change-management-spec.md` |
| テスト技法、観点候補生成 | `docs/specs/08-test-design-workbench.md` |
| 段階実装でまだやらないこと | `docs/specs/09-non-goals.md` |
| 用語定義 | `docs/specs/10-glossary.md` |

## フェーズ

| Phase | 目的 | 主な成果物 | 主な参照 |
|---|---|---|---|
| 0 | 実装準備 | 実装計画、タスク分解、AI指示、仕様分割、設計補強 | `AGENTS.md`, `docs/specs/*`, `docs/plans/*` |
| 1 | アプリ基盤 | Vite、React、TypeScript、品質ゲート、Dexie初期化 | `docs/specs/02-storage-design.md` |
| 2 | ドメイン・保存層 | P0必須モデル、予約モデル方針、Repository、DB schema | `docs/specs/01-domain-model.md`, `docs/specs/02-storage-design.md` |
| 3 | Web編集フロー | Project、Feature、Screen、UiNode、Data、Rule、OpenQuestion、Viewpoint、Caseの手動編集 | `docs/specs/03-web-app-spec.md` |
| 4 | Export / Import | Markdown、JSON、schemaVersion、新規Project復元 | `docs/specs/05-import-export-spec.md` |
| 5 | Chrome拡張基盤 | Manifest V3、Side Panel、Content Script通信 | `docs/specs/04-chrome-extension-spec.md` |
| 6 | Element Picker | 対象DOM要素をUiNode候補として取り込む | `docs/specs/04-chrome-extension-spec.md`, `docs/specs/01-domain-model.md` |
| 7 | 変更管理・影響追跡 | ChangeRecord UI、TraceLink UI、影響候補表示 | `docs/specs/06-traceability-spec.md`, `docs/specs/07-change-management-spec.md` |
| 8 | 技法ワークベンチ | 同値分割、境界値、状態遷移、デシジョンテーブル | `docs/specs/08-test-design-workbench.md` |
| 9 | AI / Playwright連携 | AI context export、観点レビュー、Playwright draft export | `docs/specs/09-non-goals.md` を更新後に着手 |

## 優先順位

P0はPhase 0〜4とする。ここまででWebアプリ単体で1機能分の仕様把握、観点作成、ケース作成、Markdown/JSON出力ができる状態を作る。

P0の内部実装は、P0a、P0b、P0cの補助スライスで段階的に進める。補助スライスは正式なPhaseではなく、P0の価値を早く検証しながら先回り実装を防ぐための作業単位である。

P1はPhase 5〜7とする。Chrome拡張で実画面からUI候補を取り込み、変更履歴と影響追跡に接続する。

P2はPhase 8〜9とする。構造化済みの仕様データを使って、技法ベースの観点生成、AIレビュー、Playwright実装支援に進む。

## フェーズゲート

### Phase 0 完了条件

- 実装計画が存在する。
- Task ID単位のタスク一覧が存在する。
- AIエージェント向け指示が存在する。
- PRテンプレートが存在する。
- `docs/specs/*` に実装判断の正本が切り出されている。
- P0/P1/P2の段階MVP定義が仕様書と実装計画で一致している。
- 親設計書の主要要素が、実装対象または予約モデルとして整理されている。

### Phase 1 完了条件

- `npm install`、`npm run build`、`npm run typecheck`、`npm run test` が実行できる。
- 最小のReactアプリが起動できる。
- 品質ゲートがCIで実行される。
- Dexieの初期化方針がコードとテストで確認できる。

### Phase 2 完了条件

- P0必須ドメインモデルが型として定義されている。
- OpenQuestionと構造化TestStepが型として定義されている。
- TraceNodeTypeとTraceLinkTypeが `docs/specs/06-traceability-spec.md` と一致している。
- Dexie schemaとRepositoryが定義されている。
- Repository単位の基本CRUDテストがある。
- Reserved modelを先取り実装する場合、該当タスクのScopeに明示されている。
- `docs/specs/01-domain-model.md` と実装上の型名が大きく乖離していない。

### Phase 3 完了条件

- Webアプリ単体でProject、Feature、Screen、UiNode、DataType、BusinessRule、OpenQuestion、TestViewpoint、TestCaseを作成・編集できる。
- TestCase.stepsを構造化されたTestStepとして保存できる。
- Feature Workspaceの主要導線が存在する。
- 手入力だけで1機能分のテスト設計を蓄積できる。

### Phase 4 完了条件

- JSONでプロジェクトをExportできる。
- JSONからプロジェクトを新規ProjectとしてImportできる。
- Markdownでテスト設計を出力できる。
- OpenQuestion、TestStep、TraceLinkがexport/importで失われない。
- schemaVersion不一致、不正JSON、ID衝突の扱いが定義されている。

### Phase 5〜6 完了条件

- Chrome拡張のSide Panelを開ける。
- 対象タブのURL/titleを取得できる。
- Element Pickerで1要素を選択できる。
- DOM情報を `DomCaptureCandidate` としてレビューできる。
- `DomCaptureBundle` をWebアプリ側へ取り込める。
- Data safety / Privacy rulesに従い、入力値や機密情報を保存しない。
- DOMから仕様やテストケースを完全自動生成しない。

### Phase 7 完了条件

- ChangeRecordを作成できる。
- TraceLinkを作成できる。
- Allowed TraceLink matrixに従ってリンクを検証できる。
- 変更対象から影響候補を表示できる。
- 手動で影響有無を確定できる。

### Phase 8〜9 完了条件

- DataTypeやBusinessRuleから観点候補を生成できる。
- StateTransitionやDecisionTableを扱う場合、保存モデルとExportBundleが更新されている。
- 生成候補は自動採用されず、レビュー後にTestViewpoint化される。
- AI/Playwright連携はExport中心に留め、実行・自動修復までは扱わない。

## 依存関係

- Phase 2はPhase 1のアプリ基盤とDexie初期化に依存する。
- Phase 3はPhase 2のドメイン型とRepositoryに依存する。
- Phase 4はPhase 2の保存モデルに依存する。
- Phase 5〜6はPhase 4のJSON Export / Importが安定してから進める。
- Phase 7はTraceLinkとChangeRecordの保存モデルに依存する。
- Phase 8はDataType、BusinessRule、StateTransitionの構造が安定してから進める。
- Phase 9はAI/Playwright向けExport仕様を定義してから進める。

## 実装時の注意

- 実装対象は `docs/plans/task-breakdown.md` の該当Task IDに従う。
- 詳細タスクは `docs/plans/tasks/*.md` を確認する。
- タスク外の実装が必要になった場合は、先にタスク文書を更新する。
- Chrome拡張は、Webアプリ側の保存モデルとExport / Importが安定してから進める。
- `docs/design.md` と `docs/specs/*` が矛盾する場合、実装時は `docs/specs/*` を優先する。
