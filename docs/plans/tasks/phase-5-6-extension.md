# Phase 5-6 Chrome拡張タスク詳細

この文書は、Phase 5〜6 のChrome拡張実装タスクを定義する。

Chrome拡張は、テスト対象アプリの実画面から設計素材を取り込む入力補助である。仕様生成エンジンではない。DOMやAccessibility Treeから業務ルール、保存仕様、権限条件、API副作用、テスト優先度を断定してはいけない。

## 共通参照

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/09-non-goals.md`
- `docs/specs/11-accessibility-tree-capture.md`

## 共通ルール

- Chrome拡張はManifest V3前提とする。
- Side Panelを主UIとする。
- Content Scriptは対象ページから情報を読むために使う。
- 対象ページへの破壊的な操作は禁止する。
- DOMやAccessibility Treeから仕様やテストケースを完全自動生成しない。
- Webアプリ本体とのリアルタイム同期は初期実装しない。
- 連携は `UiCaptureBundle` export/importまたは明示的な候補取り込みを優先する。
- `DomCaptureBundle` は旧称として扱い、新規実装では `UiCaptureBundle` に寄せる。
- input.value、password、secret、token、hidden valueなど、業務データや機密値になりうる情報は保存しない。
- Accessibility Tree由来のrole、accessible name、stateは候補情報であり、仕様の正本ではない。
- `chrome.debugger` permissionを使うAX取得は `TASK-021A` で扱い、通常のElement Picker最小実装には含めない。

## TASK-019: Chrome拡張基盤

### Goal

Chrome拡張としてSide Panelを表示し、現在タブと通信できる基盤を作る。

### Reference specs

- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/09-non-goals.md`
- `docs/specs/11-accessibility-tree-capture.md`

### Scope

- `extension/manifest.json` を追加する。
- Side Panelエントリを追加する。
- Background service workerを追加する。
- Content Scriptを追加する。
- 現在タブのURL / title取得を実装する。
- Side PanelとContent Scriptのメッセージ通信を実装する。
- host permissionsは最小権限を優先し、開発用の広い権限と本運用の対象ドメイン制限を分けて扱える構造にする。
- 将来のAccessibility Tree Capture Adapterを追加できるよう、capture modeの拡張点を型または設計コメントで残す。

### Non-goals

- Element Pickerは実装しない。
- DOMスキャンは実装しない。
- Accessibility Tree取得は実装しない。
- `chrome.debugger` permissionは追加しない。
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
- Accessibility Tree取得が未実装でも、後続で拡張する余地がある。

## TASK-020: Element Picker最小実装

### Goal

対象ページ上の1要素を選択し、DOM情報を安全な `UiCaptureCandidate` 候補として取得できるようにする。

### Reference specs

- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/01-domain-model.md`
- `docs/specs/11-accessibility-tree-capture.md`

### Scope

- Pickerモードを開始・終了できる。
- hover中の要素をハイライトする。
- clickした要素の情報を取得する。
- DOM Captureとして tagName / role属性 / text / placeholder / selectorCandidatesを取得する。
- role属性、aria-label、label近傍情報から取得できる範囲のaccessible name相当情報を補助的に取得する。
- `captureMode: "dom"` の `UiCaptureCandidate` を生成できる構造にする。
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
- Accessibility Tree取得は実装しない。
- `chrome.debugger` permissionは追加しない。
- 業務ルール推定は実装しない。
- 自動クリックや自動入力は実装しない。
- iframe / shadow DOM / cross-origin frame対応は初期実装しない。

### Acceptance criteria

- Pickerモードで要素を選択できる。
- 選択要素の主要DOM情報を取得できる。
- 取得結果を `UiCaptureCandidate` として扱える。
- input.valueが取得結果に含まれない。
- password / hidden / token / secret相当の属性値が保存されない。
- text / accessibleName / placeholder / ariaLabelが100文字以内に制限される。
- email / phone / token / UUIDらしき値がredactedになる。
- selectorCandidatesが優先順位に従って生成される。
- redaction rulesの単体テストがある。
- selectorCandidates生成の単体テストがある。
- Pickerモード終了後に対象ページへ一時UIが残らない。
- 対象ページのDOMを破壊的に変更しない。

## TASK-021: UiCaptureCandidateレビューとUiNode取り込み

### Goal

Element Pickerで取得した候補をレビューし、利用者が確認・編集したうえでUiNodeとして保存できるようにする。

### Reference specs

- `docs/specs/01-domain-model.md`
- `docs/specs/03-web-app-spec.md`
- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/05-import-export-spec.md`
- `docs/specs/06-traceability-spec.md`
- `docs/specs/11-accessibility-tree-capture.md`

