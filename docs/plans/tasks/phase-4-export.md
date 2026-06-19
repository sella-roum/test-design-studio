# Phase 4 Export / Importタスク詳細

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

### Acceptance criteria
- Feature単位でMarkdownを生成できる。
- 生成Markdownに仕様・観点・ケースが含まれる。
- Markdownをダウンロードできる。
- Markdown生成関数のテストがある。

## PR-018: JSON Export / Import

### Goal
Project単位のバックアップ・復元ができるようにする。

### Scope
- `ExportBundle` 型を追加する。
- Project単位のJSON exportを追加する。
- JSON importを追加する。
- schemaVersionを検証する。
- 初期実装では新規Projectとしてimportする。

### Non-goals
- 差分importは実装しない。
- 既存Projectへの上書きimportは実装しない。
- クラウド同期は実装しない。

### Acceptance criteria
- Project単位でJSONをexportできる。
- exportしたJSONを新規Projectとしてimportできる。
- 不正JSON時にエラー表示できる。
- schemaVersion不一致時にエラー表示できる。

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
