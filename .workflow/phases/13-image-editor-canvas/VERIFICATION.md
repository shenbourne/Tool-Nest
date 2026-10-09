# Phase 13 Verification

Worktree `.worktrees/phase-13-image-editor-canvas`, branch `feature/phase-13-image-editor-canvas`, base `master` `b44a61a`.

## Commands run

```bash
# tests (worktree, offline install from the local pnpm store)
pnpm --filter @toolnest/web test
# Test Files 33 passed (33) | Tests 222 passed (222), 6.07 s
# includes the new src/tools/konva-image-load.test.ts (3 tests)

# type check
pnpm --filter @toolnest/web type-check   # PASS (vue-tsc --noEmit, no output)

# build
pnpm --filter @toolnest/web build        # PASS, built in 33.58 s

# after the centring follow-up (CSS-only, re-run in full)
pnpm --filter @toolnest/web type-check   # PASS
pnpm --filter @toolnest/web build        # PASS, built in 30.36 s
pnpm --filter @toolnest/web test         # 33 files / 222 tests PASS

# differential lint (repo lint already fails on a pre-existing baseline)
git show HEAD:./<path> | npx eslint --stdin --stdin-filename <path>
npx eslint <path>
```

For the centring round the differential lint compares each file against the `HEAD` that already carries the first four commits: `ImageEditor.vue` 3 → 3, `ImageCrop.vue` 3 → 3 (the pre-existing `no-explicit-any` errors).

### Differential lint result

| File | errors at `HEAD` | errors now |
| --- | --- | --- |
| `apps/web/src/tools/image-editor/ImageEditor.vue` | 3 | 3 |
| `apps/web/src/tools/image-crop/ImageCrop.vue` | 3 | 3 |
| `apps/web/src/components/ToolFilePanel.vue` | 0 | 0 |
| `apps/web/src/tools/konva-image-load.test.ts` (new) | — | 0 |

Added 0 / removed 0. The 3 errors per file are the pre-existing `@typescript-eslint/no-explicit-any` on Konva pointer handlers, in lines this phase does not touch.

### Red/green check for the new guard

Applying the guard's two rules to the committed (pre-fix) sources through `git show HEAD:<path>`:

```
ImageEditor.vue  BEFORE  @load-on-v-image: true   dom-img-loader: false
                 AFTER   @load-on-v-image: false  dom-img-loader: true
ImageCrop.vue    BEFORE  @load-on-v-image: true   dom-img-loader: false
                 AFTER   @load-on-v-image: false  dom-img-loader: true
```

## Browser evidence

Dev server: `pnpm exec vite --port 3021 --strictPort` inside the worktree (the shared main worktree already holds :3000); API proxied to the pre-existing :3001 server. Fixture: `.scratch/phase-13-fixture.png`, 240×160, left half `#d22b2b`, right half `#2b52d2`, a `#22c040` stripe below 75 % height. Injected through the tool's real hidden `<input type="file">` via a `DataTransfer`.

Limitation (recorded honestly): the Chrome window hosting the page reported `document.hidden === true`, so the browser's `requestAnimationFrame` was suspended and Konva's rAF-scheduled redraws never ran. Screenshot capture was refused for the same reason (`NATIVE_BROWSER_VIEWPORT_UNAVAILABLE`). To emulate a visible tab, `Konva.Util.requestAnimFrame` was replaced in-page with a synchronous call — the same draw Konva schedules for a visible tab — and every canvas measurement below was taken after that. The app's own draw trigger path (`Image` attr change → `_requestAttr` → `Layer.batchDraw`) is therefore exercised, not bypassed; only the frame scheduling is made synchronous.

### `/image-editor` — layout (single column)

```
columns: 1
columnClasses: ["tool-file-panel__column tool-file-panel__single"]
hasInputSlot: false
hiddenUpload: true            # the ToolFileUpload stays mounted in a display:none wrapper
fileInputs: 1                 # exactly one, the control's hidden picker
gridColumns (computed): "556.8px"   # one column
buttons: [导入文件, 粘贴文件, 复制文件(disabled), 导出文件(disabled)]
emptyText: "导入文件\n支持格式：image/*"   # empty-state area
```

Empty state geometry and behaviour (no image picked): the area is 531×160 px inside the single box, visible, and clicking it calls the control's hidden `<input>` `click()` (spy on `HTMLInputElement.prototype.click`: 0 → 1 from the area, 0 → 1 from the `导入文件` button).

