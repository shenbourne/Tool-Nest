import { replaceText, reorderText, sliceText, textUnits } from './text-operations';
import { deduplicateLines } from '../remove-duplicate-lines/remove-duplicate-lines.service';

export interface TextProcessingOptions {
  find: string; replacement: string; regex: boolean; deduplicate: boolean; keepEmpty: boolean;
  positions: number; mode: 'chars' | 'words' | 'lines'; start: number; end: number;
}
export interface TextProcessingSnapshot {
  input: string; options: TextProcessingOptions; beforeSlice: string; output: string;
  max: number; error: 'invalidRegex' | null;
}
const upstream: (keyof TextProcessingOptions)[] = ['find', 'replacement', 'regex', 'deduplicate', 'keepEmpty'];

/** Owns confirmed character operations and their invalidation, before inclusive slicing. */
export function createTextProcessingState(initialInput = '') {
  let input = initialInput;
  const options: TextProcessingOptions = {
    find: '', replacement: '', regex: false, deduplicate: false, keepEmpty: true,
    positions: 1, mode: 'chars', start: 1, end: Number.MAX_SAFE_INTEGER,
  };
  let confirmed: string | undefined;
  let beforeSlice = '';
  let max = 1;
  let error: TextProcessingSnapshot['error'] = null;
  const bound = (value: number) => Math.max(1, Math.min(max, Number.isFinite(value) ? Math.trunc(value) : max));

  function refresh(resetRange = false) {
    const previousMax = max;
    error = null;
    try {
      const replaced = replaceText(input, options.find, options.replacement, options.regex);
      const cleaned = options.deduplicate ? deduplicateLines(replaced, options.keepEmpty) : replaced;
      beforeSlice = confirmed ?? cleaned;
    } catch {
      error = 'invalidRegex'; beforeSlice = ''; confirmed = undefined;
    }
    max = Math.max(1, textUnits(beforeSlice, options.mode).length);
    if (resetRange) { options.start = 1; options.end = max; }
    else {
      options.start = bound(options.start);
      options.end = options.end === previousMax || options.end === Number.MAX_SAFE_INTEGER ? max : bound(options.end);
    }
  }
  function read(): TextProcessingSnapshot {
    return { input, options: { ...options }, beforeSlice, max, error,
      output: error ? '' : sliceText(beforeSlice, options.mode, options.start, options.end) };
  }
  function setInput(value: string) {
    if (value !== input) { input = value; confirmed = undefined; refresh(); }
    return read();
  }
  function updateOptions(patch: Partial<TextProcessingOptions>) {
    if (upstream.some(key => key in patch && patch[key] !== options[key])) confirmed = undefined;
    const resetRange = patch.mode !== undefined && patch.mode !== options.mode;
    const { start, end, ...other } = patch;
    Object.assign(options, other);
    refresh(resetRange);
    // Endpoint updates are atomic in the documented start-then-end order.
    if (start !== undefined) { options.start = bound(start); options.end = Math.max(options.end, options.start); }
    if (end !== undefined) { options.end = bound(end); options.start = Math.min(options.start, options.end); }
    return read();
  }
  function confirm(operation: 'reverse' | 'rotate') {
    if (!error && beforeSlice) {
      confirmed = reorderText(beforeSlice, operation, options.positions);
      refresh();
    }
    return read();
  }
  refresh();
  return { read, setInput, updateOptions, confirm };
}
