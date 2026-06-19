# Phase 4 Export / Importタスク詳細

この文書は、Phase 4 のExport / Import実装タスクを定義する。

Phase 4では、Webアプリ単体で蓄積した設計データを、成果物化・バックアップ・Git管理・将来のChrome拡張連携に使える形で出力・復元できるようにする。

## 共通参照

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/09-non-goals.md`
- `docs/specs/11-accessibility-tree-capture.md`

## 共通ルール

- JSONは復元可能性を優先する。
- Markdownは人間が読める成果物としての品質を優先する。
- Project Importは初期実装では新規Projectとして取り込む。
- 既存Projectへの差分mergeや上書きは実装しない。
- Chrome拡張候補はProject backupとは別の `UiCaptureBundle` として扱う。
- `DomCaptureBundle` は旧称として扱い、新規実装では `UiCaptureBundle` に寄せる。
- クラウド同期、外部連携、AI API呼び出しは実装しない。
- P0ではCSV exportを実装しない。CSVは後続Phaseの追加形式とする。
- P0必須モデルであるOpenQuestionとTestStepは、Markdown / JSONで失われてはいけない。

## TASK-017: Markdown Export

### Goal

Feature単位で、仕様・未確認事項・観点・ケースを人間が読めるMarkdownとして出力できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/05-import-export-spec.md`

### Scope

- Feature export用のMarkdown生成関数を追加する。
- UIからMarkdownをコピーまたはダウンロードできるようにする。
- Feature / Screen / UiNode / DataEntity / DataField / DataType / BusinessRule / OpenQuestion / TestViewpoint / TestCaseを含める。
- TestCaseの手順は `TestStep[]` の順序、action、instruction、expectedResult、targetUiNodeIdが読める形で出力する。
- 未確認事項はOpen QuestionsまたはAssumptions / Unknownsのセクションとして出力する。
- confidenceが `tentative` / `assumed` / `unknown` の情報は、未確定であることが読めるようにする。
- ChangeRecordが存在する場合は出力できる構造にする。
- Markdown生成関数のテストを追加する。

### Non-goals

- JSON exportは実装しない。
- CSV exportは実装しない。
- AI用最適化出力は実装しない。
- PDF出力は実装しない。

### Acceptance criteria

- Feature単位でMarkdownを生成できる。
- 生成Markdownに仕様・UI・データ・ルール・未確認事項・観点・ケースが含まれる。
- OpenQuestionがMarkdown出力から漏れない。
- TestCase.stepsが順序付きの手順として出力される。
- Markdownをコピーまたはダウンロードできる。
- データがないセクションは空状態として読める形で出力される。
- Markdown生成関数のテストがある。

## TASK-018: JSON Export / Import

### Goal

Project単位のバックアップ・復元ができるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/05-import-export-spec.md`

### Scope

- `ExportBundle` 型を追加する。
- Project単位のJSON exportを追加する。
- JSON importを追加する。
- schemaVersionを検証する。
- 初期実装では新規Projectとしてimportする。
- 不正JSON、schemaVersion不一致、必須データ欠落時のエラーを表示する。
- OpenQuestionをexport/import対象に含める。
- TestCase.stepsの `TestStep[]` 構造をexport/importで保持する。
- Reserved modelはoptional fieldとして扱い、存在しても取り込み方針が破綻しないようにする。

### Non-goals

- 差分importは実装しない。
- 既存Projectへの上書きimportは実装しない。
- `replace-project` importは実装しない。
- クラウド同期は実装しない。
- 外部ストレージ保存は実装しない。
- Chrome拡張との自動同期は実装しない。
- UiCaptureBundle importはPhase 5-6で扱い、TASK-018では実装しない。
- CSV export/importは実装しない。

### Acceptance criteria

- Project単位でJSONをexportできる。
- exportしたJSONを新規Projectとしてimportできる。
- OpenQuestionがexport/importで失われない。
- TestCase.stepsが `TestStep[]` としてexport/importで失われない。
- traceLinksのfromId/toId、ChangeRecordのtargetId、TestCaseのviewpointIdなど内部参照IDが再マッピングされる。
- 不正JSON時にエラー表示できる。
- schemaVersion不一致時にエラー表示できる。
- import前に取り込み内容の概要を表示できる。
- import後にProject一覧またはProject Dashboardから確認できる。

## ExportBundleの基本方針

JSONには最低限、以下を含める。

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
    states?: State[];
    stateTransitions?: StateTransition[];
    flows?: Flow[];
    flowSteps?: FlowStep[];
    errorCases?: ErrorCase[];
    decisionTables?: DecisionTable[];
    evidences?: Evidence[];
  };
};
```

