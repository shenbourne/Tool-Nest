# Phase 09 Plan

## Implementation Steps

1. ✅ Add `triggerSelect()` method to ToolFileUpload.vue
2. ✅ Modify ToolFilePanel.vue button layout
3. ✅ Batch update all 45 tool files:
   - Add `@request-import` event handler
   - Move copy/export buttons to actions-right
   - Change `v-if` to `:disabled`
   - Fix null safety in download handlers
4. ✅ Type check passes
5. ✅ Build passes
6. ✅ All tests pass (219 web + 52 server)

## Files Modified

- `apps/web/src/components/ToolFileUpload.vue` - Added triggerSelect()
- `apps/web/src/components/ToolFilePanel.vue` - Fixed button layout
- `apps/web/src/tools/*/*.vue` - 45 tool files updated

## Verification

- Type check: PASS
- Build: PASS (22.40s)
- Tests: PASS (219 web + 52 server)
- Manual verification: Pending (requires browser testing)
