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
- 対応付けできた場合は `mapping.confidence` を持つ。
- 対応付けできない場合も候補として扱うが、自動確定しない。

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
  geometry?: UiGeometry;
  mapping?: UiCaptureMapping;
  suggestedUiNode?: SuggestedUiNode;
  status: "candidate" | "accepted" | "rejected";
};
```

### DomCaptureData

```ts
type DomCaptureData = {
  tagName: string;
  roleAttribute?: string;
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

### Mapping

```ts
type UiCaptureMapping = {
  backendDOMNodeId?: number;
  frameId?: string;
  confidence: "high" | "medium" | "low";
};
```

`backendDOMNodeId` は、CDP Accessibility node と DOM node を対応付けるための補助情報として扱う。永続的な識別子としては使わない。

### Geometry

```ts
type UiGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};
```

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

ユーザーが確認・編集して `UiNode` に変換した後、`UiNode` を起点に `TestViewpoint`、`TestCase`、`ChangeRecord` と紐づける。

候補からUiNodeを作成した履歴を残す必要がある場合は、候補IDを `UiNode` のメタ情報またはChangeRecordのbefore/afterに補助的に記録する。ただし、候補を正本トレースノードとして無制限に扱わない。

## Change management policy

Accessibility Tree導入後は、次のような変更観点を持てる。

- selector changed
- accessible name changed
- role changed
- description changed
- state changed

ただし、これらの自動差分検出はPhase 7以降の対象であり、P1の候補取り込み時点では実装しない。

## Data safety

Accessibility Tree経由であっても、業務データや機密値を保存してはいけない。

禁止事項:

- input valueを保存する。
- password、token、secret、authorization、cookie、sessionを含む値を保存する。
- hidden valueを保存する。
- 長文本文や業務データを網羅的に保存する。
- AX treeから取得したname/descriptionを無条件に仕様正本へ昇格する。

DOM Captureと同じredaction rulesとtext length limitを適用する。

## Permission policy

Accessibility Tree CaptureをChrome拡張内で行う場合、`chrome.debugger` permissionとCDP Accessibility domainの利用を検討する。

ただし、`debugger` permission は強い権限であり、標準のChrome拡張MVPに無条件で含めない。

方針:

- DOM Captureは標準モードとする。
- Accessibility Tree CaptureはDeveloper / Advanced modeとして扱う。
- `debugger` permissionを追加するPRでは、必要理由、利用範囲、detach方針、取得データ制限をPR本文に明記する。
- AX取得に失敗しても、DOM Captureで最低限の候補取り込みが動くようにする。

## Non-goals

- Accessibility Treeから仕様意図を自動確定しない。
- Accessibility Treeから業務ルールを推定しない。
- Accessibility Treeからテストケースを自動生成しない。
- Accessibility Treeのrole/name/stateを、ユーザー確認なしに `UiNode` 正本へ採用しない。
- `chrome.debugger` permissionを標準必須機能にしない。
- Playwright `ariaSnapshot()` 取り込みをP1の必須実装にしない。

## Implementation notes

- `DomCaptureCandidate` という旧名称を見つけた場合、新規実装では `UiCaptureCandidate` に寄せる。
- 既存ドキュメントの互換説明では `DomCaptureCandidate` を旧称として扱ってよい。
- `role` と accessible name が取れる場合、Playwright `getByRole()` 向けのlocator候補を提示してよい。
- locator候補は仕様ではなく、テスト自動化補助情報として扱う。
- AX情報が欠落しているUIは、アクセシビリティ改善候補として表示してよいが、P1では自動診断レポートまでは作らない。
