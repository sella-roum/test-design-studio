# Storage Design

## Purpose

Test Design Studio はローカルファーストなアプリケーションとして実装する。初期実装では IndexedDB を永続化先とし、Dexie を利用して型付きのRepository層を構築する。

## Storage principles

- 長期保存データは IndexedDB に保存する。
- localStorage はテーマ、最後に開いたProject IDなど軽量なUI設定に限定する。
- UIコンポーネントからDexieを直接呼ばない。
- 永続化操作はRepository層を通す。
- export/importを前提に、schemaVersionを必ず保持する。
- 物理削除より論理削除を優先する。
- P0で専用UIを持たない予約モデルは、原則としてDexie schema、Repository、UIを先取り実装しない。

## Database

```ts
const DB_NAME = "test-design-studio";
```

初期schemaVersionは `1` とする。

```ts
type AppDatabaseMeta = {
  id: "default";
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
};
```

## Tables by phase

### P0 / Phase 2 required tables

P0のWeb Design MVPで必須となるテーブルは次の通り。

```text
projects
features
screens
uiNodes
dataEntities
dataFields
dataTypes
businessRules
openQuestions
testViewpoints
testCases
traceLinks
changeRecords
```

`changeRecords` は本格UIはP1だが、Phase 7で破壊的変更を避けるため、Phase 2で型とテーブルを用意する。

### P1 / Phase 5-7 tables

Chrome拡張、候補レビュー、変更追跡で使用する。

```text
uiCaptureCandidates
```

`domCaptureCandidates` は旧称として扱う。新規実装では、DOM CaptureとAccessibility Tree Captureの両方を扱える `uiCaptureCandidates` を使う。

`traceLinks` と `changeRecords` はP0で保存層を用意し、P1でUIと影響候補表示を拡張する。

### Reserved tables

次のテーブルは、親設計書とP2以降の拡張で必要になるため将来候補として予約する。

```text
states
stateTransitions
flows
flowSteps
errorCases
decisionTables
evidences
viewpointCandidates
importLogs
exportLogs
```

ただし、P0では原則としてReserved tablesをDexie schemaへ追加しない。

P0で許可するのは次に限る。

- 型定義として予約する。
- `TraceNodeType` に将来候補として含める。
- `ExportBundle` のoptional fieldとして予約する。
- Non-goalsまたは該当仕様書に、未実装であることを明記する。

Reserved table、Repository、UIを実装する場合は、該当Phaseの詳細タスクに明示されている場合のみ許可する。

## Index policy

Dexieでは、一覧取得と関連取得を優先してindexを定義する。

### P0 index policy

P0でDexie schemaへ追加するindexは次の通り。

```ts
projects: "id, status, updatedAt"
features: "id, projectId, [projectId+status], updatedAt"
screens: "id, projectId, featureId, [featureId+status], updatedAt"
uiNodes: "id, projectId, screenId, parentId, [screenId+status], sortOrder"
dataEntities: "id, projectId, [projectId+status]"
dataFields: "id, projectId, entityId, dataTypeId"
dataTypes: "id, projectId, [projectId+status]"
businessRules: "id, projectId, featureId, screenId, uiNodeId, [projectId+status]"
openQuestions: "id, projectId, featureId, screenId, uiNodeId, questionStatus, [projectId+status]"
testViewpoints: "id, projectId, featureId, [featureId+status]"
testCases: "id, projectId, featureId, viewpointId, [featureId+status]"
traceLinks: "id, projectId, fromId, toId, [fromType+fromId], [toType+toId], linkType, status"
changeRecords: "id, projectId, targetId, [targetType+targetId], changeType, updatedAt"
```

### P1 index policy

P1で `uiCaptureCandidates` tableを実装するPhaseで追加する。

```ts
uiCaptureCandidates: "id, projectId, screenId, sourceUrl, status, captureMode, capturedAt"
```

### Reserved index candidates

Reserved tablesのindex候補は、該当tableを実装するPhaseで追加する。P0ではDexie schemaへ追加しない。

```ts
evidences: "id, projectId, sourceType, [projectId+status]"
```

実装時にDexieの複合index制約と照合し、不要または不正なindexは調整する。

## Repository layer

P0で必須の主要モデルにRepositoryを用意する。

```text
projectRepository
featureRepository
screenRepository
uiNodeRepository
dataEntityRepository
dataFieldRepository
dataTypeRepository
businessRuleRepository
openQuestionRepository
testViewpointRepository
testCaseRepository
traceLinkRepository
changeRecordRepository
```

P1以降で追加するRepository:

```text
uiCaptureCandidateRepository
```

`domCaptureCandidateRepository` は旧称として扱う。新規実装では `uiCaptureCandidateRepository` を使う。

