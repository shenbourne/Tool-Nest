# Phase 14 Plan

Base: `feature/phase-13-image-editor-canvas` @ `02c0a2f` (stacked — phase 14 cannot be merged without phase 13).

## Tasks (each independently committable)

### T1 — pure model + history (`image-editor.service.ts`, `image-editor.service.test.ts`)

Test-first, because the history cursor arithmetic and the visibility matrix are the parts that are cheap to get subtly wrong and impossible to test inside a `.vue` file (the repo's vitest runs `src/**/*.test.ts` in a node environment).

Interfaces:

```ts
export type Annotation =
  | { id: number; type: 'text'; x: number; y: number; text: string; fontSize: number; color: string }
  | { id: number; type: 'line'; points: [number, number, number, number]; color: string; strokeWidth: number };

export type ParamField = 'color' | 'lineWidth' | 'fontSize' | 'text';

/** Which parameter rows the panel shows. */
export function paramsFor(activeTool: 'none' | 'text' | 'line', selected: Annotation | null): ParamField[];

export type History<T> = { states: T[]; cursor: number };
export function createHistory<T>(initial: T, limit?: number): History<T>;
export function commit<T>(history: History<T>, state: T): History<T>;
export function undo<T>(history: History<T>): History<T>;
export function redo<T>(history: History<T>): History<T>;
export function historyState<T>(history: History<T>): T;
export function canUndo<T>(history: History<T>): boolean;
export function canRedo<T>(history: History<T>): boolean;
export function moveLine(ann: LineAnnotation, dx: number, dy: number): LineAnnotation;
export function moveLineEndpoint(ann: LineAnnotation, end: 0 | 1, x: number, y: number): LineAnnotation;
```

Checks:
- `paramsFor`: text tool → `['color','fontSize','text']`; line tool → `['color','lineWidth']`; select + text selected → `['color','fontSize','text']`; select + line selected → `['color','lineWidth']`; select + nothing → `[]`.
- history: initial state is undoable-free; commit truncates the redo tail; undo/redo move the cursor and never go out of range; the 100-state cap drops the oldest; `historyState` returns the cursor entry.

### T2 — parameter block rebuilt (AC-1…AC-6)

`ImageEditor.vue`: rows driven by `paramsFor(...)`, every row `image-editor__row` (label left, control right, vertically centred), plus the undo/redo/delete actions. Remove the old inline text input.

### T3 — selection, editing, moving, endpoints, delete (AC-7…AC-11)

- `selectedId` + `nodeRefs` (function refs on `<v-text>`/`<v-line>`), a `Transformer` attached on selection, deselect on stage background click.
- `draggable` on both node types; `@dragend` writes the position back (text: absolute; line: `moveLine` by the node's travel).
- Endpoint circles for a selected line, `@dragmove` → `moveLineEndpoint`.
- Delete button in the panel + `Delete`/`Backspace` keys.

### T4 — undo/redo (AC-12, AC-13)

Buttons + the three shortcuts, input-focus guard, commit on structural ops, coalesced commit on property edits, `Ctrl+Z` etc. ignored inside inputs.

### T5 — verification (AC-14, AC-15)

`pnpm --filter @toolnest/web test`, `type-check`, `build`, differential lint, then a browser pass on `/image-editor` driving each criterion with an injected fixture and recording the results in `VERIFICATION.md`.

## Risks

- The selection outline depends on Konva `Transformer` + node refs; if attaching proves unstable with `v-for` refs, fall back to drawing a dashed rect from `node.getClientRect()`.
- The `Transformer` must not swallow the click used to create annotations; it is only rendered while `选择` is active and something is selected.
- Keyboard handlers must ignore events whose target is an input, textarea or contenteditable, otherwise typing in `文本` would be hijacked.
- `images-to-gif`-style CRLF churn: keep edits surgical and check `git diff --numstat` before committing.
