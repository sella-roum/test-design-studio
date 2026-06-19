# Phase 7 変更管理・影響追跡タスク詳細

この文書は、Phase 7 の変更管理と影響追跡の実装タスクを定義する。

Phase 7では、既存仕様・UI・データ・ルールの変更をChangeRecordとして残し、関連する観点・ケースへの影響候補をTraceLinkにつなげる。完全自動の影響分析ではなく、候補提示とユーザー判断を重視する。

## 共通参照

- `docs/specs/01-domain-model.md`
- `docs/specs/06-traceability-spec.md`
- `docs/specs/07-change-management-spec.md`
- `docs/specs/09-non-goals.md`

## 共通ルール

- ChangeRecordは変更の根拠と判断履歴を残すために使う。
- TraceLinkは関連の意味を `linkType` で区別する。
- 影響候補は自動確定しない。
- AIによる影響分析は初期実装しない。
- GitHub PR、Jira、外部Issueとの連携は初期実装しない。

## TASK-022: ChangeRecord基本UI

### Goal

Feature Workspace上で変更履歴を作成・一覧できるようにする。

### Reference specs

- `docs/specs/07-change-management-spec.md`
- `docs/specs/03-web-app-spec.md`

### Scope

- ChangeRecord一覧を追加する。
- ChangeRecord作成フォームを追加する。
- 変更対象種別を選択できるようにする。
- 変更対象IDを選択または入力できるようにする。
- 変更前、変更後、理由、確度を保存できるようにする。
- Feature WorkspaceのChangesセクションに表示する。

### Non-goals

- 影響候補の自動提示は実装しない。
- GitHub PR連携は実装しない。
- DOM差分自動検出は実装しない。
- AIによる変更要約は実装しない。

### Acceptance criteria

- ChangeRecordを作成できる。
- ChangeRecordをFeature単位で一覧できる。
- 変更対象、変更種別、変更前、変更後、理由を保存できる。
- confidence相当の確度を保存できる。
- ChangeTypeが `docs/specs/07-change-management-spec.md` と一致している。
- 再読み込み後もChangeRecordが保持される。

## TASK-023: TraceLink UI

### Goal

観点・ケース・仕様要素の関連をTraceLinkとして登録できるようにする。

### Reference specs

- `docs/specs/06-traceability-spec.md`
- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`

### Scope

- TraceLink作成UIを追加する。
- linkTypeを選択できるようにする。
- TestViewpoint / TestCase / BusinessRule / UiNode / ChangeRecordの関連を登録できるようにする。
- 指定オブジェクトに関連するTraceLinkを一覧できるようにする。
- TraceLinkの削除または無効化ができるようにする。

### Non-goals

- 自動リンク生成は実装しない。
- カバレッジダッシュボードは実装しない。
- AIによる関連推定は実装しない。
- 外部ツールとのリンク同期は実装しない。

### Acceptance criteria

- TraceLinkを作成できる。
- linkTypeを保存できる。
- 指定オブジェクトに関連するTraceLinkを一覧できる。
- TraceLinkから関連先へ移動できる、または関連先を識別できる。
- 再読み込み後もTraceLinkが保持される。

## TASK-024: 影響候補表示

### Goal

ChangeRecordから影響しそうなTestViewpoint / TestCaseを候補表示できるようにする。

### Reference specs

- `docs/specs/06-traceability-spec.md`
- `docs/specs/07-change-management-spec.md`
- `docs/specs/08-test-design-workbench.md`

### Scope

- 影響候補生成サービスを追加する。
- UiNode変更時の関連候補を表示する。
- DataType変更時の関連候補を表示する。
- BusinessRule変更時の関連候補を表示する。
- selector変更時の自動化影響候補を表示する。
- 候補を採用・却下できるようにする。
- 採用した候補をTraceLinkとして保存できるようにする。

### Non-goals

- 完全自動の影響分析は実装しない。
- AIによる影響分析は実装しない。
- 外部IssueやPRとの連携は実装しない。
- 複雑なグラフ可視化は実装しない。

### Acceptance criteria

- ChangeRecordに対して影響候補を表示できる。
- 候補をユーザーが採用・却下できる。
- 採用した候補がTraceLinkとして保存される。
- 却下した候補が再表示され続けないように扱える。
- 影響候補生成ロジックに単体テストがある。

## 影響候補の初期ルール

最初から完璧な影響分析を狙わない。最低限、以下のルールで候補を出す。

- UiNode変更: 同じUiNodeに紐づくTestViewpoint / TestCaseを候補にする。
- DataType変更: そのDataTypeを参照するDataFieldと関連する観点を候補にする。
- BusinessRule変更: そのBusinessRuleから派生した観点やケースを候補にする。
- selector変更: automationSuitabilityが高いTestCaseを候補にする。
- TestViewpoint変更: 紐づくTestCaseを候補にする。

候補は自動確定せず、ユーザーが採用・却下する。

## TraceLinkのlinkType方針

少なくとも以下のlinkTypeを想定する。

- `covers`
- `derived_from`
- `impacts`
- `validates`
- `depends_on`
- `replaces`

同じ2つのオブジェクト間でも、関連の意味が異なる場合はlinkTypeを分ける。
