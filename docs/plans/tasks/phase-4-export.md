# Phase 4 Export / Importタスク詳細

この文書は、Phase 4 のExport / Import実装タスクを定義する。

Phase 4では、Webアプリ単体で蓄積した設計データを、成果物化・バックアップ・Git管理・将来のChrome拡張連携に使える形で出力・復元できるようにする。

## 共通参照

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/09-non-goals.md`

## 共通ルール

- JSONは復元可能性を優先する。
- Markdownは人間が読める成果物としての品質を優先する。
- Importは初期実装では新規Projectとして取り込む。
- 既存Projectへの差分mergeや上書きは実装しない。
- クラウド同期、外部連携、AI API呼び出しは実装しない。

## PR-017: Markdown Export

### Goal

Feature単位で、仕様・観点・ケースを人間が読めるMarkdownとして出力できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/05-import-export-spec.md`

### Scope

- Feature export用のMarkdown生成関数を追加する。
- UIからMarkdownをコピーまたはダウンロードできるようにする。
- Feature / Screen / UiNode / DataType / BusinessRule / TestViewpoint / TestCaseを含める。
- 未確認事項やChangeRecordが存在する場合は出力できる構造にする。
- Markdown生成関数のテストを追加する。

### Non-goals

- JSON exportは実装しない。
- CSV exportは実装しない。
- AI用最適化出力は実装しない。
- PDF出力は実装しない。

### Acceptance criteria

- Feature単位でMarkdownを生成できる。
- 生成Markdownに仕様・UI・データ・ルール・観点・ケースが含まれる。
- Markdownをコピーまたはダウンロードできる。
- データがないセクションは空状態として読める形で出力される。
- Markdown生成関数のテストがある。

## PR-018: JSON Export / Import

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

### Non-goals

- 差分importは実装しない。
- 既存Projectへの上書きimportは実装しない。
- クラウド同期は実装しない。
- 外部ストレージ保存は実装しない。
- Chrome拡張との自動同期は実装しない。

### Acceptance criteria

- Project単位でJSONをexportできる。
- exportしたJSONを新規Projectとしてimportできる。
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
  projectId: string;
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
  };
};
```

初期Importでは、既存Projectの上書きやmergeは行わない。ID衝突や差分取り込みは後続Phaseで扱う。

## Import時の初期ルール

- import対象はProject単位とする。
- 既存Projectに上書きしない。
- 取り込み時に新しいProject IDを採番する。
- 内部参照IDは新しいIDへ再マッピングする。
- schemaVersionが未対応の場合は取り込まない。
- 不正データは部分取り込みせず、エラーとして扱う。
