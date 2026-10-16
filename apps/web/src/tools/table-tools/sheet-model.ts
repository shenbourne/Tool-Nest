import { assertTableRows, assertTableSize } from './table-budget';
import { parseTableRows } from './table-tools.service';
export { parseTableRows as parseSheet } from './table-tools.service';
export type Sheet = string[][];
export function insertSheetRow(rows: Sheet, position: number): Sheet {
  assertTableSize(rows.length + 1, Math.max(1, sheetWidth(rows)));
  const next = [...rows];
  next.splice(position, 0, Array.from({length: Math.max(1,sheetWidth(rows))}, () => ''));
  return next;
}
export function moveSheetAxis(rows: Sheet, axis: 'row'|'column', from: number, to: number): Sheet {
  assertTableRows(rows);
  const count = axis==='row' ? rows.length : sheetWidth(rows);
  if (![from,to].every(i => Number.isInteger(i) && i>=0 && i<count)) throw new Error('invalidIndex');
  const move = <T>(values: T[]): T[] => { const next=[...values]; const [value]=next.splice(from,1); next.splice(to,0,value); return next; };
  if(axis==='row') return move(rows).map(row => [...row]);
  return rows.map(row => move(Array.from({length:count},(_,c) => row[c] ?? '')));
}
const copy = (rows: Sheet): Sheet => rows.map(row => [...row]);
export const sheetWidth = (rows: Sheet): number => rows.reduce((max,row) => Math.max(max,row.length),0);
export function editSheetCell(rows: Sheet, row: number, column: number, value: string): Sheet {
  if (!Number.isSafeInteger(row) || !Number.isSafeInteger(column) || row < 0 || column < 0) throw new Error('invalidIndex');
  assertTableSize(Math.max(rows.length, row + 1), Math.max(sheetWidth(rows), column + 1));
  const next = [...rows];
  while(next.length <= row) next.push([]);
  next[row] = [...next[row]];
  while(next[row].length <= column) next[row].push('');
  next[row][column] = value;
  return next;
}
export function pasteSheet(rows: Sheet, row: number, column: number, text: string): Sheet {
  if (!Number.isSafeInteger(row) || !Number.isSafeInteger(column) || row < 0 || column < 0) throw new Error('invalidIndex');
  const block = parseTableRows(text,'\t',true);
  assertTableSize(Math.max(rows.length, row + block.length), Math.max(sheetWidth(rows), column + sheetWidth(block)));
  const next = copy(rows);
  for(let r=0;r<block.length;r++) {
    while(next.length <= row + r) next.push([]);
    for(let c=0;c<block[r].length;c++) {
      while(next[row + r].length <= column + c) next[row + r].push('');
      next[row + r][column + c] = block[r][c];
    }
  }
  return next;
}
export function transposeSheet(rows: Sheet): Sheet {
  assertTableRows(rows);
  return Array.from({length:sheetWidth(rows)}, (_,c) => rows.map(row => row[c] ?? ''));
}
export function insertSheetColumn(rows: Sheet, position: number, header = '', value = ''): Sheet {
  const width = sheetWidth(rows);
  assertTableSize(rows.length, width + 1);
  if(!Number.isInteger(position) || position < 0 || position > width) throw new Error('invalidIndex');
  return rows.map((row,r) => {
    const full = Array.from({length:width},(_,c) => row[c] ?? '');
    full.splice(position,0,r===0 ? header : value);
    return full;
  });
}
export function swapSheetColumns(rows: Sheet, a: number, b: number): Sheet {
  assertTableRows(rows);
  const width = sheetWidth(rows);
  if(!Number.isInteger(a) || !Number.isInteger(b) || a<0 || b<0 || a>=width || b>=width) throw new Error('columnRange');
  return rows.map(row => {
    const full = Array.from({length:width},(_,c) => row[c] ?? '');
    [full[a],full[b]]=[full[b],full[a]];
    return full;
  });
}
export function sheetIssues(rows: Sheet) {
  const expected=rows[0]?.length ?? 0;
  return rows.slice(1).flatMap((row,i) => row.length === expected ? [] : [{record:i+2,columns:row.length,expected}]);
}
export interface SheetHistory { past: Sheet[]; present: Sheet; future: Sheet[] }
export function createHistory(rows: Sheet): SheetHistory { assertTableRows(rows); return {past:[],present:copy(rows),future:[]}; }
export function commitHistory(history: SheetHistory, rows: Sheet): SheetHistory {
  assertTableRows(rows);
  return {past:[...history.past,history.present].slice(-50),present:copy(rows),future:[]};
}
export function undoHistory(history: SheetHistory): SheetHistory {
  if(!history.past.length) return history;
  return {past:history.past.slice(0,-1),present:history.past[history.past.length-1],future:[history.present,...history.future]};
}
export function redoHistory(history: SheetHistory): SheetHistory {
  if(!history.future.length) return history;
  return {past:[...history.past,history.present].slice(-50),present:history.future[0],future:history.future.slice(1)};
}
export function columnName(index: number): string {
  let value=index+1, name='';
  while(value>0){value--;name=String.fromCharCode(65+value%26)+name;value=Math.floor(value/26);}
  return name;
}
export function deleteSheetColumn(rows: Sheet, column: number): Sheet {
  const next=rows.map(row => row.filter((_,i)=>i!==column));
  return sheetWidth(next) ? next : next.map(() => ['']);
}
type SheetKey = {key: string; shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; isComposing?: boolean; keyCode?: number};
type KeyAction = {kind:'undo'|'redo'} | {kind:'move';row:number;column:number};
export function sheetKeyAction(event: SheetKey,row: number,column: number,rowCount: number,width: number): KeyAction | null {
  if(event.isComposing || event.keyCode===229) return null;
  if(event.ctrlKey || event.metaKey){
    if(event.key.toLowerCase()==='z') return {kind:event.shiftKey ? 'redo' : 'undo'};
    if(event.key.toLowerCase()==='y') return {kind:'redo'};
  }
  if(event.key==='Tab'){
    if(event.shiftKey && row===0 && column===0) return null;
    if(!event.shiftKey && row===rowCount-1 && column===width-1) return null;
    const next=column+(event.shiftKey ? -1 : 1);
    if(next<0) return {kind:'move',row:row-1,column:width-1};
    return {kind:'move',row:row+(next>=width ? 1 : 0),column:next>=width ? 0 : next};
  }
  if(event.key==='Enter' && !event.shiftKey && !event.altKey) return {kind:'move',row:row+1,column};
  return null;
}
