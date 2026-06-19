# Test Design Studio タスク分解

この文書は、Test Design Studio の実装をAIエージェントが1PRずつ進められる粒度に分解する。

各タスクは、原則として1PRに対応する。タスク外の実装を含める場合は、先にこの文書を更新する。

## タスク設計ルール

各タスクは次の形式で扱う。

```md
# Task: タスク名

## Goal
このタスクで達成すること。

## Scope
実装するもの。

## Non-goals
実装しないもの。

## Files
主に変更する想定ファイル。

## Acceptance criteria
完了条件。
```

## PR-001: 実装計画ドキュメント追加

### Goal

親設計書を実装可能なフェーズとAIエージェント向けタスクに分解する。

### Scope

- `docs/plans/implementation-plan.md` を追加する。
- `docs/plans/task-breakdown.md` を追加する。
- `docs/agents/coding-instructions.md` を追加する。

### Non-goals

- アプリケーションコードは実装しない。
- UIモックは作成しない。
- Chrome拡張は実装しない。

### Files

- `docs/plans/implementation-plan.md`
- `docs/plans/task-breakdown.md`
- `docs/agents/coding-instructions.md`

### Acceptance criteria

- フェーズ別実装計画が記載されている。
- PR単位のタスク一覧が記載されている。
- AIエージェント向けのコーディング指示が記載されている。

## PR-002: Reactアプリ基盤作成

### Goal

Vite + React + TypeScript の最小アプリ基盤を作成する。

### Scope

- `package.json` を作成する。
- Vite React TypeScript構成を追加する。
- `src/main.tsx` を追加する。
- `src/App.tsx` を追加する。
- 基本レイアウトを追加する。
- `npm run dev` / `npm run build` / `npm run typecheck` / `npm run test` を定義する。

### Non-goals

- ドメインモデルは実装しない。
- IndexedDB保存は実装しない。
- Project作成画面は実装しない。
- Chrome拡張は実装しない。

### Files

- `package.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles/global.css`

### Acceptance criteria

- `npm install` が成功する。
- `npm run dev` でアプリが起動する。
- `npm run build` が成功する。
- `npm run typecheck` が成功する。
- 初期画面にアプリ名が表示される。

## PR-003: 品質ゲート追加

### Goal

継続的に実装品質を確認できる最低限の品質ゲートを追加する。

### Scope

- ESLintを追加する。
- Prettierを追加する。
- Vitestを追加する。
- Testing Libraryを追加する。
- GitHub Actionsでcheckを実行する。

### Non-goals

- E2Eテストは実装しない。
- Playwrightは導入しない。
- 複雑なlintルールは追加しない。

### Files

- `eslint.config.js`
- `.prettierrc`
- `vitest.config.ts`
- `src/test/setup.ts`
- `.github/workflows/check.yml`
- `package.json`

### Acceptance criteria

- `npm run lint` が成功する。
- `npm run format:check` が成功する。
- `npm run test` が成功する。
- GitHub Actionsでcheckが実行される。

## PR-004: Dexie初期化

### Goal

IndexedDBを利用するためのDexie基盤を追加する。

### Scope

- Dexieを導入する。
- database moduleを追加する。
- schemaVersionの管理方針を追加する。
- DB初期化テストを追加する。

### Non-goals

- 全ドメインモデルは追加しない。
- CRUD Repositoryは実装しない。
- Export / Importは実装しない。

### Files

- `src/db/database.ts`
- `src/db/schema.ts`
- `src/db/database.test.ts`
- `package.json`

### Acceptance criteria

- Dexieインスタンスが作成される。
- テスト環境でDBを初期化できる。
- schemaVersionが定数として管理されている。
- `npm run test` が成功する。

## PR-005: ProjectモデルとRepository

### Goal

Projectを作成・取得・更新・削除できる保存層を実装する。

### Scope

- `Project` 型を追加する。
- Dexie schemaに `projects` を追加する。
- `projectRepository` を追加する。
- create / list / get / update / delete を実装する。
- Repositoryテストを追加する。

### Non-goals

- Project UIは実装しない。
- Featureは実装しない。
- Export / Importは実装しない。

