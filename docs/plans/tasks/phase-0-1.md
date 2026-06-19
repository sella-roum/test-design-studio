# Phase 0-1 タスク詳細

この文書は、Phase 0 と Phase 1 のTask ID単位タスクを定義する。

Phase 0 は実装前の地図作成、Phase 1 はアプリ基盤作成である。この段階では、プロダクト機能を作り込まず、後続のAIエージェント実装が迷わない土台を作る。

## TASK-001: 実装計画・仕様分割ドキュメント追加

### Goal

親設計書を、実装可能なフェーズ、仕様書、AIエージェント向けタスクに分解する。

### Reference specs

- `docs/design.md`
- `docs/specs/00-product-overview.md`
- `docs/specs/09-non-goals.md`

### Scope

- `AGENTS.md` を追加する。
- `.github/pull_request_template.md` を追加する。
- `docs/plans/implementation-plan.md` を追加・更新する。
- `docs/plans/task-breakdown.md` を追加・更新する。
- `docs/agents/coding-instructions.md` を追加する。
- `docs/plans/tasks/*.md` を追加する。
- `docs/specs/00-product-overview.md` を追加する。
- `docs/specs/01-domain-model.md` を追加する。
- `docs/specs/02-storage-design.md` を追加する。
- `docs/specs/03-web-app-spec.md` を追加する。
- `docs/specs/04-chrome-extension-spec.md` を追加する。
- `docs/specs/05-import-export-spec.md` を追加する。
- `docs/specs/06-traceability-spec.md` を追加する。
- `docs/specs/07-change-management-spec.md` を追加する。
- `docs/specs/08-test-design-workbench.md` を追加する。
- `docs/specs/09-non-goals.md` を追加する。

### Non-goals

- アプリケーションコードは実装しない。
- UIモックは作成しない。
- Chrome拡張は実装しない。
- package.json は作成しない。
- CIは作成しない。
- AI生成機能やPlaywright生成機能は実装しない。

### Acceptance criteria

- フェーズ別実装計画がある。
- Task ID単位のタスク一覧がある。
- 各Phaseの詳細タスクファイルがある。
- AIエージェント向けの実装ルールがある。
- PRテンプレートがある。
- 実装判断に使う `docs/specs/*` がある。
- `docs/design.md` を直接すべて実装しない方針が明記されている。
- 初期実装でやらないことが `docs/specs/09-non-goals.md` に明記されている。

## TASK-002: Reactアプリ基盤作成

### Goal

Vite + React + TypeScript の最小アプリ基盤を作成する。

### Reference specs

- `docs/specs/00-product-overview.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/09-non-goals.md`

### Scope

- `package.json` を作成する。
- Vite React TypeScript構成を追加する。
- `src/main.tsx` と `src/App.tsx` を追加する。
- 基本レイアウトとグローバルCSSを追加する。
- `dev`、`build`、`typecheck`、`test` scriptを定義する。
- アプリ名、プロダクト概要、空状態を表示する初期画面を作る。

### Non-goals

- ドメインモデルは実装しない。
- IndexedDB保存は実装しない。
- Project作成画面は実装しない。
- Chrome拡張は実装しない。
- 認証、クラウド同期、外部API連携は実装しない。

### Acceptance criteria

- `npm install` が成功する。
- `npm run dev` で起動する。
- `npm run build` と `npm run typecheck` が成功する。
- 初期画面にアプリ名が表示される。
- 初期画面に「ローカルファーストなテスト設計ワークスペース」であることが分かる説明が表示される。
- `docs/specs/09-non-goals.md` に反する機能が入っていない。

## TASK-003: 品質ゲート追加

### Goal

継続的に実装品質を確認できる最低限の品質ゲートを追加する。

### Reference specs

- `AGENTS.md`
- `docs/agents/coding-instructions.md`

### Scope

- ESLintを追加する。
- Prettierを追加する。
- VitestとTesting Libraryを追加する。
- GitHub Actionsでcheckを実行する。
- `npm run check` を追加する。

### Non-goals

- E2Eテストは実装しない。
- Playwrightは導入しない。
- 複雑なlintルールは追加しない。
- ドメインモデルの網羅テストは実装しない。

### Acceptance criteria

- `npm run lint` が成功する。
- `npm run format:check` が成功する。
- `npm run test` が成功する。
- `npm run check` が成功する。
- GitHub Actionsでcheckが実行される。
- PRテンプレート上で確認コマンドを書ける状態になっている。

## TASK-004: Dexie初期化

### Goal

IndexedDBを利用するためのDexie基盤を追加する。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/02-storage-design.md`
- `docs/specs/05-import-export-spec.md`

### Scope

- Dexieを導入する。
- database moduleを追加する。
- database nameを定数化する。
- schemaVersionの定数を追加する。
- migrationの入口を作る。
- DB初期化テストを追加する。
- テスト用DBを分離する仕組みを追加する。

### Non-goals

- 全ドメインモデルは追加しない。
- CRUD Repositoryは実装しない。
- Export / Importは実装しない。
- Chrome拡張とのDB共有は実装しない。
- schema migrationの複雑な実例は実装しない。

### Acceptance criteria

- Dexieインスタンスが作成される。
- テスト環境でDBを初期化できる。
- schemaVersionが定数として管理されている。
- database nameが定数として管理されている。
- 後続タスクでtableを追加できる構成になっている。
- `npm run test` が成功する。
- `docs/specs/02-storage-design.md` と矛盾しない。
