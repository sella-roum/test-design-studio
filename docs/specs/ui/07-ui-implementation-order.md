# UI Implementation Order

## Purpose

この文書は、UI仕様を実装タスクへ落とし込むための順序を定義する。

画面カンプに含まれるProject Dashboard、Feature Workspace、TestViewpoint / TestCase Editor、Export / Traceabilityを一度に実装しない。P0では、保存できる最小の作業導線を縦に通すことを優先する。

## Core principle

UI実装では、次を守る。

- 見た目だけの画面を作らない。
- 保存できないEditorを作らない。
- 高度なTraceabilityやDashboardを先に作らない。
- Chrome拡張CaptureとAI支援をP0に混ぜない。
- Feature Workspaceを中心に据える。

## Recommended implementation sequence

### UI-001: App Shell

対応文書:

- `01-ui-design-system.md`
- `02-app-shell-navigation.md`

Scope:

- AppShell
- Sidebar
- TopHeader
- Main layout
- route outlet
- Not Found / Error stateの枠

Non-goals:

- Project保存
- Feature編集
- Global search実装
- 通知
- 認証

### UI-002: Project List / Project Dashboard

対応文書:

- `03-project-dashboard-ui-spec.md`

Scope:

- Project一覧
- Project作成
- Project編集
- Project論理削除
- Project Detail
- Feature一覧の枠
- 空状態

Non-goals:

- Feature Workspace詳細
- Export実装
- JSON import実装
- 高度なDashboard

### UI-003: Feature Workspace Shell

対応文書:

- `04-feature-workspace-ui-spec.md`

Scope:

- Feature Workspace route
- Feature Header
- Summary Cards
- Tabs
- 各Tabのplaceholder
- Feature基本情報表示
- 空状態

Non-goals:

- 各Tabの詳細編集
- カバレッジの本格計算
- Traceability Matrix
- Change UI

### UI-004: Screens / UI Tree

対応文書:

- `04-feature-workspace-ui-spec.md`

Scope:

- Screen一覧・作成・編集
- UiNode作成・編集
- UiNodeツリー表示
- parentId / sortOrderによる階層表示
- Screen / UiNode詳細パネル

Non-goals:

- DOM Capture
- Element Picker
- Accessibility Tree Capture
- Drag and drop
- 差分比較

### UI-005: Data / Rules / Open Questions

対応文書:

- `04-feature-workspace-ui-spec.md`

Scope:

- DataType一覧・作成・編集
- BusinessRule一覧・作成・編集
- OpenQuestion一覧・作成・編集
- OpenQuestion status表示
- Feature Workspace summaryへの件数反映

Non-goals:

- 技法ワークベンチ
- ルールから観点の自動生成
- DecisionTable UI
- AIレビュー

### UI-006: TestViewpoint Editor

対応文書:

- `05-test-design-editor-ui-spec.md`

Scope:

- TestViewpoint一覧
- TestViewpoint作成・編集
- automationSuitability / automationReason
- source element簡易選択
- `derived_from` TraceLinkの最小作成
- 関連TestCase一覧

Non-goals:

- 任意TraceLink編集UI
- 観点候補の自動生成
- AIレビュー

### UI-007: TestCase Editor

対応文書:

- `05-test-design-editor-ui-spec.md`

Scope:

- TestCase一覧
- TestCase作成・編集
- TestViewpointとの紐づけ
- StepTable
- TestStep[]保存
- targetUiNodeId選択
- priority / automationSuitability / automationReason

Non-goals:

- 実行結果管理
- Playwright spec生成
- テスト実行

### UI-008: Export Screen

対応文書:

- `06-export-traceability-ui-spec.md`
- `docs/specs/05-import-export-spec.md`

Scope:

- JSON / Markdown選択
- Export scope選択
- Export summary
- Preview
- Export実行

Non-goals:

- JSON merge import
- CSV export
- AI context export
- Playwright draft export

### UI-009: Traceability Simple View

対応文書:

- `06-export-traceability-ui-spec.md`
- `docs/specs/06-traceability-spec.md`

Scope:

- BusinessRule / OpenQuestion / TestViewpoint / TestCaseの簡易ツリー表示
- TestViewpointのsource element表示
- TestCaseの関連Viewpoint表示
- 未確認OpenQuestionの状態表示

Non-goals:

- Matrix UI
- Graph UI
- 任意TraceLink編集
- 影響候補表示

## Mapping to existing tasks

| UI slice | 既存Task | 備考 |
|---|---|---|
| UI-001 | TASK-002 / TASK-013 | App基盤はTASK-002、Workspace枠はTASK-013 |
| UI-002 | TASK-011 / TASK-012 | ProjectとFeature入口 |
| UI-003 | TASK-013 | Feature Workspace基盤 |
| UI-004 | TASK-014 | UiNodeツリー手入力UI |
| UI-005 | TASK-015 / TASK-016 | Data / Rule / OpenQuestion |
| UI-006 | TASK-016 | TestViewpoint編集 |
| UI-007 | TASK-016 | TestCase / TestStep編集 |
| UI-008 | TASK-017 / TASK-018 | Export / Import |
| UI-009 | Phase 7 | 簡易Traceability表示 |

## P0 completion definition

P0 UI完了は、次を満たす状態とする。

- Projectを作成できる。
- Featureを作成できる。
- Feature Workspaceを開ける。
- ScreenとUiNodeを手入力できる。
- DataTypeとBusinessRuleを手入力できる。
- OpenQuestionを管理できる。
- TestViewpointを作成できる。
- TestCaseとTestStepを作成できる。
- TestViewpointとTestCaseの紐づきが保存される。
- TestViewpointのsource elementが最低限保存される。
- JSON / Markdown exportへつながる構造がある。

## P0 should not include

- Chrome拡張Capture review
- Accessibility Tree Capture
- Traceability Matrix
- Change impact analysis
- AI assist UI
- Playwright draft generation
- Execution result management
- Multi-user collaboration
- Authentication
- Cloud sync

## Review checklist

UI実装PRでは、次を確認する。

- 対象UI sliceが1つに絞られている。
- Scope外のPhase機能を混ぜていない。
- Empty stateが定義されている。
- Error stateが定義されている。
- 保存後の再読み込みでデータが復元される。
- 見た目だけのplaceholderで終わっていない。
- P0対象外機能は準備中表示または未実装として明確に扱っている。
