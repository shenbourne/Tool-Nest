# Image Editor Annotation Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/image-editor` annotations as seven PixPin-style tools (rect/ellipse, line/polyline, sequence number, pen, text, eraser, mosaic) with an icon toolbar, per-tool params, live mosaic/blur, and full undo/redo.

**Architecture:** Pure logic lives in `image-editor.service.ts` (types, stroke mapping, arrows, number formatting, hit geometry, mosaic pixelation, history). `ImageEditor.vue` orchestrates the toolbar, dynamic params panel, Konva stage, selection/handles, interaction state machine, and export. Coordinates are normalised (0–1); the eraser deletes (history step) rather than creating annotations; mosaic renders live from an offscreen cache.

**Tech Stack:** Vue 3 `<script setup>`, naive-ui, vue-konva 3.4 / Konva 9.3.22, `@vicons/tabler`, vitest (node env, `.ts` only).

**Spec:** `docs/superpowers/specs/2026-10-06-image-editor-annotation-redesign-design.md`

## Global Constraints

- Work in the isolated worktree `.worktrees/phase-14-image-editor-annotations`, branch `feature/phase-14-image-editor-annotations` (stacked on phase 13 `02c0a2f`). Never commit on `master`; do not merge or push without explicit authorisation.
- One task = one atomic commit; commit-lint hook allows only `feat|fix|refactor|test|docs|chore` with a **single-line** subject (no body, no second `-m`, no heredoc).
- Do NOT stage `apps/web/src/components.d.ts` or `apps/web/src/auto-imports.d.ts` (CRLF artefact, empty content diff).
- Repo lint baseline is pre-existing red (~233 errors / 90 files). Verify with per-file differential lint (`git show HEAD:<path> | npx eslint --stdin --stdin-filename <path>` vs `npx eslint <path>`); never claim "lint passes".
- Locale JSON files (`apps/web/src/locales/{zh,en}.json`) are CRLF; edit via a Node script that splits/joins on `\r\n` to preserve line endings, then validate both parse.
- Konva 9 only responds to synthetic `MouseEvent` (not `PointerEvent`) in browser tests; a hidden tab suspends rAF, so patch `window.requestAnimationFrame` to run callbacks synchronously before reading pixels; call `layer.drawHit()` before `stage.getIntersection`.
- vitest runs `src/**/*.test.ts` in `environment: 'node'`; logic inside `.vue` is untestable — all pure helpers go in `.ts`.
- Params panel rows: label left, control right, vertically centred (`.image-editor__row`, `align-items: center`, label `white-space: nowrap`).
- Toolbar = icon buttons (`@vicons/tabler`) wrapped in `NTooltip` (name on hover), active tool highlighted.
- Stroke-style dash arrays scale with stroke width.
- Undo/redo covers every annotation add/delete/move/property/clear; each eraser application is one step; keys in a text field are left to the browser.

---

## File Structure

- `apps/web/src/tools/image-editor/image-editor.service.ts` — REWRITTEN. Pure: types, stroke map, arrows, number format, geometry, mosaic pixelation, history, param descriptors.
- `apps/web/src/tools/image-editor/image-editor.service.test.ts` — REWRITTEN. Unit tests for the pure functions.
- `apps/web/src/tools/image-editor/ImageEditor.vue` — REWRITTEN. Orchestration + template + styles.
- `apps/web/src/locales/zh.json`, `en.json` — new keys under `tools.imageEditor.*` (tool names, param labels, options).

---

## Interfaces (contracts between tasks)

Produced by the service (Task 1) and consumed by the component (Tasks 2–7):

