# Export and Traceability UI Spec

## Purpose

この文書は、Export画面とTraceability表示のUI仕様を定義する。

ExportとTraceabilityは、Test Design Studioの成果物化と設計根拠の可視化に関わる。ただし、P0ではExport実処理やTraceability専用UIを作り込まない。

## Phase boundary

| Area | 正とするPhase | 方針 |
|---|---:|---|
| Export screen | Phase 4 | JSON / Markdown出力のUIを実装する |
| Import | Phase 4 | create-new-project importを正とする |
| Traceability simple view | Phase 7 | 簡易ツリー表示から開始する |
| Traceability matrix | Phase 7+ | Matrix UIは簡易表示の後に追加する |
| AI context export | P2 | この文書では扱わない |
| Playwright draft export | P2 | この文書では扱わない |

P0で必要なのは、ExportやTraceabilityを後から追加できるように、TestViewpointとTestCaseの関係を保存できる構造を先に作ることである。

## Export screen

### Route

```text
/projects/:projectId/export
```

Feature単位のExportを優先する場合は、後続で次を追加してよい。

```text
/projects/:projectId/features/:featureId/export
```

Phase 4ではProject単位Exportを基本とし、必要に応じてFeature filterを選択できる形にする。

P0でExport画面への導線だけを出す場合は、準備中表示に留める。

### Layout

```text
┌────────────────────────────────────────────┐
│ PageHeader                                  │
├──────────────────────────────┬─────────────┤
│ Export Options                │ Summary     │
├──────────────────────────────┴─────────────┤
│ Preview                                      │
└────────────────────────────────────────────┘
```

### Export options

| Field | 内容 | Phase |
|---|---|---:|
| Scope | Project全体 / Feature単位 | Phase 4 |
| Feature selector | Feature単位選択 | 任意 |
| Format | JSON / Markdown | Phase 4 |
| Include removed | removed entityを含めるか | 任意 |
| Include change records | ChangeRecordを含めるか | Phase 7 |
| Include trace links | TraceLinkを含めるか | Phase 4 |
| Include open questions | OpenQuestionを含めるか | Phase 4 |

CSVはPhase 4の必須対象にしない。

### Export summary card

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

### Preview

Phase 4では、Previewに次の要約を表示する。

- schemaVersion
- project summary
- included collections
- entity counts
- Markdown heading structure

### Export execution behavior

- Export中はPrimary buttonをloading状態にする。
- 成功時はToastで通知する。
- 失敗時は原因を要約して表示する。
- 空Projectや空FeatureでもExportは可能にするが、summaryで出力対象が少ないことを明示する。

## Traceability section in Feature Workspace

### P0 behavior

P0ではTraceability tabを作り込まない。

P0で必要なのは、次の保存導線である。

- TestViewpoint作成時にsource elementを選択し、`derived_from` TraceLinkを保存できる構造
- TestCase作成時にTestViewpointへ紐づけられる構造

### Phase 7 simple display

Phase 7で最初に追加するTraceability表示は、Matrixではなく簡易ツリーでよい。

```text
BusinessRule
  └ TestViewpoint
      └ TestCase

OpenQuestion
  └ TestViewpoint
```

### Phase 7 minimum relationships

| Relationship | 表示 |
|---|---|
| TestViewpoint derived_from source element | 観点の根拠として表示 |
| TestCase covers TestViewpoint | 観点に紐づくケースとして表示 |
| OpenQuestion used by Viewpoint/Case | 未確認状態が分かるように表示 |

## Traceability Matrix

### Phase 7+ purpose

Phase 7以降では、BusinessRule、TestViewpoint、TestCaseの関係をMatrixで俯瞰する。

### Matrix symbols

| Symbol | 意味 |
|---|---|
| ○ | カバレッジあり |
| △ | 一部カバレッジ |
| - | 関連なし |
| ! | 未確認事項あり |

## Traceability filters

Phase 7以降で次のfilterを追加する。

| Filter | 内容 |
|---|---|
| Feature | 対象Feature |
| Source type | BusinessRule / UiNode / DataType / OpenQuestionなど |
| Link type | covers / derived_from / impactsなど |
| Coverage state | covered / partial / uncovered |
| Question status | open / answered / deferred / not_applicable |

## Coverage warnings

Phase 7以降では、次の状態を警告表示してよい。

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

- P0ではTraceability専用UIを実装対象にしない。
- P0ではTestViewpointとsource elementの関係を保存できる構造にする。
- P0ではTestCaseとTestViewpointの関係を保存できる構造にする。
- Phase 7では簡易ツリー表示から開始できる。
- Matrix UIはPhase 7以降の対象として分離されている。
