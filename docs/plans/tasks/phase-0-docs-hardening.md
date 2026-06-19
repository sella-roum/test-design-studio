# Phase 0 設計補強タスク詳細

## TASK-001A: MVP段階定義・仕様補強

### Goal

Test Design Studio を P0、P1、P2 で段階的に作り込めるように、実装前の設計差分を解消する。

### Reference specs

- `docs/specs/00-product-overview.md`
- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/06-traceability-spec.md`
- `docs/specs/09-non-goals.md`
- `docs/plans/implementation-plan.md`
- `docs/plans/task-breakdown.md`

### Scope

- P0、P1、P2の段階MVP定義を統一する。
- OpenQuestionをP0必須モデルとして追加する。
- TestCase.stepsを `TestStep[]` として構造化する。
- TraceLinkを `TraceNodeType` / `TraceLinkType` で型付けする。
- Allowed TraceLink matrixを追加する。
- Storageのtable、Repository、reserved tableをPhase別に整理する。
- Import / ExportでOpenQuestion、TestStep、reserved modelを扱えるようにする。
- Chrome拡張の取得データ制限を明文化する。
- Playwright E2EのNon-goalと通常CIを区別する。
- 用語集とサンプル機能ドキュメントを追加する。

### Non-goals

- アプリケーションコードは実装しない。
- package setupは行わない。
- React、Dexie、Chrome拡張のコードは追加しない。
- AI、Playwright、外部サービス連携の実装は行わない。

### Acceptance criteria

- Product OverviewにP0/P1/P2の段階MVP定義がある。
- Domain ModelにOpenQuestion、TestStep、TraceNodeType、reserved modelが定義されている。
- Storage DesignにP0必須table、P1 table、reserved tableが整理されている。
- Import / Export SpecでOpenQuestionとTestStepが出力対象になっている。
- Traceability SpecにAllowed TraceLink matrixがある。
- Chrome Extension Specに取得データ制限がある。
- Non-goalsでPlaywright E2EのCIと通常CIが区別されている。
- Implementation PlanとTask Breakdownが段階MVP方針と矛盾していない。
