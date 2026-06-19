# Phase 2 ドメイン・保存層タスク詳細

この文書は、Phase 2 のドメインモデルと保存層の実装タスクを定義する。

Phase 2ではUIを作り込まない。Webアプリ、Export / Import、Chrome拡張、変更管理、技法ワークベンチが依存する中核モデルとRepositoryを安定させる。

## 共通参照

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/06-traceability-spec.md`
- `docs/specs/07-change-management-spec.md`
- `docs/specs/09-non-goals.md`

## 共通ルール

- 型名、主要プロパティ、関連は `docs/specs/01-domain-model.md` を優先する。
- DB table、index、schemaVersionは `docs/specs/02-storage-design.md` を優先する。
- 削除は原則として物理削除ではなく、状態管理や論理削除を検討する。
- Repositoryには最低限の単体テストを追加する。
- UI、Chrome拡張、AI生成、Playwright生成は実装しない。
- P0でUI化しないReserved modelは、原則としてRepositoryを実装しない。ただし型・TraceNodeType・ExportBundle optional fieldとして破壊的変更を避ける準備はしてよい。

## TASK-005: ProjectモデルとRepository

### Goal

Projectを作成・取得・更新・論理削除できる保存層を実装する。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`

### Scope

- `Project` 型を追加する。
- `Project.status` を追加する。
- Dexie schemaに `projects` を追加する。
- `projectRepository` を追加する。
- create / list / get / update / markRemoved を実装する。
- Repositoryテストを追加する。

### Non-goals

- Project UIは実装しない。
- Featureは実装しない。
- Export / Importは実装しない。
- Chrome拡張は実装しない。

### Acceptance criteria

- Projectを作成できる。
- Projectを取得できる。
- `status !== "removed"` のProject一覧を取得できる。
- Projectを更新できる。
- Projectを論理削除できる。
- Repositoryテストが通る。
- `docs/specs/01-domain-model.md` のProject定義と矛盾しない。

## TASK-006: Feature / ScreenモデルとRepository

### Goal

Project配下にFeatureとScreenを保存できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/03-web-app-spec.md`

### Scope

- `Feature` 型を追加する。
- `Screen` 型を追加する。
- FeatureにはP0のユースケース情報として、`purpose`、`actor`、`preconditions`、`successCriteria`、`failureConditions`、`confidence` を保持できるようにする。
- Screenには `screenType`、`purpose`、`preconditions`、`confidence` を保持できるようにする。
- Dexie schemaに `features` / `screens` を追加する。
- `featureRepository` と `screenRepository` を追加する。
- Project単位、Feature単位で取得できるようにする。
- FeatureとScreenの関連を保存できるようにする。

### Non-goals

- UIツリーは実装しない。
- Feature Workspace UIは実装しない。
- Chrome拡張は実装しない。
- テスト観点やテストケースは実装しない。
- `UseCase` 独立モデルはP0では実装しない。

### Acceptance criteria

- ProjectにFeatureを紐づけられる。
- ProjectにScreenを紐づけられる。
- Featureに関連するScreenを取得できる。
- Project単位でFeature / Screenを一覧できる。
- Feature / Screenの追加項目が `docs/specs/01-domain-model.md` と一致している。
- Repositoryテストが通る。

## TASK-007: UiNodeモデルとRepository

### Goal

テスト設計上意味のあるUI要素をUiNodeとして保存できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/04-chrome-extension-spec.md`

### Scope

- `UiNode` 型を追加する。
- parent-child構造を保存できるようにする。
- Dexie schemaに `uiNodes` を追加する。
- Screen単位でUiNodeツリーを取得できるRepositoryを追加する。
- selectorHint、role、componentType、textHint、descriptionなど、Chrome拡張からの取り込みに必要な基本属性を保持できるようにする。

### Non-goals

- `UiNodeType` enumは追加しない。
- `label` フィールドは追加しない。
- DOMスキャンは実装しない。
- Element Pickerは実装しない。
- UIツリー編集画面は実装しない。
- 既存UiNodeとの差分検出は実装しない。

### Acceptance criteria

- ScreenにUiNodeを追加できる。
- parentIdにより階層構造を表現できる。
- Screen単位でUiNode一覧を取得できる。
- UiNodeツリーを安定した順序で取得できる。
- Repositoryテストが通る。

## TASK-008: DataType / EntityモデルとRepository

### Goal

業務データと入力値の性質を分離して保存できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- `DataEntity` 型を追加する。
- `DataField` 型を追加する。
- `DataType` 型を追加する。
- Dexie schemaに `dataEntities` / `dataFields` / `dataTypes` を追加する。
- Repositoryを追加する。
- DataFieldがDataTypeを参照できるようにする。
- P0保存層ではDataEntity / DataField / DataTypeを実装する。
- P0 UIではDataEntity / DataFieldは簡易編集に留めてよい。

### Non-goals

- 境界値や同値分割の自動生成は実装しない。
- UI編集画面は実装しない。
- AI補助は実装しない。
- デシジョンテーブルは実装しない。

### Acceptance criteria

- DataEntityを保存できる。
- DataFieldをDataEntityに紐づけられる。
- DataFieldをDataTypeに紐づけられる。
- Project単位でDataTypeを取得できる。
- 後続の観点候補生成で参照できる制約情報を保持できる。
- Repositoryテストが通る。

