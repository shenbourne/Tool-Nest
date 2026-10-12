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

export function convertList(input: string, options: ListOptions): string {
  if (!input) return '';
  if (options.inputSeparator === '') throw new Error('inputSeparatorRequired');

  const sep = resolveOutputSeparator(input, options.inputSeparator, options.separator);
  let items = splitListInput(input, options.inputSeparator);

  // Pipeline: trim
  if (options.trimItems) {
    items = items.map(item => item.trim());
  }

  // Lowercase
  if (options.lowerCase) {
    items = items.map(item => item.toLowerCase());
  }

  // Remove empty
  if (options.removeEmpty) {
    items = items.filter(item => item.length > 0);
  }

  // Remove duplicates
  if (options.removeDuplicates) {
    items = Array.from(new Set(items));
  }

  // Sort
  if (options.sortItems === 'asc') {
    items.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (options.sortItems === 'desc') {
    items.sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
  }

  // Add prefix/suffix
  items = items.map(item => options.itemPrefix + item + options.itemSuffix);

  // Join with separator
  return items.join(sep);
}