### Files

- `src/domain/project.ts`
- `src/db/schema.ts`
- `src/repositories/projectRepository.ts`
- `src/repositories/projectRepository.test.ts`

### Acceptance criteria

- Projectを作成できる。
- Project一覧を取得できる。
- Projectを更新できる。
- Projectを削除できる。
- Repositoryテストが通る。

## PR-006: Feature / ScreenモデルとRepository

### Goal

Project配下にFeatureとScreenを保存できるようにする。

### Scope

- `Feature` 型を追加する。
- `Screen` 型を追加する。
- Dexie schemaに `features` / `screens` を追加する。
- `featureRepository` を追加する。
- `screenRepository` を追加する。
- Project単位で取得できるようにする。

### Non-goals

- UIツリーは実装しない。
- Feature Workspace UIは実装しない。
- Chrome拡張は実装しない。

### Files

- `src/domain/feature.ts`
- `src/domain/screen.ts`
- `src/db/schema.ts`
- `src/repositories/featureRepository.ts`
- `src/repositories/screenRepository.ts`
- `src/repositories/featureRepository.test.ts`
- `src/repositories/screenRepository.test.ts`

### Acceptance criteria

- Projectに紐づくFeatureを保存・取得できる。
- Projectに紐づくScreenを保存・取得できる。
- Featureに紐づくScreenを取得できる。
- Repositoryテストが通る。

## PR-007: UiNodeモデルとRepository

### Goal

テスト設計上意味のあるUI要素をUiNodeとして保存できるようにする。

### Scope

- `UiNode` 型を追加する。
- `UiNodeType` を追加する。
- parent-child構造を保存できるようにする。
- Dexie schemaに `uiNodes` を追加する。
- `uiNodeRepository` を追加する。
- Screen単位でUiNodeツリーを取得できるようにする。

### Non-goals

- DOMスキャンは実装しない。
- Element Pickerは実装しない。
- UIツリー編集画面は実装しない。

### Files

- `src/domain/uiNode.ts`
- `src/db/schema.ts`
- `src/repositories/uiNodeRepository.ts`
- `src/repositories/uiNodeRepository.test.ts`

### Acceptance criteria

- ScreenにUiNodeを追加できる。
- parentIdにより階層構造を表現できる。
- Screen単位でUiNode一覧を取得できる。
- Repositoryテストが通る。

## PR-008: DataEntity / DataField / DataTypeモデルとRepository

### Goal

業務データと入力値の性質を分離して保存できるようにする。

### Scope

- `DataEntity` 型を追加する。
- `DataField` 型を追加する。
- `DataType` 型を追加する。
- Dexie schemaに関連tableを追加する。
- Repositoryを追加する。

### Non-goals

- 境界値や同値分割の自動生成は実装しない。
- UI編集画面は実装しない。
- AI補助は実装しない。

### Files

- `src/domain/dataEntity.ts`
- `src/domain/dataField.ts`
- `src/domain/dataType.ts`
- `src/repositories/dataEntityRepository.ts`
- `src/repositories/dataFieldRepository.ts`
- `src/repositories/dataTypeRepository.ts`
- `src/db/schema.ts`

### Acceptance criteria

- DataEntityを保存できる。
- DataFieldをDataEntityに紐づけられる。
- DataFieldをDataTypeに紐づけられる。
- Project単位でDataTypeを取得できる。

## PR-009: BusinessRule / TestViewpoint / TestCaseモデルとRepository

### Goal

仕様ルール、テスト観点、テストケースを保存できる中核モデルを実装する。

### Scope

- `BusinessRule` 型を追加する。
- `TestViewpoint` 型を追加する。
- `TestCase` 型を追加する。
- Repositoryを追加する。
- Feature単位で取得できるようにする。

### Non-goals

- 自動観点生成は実装しない。
- ケース実行管理は実装しない。
- Playwrightコード生成は実装しない。

### Files

- `src/domain/businessRule.ts`
- `src/domain/testViewpoint.ts`
- `src/domain/testCase.ts`
- `src/repositories/businessRuleRepository.ts`
- `src/repositories/testViewpointRepository.ts`
- `src/repositories/testCaseRepository.ts`
- `src/db/schema.ts`

