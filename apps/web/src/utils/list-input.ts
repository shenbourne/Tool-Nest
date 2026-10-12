export function detectListSeparator(input: string): string | undefined {
  if (input.includes('\r\n')) return '\r\n';
  if (input.includes('\n')) return '\n';
  if (input.includes('\r')) return '\r';
  return [',', ';', '\t', '|', ' '].find(separator => input.includes(separator));
}

export function splitListInput(input: string, separator?: string): string[] {
  if (!input || separator === '') return [];
  const delimiter = separator ?? detectListSeparator(input);
  if (delimiter === '\n' || delimiter === '\r' || delimiter === '\r\n') return input.split(/\r\n|\r|\n/);
  return delimiter ? input.split(delimiter) : [input];
}

export function resolveOutputSeparator(input: string, inputSeparator: string | undefined, outputSeparator: string | null): string {
  return outputSeparator ?? inputSeparator ?? detectListSeparator(input) ?? '\n';
}