```ts
export type StrokeStyle = 'solid' | 'dash-long' | 'dash-short' | 'dash-dot' | 'dash-dot-dot';
export type ArrowStyle = 'none' | 'triangle' | 'open' | 'circle';
export interface ArrowConfig { style: ArrowStyle; size: number }
export type NumberFormat = 'number' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';

export interface ShapeAnnotation { id: number; type: 'shape'; kind: 'rect' | 'ellipse';
  x: number; y: number; width: number; height: number; rotation: number;
  stroke: string; strokeWidth: number; strokeStyle: StrokeStyle;
  fillEnabled: boolean; fill: string; cornerRadius: number }
export interface LineAnnotation { id: number; type: 'line'; kind: 'straight' | 'polyline';
  points: number[]; stroke: string; strokeWidth: number; strokeStyle: StrokeStyle;
  startArrow: ArrowConfig | null; endArrow: ArrowConfig | null }
export interface NumberAnnotation { id: number; type: 'number'; x: number; y: number;
  value: number; format: NumberFormat; color: string; size: number; fontFamily: string;
  leaderLine: { enabled: boolean; points: [number, number, number, number];
    strokeWidth: number; strokeStyle: StrokeStyle; arrow: ArrowConfig } | null }
export interface PenAnnotation { id: number; type: 'pen'; points: number[];
  stroke: string; strokeWidth: number; strokeStyle: StrokeStyle }
export interface TextAnnotation { id: number; type: 'text'; x: number; y: number; text: string;
  fontSize: number; color: string; fontFamily: string; rotation: number;
  stroke: { enabled: boolean; color: string; width: number } | null;
  background: { enabled: boolean; color: string; opacity: number } | null }
export interface MosaicAnnotation { id: number; type: 'mosaic';
  region: { kind: 'rect'; x: number; y: number; width: number; height: number }
        | { kind: 'path'; points: number[]; brushSize: number };
  effect: 'mosaic' | 'blur'; strength: number }
export type Annotation = ShapeAnnotation | LineAnnotation | NumberAnnotation
  | PenAnnotation | TextAnnotation | MosaicAnnotation;

export type Tool = 'select' | 'shape' | 'line' | 'number' | 'pen' | 'text' | 'eraser' | 'mosaic';

export function strokeDash(style: StrokeStyle, width: number): number[];
export function formatNumber(value: number, format: NumberFormat): string;
export function arrowPoints(x1: number, y1: number, x2: number, y2: number,
  cfg: ArrowConfig): number[]; // polygon points for the arrowhead at (x2,y2)
export function distToSegment(px: number, py: number, x1: number, y1: number,
  x2: number, y2: number): number;
export function rectFromPoints(x1: number, y1: number, x2: number, y2: number):
  { x: number; y: number; width: number; height: number };
export function applyMosaic(src: HTMLCanvasElement, region: MosaicAnnotation['region'],
  effect: 'mosaic' | 'blur', strength: number, stageW: number, stageH: number): HTMLCanvasElement;
// history (from phase 14, unchanged signatures):
export interface History<T> { states: T[]; cursor: number; limit: number }
export function createHistory<T>(initial: T, limit?: number): History<T>;
export function commit<T>(h: History<T>, state: T): History<T>;
export function undo<T>(h: History<T>): History<T>;
export function redo<T>(h: History<T>): History<T>;
export function canUndo<T>(h: History<T>): boolean;
export function canRedo<T>(h: History<T>): boolean;
export function historyState<T>(h: History<T>): T;
```

---

### Task 1: Rewrite the service — types, stroke map, arrows, numbers, geometry, mosaic, history

**Files:**
- Rewrite: `apps/web/src/tools/image-editor/image-editor.service.ts`
- Rewrite: `apps/web/src/tools/image-editor/image-editor.service.test.ts`

**Interfaces:**
- Produces: every type and function listed in Interfaces above.

