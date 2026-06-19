# Chrome Extension Spec

## Purpose

Chrome拡張は、テスト対象アプリケーションを開いた状態で、現在の画面情報や選択したDOM要素を Test Design Studio に取り込むための入力補助である。

Chrome拡張は仕様の正本ではない。取得したDOM情報は候補として扱い、利用者が確認・編集してからUiNodeやChangeRecordに反映する。

## Architecture

初期実装では Manifest V3 を前提にする。

```text
extension/
  manifest.json
  src/
    background/
    content/
    sidepanel/
    shared/
```

### Components

- Side Panel: 利用者が操作する拡張UI。
- Content Script: 対象ページのDOM情報を取得する。
- Background Service Worker: Side Panel と Content Script の通信を中継する。
- Shared module: メッセージ型、DOM抽出ロジック、候補型を共有する。

## Permissions

初期実装で想定する権限は次の通り。

```json
{
  "permissions": ["activeTab", "scripting", "sidePanel", "storage"],
  "host_permissions": ["<all_urls>"]
}
```

ただし、実装時は最小権限を優先する。

推奨方針:

1. まず `activeTab` と `scripting` を優先する。
2. 開発時のみ `<all_urls>` を許容してよい。
3. 本運用では対象ドメインをユーザー設定またはmanifestのhost_permissionsで限定する。
4. `<all_urls>` が必要な場合は、なぜ必要かをPR本文に明記する。

## Data safety / Privacy

Chrome拡張は業務アプリの画面上で動作するため、取得データの最小化を強制する。

### Must not capture

- `input.value`、`textarea.value`、`select.value` など、利用者が入力した実値を取得しない。
- `type="password"` の値、placeholder、周辺テキストを保存しない。
- token、secret、password、authorization、cookie、session などを含む属性値を保存しない。
- hidden input、非表示の認証情報、script内の値を取得しない。
- 対象アプリの業務データを網羅的に収集しない。

### Redaction rules

保存前に、次のような値は `"[redacted]"` に置き換える。

- メールアドレスらしき文字列
- 電話番号らしき文字列
- UUIDや長いランダムトークンらしき文字列
- Bearer token、API key、JWTらしき文字列
- 個人名や住所に見える長いテキスト断片

完全な個人情報検出は保証しないが、候補保存時に明らかな機密値を残さない。

### Text length limit

- `text`、`accessibleName`、`placeholder`、`ariaLabel` は最大100文字に切り詰める。
- 100文字を超える場合は末尾に `…` を付ける。
- 長文コンテンツ領域を選択した場合でも、本文全体を保存しない。

### Unsupported capture scope in P1

P1では次を対象外にする。

- cross-origin iframe内要素の取得
- shadow DOM内部の完全解析
- canvasや画像内テキストの抽出
- 対象ページ全体のDOMスナップショット保存

必要になった場合は、データ安全性と権限設計を更新してから実装する。

## Side Panel requirements

Side Panelは、現在のタブを見ながら仕様情報を補助的に取り込むためのUIである。

### Initial capabilities

- 現在タブのURLを表示する。
- 現在タブのtitleを表示する。
- 現在タブからDOM情報を取得できる。
- Element Pickerを開始できる。
- 取得した候補をDomCaptureCandidateとして保存できる。
- `DomCaptureBundle` export/importを通じてWebアプリ本体と連携できる。

## Content Script requirements

Content Scriptは対象ページ上でDOM情報を取得する。

### Capture current page

取得対象の例:

```ts
type PageCapture = {
  url: string;
  title: string;
  capturedAt: string;
};
```

### Capture element

選択要素から次の情報を取得する。

```ts
type CapturedElement = {
  tagName: string;
  role?: string;
  accessibleName?: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  name?: string;
  id?: string;
  className?: string;
  inputType?: string;
  required?: boolean;
  disabled?: boolean;
  visible?: boolean;
  selectorCandidates: string[];
};
```

DOMから取得できる情報は仕様そのものではなく、UiNode作成の候補情報である。

## Selector candidate rules

