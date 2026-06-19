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

## TASK-001B: P0実装前のPhase境界・スコープ整合

### Goal

P0実装に入る前に、Phase 3 / Phase 4 / Phase 7 の境界、Reserved modelの扱い、P0 importer scope、TraceLink UI scopeを明確にし、AIエージェントが先回り実装しない状態にする。

### Reference specs

- `docs/specs/02-storage-design.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/06-traceability-spec.md`
- `docs/agents/coding-instructions.md`
- `docs/plans/implementation-plan.md`
- `docs/plans/task-breakdown.md`
- `docs/plans/tasks/phase-3-web.md`

### Scope

- Web App SpecのProject import記述をPhase 4へ移動する。
- ChangeRecord UI / TraceLink UI / Export / Chrome拡張のPhase境界を明確にする。
- Storage DesignでReserved tableのP0実装禁止方針を明記する。
- Repository behavior contractを追加する。
- Import / Export SpecにP0 importer scopeを追加する。
- ID remapping rulesをP0とFutureに分離する。
- Traceability SpecでP0 storage-level targetとP0 UI-selectable targetを分離する。
- TraceLink creation timingをP0/P1/P2に分ける。
- TASK-016のAcceptance criteriaに再読み込み後保持を追加する。
- coding instructionsのTODO方針をAGENTS.mdと一致させる。
- Implementation PlanにP0a/P0b/P0cの補助スライスを追加する。

### Non-goals

- アプリケーションコードは実装しない。
- package setupは行わない。
- React、Dexie、Chrome拡張のコードは追加しない。
- AI、Playwright、外部サービス連携の実装は行わない。
- 新しいプロダクト機能を追加しない。

### Acceptance criteria

- Phase 3でJSON importを実装しないことが明確になっている。
- Export / ImportはPhase 4、Chrome拡張はPhase 5-6、ChangeRecord UI / TraceLink UI / 影響候補表示はPhase 7として明記されている。
- Reserved tableはP0では原則Dexie schemaへ追加しない方針になっている。
- Repositoryのcreate/get/list/update/markRemovedの共通挙動が定義されている。
- P0 importerが取り込むモデルと取り込まないReserved modelが明確になっている。
- P0 ID remapping rulesとFuture ID remapping rulesが分かれている。
- P0 UIで選択できるTraceNodeTypeが、P0で実装済みのモデルに限定されている。
- TraceLink作成タイミングがP0/P1/P2別に整理されている。
- TASK-016に再読み込み後保持とTraceLink保持のAcceptance criteriaがある。
- コード内TODOに仕様判断を残さない方針が統一されている。
- P0a/P0b/P0cが正式Phaseではなく補助スライスとして定義されている。

## TASK-001C: Accessibility Tree / Hybrid UI Capture設計反映

### Goal

現在のDOM解析前提を見直し、DOM CaptureとAccessibility Tree Captureを統合したHybrid UI Captureとして、P1以降のChrome拡張・候補レビュー・UiNode取り込みの設計を更新する。

### Reference specs

- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/09-non-goals.md`
- `docs/specs/11-accessibility-tree-capture.md`
- `docs/agents/coding-instructions.md`
- `AGENTS.md`
- `docs/plans/implementation-plan.md`
- `docs/plans/task-breakdown.md`
- `docs/plans/tasks/phase-5-6-extension.md`

### Scope

- Accessibility Tree Captureの正本仕様を追加する。
- DOM Capture、Accessibility Tree Capture、Hybrid UI Captureの役割を分離する。
- `DomCaptureCandidate` / `DomCaptureBundle` を旧称として扱い、新規実装では `UiCaptureCandidate` / `UiCaptureBundle` に寄せる方針を定義する。
- Accessibility Tree由来のrole、accessible name、description、stateの扱いを定義する。
- `chrome.debugger` permissionを標準MVPに含めず、任意の追加タスクとして扱う方針を定義する。
- TASK-020 / TASK-021 / TASK-021Aの境界を明確にする。
- Non-goalsとAIエージェント指示に、AX treeから仕様やテストケースを自動確定しない制約を追加する。

### Non-goals

- アプリケーションコードは実装しない。
- Chrome拡張コードは実装しない。
- `chrome.debugger` permissionを追加しない。
- Accessibility Tree取得ロジックは実装しない。
- Playwright `ariaSnapshot()` 取り込みは実装しない。
- AI生成、Playwright生成、外部サービス連携の実装は行わない。

### Acceptance criteria

- `docs/specs/11-accessibility-tree-capture.md` が追加されている。
- Chrome Extension Specが `UiCaptureCandidate` / `UiCaptureBundle` 前提に更新されている。
- TASK-020はDOM Capture最小実装、TASK-021は候補レビュー、TASK-021AはAccessibility Tree Capture Adapterとして分離されている。
- `chrome.debugger` permissionが標準必須機能ではないことが明記されている。
- Accessibility Tree由来の情報を仕様正本として自動採用しない制約がNon-goalsに明記されている。
- AGENTS / coding instructionsで、DOM解析とAccessibility Tree解析を入力補助として扱う方針が明記されている。
