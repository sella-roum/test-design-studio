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

## Import validation

import時は、少なくとも次を検証する。

- JSONとしてparseできる。
- schemaVersionが存在する。
- exportTypeが存在する。
- `exportType: "project"` の場合は project が存在する。
- `exportType: "project"` の場合は data セクションが存在する。
- P0必須配列が存在する。
- 参照IDの最低限の整合性がある。
- `TestCase.steps` が配列であり、各stepに `id`、`order`、`action`、`instruction` がある。
- `OpenQuestion.questionStatus` が定義済み値である。

不正な場合は、内部エラーではなく利用者が分かるエラーメッセージを表示する。

## ID handling

### create-new-project

新規Projectとして取り込む場合、Project IDは再生成する。

関連レコードのprojectIdも新しいProject IDへ置き換える。

その他のレコードIDは、衝突がない場合は維持してよい。衝突がある場合は再割当する。

### ID remapping rules

IDを再割当した場合は、参照元も同じtransaction内で必ず置き換える。

| 対象 | 置き換える参照 |
|---|---|
| Feature.id | Screen.featureId, BusinessRule.featureId, OpenQuestion.featureId, TestViewpoint.featureId, TestCase.featureId, State.featureId, StateTransition.featureId, Flow.featureId, ErrorCase.featureId |
| Screen.id | UiNode.screenId, BusinessRule.screenId, OpenQuestion.screenId, State.screenId, Flow.startScreenId, Flow.endScreenId, FlowStep.screenId, ErrorCase.screenId |
| UiNode.id | UiNode.parentId, BusinessRule.uiNodeId, OpenQuestion.uiNodeId, TestStep.targetUiNodeId, State.uiNodeId, FlowStep.uiNodeId, ErrorCase.uiNodeId |
| DataEntity.id | DataField.entityId, State.dataEntityId |
| DataType.id | DataField.dataTypeId |
| TestViewpoint.id | TestCase.viewpointId |
| State.id | StateTransition.fromStateId, StateTransition.toStateId |
| Flow.id | FlowStep.flowId |
| BusinessRule.id | DecisionTable.businessRuleId |
| 任意の対象ID | TraceLink.fromId, TraceLink.toId, ChangeRecord.targetId, StateTransition.targetId |

ID再マッピングは、全レコードの新旧ID対応表を作成してから適用する。

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
- CSV export
- GitHubへの直接push
- Google Driveやクラウドストレージ連携
- Excel形式出力