- [ ] **Step 1: Write the failing tests** covering `strokeDash` (all five styles scale with width), `formatNumber` (number, lower/upper alpha incl. aa/ab past 26, lower/upper roman), `arrowPoints` (triangle/open/circle return plausible polygons; degenerate zero-length returns empty), `distToSegment`, `rectFromPoints` (normalises inverted drag), `applyMosaic` (mosaic reduces unique colours in the region; blur changes pixels but keeps dimensions), and the history walk (commit truncates redo, cap at limit, no shared references via JSON clone).

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @toolnest/web test -- src/tools/image-editor/image-editor.service.test.ts`
Expected: FAIL (module exports not found).

- [ ] **Step 3: Implement the service** with the exact types/signatures above. `strokeDash` multiplies base gaps by `Math.max(1, width)`. `formatNumber` implements Excel-style alpha carry and roman numerals. `applyMosaic` draws the source region into an offscreen canvas, then for `mosaic` averages `strength×strength` blocks and for `blur` runs a box blur of radius `strength` (separable horizontal+vertical pass).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @toolnest/web test -- src/tools/image-editor/image-editor.service.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/tools/image-editor/image-editor.service.ts apps/web/src/tools/image-editor/image-editor.service.test.ts
git commit -m "feat(web): rewrite image-editor service with seven annotation types"
```

---

### Task 2: Component scaffold — icon toolbar, params-panel frame, select/move/delete/undo, export

**Files:**
- Rewrite: `apps/web/src/tools/image-editor/ImageEditor.vue`
- Modify: `apps/web/src/locales/zh.json`, `en.json`

**Interfaces:**
- Consumes: Task 1 service (types, history, `strokeDash`, `rectFromPoints`).
- Produces: the working shell later tasks extend — `annotations`, `history`, `selectedId`, `activeTool`, `pushHistory/undoAction/redoAction/deleteSelected/clearAll`, `createCanvas()`, and the toolbar/panel render structure.

- [ ] **Step 1: Add locale keys** via a CRLF-preserving Node script: tool names (`select/shape/line/number/pen/text/eraser/mosaic`), stroke-style labels, arrow-style labels, number-format labels, common labels (colour, width, size, font, fill, corner radius, content, stroke, background, opacity, effect, strength, mode, clear all, delete selected, undo, redo). Validate both JSON files parse.

- [ ] **Step 2: Write the component shell.** Keep phase 13's hidden `<img>` loader, single-column `ToolFilePanel columns="1"`, centred `.canvas-wrapper`, and `createCanvas()` image+scale skeleton. Replace the params block with: an icon toolbar (8 `NTooltip`-wrapped icon buttons) and a dynamic params area that currently renders only the footer (undo/redo icons, delete-selected, clear-all). Wire `activeTool`, selection (`selectedId`), drag-to-move for a generic annotation, `Delete`, `Ctrl+Z/Y/Shift+Z`, and the history snapshot mechanism against the new `Annotation[]` model.

- [ ] **Step 3: Verify in browser.** Serve the worktree dev server on a free port; import a fixture image; confirm the toolbar renders 8 icons with tooltips, select mode shows no param rows, footer undo/redo are disabled, and no console errors. (Patch rAF synchronously; use synthetic `MouseEvent`.)

- [ ] **Step 4: Differential lint + commit.** Lint the new/changed files against HEAD; then:

```bash
git add apps/web/src/tools/image-editor/ImageEditor.vue apps/web/src/locales/zh.json apps/web/src/locales/en.json
git commit -m "feat(web): image-editor annotation toolbar and params shell"
```

---

### Task 3: Shape tool (rect/ellipse) + Line tool (straight/polyline with arrows)

**Files:**
- Modify: `apps/web/src/tools/image-editor/ImageEditor.vue`

**Interfaces:**
- Consumes: `ShapeAnnotation`, `LineAnnotation`, `strokeDash`, `arrowPoints`, `rectFromPoints`.
- Produces: drawing interactions and param rows for `shape` and `line`; Konva `v-rect`/`v-ellipse`/`v-line` rendering with dash and arrowheads.

