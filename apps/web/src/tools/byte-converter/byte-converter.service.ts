import { i18n } from '@/i18n';

export const byteUnits = [
  { id: 'Bytes', factor: 1 },
  { id: 'KB', factor: 1024 },
  { id: 'MB', factor: 1024 ** 2 },
  { id: 'GB', factor: 1024 ** 3 },
  { id: 'TB', factor: 1024 ** 4 },
  { id: 'PB', factor: 1024 ** 5 },
  { id: 'Bits', factor: 1 / 8 },
] as const;

export type ByteUnit = typeof byteUnits[number]['id'];

export function convertByteUnit(value: number | null, from: ByteUnit, to: ByteUnit): number | null {
  if (value === null) return null;
  const source = byteUnits.find(unit => unit.id === from)!;
  const target = byteUnits.find(unit => unit.id === to)!;
  return value * (source.factor / target.factor);
}

/**
 * Converts an integer string between bases. Returns null when the input is
 * empty and a localized error key when it contains digits the source base does
 * not allow — `parseInt` alone silently truncates on the first invalid digit
 * (e.g. `1A3` in base 10 becomes `1`).
 */
export function convertBase(value: string, fromBase: number, toBase: number): string {
  const v = value.trim();
  if (!v) return '';

  const valid = [...v.toUpperCase()].every((c) => {
    const digit = parseInt(c, 36);
    return !Number.isNaN(digit) && digit < fromBase;
  });
  if (!valid) return i18n.global.t('tools.byteConverter.invalidInput');

  try {
    return parseInt(v, fromBase).toString(toBase).toUpperCase();
  } catch {
    return i18n.global.t('common.error');
  }
}
