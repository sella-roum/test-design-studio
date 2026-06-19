# Test Design Studio 実装計画

この文書は、`docs/design.md` を親設計書として扱い、Test Design Studio を段階的に実装するための計画を定義する。

`docs/design.md` はプロダクト全体の構想・思想・長期設計を保持する。実装時は、この文書と `docs/plans/task-breakdown.md` を正として、各フェーズ・各PRのスコープを明確に区切る。

## 1. 実装方針

### 1.1 基本方針

Test Design Studio は、単なるテストケース管理ツールではなく、テスト対象アプリケーションの仕様把握、UI構造、データ条件、業務ルール、テスト観点、テストケース、変更履歴、トレーサビリティを一体で扱うローカルファーストなワークスペースとして実装する。

ただし、親設計書に含まれるすべての構想を一度に実装しない。長期的な設計は維持しつつ、実装はAIエージェントが1PRずつ完了できる粒度に分割する。

### 1.2 実装原則

- 設計は大きく持つが、実装は小さく切る。
- 1PRでは1つの責務だけを完了させる。
- UIだけ、型だけ、保存だけの中途半端な実装を避ける。ただし、基盤フェーズでは意図的に型・保存層を先行してよい。
- スコープ外の将来機能を先回りして実装しない。
- すべての保存対象は、後続のExport、Import、TraceLink、ChangeRecordと接続できる前提で設計する。
- Chrome拡張は便利機能ではなく、対象アプリの現物UIから設計素材を取り込むための入力補助として扱う。
- AI生成とPlaywright生成は、構造化データが安定してから接続する。

## 2. フェーズ一覧

| フェーズ | 目的 | 主な成果物 | コード実装 |
|---|---|---|---|
| Phase 0 | 実装準備 | 設計分割、実装計画、AIエージェント指示 | なし |
| Phase 1 | アプリ基盤 | Vite / React / TypeScript / Dexie / テスト基盤 | あり |
| Phase 2 | ドメインモデル・保存層 | 型定義、Dexieスキーマ、Repository | あり |
| Phase 3 | Webアプリ最小編集フロー | ProjectからTestCaseまでの手動編集導線 | あり |
| Phase 4 | Export / Import | JSON / Markdown / CSV出力、復元 | あり |
| Phase 5 | Chrome拡張基盤 | Manifest V3、Side Panel、Content Script通信 | あり |
| Phase 6 | Element Picker | 実画面のDOM要素をUiNode候補として取り込み | あり |
| Phase 7 | 変更管理・影響追跡 | ChangeRecord、TraceLink、影響候補表示 | あり |
| Phase 8 | テスト技法ワークベンチ | 同値分割、境界値、状態遷移、デシジョンテーブル | あり |
| Phase 9 | AI補助・Playwright生成 | AI context export、観点レビュー、テストコード草案 | あり |

## 3. Phase 0: 実装準備

### 目的

AIエージェントが親設計書のすべてを一度に実装しようとしないように、実装計画、タスク分解、コーディング指示を整備する。

### 成果物

- `docs/plans/implementation-plan.md`
- `docs/plans/task-breakdown.md`
- `docs/agents/coding-instructions.md`

### 非対象

- アプリケーションコードの実装
- UIモックの実装
- Chrome拡張の実装
- AI生成機能の実装

### 達成基準

- 実装フェーズが定義されている。
- PR単位のタスクが定義されている。
- AIエージェント向けの実装ルールが定義されている。
- 各タスクに Scope / Non-goals / Acceptance criteria がある。

## 4. Phase 1: アプリ基盤

### 目的

Reactアプリケーションとして起動でき、型チェック・テスト・保存基盤の初期構成がある状態を作る。

### 実装対象

- Vite + React + TypeScript
- ESLint / Prettier
- Vitest / Testing Library
- Dexie導入
- 基本レイアウト
- ルーティングの初期構成
- 空のProject一覧画面

### 非対象

