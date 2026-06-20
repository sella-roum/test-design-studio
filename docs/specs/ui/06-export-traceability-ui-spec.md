# Export and Traceability UI Spec

## Purpose

この文書は、Export画面とTraceability表示のUI仕様を定義する。

ExportとTraceabilityは、Test Design Studioの成果物化と設計根拠の可視化に関わる。ただし、P0では高度なMatrixや任意TraceLink編集を作り込みすぎない。

## Scope

- Export screen
- Export format selection
- Export summary
- Markdown / JSON preview方針
- P0 Traceability簡易表示
- P1以降のTraceability Matrix方針

## Non-goals

P0では次を実装しない。

- 既存ProjectへのJSON merge import
- 任意TraceLink編集UI
- グラフ型Traceability表示
- 変更影響の自動推定
- AI context export
- Playwright draft export

AI context exportとPlaywright draft exportはP2を正とする。

## Export screen

### Route

```text
/projects/:projectId/export
```

Feature単位のExportを優先する場合は、次を後続で追加してよい。

```text
/projects/:projectId/features/:featureId/export
```

P0/P4ではProject単位Exportを基本とし、UI上でFeature filterを選択できる形にしてもよい。

## Layout

```text
┌────────────────────────────────────────────┐
│ PageHeader                                  │
├──────────────────────────────┬─────────────┤
│ Export Options                │ Summary     │
├──────────────────────────────┴─────────────┤
│ Preview                                      │
└────────────────────────────────────────────┘
```

## Export options

### Fields

| Field | 内容 | P0 |
|---|---|---:|
| Scope | Project全体 / Feature単位 | 必須 |
| Feature selector | Feature単位選択 | 任意 |
| Format | JSON / Markdown | 必須 |
| Include removed | removed entityを含めるか | 任意 |
| Include change records | ChangeRecordを含めるか | Phase 7 |
| Include trace links | TraceLinkを含めるか | 必須 |
| Include open questions | OpenQuestionを含めるか | 必須 |

### Format options

| Format | 用途 |
|---|---|
| JSON | 完全バックアップ、端末移行、AI/外部ツール連携の基礎 |
| Markdown | 人間によるレビュー、Git管理、共有 |

CSVはP0/P4の必須対象にしない。

## Export summary card

Export実行前に、出力対象の概要を表示する。

| 項目 | 内容 |
|---|---|
| Scope | Project名またはFeature名 |
| Format | JSON / Markdown |
| Features | 出力対象Feature数 |
| Screens | 出力対象Screen数 |
| UI Nodes | 出力対象UiNode数 |
| Business Rules | 出力対象BusinessRule数 |
| Open Questions | 出力対象OpenQuestion数 |
| Viewpoints | 出力対象TestViewpoint数 |
| Test Cases | 出力対象TestCase数 |
| Trace Links | 出力対象TraceLink数 |

## Preview

### JSON preview

P0では完全なJSON全文を大きく表示しなくてもよい。

推奨:

- schemaVersion
- project summary
- included collections
- entity counts

### Markdown preview

Markdown previewでは、先頭部分と見出し構造を確認できるようにする。

例:

```markdown
# AILEAD Web App

## Feature: Login / Authentication

### Screens

### Business Rules

### Open Questions

### Test Viewpoints

### Test Cases
```

## Export execution behavior

- Export中はPrimary buttonをloading状態にする。
- 成功時はファイルをダウンロードし、Toastで通知する。
- 失敗時は原因を要約して表示する。
- 空Projectや空FeatureでもExportは可能にするが、summaryで出力対象が少ないことを明示する。

## Traceability section in Feature Workspace

### P0 purpose

P0のTraceabilityは、関連性の確認に留める。

任意TraceLink編集、Matrix UI、影響分析はPhase 7に分離する。

### P0 display

推奨する簡易表示:

```text
BusinessRule: BR-001 ユーザー認証ルール
  └ Viewpoint: VP-001 正常ログイン
      └ TestCase: TC-001 有効な認証情報でログインできる
      └ TestCase: TC-002 MFA有効時に追加認証へ進む

OpenQuestion: Q-003 ロール別遷移先は異なるか？
  └ Viewpoint: VP-010 ロール別ログイン後遷移
```

### P0 minimum relationships

| Relationship | 表示 |
|---|---|
| TestViewpoint derived_from source element | 観点の根拠として表示 |
| TestCase covers TestViewpoint | 観点に紐づくケースとして表示 |
| OpenQuestion used by Viewpoint/Case | 未確認状態が分かるように表示 |

## Traceability Matrix

### P1 purpose

P1以降では、BusinessRule、TestViewpoint、TestCaseの関係をMatrixで俯瞰する。

### Matrix layout

```text
┌─────────────────────┬────────┬────────┬────────┬────────────────┐
│ BusinessRule          │ VP-001 │ VP-002 │ VP-003 │ Related TC      │
├─────────────────────┼────────┼────────┼────────┼────────────────┤
│ BR-001 認証ルール     │ ○      │ ○      │ -      │ TC-001, TC-002  │
│ BR-002 パスワード     │ -      │ ○      │ ○      │ TC-010, TC-011  │
└─────────────────────┴────────┴────────┴────────┴────────────────┘
```

### Matrix symbols

| Symbol | 意味 |
|---|---|
| ○ | カバレッジあり |
| △ | 一部カバレッジ |
| - | 関連なし |
| ! | 未確認事項あり |

## Traceability filters

P1以降で次のfilterを追加する。

| Filter | 内容 |
|---|---|
| Feature | 対象Feature |
| Source type | BusinessRule / UiNode / DataType / OpenQuestionなど |
| Link type | covers / derived_from / impactsなど |
| Coverage state | covered / partial / uncovered |
| Question status | open / answered / deferred |

## Coverage warnings

P1以降では、次の状態を警告表示してよい。

- BusinessRuleに関連TestViewpointがない。
- TestViewpointに関連TestCaseがない。
- OpenQuestionがopenのままTestCaseに使われている。
- removed entityへのTraceLinkが残っている。

P0では警告の自動算出は必須ではない。

## Acceptance criteria

### Export

- JSON / Markdownの出力形式を選択できる。
- Export対象のsummaryを確認できる。
- ProjectまたはFeature単位で出力範囲を判断できる構造になっている。
- TraceLinkとOpenQuestionを出力対象に含める方針が明示されている。
- Export失敗時のエラー表示方針がある。

### Traceability

- P0ではTestViewpointとsource elementの関係を確認できる。
- P0ではTestCaseとTestViewpointの関係を確認できる。
- OpenQuestionが未確認であることを関連表示内で確認できる。
- Matrix UIはP1/Phase 7以降の対象として分離されている。
