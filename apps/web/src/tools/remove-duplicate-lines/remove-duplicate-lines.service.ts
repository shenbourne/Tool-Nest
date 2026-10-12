export function deduplicateLines(input: string, keepEmpty: boolean = true): string {
  const lines = input.split(/\r\n|\r|\n/);
  return [...new Set(keepEmpty ? lines : lines.filter(line => line !== ''))].join('\n');
}