### Acceptance criteria

- BusinessRuleをFeatureに紐づけて保存できる。
- TestViewpointをFeatureに紐づけて保存できる。
- TestCaseをTestViewpointに紐づけて保存できる。
- Repositoryテストが通る。

## PR-010: TraceLink / ChangeRecordモデルとRepository

### Goal

トレーサビリティと変更履歴の基礎を保存できるようにする。

### Scope

- `TraceLink` 型を追加する。
- `TraceLinkType` を追加する。
- `ChangeRecord` 型を追加する。
- Repositoryを追加する。
- linkTypeを持つトレースリンクを保存できるようにする。

### Non-goals

- 影響候補の自動提示は実装しない。
- 変更差分UIは実装しない。
- カバレッジ可視化は実装しない。

### Files

- `src/domain/traceLink.ts`
- `src/domain/changeRecord.ts`
- `src/repositories/traceLinkRepository.ts`
- `src/repositories/changeRecordRepository.ts`
- `src/db/schema.ts`

### Acceptance criteria

- 任意のドメインオブジェクト間にTraceLinkを作成できる。
- TraceLinkに `linkType` がある。
- ChangeRecordを保存できる。
- ChangeRecordに変更対象、変更種別、変更前、変更後、理由を保存できる。

## PR-011: Project一覧・作成UI

### Goal

Webアプリ上でProjectを作成・一覧表示・選択できるようにする。

### Scope

- Project一覧画面を追加する。
- Project作成フォームを追加する。
- Project削除を追加する。
- Project選択後にDashboardへ遷移する。

### Non-goals

- Feature編集は実装しない。
- Export / Importは実装しない。
- Chrome拡張は実装しない。

### Files

- `src/routes/ProjectListPage.tsx`
- `src/components/project/ProjectCreateForm.tsx`
- `src/components/project/ProjectList.tsx`
- `src/App.tsx`

### Acceptance criteria

- Projectを画面から作成できる。
- 作成したProjectが一覧に表示される。
- Projectを選択してDashboardへ遷移できる。
- 再読み込み後もProjectが残る。

## PR-012: Feature / Screen基本UI

### Goal

Project内でFeatureとScreenを登録・一覧できるようにする。

### Scope

- Project Dashboardを追加する。
- Feature作成・一覧を追加する。
- Screen作成・一覧を追加する。
- FeatureとScreenの紐づけを行えるようにする。

### Non-goals

- UiNode編集は実装しない。
- TestViewpoint / TestCaseは実装しない。
- 複雑な検索・フィルタは実装しない。

### Files

- `src/routes/ProjectDashboardPage.tsx`
- `src/components/feature/FeatureList.tsx`
- `src/components/feature/FeatureCreateForm.tsx`
- `src/components/screen/ScreenList.tsx`
- `src/components/screen/ScreenCreateForm.tsx`

### Acceptance criteria

- Project内にFeatureを作成できる。
- Project内にScreenを作成できる。
- ScreenをFeatureに関連づけられる。
- Feature詳細へ遷移できる。

## PR-013: Feature Workspace基盤

### Goal

Feature単位で仕様・観点・ケースを編集する中心画面を追加する。

### Scope

- Feature Workspace routeを追加する。
- セクションナビゲーションを追加する。
- Overview / Screens / Data / Viewpoints / Test Cases / Changes / Export の枠を追加する。
- 既存データをFeature単位で読み込む。

### Non-goals

- 各セクションの詳細編集は実装しない。
- Chrome拡張は実装しない。
- 自動生成は実装しない。

### Files

- `src/routes/FeatureWorkspacePage.tsx`
- `src/components/workspace/WorkspaceLayout.tsx`
- `src/components/workspace/WorkspaceNav.tsx`

### Acceptance criteria

- Feature Workspaceを開ける。
- セクションを切り替えられる。
- Featureの基本情報が表示される。
- 存在しないFeatureの場合はエラー表示される。

## PR-014: UiNodeツリー手入力UI

### Goal

Feature Workspace上でScreenごとのUiNodeを手入力・ツリー表示できるようにする。

### Scope

