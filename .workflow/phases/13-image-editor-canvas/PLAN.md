# Phase 13 Plan

## Implementation Steps

1. `ToolFilePanel.vue`: add `columns?: 1 | 2` (default `2`); single mode renders one full-width box with the default slot, two-column mode is unchanged.
2. `ImageEditor.vue`:
   - add the hidden `<img :src="imageUrl" @load="onImageLoad">` loader; remove the dead `@load` from `<v-image>`;
   - switch the panel to `columns="1"`, putting the canvas in the single box;
   - render a clickable dashed import area in the box when `imageUrl` is empty, calling `fileUpload?.triggerSelect()`;
   - keep `ToolFileUpload` mounted inside a `display:none` wrapper (paste listener, accept filter, hidden `<input>`).
3. `ImageCrop.vue`: same hidden `<img>` loader, keep the two-column layout.
4. Add a source-scanning guard test that fails if any tool binds `@load` to a Konva `<v-image>` or uses `<v-image>` without a DOM `<img @load>` loader.
5. `pnpm test`, `pnpm type-check`, `pnpm build`; differential lint per changed file.
6. Browser check on `/image-editor` and `/image-crop`: inject a real image file, assert the stage is non-blank and the editor's file area is a single box.

## Files to change

- `apps/web/src/components/ToolFilePanel.vue`
- `apps/web/src/tools/image-editor/ImageEditor.vue`
- `apps/web/src/tools/image-crop/ImageCrop.vue`
- `apps/web/src/tools/konva-image-load.test.ts` (new guard)
- `apps/web/src/locales/{zh,en}.json` (only if a new label is required)
- phase records: `CONTEXT.md`, `PLAN.md`, `ACCEPTANCE.md`, `VERIFICATION.md`, `.workflow/STATE.md`, `.workflow/ROADMAP.md`

## Risks

- `tool-file-import-controls.test.ts` pins exactly one `ToolFileUpload` with `accept="image/*"` per tool — the hidden wrapper must keep that control in `ImageEditor.vue`.
- Hiding the upload control removes its visible file card; removing/replacing a file now goes through the action bar. Accepted by the user as part of "only show the image edit box".
