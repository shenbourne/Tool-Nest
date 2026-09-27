import { i18n } from '@/i18n';

/**
 * Safe recursive-descent calculator — no eval/Function. Returns the numeric
 * value or throws with a localized message.
 */
export function evaluateExpression(source: string): number {
  let pos = 0;
  const str = source.replace(/\s+/g, '');

  function parseExpr(): number {
    let v = parseTerm();
    while (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
      const op = str[pos++]; const r = parseTerm(); v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  function parseTerm(): number {
    let v = parsePower();
    while (pos < str.length && (str[pos] === '*' || str[pos] === '/' || str[pos] === '%')) {
      const op = str[pos++]; const r = parsePower();
      v = op === '*' ? v * r : op === '/' ? v / r : v % r;
    }
    return v;
  }
  function parsePower(): number {
    let v = parseUnary();
    if (pos < str.length && str[pos] === '^') { pos++; v = Math.pow(v, parsePower()); }
    return v;
  }
  function parseUnary(): number {
    if (str[pos] === '-') { pos++; return -parseUnary(); }
    if (str[pos] === '+') { pos++; return parseUnary(); }
    return parsePrimary();
  }
  function parsePrimary(): number {
    if (str[pos] === '(') { pos++; const v = parseExpr(); if (str[pos] === ')') pos++; return v; }
    let num = '';
    while (pos < str.length && (str[pos] >= '0' && str[pos] <= '9' || str[pos] === '.')) num += str[pos++];
    if (!num) throw new Error(i18n.global.t('tools.genericCalculator.unexpected', { char: str[pos] || i18n.global.t('tools.genericCalculator.endOfInput') }));
    // Reject malformed numbers like 1.2.3 instead of silently truncating.
    if (!/^\d+(\.\d+)?$/.test(num) && !/^\.\d+$/.test(num)) {
      throw new Error(i18n.global.t('tools.genericCalculator.unexpected', { char: str[pos] || i18n.global.t('tools.genericCalculator.endOfInput') }));
    }
    return parseFloat(num);
  }

  const r = parseExpr();
  if (pos < str.length) throw new Error(i18n.global.t('tools.genericCalculator.unexpected', { char: str[pos] }));
  return r;
}
