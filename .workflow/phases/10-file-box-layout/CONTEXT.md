# Phase context

- Phase: 10 — file box layout classification
- Goal: every file box in the app renders one of exactly two shapes, chosen by how many files the box holds:
  - **single-file box** → preview area fills the width at 128 px tall, filename on the line under it;
  - **multi-file box** → 128×128 tiles in a grid, filename under each tile.
- Requirements: R-002 (user report 2026-10-02)
- Constraints: the input/output boxes of ~45 tool pages must not diverge — the shape decision belongs to the container (a 128 px grid cell → tile, a full-width cell → wide card), not to 45 call sites.
- Decisions already made (user, 2026-10-02, wireframe screenshot of `/video-merge`):
  1. Single-file box = "高 128px、宽度拉满的宽图标": preview area full width × 128 px, filename below it.
  2. Multi-file box = "128x128 的方格形式，按照网格排列".
  3. Removing a file uses the card's own `x` button; changing the order is done by **dragging the tiles**; the hand-rolled duplicate lists under the grid (video-merge's `[上移][下移][移除]` rows, audio-merge's closable tags) are **deleted**.
  4. The rule covers **all input and output boxes** of every file tool; output boxes do not need reordering.
- Open questions: none.
- Boundary:
  - In scope: `FileCard`, `ToolFileUpload`, `ToolFilePanel`, and the tool components that host them.
  - Out of scope: canvas/Konva output columns (`image-crop`, `image-editor`, `image-remove-background`), text/alert output boxes (`image-to-text-ocr`, `pdf-signature-checker`), and `camera-recorder`'s recording rows — the last has no file input box and its output items are custom rows carrying an inline `<video>` preview plus per-recording download/copy/clear actions, not a file box. `camera-recorder` is only re-checked in the browser because it shares `FileCard`'s CSS.