### Scope

- `UiCaptureCandidate` 型を追加する。
- `UiCaptureBundle` 型を追加する。
- 候補保存Repositoryを追加する。
- 候補レビューUIを追加する。
- 候補をUiNodeに変換して保存する。
- 登録時にProject / Screenを選択できるようにする。
- selectorCandidatesからselectorHintを選べるようにする。
- role / accessibleName相当情報から `UiNode.name`、`UiNode.role`、`textHint`、`accessibleNameHint` 相当の入力補助を行えるようにする。
- locatorStrategy / locatorHint はPlaywright補助情報として扱い、仕様正本として自動確定しない。
- 候補からUiNodeを作成した場合、TraceLinkは候補ではなく作成後の `UiNode` を起点に扱う。

### Non-goals

- DOM全体スキャンは実装しない。
- Accessibility Tree取得は実装しない。
- `chrome.debugger` permissionは追加しない。
- 既存UiNodeとの差分判定は実装しない。
- ChangeRecord連携は実装しない。
- 自動でTestViewpointやTestCaseを生成しない。
- Webアプリ本体とのリアルタイム同期は実装しない。
- Project ExportBundleとして候補を扱わない。

### Acceptance criteria

- UI候補を保存できる。
- 候補をレビューできる。
- 候補をUiNodeとして登録できる。
- 登録時にProject / Screenを選択できる。
- selectorHintをUiNodeに保存できる。
- role / accessible name相当情報をUiNode登録時の補助情報として表示できる。
- 候補を却下できる。
- `UiCaptureBundle` とProject `ExportBundle` の役割が分離されている。
- `DomCaptureBundle` 旧称から `UiCaptureBundle` への移行方針が破綻していない。
- 候補そのものをTraceLink正本対象にしない。

## TASK-021A: Accessibility Tree Capture Adapter

### Goal

Chrome拡張でAccessibility Tree由来のrole、accessible name、description、stateを取得し、DOM Captureと統合した `UiCaptureCandidate` を作れるようにする。

### Reference specs

- `docs/specs/11-accessibility-tree-capture.md`
- `docs/specs/04-chrome-extension-spec.md`
- `docs/specs/09-non-goals.md`

### Scope

- `chrome.debugger` permissionを使うかどうかを明示する。
- CDP Accessibility domainを使う場合、attach / sendCommand / detachの責務を分離する。
- 選択要素に対応するAX nodeを取得できる範囲で取得する。
- AX nodeからrole、name、description、stateを正規化する。
- backendDOMNodeId等を使える場合はDOM候補との対応付けを行う。
- 対応付け結果に `mapping.confidence` を持たせる。
- AX取得に失敗した場合でもDOM Capture候補を保存できる。
- AX由来テキストにもredaction rulesとtext length limitを適用する。

### Non-goals

- Accessibility Treeから仕様意図を自動確定しない。
- Accessibility Treeから業務ルールや期待結果を推定しない。
- Accessibility TreeからTestViewpointやTestCaseを生成しない。
- ページ全体のAX treeを永続保存しない。
- Playwright `ariaSnapshot()` 取り込みは実装しない。
- a11y診断レポートは実装しない。

### Acceptance criteria

- AX取得が有効な場合、選択要素に対応するrole / accessible name / stateを取得できる。
- AX取得が失敗してもDOM Captureで候補取り込みを継続できる。
- `chrome.debugger` permissionを追加する場合、必要理由と利用範囲がPR本文またはドキュメントに明記されている。
- attach後に必ずdetachする実装方針になっている。
- AX由来のname / descriptionがredaction対象になる。
- AX情報はUiNode候補の補助情報として表示され、ユーザー確認なしに正本登録されない。

## Chrome拡張の制約

Chrome拡張は仕様生成エンジンではなく入力補助である。DOMやAccessibility Treeから業務ルール、権限条件、保存仕様、API副作用、テスト優先度、仕様上の意図を断定してはいけない。

対象ページに許容される変更は、一時的なhover highlightやoverlayに限定する。フォーム値変更、ボタンクリック、対象アプリのlocalStorage / IndexedDB変更は禁止する。

## Chrome拡張で取得してよい情報

- URL
- title
- tagName
- DOM上のrole属性
- Accessibility Tree上のrole
- accessible name相当の情報
- description相当の情報
- checked / selected / expanded / disabled / requiredなどの状態
- textContentの短い要約
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
- ページ全体のDOM / AX treeの永続スナップショット

## Chrome拡張で断定してはいけない情報

- 業務ルール
- 権限条件
- API副作用
- 保存仕様
- データライフサイクル
- テスト優先度
- 仕様上の意図