### `/image-editor` — the picked image renders

After injecting the fixture:

```
stageSize: [240, 160]                 # aspect fit inside 800×600, scale 1
canvasSize: [300, 200]                # ×1.25 device pixel ratio
nonTransparentPixels: 60000           # the whole 300×200 canvas is painted
leftQuarter  (0.25, 0.4): [210, 43, 43, 255]   # fixture #d22b2b
rightQuarter (0.75, 0.4): [43, 82, 210, 255]   # fixture #2b52d2
bottomStripe (0.5,  0.9): [34, 192, 64, 255]   # fixture #22c040
import-area-gone: true                # the empty state disappears once an image is loaded
```

### `/image-editor` — annotations and export

```
params buttons: [添加文本, 绘制线条, 选择, 全部清除]      # unchanged
after 添加文本 + click on the stage: layer nodes = [Image, Text, Text]
after 绘制线条 + drag on the stage:  layer nodes include Line
```

Export (`导出文件`), with `URL.createObjectURL` and `HTMLAnchorElement.prototype.click` wrapped so the blob could be inspected instead of downloaded:

```
toBlobCalls: 1   blobNonNull: 1   objectUrls: 1
exported: { type: "image/png", bytes: 3189, size: [240, 160], opaquePixels: 38400, pureRedPixels: 463 }
```

`opaquePixels` 38400 = 240×160 (fully painted) and the 463 pure-red pixels are the red line + text annotations, so the exported file matches what the stage shows and is at the source image's resolution.

### `/image-crop` — its blank canvas is fixed too

```
columns: 2                            # two-column layout deliberately unchanged
columnClasses: [tool-file-panel__column tool-file-panel__input, ... tool-file-panel__output]
stageSize: [240, 160]
nonTransparentPixels: 60000
nodeClasses: [Image, Rect, Transformer]
transformerNodes: [Rect]              # the transformer is attached (it cannot attach while imageEl is null)
rectBox: { x: 60, y: 40, w: 120, h: 80 }   # centred 50 % initial crop
topLeftOutsideRect  (0.05, 0.05): [210, 43, 43, 255]   # fixture red
bottomRightOutsideRect (0.97, 0.97): [34, 192, 64, 255] # fixture green stripe
```

### Centring follow-up (user decision 2026-10-02: horizontal + vertical, both canvas tools)

Second dev server session on :3031 (the :3000/:3001 servers belong to the shared main worktree). Same in-page `Konva.Util.requestAnimFrame` substitution; the tab still reported `document.hidden === true`, so no screenshot. Gaps are measured as `canvasRect - boxRect` on the `.konvajs-content` element, so they include the box's 12 px padding + 1 px border.

`/image-editor`, 120×80 fixture, box 241×186 (`min-height: 160`, content box 215×160):

```
canvas: [120, 80]
gaps: { left: 60.5, right: 60.5, top: 53, bottom: 53 }
wrapper computed: display flex, align-items center, justify-content center
```

`60.5 = 13 + (215 − 120)/2` and `53 = 13 + (160 − 80)/2`, so both axes are exactly centred.

`/image-crop`, 60×40 fixture. At this viewport (571 px wide) the two-column grid is narrower than its min-content, so each column hugs its content and the output box is 86 px wide — the canvas fills it and no free space exists to centre in. Widening the grid to `400px 400px` (an inline style applied for the measurement only) makes the free space visible:

```
box 400 wide, wrapper 374.4, canvas [60, 40]
gaps: { left: 170, right: 170, top: 77.2, bottom: 77.2 }
```

`170 = 13 + (374.4 − 60)/2` and `77.2 = 13 + (160 − 40)/2` — again exactly centred on both axes.

### Two-column tools are unaffected

`/image-compress` (representative file tool): `columns: 2`, `columnClasses` still the `__input`/`__output` pair, computed `grid-template-columns: "270.4px 270.4px"`.

## Not verified

- A real pointer-driven annotation (mouse drag) — annotations were driven with synthetic `MouseEvent`s on the Konva content element, which Konva resolves to its `click`/`mousedown`/`mousemove`/`mouseup` handlers exactly as a real pointer would. A physical click was not possible because the browser surface was hidden.
- No visual screenshot (browser surface hidden, as above).
- Push: not performed. Every earlier phase branch in this repo is deliberately kept local (`origin` carries `master` only), and pushing is a shared-state action that needs explicit authorization.