## TASK-009: BusinessRule / TestViewpoint / TestCase / TestStep

### Goal

仕様ルール、テスト観点、構造化されたテスト手順を持つテストケースを保存できる中核モデルを実装する。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- `BusinessRule` 型を追加する。
- `BusinessRule.ruleType` は `validation` / `permission` / `display` / `calculation` / `workflow` / `error` / `exception` / `other` を扱えるようにする。
- `TestViewpoint` 型を追加する。
- `TestCase` 型を追加する。
- `TestStep` 型と `TestStepAction` を追加する。
- `TestCase.steps` は `string[]` ではなく `TestStep[]` として保存する。
- `TestViewpoint.automationReason` と `TestCase.automationReason` を保存できるようにする。
- Feature単位で取得できるRepositoryを追加する。
- TestCaseをTestViewpointに紐づけられるようにする。
- priority / riskLevel / automationSuitability などの基本属性を保持できるようにする。

### Non-goals

- 自動観点生成は実装しない。
- ケース実行管理は実装しない。
- Playwrightコード生成は実装しない。
- AIレビューは実装しない。
- TestStepからPlaywrightコードを生成しない。

### Acceptance criteria

- BusinessRuleをFeatureに紐づけて保存できる。
- TestViewpointをFeatureに紐づけて保存できる。
- TestCaseをTestViewpointに紐づけて保存できる。
- TestCaseの手順を `TestStep[]` として保存できる。
- TestStepに `order`、`action`、`instruction`、任意の `targetUiNodeId`、`expectedResult`、`testData` を保持できる。
- automationSuitabilityだけでなくautomationReasonも保持できる。
- Feature単位で観点とケースを取得できる。
- Repositoryテストが通る。

## TASK-010: OpenQuestion / TraceLink / ChangeRecord

### Goal

未確認事項、トレーサビリティ、変更履歴の基礎を保存できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/06-traceability-spec.md`
- `docs/specs/07-change-management-spec.md`

### Scope

- `OpenQuestion` 型と `OpenQuestionStatus` を追加する。
- `openQuestionRepository` を追加する。
- OpenQuestionは `questionStatus` と `confidence` を持つ。
- `TraceNodeType`、`TraceLink`、`TraceLinkType` を追加する。
- `TraceLink` は `EntityBase` を持ち、論理削除できるようにする。
- `TraceLinkType` には `supports` を含める。
- `ChangeRecord` 型と `ChangeType` を追加する。
- `TraceNodeType` には `traceLink` を含め、TraceLink自体の変更履歴を記録できるようにする。
- linkTypeを持つTraceLinkを保存できるRepositoryを追加する。
- 変更対象、変更種別、変更前、変更後、理由、確度を保存できるようにする。
- 指定オブジェクトに関連するTraceLinkを取得できるようにする。

### Non-goals

- 影響候補の自動提示は実装しない。
- 変更差分UIは実装しない。
- カバレッジ可視化は実装しない。
- AIによる関連推定は実装しない。
- DomCaptureCandidateはこのタスクでは実装しない。
- Reserved modelのRepositoryはこのタスクでは実装しない。

### Acceptance criteria

- OpenQuestionをFeature / Screen / UiNodeなど任意の関連対象と紐づけて保存できる。
- OpenQuestionの `questionStatus` と `confidence` を保存できる。
- 任意の実装済みドメインオブジェクト間にTraceLinkを作成できる。
- TraceLinkに `linkType` がある。
- TraceLinkのfromType/toTypeは `TraceNodeType` に制限される。
- `supports` linkTypeを扱える。
- 指定オブジェクトに関連するTraceLinkを取得できる。
- ChangeRecordを保存できる。
- ChangeRecordの対象オブジェクト種別とIDを保持できる。
- ChangeRecordの `changeType` が `docs/specs/07-change-management-spec.md` と一致している。
- Repositoryテストが通る。

## TASK-010A: Reserved model hooks

### Goal

P1/P2で必要になるモデルを、P0実装で破壊的変更を起こさないように予約する。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- `State` / `StateTransition` の型を予約する。
- `Flow` / `FlowStep` の型を予約する。
- `ErrorCase` の型を予約する。
- `DecisionTable` / `DecisionTableRule` の型を予約する。
- `Evidence` の型を予約する。
- `TraceNodeType` と `ExportBundle` optional fieldsで、Reserved modelを後から追加できるようにする。
- P0でRepositoryやUIを実装しないモデルは、未実装であることを明確にコメントまたは設計文書に残す。

### Non-goals

- Reserved modelのRepository実装。
- Reserved modelのUI実装。
- State transition testingやDecision table generationの実装。
- Evidence管理UIの実装。

### Acceptance criteria

- Reserved modelの型定義が `docs/specs/01-domain-model.md` と一致している。
- P0のDexie schemaでReserved tableを作るかどうかが `docs/specs/02-storage-design.md` と矛盾しない。
- ExportBundleでReserved modelをoptional fieldとして扱う方針が明確である。
- P0ではReserved modelへのTraceLink作成UIを出さない方針が明確である。
- 後続PhaseでRepositoryを追加しても既存ExportBundleの意味が壊れない。
