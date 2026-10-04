# Phase 13: Image Editor Single-Column Canvas

## Context

User report 2026-10-02 with a screenshot of `/image-editor`:

1. The file area still splits into two columns (input file card / output canvas). For an editor that renders the picked image on a canvas, the left file-card column is redundant — the user asked for **one column holding only the image edit box**, while the action bar above and the parameter block below stay as they are.
2. The canvas never shows the picked image: the right-hand column stays blank, so the tool is unusable.

## Root cause of the blank canvas

`ImageEditor.vue` bound `@load="onImageLoad"` to the Konva `<v-image>` node and populated `imageEl` only from that handler, then fed `imageEl` back into the same node's `image` config. That is circular:

- Konva's `Image` shape does **not** dispatch a `load` event. It only *listens* for one on the underlying `<img>`/`<video>` element (`konva/lib/shapes/Image.js:12-33`), and `vue-konva` forwards `@load` straight to `node.on('load', …)`.
- With `image: null` the node never loads anything, so `onImageLoad` never ran, `imageEl` stayed `null`, and the stage drew nothing.

`image-remove-background` already uses the working shape: a hidden DOM `<img :src="imageUrl" @load="onImageLoad">` loads the file and hands the *loaded element* to `v-image`. `image-crop` has the identical defect (same circular binding), so it renders a blank stage too.

## Requirements (user decisions, 2026-10-02)

1. `/image-editor` file area = **one column**, containing only the image edit box. Action bar and parameter block unchanged.
2. With no image picked, the box shows a centered, **clickable dashed "import image" area** (click = open the file picker). Once an image is picked, only the canvas shows.
3. `image-crop` has the same rendering defect and **is fixed in this phase too**; its existing two-column layout is not changed.
4. Follow-up, same day: the stage must be **centred horizontally and vertically** inside its file box rather than pinned to the top-left corner. Applies to both canvas tools (`image-editor` and `image-crop`).

## Approach

- `ToolFilePanel` gains a `columns` prop (`1 | 2`, default `2`). In single mode it renders one full-width column box holding the default slot. Both modes keep the identical action bar and params area, so no tool's buttons change.
- `ImageEditor` keeps its `ToolFileUpload` mounted (it owns the paste listener, the `accept="image/*"` filter and the programmatic `<input>`) but renders it inside a `display:none` wrapper, because the canvas is the only thing the user asked to see. Import/paste stay reachable through the panel's own buttons.
- Both canvas tools gain the hidden `<img … @load="onImageLoad">` loader used by `image-remove-background`; the dead `@load` on `<v-image>` is removed.
- Both tools' `.canvas-wrapper` becomes the centring box (`flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center`). The two rules are duplicated rather than shared, because the class is scoped per component and only these two tools are in scope (`image-remove-background` keeps its current placement).

## Boundary

- In scope: `ToolFilePanel.vue`, `ImageEditor.vue`, `ImageCrop.vue`, locales only if a new label is needed, plus a regression guard test.
- Out of scope: the two-column layout of every other tool; `image-remove-background` (already correct); phase 10's file-box shape work (it explicitly excludes canvas/Konva output columns).
