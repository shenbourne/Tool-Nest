import { describe,it,expect } from 'vitest';
import { processJson,legacyJsonOperations,resolveJsonEditorOperation,resolveJsonOperation } from './json-tools.service';
import { allTools } from '../registry';
import { canonicalToolPath,normalizeToolPreferences } from '@/utils/tool-paths';
describe('unified JSON tools',()=>{
  it('formats and minifies primitives and nested data',()=>{
    expect(processJson('{"a":1}','format').output).toBe('{\n  "a": 1\n}');
    expect(processJson(' { "a": [1, true] } ','minify').output).toBe('{"a":[1,true]}');
    expect(processJson('null','format').output).toBe('null');
  });
  it('sorts nested keys without dropping __proto__ values or rearranging arrays',()=>{
    const output=JSON.parse(processJson('{"z":0,"__proto__":{"b":2,"a":1},"a":[2,1]}','sort').output);
    expect(Object.hasOwn(output,'__proto__')).toBe(true);
    expect(output.__proto__).toEqual({a:1,b:2});
    expect(output.a).toEqual([2,1]);
  });
  it('round-trips raw text through escaping',()=>{
    const text='line\n"quotes"\\path';
    expect(processJson(processJson(text,'escape').output,'unescape').output).toBe(text);
    expect(processJson('arbitrary text','escape').error).toBe('');
    expect(processJson('  ','escape').output).toBe('"  "');
  });
  it('validates without rewriting and rejects invalid JSON',()=>{
    expect(processJson(' {"a":1} ','validate')).toEqual({output:' {"a":1} ',error:'',valid:true});
    expect(processJson('{','format').valid).toBe(false);
    expect(processJson('','validate').valid).toBeNull();
    expect(resolveJsonOperation('bad')).toBe('format');
    expect(resolveJsonEditorOperation('validate')).toBe('format');
    expect(resolveJsonEditorOperation('sort')).toBe('sort');
    expect(resolveJsonEditorOperation('bad')).toBe('format');
  });
  it('merges legacy discovery/preferences and keeps json-diff independent',()=>{
    for(const path of Object.keys(legacyJsonOperations)) {
      expect(canonicalToolPath(path,allTools)).toBe('/json-prettify');
      expect(allTools.some(tool=>tool.path===path)).toBe(false);
    }
    expect(allTools.some(tool=>tool.path==='/json-diff')).toBe(true);
    expect(normalizeToolPreferences({favorites:['/json-minify','/json-sort','/json-diff'],recentTools:[]},allTools).favorites).toEqual(['/json-prettify','/json-diff']);
  });
});