- Screen選択UIを追加する。
- UiNode作成フォームを追加する。
- UiNodeツリー表示を追加する。
- parentIdを指定して階層化できるようにする。

### Non-goals

- DOM取り込みは実装しない。
- ドラッグ&ドロップ並び替えは実装しない。
- Element Pickerは実装しない。

### Files

- `src/components/ui-node/UiNodeTree.tsx`
- `src/components/ui-node/UiNodeCreateForm.tsx`
- `src/components/workspace/ScreensSection.tsx`

### Acceptance criteria

- ScreenにUiNodeを追加できる。
- UiNodeを親子構造で表示できる。
- UiNodeの種別、ラベル、説明を保存できる。
- 再読み込み後もツリーが保持される。

## PR-015: Data / BusinessRule編集UI

### Goal

Feature Workspace上でデータ型と業務ルールを登録できるようにする。

### Scope

- DataType一覧・作成フォームを追加する。
- DataEntity / DataFieldの基本編集を追加する。
- BusinessRule一覧・作成フォームを追加する。

### Non-goals

- 技法ワークベンチは実装しない。
- デシジョンテーブル生成は実装しない。
- AI補助は実装しない。

### Files

- `src/components/data/DataTypeList.tsx`
- `src/components/data/DataTypeForm.tsx`
- `src/components/data/DataEntityEditor.tsx`
- `src/components/rules/BusinessRuleList.tsx`
- `src/components/rules/BusinessRuleForm.tsx`
- `src/components/workspace/DataRulesSection.tsx`

### Acceptance criteria

- DataTypeを作成できる。
- DataEntityとDataFieldを作成できる。
- BusinessRuleをFeatureに紐づけて作成できる。
- 登録内容が再読み込み後も保持される。

## PR-016: TestViewpoint / TestCase編集UI

### Goal

Feature Workspace上でテスト観点とテストケースを作成できるようにする。

### Scope

- TestViewpoint一覧・作成フォームを追加する。
- TestCase一覧・作成フォームを追加する。
- TestViewpointからTestCaseを作成できるようにする。
- priority / risk / automationCandidateなどの基本属性を扱う。

### Non-goals

- 自動生成は実装しない。
- 実行結果管理は実装しない。
- Playwrightコード生成は実装しない。

### Files

- `src/components/viewpoint/TestViewpointList.tsx`
- `src/components/viewpoint/TestViewpointForm.tsx`
- `src/components/test-case/TestCaseList.tsx`
- `src/components/test-case/TestCaseForm.tsx`
- `src/components/workspace/ViewpointsSection.tsx`
- `src/components/workspace/TestCasesSection.tsx`

### Acceptance criteria

- TestViewpointを作成できる。
- TestViewpointに紐づくTestCaseを作成できる。
- priority / risk / automationCandidateを保存できる。
- Feature単位で観点とケースを一覧できる。

## PR-017: Markdown Export

### Goal

Feature単位で、仕様・観点・ケースを人間が読めるMarkdownとして出力できるようにする。

### Scope

- Feature export用のMarkdown生成関数を追加する。
- UIからMarkdownをコピーまたはダウンロードできるようにする。
- Feature / Screen / UiNode / DataType / BusinessRule / TestViewpoint / TestCaseを含める。

### Non-goals

- JSON exportは実装しない。
- CSV exportは実装しない。
- AI用最適化出力は実装しない。

### Files

- `src/export/markdownExport.ts`
- `src/export/markdownExport.test.ts`
- `src/components/export/MarkdownExportPanel.tsx`
- `src/components/workspace/ExportSection.tsx`

### Acceptance criteria

- Feature単位でMarkdownを生成できる。
- 生成Markdownに仕様・観点・ケースが含まれる。
- Markdownをダウンロードできる。
- Markdown生成関数のテストがある。

## PR-018: JSON Export / Import

### Goal

Project単位のバックアップ・復元ができるようにする。

### Scope

- ExportBundle型を追加する。
- Project単位のJSON exportを追加する。
- JSON importを追加する。
- schemaVersionを検証する。
- 新規Projectとしてimportする。

### Non-goals

