export interface ListOptions {
  separator: string;
  trimItems: boolean;
  removeEmpty: boolean;
  lowerCase: boolean;
  sortItems: 'none' | 'asc' | 'desc';
  removeDuplicates: boolean;
  itemPrefix: string;
  itemSuffix: string;
}

export function convertList(input: string, options: ListOptions): string {
  if (!input) return '';

  const sep = options.separator;

  // Split by separator
  let items = input.split(sep);

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
    items.sort((a, b) => a.localeCompare(b));
  } else if (options.sortItems === 'desc') {
    items.sort((a, b) => b.localeCompare(a));
  }

  // Add prefix/suffix
  items = items.map(item => options.itemPrefix + item + options.itemSuffix);

  // Join with separator
  return items.join(sep);
}