`TestCase.steps` は `TestStep[]` として保持する。Markdown出力時は読みやすさのため番号付き手順に変換してよいが、JSONでは構造を潰さない。

初期Importでは、既存Projectの上書きやmergeは行わない。ID衝突や差分取り込みは後続Phaseで扱う。

## Reserved fieldsの扱い

- Reserved modelのfieldはoptionalとする。
- P0でRepository未実装のReserved modelは、空配列または未指定でよい。
- import時にReserved modelが含まれていても、未対応の場合は取り込み前の概要で警告し、部分取り込みしない。
- 後続PhaseでRepositoryを追加した場合も、schemaVersionの意味が壊れないようにする。

## UiCaptureBundleの方針

Chrome拡張候補は、Project ExportBundleとは別の形式で扱う。

```ts
type UiCaptureBundle = {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  exportType: "ui-capture";
  source: "chrome-extension" | "playwright" | "manual-import";
  candidates: UiCaptureCandidate[];
};
```

`UiCaptureBundle` importは、Project復元ではなく候補レビュー用の取り込みである。候補を自動でUiNode化しない。

`DomCaptureBundle` は旧称として扱う。既存ファイル互換が必要な場合は、`exportType: "dom-capture"` を `ui-capture` 相当に変換する方針を該当タスクで定義する。

## Import時の初期ルール

- import対象はProject単位またはUiCaptureBundle単位とする。
- 既存Projectに上書きしない。
- Project importでは取り込み時に新しいProject IDを採番する。
- 内部参照IDは新しいIDへ再マッピングする。
- UiCaptureBundle importでは候補をレビュー待ちとして保存する。
- schemaVersionが未対応の場合は取り込まない。
- 不正データは部分取り込みせず、エラーとして扱う。

## ID remapping rules

Project importでは、新しいProject IDを採番したうえで、関連IDを一貫して再マッピングする。

| 対象 | 再マッピング対象 |
|---|---|
| Project | `project.id` |
| EntityBase | `projectId` |
| Feature | `id` |
| Screen | `id`, `featureId` |
| UiNode | `id`, `screenId`, `parentId` |
| DataEntity | `id` |
| DataField | `id`, `entityId`, `dataTypeId` |
| DataType | `id` |
| BusinessRule | `id`, `featureId`, `screenId`, `uiNodeId` |
| OpenQuestion | `id`, `featureId`, `screenId`, `uiNodeId` |
| TestViewpoint | `id`, `featureId` |
| TestCase | `id`, `featureId`, `viewpointId`, `steps[].targetUiNodeId` |
| TraceLink | `id`, `fromId`, `toId` |
| ChangeRecord | `id`, `targetId` |
| State | `id`, `featureId`, `screenId`, `uiNodeId`, `dataEntityId` |
| StateTransition | `id`, `featureId`, `targetId`, `fromStateId`, `toStateId` |
| Flow | `id`, `featureId`, `startScreenId`, `endScreenId` |
| FlowStep | `id`, `flowId`, `screenId`, `uiNodeId` |
| ErrorCase | `id`, `featureId`, `screenId`, `uiNodeId` |
| DecisionTable | `id`, `businessRuleId` |
| Reserved model | 対応Repositoryが実装されたPhaseで、上記以外の参照を個別に追加定義する |

`UiCaptureCandidate` はProject ExportBundleのP0 import対象ではない。UiCaptureBundle importで扱う場合のID再マッピングは、Phase 5-6の候補取り込みタスクで定義する。

ID再マッピングは、まず全対象のoldId→newIdマップを作り、その後に参照IDを置換する。参照先が存在しない場合はimportを失敗させるか、取り込み前の検証でエラーとして表示する。