- 差分importは実装しない。
- 既存Projectへの上書きimportは実装しない。
- クラウド同期は実装しない。

### Files

- `src/export/exportBundle.ts`
- `src/export/jsonExport.ts`
- `src/import/jsonImport.ts`
- `src/import/jsonImport.test.ts`
- `src/components/export/JsonExportImportPanel.tsx`

### Acceptance criteria

- Project単位でJSONをexportできる。
- exportしたJSONを新規Projectとしてimportできる。
- 不正JSON時にエラー表示できる。
- schemaVersion不一致時にエラー表示できる。

## PR-019: Chrome拡張基盤

### Goal

Chrome拡張としてSide Panelを表示し、現在タブと通信できる基盤を作る。

### Scope

- `extension/manifest.json` を追加する。
- Side Panelエントリを追加する。
- Background service workerを追加する。
- Content Scriptを追加する。
- 現在タブのURL/title取得を実装する。

### Non-goals

- Element Pickerは実装しない。
- DOMスキャンは実装しない。
- Webアプリとの完全同期は実装しない。

### Files

- `extension/manifest.json`
- `extension/src/background.ts`
- `extension/src/contentScript.ts`
- `extension/src/sidePanel.tsx`
- `extension/src/messaging.ts`

### Acceptance criteria

- Chrome拡張を読み込める。
- Side Panelを開ける。
- 現在タブのURL/titleを取得できる。
- Content Scriptとのメッセージ通信ができる。

## PR-020: Element Picker最小実装

### Goal

対象ページ上の1要素を選択し、DOM情報を候補として取得できるようにする。

### Scope

- Pickerモードを開始・終了できる。
- hover中の要素をハイライトする。
- clickした要素の情報を取得する。
- tagName / role / text / label / placeholder / selectorCandidatesを取得する。

### Non-goals

- 候補レビューUIは実装しない。
- UiNodeへの保存は実装しない。
- DOM全体スキャンは実装しない。

### Files

- `extension/src/elementPicker.ts`
- `extension/src/domSnapshot.ts`
- `extension/src/selectorCandidates.ts`
- `extension/src/contentScript.ts`

### Acceptance criteria

- Pickerモードで要素を選択できる。
- 選択要素の主要DOM情報を取得できる。
- selectorCandidatesが生成される。
- 対象ページのDOMを破壊的に変更しない。

## PR-021: DomCaptureCandidateレビューとUiNode取り込み

### Goal

Element Pickerで取得した候補をレビューし、UiNodeとして保存できるようにする。

### Scope

- `DomCaptureCandidate` 型を追加する。
- 候補保存Repositoryを追加する。
- 候補レビューUIを追加する。
- 候補をUiNodeに変換して保存する。

### Non-goals

- DOM全体スキャンは実装しない。
- 既存UiNodeとの差分判定は実装しない。
- ChangeRecord連携は実装しない。

### Files

- `src/domain/domCaptureCandidate.ts`
- `src/repositories/domCaptureCandidateRepository.ts`
- `src/components/dom-capture/DomCaptureReviewPanel.tsx`
- `src/services/domCaptureToUiNode.ts`

### Acceptance criteria

- DOM候補を保存できる。
- 候補をレビューできる。
- 候補をUiNodeとして登録できる。
- 登録時にScreenを選択できる。

## PR-022: ChangeRecord基本UI

### Goal

Feature Workspace上で変更履歴を作成・一覧できるようにする。

### Scope

- ChangeRecord一覧を追加する。
- ChangeRecord作成フォームを追加する。
- 変更対象種別を選択できるようにする。
- 変更前、変更後、理由、確度を保存できるようにする。

### Non-goals

- 影響候補の自動提示は実装しない。
- GitHub PR連携は実装しない。
- DOM差分自動検出は実装しない。

### Files

- `src/components/change/ChangeRecordList.tsx`
- `src/components/change/ChangeRecordForm.tsx`
- `src/components/workspace/ChangesSection.tsx`

### Acceptance criteria

- ChangeRecordを作成できる。
- ChangeRecordをFeature単位で一覧できる。
- 変更対象、変更種別、変更前、変更後、理由を保存できる。

## PR-023: TraceLink UI

