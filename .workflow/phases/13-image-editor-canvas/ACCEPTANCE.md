# Phase 13 Acceptance Criteria

Evidence for every check is recorded in `VERIFICATION.md`.

## Layout

- [x] AC-1 `/image-editor` renders exactly one bordered file-area column; no file-card column is present. — `columns: 1`, class `tool-file-panel__column tool-file-panel__single`, computed `grid-template-columns: 556.8px`.
- [x] AC-2 The action bar is unchanged: left `[导入文件] [粘贴文件]`, right `[复制文件] [导出文件]`, all four always visible with copy/export disabled while no image is picked.
- [x] AC-3 The parameter block below the action bar is unchanged: `[添加文本] [绘制线条] [选择] [全部清除]`, color, line width, font size, and the text field when the text tool is active.
- [x] AC-4 With no image picked, the single box shows a centered, clickable dashed import area (531×160 px, visible); clicking it opens the file picker (spy: the control's hidden `<input>` `.click()` is invoked).
- [x] AC-5 Once an image is picked, the box shows only the canvas (the import area is gone).

## Rendering

- [x] AC-6 After picking an image the Konva stage draws it: stage 240×160 for a 240×160 source, 60000/60000 canvas pixels painted, and the sampled colours match the fixture (`[210,43,43]`, `[43,82,210]`, `[34,192,64]`).
- [x] AC-7 `image-crop`: the stage draws the image (60000 painted pixels, fixture colours at points outside the crop rect) and the crop `Rect` + `Transformer` are attached to it.
- [x] AC-8 Annotation tools work on the visible canvas: `Text` and `Line` nodes are created from stage clicks/drags.
- [x] AC-9 Export matches the visible canvas: 240×160 PNG, 3189 bytes, fully opaque (38400/38400), 463 pure-red pixels from the annotations.

## Guards / non-regression

- [x] AC-10 `apps/web/src/tools/konva-image-load.test.ts` passes on the new sources and fails on the pre-fix sources (`@load-on-v-image` true → false, `dom-img-loader` false → true for both canvas tools).
- [x] AC-11 `tool-file-import-controls.test.ts` still passes: `ImageEditor.vue` keeps exactly one `ToolFileUpload` with `accept="image/*"` and no native `<input type="file">`.
- [x] AC-12 `pnpm --filter @toolnest/web test` 222/222 PASS, `type-check` PASS, `build` PASS (33.58 s); differential lint 0 added / 0 removed on all four files (the repo-wide lint baseline already fails as `STATE.md` records, and the 3 `no-explicit-any` errors per canvas file are pre-existing, on lines this phase does not touch).
- [x] AC-13 Every other tool page keeps the two-column file area: `columns` defaults to 2, verified on `/image-compress` and on `/image-crop`.
