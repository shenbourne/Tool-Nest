import { describe, expect, it } from 'vitest';
import { parseSheet, pasteSheet, editSheetCell, transposeSheet, insertSheetColumn, swapSheetColumns, sheetIssues, createHistory, commitHistory, undoHistory, redoHistory, deleteSheetColumn, sheetKeyAction } from './sheet-model';
describe('editable sheet contracts', () => {
  it('imports quoted cells and reports malformed input without overwriting a sheet', () => {
    expect(parseSheet('a,b\n"x,y",z',',')).toEqual([['a','b'],['x,y','z']]);
    expect(() => parseSheet('a\n"unterminated',',')).toThrow('unclosedQuote');
  });
  it('edits missing cells without mutating the prior snapshot', () => {
    const rows=[['a','b'],['1']];
    expect(editSheetCell(rows,1,1,'2')).toEqual([['a','b'],['1','2']]);
    expect(rows[1]).toEqual(['1']);
  });
  it('pastes Excel ranges at the selected cell and expands only needed rows', () => {
    const rows=[['keep','b'],['c','d']];
    expect(pasteSheet(rows,1,1,'1\t2\n3\t4')).toEqual([['keep','b'],['c','1','2'],['','3','4']]);
  });
  it('keeps in-cell CSV text as a single value on paste', () => {
    expect(pasteSheet([['']],0,0,'hello, world')).toEqual([['hello, world']]);
  });
  it('transposes, inserts and swaps the same sheet atomically', () => {
    expect(transposeSheet([['a','b'],['1']])).toEqual([['a','1'],['b','']]);
    expect(insertSheetColumn([['a','b'],['1']],1,'new','x')).toEqual([['a','new','b'],['1','x','']]);
    expect(swapSheetColumns([['a','b'],['1']],0,1)).toEqual([['b','a'],['','1']]);
  });
  it('updates width diagnostics after editing missing cells', () => {
    const rows=[['a','b'],['1']];
    expect(sheetIssues(rows)).toEqual([{record:2,columns:1,expected:2}]);
    expect(sheetIssues(editSheetCell(rows,1,1,'2'))).toEqual([]);
  });
  it('clears blank Excel ranges and preserves whitespace cells', () => {
    expect(pasteSheet([['a','b']],0,0,'\t')).toEqual([['','']]);
    expect(pasteSheet([['a','b']],0,0,'  \t ')).toEqual([['  ',' ']]);
  });
  it('keeps a usable final column through delete/add/undo/redo', () => {
    const deleted=deleteSheetColumn([['a'],['b']],0);
    expect(deleted).toEqual([[''],['']]);
    let h=createHistory(deleted);h=commitHistory(h,insertSheetColumn(deleted,1));
    expect(h.present).toEqual([['',''],['','']]);
    expect(redoHistory(undoHistory(h)).present).toEqual(h.present);
  });
  it('lets IME and boundary tabs use native behavior but navigates within cells', () => {
    expect(sheetKeyAction({key:'Enter',isComposing:true},0,0,2,2)).toBeNull();
    expect(sheetKeyAction({key:'Enter',keyCode:229},0,0,2,2)).toBeNull();
    expect(sheetKeyAction({key:'Tab',shiftKey:true},0,0,2,2)).toBeNull();
    expect(sheetKeyAction({key:'Tab'},1,1,2,2)).toBeNull();
    expect(sheetKeyAction({key:'Tab'},0,0,2,2)).toEqual({kind:'move',row:0,column:1});
    expect(sheetKeyAction({key:'Enter'},1,0,2,2)).toEqual({kind:'move',row:2,column:0});
  });
  it('undoes cell and structural edits and invalidates redo after a new edit', () => {
    let history=createHistory([['a']]);
    history=commitHistory(history,[['b']]); history=commitHistory(history,[['b','c']]);
    history=undoHistory(history); expect(history.present).toEqual([['b']]);
    history=redoHistory(history); expect(history.present).toEqual([['b','c']]);
    history=undoHistory(history); history=commitHistory(history,[['new']]);
    expect(history.future).toEqual([]);
  });
});