### Goal

観点・ケース・仕様要素の関連をTraceLinkとして登録できるようにする。

### Scope

- TraceLink作成UIを追加する。
- linkTypeを選択できるようにする。
- TestViewpoint / TestCase / BusinessRule / UiNodeの関連を登録できるようにする。

### Non-goals

- 自動リンク生成は実装しない。
- カバレッジダッシュボードは実装しない。

### Files

- `src/components/trace/TraceLinkEditor.tsx`
- `src/components/trace/TraceLinkList.tsx`
- `src/services/traceTargets.ts`

### Acceptance criteria

- TraceLinkを作成できる。
- linkTypeを保存できる。
- 指定オブジェクトに関連するTraceLinkを一覧できる。

## PR-024: 影響候補表示

### Goal

ChangeRecordから影響しそうなTestViewpoint / TestCaseを候補表示できるようにする。

### Scope

- 影響候補生成サービスを追加する。
- UiNode変更時の関連候補を表示する。
- DataType変更時の関連候補を表示する。
- BusinessRule変更時の関連候補を表示する。
- 候補をTraceLinkとして採用できるようにする。

### Non-goals

- 完全自動の影響分析は実装しない。
- AIによる影響分析は実装しない。

### Files

- `src/services/impactAnalysis.ts`
- `src/services/impactAnalysis.test.ts`
- `src/components/change/ImpactCandidateList.tsx`

### Acceptance criteria

- ChangeRecordに対して影響候補を表示できる。
- 候補をユーザーが採用・却下できる。
- 採用した候補がTraceLinkとして保存される。

## PR-025: DataTypeから同値分割・境界値観点候補生成

### Goal

DataTypeの制約からテスト観点候補を生成できるようにする。

### Scope

- 同値分割候補生成を追加する。
- 境界値候補生成を追加する。
- 候補レビューUIを追加する。
- 採用した候補をTestViewpointとして保存する。

### Non-goals

- 状態遷移テストは実装しない。
- デシジョンテーブルは実装しない。
- AI生成は実装しない。

### Files

- `src/services/viewpointGeneration/equivalencePartitioning.ts`
- `src/services/viewpointGeneration/boundaryValueAnalysis.ts`
- `src/components/workbench/DataTypeViewpointGenerator.tsx`

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

### Non-goals

- 全組み合わせの最適化アルゴリズムは実装しない。
- AI生成は実装しない。

### Files

- `src/domain/decisionTable.ts`
- `src/services/viewpointGeneration/decisionTable.ts`
- `src/components/workbench/DecisionTableWorkbench.tsx`

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
- 仕様、UI、データ、ルール、観点、ケース、未確認事項を含める。

### Non-goals

- AI API呼び出しは実装しない。
- Playwrightコード生成は実装しない。

### Files

- `src/export/aiContextExport.ts`
- `src/export/aiContextExport.test.ts`
- `src/components/export/AiContextExportPanel.tsx`

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

### Files

- `src/export/playwrightDraftExport.ts`
- `src/export/playwrightDraftExport.test.ts`
- `src/components/export/PlaywrightDraftExportPanel.tsx`

### Acceptance criteria

- TestCase単位でPlaywright実装に必要な情報を出力できる。
- selectorHintがある場合は出力に含まれる。
- 自動化対象外の理由も出力できる。

## 実装順序

推奨順序は以下とする。

```text
PR-001
PR-002
PR-003
PR-004
PR-005
PR-006
PR-007
PR-008
PR-009
PR-010
PR-011
PR-012
PR-013
PR-014
PR-015
PR-016
PR-017
PR-018
PR-019
PR-020
PR-021
PR-022
PR-023
PR-024
PR-025
PR-026
PR-027
PR-028
```

ただし、PR-019以降のChrome拡張系は、Webアプリ側の保存モデルが安定してから着手する。

## タスク追加時のルール

- 新しい実装を始める前に、この文書へタスクを追加する。
- 既存タスクのScopeを広げすぎない。
- 1PRで複数フェーズにまたがる変更をしない。
- 仕様変更がある場合は、先に `docs/design.md` または `docs/specs/*` を更新する。
