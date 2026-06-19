# Phase 2 ドメイン・保存層タスク詳細

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

### Acceptance criteria
- ProjectをCRUDできる。
- Project一覧を取得できる。
- Repositoryテストが通る。

## PR-006: Feature / ScreenモデルとRepository

### Goal
Project配下にFeatureとScreenを保存できるようにする。

### Scope
- `Feature` 型を追加する。
- `Screen` 型を追加する。
- Dexie schemaに `features` / `screens` を追加する。
- `featureRepository` と `screenRepository` を追加する。
- Project単位、Feature単位で取得できるようにする。

### Non-goals
- UIツリーは実装しない。
- Feature Workspace UIは実装しない。
- Chrome拡張は実装しない。

### Acceptance criteria
- ProjectにFeatureを紐づけられる。
- ProjectにScreenを紐づけられる。
- Featureに関連するScreenを取得できる。

## PR-007: UiNodeモデルとRepository

### Goal
テスト設計上意味のあるUI要素をUiNodeとして保存できるようにする。

### Scope
- `UiNode` 型と `UiNodeType` を追加する。
- parent-child構造を保存できるようにする。
- Dexie schemaに `uiNodes` を追加する。
- Screen単位でUiNodeツリーを取得できるRepositoryを追加する。

### Non-goals
- DOMスキャンは実装しない。
- Element Pickerは実装しない。
- UIツリー編集画面は実装しない。

### Acceptance criteria
- ScreenにUiNodeを追加できる。
- parentIdにより階層構造を表現できる。
- Screen単位でUiNode一覧を取得できる。

## PR-008: DataモデルとRepository

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

### Acceptance criteria
- DataEntityを保存できる。
- DataFieldをDataEntityに紐づけられる。
- DataFieldをDataTypeに紐づけられる。
- Project単位でDataTypeを取得できる。

## PR-009: BusinessRule / TestViewpoint / TestCase

### Goal
仕様ルール、テスト観点、テストケースを保存できる中核モデルを実装する。

### Scope
- `BusinessRule` 型を追加する。
- `TestViewpoint` 型を追加する。
- `TestCase` 型を追加する。
- Feature単位で取得できるRepositoryを追加する。

### Non-goals
- 自動観点生成は実装しない。
- ケース実行管理は実装しない。
- Playwrightコード生成は実装しない。

### Acceptance criteria
- BusinessRuleをFeatureに紐づけて保存できる。
- TestViewpointをFeatureに紐づけて保存できる。
- TestCaseをTestViewpointに紐づけて保存できる。

## PR-010: TraceLink / ChangeRecord

### Goal
トレーサビリティと変更履歴の基礎を保存できるようにする。

### Scope
- `TraceLink` 型と `TraceLinkType` を追加する。
- `ChangeRecord` 型を追加する。
- linkTypeを持つTraceLinkを保存できるRepositoryを追加する。
- 変更対象、変更種別、変更前、変更後、理由、確度を保存できるようにする。

### Non-goals
- 影響候補の自動提示は実装しない。
- 変更差分UIは実装しない。
- カバレッジ可視化は実装しない。

### Acceptance criteria
- 任意のドメインオブジェクト間にTraceLinkを作成できる。
- TraceLinkに `linkType` がある。
- ChangeRecordを保存できる。