`selectorCandidates` は、Playwright draft exportやUiNode整理の補助情報である。仕様の正本ではない。

生成優先順位:

1. `data-testid` / `data-test` / `data-cy`
2. role + accessible name
3. `aria-label`
4. `name`
5. stable `id`
6. stable class
7. CSS path fallback

禁止事項:

- 個人情報や業務データのtextに依存するselectorを優先しない。
- ランダムID、セッションID、ハッシュ値に見える値を安定selectorとして扱わない。
- CSS path fallbackは最後の手段とし、候補であることをUI上で分かるようにする。

## DomCaptureCandidate

Chrome拡張から取り込んだ候補を表す。

```ts
type DomCaptureCandidate = {
  id: string;
  projectId?: string;
  featureId?: string;
  screenId?: string;
  sourceUrl: string;
  sourceTitle?: string;
  capturedAt: string;
  element: CapturedElement;
  suggestedUiNode?: {
    name?: string;
    role?: string;
    componentType?: string;
    selectorHint?: string;
    textHint?: string;
    required?: boolean;
  };
  status: "candidate" | "accepted" | "rejected";
};
```

## DomCaptureBundle

Chrome拡張候補は、Project単位の完全バックアップである `ExportBundle` とは別形式で扱う。

```ts
type DomCaptureBundle = {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  exportType: "dom-capture";
  source: "chrome-extension";
  candidates: DomCaptureCandidate[];
};
```

`DomCaptureBundle` はWebアプリ側でimportし、候補レビュー画面に取り込む。Projectの完全復元や既存Project置き換えには使わない。

## Element Picker

Element Pickerは、ユーザーが対象ページ上の要素を1つ選択する機能である。

### Requirements

- picker開始時に対象ページ上でhover highlightを表示する。
- clickした要素を選択する。
- 選択後、DOM情報をSide Panelへ送信する。
- Escまたはキャンセル操作でpickerを終了する。
- picker終了時にhighlightや一時イベントリスナーを解除する。

### Safety

- 対象アプリの入力値、保存状態、業務データを変更しない。
- click選択時に本来のclickイベントを抑止する。
- 対象ページのDOM構造を永続的に変更しない。
- 注入するstyleやoverlayはpicker終了時に削除する。
- 取得データはData safety / Privacyの規則を通してから保存する。

## Message protocol

初期実装では、次のようなメッセージを想定する。

```ts
type ExtensionMessage =
  | { type: "GET_ACTIVE_TAB" }
  | { type: "CAPTURE_PAGE" }
  | { type: "START_ELEMENT_PICKER" }
  | { type: "STOP_ELEMENT_PICKER" }
  | { type: "ELEMENT_PICKED"; payload: CapturedElement };
```

message payloadは `shared` に型定義し、Side Panel / Background / Content Script で共有する。

## Integration with web app

初期実装では、Webアプリ本体とChrome拡張のリアルタイム同期は必須にしない。

優先する連携方式:

1. 拡張側で候補を `DomCaptureBundle` としてJSON exportする。
2. Webアプリ側で `DomCaptureBundle` をimportする。
3. Webアプリ側の候補レビュー画面で `DomCaptureCandidate` を確認する。
4. ユーザーが確認・編集した候補を `UiNode` へ取り込む。

将来的には、同一拡張内にWebアプリUIを持つ方式、またはローカル通信方式を検討する。

## Non-goals

P1のChrome拡張では次を実装しない。

- DOMから完全な仕様書を自動生成する。
- DOMからテストケースを自動生成する。
- 対象アプリのフォーム入力や保存操作を自動実行する。
- iframeでWebアプリ本体を対象ページへ埋め込む。
- Webアプリ本体とのリアルタイム双方向同期。
- 複数タブ横断の自動探索。
- 画面全体のDOMを永続保存する。

## Testing

- DOM抽出ロジックは可能な限り純粋関数化する。
- selectorCandidates生成はfixture HTMLでテストする。
- redaction rulesはfixture HTMLでテストする。
- message protocolは型テストまたは単体テストを用意する。
- pickerのE2Eは後続フェーズで検討する。
