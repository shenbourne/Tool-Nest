export const MIN_ARABIC_TO_ROMAN = 1;
export const MAX_ARABIC_TO_ROMAN = 3999;

const LOOKUP: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

const ROMAN_NUMBER_REGEX = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

export function arabicToRoman(num: number): string {
  if (num < MIN_ARABIC_TO_ROMAN || num > MAX_ARABIC_TO_ROMAN) return '';
  let roman = '';
  for (const [value, symbol] of LOOKUP) {
    while (num >= value) { roman += symbol; num -= value; }
  }
  return roman;
}

export function isValidRomanNumber(s: string): boolean {
  // The pattern alone matches the empty string, which would decode to 0.
  return s.length > 0 && ROMAN_NUMBER_REGEX.test(s);
}

export function romanToArabic(s: string): number | null {
  if (!isValidRomanNumber(s)) return null;
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  return [...s].reduce((r, c, i, arr) => (map[arr[i + 1]] > map[c] ? r - map[c] : r + map[c]), 0);
}
