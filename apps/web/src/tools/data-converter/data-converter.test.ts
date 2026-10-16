import { describe, expect, it } from 'vitest';
import { convertData, legacyConversionQuery } from './data-converter.service';
describe('conversion contracts', () => {
  it('retains directions', () => expect(legacyConversionQuery('/yaml-to-toml')).toEqual({from:'yaml',to:'toml'}));
  it('round trips quoted CSV', () => {
    const text = 'name,note\nA,"hello,\nworld"';
    const json = convertData(text,'csv','json');
    expect(JSON.parse(json.result)).toEqual([{name:'A',note:'hello,\nworld'}]);
    expect(convertData(json.result,'json','csv').result).toBe(text);
  });
  it('prevents table data loss', () => {
    for (const text of ['a,a\n1,2','a\n1,2']) expect(convertData(text,'csv','json').error).toBeTruthy();
    expect(convertData('[{"a":{"b":1}}]','json','csv').error).toBeTruthy();
    expect(convertData('[{"a":1},{"b":2}]','json','csv').result).toBe('a,b\n1,\n,2');
  });
  it('converts YAML/TOML', () => {
    expect(convertData('name: test','yaml','toml').result).toContain('name = "test"');
    expect(JSON.parse(convertData('name = "test"','toml','json').result)).toEqual({name:'test'});
  });
  it('exports table XML with escaped values and rejects invalid node names', () => {
    expect(convertData('name,note\nA,hello & bye','csv','xml').result).toContain('<note>hello &amp; bye</note>');
    expect(convertData('1bad\nx','csv','xml').error).toBeTruthy();
    expect(convertData('{"a":1,"b":2}','json','xml').error).toBeTruthy();
  });
  it('round trips XML', () => {
    const json = convertData('<root><name>A &amp; B</name></root>','xml','json');
    expect(convertData(json.result,'json','xml').result).toContain('A &amp; B');
  });
  it('handles TSV/errors/empty', () => {
    expect(JSON.parse(convertData('a\tb\n1\t2','tsv','json').result)).toEqual([{a:'1',b:'2'}]);
    expect(convertData('{','json','yaml').error).toBeTruthy();
    expect(convertData('','json','yaml')).toEqual({result:'',error:null});
  });
});


