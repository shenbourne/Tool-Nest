# Phase 09: Two-Column File Layout

## Context

All file-based tools (PDF, audio, video, image editors) currently use an inconsistent button layout that doesn't match the wireframe specification. The user provided a clear wireframe showing:

1. Two-column file area: Left = imported files + compact upload trigger; Right = output files
2. Button row: Left-aligned [导入文件] [粘贴]; Right-aligned [复制] [导出文件]
3. Parameters/processing controls (bottom)

Previous implementation had buttons in wrong positions:
- "粘贴" was on the RIGHT side (should be LEFT - it's an input operation)
- "导入文件" button was missing
- Copy/export buttons used `v-if` (hidden when no result) instead of `:disabled` (always visible, disabled when no result)

## Requirements

Based on grilling session with user:

1. **Button layout**: LEFT side = [导入文件] [粘贴], RIGHT side = [复制] [导出文件]
2. **Button semantics**: 
   - "粘贴" = paste from clipboard to web (input operation)
   - "复制" = copy from web to clipboard (output operation)
3. **Button visibility**: Always visible, disabled when no result (use `:disabled` not `v-if`)
4. **Compact upload trigger**: Keep the 128×128 dashed box, same size as file thumbnails, arranged after imported files
5. **Import button**: Always visible, triggers file selection dialog programmatically

## Technical Changes

### ToolFileUpload.vue
- Add `triggerSelect()` method to programmatically trigger file selection
- Expose via `defineExpose({ triggerPaste, triggerSelect })`

### ToolFilePanel.vue
- Add `requestImport` event
- Button layout: LEFT = [导入文件] [粘贴] + actions-left slot; RIGHT = actions-right slot
- Remove "粘贴" from RIGHT side (it's now on LEFT)

### All 45 Tool Files
- Add `@request-import="fileUpload?.triggerSelect()"` to ToolFilePanel
- Move copy/export buttons from actions-left to actions-right
- Change `v-if="resultXxx"` to `:disabled="!resultXxx"`
- Fix null safety: `@click="resultData && downloadBlob(resultData, ...)"`