- ドメインモデルの全実装
- 複雑な画面編集
- Chrome拡張
- Export / Import
- AI補助

### 達成基準

- `npm install` が成功する。
- `npm run dev` でアプリが起動する。
- `npm run typecheck` が成功する。
- `npm run test` が成功する。
- 空のProject一覧画面が表示される。
- Dexieの初期化テストがある。

## 5. Phase 2: ドメインモデル・保存層

### 目的

Test Design Studio の中核データを型安全に保存・取得できる状態を作る。

### 実装対象

- `Project`
- `Feature`
- `Screen`
- `UiNode`
- `DataEntity`
- `DataField`
- `DataType`
- `BusinessRule`
- `TestViewpoint`
- `TestCase`
- `TraceLink`
- `ChangeRecord`
- Dexie schemaVersion
- Repository層
- Repository単体テスト

### 非対象

- 本格的な編集UI
- Chrome拡張
- DOM解析
- AI生成
- Playwright生成

### 達成基準

- 各ドメイン型が定義されている。
- IndexedDBに保存できる。
- Project配下のデータを取得できる。
- Repository層の主要CRUDがテストされている。
- TraceLinkとChangeRecordが他モデルと接続できるID構造を持つ。

## 6. Phase 3: Webアプリ最小編集フロー

### 目的

Webアプリ単体で、1機能分の仕様把握からテストケース作成までを手動で完了できるようにする。

### 実装対象

- Project作成・一覧・選択
- Feature作成・一覧・編集
- Screen作成・一覧・編集
- UiNode手入力・ツリー表示
- DataType登録
- BusinessRule登録
- TestViewpoint登録
- TestCase登録
- Feature Workspace

### 推奨画面構成

MVPでは管理画面を大量に分けず、Feature単位のワークスペースに集約する。

```text
/project
  Project一覧

/project/:projectId
  Project Dashboard

/project/:projectId/feature/:featureId
  Feature Workspace
    - Overview
    - Screens / UI Tree
    - Data / Rules
    - Viewpoints
    - Test Cases
    - Changes
    - Export
```

### 非対象

- DOM自動スキャン
- Chrome拡張
- 自動観点生成
- 高度なカバレッジ可視化
- 複雑な検索・フィルタ

### 達成基準

- 1つのFeatureに対してScreen、UiNode、DataType、BusinessRuleを登録できる。
- 登録した仕様情報からTestViewpointを作成できる。
- TestViewpointからTestCaseを作成できる。
- Feature単位で関連データを一覧できる。
- データを再読み込みしても失われない。

## 7. Phase 4: Export / Import

### 目的

ローカルファースト運用で、設計データをバックアップ、移行、Git管理、AI入力に利用できるようにする。

### 実装対象

- JSON export
- JSON import
- schemaVersion
- Markdown export
- CSV export
- import validation
- import時のID衝突方針

### JSON bundleの基本形

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

### 非対象

- クラウド同期
- 複数端末リアルタイム同期
- 外部SaaS連携

### 達成基準

- Project単位でJSON exportできる。
- exportしたJSONを新規Projectとしてimportできる。
- Markdownで仕様・観点・ケースを読める形で出力できる。
- 不正JSONやschemaVersion不一致時にユーザーへ明確なエラーを出せる。

## 8. Phase 5: Chrome拡張基盤

### 目的

Chrome Side Panelでアプリを開き、現在タブと通信できる状態を作る。

### 実装対象

- Manifest V3
- Side Panel
- Background service worker
- Content Script
- activeTab / scripting 権限
- 現在タブのURL / title取得
- Webアプリ側とのデータ連携方針

### 非対象

- DOM全体スキャン
- Element Picker
- DOM差分検出
- UI自動登録
- 仕様自動生成

### 達成基準

- 拡張機能を読み込める。
- Side Panelを開ける。
- 現在タブのURL / titleを取得できる。
- 対象ページへContent Scriptを注入できる。
- 対象ページを破壊的に変更しない。

