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

## Tables

初期実装で想定する主なテーブルは次の通り。

```text
projects
features
screens
uiNodes
dataEntities
dataFields
dataTypes
businessRules
testViewpoints
testCases
traceLinks
changeRecords
domCaptureCandidates
evidences
importLogs
exportLogs
```

`evidences` は初期実装では予約テーブル扱いでもよい。`DomCaptureCandidate` はChrome拡張候補レビューのPhaseで利用する。

## Index policy

Dexieでは、一覧取得と関連取得を優先してindexを定義する。

```ts
projects: "id, status, updatedAt"
features: "id, projectId, [projectId+status], updatedAt"
screens: "id, projectId, featureId, [featureId+status], updatedAt"
uiNodes: "id, projectId, screenId, parentId, [screenId+status], sortOrder"
dataEntities: "id, projectId, [projectId+status]"
dataFields: "id, projectId, entityId, dataTypeId"
dataTypes: "id, projectId, [projectId+status]"
businessRules: "id, projectId, featureId, screenId, uiNodeId, [projectId+status]"
testViewpoints: "id, projectId, featureId, [featureId+status]"
testCases: "id, projectId, featureId, viewpointId, [featureId+status]"
traceLinks: "id, projectId, fromId, toId, [fromType+fromId], [toType+toId], linkType"
changeRecords: "id, projectId, targetId, [targetType+targetId], changeType, updatedAt"
domCaptureCandidates: "id, projectId, screenId, sourceUrl, status, capturedAt"
evidences: "id, projectId, sourceType, [projectId+status]"
```

実装時にDexieの複合index制約と照合し、不要または不正なindexは調整する。

## Repository layer

各主要モデルにRepositoryを用意する。

```text
projectRepository
featureRepository
screenRepository
uiNodeRepository
dataEntityRepository
dataFieldRepository
dataTypeRepository
businessRuleRepository
testViewpointRepository
testCaseRepository
traceLinkRepository
changeRecordRepository
domCaptureCandidateRepository
```

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

物理削除が必要な場合は、通常のRepository APIとは別に明示的なメンテナンス操作として扱う。

## Transactions

複数テーブルを同時に更新する操作はtransactionで実行する。

対象例:

- Project削除時に配下データを論理削除する。
- Feature削除時に関連Screen、UiNode、Viewpoint、TestCaseを論理削除する。
- Project import時に複数テーブルをまとめて書き込む。
- DomCaptureBundle import時に候補をまとめて書き込む。
- ChangeRecord作成時にTraceLinkを同時作成する。

## Migration policy

schemaVersionを上げる場合は、次を満たす。

1. migration内容をコードコメントまたはdocsに残す。
2. 既存データを可能な限り保持する。
3. 破壊的変更が必要な場合はexport/importで退避できるようにする。
4. migrationテストを追加する。

## Import/export relationship

JSON exportはIndexedDBの論理データを外部に持ち出すための正規フォーマットである。

export対象には次を含める。

- schemaVersion
- appVersion
- exportedAt
- exportType
- project
- related records

Project importの初期実装では、次のモードのみを扱う。

```text
create-new-project: 新規Projectとして取り込む
```

以下は後続フェーズで検討する。

```text
replace-project: 既存Projectを置き換える
merge-into-project: 既存Projectへ差分取り込みする
```

既存Projectへの置き換えやマージは、確認UI、transaction、安全な退避、ID再マッピングの仕様が必要になるため、初期実装では扱わない。

Chrome拡張候補の取り込みは、Project backupとは別の `DomCaptureBundle` として扱う。

## Error handling

Repository層では、次のエラーを区別する。

- not found
- validation error
- storage unavailable
- schema mismatch
- import format error

UIでは内部エラーをそのまま表示せず、利用者が次に取るべき行動が分かる表現に変換する。

## Testing

次のテストを優先する。

- RepositoryのCRUD
- 論理削除
- 関連データの取得
- export/import round trip
- schemaVersion不一致時のエラー
