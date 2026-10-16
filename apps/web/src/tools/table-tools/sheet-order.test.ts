import { describe, expect, it } from 'vitest';
import { insertSheetRow, moveSheetAxis, createHistory, commitHistory, undoHistory } from './sheet-model';
describe('sheet ordering', () => {
  it('moves complete rows without mutating input and supports undo', () => {
    const rows=[['h','v'],['a','1'],['b','2']];
    const next=moveSheetAxis(rows,'row',2,0);
    expect(next).toEqual([['b','2'],['h','v'],['a','1']]);
    expect(rows[0]).toEqual(['h','v']);
    expect(undoHistory(commitHistory(createHistory(rows),next)).present).toEqual(rows);
  });
  it('moves all column values together including missing cells', () => {
    expect(moveSheetAxis([['a','b','c'],['1']], 'column',0,2)).toEqual([['b','c','a'],['','','1']]);
    expect(moveSheetAxis([['a','b','c']], 'column',2,0)).toEqual([['c','a','b']]);
    expect(() => moveSheetAxis([['a']], 'column',0,2)).toThrow('invalidIndex');
  });
  it('inserts an empty row of the current width', () => {
    expect(insertSheetRow([['a','b'],['1']],1)).toEqual([['a','b'],['',''],['1']]);
  });
});
