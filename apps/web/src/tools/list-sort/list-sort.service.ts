/**
 * Sorts newline-separated lines.
 *
 * Blank lines are kept (they carry meaning for line-aligned data) and the
 * comparison is natural (`item9` before `item10`) and case-insensitive.
 */
export function sortLines(input: string): string {
  return input
    .split('\n')
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .join('\n');
}
