import { i18n } from '@/i18n';

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
  if (!valid) return i18n.global.t('tools.baseConverter.invalidInput');

  try {
    return parseInt(v, fromBase).toString(toBase).toUpperCase();
  } catch {
    return i18n.global.t('common.error');
  }
}
