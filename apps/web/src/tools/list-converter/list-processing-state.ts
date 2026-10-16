import { DEFAULT_PIPELINE_OPTIONS, reorderListItems, runListPipeline, type PipelineOptions } from './list-pipeline';

export interface ListProcessingSnapshot {
  input: string; options: PipelineOptions; max: number; result: ReturnType<typeof runListPipeline>;
}
const upstream: (keyof PipelineOptions)[] = [
  'inputSeparator', 'conversionEnabled', 'trimItems', 'removeEmpty', 'lowerCase',
  'removeDuplicates', 'unwrap', 'reorderEnabled', 'sortItems',
];

/** Keeps confirmed item order independent of output formatting and random reads. */
export function createListProcessingState(initialInput = '', random: () => number = Math.random) {
  let input = initialInput;
  const options = { ...DEFAULT_PIPELINE_OPTIONS };
  let confirmed: string[] | undefined;
  let max = 1;
  let result: ReturnType<typeof runListPipeline>;
  const bound = (value: number) => Math.max(1, Math.min(max, Number.isFinite(value) ? Math.trunc(value) : max));
  function evaluate() {
    // These legacy flags belong to the stateless pipeline. This module executes
    // the corresponding operations exclusively through confirm().
    return runListPipeline(input, { ...options, reverse: false, rotate: false, shuffle: false }, random, confirmed);
  }
  function refresh() {
    const previousMax = max;
    result = evaluate();
    max = Math.max(result.beforeSlice.length, 1);
    options.start = bound(options.start);
    options.end = options.end === previousMax || options.end === Number.MAX_SAFE_INTEGER ? max : bound(options.end);
    result = evaluate();
  }
  function read(): ListProcessingSnapshot {
    return { input, options: { ...options }, max, result: {
      ...result, sourceItems: [...result.sourceItems], beforeSlice: [...result.beforeSlice],
      items: [...result.items], groups: result.groups.map(group => [...group]),
    } };
  }
  function setInput(value: string) {
    if (value !== input) { input = value; confirmed = undefined; refresh(); }
    return read();
  }
  function updateOptions(patch: Partial<PipelineOptions>) {
    if (upstream.some(key => key in patch && patch[key] !== options[key])) confirmed = undefined;
    const { start, end, ...other } = patch;
    Object.assign(options, other);
    refresh();
    if (start !== undefined) { options.start = bound(start); options.end = Math.max(options.end, options.start); }
    if (end !== undefined) { options.end = bound(end); options.start = Math.min(options.start, options.end); }
    result = evaluate();
    return read();
  }
  function confirm(operation: 'reverse' | 'rotate' | 'shuffle') {
    if (result.beforeSlice.length) {
      confirmed = reorderListItems(result.beforeSlice, operation, options.positions, random);
      refresh();
    }
    return read();
  }
  refresh();
  return { read, setInput, updateOptions, confirm };
}
