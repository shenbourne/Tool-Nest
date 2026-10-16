import { describe, it, expect } from 'vitest';
import { parseSheet, editSheetCell, pasteSheet, insertSheetColumn, insertSheetRow, createHistory, commitHistory, transposeSheet, moveSheetAxis } from './sheet-model';
import { processTable } from './table-tools.service';
const sparse = () => [Array(201).fill('x'), ...Array.from({ length: 100 }, () => ['x'])];
describe('rectangular table work budget', () => {
  it('rejects sparse input based on the rendered rectangle', () => {
    expect(() => parseSheet(sparse().map(row => row.join(',')).join('\n'))).toThrow('tableTooLarge');
  });
  it('rejects oversized imports, history and transpose before allocating padding', () => {
    const rows = sparse();
    expect(() => createHistory(rows)).toThrow('tableTooLarge');
    expect(() => commitHistory(createHistory([['keep']]), rows)).toThrow('tableTooLarge');
    expect(() => transposeSheet(rows)).toThrow('tableTooLarge');
    expect(() => moveSheetAxis(rows, 'column', 0, 1)).toThrow('tableTooLarge');
    expect(processTable(rows.map(row => row.join(',')).join('\n'), {operation:'transpose'}).error).toBe('tableTooLarge');
  });
  it('checks the combined dimensions of old state, offset paste and edit', () => {
    const rows = Array.from({ length: 100 }, () => ['keep']);
    expect(() => editSheetCell(rows, 0, 200, 'x')).toThrow('tableTooLarge');
    expect(() => pasteSheet(rows, 0, 200, 'x')).toThrow('tableTooLarge');
    expect(rows[0]).toEqual(['keep']);
  });
  it('rejects row or column insertions which cross the budget', () => {
    const rows = Array.from({ length: 100 }, () => Array(200).fill(''));
    expect(() => insertSheetRow(rows, 0)).toThrow('tableTooLarge');
    expect(() => insertSheetColumn(rows, 0)).toThrow('tableTooLarge');
  });
  it('keeps small ragged CSV, ordinary paste, transpose and history intact', () => {
    const rows = parseSheet('a,b\n1');
    const pasted = pasteSheet(rows,1,1,'2\t3');
    expect(pasted).toEqual([['a','b'], ['1','2','3']]);
    expect(transposeSheet(pasted)).toEqual([['a','1'],['b','2'],['','3']]);
    const h = commitHistory(createHistory(rows), pasted);
    expect(h.past).toEqual([rows]); expect(h.present).toEqual(pasted);
  });
});
