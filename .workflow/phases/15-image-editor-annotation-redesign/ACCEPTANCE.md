# Phase 15 Acceptance Criteria

Evidence for each check goes into `VERIFICATION.md`.

## Toolbar

- [ ] AC-1 The toolbar shows 8 icon buttons (选择, 形状, 线条, 序号, 画笔, 文字, 橡皮擦, 马赛克) with no text labels; hovering each shows its tool name via NTooltip.
- [ ] AC-2 Clicking a tool button activates it (aria-pressed=true) and shows only that tool's parameters in the panel.

## Shape tool (rect/ellipse)

- [ ] AC-3 With 形状 active: the panel shows kind (rect/ellipse), colour, width, stroke style, fill toggle + colour, and corner radius (rect only).
- [ ] AC-4 Dragging on the canvas creates a rect or ellipse; the shape renders with the chosen colour, width, dash style, fill, and corner radius; export matches.

## Line tool (straight/polyline + arrows)

- [ ] AC-5 With 线条 active: the panel shows kind (straight/polyline), colour, width, stroke style, start arrow (on/off + style + size), end arrow (on/off + style + size).
- [ ] AC-6 Straight line: press-drag creates a line; polyline: clicks add vertices, double-click/Enter finishes, Esc discards.
- [ ] AC-7 Arrows render at start/end when enabled; style and size are respected; export matches.
- [ ] AC-8 Selected line shows endpoint handles; dragging one moves only that endpoint.

## Sequence number tool

- [ ] AC-9 With 序号 active: the panel shows format, colour, size, font family, leader on/off + width + stroke style.
- [ ] AC-10 Clicking places a numbered badge; counter auto-increments (1, 2, 3...); formats render correctly (a/b/c, i/ii/iii, I/II/III); letters wrap Excel-style (aa, ab...).
- [ ] AC-11 Counter resets on clear-all or format change; deleting a badge does not renumber remaining ones.
- [ ] AC-12 Leader line renders from badge to arrow tip with chosen width, dash style, and arrowhead; export matches.

## Pen tool

- [ ] AC-13 With 画笔 active: the panel shows colour, width, stroke style.
- [ ] AC-14 Press-drag draws a smooth freehand line (tension spline); dash styles apply; export matches.

## Text tool

- [ ] AC-15 With 文字 active: the panel shows content, colour, size, font family, stroke (on/off + colour + width), background (on/off + colour + opacity).
- [ ] AC-16 Clicking places text; stroke renders as outline; background renders as a rect behind the text; export matches.
- [ ] AC-17 Selected text shows a rotation handle; dragging it rotates the text around its centre; export matches.

## Eraser tool

- [ ] AC-18 With 橡皮擦 active: the panel shows mode (rect/brush) and brush size (brush mode).
- [ ] AC-19 Rect marquee deletes intersecting annotations only; brush deletes annotations within brushSize of the trail.
- [ ] AC-20 Wheel adjusts brush size in brush mode; brush preview circle follows the pointer.
- [ ] AC-21 Each eraser application is one undo step; undo restores erased annotations; clear-all empties the canvas and undo refills it.

## Mosaic tool

- [ ] AC-22 With 马赛克 active: the panel shows mode (rect/brush), effect (mosaic/blur), strength, and brush size (brush mode).
- [ ] AC-23 Rect and brush mosaic regions render the actual pixelated result live on the canvas (not a placeholder).
- [ ] AC-24 Effect toggle switches between mosaic (block size) and gaussian blur (radius); strength adjusts granularity; changes re-render live.
- [ ] AC-25 Export PNG shows the mosaic/blur effect in the region.
- [ ] AC-26 Dragging a mosaic region moves it; the cache re-renders; export matches.

## Undo/redo

- [ ] AC-27 Undo/redo buttons and keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y) work for all annotation operations; buttons disable correctly at history ends.

## Non-regression

- [ ] AC-28 Phase 13 behaviour still holds: one full-width file box, centred stage, copy/export produce the edited PNG, accept="image/*" enforced.
- [ ] AC-29 `pnpm --filter @toolnest/web test`, `type-check`, `build` pass; differential lint adds no new errors.