- [ ] **Step 1: Render `shape` and `line` annotations** on the stage (dash via `strokeDash`, ellipse via `v-ellipse`, arrows by drawing a filled `v-line` closed polygon from `arrowPoints` at each configured end).
- [ ] **Step 2: Implement draw interactions.** Shape: press-drag-release creates a `rectFromPoints` bbox. Line straight: press-drag-release. Line polyline: click adds a vertex, double-click/Enter finishes (≥2 points), Esc discards. All push history on completion.
- [ ] **Step 3: Param rows** for shape (kind, colour, width, stroke style, fill on/off+colour, corner radius when rect) and line (kind, colour, width, stroke style, start arrow style+size, end arrow style+size). Editing the selected annotation updates the stage live and coalesces history (400 ms).
- [ ] **Step 4: Selection editing.** Select shows the Transformer outline; shape draggable; line draggable (fold travel into points, reset node position); line endpoints (straight) and each vertex (polyline) rendered as draggable circles that write back through the model.
- [ ] **Step 5: Browser-verify** each sub-behaviour (draw rect, draw ellipse, switch kind, dash styles, fill, corner radius, straight line, polyline multi-vertex + finish + vertex drag, start/end arrows of each style, export PNG pixel check). Then differential lint + commit:

```bash
git add apps/web/src/tools/image-editor/ImageEditor.vue
git commit -m "feat(web): image-editor shape and line tools with arrows"
```

---

### Task 4: Pen + Text (rotation, stroke, background)

**Files:**
- Modify: `apps/web/src/tools/image-editor/ImageEditor.vue`

**Interfaces:**
- Consumes: `PenAnnotation`, `TextAnnotation`, `strokeDash`.
- Produces: pen draw + text place/edit with rotation handle, stroke, background.

- [ ] **Step 1: Pen tool** — press-drag captures a dense point trail into `points[]`; render as a `v-line` with tension; params: colour, width, stroke style.
- [ ] **Step 2: Text tool** — click places a text annotation; params: content, colour, size, font family, stroke (on/off+colour+width), background (on/off+colour+opacity). Render via `v-text` with `stroke`/`strokeWidth` and a `v-rect` behind when background enabled.
- [ ] **Step 3: Rotation handle** — when a text annotation is selected, render a small handle above the Transformer; dragging it rotates the text around its centre (store `rotation` degrees on the model).
- [ ] **Step 4: Selection editing** — drag to move pen/text; property edits live + coalesced.
- [ ] **Step 5: Browser-verify** (pen stroke styles, text stroke/background/opacity, rotation changes the node rotation and export). Differential lint + commit:

```bash
git add apps/web/src/tools/image-editor/ImageEditor.vue
git commit -m "feat(web): image-editor pen and text tools with rotation"
```

---

### Task 5: Sequence number (auto-increment + leader line)

**Files:**
- Modify: `apps/web/src/tools/image-editor/ImageEditor.vue`

**Interfaces:**
- Consumes: `NumberAnnotation`, `formatNumber`, `strokeDash`, `arrowPoints`.
- Produces: number placement with auto-increment and optional leader-line arrow.

- [ ] **Step 1: Number tool** — click places a badge (circle + centred label from `formatNumber`). Maintain a `nextNumber` counter (starts 1, increments per placement; reset on clear-all or format change; deletion does not renumber).
- [ ] **Step 2: Leader line** — when enabled, drag from the badge to aim the leader; render a `v-line` from badge edge to arrow tip with `strokeDash` style and an `arrowPoints` head. Params: format, colour, size, font family, leader on/off + width + stroke style.
- [ ] **Step 3: Selection editing** — drag to move the badge (leader follows); property edits live.
- [ ] **Step 4: Browser-verify** (formats render 1/2/3, a/b/c, aa/ab, i/ii/iii, I/II/III; leader arrow + styles; counter increments and resets correctly). Differential lint + commit:

```bash
git add apps/web/src/tools/image-editor/ImageEditor.vue
git commit -m "feat(web): image-editor sequence-number tool with leader line"
```

---

### Task 6: Eraser (rect/brush modes) + clear-all

**Files:**
- Modify: `apps/web/src/tools/image-editor/ImageEditor.vue`

**Interfaces:**
- Consumes: `distToSegment`, `rectFromPoints`, all annotation types (hit detection).
- Produces: eraser interactions that delete hit annotations as one history step each.

