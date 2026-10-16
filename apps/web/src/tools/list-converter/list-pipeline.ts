import { resolveOutputSeparator, splitListInput } from '@/utils/list-input';
import { cleanListItems, sortListItems, DEFAULT_LIST_OPTIONS, type ListOptions } from './list-converter.service';

export interface PipelineOptions extends ListOptions {
  conversionEnabled: boolean;
  unwrap: boolean;
  reorderEnabled: boolean;
  reverse: boolean;
  rotate: boolean;
  positions: number;
  shuffle: boolean;
  sliceEnabled: boolean;
  start: number;
  end: number;
  groupEnabled: boolean;
  groupSize: number;
  groupSeparator: string;
}
export const DEFAULT_PIPELINE_OPTIONS: Readonly<PipelineOptions> = {
  ...DEFAULT_LIST_OPTIONS, conversionEnabled: true, trimItems: false, removeEmpty: false, unwrap: false,
  reorderEnabled: true, reverse: false, rotate: false, positions: 0, shuffle: false,
  sliceEnabled: true, start: 1, end: Number.MAX_SAFE_INTEGER, groupEnabled: true, groupSize: 0, groupSeparator: '\n\n',
};
const integer = (value: number, fallback: number) => Number.isFinite(value) ? Math.trunc(value) : fallback;

export function reorderListItems(values: string[], operation: 'reverse' | 'rotate' | 'shuffle', positions = 0, random = Math.random): string[] {
  const items = [...values];
  if (operation === 'reverse') return items.reverse();
  if (operation === 'rotate' && items.length) {
    const offset = ((integer(positions, 0) % items.length) + items.length) % items.length;
    return [...items.slice(offset), ...items.slice(0, offset)];
  }
  if (operation === 'shuffle') {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }
  return items;
}

/** Logical items stay separate from presentation, so statistics never count group headings or wrappers. */
export function runListPipeline(input: string, options: PipelineOptions, random = Math.random, reorderedItems?: string[]) {
  const sourceItems = splitListInput(input, options.inputSeparator);
  let items = [...sourceItems];
  if (options.conversionEnabled) {
    items = cleanListItems(items, options);
  }
  if (reorderedItems !== undefined) {
    items = [...reorderedItems];
  } else if (options.reorderEnabled) {
    items = sortListItems(items, options.sortItems);
    if (options.reverse) items = reorderListItems(items, 'reverse');
    if (options.rotate) items = reorderListItems(items, 'rotate', options.positions);
    if (options.shuffle) items = reorderListItems(items, 'shuffle', 0, random);
  }
  const beforeSlice = [...items];
  if (options.sliceEnabled && items.length) {
    const start = Math.max(1, Math.min(items.length, integer(options.start, 1)));
    const end = Math.max(start, Math.min(items.length, integer(options.end, items.length)));
    items = items.slice(start - 1, end);
  }
  const grouping = options.groupEnabled && options.groupSize > 0;
  const step = grouping ? Math.max(1, integer(options.groupSize, 3)) : Math.max(items.length, 1);
  const groups: string[][] = [];
  for (let i = 0; i < items.length; i += step) groups.push(items.slice(i, i + step));
  const separator = resolveOutputSeparator(input, options.inputSeparator, options.separator);
  const formatted = groups.map(group => group.map(item => options.conversionEnabled
    ? options.itemPrefix + item + options.itemSuffix : item).join(separator))
    .join(grouping ? options.groupSeparator : separator);
  const unchanged = options.inputSeparator !== '' && options.separator === null && !grouping
    && (!options.conversionEnabled || (!options.itemPrefix && !options.itemSuffix))
    && items.length === sourceItems.length && items.every((item, index) => item === sourceItems[index]);
  const output = unchanged ? input : formatted;
  return { sourceItems, beforeSlice, items, groups, output };
}

export function listFrequencies(items: string[]) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts].map(([item, count]) => ({ item, count })).sort((a, b) => b.count - a.count);
}

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function legacyListQuery(path: string): Record<string, string> | undefined {
  const operations: Record<string, string> = {
    '/list-sort': 'sort', '/list-reverse': 'reverse', '/list-rotate': 'rotate', '/list-shuffle': 'shuffle',
  };
  if (operations[path]) return { tab: 'reorder', operation: operations[path] };
  if (path === '/list-truncate') return { tab: 'slice', operation: 'slice' };
  if (path === '/list-group') return { tab: 'group', operation: 'group' };
  if (path === '/list-unwrap') return { tab: 'convert', operation: 'unwrap' };
  if (path === '/list-find-popular') return { tab: 'statistics' };
  if (path === '/list-wrap' || path === '/text-join') return { tab: 'convert' };
}
