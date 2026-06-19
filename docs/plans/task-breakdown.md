# Test Design Studio タスク分解

この文書は、AIエージェントが1PRずつ実装できるように、Task ID、参照仕様、詳細ファイルの所在を定義する。

各タスクの詳細な `Goal` / `Scope` / `Non-goals` / `Acceptance criteria` は `docs/plans/tasks/*.md` を正とする。実装判断に迷う場合は、対象領域の `docs/specs/*.md` を参照する。

## Task ID 方針

この文書の `TASK-xxx` は、実装作業を識別するための安定IDである。

GitHubの実際のPR番号とは一致するとは限らない。PR本文には、次のように Task ID とGitHub PR番号を分けて記載する。

```text
Task ID: TASK-002
GitHub PR: #5
```

設計補強やタスク分割の追加が必要な場合は、既存IDを不用意に削除せず、`TASK-001A` のような補助IDを追加してよい。

## タスク設計ルール

各タスクは次の形式で扱う。

```md
## TASK-XXX: タスク名

### Goal
このタスクで達成すること。

### Reference specs
実装判断に使う仕様書。

### Scope
実装するもの。

### Non-goals
実装しないもの。

### Acceptance criteria
完了条件。
```

## 実装前チェック

AIエージェントは各タスクの着手前に、次を確認する。

- `AGENTS.md` を読んだか。
- `docs/agents/coding-instructions.md` を読んだか。
- 対象Task IDの詳細タスクを読んだか。
- 対象領域の `docs/specs/*.md` を読んだか。
- `docs/specs/09-non-goals.md` に反していないか。
- Scope外の機能を追加していないか。

## タスク一覧

