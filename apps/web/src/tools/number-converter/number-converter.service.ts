import { arabicToRoman, romanToArabic } from '../roman-numeral-converter/roman-numeral-converter.service';

export const numberKinds = ['decimal', 'english', 'roman', 'binary', 'octal', 'hex'] as const;
export type NumberKind = typeof numberKinds[number];
const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const scales: [number, string][] = [[1e15, 'quadrillion'], [1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1000, 'thousand']];
function toWords(n: number): string {
  if (n < 0) return `negative ${toWords(-n)}`;
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? `-${ones[n % 10]}` : '');
  if (n < 1000) return `${ones[Math.floor(n / 100)]} hundred` + (n % 100 ? ` and ${toWords(n % 100)}` : '');
  for (const [scale, label] of scales) {
    if (n >= scale) return `${toWords(Math.floor(n / scale))} ${label}` + (n % scale ? ` ${toWords(n % scale)}` : '');
  }
  return '';
}
function normalizeWords(text: string) {
  return text.toLowerCase().replace(/-/g, ' ').split(/\s+/).filter(word => word && word !== 'and').join(' ');
}
function fromWords(text: string): number | null {
  const normalized = normalizeWords(text);
  const tokens = normalized.split(' ');
  const negative = tokens[0] === 'negative' || tokens[0] === 'minus';
  if (negative) tokens.shift();
  let total = 0n;
  let group = 0n;
  for (const token of tokens) {
    const small = ones.indexOf(token);
    const ten = tens.indexOf(token);
    const scale = scales.find(([, label]) => label === token);
    if (small >= 0) group += BigInt(small);
    else if (ten >= 2) group += BigInt(ten * 10);
    else if (token === 'hundred') group *= 100n;
    else if (scale) { total += group * BigInt(scale[0]); group = 0n; }
    else return null;
  }
  const value = Number((total + group) * (negative ? -1n : 1n));
  if (!Number.isSafeInteger(value)) return null;
  const canonical = normalizeWords(toWords(value));
  return canonical === normalized.replace(/^minus /, 'negative ') ? value : null;
}
export function parseNumber(kind: NumberKind, text: string): number | null {
  const input = text.trim();
  if (!input) return null;
  if (kind === 'english') return fromWords(input);
  if (kind === 'roman') return romanToArabic(input.toUpperCase());
  if (kind === 'decimal') return /^[+-]?\d+$/.test(input) && Number.isSafeInteger(Number(input)) ? Number(input) : null;
  const radix = { binary: 2, octal: 8, hex: 16 }[kind];
  const digits = input.replace(/^[+-]/, '').replace(kind === 'binary' ? /^0b/i : kind === 'octal' ? /^0o/i : /^0x/i, '');
  const pattern = { binary: /^[01]+$/, octal: /^[0-7]+$/, hex: /^[\da-f]+$/i }[kind];
  if (!pattern.test(digits)) return null;
  let value = 0n;
  for (const digit of digits) {
    value = value * BigInt(radix) + BigInt(parseInt(digit, radix));
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) return null;
  }
  return Number(value) * (input.startsWith('-') ? -1 : 1);
}
export function formatNumber(kind: NumberKind, value: number): string {
  if (!Number.isSafeInteger(value)) return '';
  if (kind === 'english') return toWords(value);
  if (kind === 'roman') return arabicToRoman(value);
  return value.toString({ decimal: 10, binary: 2, octal: 8, hex: 16 }[kind]).toUpperCase();
}
export function convertNumber(kind: NumberKind, text: string): Record<NumberKind, string> {
  const value = parseNumber(kind, text);
  return Object.fromEntries(numberKinds.map(target => [target, value === null ? '' : formatNumber(target, value)])) as Record<NumberKind, string>;
}
