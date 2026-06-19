# Accessibility Tree Capture Spec

## Purpose

この文書は、Test Design Studio が DOM 解析に加えて Accessibility Tree 解析を導入するための方針を定義する。

Accessibility Tree 解析は、DOM構造だけでは読み取りにくい `role`、accessible name、description、checked / selected / expanded / disabled などの状態を取得し、ユーザー視点のUI候補を作るために使う。

ただし、Accessibility Tree は仕様の正本ではない。DOM Capture と同じく、取得結果は候補情報であり、利用者が確認・編集して `UiNode` として正本化する。

## Design principle

UI解析は、DOM構造のみを正本としない。

```text
DOM Capture:
  selector候補、属性、DOM近傍ラベル、技術的識別子を取得する。

Accessibility Tree Capture:
  role、accessible name、description、状態、ユーザー視点の操作対象を取得する。

Hybrid UI Capture:
  DOM node と Accessibility node を可能な範囲で対応付け、UiNode候補を生成する。
```

DOMは技術的識別子とselector候補に強い。Accessibility Tree はユーザーが操作する意味単位に強い。Test Design Studio では、この2つを統合して `UiCaptureCandidate` として扱う。

## Scope by phase

### P1 design scope

P1では、Chrome拡張で実画面からUI候補を取り込み、変更履歴と影響追跡に接続する。

P1の設計上は、DOM-only候補とAccessibility Tree由来の候補を同じ `UiCaptureCandidate` として扱えるようにする。

### P1 implementation scope

初期実装では、次の順に分ける。

1. DOM Captureを使ったElement Picker最小実装。
2. `UiCaptureCandidate` / `UiCaptureBundle` として候補を保存・レビューできる状態。
3. 任意の追加タスクとして、Accessibility Tree Capture Adapterを実装する。

`chrome.debugger` permission を使うAccessibility Tree取得は権限が重いため、TASK-020 / TASK-021の最小Scopeには含めない。該当タスクで明示された場合のみ実装する。

## Capture modes

```ts
type UiCaptureMode = "dom" | "accessibility-tree" | "hybrid" | "playwright-aria-snapshot";
```

### DOM Capture

Content Scriptで取得できる範囲のDOM情報を使う通常モード。

取得してよい情報:

- tagName
- role属性
- aria-label
- placeholder
- id / name / className
- data-testid / data-test / data-cy
- disabled / required / visible相当
- selectorCandidates
- 短くredact済みのtext要約
- DOMから推定できるaccessible name相当のヒント

DOM Captureは標準モードとして扱う。

### Accessibility Tree Capture

Chrome DevTools Protocol の Accessibility domain などを使い、Accessibility Tree上の意味情報を取得するモード。

取得候補:

- role
- name
- description
- valueの型情報。ただし入力実値は保存しない。
- checked / selected / expanded / pressed
- disabled / readonly / required
- focused / focusable
- invalid
- level
- multiline
- autocomplete
- ignored / ignoredReasons
- backendDOMNodeId

Accessibility Tree Captureは、対象ページのアクセシビリティ実装状況に依存する。不完全なARIA、ラベルなしinput、divベースのカスタムUIでは情報が欠落する可能性がある。

### Hybrid UI Capture

DOM Capture と Accessibility Tree Capture を統合する推奨モード。

- DOMはselector候補と技術属性を提供する。
- Accessibility Treeはrole/name/stateを提供する。
- 対応付けできた場合は、AX Adapter内部または追加メタデータとして対応付け確度を持ってよい。
- 対応付けできない場合も候補として扱うが、自動確定しない。

基底の `UiCaptureCandidate` 型は、`docs/specs/01-domain-model.md` と `docs/specs/04-chrome-extension-spec.md` の定義と揃える。`geometry` や `mapping` を永続フィールドとして追加する場合は、この3文書を同時に更新する。

### Playwright ARIA snapshot

P2以降のAI/Playwright連携では、Playwright `ariaSnapshot()` の結果を `playwright-aria-snapshot` sourceとして取り込める余地を残す。

P1では実装しない。

## Data model

既存の `DomCaptureCandidate` / `DomCaptureBundle` は、Accessibility Tree導入後の概念としては狭すぎる。

今後の正本名は `UiCaptureCandidate` / `UiCaptureBundle` とする。

```ts
type UiCaptureSource = "chrome-extension" | "playwright" | "manual-import";

type UiCaptureCandidate = {
  id: string;
  projectId?: string;
  featureId?: string;
  screenId?: string;
  sourceUrl: string;
  sourceTitle?: string;
  capturedAt: string;
  captureMode: UiCaptureMode;
  source: UiCaptureSource;
  dom?: DomCaptureData;
  accessibility?: AccessibilityCaptureData;
  suggestedUiNode?: SuggestedUiNode;
  status: "candidate" | "accepted" | "rejected";
};
```

### DomCaptureData

