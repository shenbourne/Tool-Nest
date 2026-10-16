export const jsonOperations = ['format','minify','sort','escape','unescape','validate'] as const;
export type JsonOperation = typeof jsonOperations[number];
export type JsonEditorOperation = Exclude<JsonOperation,'validate'>;
export function resolveJsonEditorOperation(value: unknown): JsonEditorOperation {
  const operation = resolveJsonOperation(value);
  return operation === 'validate' ? 'format' : operation;
}
export const legacyJsonOperations: Record<string,JsonOperation> = {
  '/json-escape':'escape','/json-minify':'minify','/json-sort':'sort','/json-validate':'validate','/json-stringify':'format','/json-viewer':'format',
};
export function resolveJsonOperation(value: unknown): JsonOperation {
  return typeof value==='string' && jsonOperations.includes(value as JsonOperation) ? value as JsonOperation : 'format';
}
function sorted(value: unknown): unknown {
  if(Array.isArray(value)) return value.map(sorted);
  if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'})).map(([key,item])=>[key,sorted(item)]));
  return value;
}
export function processJson(input: string,operation: JsonOperation,indent: number|'tab'=2): {output:string;error:string;valid:boolean|null} {
  if(!input || (operation!=='escape' && !input.trim())) return {output:'',error:'',valid:null};
  try {
    if(operation==='escape') return {output:JSON.stringify(input),error:'',valid:null};
    const value:unknown=JSON.parse(input);
    const spacing=indent==='tab' ? '\t' : indent;
    const output=operation==='validate' ? input : operation==='unescape' ? (typeof value==='string' ? value : JSON.stringify(value)) : JSON.stringify(operation==='sort' ? sorted(value) : value,null,operation==='minify' ? undefined : spacing);
    return {output,error:'',valid:true};
  } catch(error) { return {output:'',error:error instanceof Error ? error.message : String(error),valid:false}; }
}
