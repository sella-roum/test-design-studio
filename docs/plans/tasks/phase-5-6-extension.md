# Phase 5-6 Chrome拡張タスク詳細

この文書は、Phase 5〜6 のChrome拡張実装タスクを定義する。

Chrome拡張は、テスト対象アプリの実画面から設計素材を取り込む入力補助である。仕様生成エンジンではない。DOMから業務ルール、保存仕様、権限条件、API副作用、テスト優先度を断定してはいけない。

## 共通参照

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/09-non-goals.md`

## 共通ルール

- Chrome拡張はManifest V3前提とする。
- Side Panelを主UIとする。
- Content Scriptは対象ページから情報を読むために使う。
- 対象ページへの破壊的な操作は禁止する。
- DOMから仕様やテストケースを完全自動生成しない。
- Webアプリ本体とのリアルタイム同期は初期実装しない。
- 連携は `DomCaptureBundle` export/importまたは明示的な候補取り込みを優先する。
- input.value、password、secret、token、hidden valueなど、業務データや機密値になりうる情報は保存しない。

## TASK-019: Chrome拡張基盤

### Goal

Chrome拡張としてSide Panelを表示し、現在タブと通信できる基盤を作る。

### Reference specs

- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/09-non-goals.md`

### Scope

- `extension/manifest.json` を追加する。
- Side Panelエントリを追加する。
- Background service workerを追加する。
- Content Scriptを追加する。
- 現在タブのURL / title取得を実装する。
- Side PanelとContent Scriptのメッセージ通信を実装する。
- host permissionsは最小権限を優先し、開発用の広い権限と本運用の対象ドメイン制限を分けて扱える構造にする。

### Non-goals

- Element Pickerは実装しない。
- DOMスキャンは実装しない。
- Webアプリとの完全同期は実装しない。
- IndexedDBの共有・自動同期は実装しない。
- 対象ページのフォーム操作は実装しない。

### Acceptance criteria

- Chrome拡張を読み込める。
- Side Panelを開ける。
- 現在タブのURL / titleを取得できる。
- Content Scriptとのメッセージ通信ができる。
- 対象ページに破壊的な変更を加えない。
- permissions / host_permissions の意図がコードまたは設定で説明されている。

## TASK-020: Element Picker最小実装

### Goal

対象ページ上の1要素を選択し、DOM情報を安全な候補として取得できるようにする。

### Reference specs

- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/01-domain-model.md`

### Scope

- Pickerモードを開始・終了できる。
- hover中の要素をハイライトする。
- clickした要素の情報を取得する。
- tagName / role / text / accessibleName / placeholder / selectorCandidatesを取得する。
- input.valueを取得・保存しない。
- password / hidden / token / secretを含む属性値を保存しない。
- text / accessibleName / placeholder / ariaLabel等の文字列は最大100文字に切り詰める。
- email / phone / access token / UUIDらしき値をredactedにする。
- selectorCandidatesは `docs/specs/04-chrome-extension-spec.md` の優先順位に従って生成する。
- Pickerモード終了時にハイライトやイベントハンドラを解除する。

### Non-goals

- 候補レビューUIは実装しない。
- UiNodeへの保存は実装しない。
- DOM全体スキャンは実装しない。
- 業務ルール推定は実装しない。
- 自動クリックや自動入力は実装しない。
- iframe / shadow DOM / cross-origin frame対応は初期実装しない。

### Acceptance criteria

- Pickerモードで要素を選択できる。
- 選択要素の主要DOM情報を取得できる。
- input.valueが取得結果に含まれない。
- password / hidden / token / secret相当の属性値が保存されない。
- text / accessibleName / placeholder / ariaLabelが100文字以内に制限される。
- email / phone / token / UUIDらしき値がredactedになる。
- selectorCandidatesが優先順位に従って生成される。
- redaction rulesの単体テストがある。
- selectorCandidates生成の単体テストがある。
- Pickerモード終了後に対象ページへ一時UIが残らない。
- 対象ページのDOMを破壊的に変更しない。

## TASK-021: DomCaptureCandidateレビューとUiNode取り込み

### Goal

Element Pickerで取得した候補をレビューし、UiNodeとして保存できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/06-traceability-spec.md`

### Scope

- `DomCaptureCandidate` 型を追加する。
- `DomCaptureBundle` 型を追加する。
- 候補保存Repositoryを追加する。
- 候補レビューUIを追加する。
- 候補をUiNodeに変換して保存する。
- 登録時にProject / Screenを選択できるようにする。
- selectorCandidatesからselectorHintを選べるようにする。
- 候補からUiNodeを作成した場合、必要に応じて `uiNode derived_from domCaptureCandidate` のTraceLinkを作成できる構造にする。

### Non-goals

- DOM全体スキャンは実装しない。
- 既存UiNodeとの差分判定は実装しない。
- ChangeRecord連携は実装しない。
- 自動でTestViewpointやTestCaseを生成しない。
- Webアプリ本体とのリアルタイム同期は実装しない。
- Project ExportBundleとして候補を扱わない。

### Acceptance criteria

- DOM候補を保存できる。
- 候補をレビューできる。
- 候補をUiNodeとして登録できる。
- 登録時にProject / Screenを選択できる。
- selectorHintをUiNodeに保存できる。
- 候補を却下できる。
- `DomCaptureBundle` とProject `ExportBundle` の役割が分離されている。
- 候補からUiNodeを作成した場合のTraceLink方向が `docs/specs/06-traceability-spec.md` と矛盾しない。

## Chrome拡張の制約

Chrome拡張は仕様生成エンジンではなく入力補助である。DOMから業務ルール、権限条件、保存仕様、API副作用、テスト優先度、仕様上の意図を断定してはいけない。

対象ページに許容される変更は、一時的なhover highlightやoverlayに限定する。フォーム値変更、ボタンクリック、対象アプリのlocalStorage / IndexedDB変更は禁止する。

## Chrome拡張で取得してよい情報

- URL
- title
- tagName
- role
- textContentの短い要約
- accessible name相当の情報
- placeholder
- name / id / data-testidなどの属性。ただし機密値らしきものはredactedにする。
- selectorCandidates
- DOM上の近傍ラベル。ただし最大100文字に制限する。

## Chrome拡張で取得してはいけない情報

- input.value
- password field value
- hidden field value
- token / secret / session / authorization を含む属性値
- 個人情報や業務データと判断できる長文テキスト
- 対象アプリのlocalStorage / IndexedDB / Cookieの中身

## Chrome拡張で断定してはいけない情報

- 業務ルール
- 権限条件
- API副作用
- 保存仕様
- データライフサイクル
- テスト優先度
- 仕様上の意図
