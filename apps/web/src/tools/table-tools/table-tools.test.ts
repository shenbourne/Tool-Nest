import { describe, expect, it } from 'vitest';
import { processTable } from './table-tools.service';
describe('table operations', () => {
  it('preserves quoted multiline cells while changing separator', () => {
    expect(processTable('a,b\n"x,y","line1\nline2"', { operation:'separator', outputSeparator:';' }).result).toBe('a;b\nx,y;"line1\nline2"');
  });
  it('transposes uneven rows with padding', () => {
    expect(processTable('a,b\nc', {operation:'transpose'}).result).toBe('a,c\nb,');
  });
  it('inserts header and default values, including escaped separators', () => {
    expect(processTable('a,b\n1,2', {operation:'insert', position:1, header:'new', defaultValue:'x,y'}).result).toBe('a,new,b\n1,"x,y",2');
  });
  it('swaps one-based columns and leaves short records intact', () => {
    expect(processTable('a,b\n1,2\n3', {operation:'swap', columnA:1, columnB:2}).result).toBe('b,a\n2,1\n3');
  });
  it('checks both incomplete and excessive records', () => {
    expect(processTable('a,b\n1\n2,3,4', {operation:'check'}).issues).toEqual([{record:2,columns:1,expected:2},{record:3,columns:3,expected:2}]);
  });
  it('preserves quoted carriage returns and ignores a trailing CR record', () => {
    expect(processTable('a,b\n"x\ry",z', {operation:'separator',outputSeparator:';'}).result).toBe('a;b\n"x\ry";z');
    expect(processTable('a,b\r1,2\r', {operation:'check'}).issues).toEqual([]);
    expect(processTable('a,b\r1,2\r', {operation:'transpose'}).result).toBe('a,1\nb,2');
  });
  it('provides localizable quote errors', () => {
    expect(processTable('a\n"unterminated', {operation:'check'}).error).toBe('unclosedQuote');
  });
  it('supports TSV, rejects invalid quoting and invalid indices, handles empty input', () => {
    expect(processTable('a\tb\n1\t2', {operation:'swap',separator:'\t',columnA:1,columnB:2}).result).toBe('b\ta\n2\t1');
    expect(processTable('a\n"unterminated', {operation:'check'}).error).toBeTruthy();
    expect(processTable('a,b', {operation:'swap',columnA:0}).error).toBeTruthy();
    expect(processTable('', {operation:'transpose'}).result).toBe('');
  });
});
