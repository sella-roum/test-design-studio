# Phase 0-1 タスク詳細

## PR-001: 実装計画ドキュメント追加

### Goal
親設計書を実装可能なフェーズとAIエージェント向けタスクに分解する。

### Scope
- `docs/plans/implementation-plan.md` を追加する。
- `docs/plans/task-breakdown.md` を追加する。
- `docs/agents/coding-instructions.md` を追加する。

### Non-goals
- アプリケーションコードは実装しない。
- UIモックは作成しない。
- Chrome拡張は実装しない。

### Acceptance criteria
- フェーズ別実装計画がある。
- PR単位のタスク一覧がある。
- AIエージェント向けの実装ルールがある。

## PR-002: Reactアプリ基盤作成

### Goal
Vite + React + TypeScript の最小アプリ基盤を作成する。

### Scope
- `package.json` を作成する。
- Vite React TypeScript構成を追加する。
- `src/main.tsx` と `src/App.tsx` を追加する。
- 基本レイアウトとグローバルCSSを追加する。
- `dev`、`build`、`typecheck`、`test` scriptを定義する。

### Non-goals
- ドメインモデルは実装しない。
- IndexedDB保存は実装しない。
- Project作成画面は実装しない。

### Acceptance criteria
- `npm install` が成功する。
- `npm run dev` で起動する。
- `npm run build` と `npm run typecheck` が成功する。
- 初期画面にアプリ名が表示される。

## PR-003: 品質ゲート追加

### Goal
継続的に実装品質を確認できる最低限の品質ゲートを追加する。

### Scope
- ESLintを追加する。
- Prettierを追加する。
- VitestとTesting Libraryを追加する。
- GitHub Actionsでcheckを実行する。

### Non-goals
- E2Eテストは実装しない。
- Playwrightは導入しない。
- 複雑なlintルールは追加しない。

### Acceptance criteria
- `npm run lint` が成功する。
- `npm run format:check` が成功する。
- `npm run test` が成功する。
- GitHub Actionsでcheckが実行される。

## PR-004: Dexie初期化

### Goal
IndexedDBを利用するためのDexie基盤を追加する。

### Scope
- Dexieを導入する。
- database moduleを追加する。
- schemaVersionの定数を追加する。
- DB初期化テストを追加する。

### Non-goals
- 全ドメインモデルは追加しない。
- CRUD Repositoryは実装しない。
- Export / Importは実装しない。

### Acceptance criteria
- Dexieインスタンスが作成される。
- テスト環境でDBを初期化できる。
- schemaVersionが定数として管理されている。
- `npm run test` が成功する。
