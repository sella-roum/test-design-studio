# Test Design Studio タスク分解

この文書は、AIエージェントが1PRずつ実装できるように、タスク一覧と詳細ファイルの所在を定義する。各PRの詳細な Scope / Non-goals / Acceptance criteria は `docs/plans/tasks/*.md` を正とする。

## タスク設計ルール

各タスクは次の形式で扱う。

```md
## PR-XXX: タスク名

### Goal
このタスクで達成すること。

### Scope
実装するもの。

### Non-goals
実装しないもの。

### Acceptance criteria
完了条件。
```

## タスク一覧

| PR | Phase | タスク | 詳細 |
|---|---:|---|---|
| PR-001 | 0 | 実装計画ドキュメント追加 | `tasks/phase-0-1.md` |
| PR-002 | 1 | Reactアプリ基盤作成 | `tasks/phase-0-1.md` |
| PR-003 | 1 | 品質ゲート追加 | `tasks/phase-0-1.md` |
| PR-004 | 1 | Dexie初期化 | `tasks/phase-0-1.md` |
| PR-005 | 2 | ProjectモデルとRepository | `tasks/phase-2-domain.md` |
| PR-006 | 2 | Feature / ScreenモデルとRepository | `tasks/phase-2-domain.md` |
| PR-007 | 2 | UiNodeモデルとRepository | `tasks/phase-2-domain.md` |
| PR-008 | 2 | DataモデルとRepository | `tasks/phase-2-domain.md` |
| PR-009 | 2 | BusinessRule / TestViewpoint / TestCase | `tasks/phase-2-domain.md` |
| PR-010 | 2 | TraceLink / ChangeRecord | `tasks/phase-2-domain.md` |
| PR-011 | 3 | Project一覧・作成UI | `tasks/phase-3-web.md` |
| PR-012 | 3 | Feature / Screen基本UI | `tasks/phase-3-web.md` |
| PR-013 | 3 | Feature Workspace基盤 | `tasks/phase-3-web.md` |
| PR-014 | 3 | UiNodeツリー手入力UI | `tasks/phase-3-web.md` |
| PR-015 | 3 | Data / BusinessRule編集UI | `tasks/phase-3-web.md` |
| PR-016 | 3 | TestViewpoint / TestCase編集UI | `tasks/phase-3-web.md` |
| PR-017 | 4 | Markdown Export | `tasks/phase-4-export.md` |
| PR-018 | 4 | JSON Export / Import | `tasks/phase-4-export.md` |
| PR-019 | 5 | Chrome拡張基盤 | `tasks/phase-5-6-extension.md` |
| PR-020 | 6 | Element Picker最小実装 | `tasks/phase-5-6-extension.md` |
| PR-021 | 6 | DomCaptureCandidateレビューとUiNode取り込み | `tasks/phase-5-6-extension.md` |
| PR-022 | 7 | ChangeRecord基本UI | `tasks/phase-7-change-trace.md` |
| PR-023 | 7 | TraceLink UI | `tasks/phase-7-change-trace.md` |
| PR-024 | 7 | 影響候補表示 | `tasks/phase-7-change-trace.md` |
| PR-025 | 8 | DataTypeから観点候補生成 | `tasks/phase-8-9-advanced.md` |
| PR-026 | 8 | BusinessRuleからデシジョンテーブル観点候補生成 | `tasks/phase-8-9-advanced.md` |
| PR-027 | 9 | AI context export | `tasks/phase-8-9-advanced.md` |
| PR-028 | 9 | Playwright draft export | `tasks/phase-8-9-advanced.md` |

## 実装順序

原則としてPR番号順に進める。例外として、Chrome拡張系のPR-019以降は、Webアプリ側の保存モデルとExport / Importが安定してから着手する。

## タスク追加・変更ルール

- 新しい実装を始める前に、この一覧または詳細タスクを更新する。
- 1PRで複数フェーズにまたがる変更をしない。
- Scopeを広げたい場合は、PRを分ける。
- `Non-goals` に書いたものを実装しない。
