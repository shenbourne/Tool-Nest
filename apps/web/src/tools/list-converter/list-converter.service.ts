import { resolveOutputSeparator, splitListInput } from '@/utils/list-input';

export interface ListOptions {
  inputSeparator?: string;
  separator: string | null;
  trimItems: boolean;
  removeEmpty: boolean;
  lowerCase: boolean;
  sortItems: 'none' | 'asc' | 'desc';
  removeDuplicates: boolean;
  itemPrefix: string;
  itemSuffix: string;
}

export const DEFAULT_LIST_OPTIONS: Readonly<ListOptions> = {
  inputSeparator: undefined, separator: null, trimItems: true, removeEmpty: true,
  lowerCase: false, removeDuplicates: false, sortItems: 'none', itemPrefix: '', itemSuffix: '',
};

export function cleanListItems(values: string[], options: Pick<ListOptions, 'trimItems' | 'lowerCase' | 'removeEmpty' | 'removeDuplicates'> & { unwrap?: boolean }): string[] {
  let items = [...values];
  if (options.trimItems) items = items.map(item => item.trim());
  if (options.unwrap) items = items.map(item => item.replace(/^["'([{<]+|["')\]>}]+$/g, ''));
  if (options.lowerCase) items = items.map(item => item.toLowerCase());
  if (options.removeEmpty) items = items.filter(item => item.length > 0);
  if (options.removeDuplicates) items = [...new Set(items)];
  return items;
}

export function sortListItems(items: string[], order: ListOptions['sortItems']): string[] {
  if (order === 'none') return [...items];
  const direction = order === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => direction * a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
}

export function convertList(input: string, options: ListOptions): string {
  if (!input) return '';
  if (options.inputSeparator === '') throw new Error('inputSeparatorRequired');

  const sep = resolveOutputSeparator(input, options.inputSeparator, options.separator);
  let items = sortListItems(cleanListItems(splitListInput(input, options.inputSeparator), options), options.sortItems);

  // Add prefix/suffix
  items = items.map(item => options.itemPrefix + item + options.itemSuffix);

  // Join with separator
  return items.join(sep);
}
