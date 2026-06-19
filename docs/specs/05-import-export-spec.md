# Import / Export Spec

## Purpose

Import / Export は、Test Design Studio のローカルファースト運用を支える中核機能である。

主な用途は次の通り。

- バックアップ
- 端末間移行
- Git管理
- Chrome拡張との連携
- AIエージェントへの構造化入力
- Markdown形式での人間向けレビュー

## Export formats

P0で必須とする形式:

```text
JSON: 完全バックアップ・再取り込み用
Markdown: レビュー・共有・Git管理用
```

P1以降で扱う形式:

```text
DomCaptureBundle JSON: Chrome拡張候補取り込み用
CSV: TestCase一覧の外部利用用
```

CSVは有用だが、P0では必須にしない。P0ではJSONとMarkdownを正規対象とする。

## Project JSON export

Project JSON export は、Project単位で行う。

```ts
type ExportBundle = {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  exportType: "project";
  project: Project;
  data: {
    features: Feature[];
    screens: Screen[];
    uiNodes: UiNode[];
    dataEntities: DataEntity[];
    dataFields: DataField[];
    dataTypes: DataType[];
    businessRules: BusinessRule[];
    openQuestions: OpenQuestion[];
    testViewpoints: TestViewpoint[];
    testCases: TestCase[];
    traceLinks: TraceLink[];
    changeRecords: ChangeRecord[];
    evidences?: Evidence[];
    states?: State[];
    stateTransitions?: StateTransition[];
    flows?: Flow[];
    flowSteps?: FlowStep[];
    errorCases?: ErrorCase[];
    decisionTables?: DecisionTable[];
  };
};
```

`evidences`、`states`、`stateTransitions`、`flows`、`flowSteps`、`errorCases`、`decisionTables` はP0では必須ではないため optional とする。ただし、schemaVersionを上げる際に破壊的変更が起きないよう、reserved fieldとして扱う。

## Project JSON export requirements

- Project単位で出力する。
- schemaVersionを必ず含める。
- exportedAtをISO文字列で含める。
- exportTypeを `project` として含める。
- 論理削除済みデータを含めるかどうかを選択可能にする。
- 参照関係が壊れないように、関連レコードをまとめて出力する。
- 出力前に最低限の整合性チェックを行う。
- `TestCase.steps` は `TestStep[]` として出力する。
- `OpenQuestion` は、未確認事項が失われないよう必ず出力対象にする。

## Project JSON import

P0では、Project import mode は次のみを扱う。

```text
create-new-project: 新規Projectとして取り込む
```

以下は後続フェーズで検討する。

```text
replace-project: 既存Projectを置き換える
merge-into-project: 既存Projectへ差分取り込みする
```

`replace-project` と `merge-into-project` は、確認UI、transaction、安全な退避、ID再マッピング、部分失敗時のrollback設計が必要になるため、P0では扱わない。

## P0 importer scope

P0 importerは、P0必須モデルのみを取り込む。

P0で取り込む対象:

- project
- features
- screens
- uiNodes
- dataEntities
- dataFields
- dataTypes
- businessRules
- openQuestions
- testViewpoints
- testCases
- traceLinks
- changeRecords

P0で取り込まないReserved model:

- states
- stateTransitions
- flows
- flowSteps
- errorCases
- decisionTables
- evidences
- viewpointCandidates
- importLogs
- exportLogs

Reserved model fieldが未指定、または空配列の場合は無視する。
Reserved model fieldにデータが含まれている場合、P0では取り込まず、import前確認で警告を表示する。

P0 importerはReserved modelのID remappingを実装しない。
Reserved modelの取り込みは、該当RepositoryとUIが実装されたPhaseで個別に扱う。

### P0 TraceLink / ChangeRecord import constraints

P0 importerは、`traceLinks` / `changeRecords` についてもP0 storage-level TraceNodeTypeのみを取り込む。

次のいずれかに該当する場合、P0では取り込まない。

- `TraceLink.fromType` がP0 storage-level TraceNodeTypeではない。
- `TraceLink.toType` がP0 storage-level TraceNodeTypeではない。
- `ChangeRecord.targetType` がP0 storage-level TraceNodeTypeではない。
- `fromId` / `toId` / `targetId` の参照先が、P0 importerで取り込まれるデータに存在しない。

P0未対応のTraceLink / ChangeRecordが含まれる場合は、壊れた参照を作らないためimportを失敗させる。

部分的に除外して取り込む方式は、利用者が欠落に気づかないまま不完全なトレーサビリティを保存するリスクがあるため、P0では採用しない。将来、部分取り込みを行う場合は、取り込み前確認、除外一覧、監査可能なimport logを設計してから実装する。

## Import validation

import時は、少なくとも次を検証する。

- JSONとしてparseできる。
- schemaVersionが存在する。
- exportTypeが存在する。
- `exportType: "project"` の場合は project が存在する。
- `exportType: "project"` の場合は data セクションが存在する。
- P0必須配列が存在する。
- Reserved model fieldにデータが含まれている場合は、P0では警告対象として扱う。
- traceLinks / changeRecords がP0 storage-level TraceNodeTypeだけを参照している。
- traceLinks / changeRecords の参照先IDが、P0 importerで取り込まれるデータ内に存在する。
- 参照IDの最低限の整合性がある。
- `TestCase.steps` が配列であり、各stepに `id`、`order`、`action`、`instruction` がある。
- `OpenQuestion.questionStatus` が定義済み値である。

