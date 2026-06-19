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

初期実装では、次の形式を扱う。

```text
JSON: 完全バックアップ・再取り込み用
Markdown: レビュー・共有・Git管理用
CSV: テストケース一覧の外部利用用
DomCaptureBundle JSON: Chrome拡張候補取り込み用
```

CSVは後続でもよいが、JSONとMarkdownは早期に実装する。

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
    testViewpoints: TestViewpoint[];
    testCases: TestCase[];
    traceLinks: TraceLink[];
    changeRecords: ChangeRecord[];
    evidences?: Evidence[];
  };
};
```

`evidences` は初期実装では必須ではないため optional とする。

## Project JSON export requirements

- Project単位で出力する。
- schemaVersionを必ず含める。
- exportedAtをISO文字列で含める。
- exportTypeを `project` として含める。
- 論理削除済みデータを含めるかどうかを選択可能にする。
- 参照関係が壊れないように、関連レコードをまとめて出力する。
- 出力前に最低限の整合性チェックを行う。

## Project JSON import

初期実装では、Project import mode は次のみを扱う。

```text
create-new-project: 新規Projectとして取り込む
```

以下は後続フェーズで検討する。

```text
replace-project: 既存Projectを置き換える
merge-into-project: 既存Projectへ差分取り込みする
```

`replace-project` と `merge-into-project` は、確認UI、transaction、安全な退避、ID再マッピング、部分失敗時のrollback設計が必要になるため、初期実装では扱わない。

## Import validation

import時は、少なくとも次を検証する。

- JSONとしてparseできる。
- schemaVersionが存在する。
- exportTypeが存在する。
- `exportType: "project"` の場合は project が存在する。
- `exportType: "project"` の場合は data セクションが存在する。
- 必須配列が存在する。
- 参照IDの最低限の整合性がある。

不正な場合は、内部エラーではなく利用者が分かるエラーメッセージを表示する。

## ID handling

### create-new-project

新規Projectとして取り込む場合、Project IDは再生成する。

関連レコードのprojectIdも新しいProject IDへ置き換える。

その他のレコードIDは、衝突がない場合は維持してよい。衝突がある場合は再割当する。

### future: replace-project

既存Projectを置き換える方式は後続フェーズで扱う。初期実装では実装しない。

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

### Test Viewpoints

### Test Cases

### Change Records

### Traceability
```

## Markdown export requirements

- Project全体、Feature単位のどちらでも出力できるようにする。
- TestCaseは手順と期待結果が読みやすい形にする。
- TraceLinkは、少なくとも元仕様と観点・ケースの関係が分かる形にする。
- 未確認・仮説状態の情報はconfidenceを明記する。

## CSV export

CSV export は、TestCase一覧の外部利用を主目的とする。

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

初期実装では次を扱わない。

- 複数Projectを1ファイルにまとめたexport
- 既存Projectへの置き換えimport
- 差分import
- GitHubへの直接push
- Google Driveやクラウドストレージ連携
- Excel形式出力