- [ ] **Step 1: Eraser tool** — mode toggle (rect marquee / brush track). Rect: drag a marquee, on release delete every annotation whose bounding region intersects it. Brush: drag a trail, delete annotations within `brushSize` of any trail segment (use `distToSegment` against each annotation's segments/bbox). Wheel adjusts brush size (brush mode).
- [ ] **Step 2: History integration** — each eraser application removes the hit annotations in one `pushHistory` (undo restores them). Add the clear-all button (with `NPopconfirm`) that clears every annotation as one step.
- [ ] **Step 3: Brush preview** — while erasing in brush mode, show a translucent circle cursor at the pointer of radius `brushSize`.
- [ ] **Step 4: Browser-verify** (rect erase removes intersecting only; brush erase respects size; wheel changes size; undo restores erased; clear-all empties and undo refills). Differential lint + commit:

```bash
git add apps/web/src/tools/image-editor/ImageEditor.vue
git commit -m "feat(web): image-editor eraser with rect and brush modes"
```

---

### Task 7: Mosaic (rect/brush, mosaic/blur, live render) + final gates

**Files:**
- Modify: `apps/web/src/tools/image-editor/ImageEditor.vue`

**Interfaces:**
- Consumes: `MosaicAnnotation`, `applyMosaic`, `rectFromPoints`, `distToSegment`.
- Produces: mosaic/blur regions rendered live from an offscreen cache; export renders them.

- [ ] **Step 1: Mosaic tool** — mode toggle (rect / brush) and effect toggle (mosaic / blur) + strength param; wheel adjusts brush size (brush mode). On creation, build an offscreen cache via `applyMosaic` from the current source image and stage size; render it as a `v-image` clipped to the region (rect) or along the brush path. Rebuild the cache when the source image changes.
- [ ] **Step 2: Export** — in `createCanvas()`, after drawing the base image and vector annotations, draw each mosaic cache at the region so the exported PNG is pixelated/blurred there.
- [ ] **Step 3: Selection editing** — drag to move a mosaic region (cache follows); strength/effect edits rebuild the cache.
- [ ] **Step 4: Browser-verify** (rect + brush mosaic and blur visibly alter the region live; strength changes granularity; export PNG shows the effect; moving the region re-renders). 
- [ ] **Step 5: Final gates** — run `pnpm --filter @toolnest/web test`, `type-check`, `build`; differential lint on all changed files. Fix any regressions. Then commit:

```bash
git add apps/web/src/tools/image-editor/ImageEditor.vue
git commit -m "feat(web): image-editor mosaic and blur with live rendering"
```

---

### Task 8: Phase docs, STATE, ROADMAP

**Files:**
- Create: `.workflow/phases/15-image-editor-annotation-redesign/{CONTEXT,PLAN,ACCEPTANCE,VERIFICATION}.md`
- Modify: `.workflow/STATE.md`, `.workflow/ROADMAP.md`

- [ ] **Step 1:** Write CONTEXT (decisions), PLAN (task list), ACCEPTANCE (per-tool criteria mirroring the browser checks), and VERIFICATION (commands + evidence) once Tasks 2–7 land.
- [ ] **Step 2:** Update STATE.md (current phase, last verification, next action) and ROADMAP.md (phase 15 row). Commit:

```bash
git add .workflow/phases/15-image-editor-annotation-redesign .workflow/STATE.md .workflow/ROADMAP.md
git commit -m "docs(workflow): record phase 15 image editor annotation redesign"
```

---

## Self-Review

- **Spec coverage:** every tool (shape/line/number/pen/text/eraser/mosaic) has a task (3–7); toolbar icons + tooltip (Task 2); stroke styles (1,3,4,5); arrows as params (3); number formats + auto-increment + leader (5); text rotation/stroke/background (4); eraser modes + clear (6); mosaic live render + export (7); undo/redo everywhere (2 + each); locale keys (2). Covered.
- **Placeholders:** none — each step names the file, the behaviour, and how to verify.
- **Type consistency:** `Annotation` union, `strokeDash`, `arrowPoints`, `formatNumber`, `distToSegment`, `rectFromPoints`, `applyMosaic`, and the history signatures are defined in Task 1 and referenced identically in Tasks 3–7.