```ts
type DomCaptureData = {
  tagName: string;
  roleAttribute?: string;
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

`accessibleName` はDOM属性や近傍ラベルから推定できるヒントであり、Accessibility Tree由来の `AccessibilityCaptureData.name` と同じ確度とは限らない。実装時はUI上で候補情報として表示し、自動確定しない。

### AccessibilityCaptureData

```ts
type AccessibilityCaptureData = {
  role?: string;
  name?: string;
  description?: string;
  valueType?: "string" | "number" | "boolean" | "unknown";
  ignored?: boolean;
  ignoredReasons?: string[];
  properties?: {
    disabled?: boolean;
    required?: boolean;
    readonly?: boolean;
    checked?: boolean | "mixed";
    selected?: boolean;
    expanded?: boolean;
    pressed?: boolean | "mixed";
    focused?: boolean;
    focusable?: boolean;
    invalid?: boolean;
    hasPopup?: boolean | string;
    level?: number;
    multiline?: boolean;
    autocomplete?: string;
  };
};
```

### SuggestedUiNode

```ts
type SuggestedUiNode = {
  name?: string;
  role?: string;
  componentType?: string;
  selectorHint?: string;
  textHint?: string;
  accessibleNameHint?: string;
  descriptionHint?: string;
  locatorStrategy?: "role" | "label" | "testid" | "text" | "css";
  locatorHint?: string;
  required?: boolean;
};
```

`locatorStrategy` と `locatorHint` は、Playwright draft exportの補助情報であり、仕様そのものではない。

### Optional adapter metadata

AX AdapterやElement Pickerの実装内部では、DOM node と Accessibility node の対応付けや候補レビュー補助のために次のようなメタデータを保持してよい。

```ts
type UiCaptureMapping = {
  backendDOMNodeId?: number;
  frameId?: string;
  confidence: "high" | "medium" | "low";
};

type UiGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};
```

ただし、これらを永続化する場合は `UiCaptureCandidate` の基底型に追加する必要がある。その場合は `docs/specs/01-domain-model.md`、`docs/specs/04-chrome-extension-spec.md`、本仕様の型定義を同時に更新する。

`backendDOMNodeId` は、CDP Accessibility node と DOM node を対応付けるための補助情報として扱う。永続的な識別子としては使わない。

geometryは候補レビューや視覚的な確認の補助に使う。仕様正本ではない。

## Bundle model

```ts
type UiCaptureBundle = {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  exportType: "ui-capture";
  source: UiCaptureSource;
  candidates: UiCaptureCandidate[];
};
```

`UiCaptureBundle` はProjectの完全バックアップではない。Webアプリ側で候補レビュー画面に取り込み、利用者が確認・編集して `UiNode` に変換するための一時候補である。

## Storage policy

P1では、候補保存テーブル名は `uiCaptureCandidates` を推奨する。

`domCaptureCandidates` という名前はDOM-only前提に寄りすぎるため、新規実装では使わない。

推奨index:

- `projectId`
- `screenId`
- `status`
- `captureMode`
- `capturedAt`
- `sourceUrl`

## Traceability policy

`UiCaptureCandidate` は一時候補であり、原則としてTraceLinkの正本対象にはしない。

利用者が確認・編集して `UiNode` に変換した後、`UiNode` を起点に `TestViewpoint`、`TestCase`、`ChangeRecord` と紐づける。

## Change management policy

Accessibility Tree由来の情報は、将来的な変更比較にも使える。

例:

- selectorは変わらないがaccessible nameが変わった。
- DOM構造は変わったがrole/nameは維持された。
- disabled / required / expanded などの状態が変わった。

P1では変更比較の本格自動化は必須にしない。まずは `ChangeRecord` の `changeType` として、次の観点を扱えるよう予約する。

- `accessible-name-changed`
- `role-changed`
- `state-changed`
- `description-changed`

## Safety policy

Accessibility Tree Captureでも、DOM Captureと同じデータ安全性ルールを適用する。

- 入力実値を保存しない。
- 機密性の高い認証・識別情報に関わる値を保存しない。
- AX tree全体を永続保存しない。
- AX由来の `name` / `description` もredaction対象にする。
- role/name/stateから業務仕様を自動確定しない。
- 取得に失敗してもDOM Captureで最低限動作する。

## Non-goals

Accessibility Tree導入によっても、次は行わない。

- AX treeから仕様意図を自動確定する。
- AX treeから業務ルールを推定する。
- AX treeからテストケースを自動生成する。
- AX treeのrole/name/stateを、ユーザー確認なしに `UiNode` 正本へ採用する。
- `chrome.debugger` permissionを標準MVPの必須権限にする。
- ページ全体のAX treeを永続保存する。

## Implementation notes

- Content Scriptだけで完全なAccessibility Treeを取得できる前提にしない。
- Chrome拡張でAX情報を取得する場合は、`chrome.debugger` / CDP Accessibility domain等を使う追加Adapterとして扱う。
- Playwright経由の `ariaSnapshot()` 取り込みはP2以降の追加sourceとして扱う。
- AX情報が取れない対象アプリでもDOM Captureだけで候補登録できるようにする。
- `UiCaptureCandidate` のレビューUIでは、DOM由来情報とAX由来情報を分けて表示する。
- `SuggestedUiNode` は自動確定ではなく、あくまで利用者の入力補助として扱う。