Reserved repository candidates:

```text
stateRepository
stateTransitionRepository
flowRepository
flowStepRepository
errorCaseRepository
decisionTableRepository
evidenceRepository
viewpointCandidateRepository
importLogRepository
exportLogRepository
```

Reserved repository candidatesは、該当Phaseの詳細タスクに明示されるまで実装しない。

Repositoryは次の基本操作を提供する。

```ts
type Repository<T> = {
  create(input: CreateInput<T>): Promise<T>;
  get(id: string): Promise<T | undefined>;
  listByProject(projectId: string): Promise<T[]>;
  update(id: string, patch: Partial<T>): Promise<T>;
  markRemoved(id: string): Promise<T>;
};
```

モデル別に必要な場合は、次のような関連取得APIを追加してよい。

```ts
listByFeature(featureId: string): Promise<T[]>;
listByScreen(screenId: string): Promise<T[]>;
listByParent(parentId: string): Promise<T[]>;
listActiveByProject(projectId: string): Promise<T[]>;
```

物理削除が必要な場合は、通常のRepository APIとは別に明示的なメンテナンス操作として扱う。

## Repository behavior contract

Repositoryは、UIからDexieを直接操作させないための永続化境界である。各Repositoryは、最低限次の振る舞いを満たす。

### create

- `id`、`createdAt`、`updatedAt`、`status` はRepositoryで補完する。
- `id` はRepositoryが生成する。UUID v4など、Project間・端末間・import後でも衝突しにくいグローバル一意IDを使う。
- `status` の初期値は `"active"` とする。
- `projectId` など必須参照が不足している場合は保存せず、`ValidationError` 相当のエラーとして扱う。
- 作成後の完全なEntityを返す。

### get

- 指定IDのEntityを返す。
- 存在しない場合は `undefined` を返す。
- デフォルトでは `status: "removed"` のEntityも取得可能とする。
- UI表示用の一覧取得では、原則としてremovedを除外する。

### listByProject / listByFeature / listByScreen

- デフォルトでは `status !== "removed"` のEntityのみ返す。
- 並び順が必要なモデルは、仕様書またはRepositoryで明示する。
- removedを含める必要がある場合は、明示的なoptionを追加する。

### update

- `id`、`projectId`、`createdAt` は変更不可とする。
- `updatedAt` はRepositoryで更新する。
- 対象が存在しない場合は `NotFoundError` 相当のエラーとして扱う。
- 変更後の完全なEntityを返す。

### markRemoved

- 対象が存在しない場合は `NotFoundError` 相当のエラーとして扱う。
- 物理削除ではなく `status = "removed"` に更新する。
- `updatedAt` を更新する。
- 関連データの論理削除はCascade policyに従う。

### validation

- Repositoryは最低限の必須参照とenum値を検証する。
- 複雑なフォーム入力検証はUI層で行ってよい。
- Import時の構造検証はImport validationを正とする。

### error types

Repository層では、少なくとも次のエラー種別を区別できるようにする。

- `NotFoundError`: 更新・論理削除対象が存在しない。
- `ValidationError`: 必須参照、enum、入力制約に違反している。
- `StorageUnavailableError`: IndexedDBが利用できない、または永続化に失敗した。

実装上の表現は独自Error classでもResult型でもよいが、UI層で区別できる形にする。

## Cascade policy

論理削除時は、関連データの扱いを明示する。

- Projectを `removed` にする場合、配下のFeature、Screen、UiNode、DataEntity、DataField、DataType、BusinessRule、OpenQuestion、TestViewpoint、TestCase、TraceLink、ChangeRecordも論理削除対象にする。
- Featureを `removed` にする場合、関連Screen、UiNode、BusinessRule、OpenQuestion、TestViewpoint、TestCaseを論理削除対象にする。
- DataTypeは複数Featureから参照される可能性があるため、Feature削除では自動削除しない。
- TraceLinkは参照先が `removed` になっても保持する。リンク自体が不要になった場合は `TraceLink.status = "removed"` にする。
- ChangeRecordは履歴として保持する。Project削除以外では原則として自動削除しない。
- export時にremovedデータを含めるかは選択可能にする。

## Transactions

複数テーブルを同時に更新する操作はtransactionで実行する。

対象例:

- Project削除時に配下データを論理削除する。
- Feature削除時に関連Screen、UiNode、BusinessRule、OpenQuestion、Viewpoint、TestCaseを論理削除する。
- Project import時に複数テーブルをまとめて書き込む。
- UiCaptureBundle import時に候補をまとめて書き込む。
- ChangeRecord作成時にTraceLinkを同時作成する。
