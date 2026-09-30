# Phase 09 Acceptance Criteria

## Functional Requirements

- [x] ToolFileUpload exposes `triggerSelect()` method
- [x] ToolFilePanel has correct button layout: LEFT=[导入文件][粘贴], RIGHT=[复制][导出文件]
- [x] All 45 tool files updated with new layout
- [x] Copy/export buttons always visible, disabled when no result
- [x] Import button triggers file selection dialog
- [x] Paste button triggers clipboard read

## Technical Requirements

- [x] Type check passes
- [x] Build passes
- [x] All tests pass
- [x] No regression in existing functionality

## Manual Testing

- [x] Verify button positions in browser (LEFT=[导入文件][粘贴文件], RIGHT=[复制文件][导出文件])
- [x] Test import button triggers file dialog
- [x] Test paste button reads clipboard
- [x] Test copy button disabled state
- [x] Test export button disabled state
- [x] Verify compact upload trigger layout (in grid alongside imported files)
