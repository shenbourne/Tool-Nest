<script setup lang="ts">
import { computed, h, nextTick, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { NAlert, NButton, NDropdown, NSelect, useMessage } from 'naive-ui';
import ToolLayout from '@/layouts/ToolLayout.vue';
import ToolFileUpload from '@/components/ToolFileUpload.vue';
import { readClipboardText } from '@/utils/clipboard';
import { serializeCSV } from '@/utils/csv';
import { useCopy } from '@/composables/useCopy';
import { tool } from './index';
import { assertTableSize } from './table-budget';
import { detectTableSeparator } from './table-tools.service';
import { insertSheetRow, moveSheetAxis } from './sheet-model';
import { columnName, commitHistory, createHistory, deleteSheetColumn, sheetKeyAction, editSheetCell, insertSheetColumn, parseSheet, pasteSheet, redoHistory, sheetIssues, sheetWidth, transposeSheet, undoHistory, type Sheet } from './sheet-model';
const { t, te } = useI18n();
const message = useMessage();
const { copyToClipboard } = useCopy();
const history = ref(createHistory([['','',''],['','',''],['','','']]));
const rows = computed(() => history.value.present);
const width = computed(() => Math.max(sheetWidth(rows.value),1));
const selected = reactive({row:0,column:0});
const grid = ref<HTMLDivElement>();
const fileInput = ref<InstanceType<typeof ToolFileUpload>>();
const errorKey = ref('');
let editGroup = '';
let lastImportedFile: File | undefined;
const options = reactive({ importSeparator:'auto', exportSeparator:'same' });
const separators = computed(() => [
  {label:t('tools.csvChangeSeparator.comma'),value:','}, {label:t('tools.csvChangeSeparator.semicolon'),value:';'},
  {label:t('tools.tableTools.pipeLabel') + ' (|)',value:'|'}, {label:t('tools.csvChangeSeparator.tab'),value:'\t'},
]);
const importSeparators = computed(() => [{label:t('tools.tableTools.autoDelimiter'),value:'auto'},...separators.value]);
const exportSeparators = computed(() => [{label:t('tools.tableTools.sameAsImport'),value:'same'},...separators.value]);
const detectedSeparator = ref<string>();
const detectedLabel = computed(() => separators.value.find(option => option.value===detectedSeparator.value)?.label ?? '');
const issues = computed(() => sheetIssues(rows.value));
const error = computed(() => errorKey.value && te(`tools.tableTools.${errorKey.value}`) ? t(`tools.tableTools.${errorKey.value}`) : errorKey.value);
const exportSeparator = computed(() => options.exportSeparator==='same' ? (options.importSeparator==='auto' ? detectedSeparator.value ?? ',' : options.importSeparator) : options.exportSeparator);
const serialized = computed(() => serializeCSV(rows.value,exportSeparator.value));
function clampSelection() {
  selected.row=Math.min(selected.row,Math.max(rows.value.length-1,0));
  selected.column=Math.min(selected.column,width.value-1);
}
function apply(next: Sheet) {
  editGroup=''; errorKey.value='';
  history.value=commitHistory(history.value,next.length ? next : [['']]);
  clampSelection();
}
function run(action: () => Sheet) {
  try { apply(action()); } catch(e) { errorKey.value=e instanceof Error ? e.message : String(e); }
}
function changeCell(row: number, column: number, event: Event) {
  const value=(event.target as HTMLTextAreaElement).value;
  try {
    const next=editSheetCell(rows.value,row,column,value);
    const key=`${row}:${column}`;
    history.value=editGroup===key ? {...history.value,present:next,future:[]} : commitHistory(history.value,next);
    editGroup=key; errorKey.value='';
  } catch (e) {
    (event.target as HTMLTextAreaElement).value = rows.value[row]?.[column] ?? '';
    errorKey.value = e instanceof Error ? e.message : String(e);
  }
}
function focusCell(row: number, column: number) { selected.row=row;selected.column=column;editGroup=''; }
async function moveCell(row: number, column: number) {
  const r=Math.max(0,row), c=Math.max(0,column);
  try { assertTableSize(Math.max(rows.value.length, r + 1), Math.max(width.value, c + 1)); }
  catch(e) { errorKey.value=e instanceof Error ? e.message : String(e); return; }
  if(r>=rows.value.length){
    const expanded=[...rows.value];
    while(expanded.length<=r) expanded.push(Array.from({length:width.value},()=>''));
    apply(expanded);
  }
  selected.row=r; selected.column=c;
  await nextTick();
  grid.value?.querySelector<HTMLTextAreaElement>(`[data-cell="${r}:${c}"]`)?.focus();
}
function undo() { editGroup='';history.value=undoHistory(history.value);errorKey.value='';clampSelection(); }
function redo() { editGroup='';history.value=redoHistory(history.value);errorKey.value='';clampSelection(); }
function keydown(event: KeyboardEvent,row: number,column: number) {
  const action=sheetKeyAction(event,row,column,rows.value.length,width.value);
  if(!action) return;
  event.preventDefault();
  if(action.kind==='undo') undo();
  else if(action.kind==='redo') redo();
  else if(action.kind==='move') void moveCell(action.row,action.column);
}
function paste(event: ClipboardEvent,row: number,column: number) {
  const text=event.clipboardData?.getData('text/plain') ?? '';
  if(!/[\t\r\n]/.test(text)) return;
  event.preventDefault();run(() => pasteSheet(rows.value,row,column,text));
}
function importText(text: string) {
  const separator=options.importSeparator==='auto' ? detectTableSeparator(text) : options.importSeparator;
  run(() => {
    const next=parseSheet(text,separator);
    detectedSeparator.value=options.importSeparator==='auto' ? separator : undefined;
    return next;
  });
}
async function pasteTable() {
  const text=await readClipboardText();
  if(text===null){message.error(t('tool.pasteFailed'));return;}
  importText(text);
}
async function importFile(files: File[]) {
  const file=files[0];
  // The shared uploader re-emits its retained file when a new selection is rejected.
  if(!file || file===lastImportedFile) return;
  lastImportedFile=file;
  try {
    const text=await file.text();
    if(file!==lastImportedFile) return;
    importText(text);
  }
  catch { message.error(t('tool.importFailed')); }
}
function exportFile() {
  const url=URL.createObjectURL(new Blob([serialized.value],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=exportSeparator.value==='\t' ? 'table.tsv' : 'table.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function appendRow() { run(() => insertSheetRow(rows.value,rows.value.length)); }
function appendColumn() { run(() => insertSheetColumn(rows.value,width.value)); }
const menu = reactive({show:false,x:0,y:0,axis:'row' as 'row'|'column',index:0});
const dragging = ref<{axis:'row'|'column';index:number}>();
const dropTarget = ref<{axis:'row'|'column';index:number}>();
function menuIcon(kind:'insert'|'delete') {
  return () => h('svg',{viewBox:'0 0 24 24',width:16,height:16,fill:'none',stroke:'currentColor','stroke-width':1.75,'stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',style:{color:kind==='delete' ? 'var(--color-error)' : 'var(--color-ink-muted)'}},[
    h('path',{d:kind==='insert' ? 'M12 5v14M5 12h14' : 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7'}),
  ]);
}
const menuOptions = computed(() => {
  const before = {key:'before',label:t(`tools.tableTools.${menu.axis==='row' ? 'insertAbove' : 'insertLeft'}`),icon:menuIcon('insert')};
  const after = {key:'after',label:t(`tools.tableTools.${menu.axis==='row' ? 'insertBelow' : 'insertRight'}`),icon:menuIcon('insert')};
  const remove = {key:'delete',label:t(`tools.tableTools.${menu.axis==='row' ? 'deleteRow' : 'deleteColumn'}`),icon:menuIcon('delete'),disabled:(menu.axis==='row' ? rows.value.length : width.value)<=1};
  return [before,remove,after];
});
function openMenu(event: MouseEvent,axis:'row'|'column',index:number) {
  event.preventDefault(); editGroup='';
  Object.assign(menu,{show:true,x:event.clientX,y:event.clientY,axis,index});
}
function menuAction(key:string) {
  const {axis,index}=menu; menu.show=false;
  if(key==='delete') {
    if((axis==='row' ? rows.value.length : width.value)<=1) return;
    apply(axis==='row' ? rows.value.filter((_,i)=>i!==index) : deleteSheetColumn(rows.value,index));
  } else run(() => axis==='row' ? insertSheetRow(rows.value,index+(key==='after' ? 1 : 0)) : insertSheetColumn(rows.value,index+(key==='after' ? 1 : 0)));
}
function startDrag(event:DragEvent,axis:'row'|'column',index:number) {
  dragging.value={axis,index}; menu.show=false; editGroup='';
  event.dataTransfer?.setData('text/plain',`${axis}:${index}`);
  if(event.dataTransfer) event.dataTransfer.effectAllowed='move';
}
function overDrag(event:DragEvent,axis:'row'|'column',index:number) {
  if(dragging.value?.axis!==axis) return;
  event.preventDefault(); dropTarget.value={axis,index};
}
function endDrag() { dragging.value=undefined;dropTarget.value=undefined; }
function dropAxis(event:DragEvent,axis:'row'|'column',index:number) {
  event.preventDefault();
  if(dragging.value?.axis===axis && dragging.value.index!==index) run(() => moveSheetAxis(rows.value,axis,dragging.value!.index,index));
  endDrag();
}
</script>
<template>
  <ToolLayout :tool="tool">
      <NAlert v-if="error" type="error" class="sheet-error">{{ error }}</NAlert>
      <NDropdown trigger="manual" :show="menu.show" :x="menu.x" :y="menu.y" :options="menuOptions" @select="menuAction" @clickoutside="menu.show=false" />
      <div class="sheet-frame">
      <div ref="grid" class="sheet-scroller" tabindex="0" :aria-label="t('tools.tableTools.sheet')">
        <table class="editable-sheet" :aria-label="t('tools.tableTools.sheet')">
          <thead><tr><th class="sheet-corner"><button type="button" class="transpose-button" :title="t('tools.tableTools.transposeNow')" :aria-label="t('tools.tableTools.transposeNow')" @click="apply(transposeSheet(rows))"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 20v-8a6 6 0 0 1 6-6h8" /><path d="m3 17 3 3 3-3M17 3l3 3-3 3" /></svg></button></th><th v-for="(_,c) in width" :key="c" scope="col" draggable="true" :class="{'selected-column':selected.column===c,'drop-column':dropTarget?.axis==='column' && dropTarget.index===c}" @contextmenu="openMenu($event,'column',c)" @dragstart="startDrag($event,'column',c)" @dragover="overDrag($event,'column',c)" @drop="dropAxis($event,'column',c)" @dragend="endDrag">{{ columnName(c) }}</th><th class="sheet-add-column" scope="col"><button type="button" class="sheet-add-button" :title="t('tools.tableTools.addColumn')" :aria-label="t('tools.tableTools.addColumn')" @click="appendColumn">+</button></th></tr></thead>
          <tbody><tr v-for="(row,r) in rows" :key="r" :class="{'header-row':r===0,'drop-row':dropTarget?.axis==='row' && dropTarget.index===r,'invalid-row':issues.some(issue=>issue.record===r+1)}">
            <th scope="row" draggable="true" @contextmenu="openMenu($event,'row',r)" @dragstart="startDrag($event,'row',r)" @dragover="overDrag($event,'row',r)" @drop="dropAxis($event,'row',r)" @dragend="endDrag">{{ r+1 }}</th>
            <td v-for="(_,c) in width" :key="c" :class="{'missing-cell':c>=row.length,'drop-column':dropTarget?.axis==='column' && dropTarget.index===c}">
              <textarea :value="row[c] ?? ''" :data-cell="`${r}:${c}`" :aria-label="t('tools.tableTools.cell',{row:r+1,column:columnName(c)})" :rows="Math.min(4,(row[c]?.split('\n').length ?? 1))" spellcheck="false" @focus="focusCell(r,c)" @blur="editGroup=''" @input="changeCell(r,c,$event)" @keydown="keydown($event,r,c)" @paste="paste($event,r,c)" />
            </td>
            <td class="sheet-add-column" aria-hidden="true"></td>
          </tr>
          <tr class="sheet-add-row"><th scope="row"><button type="button" class="sheet-add-button" :title="t('tools.tableTools.addRow')" :aria-label="t('tools.tableTools.addRow')" @click="appendRow">+</button></th><td :colspan="width+1"></td></tr>
          </tbody>
        </table>
      </div>
      <div class="sheet-file-actions">
        <div class="sheet-actions"><NButton @click="fileInput?.triggerSelect()">{{ t('tool.importFile') }}</NButton><NButton @click="pasteTable">{{ t('tools.tableTools.pasteTable') }}</NButton></div>
        <div class="sheet-actions sheet-export-actions"><NButton @click="copyToClipboard(serialized)">{{ t('tools.tableTools.copyTable') }}</NButton><NButton @click="exportFile">{{ t('tool.exportFile') }}</NButton></div>
        <ToolFileUpload ref="fileInput" class="sheet-file-picker" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain" @change="importFile" />
      </div>
      </div>
      <hr class="sheet-divider" />
      <div class="sheet-status"><span>{{ t('tools.tableTools.dimensions',{rows:rows.length,columns:width}) }} · {{ columnName(selected.column) }}{{ selected.row+1 }}</span><span>{{ t('tools.tableTools.sheetHint') }}</span></div>
      <div class="sheet-params">
        <label><span>{{ t('tools.tableTools.importDelimiter') }}</span><NSelect v-model:value="options.importSeparator" :options="importSeparators" :aria-label="t('tools.tableTools.importDelimiter')" /><small v-if="options.importSeparator==='auto' && detectedSeparator">{{ t('tools.tableTools.detectedDelimiter',{separator:detectedLabel}) }}</small></label>
        <label><span>{{ t('tools.tableTools.exportDelimiter') }}</span><NSelect v-model:value="options.exportSeparator" :options="exportSeparators" :aria-label="t('tools.tableTools.exportDelimiter')" /></label>
      </div>
      <div class="sheet-actions sheet-history">
        <button type="button" class="history-button" :disabled="!history.past.length" :title="t('tools.tableTools.undo')" :aria-label="t('tools.tableTools.undo')" @click="undo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5 4 10l5 5M4 10h10a5 5 0 0 1 0 10" /></svg></button>
        <span class="history-divider" aria-hidden="true"></span>
        <button type="button" class="history-button" :disabled="!history.future.length" :title="t('tools.tableTools.redo')" :aria-label="t('tools.tableTools.redo')" @click="redo"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5 5 5-5 5M20 10H10a5 5 0 0 0 0 10" /></svg></button>
      </div>
      <NAlert v-if="issues.length" type="warning"><div v-for="issue in issues" :key="issue.record">{{ t('tools.tableTools.issue',{...issue}) }}</div></NAlert>
  </ToolLayout>
</template>
<style scoped>
.sheet-file-picker {display:none;}
.sheet-actions {display:flex;flex-wrap:wrap;gap:8px;}
.sheet-frame {min-width:0;border:1px solid var(--color-hairline-strong);border-radius:var(--radius-md,8px);background:var(--color-surface-soft);overflow:hidden;}
.sheet-file-actions {display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding:12px;}
.sheet-export-actions {margin-left:auto;justify-content:flex-end;}
.sheet-params {display:flex;flex-wrap:wrap;align-items:end;gap:12px;width:100%;margin-top:16px;}
.sheet-params label {align-self:flex-start;flex:1 1 170px;min-width:0;display:grid;gap:6px;}
.sheet-divider {border:0;border-top:1px solid var(--color-hairline);margin:12px 0 6px;}
.sheet-history {margin:12px 0;}
.sheet-history {align-items:center;gap:8px;}
.history-button {display:flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--color-ink-muted);cursor:pointer;}
.history-button:hover:not(:disabled) {background:var(--color-surface-soft);color:var(--color-primary);}
.history-button:disabled {opacity:.35;cursor:default;}
.history-button:focus-visible {outline:2px solid var(--color-primary);outline-offset:2px;}
.history-divider {height:16px;width:1px;background:var(--color-hairline);}
.transpose-button {display:flex;align-items:center;justify-content:center;width:100%;height:30px;padding:0;border:0;background:transparent;color:var(--color-ink-muted);cursor:pointer;}
.transpose-button:hover {background:var(--color-primary-soft);color:var(--color-primary);}
.transpose-button:focus-visible {outline:2px solid var(--color-primary);outline-offset:-2px;}
.sheet-error {margin-bottom:12px;}
.sheet-scroller {max-width:100%;overflow:auto;max-height:520px;min-height:200px;background:var(--color-canvas);border-bottom:1px solid var(--color-hairline-strong);}
.editable-sheet {border-collapse:separate;border-spacing:0;min-width:100%;table-layout:fixed;}
.editable-sheet th,.editable-sheet td {border-right:1px solid var(--color-hairline);border-bottom:1px solid var(--color-hairline);padding:0;}
.editable-sheet th {background:var(--color-surface,var(--color-canvas));font-weight:500;text-align:center;font-size:12px;}
.editable-sheet thead th {position:sticky;top:0;z-index:2;height:30px;min-width:150px;}
.editable-sheet tbody th,.editable-sheet .sheet-corner {position:sticky;left:0;min-width:42px;width:42px;z-index:1;}
.editable-sheet .sheet-corner {z-index:3;}
.editable-sheet .sheet-add-column {width:32px;min-width:32px;max-width:32px;background:var(--color-surface-soft);}
.sheet-add-button {display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:30px;height:30px;padding:0;margin:auto;border:1px solid var(--color-hairline);border-radius:4px;background:var(--color-surface-soft);color:var(--color-ink-muted);font:20px/1 sans-serif;cursor:pointer;}
.sheet-add-button:hover {background:var(--color-primary-soft);color:var(--color-primary);}
.sheet-add-button:focus-visible {outline:2px solid var(--color-primary);outline-offset:-2px;}
.editable-sheet .sheet-add-row td {min-width:0;background:var(--color-canvas);}
.editable-sheet td {min-width:150px;vertical-align:top;}
.editable-sheet textarea {display:block;box-sizing:border-box;width:100%;min-width:150px;min-height:36px;resize:none;border:0;background:transparent;color:var(--color-ink);font:13px/20px var(--font-mono,monospace);padding:8px 10px;outline:none;}
.editable-sheet textarea:focus {box-shadow:inset 0 0 0 2px var(--color-primary);background:var(--color-canvas);}
.selected-column {color:var(--color-primary);}
.editable-sheet th[draggable] {cursor:grab;user-select:none;}
.header-row td,.header-row th {background:color-mix(in srgb,var(--color-primary) 12%,var(--color-canvas));border-bottom:2px solid var(--color-primary);}
.header-row textarea {font-weight:600;}
.drop-row > * {box-shadow:inset 0 2px var(--color-primary);}
.editable-sheet .drop-column {box-shadow:inset 2px 0 var(--color-primary);}
.missing-cell {background:rgba(245,158,11,.08);}
.invalid-row th {color:var(--color-warning,#b45309);}
.sheet-status {display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12px;color:var(--color-ink-muted);}
@media(max-width:600px){.sheet-params label{flex-basis:100%;}.sheet-actions :deep(.n-button){font-size:12px;}.sheet-status{flex-direction:column;}}
</style>