## 9. Phase 6: Element Picker

### 目的

テスト対象アプリ上で選択したDOM要素を、Test Design StudioのUiNode候補として取り込めるようにする。

### 実装対象

- hover highlight
- click select
- DOM属性取得
- accessible name取得
- role / tagName / label / placeholder取得
- selectorCandidates生成
- DomCaptureCandidate保存
- 候補レビュー画面
- UiNodeへの取り込み

### 非対象

- DOMから完全な仕様書を生成すること
- テストケース自動生成
- DOM差分の完全自動判定

### 達成基準

- 対象ページ上の1要素を選択できる。
- 選択した要素の主要属性を取得できる。
- 取得結果を候補として保存できる。
- 候補をレビューしてUiNodeとして登録できる。
- 取り込み時にScreenとの紐づけができる。

## 10. Phase 7: 変更管理・影響追跡

### 目的

既存UIや仕様の変更をChangeRecordとして残し、関連する観点・ケースへの影響を追えるようにする。

### 実装対象

- ChangeRecord作成
- ChangeRecord一覧
- TraceLink作成
- UiNode変更時のChangeRecord作成
- DataType変更時のChangeRecord作成
- BusinessRule変更時のChangeRecord作成
- 影響するTestViewpoint候補表示
- 影響するTestCase候補表示

### 非対象

- 完全自動の影響分析
- 外部Issue連携
- GitHub PRとの自動紐づけ

### 達成基準

- 既存要素の変更理由、変更前、変更後を記録できる。
- 変更に関連するTestViewpoint / TestCaseを紐づけられる。
- 変更未対応の観点・ケースを識別できる。
- 影響候補が最低限のルールで提示される。

## 11. Phase 8: テスト技法ワークベンチ

### 目的

DataType、StateTransition、BusinessRule、Flowなどの構造化情報から、テスト観点候補を半自動生成できるようにする。

### 実装対象

- 同値分割
- 境界値分析
- 状態遷移テスト
- デシジョンテーブル
- ユースケーステスト
- 生成候補レビュー
- TestViewpointへの採用 / 却下

### 非対象

- AIによる自由生成
- Playwrightコード生成
- すべての技法の完全自動化

### 達成基準

- DataTypeから同値分割・境界値の観点候補を作れる。
- BusinessRuleから条件組み合わせの観点候補を作れる。
- 生成候補をユーザーが採用・編集・却下できる。
- 採用した候補がTestViewpointとして保存される。

## 12. Phase 9: AI補助・Playwright生成

### 目的

構造化された仕様データを使い、AIによる観点レビュー、テストケース補強、Playwright草案生成につなげる。

### 実装対象

- AI context export
- 不足観点レビュー用Markdown / JSON出力
- Playwright draft生成用データ出力
- selectorHint利用
- 自動化可否メモ

### 非対象

- AI APIキー管理を必須にすること
- クラウド前提の運用
- 生成されたPlaywrightテストの完全自動保証

### 達成基準

- AIに渡しやすいFeature単位のcontextを出力できる。
- TestViewpoint / TestCase / UiNode / selectorHintを含む構造化出力ができる。
- Playwright実装者が草案として利用できる情報が含まれる。

## 13. 優先順位

### P0

- Phase 0
- Phase 1
- Phase 2
- Phase 3
- Phase 4

### P1

- Phase 5
- Phase 6
- Phase 7

### P2

- Phase 8
- Phase 9

## 14. 実装時の注意

- 親設計書の内容を削る必要はない。ただし、親設計書だけを根拠に実装範囲を広げない。
- 各PRは `docs/plans/task-breakdown.md` のタスクに対応させる。
- タスク外の機能を実装したくなった場合は、先にタスク分解を更新する。
- Chrome拡張は、Webアプリの保存モデルが安定してから実装する。
- AI補助は、構造化データの品質が担保されてから実装する。
