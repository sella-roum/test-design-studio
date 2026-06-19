# Hybrid UI Capture Parent Design Note

この文書は、`docs/design.md` の親設計に対して、Accessibility Tree導入後のUI解析方針を補足する。

`docs/design.md` は長期構想を含む親設計書であり、実装時の正本は `docs/specs/*` と `docs/plans/tasks/*` を優先する。Accessibility Tree / Hybrid UI Capture の詳細正本は `docs/specs/11-accessibility-tree-capture.md` とする。

## Parent design update

Chrome拡張によるUI候補取り込みは、DOM構造だけを前提にしない。

- DOM Captureは、selector候補、属性、技術的識別子、DOMから推定できるラベル情報を取得するために使う。
- Accessibility Tree Captureは、role、accessible name、description、状態などのユーザー視点の意味情報を取得するために使う。
- 両者を統合した候補は Hybrid UI Capture / `UiCaptureCandidate` として扱う。
- 取得結果は仕様の正本ではなく、利用者が確認・編集して `UiNode` として正本化する。
- `DomCaptureCandidate` / `DomCaptureBundle` は旧称として扱い、新規実装では `UiCaptureCandidate` / `UiCaptureBundle` に寄せる。

## MVP boundary

MVPで後回しにする対象は、DOM自動解析だけではなく、UI自動解析全般である。

具体的には、DOMやAccessibility Treeから仕様意図、業務ルール、期待結果、テストケースを自動確定することはMVPの対象外とする。

P1では、まずDOM Captureを使った候補登録とレビューを実装し、Accessibility Tree Capture Adapterは `TASK-021A` で明示的に追加する。