不正な場合は、内部エラーではなく利用者が分かるエラーメッセージを表示する。

## ID handling

### create-new-project

新規Projectとして取り込む場合、Project IDは再生成する。

関連レコードのprojectIdも新しいProject IDへ置き換える。

その他のレコードIDは、衝突がない場合は維持してよい。衝突がある場合は再割当する。

### P0 ID remapping rules

P0 importerでは、次の参照IDを同一transaction内で再マッピングする。

| 対象 | 置き換える参照 |
|---|---|
| Project.id | すべての `projectId` |
| Feature.id | Screen.featureId, BusinessRule.featureId, OpenQuestion.featureId, TestViewpoint.featureId, TestCase.featureId |
| Screen.id | UiNode.screenId, BusinessRule.screenId, OpenQuestion.screenId |
| UiNode.id | UiNode.parentId, BusinessRule.uiNodeId, OpenQuestion.uiNodeId, TestStep.targetUiNodeId |
| DataEntity.id | DataField.entityId |
| DataType.id | DataField.dataTypeId |
| TestViewpoint.id | TestCase.viewpointId |
| 任意のP0対象ID | TraceLink.fromId, TraceLink.toId, ChangeRecord.targetId |

ID再マッピングは、全レコードの新旧ID対応表を作成してから適用する。

TraceLink / ChangeRecordの再マッピングは、P0 importerで取り込む対象に参照先が存在する場合だけ行う。参照先がReserved model、またはP0取り込み対象外のTraceNodeTypeである場合、P0ではimport全体を失敗させる。

### Future ID remapping rules

Reserved modelのID remappingは、該当モデルのRepositoryとImport対応を実装するPhaseで追加する。

例:

| 対象 | 置き換える参照 |
|---|---|
| State.id | StateTransition.fromStateId, StateTransition.toStateId |
| Flow.id | FlowStep.flowId |
| BusinessRule.id | DecisionTable.businessRuleId |
| Reserved model | 該当PhaseのImport仕様で個別に定義する |

### future: replace-project

既存Projectを置き換える方式は後続フェーズで扱う。P0では実装しない。

## DomCaptureBundle

Chrome拡張候補は、Projectの完全バックアップとは別のJSON形式で扱う。

```ts
type DomCaptureBundle = {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  exportType: "dom-capture";
  source: "chrome-extension";
  candidates: DomCaptureCandidate[];
};
```

### DomCaptureBundle import requirements

- `exportType: "dom-capture"` を検証する。
- candidates配列を検証する。
- Project全体の置き換えや復元には使わない。
- 取り込んだ候補は、候補レビュー画面でユーザーが確認する。
- `DomCaptureCandidate` は自動で `UiNode` にしない。
- ユーザーが確認・編集・承認した候補だけを `UiNode` へ変換する。
- 取り込み時にもData safety / Privacyのredaction rulesを再確認する。

## Markdown export

Markdown export は、人間がレビューしやすい形式を優先する。

推奨構成:

```md
# Project name

## Feature: feature name

### Overview

### Screens

### UI Tree

### Data Types

### Business Rules

### Open Questions

### Test Viewpoints

### Test Cases

### Change Records

### Traceability
```

## Markdown export requirements

- Project全体、Feature単位のどちらでも出力できるようにする。
- Feature単位exportでも、Project名、exportedAt、schemaVersionを含める。
- TestCaseは手順と期待結果が読みやすい形にする。
- `TestStep.order` の順に手順を出力する。
- `TestStep.targetUiNodeId` がある場合は、対応するUiNode名も出力する。
- TraceLinkは、少なくとも元仕様と観点・ケースの関係が分かる形にする。
- OpenQuestionは、未確認・回答済み・保留が分かる形で出力する。
- 未確認・仮説状態の情報はconfidenceを明記する。
- `automationSuitability` と `automationReason` を出力する。
- 論理削除済みデータを含める場合は、`removed` であることが分かるようにする。

## CSV export

CSV export は、TestCase一覧の外部利用を主目的とする。

CSV export はP0の必須対象ではない。P1以降でタスク化してから実装する。

推奨列:

```text
Project
Feature
Viewpoint
TestCase
Preconditions
Steps
ExpectedResult
TestData
Priority
AutomationSuitability
AutomationReason
Status
```

CSVでは複雑なTraceLinkやChangeRecordの完全表現は目指さない。

## Export file naming

推奨命名:

```text
test-design-studio-{projectName}-{yyyyMMdd-HHmmss}.json
test-design-studio-{projectName}-{yyyyMMdd-HHmmss}.md
test-design-studio-{projectName}-testcases-{yyyyMMdd-HHmmss}.csv
test-design-studio-dom-capture-{yyyyMMdd-HHmmss}.json
```

## Schema compatibility

- 同一schemaVersionのimportを優先対応する。
- 古いschemaVersionはmigration可能な範囲で対応する。
- 新しいschemaVersionは警告し、原則として取り込まない。

## Non-goals

P0では次を扱わない。

- 複数Projectを1ファイルにまとめたexport
- 既存Projectへの置き換えimport
- 差分import
- Reserved modelの取り込み
- Reserved modelのID remapping
- P0未対応TraceNodeTypeを参照するTraceLink / ChangeRecordの部分取り込み
- CSV export
- GitHubへの直接push
- Google Driveやクラウドストレージ連携
- Excel形式出力
