export function replaceText(input: string, find: string, replacement: string, regex: boolean): string {
  if (!find) return input;
  return regex ? input.replace(new RegExp(find, 'g'), replacement) : input.split(find).join(replacement);
}
export function reorderText(input: string, operation: 'reverse' | 'rotate', positions = 0): string {
  const chars = Array.from(input);
  if (operation === 'reverse') return chars.reverse().join('');
  if (!chars.length) return '';
  const n = ((Math.trunc(positions) % chars.length) + chars.length) % chars.length;
  return [...chars.slice(n), ...chars.slice(0, n)].join('');
}
export function textUnits(input: string, mode: string): string[] {
  if (!input) return [];
  return mode === 'words' ? (input.trim() ? input.trim().split(/\s+/) : []) : mode === 'lines' ? input.split('\n') : Array.from(input);
}
export function sliceText(input: string, mode: string, start: number, end: number): string {
  const units = textUnits(input, mode);
  // The neutral full range preserves original whitespace in word mode too.
  if (start === 1 && end >= units.length) return input;
  return units.slice(start - 1, end).join(mode === 'words' ? ' ' : mode === 'lines' ? '\n' : '');
}
export function textStatistics(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    characters: Array.from(text).length,
    charactersNoSpaces: Array.from(text.replace(/\s/g, '')).length,
    words, lines: text ? text.split('\n').length : 0,
    sentences: text.trim() ? (text.match(/[.!?。！？]+/g)?.length || 1) : 0,
    paragraphs: text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0,
    readingTime: Math.ceil(words / 200),
  };
}
export const legacyTextTabs: Record<string, string> = {
  '/text-replacer': 'replace', '/text-reverse': 'reorder', '/text-rotate': 'reorder',
  '/text-truncate': 'slice', '/text-statistics': 'statistics',
  '/remove-duplicate-lines': 'deduplicate', '/list-find-unique': 'deduplicate',
};