| Task ID | Phase | タスク | 主な参照仕様 | 詳細 |
|---|---:|---|---|---|
| TASK-001 | 0 | 実装計画・仕様分割ドキュメント追加 | `AGENTS.md`, `docs/specs/*`, `docs/plans/*` | `tasks/phase-0-1.md` |
| TASK-001A | 0 | MVP段階定義・ドメイン・Trace・Export仕様補強 | `docs/specs/00-product-overview.md`, `docs/specs/01-domain-model.md`, `docs/specs/06-traceability-spec.md` | `tasks/phase-0-docs-hardening.md` |
| TASK-001B | 0 | P0実装前のPhase境界・スコープ整合 | `docs/specs/02-storage-design.md`, `docs/specs/03-web-app-spec.md`, `docs/specs/05-import-export-spec.md`, `docs/specs/06-traceability-spec.md` | `tasks/phase-0-docs-hardening.md` |
| TASK-002 | 1 | Reactアプリ基盤作成 | `docs/specs/00-product-overview.md` | `tasks/phase-0-1.md` |
| TASK-003 | 1 | 品質ゲート追加 | `docs/agents/coding-instructions.md` | `tasks/phase-0-1.md` |
| TASK-004 | 1 | Dexie初期化 | `docs/specs/02-storage-design.md` | `tasks/phase-0-1.md` |
| TASK-005 | 2 | ProjectモデルとRepository | `docs/specs/01-domain-model.md`, `docs/specs/02-storage-design.md` | `tasks/phase-2-domain.md` |
| TASK-006 | 2 | Feature / ScreenモデルとRepository | `docs/specs/01-domain-model.md`, `docs/specs/02-storage-design.md` | `tasks/phase-2-domain.md` |
| TASK-007 | 2 | UiNodeモデルとRepository | `docs/specs/01-domain-model.md`, `docs/specs/02-storage-design.md` | `tasks/phase-2-domain.md` |
| TASK-008 | 2 | DataType / EntityモデルとRepository | `docs/specs/01-domain-model.md`, `docs/specs/02-storage-design.md` | `tasks/phase-2-domain.md` |
| TASK-009 | 2 | BusinessRule / TestViewpoint / TestCase / TestStep | `docs/specs/01-domain-model.md`, `docs/specs/08-test-design-workbench.md` | `tasks/phase-2-domain.md` |
| TASK-010 | 2 | OpenQuestion / TraceLink / ChangeRecord | `docs/specs/01-domain-model.md`, `docs/specs/06-traceability-spec.md`, `docs/specs/07-change-management-spec.md` | `tasks/phase-2-domain.md` |
| TASK-010A | 2 | Reserved model hooks | `docs/specs/01-domain-model.md`, `docs/specs/02-storage-design.md`, `docs/specs/05-import-export-spec.md` | `tasks/phase-2-domain.md` |
| TASK-011 | 3 | Project一覧・作成UI | `docs/specs/03-web-app-spec.md` | `tasks/phase-3-web.md` |
| TASK-012 | 3 | Feature / Screen基本UI | `docs/specs/03-web-app-spec.md` | `tasks/phase-3-web.md` |
| TASK-013 | 3 | Feature Workspace基盤 | `docs/specs/03-web-app-spec.md` | `tasks/phase-3-web.md` |
| TASK-014 | 3 | UiNodeツリー手入力UI | `docs/specs/01-domain-model.md`, `docs/specs/03-web-app-spec.md` | `tasks/phase-3-web.md` |
| TASK-015 | 3 | Data / BusinessRule編集UI | `docs/specs/01-domain-model.md`, `docs/specs/03-web-app-spec.md` | `tasks/phase-3-web.md` |
| TASK-016 | 3 | OpenQuestion / TestViewpoint / TestCase編集UI | `docs/specs/01-domain-model.md`, `docs/specs/03-web-app-spec.md`, `docs/specs/08-test-design-workbench.md` | `tasks/phase-3-web.md` |
| TASK-017 | 4 | Markdown Export | `docs/specs/05-import-export-spec.md` | `tasks/phase-4-export.md` |
| TASK-018 | 4 | JSON Export / Import | `docs/specs/05-import-export-spec.md`, `docs/specs/02-storage-design.md` | `tasks/phase-4-export.md` |
| TASK-019 | 5 | Chrome拡張基盤 | `docs/specs/04-chrome-extension-spec.md` | `tasks/phase-5-6-extension.md` |
| TASK-020 | 6 | Element Picker最小実装 | `docs/specs/04-chrome-extension-spec.md` | `tasks/phase-5-6-extension.md` |
| TASK-021 | 6 | DomCaptureCandidateレビューとUiNode取り込み | `docs/specs/04-chrome-extension-spec.md`, `docs/specs/01-domain-model.md` | `tasks/phase-5-6-extension.md` |
| TASK-022 | 7 | ChangeRecord基本UI | `docs/specs/07-change-management-spec.md` | `tasks/phase-7-change-trace.md` |
| TASK-023 | 7 | TraceLink UI | `docs/specs/06-traceability-spec.md` | `tasks/phase-7-change-trace.md` |
| TASK-024 | 7 | 影響候補表示 | `docs/specs/06-traceability-spec.md`, `docs/specs/07-change-management-spec.md` | `tasks/phase-7-change-trace.md` |
| TASK-025 | 8 | DataTypeから観点候補生成 | `docs/specs/08-test-design-workbench.md` | `tasks/phase-8-9-advanced.md` |
| TASK-026 | 8 | BusinessRuleからデシジョンテーブル観点候補生成 | `docs/specs/08-test-design-workbench.md` | `tasks/phase-8-9-advanced.md` |
| TASK-027 | 9 | AI context export | `docs/specs/05-import-export-spec.md`, `docs/specs/09-non-goals.md` | `tasks/phase-8-9-advanced.md` |
| TASK-028 | 9 | Playwright draft export | `docs/specs/05-import-export-spec.md`, `docs/specs/09-non-goals.md` | `tasks/phase-8-9-advanced.md` |

## 実装順序

原則としてTask ID順に進める。

`TASK-001A` と `TASK-001B` は、実装着手前の設計補強タスクである。`TASK-002` 以降の実装は、これらの内容が反映された仕様を前提に進める。

例外として、Chrome拡張系のTASK-019以降は、Webアプリ側の保存モデルとExport / Importが安定してから着手する。

Phase 8以降の生成・AI・Playwright支援は、構造化データが安定してから着手する。P0/P1で先回りしない。

## フェーズ別の最小価値

| Phase | 最小価値 |
|---|---|
| 0 | AIエージェントが迷わず作業できるドキュメント構成がある |
| 1 | アプリを起動し、品質ゲートを回せる |
| 2 | P0必須モデル、予約モデル方針、Repositoryを扱える |
| 3 | Webアプリ単体で1機能分の仕様・未確認事項・観点・ケースを手入力できる |
| 4 | Markdown/JSONで成果物化・バックアップできる |
| 5-6 | 実画面からUI候補を安全に取り込める |
| 7 | 変更と影響候補を追える |
| 8-9 | 構造化データから観点候補・AI/Playwright用出力を作れる |

## タスク追加・変更ルール

- 新しい実装を始める前に、この一覧または詳細タスクを更新する。
- 1PRで複数フェーズにまたがる変更をしない。
- Scopeを広げたい場合は、PRを分ける。
- `Non-goals` に書いたものを実装しない。
- 仕様書とタスクが矛盾する場合は、先にドキュメントを更新してから実装する。
- `docs/design.md` に書かれていても、`docs/specs/09-non-goals.md` に含まれるものは該当フェーズで実装しない。